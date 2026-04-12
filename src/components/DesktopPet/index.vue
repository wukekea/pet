<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";

// Electron API 类型声明
declare global {
  interface Window {
    electronAPI?: {
      setIgnoreMouseEvents: (ignore: boolean) => void;
      getScreenSize: () => Promise<{ width: number; height: number }>;
    };
  }
}

// 宠物状态类型
type PetState =
  | "idle"
  | "walking"
  | "jumping"
  | "sleeping"
  | "happy"
  | "crying"
  | "angry"
  | "fallen"
  | "scared"
  | "thinking"
  | "smug"
  | "shy"
  | "confused"
  | "hello"
  | "sneeze"
  | "yawn"
  | "scratch"
  | "celebrate"
  | "peek"
  | "chase"
  | "hide";
type PetDirection = "left" | "right";

interface PetPosition {
  x: number;
  y: number;
}

// 脚印数据接口
interface Footprint {
  id: number;
  x: number;
  y: number;
  isLeft: boolean;
  direction: PetDirection;
  createdAt: number;
}

// 屏幕尺寸
const screenSize = ref({ width: window.innerWidth, height: window.innerHeight });

// 当前穿透状态
let isPassthrough = true;

// 宠物状态
const isVisible = ref(true);
const petState = ref<PetState>("idle");
const petDirection = ref<PetDirection>("right");
const position = ref<PetPosition>({ x: 50, y: screenSize.value.height - 120 });
const targetPosition = ref<PetPosition>({ x: 50, y: screenSize.value.height - 120 });
const isDragging = ref(false);
const dragOffset = ref<PetPosition>({ x: 0, y: 0 });
const animationFrameId = ref<number | null>(null);
const stateTimer = ref<number | null>(null);

// 脚印状态
const footprints = ref<Footprint[]>([]);
const lastFootprintTime = ref(0);
const lastFootprintWasLeft = ref(false);
const footprintIdCounter = ref(0);

// 鼠标位置（用于追逐）
const mousePosition = ref<PetPosition>({ x: 0, y: 0 });

// 宠物配置
const PET_SIZE = 80;
const JUMP_DURATION = 800;
const WALK_SPEED = 2; // 固定移动速度（像素/帧）
const IDLE_DURATION = 4000;
const SLEEP_DURATION = 8000;
const HAPPY_DURATION = 1500;
const FOOTPRINT_INTERVAL = 150; // 脚印生成间隔（毫秒）
const FOOTPRINT_LIFETIME = 4000; // 脚印存活时间（毫秒）
const MAX_FOOTPRINTS = 20; // 最大脚印数量

// 新状态持续时间
const CRYING_DURATION = 3000;
const ANGRY_DURATION = 2500;
const FALLEN_DURATION = 2000;
const SCARED_DURATION = 1500;
const THINKING_DURATION = 4000;
const SMUG_DURATION = 2500;
const SHY_DURATION = 2000;
const CONFUSED_DURATION = 2000;
const HELLO_DURATION = 1500;
const SNEEZE_DURATION = 1000;
const YAWN_DURATION = 2000;
const SCRATCH_DURATION = 2000;
const CELEBRATE_DURATION = 3000;
const PEEK_DURATION = 3000;
const CHASE_DURATION = 5000;
const HIDE_DURATION = 4000;

// 当前主题（使用系统主题）
const isDark = ref(false);

// 检测系统主题
function checkSystemTheme() {
  isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// 设置穿透状态
function setPassthrough(ignore: boolean) {
  console.log('setPassthrough called:', ignore, 'current:', isPassthrough, 'electronAPI:', !!window.electronAPI);
  if (ignore !== isPassthrough) {
    if (window.electronAPI) {
      window.electronAPI.setIgnoreMouseEvents(ignore);
      isPassthrough = ignore;
      console.log('Passthrough changed to:', ignore);
    } else {
      console.log('electronAPI not available!');
    }
  }
}

// 检测鼠标是否在宠物上
function isMouseOnPet(x: number, y: number): boolean {
  const petX = position.value.x;
  const petY = position.value.y;
  const petCenterX = petX + PET_SIZE / 2;
  const petCenterY = petY + PET_SIZE / 2;
  const distance = Math.sqrt((x - petCenterX) ** 2 + (y - petCenterY) ** 2);
  return distance < PET_SIZE / 2 + 15;
}

// 宠物颜色 - 根据主题变化
const petColors = computed(() => {
  const isAngry = petState.value === "angry";
  return {
    body: isAngry ? "#ef4444" : isDark.value ? "#a78bfa" : "#8b5cf6",
    bodyGradient: isAngry ? "#f87171" : isDark.value ? "#c4b5fd" : "#a78bfa",
    face: isDark.value ? "#1f2937" : "#ffffff",
    eyes: isDark.value ? "#fbbf24" : "#1f2937",
    cheeks: isDark.value ? "#f472b6" : "#fda4af",
    shadow: isDark.value
      ? "rgba(167, 139, 250, 0.3)"
      : "rgba(139, 92, 246, 0.2)",
    footprint: isDark.value
      ? "rgba(167, 139, 250, 0.4)"
      : "rgba(139, 92, 246, 0.3)",
    angryFace: "#7f1d1d",
  };
});

// 添加脚印
function addFootprint(x: number, y: number, direction: PetDirection) {
  const now = Date.now();
  if (now - lastFootprintTime.value < FOOTPRINT_INTERVAL) return;

  lastFootprintTime.value = now;
  lastFootprintWasLeft.value = !lastFootprintWasLeft.value;

  // 计算脚印位置（在宠物底部）
  const footprintX = x + PET_SIZE / 2 + (lastFootprintWasLeft.value ? -15 : 15);
  const footprintY = y + PET_SIZE - 5;

  const newFootprint: Footprint = {
    id: footprintIdCounter.value++,
    x: footprintX,
    y: footprintY,
    isLeft: lastFootprintWasLeft.value,
    direction: direction,
    createdAt: now,
  };

  footprints.value.push(newFootprint);

  // 限制脚印数量
  if (footprints.value.length > MAX_FOOTPRINTS) {
    footprints.value.shift();
  }
}

// 清理过期的脚印
function cleanupFootprints() {
  const now = Date.now();
  footprints.value = footprints.value.filter(
    (fp) => now - fp.createdAt < FOOTPRINT_LIFETIME,
  );
}

// 获取脚印透明度
function getFootprintOpacity(footprint: Footprint): number {
  const age = Date.now() - footprint.createdAt;
  const remaining = FOOTPRINT_LIFETIME - age;
  return Math.max(0, remaining / FOOTPRINT_LIFETIME);
}

// 随机移动到新位置
function moveToRandomPosition() {
  if (
    petState.value === "sleeping" ||
    petState.value === "happy" ||
    petState.value === "crying" ||
    petState.value === "angry" ||
    petState.value === "fallen" ||
    petState.value === "scared" ||
    petState.value === "thinking" ||
    petState.value === "smug" ||
    petState.value === "shy" ||
    petState.value === "confused" ||
    petState.value === "hello" ||
    petState.value === "sneeze" ||
    petState.value === "yawn" ||
    petState.value === "scratch" ||
    petState.value === "celebrate" ||
    petState.value === "peek" ||
    petState.value === "chase" ||
    petState.value === "hide"
  )
    return;

  const maxX = screenSize.value.width - PET_SIZE;
  const maxY = screenSize.value.height - PET_SIZE - 20;

  targetPosition.value = {
    x: Math.random() * maxX,
    y: Math.random() * (maxY - 100) + 100,
  };

  // 根据移动方向设置朝向
  petDirection.value =
    targetPosition.value.x > position.value.x ? "right" : "left";

  petState.value = "walking";
}

// 改变宠物状态
function changeState(newState: PetState) {
  petState.value = newState;

  // 清除之前的定时器
  if (stateTimer.value) {
    clearTimeout(stateTimer.value);
  }

  // 设置新状态的持续时间
  switch (newState) {
    case "idle":
      stateTimer.value = window.setTimeout(() => {
        if (!isDragging.value) {
          const random = Math.random();
          if (random < 0.08) {
            changeState("sleeping");
          } else if (random < 0.15) {
            changeState("jumping");
          } else if (random < 0.2) {
            changeState("crying");
          } else if (random < 0.25) {
            changeState("angry");
          } else if (random < 0.3) {
            changeState("fallen");
          } else if (random < 0.35) {
            changeState("scared");
          } else if (random < 0.4) {
            changeState("thinking");
          } else if (random < 0.45) {
            changeState("smug");
          } else if (random < 0.5) {
            changeState("shy");
          } else if (random < 0.55) {
            changeState("confused");
          } else if (random < 0.6) {
            changeState("hello");
          } else if (random < 0.65) {
            changeState("sneeze");
          } else if (random < 0.7) {
            changeState("yawn");
          } else if (random < 0.75) {
            changeState("scratch");
          } else if (random < 0.8) {
            changeState("celebrate");
          } else if (random < 0.85) {
            changeState("peek");
          } else {
            moveToRandomPosition();
          }
        }
      }, IDLE_DURATION);
      break;
    case "sleeping":
      stateTimer.value = window.setTimeout(() => {
        changeState("idle");
      }, SLEEP_DURATION);
      break;
    case "jumping":
      setTimeout(() => {
        changeState("idle");
      }, JUMP_DURATION);
      break;
    case "happy":
      stateTimer.value = window.setTimeout(() => {
        changeState("idle");
      }, HAPPY_DURATION);
      break;
    case "crying":
      stateTimer.value = window.setTimeout(() => {
        changeState("idle");
      }, CRYING_DURATION);
      break;
    case "angry":
      stateTimer.value = window.setTimeout(() => {
        changeState("idle");
      }, ANGRY_DURATION);
      break;
    case "fallen":
      setTimeout(() => {
        changeState("idle");
      }, FALLEN_DURATION);
      break;
    case "scared":
      stateTimer.value = window.setTimeout(() => {
        changeState("idle");
      }, SCARED_DURATION);
      break;
    case "thinking":
      stateTimer.value = window.setTimeout(() => {
        changeState("idle");
      }, THINKING_DURATION);
      break;
    case "smug":
      stateTimer.value = window.setTimeout(() => {
        changeState("idle");
      }, SMUG_DURATION);
      break;
    case "shy":
      stateTimer.value = window.setTimeout(() => {
        changeState("idle");
      }, SHY_DURATION);
      break;
    case "confused":
      stateTimer.value = window.setTimeout(() => {
        changeState("idle");
      }, CONFUSED_DURATION);
      break;
    case "hello":
      stateTimer.value = window.setTimeout(() => {
        changeState("idle");
      }, HELLO_DURATION);
      break;
    case "sneeze":
      setTimeout(() => {
        changeState("idle");
      }, SNEEZE_DURATION);
      break;
    case "yawn":
      stateTimer.value = window.setTimeout(() => {
        changeState("idle");
      }, YAWN_DURATION);
      break;
    case "scratch":
      stateTimer.value = window.setTimeout(() => {
        changeState("idle");
      }, SCRATCH_DURATION);
      break;
    case "celebrate":
      stateTimer.value = window.setTimeout(() => {
        changeState("idle");
      }, CELEBRATE_DURATION);
      break;
    case "peek":
      stateTimer.value = window.setTimeout(() => {
        changeState("idle");
      }, PEEK_DURATION);
      break;
    case "chase":
      stateTimer.value = window.setTimeout(() => {
        changeState("idle");
      }, CHASE_DURATION);
      break;
    case "hide":
      stateTimer.value = window.setTimeout(() => {
        changeState("idle");
      }, HIDE_DURATION);
      break;
  }
}

// 点击宠物
function handlePetClick() {
  // 如果正在拖动，不处理点击
  if (isDragging.value) return;

  if (petState.value !== "sleeping") {
    // 随机触发不同反应
    const reactions: PetState[] = [
      "happy",
      "scared",
      "fallen",
      "smug",
      "shy",
      "celebrate",
    ];
    changeState(reactions[Math.floor(Math.random() * reactions.length)]);
  }
}

// 开始拖动
function handleDragStart(e: MouseEvent) {
  isDragging.value = true;

  // 拖动时不穿透
  setPassthrough(false);

  // 计算鼠标相对于宠物位置的偏移
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y,
  };

  // 暂停状态定时器
  if (stateTimer.value) {
    clearTimeout(stateTimer.value);
  }

  petState.value = "walking";

  // 添加全局鼠标事件监听
  window.addEventListener("mousemove", handleDragging);
  window.addEventListener("mouseup", handleDragEnd);
}

// 拖动中
function handleDragging(e: MouseEvent) {
  if (!isDragging.value || !isVisible.value) return;

  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // 根据移动方向设置朝向
  petDirection.value = mouseX > position.value.x ? "right" : "left";

  // 更新位置
  position.value = {
    x: mouseX - dragOffset.value.x,
    y: mouseY - dragOffset.value.y,
  };

  // 添加脚印
  addFootprint(position.value.x, position.value.y, petDirection.value);

  // 同时更新目标位置，防止动画循环将宠物移回原位置
  targetPosition.value = { ...position.value };

  // 限制在窗口范围内
  const maxX = screenSize.value.width - PET_SIZE;
  const maxY = screenSize.value.height - PET_SIZE - 20;

  if (position.value.x < 0) position.value.x = 0;
  if (position.value.x > maxX) position.value.x = maxX;
  if (position.value.y < 60) position.value.y = 60; // 留出工具栏空间
  if (position.value.y > maxY) position.value.y = maxY;
}

// 结束拖动
function handleDragEnd() {
  if (!isDragging.value) return;

  isDragging.value = false;

  // 确保目标位置等于当前位置
  targetPosition.value = { ...position.value };

  // 移除全局事件监听
  window.removeEventListener("mousemove", handleDragging);
  window.removeEventListener("mouseup", handleDragEnd);

  // 恢复空闲状态
  changeState("idle");
}

// 动画循环
function animate() {
  // 清理过期的脚印
  cleanupFootprints();

  // 追逐鼠标
  if (petState.value === "chase" && isVisible.value) {
    const dx = mousePosition.value.x - position.value.x - PET_SIZE / 2;
    const dy = mousePosition.value.y - position.value.y - PET_SIZE / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      const speed = 3;
      const ratio = speed / distance;
      position.value.x += dx * ratio;
      position.value.y += dy * ratio;

      // 根据移动方向设置朝向
      petDirection.value = dx > 0 ? "right" : "left";

      // 添加脚印
      addFootprint(position.value.x, position.value.y, petDirection.value);
    }
  }

  if (isVisible.value && petState.value !== "chase") {
    // 计算到目标位置的距离
    const dx = targetPosition.value.x - position.value.x;
    const dy = targetPosition.value.y - position.value.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (
      distance > WALK_SPEED &&
      petState.value === "walking" &&
      !isDragging.value
    ) {
      // 固定速度移动
      const ratio = WALK_SPEED / distance;
      position.value.x += dx * ratio;
      position.value.y += dy * ratio;

      // 根据移动方向设置朝向
      petDirection.value = dx > 0 ? "right" : "left";

      // 添加脚印
      addFootprint(position.value.x, position.value.y, petDirection.value);
    } else if (
      distance <= WALK_SPEED &&
      petState.value === "walking" &&
      !isDragging.value
    ) {
      // 到达目标位置，停止行走状态
      position.value.x = targetPosition.value.x;
      position.value.y = targetPosition.value.y;
      changeState("idle");
    }
  }

  animationFrameId.value = requestAnimationFrame(animate);
}

// 切换宠物显示
function togglePet() {
  isVisible.value = !isVisible.value;
  if (!isVisible.value) {
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
    }
    if (stateTimer.value) {
      clearTimeout(stateTimer.value);
    }
  } else {
    animate();
    changeState("idle");
  }
}

// 监听窗口大小变化
function handleResize() {
  screenSize.value = { width: window.innerWidth, height: window.innerHeight };

  const maxX = screenSize.value.width - PET_SIZE;
  const maxY = screenSize.value.height - PET_SIZE - 20;

  if (position.value.x > maxX) {
    position.value.x = maxX;
  }
  if (position.value.y > maxY) {
    position.value.y = maxY;
  }
}

// 初始化屏幕尺寸
async function initScreenSize() {
  if (window.electronAPI) {
    try {
      const size = await window.electronAPI.getScreenSize();
      screenSize.value = size;
      position.value = { x: 50, y: size.height - 120 };
      targetPosition.value = { x: 50, y: size.height - 120 };
    } catch (e) {
      console.log("使用默认屏幕尺寸");
    }
  }
}

// 初始化
onMounted(async () => {
  // 初始化屏幕尺寸
  await initScreenSize();

  // 检测系统主题
  checkSystemTheme();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", checkSystemTheme);

  // 从存储加载宠物状态
  const savedState = localStorage.getItem("pet-visibility");
  if (savedState !== null) {
    isVisible.value = savedState === "true";
  }

  if (isVisible.value) {
    animate();
    // 延迟开始状态循环
    setTimeout(() => {
      changeState("idle");
    }, 1000);
  }

  // 添加事件监听
  window.addEventListener("resize", handleResize);
  window.addEventListener("mousemove", handleMouseMove);

  // 暴露全局方法
  (window as any).togglePet = togglePet;
});

// 处理鼠标移动
function handleMouseMove(e: MouseEvent) {
  mousePosition.value = {
    x: e.clientX,
    y: e.clientY,
  };

  // 检测鼠标是否在宠物上，动态切换穿透状态
  const onPet = isMouseOnPet(e.clientX, e.clientY);
  console.log('MouseMove:', e.clientX, e.clientY, 'onPet:', onPet);
  setPassthrough(!onPet);
}

// 清理
onBeforeUnmount(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value);
  }
  if (stateTimer.value) {
    clearTimeout(stateTimer.value);
  }
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("mousemove", handleDragging);
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleDragEnd);
});

// 监听可见性变化，保存到存储
watch(isVisible, (value) => {
  localStorage.setItem("pet-visibility", String(value));
});

// 暴露方法供外部调用
defineExpose({
  togglePet,
  isVisible,
});
</script>

<template>
  <div
    v-if="isVisible"
    class="desktop-pet"
    :class="[`pet-${petState}`, `pet-${petDirection}`]"
  >
    <!-- 脚印容器 -->
    <div class="footprints-container">
      <div
        v-for="footprint in footprints"
        :key="footprint.id"
        class="footprint"
        :class="[
          footprint.isLeft ? 'footprint-left' : 'footprint-right',
          `footprint-${footprint.direction}`,
        ]"
        :style="{
          left: `${footprint.x}px`,
          top: `${footprint.y}px`,
          opacity: getFootprintOpacity(footprint),
        }"
      >
        <svg viewBox="0 0 24 24" class="footprint-svg">
          <path
            d="M12 2C9.5 2 7.5 4.5 7.5 7.5C7.5 10.5 9.5 13 12 13C14.5 13 16.5 10.5 16.5 7.5C16.5 4.5 14.5 2 12 2Z"
            fill="currentColor"
          />
          <ellipse cx="7" cy="17" rx="3" ry="2" fill="currentColor" />
          <ellipse cx="12" cy="19" rx="3.5" ry="2.5" fill="currentColor" />
          <ellipse cx="17" cy="17" rx="3" ry="2" fill="currentColor" />
        </svg>
      </div>
    </div>

    <!-- 宠物容器 -->
    <div
      class="pet-container"
      :class="{ 'is-dragging': isDragging }"
      :style="{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }"
      @mousedown="handleDragStart"
      @click="handlePetClick"
      title="拖动：移动位置 | 单击：开心"
    >
      <!-- 阴影 -->
      <div class="pet-shadow"></div>

      <!-- 宠物主体 -->
      <div class="pet-body">
        <!-- 身体渐变 -->
        <div class="pet-body-gradient"></div>

        <!-- 耳朵 -->
        <div class="pet-ear ear-left"></div>
        <div class="pet-ear ear-right"></div>

        <!-- 脸部 -->
        <div class="pet-face">
          <!-- 眉毛（生气时显示） -->
          <div class="pet-brows">
            <div class="brow brow-left"></div>
            <div class="brow brow-right"></div>
          </div>

          <!-- 眼睛 -->
          <div class="pet-eyes">
            <div class="eye eye-left">
              <div class="eye-shine"></div>
            </div>
            <div class="eye eye-right">
              <div class="eye-shine"></div>
            </div>
          </div>

          <!-- 眨眼效果 -->
          <div class="pet-eyes blink">
            <div class="eye eye-left eye-closed"></div>
            <div class="eye eye-right eye-closed"></div>
          </div>

          <!-- 嘴巴 -->
          <div class="pet-mouth">
            <div class="mouth-smile"></div>
            <div class="mouth-o"></div>
            <div class="mouth-sad"></div>
            <div class="mouth-angry"></div>
          </div>

          <!-- 腮红 -->
          <div class="pet-cheek cheek-left"></div>
          <div class="pet-cheek cheek-right"></div>

          <!-- 眼泪（大哭时显示） -->
          <div class="tears" v-if="petState === 'crying'">
            <div class="tear tear-left"></div>
            <div class="tear tear-right"></div>
          </div>
        </div>

        <!-- 手臂 -->
        <div class="pet-arm arm-left"></div>
        <div class="pet-arm arm-right"></div>

        <!-- 腿 -->
        <div class="pet-leg leg-left"></div>
        <div class="pet-leg leg-right"></div>
      </div>

      <!-- 睡眠气泡 -->
      <div class="sleep-bubble" v-if="petState === 'sleeping'">
        <span>Z</span>
        <span class="z2">Z</span>
        <span class="z3">Z</span>
      </div>

      <!-- 开心效果 -->
      <div class="happy-effects" v-if="petState === 'happy'">
        <div class="heart heart-1">❤️</div>
        <div class="heart heart-2">✨</div>
        <div class="heart heart-3">💖</div>
      </div>

      <!-- 晕眩效果（摔倒时显示） -->
      <div class="dizzy-effects" v-if="petState === 'fallen'">
        <span class="dizzy-star">⭐</span>
        <span class="dizzy-star star-2">💫</span>
        <span class="dizzy-star star-3">✴️</span>
      </div>

      <!-- 惊吓效果 -->
      <div class="scared-effects" v-if="petState === 'scared'">
        <span class="exclaim">❗</span>
        <span class="exclaim exclaim-2">❗</span>
      </div>

      <!-- 思考效果 -->
      <div class="thinking-effects" v-if="petState === 'thinking'">
        <span class="think-icon">💭</span>
      </div>

      <!-- 得意效果 -->
      <div class="smug-effects" v-if="petState === 'smug'">
        <span class="thumb-up">👍</span>
      </div>

      <!-- 害羞效果 -->
      <div class="shy-effects" v-if="petState === 'shy'">
        <span class="shy-icon">🫣</span>
      </div>

      <!-- 疑惑效果 -->
      <div class="confused-effects" v-if="petState === 'confused'">
        <span class="confused-icon">🤔</span>
      </div>

      <!-- 打招呼效果 -->
      <div class="hello-effects" v-if="petState === 'hello'">
        <span class="wave">👋</span>
      </div>

      <!-- 打喷嚏效果 -->
      <div class="sneeze-effects" v-if="petState === 'sneeze'">
        <span class="sneeze-cloud">💨</span>
        <span class="sneeze-text">阿嚏!</span>
      </div>

      <!-- 打哈欠效果 -->
      <div class="yawn-effects" v-if="petState === 'yawn'">
        <span class="yawn-text">哈~</span>
      </div>

      <!-- 挠头效果 -->
      <div class="scratch-effects" v-if="petState === 'scratch'">
        <span class="scratch-icon">❓</span>
      </div>

      <!-- 跳跃庆祝效果 -->
      <div class="celebrate-effects" v-if="petState === 'celebrate'">
        <span class="confetti">🎉</span>
        <span class="confetti confetti-2">🎊</span>
        <span class="confetti confetti-3">✨</span>
      </div>

      <!-- 偷看效果 -->
      <div class="peek-effects" v-if="petState === 'peek'">
        <span class="peek-eyes">👀</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   DESKTOP PET - 小云朵
   ======================================== */
.desktop-pet {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
}

/* ========================================
   FOOTPRINTS - 脚印轨迹
   ======================================== */
.footprints-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.footprint {
  position: absolute;
  width: 20px;
  height: 20px;
  transform: translate(-50%, -100%);
  transition: opacity 0.1s linear;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.footprint-svg {
  width: 100%;
  height: 100%;
  color: v-bind("petColors.footprint");
}

/* 左脚印旋转 */
.footprint-left.footprint-right {
  transform: translate(-50%, -100%) rotate(-15deg);
}

.footprint-left.footprint-left {
  transform: translate(-50%, -100%) rotate(15deg);
}

/* 右脚印旋转 */
.footprint-right.footprint-right {
  transform: translate(-50%, -100%) rotate(15deg);
}

.footprint-right.footprint-left {
  transform: translate(-50%, -100%) rotate(-15deg);
}

.pet-container {
  position: absolute;
  width: 80px;
  height: 80px;
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.pet-container:hover {
  transform: scale(1.1);
}

.pet-container.is-dragging {
  cursor: grabbing;
  transform: scale(1.05);
}

/* ========================================
   PET SHADOW
   ======================================== */
.pet-shadow {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 12px;
  background: v-bind("petColors.shadow");
  border-radius: 50%;
  filter: blur(4px);
  transition: all 0.3s ease;
}

.pet-jumping .pet-shadow {
  transform: translateX(-50%) scale(0.6);
  opacity: 0.5;
}

/* ========================================
   PET BODY
   ======================================== */
.pet-body {
  position: relative;
  width: 70px;
  height: 70px;
  background: v-bind("petColors.body");
  border-radius: 50%;
  box-shadow:
    0 4px 20px v-bind("petColors.shadow"),
    inset 0 -4px 10px rgba(0, 0, 0, 0.1),
    inset 0 4px 10px rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.pet-body-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 30% 30%,
    v-bind("petColors.bodyGradient"),
    transparent 60%
  );
  border-radius: 50%;
}

/* 跳跃动画 */
.pet-jumping .pet-body {
  animation: jump 0.8s ease-in-out;
}

@keyframes jump {
  0%,
  100% {
    transform: translateY(0) scale(1, 1);
  }
  50% {
    transform: translateY(-40px) scale(0.95, 1.05);
  }
}

/* 行走动画 */
.pet-walking .pet-body {
  animation: walk 0.4s ease-in-out infinite;
}

@keyframes walk {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* 空闲动画 */
.pet-idle .pet-body {
  animation: idle 2s ease-in-out infinite;
}

@keyframes idle {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-3px) scale(1.02);
  }
}

/* 睡觉动画 */
.pet-sleeping .pet-body {
  animation: sleep 2s ease-in-out infinite;
}

@keyframes sleep {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-2px) scale(1.01);
  }
}

/* 开心动画 */
.pet-happy .pet-body {
  animation: happy 1.5s ease-in-out;
}

@keyframes happy {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.1) rotate(-5deg);
  }
  50% {
    transform: scale(1.15) rotate(5deg);
  }
  75% {
    transform: scale(1.1) rotate(-3deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

/* 大哭动画 */
.pet-crying .pet-body {
  animation: crying 0.5s ease-in-out infinite;
}

@keyframes crying {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
}

/* 生气动画 */
.pet-angry .pet-body {
  animation: angry 0.3s ease-in-out infinite;
}

@keyframes angry {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.05) rotate(-2deg);
  }
  75% {
    transform: scale(1.05) rotate(2deg);
  }
}

/* 摔倒动画 */
.pet-fallen .pet-body {
  animation: fallen 2s ease-in-out;
}

@keyframes fallen {
  0% {
    transform: scale(1) rotate(0deg);
  }
  20% {
    transform: scale(1.1) rotate(15deg);
  }
  40% {
    transform: scale(0.9) rotate(-10deg);
  }
  60% {
    transform: scale(1.05) rotate(8deg);
  }
  80% {
    transform: scale(0.95) rotate(-5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

/* 惊吓动画 */
.pet-scared .pet-body {
  animation: scared 0.1s ease-in-out infinite;
}

@keyframes scared {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.9);
  }
}

/* ========================================
   PET EARS
   ======================================== */
.pet-ear {
  position: absolute;
  top: -15px;
  width: 25px;
  height: 30px;
  background: v-bind("petColors.body");
  border-radius: 50% 50% 0 0;
  box-shadow: inset 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.pet-ear::after {
  content: "";
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 15px;
  height: 18px;
  background: v-bind("petColors.bodyGradient");
  border-radius: 50% 50% 0 0;
}

.ear-left {
  left: 5px;
  transform: rotate(-15deg);
}

.ear-right {
  right: 5px;
  transform: rotate(15deg);
}

/* 耳朵摆动动画 */
.pet-idle .pet-ear {
  animation: ear-wiggle 3s ease-in-out infinite;
}

@keyframes ear-wiggle {
  0%,
  100% {
    transform: rotate(-15deg);
  }
  50% {
    transform: rotate(-5deg);
  }
}

.pet-idle .ear-right {
  animation: ear-wiggle-right 3s ease-in-out infinite;
}

@keyframes ear-wiggle-right {
  0%,
  100% {
    transform: rotate(15deg);
  }
  50% {
    transform: rotate(5deg);
  }
}

/* ========================================
   PET FACE
   ======================================== */
.pet-face {
  position: absolute;
  inset: 0;
}

/* 眉毛 */
.pet-brows {
  position: absolute;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.pet-angry .pet-brows {
  opacity: 1;
}

.brow {
  width: 8px;
  height: 4px;
  background: v-bind("petColors.eyes");
  border-radius: 2px;
  transition: transform 0.2s ease;
}

.brow-left {
  transform: rotate(-20deg);
}

.brow-right {
  transform: rotate(20deg);
}

.pet-scared .brow-left {
  transform: translateY(-2px) rotate(-10deg);
}

.pet-scared .brow-right {
  transform: translateY(-2px) rotate(10deg);
}

/* 眼睛 */
.pet-eyes {
  position: absolute;
  top: 26px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 14px;
}

.eye {
  width: 14px;
  height: 14px;
  background: v-bind("petColors.eyes");
  border-radius: 50%;
  position: relative;
  transition: all 0.2s ease;
}

.eye-shine {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 5px;
  height: 5px;
  background: white;
  border-radius: 50%;
}

/* 眨眼效果 */
.pet-eyes.blink {
  display: none;
}

/* 眨眼动画 */
.pet-idle .eye,
.pet-walking .eye {
  animation: blink 4s infinite;
}

@keyframes blink {
  0%,
  45%,
  55%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.1);
  }
}

/* 闭眼 - 睡觉状态 */
.eye-closed {
  width: 14px;
  height: 3px;
  background: v-bind("petColors.eyes");
  border-radius: 0 0 50% 50%;
}

.pet-sleeping .pet-eyes {
  display: none;
}

.pet-sleeping .pet-eyes.blink {
  display: flex;
}

.pet-sleeping .eye-closed {
  height: 2px;
  border-radius: 0 0 50% 50%;
}

/* 开心时眼睛变化 */
.pet-happy .eye {
  height: 8px;
  border-radius: 0 0 50% 50%;
}

/* 大哭时眼睛变化 */
.pet-crying .eye {
  height: 10px;
  width: 12px;
  border-radius: 50% 50% 0 0;
}

/* 生气时眼睛变化 */
.pet-angry .eye {
  height: 10px;
  width: 16px;
  border-radius: 50%;
  transform: scaleY(0.8);
}

/* 惊吓时眼睛变化 */
.pet-scared .eye {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  transform: scale(1.2);
}

/* 摔倒时眼睛变化 */
.pet-fallen .eye {
  transform: rotate(180deg);
}

/* 嘴巴 */
.pet-mouth {
  position: absolute;
  top: 44px;
  left: 50%;
  transform: translateX(-50%);
}

.mouth-smile {
  width: 12px;
  height: 6px;
  border: none;
  border-bottom: 3px solid v-bind("petColors.eyes");
  border-radius: 0 0 50% 50%;
}

.mouth-o {
  display: none;
  width: 8px;
  height: 8px;
  border: 3px solid v-bind("petColors.eyes");
  border-radius: 50%;
}

/* 难过嘴巴 */
.mouth-sad {
  display: none;
  width: 12px;
  height: 6px;
  border: none;
  border-top: 3px solid v-bind("petColors.eyes");
  border-radius: 50% 50% 0 0;
}

/* 生气嘴巴 */
.mouth-angry {
  display: none;
  width: 14px;
  height: 4px;
  border: none;
  border: 3px solid v-bind("petColors.eyes");
  border-radius: 50%;
}

/* 开心时嘴巴变化 */
.pet-happy .mouth-smile {
  width: 16px;
  height: 8px;
}

/* 大哭时嘴巴变化 */
.pet-crying .mouth-smile {
  display: none;
}

.pet-crying .mouth-sad {
  display: block;
  width: 14px;
  height: 8px;
  animation: mouth-cry 0.5s ease-in-out infinite;
}

@keyframes mouth-cry {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(2px);
  }
}

/* 生气时嘴巴变化 */
.pet-angry .mouth-smile {
  display: none;
}

.pet-angry .mouth-angry {
  display: block;
}

/* 惊吓时嘴巴变化 */
.pet-scared .mouth-smile {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 3px solid v-bind("petColors.eyes");
  border-bottom: none;
}

/* 摔倒时嘴巴变化 */
.pet-fallen .mouth-smile {
  display: none;
}

.pet-fallen .mouth-o {
  display: block;
  width: 10px;
  height: 12px;
}

/* 腮红 */
.pet-cheek {
  position: absolute;
  top: 42px;
  width: 10px;
  height: 6px;
  background: v-bind("petColors.cheeks");
  border-radius: 50%;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.cheek-left {
  left: 12px;
}

.cheek-right {
  right: 12px;
}

/* 开心时腮红更明显 */
.pet-happy .pet-cheek {
  opacity: 0.9;
  width: 12px;
  height: 8px;
}

/* 大哭时腮红 */
.pet-crying .pet-cheek {
  opacity: 0.8;
  width: 14px;
  height: 10px;
  animation: cheek-tremble 0.5s ease-in-out infinite;
}

@keyframes cheek-tremble {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 生气时腮红变成红色 */
.pet-angry .pet-cheek {
  background: #ef4444;
  opacity: 0.7;
}

/* 眼泪 */
.tears {
  position: absolute;
  top: 35px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
}

.tear {
  width: 6px;
  height: 12px;
  background: #60a5fa;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  animation: tear-fall 0.8s ease-in infinite;
  opacity: 0.8;
}

.tear-left {
  animation-delay: 0s;
}

.tear-right {
  animation-delay: 0.4s;
}

@keyframes tear-fall {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.8;
  }
  100% {
    transform: translateY(25px) scale(0.5);
    opacity: 0;
  }
}

/* ========================================
   PET ARMS
   ======================================== */
.pet-arm {
  position: absolute;
  bottom: 10px;
  width: 12px;
  height: 20px;
  background: v-bind("petColors.body");
  border-radius: 10px;
  box-shadow: inset 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.arm-left {
  left: -5px;
  transform: rotate(20deg);
}

.arm-right {
  right: -5px;
  transform: rotate(-20deg);
}

/* 行走时手臂摆动 */
.pet-walking .arm-left {
  animation: arm-swing-left 0.4s ease-in-out infinite;
}

.pet-walking .arm-right {
  animation: arm-swing-right 0.4s ease-in-out infinite;
}

@keyframes arm-swing-left {
  0%,
  100% {
    transform: rotate(20deg);
  }
  50% {
    transform: rotate(-10deg);
  }
}

@keyframes arm-swing-right {
  0%,
  100% {
    transform: rotate(-20deg);
  }
  50% {
    transform: rotate(10deg);
  }
}

/* 开心时手臂向上 */
.pet-happy .arm-left {
  animation: arm-happy-left 1.5s ease-in-out;
}

.pet-happy .arm-right {
  animation: arm-happy-right 1.5s ease-in-out;
}

@keyframes arm-happy-left {
  0%,
  100% {
    transform: rotate(20deg);
  }
  50% {
    transform: rotate(-30deg);
  }
}

@keyframes arm-happy-right {
  0%,
  100% {
    transform: rotate(-20deg);
  }
  50% {
    transform: rotate(30deg);
  }
}

/* 大哭时手臂遮脸 */
.pet-crying .arm-left {
  animation: arm-cry-left 0.5s ease-in-out infinite;
  transform: rotate(-60deg) translateX(10px);
}

.pet-crying .arm-right {
  animation: arm-cry-right 0.5s ease-in-out infinite;
  transform: rotate(60deg) translateX(-10px);
}

@keyframes arm-cry-left {
  0%,
  100% {
    transform: rotate(-60deg) translateX(10px);
  }
  50% {
    transform: rotate(-70deg) translateX(12px);
  }
}

@keyframes arm-cry-right {
  0%,
  100% {
    transform: rotate(60deg) translateX(-10px);
  }
  50% {
    transform: rotate(70deg) translateX(-12px);
  }
}

/* 生气时手臂叉腰 */
.pet-angry .arm-left {
  transform: rotate(-45deg) translateX(5px);
}

.pet-angry .arm-right {
  transform: rotate(45deg) translateX(-5px);
}

/* 摔倒时手臂散开 */
.pet-fallen .arm-left {
  transform: rotate(-80deg) translateY(-10px);
}

.pet-fallen .arm-right {
  transform: rotate(80deg) translateY(-10px);
}

/* 惊吓时手臂举起 */
.pet-scared .arm-left {
  animation: arm-scared-left 0.1s ease-in-out infinite;
}

.pet-scared .arm-right {
  animation: arm-scared-right 0.1s ease-in-out infinite;
}

@keyframes arm-scared-left {
  0%,
  100% {
    transform: rotate(-60deg);
  }
  50% {
    transform: rotate(-50deg);
  }
}

@keyframes arm-scared-right {
  0%,
  100% {
    transform: rotate(60deg);
  }
  50% {
    transform: rotate(50deg);
  }
}

/* ========================================
   PET LEGS
   ======================================== */
.pet-leg {
  position: absolute;
  bottom: -5px;
  width: 14px;
  height: 12px;
  background: v-bind("petColors.body");
  border-radius: 10px 10px 50% 50%;
  box-shadow: inset 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.leg-left {
  left: 15px;
}

.leg-right {
  right: 15px;
}

/* 行走时腿部移动 */
.pet-walking .leg-left {
  animation: leg-move-left 0.4s ease-in-out infinite;
}

.pet-walking .leg-right {
  animation: leg-move-right 0.4s ease-in-out infinite;
}

@keyframes leg-move-left {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes leg-move-right {
  0%,
  100% {
    transform: translateY(-3px);
  }
  50% {
    transform: translateY(0);
  }
}

/* ========================================
   SLEEP BUBBLE
   ======================================== */
.sleep-bubble {
  position: absolute;
  top: -30px;
  right: -20px;
  font-size: 16px;
  animation: float-up 2s ease-in-out infinite;
}

.sleep-bubble span {
  display: block;
  opacity: 0;
  animation: z-fade 2s ease-in-out infinite;
}

.sleep-bubble .z2 {
  animation-delay: 0.5s;
  margin-left: 10px;
}

.sleep-bubble .z3 {
  animation-delay: 1s;
  margin-left: 20px;
}

@keyframes float-up {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes z-fade {
  0% {
    opacity: 0;
    transform: translateY(5px);
  }
  50% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* ========================================
   HAPPY EFFECTS
   ======================================== */
.happy-effects {
  position: absolute;
  inset: -20px;
  pointer-events: none;
}

.heart {
  position: absolute;
  font-size: 16px;
  animation: heart-float 1.5s ease-out forwards;
  opacity: 0;
}

.heart-1 {
  top: 0;
  left: -10px;
  animation-delay: 0s;
}

.heart-2 {
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0.2s;
}

.heart-3 {
  top: 0;
  right: -10px;
  animation-delay: 0.4s;
}

@keyframes heart-float {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) scale(1.2);
  }
}

/* ========================================
   DIZZY EFFECTS - 晕眩效果
   ======================================== */
.dizzy-effects {
  position: absolute;
  inset: -30px;
  pointer-events: none;
}

.dizzy-star {
  position: absolute;
  font-size: 20px;
  animation: dizzy-spin 1s linear infinite;
  opacity: 0;
}

.star-2 {
  top: -20px;
  left: 50%;
  animation-delay: 0.3s;
}

.star-3 {
  top: 0;
  right: -25px;
  animation-delay: 0.6s;
}

.dizzy-star:first-child {
  top: -15px;
  left: -25px;
}

@keyframes dizzy-spin {
  0% {
    opacity: 0;
    transform: rotate(0deg) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: rotate(180deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: rotate(360deg) scale(0.8);
  }
}

/* ========================================
   SCARED EFFECTS - 惊吓效果
   ======================================== */
.scared-effects {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  display: flex;
  gap: 20px;
}

.exclaim {
  font-size: 24px;
  animation: exclaim-bounce 0.3s ease-in-out infinite;
}

.exclaim-2 {
  animation-delay: 0.15s;
}

@keyframes exclaim-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* ========================================
   THINKING EFFECTS - 思考效果
   ======================================== */
.pet-thinking .pet-body {
  animation: thinking-sway 2s ease-in-out infinite;
}

@keyframes thinking-sway {
  0%,
  100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}

.pet-thinking .arm-left {
  transform: rotate(-60deg) translateY(-10px);
}

.thinking-effects {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.think-icon {
  font-size: 24px;
  animation: think-float 2s ease-in-out infinite;
}

@keyframes think-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* ========================================
   SMUG EFFECTS - 得意效果
   ======================================== */
.pet-smug .pet-body {
  animation: smug-sway 1.5s ease-in-out infinite;
}

@keyframes smug-sway {
  0%,
  100% {
    transform: rotate(-2deg) scale(1.02);
  }
  50% {
    transform: rotate(2deg) scale(1.02);
  }
}

.pet-smug .eye {
  height: 6px;
  border-radius: 0 0 50% 50%;
}

.pet-smug .mouth-smile {
  width: 14px;
  height: 7px;
}

.smug-effects {
  position: absolute;
  top: -30px;
  right: -20px;
  pointer-events: none;
}

.thumb-up {
  font-size: 24px;
  animation: thumb-bounce 0.5s ease-in-out infinite;
}

@keyframes thumb-bounce {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-15deg);
  }
}

/* ========================================
   SHY EFFECTS - 害羞效果
   ======================================== */
.pet-shy .pet-body {
  animation: shy-tremble 0.3s ease-in-out infinite;
}

@keyframes shy-tremble {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

.pet-shy .eye {
  height: 8px;
  border-radius: 0 0 50% 50%;
}

.pet-shy .pet-cheek {
  opacity: 0.9;
  background: #f87171;
  width: 14px;
  height: 10px;
}

.pet-shy .arm-left {
  transform: rotate(-45deg) translateX(5px);
}

.pet-shy .arm-right {
  transform: rotate(45deg) translateX(-5px);
}

.shy-effects {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.shy-icon {
  font-size: 22px;
  animation: shy-blink 0.5s ease-in-out infinite;
}

@keyframes shy-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* ========================================
   CONFUSED EFFECTS - 疑惑效果
   ======================================== */
.pet-confused .pet-body {
  animation: confused-tilt 1s ease-in-out infinite;
}

@keyframes confused-tilt {
  0%,
  100% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(-5deg);
  }
}

.pet-confused .eye {
  width: 16px;
  height: 12px;
}

.confused-effects {
  position: absolute;
  top: -35px;
  right: -10px;
  pointer-events: none;
}

.confused-icon {
  font-size: 24px;
  animation: confused-bounce 0.5s ease-in-out infinite;
}

@keyframes confused-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* ========================================
   HELLO EFFECTS - 打招呼效果
   ======================================== */
.pet-hello .pet-body {
  animation: hello-sway 0.5s ease-in-out infinite;
}

@keyframes hello-sway {
  0%,
  100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}

.pet-hello .mouth-smile {
  width: 14px;
  height: 7px;
}

.pet-hello .arm-right {
  animation: wave-hand 0.3s ease-in-out infinite;
}

@keyframes wave-hand {
  0%,
  100% {
    transform: rotate(-60deg);
  }
  50% {
    transform: rotate(-30deg);
  }
}

.hello-effects {
  position: absolute;
  top: -20px;
  right: -25px;
  pointer-events: none;
}

.wave {
  font-size: 26px;
  animation: wave-animation 0.5s ease-in-out infinite;
}

@keyframes wave-animation {
  0%,
  100% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(20deg);
  }
}

/* ========================================
   SNEEZE EFFECTS - 打喷嚏效果
   ======================================== */
.pet-sneeze .pet-body {
  animation: sneeze-forward 0.2s ease-in-out infinite;
}

@keyframes sneeze-forward {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(5px);
  }
}

.pet-sneeze .eye {
  transform: scaleY(0.1);
}

.pet-sneeze .mouth-smile {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid v-bind("petColors.eyes");
}

.sneeze-effects {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.sneeze-cloud {
  font-size: 24px;
  animation: sneeze-puff 0.5s ease-out infinite;
}

.sneeze-text {
  font-size: 12px;
  font-weight: bold;
  color: #60a5fa;
}

@keyframes sneeze-puff {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
}

/* ========================================
   YAWN EFFECTS - 打哈欠效果
   ======================================== */
.pet-yawn .pet-body {
  animation: yawn-stretch 2s ease-in-out infinite;
}

@keyframes yawn-stretch {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.pet-yawn .eye {
  transform: scaleY(0.3);
}

.pet-yawn .mouth-smile {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid v-bind("petColors.eyes");
}

.pet-yawn .arm-left {
  transform: rotate(-60deg) translateY(-5px);
}

.pet-yawn .arm-right {
  transform: rotate(60deg) translateY(-5px);
}

.yawn-effects {
  position: absolute;
  top: -25px;
  right: -15px;
  pointer-events: none;
}

.yawn-text {
  font-size: 14px;
  animation: yawn-float 2s ease-in-out infinite;
}

@keyframes yawn-float {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

/* ========================================
   SCRATCH EFFECTS - 挠头效果
   ======================================== */
.pet-scratch .pet-body {
  animation: scratch-tilt 0.3s ease-in-out infinite;
}

@keyframes scratch-tilt {
  0%,
  100% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(-8deg);
  }
}

.pet-scratch .eye {
  transform: scaleY(0.5);
}

.pet-scratch .arm-left {
  transform: rotate(-80deg) translateX(15px) translateY(-25px);
}

.scratch-effects {
  position: absolute;
  top: -35px;
  right: -5px;
  pointer-events: none;
}

.scratch-icon {
  font-size: 20px;
  animation: scratch-bounce 0.3s ease-in-out infinite;
}

@keyframes scratch-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* ========================================
   CELEBRATE EFFECTS - 跳跃庆祝效果
   ======================================== */
.pet-celebrate .pet-body {
  animation: celebrate-jump 0.4s ease-in-out infinite;
}

@keyframes celebrate-jump {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(0.95);
  }
}

.pet-celebrate .eye {
  height: 8px;
  border-radius: 0 0 50% 50%;
}

.pet-celebrate .mouth-smile {
  width: 16px;
  height: 8px;
}

.pet-celebrate .arm-left {
  animation: celebrate-arm-left 0.4s ease-in-out infinite;
}

.pet-celebrate .arm-right {
  animation: celebrate-arm-right 0.4s ease-in-out infinite;
}

@keyframes celebrate-arm-left {
  0%,
  100% {
    transform: rotate(20deg);
  }
  50% {
    transform: rotate(-60deg);
  }
}

@keyframes celebrate-arm-right {
  0%,
  100% {
    transform: rotate(-20deg);
  }
  50% {
    transform: rotate(60deg);
  }
}

.celebrate-effects {
  position: absolute;
  inset: -30px;
  pointer-events: none;
}

.confetti {
  position: absolute;
  font-size: 20px;
  animation: confetti-fall 1.5s ease-out infinite;
}

.confetti-2 {
  left: 50%;
  animation-delay: 0.2s;
}

.confetti-3 {
  right: 0;
  animation-delay: 0.4s;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(30px) rotate(360deg);
    opacity: 0;
  }
}

/* ========================================
   PEEK EFFECTS - 偷看效果
   ======================================== */
.pet-peek .pet-body {
  transform: scaleX(0.6) translateX(25%);
}

.pet-peek .eye {
  animation: peek-look 1s ease-in-out infinite;
}

@keyframes peek-look {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(3px);
  }
}

.peek-effects {
  position: absolute;
  top: -30px;
  left: 60%;
  pointer-events: none;
}

.peek-eyes {
  font-size: 24px;
  animation: peek-blink 0.5s ease-in-out infinite;
}

@keyframes peek-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 640px) {
  .pet-container {
    width: 60px;
    height: 60px;
  }

  .pet-body {
    width: 50px;
    height: 50px;
  }

  .pet-ear {
    width: 18px;
    height: 22px;
    top: -12px;
  }

  .pet-ear::after {
    width: 10px;
    height: 12px;
  }

  .pet-eyes {
    top: 18px;
    gap: 10px;
  }

  .eye {
    width: 10px;
    height: 10px;
  }

  .eye-shine {
    width: 3px;
    height: 3px;
  }

  .pet-cheek {
    top: 30px;
    width: 8px;
    height: 5px;
  }

  .pet-mouth {
    top: 32px;
  }

  .mouth-smile {
    width: 10px;
    height: 5px;
  }

  .pet-arm {
    width: 8px;
    height: 15px;
  }

  .pet-leg {
    width: 10px;
    height: 8px;
  }

  .sleep-bubble {
    font-size: 12px;
    top: -25px;
  }

  .happy-effects .heart {
    font-size: 12px;
  }
}
</style>
