<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { getFootprintOpacity } from "./composables/footprints";
// 状态变量从 sharedState 导入
import {
  petState,
  petDirection,
  position,
  isVisible,
  isDragging,
  isContextMenuOpen,
  isScheduleModalOpen,
  isStatsModalOpen,
  isDebugPanelOpen,
  currentFood,
  type FoodType,
} from "./composables/sharedState";
// 函数从 usePetState 导入
import {
  handleDragStart,
  handlePetClick,
  handlePetDoubleClick,
  initScreenSize,
  initPet,
  cleanupPet,
} from "./composables/petController";
import { footprints } from "./composables/footprints";
import { dialogueText, isDialogueVisible } from "./composables/dialogue";
import { isDark, checkSystemTheme } from "./composables/theme";
import {
  getScheduleConfig,
  updateScheduleConfig,
} from "./composables/scheduleManager";
import {
  initStats,
  cleanupStats,
  useStatsRef,
  resetStats as resetStatsData,
} from "./composables/stats";
import { formatDuration, getStatsDays } from "./composables/statsStorage";
import { setPassthrough } from "./composables/passthrough";
import { STATE_NAMES } from "./constants";
import type { ScheduleConfig } from "./types";
import WeatherBackground from "./WeatherBackground.vue";
import EatingEffects from "./EatingEffects.vue";
import "./styles.css";

// 食物类型列表
const foodTypes: FoodType[] = ["apple", "fish", "cake", "lollipop"];

// 当进入 eating 状态时随机选择食物（调试面板打开时不随机，保留用户选择）
watch(petState, (newState) => {
  if (newState === "eating" && !isDebugPanelOpen.value) {
    const randomIndex = Math.floor(Math.random() * foodTypes.length);
    currentFood.value = foodTypes[randomIndex];
  }
});

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

// 初始化
onMounted(async () => {
  // 初始化屏幕尺寸
  await initScreenSize();

  // 初始化宠物
  initPet(checkSystemTheme);

  // 初始化统计
  initStats();
});

// 清理
onBeforeUnmount(() => {
  cleanupPet();
  cleanupStats();
});

// 暴露方法供外部调用
defineExpose({
  isVisible,
});

// 右键菜单状态
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

// 作息配置弹窗状态
const scheduleModalVisible = ref(false);
const scheduleConfig = ref<ScheduleConfig>({
  enabled: false,
  slots: [],
});

// 数据统计弹窗状态
const statsModalVisible = ref(false);
const statsData = useStatsRef();

// 重置确认弹窗状态
const resetConfirmVisible = ref(false);

// 过滤掉"发呆"状态的状态统计，并按次数降序排列
const filteredStateCounts = computed(() => {
  const entries = Object.entries(statsData.value.stateCounts)
    .filter(([state]) => state !== "idle")
    .sort((a, b) => b[1] - a[1]);
  return Object.fromEntries(entries);
});

// 打开右键菜单
const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  // 先禁用穿透
  setPassthrough(false);
  // 设置全局状态
  isContextMenuOpen.value = true;
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;
  contextMenuVisible.value = true;
};

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false;
  isContextMenuOpen.value = false;
  // 只有没有其他弹窗时才恢复穿透
  if (!scheduleModalVisible.value && !statsModalVisible.value) {
    setPassthrough(true);
  }
};

// 打开作息配置弹窗
const openScheduleModal = () => {
  // 先禁用穿透（确保穿透被禁用）
  setPassthrough(false);
  // 设置全局状态
  isScheduleModalOpen.value = true;
  // 关闭菜单但不恢复穿透
  contextMenuVisible.value = false;
  isContextMenuOpen.value = false;
  // 创建深拷贝，避免直接修改原始配置
  const config = getScheduleConfig();
  scheduleConfig.value = {
    enabled: config.enabled,
    slots: config.slots.map((slot) => ({ ...slot })),
  };
  scheduleModalVisible.value = true;
};

// 关闭作息配置弹窗
const closeScheduleModal = () => {
  scheduleModalVisible.value = false;
  isScheduleModalOpen.value = false;
  // 恢复穿透
  setPassthrough(true);
};

// 打开数据统计弹窗
const openStatsModal = () => {
  // 先禁用穿透
  setPassthrough(false);
  // 设置全局状态
  isStatsModalOpen.value = true;
  // 关闭菜单但不恢复穿透
  contextMenuVisible.value = false;
  isContextMenuOpen.value = false;
  statsModalVisible.value = true;
};

// 关闭数据统计弹窗
const closeStatsModal = () => {
  statsModalVisible.value = false;
  isStatsModalOpen.value = false;
  // 恢复穿透
  setPassthrough(true);
};

// 重置统计数据
const resetStats = () => {
  resetConfirmVisible.value = true;
};

// 确认重置统计数据
const confirmResetStats = () => {
  resetStatsData();
  resetConfirmVisible.value = false;
};

// 取消重置
const cancelResetStats = () => {
  resetConfirmVisible.value = false;
};

// 保存作息配置
const saveSchedule = () => {
  updateScheduleConfig(scheduleConfig.value);
  closeScheduleModal();
};

// 切换作息启用状态
const toggleSchedule = () => {
  scheduleConfig.value.enabled = !scheduleConfig.value.enabled;
};

// 点击其他地方关闭菜单
const handleGlobalClick = () => {
  if (contextMenuVisible.value) {
    closeContextMenu();
  }
};

// 添加时间槽
const addTimeSlot = () => {
  scheduleConfig.value.slots.push({
    startHour: 22,
    startMinute: 0,
    endHour: 7,
    endMinute: 0,
    state: "sleep",
  });
};

// 删除时间槽
const removeTimeSlot = (index: number) => {
  scheduleConfig.value.slots.splice(index, 1);
};

// 处理时间输入（循环）
const handleTimeChange = (type: "hour" | "minute", e: Event) => {
  const target = e.target as HTMLInputElement;
  const max = type === "hour" ? 23 : 59;

  // 获取用户输入的值
  let newValue = parseInt(target.value);

  if (isNaN(newValue)) {
    newValue = 0;
  }

  // 超出范围时循环
  if (newValue > max) {
    newValue = 0;
  } else if (newValue < 0) {
    newValue = max;
  }

  // 更新输入框的显示值（补零到两位）
  target.value = newValue.toString().padStart(2, "0");

  return newValue;
};

// 格式化时间显示为两位数字
const formatTime = (value: number) => {
  return value.toString().padStart(2, "0");
};

// 增减时间值
const adjustTime = (
  slot: {
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
    state: string;
  },
  field: "startHour" | "startMinute" | "endHour" | "endMinute",
  delta: number,
) => {
  const max = field.includes("Hour") ? 23 : 59;
  let newValue = slot[field] + delta;

  if (newValue > max) {
    newValue = 0;
  } else if (newValue < 0) {
    newValue = max;
  }

  slot[field] = newValue;
};

// 生命周期
onMounted(() => {
  document.addEventListener("click", handleGlobalClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleGlobalClick);
});
</script>

<template>
  <!-- 天气背景 -->
  <WeatherBackground />

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
          `footprint-type-${footprint.type}`,
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
      @dblclick="handlePetDoubleClick"
      @contextmenu="handleContextMenu"
      title="拖动：移动位置 | 单击：互动 | 双击：跳舞/翻滚 | 右键：菜单"
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

      <!-- 坏笑效果 -->
      <div class="grin-effects" v-if="petState === 'grin'">
        <span class="grin-text">嘿嘿~</span>
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
        <span class="peek-icon">🤫</span>
      </div>

      <!-- 跳舞效果 -->
      <div class="dancing-effects" v-if="petState === 'dancing'">
        <span class="music-note">🎵</span>
        <span class="music-note note-2">🎶</span>
        <span class="music-note note-3">💃</span>
      </div>

      <!-- 翻滚效果 -->
      <div class="rolling-effects" v-if="petState === 'rolling'">
        <span class="spin-star">⭐</span>
      </div>

      <!-- 打哈欠效果 -->
      <div class="yawn-effects" v-if="petState === 'yawn'">
        <span class="yawn-icon">😴</span>
      </div>

      <!-- 睡眼朦胧效果 -->
      <div class="sleepy-effects" v-if="petState === 'sleepy'">
        <span class="sleepy-icon">💤</span>
      </div>

      <!-- 睡眠行走效果 -->
      <div class="sleepwalking-effects" v-if="petState === 'sleepwalking'">
        <span class="sleepwalking-icon">💤</span>
      </div>

      <!-- 伸懒腰效果 -->
      <div class="stretch-effects" v-if="petState === 'stretch'">
        <span class="stretch-icon">✨</span>
      </div>

      <!-- 洗澡效果 -->
      <div class="bathing-effects" v-if="petState === 'bathing'">
        <!-- 莲蓬头淋浴器 -->
        <div class="shower-head-unit">
          <!-- 固定支架 -->
          <div class="shower-bracket">
            <div class="bracket-pipe"></div>
            <div class="bracket-arm"></div>
          </div>
          <!-- 莲蓬头主体 -->
          <div class="shower-head">
            <div class="head-top"></div>
            <div class="head-dome">
              <div class="head-rim"></div>
            </div>
            <div class="head-plate">
              <!-- 出水孔阵列 -->
              <div class="nozzle-row">
                <span class="nozzle"></span>
                <span class="nozzle"></span>
                <span class="nozzle"></span>
                <span class="nozzle"></span>
                <span class="nozzle"></span>
              </div>
              <div class="nozzle-row">
                <span class="nozzle"></span>
                <span class="nozzle"></span>
                <span class="nozzle"></span>
                <span class="nozzle"></span>
              </div>
              <div class="nozzle-row">
                <span class="nozzle"></span>
                <span class="nozzle"></span>
                <span class="nozzle"></span>
              </div>
            </div>
          </div>
          <!-- 水流 -->
          <div class="water-streams">
            <span class="stream s-1"></span>
            <span class="stream s-2"></span>
            <span class="stream s-3"></span>
            <span class="stream s-4"></span>
            <span class="stream s-5"></span>
            <span class="stream s-6"></span>
            <span class="stream s-7"></span>
            <span class="stream s-8"></span>
            <span class="stream s-9"></span>
          </div>
        </div>

        <!-- 水雾效果 -->
        <div class="water-mist"></div>

        <!-- 泡泡群 -->
        <div class="bubble-cluster">
          <span class="bubble b-1"></span>
          <span class="bubble b-2"></span>
          <span class="bubble b-3"></span>
          <span class="bubble b-4"></span>
          <span class="bubble b-5"></span>
          <span class="bubble b-6"></span>
        </div>

        <!-- 水花溅起 -->
        <div class="splash-effect">
          <span class="water-splash ws-1"></span>
          <span class="water-splash ws-2"></span>
          <span class="water-splash ws-3"></span>
        </div>

        <!-- 干净闪光星星 -->
        <div class="clean-stars">
          <span class="star star-1">✦</span>
          <span class="star star-2">✧</span>
          <span class="star star-3">✦</span>
          <span class="star star-4">✧</span>
          <span class="star star-5">✦</span>
          <span class="star star-6">✧</span>
        </div>

        <!-- 彩虹光环 -->
        <div class="rainbow-aura"></div>

        <!-- 快乐音符 -->
        <div class="happy-notes">
          <span class="note nt-1">♪</span>
          <span class="note nt-2">♫</span>
        </div>
      </div>

      <!-- 吃东西效果 -->
      <EatingEffects v-if="petState === 'eating'" />
    </div>

    <!-- 对话气泡（放在 pet-container 外部，不受翻滚影响） -->
    <div
      v-if="dialogueText"
      class="dialogue-bubble"
      :class="{
        'dialogue-visible': isDialogueVisible,
        'dialogue-left': petDirection === 'left',
        'dialogue-cloud':
          petState === 'sleeping' ||
          petState === 'sleepy' ||
          petState === 'yawn',
      }"
      :style="{
        left: `${
          petState === 'sleeping' ||
          petState === 'sleepy' ||
          petState === 'yawn'
            ? position.x + 30
            : position.x + 40
        }px`,
        top: `${
          petState === 'sleeping' ||
          petState === 'sleepy' ||
          petState === 'yawn'
            ? position.y - 70
            : position.y - 55
        }px`,
      }"
    >
      <!-- 云朵样式气泡（睡眠状态） -->
      <svg
        v-if="
          petState === 'sleeping' ||
          petState === 'sleepy' ||
          petState === 'yawn'
        "
        class="cloud-bubble"
        :class="{ 'dark-theme': isDark }"
        viewBox="0 0 120 42"
      >
        <g class="cloud-group">
          <!-- 底部由多个小椭圆组成 -->
          <ellipse cx="25" cy="32" rx="20" ry="10" class="cloud-part" />
          <ellipse cx="55" cy="34" rx="22" ry="9" class="cloud-part" />
          <ellipse cx="85" cy="32" rx="18" ry="10" class="cloud-part" />
          <!-- 中间椭圆 -->
          <ellipse cx="35" cy="22" rx="26" ry="14" class="cloud-part" />
          <ellipse cx="75" cy="20" rx="24" ry="13" class="cloud-part" />
          <!-- 顶部小椭圆 -->
          <ellipse cx="50" cy="12" rx="16" ry="10" class="cloud-part" />
          <ellipse cx="72" cy="10" rx="14" ry="9" class="cloud-part" />
        </g>
      </svg>
      <!-- 云朵尾巴（三个小气泡） -->
      <svg
        v-if="
          petState === 'sleeping' ||
          petState === 'sleepy' ||
          petState === 'yawn'
        "
        class="cloud-tail"
        :class="{ 'dark-theme': isDark }"
        viewBox="0 0 20 25"
      >
        <g class="tail-group">
          <!-- 最上面的气泡（最大，靠近云朵） -->
          <ellipse cx="6" cy="5" rx="5" ry="4" class="tail-part" />
          <!-- 中间的气泡 -->
          <ellipse cx="10" cy="13" rx="4" ry="3.5" class="tail-part" />
          <!-- 最下面的气泡（最小） -->
          <ellipse cx="14" cy="20" rx="3" ry="2.5" class="tail-part" />
        </g>
      </svg>
      <span class="dialogue-text">{{ dialogueText }}</span>
      <!-- 普通气泡尾巴 -->
      <div
        v-if="
          !(
            petState === 'sleeping' ||
            petState === 'sleepy' ||
            petState === 'yawn'
          )
        "
        class="dialogue-tail"
      ></div>
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <Transition name="menu-pop">
        <div
          v-if="contextMenuVisible"
          class="pet-context-menu"
          :class="{ 'dark-mode': isDark }"
          :style="{
            left: `${contextMenuX}px`,
            top: `${contextMenuY}px`,
          }"
          @click.stop
        >
          <!-- 装饰星星 -->
          <div class="menu-decor-stars">
            <span class="decor-star-small star-1">✦</span>
            <span class="decor-star-small star-2">✧</span>
            <span class="decor-star-small star-3">✦</span>
          </div>

          <div class="menu-bubble">
            <div class="menu-item" @click="openScheduleModal">
              <div class="menu-icon-wrapper moon">
                <span class="menu-icon">🌙</span>
              </div>
              <div class="menu-text-group">
                <span class="menu-text">作息设置</span>
                <span class="menu-desc">设置睡眠时间</span>
              </div>
              <span class="menu-arrow">›</span>
            </div>
            <div class="menu-divider">
              <div class="divider-line"></div>
            </div>
            <div class="menu-item" @click="openStatsModal">
              <div class="menu-icon-wrapper chart">
                <span class="menu-icon">📊</span>
              </div>
              <div class="menu-text-group">
                <span class="menu-text">数据统计</span>
                <span class="menu-desc">查看互动记录</span>
              </div>
              <span class="menu-arrow">›</span>
            </div>
          </div>

          <!-- 小尾巴 -->
          <div class="menu-tail"></div>
        </div>
      </Transition>

      <!-- 作息配置弹窗 -->
      <Transition name="modal-pop">
        <div
          v-if="scheduleModalVisible"
          class="schedule-modal-overlay"
          @click="closeScheduleModal"
        >
          <div
            class="schedule-modal"
            :class="{ 'dark-mode': isDark }"
            @click.stop
          >
            <!-- 装饰元素 -->
            <div class="modal-decor">
              <span class="decor-star star-1">⭐</span>
              <span class="decor-star star-2">✨</span>
              <span class="decor-star star-3">🌙</span>
            </div>

            <div class="modal-header">
              <div class="header-title">
                <span class="title-icon">🌙</span>
                <span class="title-text">作息时间表</span>
              </div>
              <button class="modal-close" @click="closeScheduleModal">
                <span>✕</span>
              </button>
            </div>

            <div class="modal-body">
              <!-- 启用开关 -->
              <div class="toggle-card">
                <div class="toggle-info">
                  <span class="toggle-title">自动作息</span>
                  <span class="toggle-desc">到时间自动睡觉和起床</span>
                </div>
                <button
                  class="toggle-switch"
                  :class="{ active: scheduleConfig.enabled }"
                  @click="toggleSchedule"
                >
                  <span class="toggle-knob"></span>
                </button>
              </div>

              <!-- 时间段列表 -->
              <div class="slots-section">
                <div class="slots-header">
                  <span class="slots-title">时间段设置</span>
                  <button class="add-btn" @click="addTimeSlot">
                    <span>+</span>
                  </button>
                </div>

                <div class="slots-list">
                  <div
                    v-for="(slot, index) in scheduleConfig.slots"
                    :key="index"
                    class="slot-card"
                    :class="{ 'is-sleep': slot.state === 'sleep' }"
                  >
                    <div class="slot-icon">
                      {{ slot.state === "sleep" ? "😴" : "🎈" }}
                    </div>
                    <div class="slot-time-inputs">
                      <div class="time-group">
                        <div class="time-input-wrapper">
                          <input
                            type="text"
                            inputmode="numeric"
                            :value="formatTime(slot.startHour)"
                            @input="
                              (e) =>
                                (slot.startHour = handleTimeChange('hour', e))
                            "
                            class="time-input"
                          />
                          <div class="time-controls">
                            <button
                              class="time-btn time-btn-up"
                              @click.stop="adjustTime(slot, 'startHour', 1)"
                            >
                              ▲
                            </button>
                            <button
                              class="time-btn time-btn-down"
                              @click.stop="adjustTime(slot, 'startHour', -1)"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                        <span class="time-colon">:</span>
                        <div class="time-input-wrapper">
                          <input
                            type="text"
                            inputmode="numeric"
                            :value="formatTime(slot.startMinute)"
                            @input="
                              (e) =>
                                (slot.startMinute = handleTimeChange(
                                  'minute',
                                  e,
                                ))
                            "
                            class="time-input"
                          />
                          <div class="time-controls">
                            <button
                              class="time-btn time-btn-up"
                              @click.stop="adjustTime(slot, 'startMinute', 1)"
                            >
                              ▲
                            </button>
                            <button
                              class="time-btn time-btn-down"
                              @click.stop="adjustTime(slot, 'startMinute', -1)"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </div>
                      <span class="time-arrow">→</span>
                      <div class="time-group">
                        <div class="time-input-wrapper">
                          <input
                            type="text"
                            inputmode="numeric"
                            :value="formatTime(slot.endHour)"
                            @input="
                              (e) =>
                                (slot.endHour = handleTimeChange('hour', e))
                            "
                            class="time-input"
                          />
                          <div class="time-controls">
                            <button
                              class="time-btn time-btn-up"
                              @click.stop="adjustTime(slot, 'endHour', 1)"
                            >
                              ▲
                            </button>
                            <button
                              class="time-btn time-btn-down"
                              @click.stop="adjustTime(slot, 'endHour', -1)"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                        <span class="time-colon">:</span>
                        <div class="time-input-wrapper">
                          <input
                            type="text"
                            inputmode="numeric"
                            :value="formatTime(slot.endMinute)"
                            @input="
                              (e) =>
                                (slot.endMinute = handleTimeChange('minute', e))
                            "
                            class="time-input"
                          />
                          <div class="time-controls">
                            <button
                              class="time-btn time-btn-up"
                              @click.stop="adjustTime(slot, 'endMinute', 1)"
                            >
                              ▲
                            </button>
                            <button
                              class="time-btn time-btn-down"
                              @click.stop="adjustTime(slot, 'endMinute', -1)"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <select v-model="slot.state" class="state-select">
                      <option value="sleep">睡眠</option>
                      <option value="free">闲暇</option>
                    </select>
                    <button class="remove-btn" @click="removeTimeSlot(index)">
                      <span>×</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-cancel" @click="closeScheduleModal">
                取消
              </button>
              <button class="btn btn-save" @click="saveSchedule">
                <span>✓</span> 保存
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 数据统计弹窗 -->
      <Transition name="modal-pop">
        <div
          v-if="statsModalVisible"
          class="stats-modal-overlay"
          @click="closeStatsModal"
        >
          <div class="stats-modal" :class="{ 'dark-mode': isDark }" @click.stop>
            <!-- 装饰元素 -->
            <div class="modal-decor">
              <span class="decor-star star-1">📊</span>
              <span class="decor-star star-2">✨</span>
              <span class="decor-star star-3">🎉</span>
            </div>

            <div class="modal-header">
              <div class="header-title">
                <span class="title-icon">📊</span>
                <span class="title-text stats-title">数据统计</span>
              </div>
              <button class="modal-close" @click="closeStatsModal">
                <span>✕</span>
              </button>
            </div>

            <div class="modal-body">
              <!-- 统计日期信息 -->
              <div class="stats-info-bar">
                <span class="stats-date">
                  📅 统计开始：{{
                    new Date(statsData.startDate).toLocaleDateString()
                  }}
                </span>
                <span class="stats-days">
                  已陪伴 {{ getStatsDays(statsData.startDate) }} 天
                </span>
              </div>

              <!-- 核心数据卡片 -->
              <div class="stats-cards">
                <!-- 连续使用 -->
                <div class="stat-card streak-card">
                  <div class="stat-icon">🔥</div>
                  <div class="stat-content">
                    <div class="stat-value">{{ statsData.streakDays }}</div>
                    <div class="stat-label">连续使用</div>
                  </div>
                </div>

                <!-- 总陪伴时长 -->
                <div class="stat-card duration-card">
                  <div class="stat-icon">⏱️</div>
                  <div class="stat-content">
                    <div class="stat-value">
                      {{ formatDuration(statsData.totalDuration) }}
                    </div>
                    <div class="stat-label">总陪伴时长</div>
                  </div>
                </div>

                <!-- 今日时长 -->
                <div class="stat-card today-card">
                  <div class="stat-icon">🌟</div>
                  <div class="stat-content">
                    <div class="stat-value">
                      {{ formatDuration(statsData.todayDuration) }}
                    </div>
                    <div class="stat-label">今日陪伴</div>
                  </div>
                </div>

                <!-- 启动次数 -->
                <div class="stat-card launch-card">
                  <div class="stat-icon">🚀</div>
                  <div class="stat-content">
                    <div class="stat-value">{{ statsData.launchCount }}</div>
                    <div class="stat-label">启动次数</div>
                  </div>
                </div>
              </div>

              <!-- 互动统计 -->
              <div class="stats-section">
                <div class="section-title">
                  <span class="section-icon">🎮</span>
                  互动统计
                </div>
                <div class="interactions-grid">
                  <div class="interaction-item">
                    <span class="interaction-icon">👆</span>
                    <span class="interaction-label">点击</span>
                    <span class="interaction-value">{{
                      statsData.interactions.click
                    }}</span>
                  </div>
                  <div class="interaction-item">
                    <span class="interaction-icon">👆👆</span>
                    <span class="interaction-label">双击</span>
                    <span class="interaction-value">{{
                      statsData.interactions.doubleClick
                    }}</span>
                  </div>
                  <div class="interaction-item">
                    <span class="interaction-icon">✋</span>
                    <span class="interaction-label">拖拽</span>
                    <span class="interaction-value">{{
                      statsData.interactions.drag
                    }}</span>
                  </div>
                </div>
                <div class="interactions-total">
                  总互动次数：<span class="total-value">{{
                    statsData.interactions.click +
                    statsData.interactions.doubleClick +
                    statsData.interactions.drag
                  }}</span>
                </div>
              </div>

              <!-- 状态触发统计 -->
              <div
                class="stats-section"
                v-if="Object.keys(filteredStateCounts).length > 0"
              >
                <div class="section-title">
                  <span class="section-icon">🎭</span>
                  状态触发
                </div>
                <div class="state-list">
                  <div
                    v-for="(count, state) in filteredStateCounts"
                    :key="state"
                    class="state-item"
                  >
                    <span class="state-name">{{
                      STATE_NAMES[state] || state
                    }}</span>
                    <div class="state-bar-bg">
                      <div
                        class="state-bar"
                        :style="{
                          width: `${Math.min(100, (count / Math.max(...Object.values(filteredStateCounts))) * 100)}%`,
                        }"
                      ></div>
                    </div>
                    <span class="state-count">{{ count }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-reset" @click="resetStats">
                <span>🔄</span> 重置数据
              </button>
              <button class="btn btn-save" @click="closeStatsModal">
                <span>✓</span> 关闭
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 重置确认弹窗 -->
      <Transition name="confirm-pop">
        <div
          v-if="resetConfirmVisible"
          class="confirm-overlay"
          @click="cancelResetStats"
        >
          <div
            class="confirm-dialog"
            :class="{ 'dark-mode': isDark }"
            @click.stop
          >
            <!-- 警告图标区域 -->
            <div class="confirm-icon-wrapper">
              <div class="confirm-icon-circle">
                <span class="confirm-icon">⚠️</span>
              </div>
              <div class="icon-pulse"></div>
            </div>

            <!-- 文字内容 -->
            <div class="confirm-content">
              <h3 class="confirm-title">确认重置</h3>
              <p class="confirm-message">
                确定要重置所有统计数据吗？
                <br />
                <span class="confirm-warning">此操作不可撤销</span>
              </p>
            </div>

            <!-- 按钮区域 -->
            <div class="confirm-buttons">
              <button
                class="confirm-btn confirm-cancel"
                @click="cancelResetStats"
              >
                取消
              </button>
              <button class="confirm-btn confirm-ok" @click="confirmResetStats">
                确认重置
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* 动态颜色绑定 - 需要使用 v-bind */
.footprint-svg {
  color: v-bind("petColors.footprint");
}

.pet-shadow {
  background: v-bind("petColors.shadow");
}

.pet-body {
  background: v-bind("petColors.body");
}

.pet-body-gradient {
  background: radial-gradient(
    circle at 30% 30%,
    v-bind("petColors.bodyGradient"),
    transparent 60%
  );
}

.pet-ear {
  background: v-bind("petColors.body");
}

.pet-ear::after {
  background: v-bind("petColors.bodyGradient");
}

.brow {
  background: v-bind("petColors.eyes");
}

.eye {
  background: v-bind("petColors.eyes");
}

.eye-closed {
  background: v-bind("petColors.eyes");
}

.mouth-smile {
  border-bottom: 3px solid v-bind("petColors.eyes");
}

.mouth-o {
  border: 3px solid v-bind("petColors.eyes");
}

.mouth-sad {
  border-top: 3px solid v-bind("petColors.eyes");
}

.mouth-angry {
  border: 3px solid v-bind("petColors.eyes");
}

.pet-cheek {
  background: v-bind("petColors.cheeks");
}

.pet-arm {
  background: v-bind("petColors.body");
}

.pet-leg {
  background: v-bind("petColors.body");
}

.pet-scared .brow-left {
  transform: translateY(-2px) rotate(-10deg);
}

.pet-scared .brow-right {
  transform: translateY(-2px) rotate(10deg);
}

.pet-scared .mouth-smile {
  border: 3px solid v-bind("petColors.eyes");
}

.pet-sneeze .mouth-smile {
  border: 3px solid v-bind("petColors.eyes");
}

.dialogue-bubble {
  background: v-bind(
    "isDark ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'"
  );
  box-shadow:
    0 4px 15px
      v-bind("isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(139, 92, 246, 0.15)'"),
    0 0 0 1px
      v-bind("isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(139, 92, 246, 0.1)'");
}

.dialogue-bubble::before {
  background: linear-gradient(
    135deg,
    v-bind("isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.2)'"),
    v-bind("isDark ? 'rgba(244, 114, 182, 0.3)' : 'rgba(253, 164, 175, 0.2)'")
  );
}

.dialogue-text {
  color: v-bind("isDark ? '#e2e8f0' : '#374151'");
  text-shadow: 0 1px 2px
    v-bind("isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)'");
}

.dialogue-tail {
  background: v-bind(
    "isDark ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'"
  );
}

/* ========================================
   右键菜单样式 - 梦幻云朵风格
   ======================================== */
.pet-context-menu {
  position: fixed;
  z-index: 10000;
  pointer-events: auto !important;
  transform-origin: top left;
}

.menu-decor-stars {
  position: absolute;
  inset: -15px;
  pointer-events: none;
}

.decor-star-small {
  position: absolute;
  font-size: 12px;
  animation: star-twinkle 2s ease-in-out infinite;
}

.decor-star-small.star-1 {
  top: 5px;
  left: -5px;
  animation-delay: 0s;
  color: v-bind("isDark ? '#c4b5fd' : '#a78bfa'");
}

.decor-star-small.star-2 {
  top: -8px;
  right: 10px;
  animation-delay: 0.5s;
  color: v-bind("isDark ? '#f9a8d4' : '#f472b6'");
}

.decor-star-small.star-3 {
  bottom: 20px;
  right: -8px;
  animation-delay: 1s;
  color: v-bind("isDark ? '#c4b5fd' : '#a78bfa'");
}

@keyframes star-twinkle {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.menu-bubble {
  min-width: 180px;
  padding: 10px;
  background: v-bind(
    "isDark ? 'rgba(35, 30, 55, 0.97)' : 'rgba(255, 255, 255, 0.97)'"
  );
  border-radius: 20px;
  box-shadow:
    0 10px 40px
      v-bind("isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.15)'"),
    0 0 0 1px
      v-bind("isDark ? 'rgba(167, 139, 250, 0.2)' : 'rgba(139, 92, 246, 0.1)'"),
    inset 0 1px 0
      v-bind(
        "isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)'"
      );
  backdrop-filter: blur(20px);
  pointer-events: auto !important;
  position: relative;
  overflow: hidden;
}

.menu-bubble::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(
    180deg,
    v-bind("isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.04)'")
      0%,
    transparent 100%
  );
  pointer-events: none;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.menu-item:hover {
  background: v-bind(
    "isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)'"
  );
  transform: translateX(4px) scale(1.02);
}

.menu-item:active {
  transform: translateX(2px) scale(0.98);
}

.menu-icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.menu-icon-wrapper.moon {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.15),
    rgba(168, 85, 247, 0.1)
  );
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.15);
}

.menu-icon-wrapper.chart {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.15),
    rgba(6, 182, 212, 0.1)
  );
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
}

.menu-item:hover .menu-icon-wrapper {
  transform: scale(1.1) rotate(-5deg);
}

.menu-item:hover .menu-icon-wrapper.moon {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.25),
    rgba(168, 85, 247, 0.2)
  );
}

.menu-item:hover .menu-icon-wrapper.chart {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.25),
    rgba(6, 182, 212, 0.2)
  );
}

.menu-icon {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-text-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.menu-text {
  font-size: 14px;
  font-weight: 600;
  color: v-bind("isDark ? '#e2e8f0' : '#374151'");
  letter-spacing: 0.2px;
}

.menu-desc {
  font-size: 11px;
  color: v-bind(
    "isDark ? 'rgba(167, 139, 250, 0.7)' : 'rgba(139, 92, 246, 0.7)'"
  );
  font-weight: 400;
}

.menu-arrow {
  font-size: 18px;
  color: v-bind(
    "isDark ? 'rgba(167, 139, 250, 0.5)' : 'rgba(139, 92, 246, 0.4)'"
  );
  transition: all 0.25s ease;
  opacity: 0;
  transform: translateX(-5px);
}

.menu-item:hover .menu-arrow {
  opacity: 1;
  transform: translateX(0);
  color: v-bind("isDark ? '#a78bfa' : '#8b5cf6'");
}

.menu-divider {
  padding: 4px 8px;
  position: relative;
}

.divider-line {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    v-bind("isDark ? 'rgba(167, 139, 250, 0.2)' : 'rgba(139, 92, 246, 0.15)'")
      20%,
    v-bind("isDark ? 'rgba(167, 139, 250, 0.2)' : 'rgba(139, 92, 246, 0.15)'")
      80%,
    transparent 100%
  );
}

.menu-tail {
  position: absolute;
  bottom: -8px;
  left: 24px;
  width: 20px;
  height: 12px;
  background: v-bind(
    "isDark ? 'rgba(35, 30, 55, 0.97)' : 'rgba(255, 255, 255, 0.97)'"
  );
  clip-path: polygon(30% 0%, 70% 0%, 50% 100%);
  filter: drop-shadow(0 2px 4px rgba(139, 92, 246, 0.1));
}

/* ========================================
   作息配置弹窗样式
   ======================================== */
.schedule-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  background: v-bind(
    "isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(139, 92, 246, 0.15)'"
  );
  backdrop-filter: blur(8px);
  pointer-events: auto !important;
}

.schedule-modal {
  width: 480px;
  max-width: 90vw;
  height: 70vh;
  border-radius: 24px;
  background: v-bind(
    "isDark ? 'rgba(35, 30, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)'"
  );
  box-shadow:
    0 20px 60px
      v-bind("isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(139, 92, 246, 0.25)'"),
    0 0 0 1px
      v-bind("isDark ? 'rgba(167, 139, 250, 0.2)' : 'rgba(139, 92, 246, 0.1)'");
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  pointer-events: auto !important;
}

.modal-decor {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.decor-star {
  position: absolute;
  font-size: 16px;
  opacity: 0.4;
  animation: twinkle 2s ease-in-out infinite;
}

.star-1 {
  top: 20px;
  right: 60px;
  animation-delay: 0s;
}
.star-2 {
  top: 40px;
  right: 20px;
  animation-delay: 0.5s;
}
.star-3 {
  top: 60px;
  right: 80px;
  animation-delay: 1s;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  position: relative;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 24px;
}

.title-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: v-bind(
    "isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'"
  );
  color: v-bind("isDark ? '#9ca3af' : '#9ca3af'");
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  transform: rotate(90deg);
}

.modal-body {
  padding: 0 24px 20px;
  overflow-y: auto;
  flex: 1;
}

.toggle-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: v-bind(
    "isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)'"
  );
  border-radius: 16px;
  border: 1px solid
    v-bind("isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(139, 92, 246, 0.1)'");
  margin-bottom: 20px;
}

.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toggle-title {
  font-size: 15px;
  font-weight: 600;
  color: v-bind("isDark ? '#e2e8f0' : '#374151'");
}

.toggle-desc {
  font-size: 12px;
  color: v-bind("isDark ? '#9ca3af' : '#9ca3af'");
}

.toggle-switch {
  width: 52px;
  height: 28px;
  border: none;
  border-radius: 14px;
  background: v-bind(
    "isDark ? 'rgba(107, 114, 128, 0.3)' : 'rgba(156, 163, 175, 0.3)'"
  );
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toggle-switch.active {
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toggle-switch.active .toggle-knob {
  transform: translateX(24px);
}

.slots-section {
  margin-top: 4px;
}

.slots-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.slots-title {
  font-size: 13px;
  font-weight: 600;
  color: v-bind("isDark ? '#9ca3af' : '#6b7280'");
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed
    v-bind("isDark ? 'rgba(167, 139, 250, 0.4)' : 'rgba(139, 92, 246, 0.4)'");
  background: transparent;
  border-radius: 8px;
  color: v-bind("isDark ? '#a78bfa' : '#8b5cf6'");
  font-size: 18px;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: v-bind(
    "isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(139, 92, 246, 0.1)'"
  );
  border-style: solid;
  transform: scale(1.1);
}

.slots-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slot-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: v-bind(
    "isDark ? 'rgba(55, 48, 85, 0.4)' : 'rgba(250, 245, 255, 0.7)'"
  );
  border-radius: 14px;
  border: 1px solid
    v-bind("isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(139, 92, 246, 0.1)'");
  transition: all 0.2s ease;
}

.slot-card:hover {
  border-color: v-bind(
    "isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.25)'"
  );
}

.slot-card.is-sleep {
  background: v-bind(
    "isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(165, 180, 252, 0.2)'"
  );
}

.slot-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.slot-time-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.time-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.time-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.time-input {
  width: 50px;
  padding: 6px 18px 6px 4px;
  border: 1px solid
    v-bind("isDark ? 'rgba(167, 139, 250, 0.2)' : 'rgba(139, 92, 246, 0.15)'");
  border-radius: 8px;
  background: v-bind(
    "isDark ? 'rgba(30, 27, 45, 0.8)' : 'rgba(255, 255, 255, 0.9)'"
  );
  color: v-bind("isDark ? '#e2e8f0' : '#374151'");
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s ease;
}

.time-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}

.time-controls {
  position: absolute;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.time-btn {
  width: 14px;
  height: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: v-bind("isDark ? '#a78bfa' : '#8b5cf6'");
  font-size: 8px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.15s ease;
  padding: 0;
}

.time-btn:hover {
  opacity: 1;
  background: v-bind(
    "isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(139, 92, 246, 0.1)'"
  );
  border-radius: 2px;
}

.time-btn:active {
  transform: scale(0.9);
}

.time-colon {
  color: v-bind("isDark ? '#9ca3af' : '#9ca3af'");
  font-weight: 600;
}

.time-arrow {
  color: v-bind("isDark ? '#a78bfa' : '#8b5cf6'");
  font-size: 12px;
  margin: 0 4px;
}

.state-select {
  padding: 8px 12px;
  border: 1px solid
    v-bind("isDark ? 'rgba(167, 139, 250, 0.2)' : 'rgba(139, 92, 246, 0.15)'");
  border-radius: 10px;
  background: v-bind(
    "isDark ? 'rgba(30, 27, 45, 0.8)' : 'rgba(255, 255, 255, 0.9)'"
  );
  color: v-bind("isDark ? '#e2e8f0' : '#374151'");
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.state-select:focus {
  outline: none;
  border-color: #8b5cf6;
}

.remove-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid
    v-bind("isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'");
  background: transparent;
  color: #ef4444;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 500;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  opacity: 1;
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  transform: scale(1.05);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-cancel {
  background: v-bind(
    "isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(156, 163, 175, 0.15)'"
  );
  color: v-bind("isDark ? '#9ca3af' : '#6b7280'");
}

.btn-cancel:hover {
  background: v-bind(
    "isDark ? 'rgba(107, 114, 128, 0.3)' : 'rgba(156, 163, 175, 0.25)'"
  );
}

.btn-save {
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
  color: white;
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.45);
}

.btn-save:active {
  transform: translateY(0);
}

/* ========================================
   动画过渡
   ======================================== */
.menu-pop-enter-active {
  animation: menu-pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.menu-pop-leave-active {
  animation: menu-pop-out 0.15s ease-in;
}

@keyframes menu-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes menu-pop-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}

.modal-pop-enter-active {
  animation: modal-pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-pop-leave-active {
  animation: modal-pop-out 0.2s ease-in;
}

@keyframes modal-pop-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes modal-pop-in .schedule-modal {
  0% {
    transform: scale(0.9) translateY(20px);
  }
  100% {
    transform: scale(1) translateY(0);
  }
}

@keyframes modal-pop-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* ========================================
   梦幻云朵对话气泡（睡眠状态专用）
   ======================================== */

/* 云朵气泡主体 */
.dialogue-bubble.dialogue-cloud {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0;
  width: 120px;
  height: 42px;
  position: relative;
}

.dialogue-bubble.dialogue-cloud::before {
  display: none !important;
  content: none !important;
}

/* 云朵 SVG */
.cloud-bubble {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.cloud-bubble .cloud-group {
  opacity: 0.9;
}

.cloud-bubble .cloud-part {
  fill: white;
}

.cloud-bubble.dark-theme .cloud-part {
  fill: #8b5cf6;
}

/* 云朵文字 - 居中显示在云朵内部 */
.dialogue-bubble.dialogue-cloud .dialogue-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  color: v-bind("isDark ? '#c7d2fe' : '#6366f1'");
  font-weight: 500;
  text-shadow: 0 1px 3px
    v-bind("isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)'");
  white-space: nowrap;
}

/* 云朵尾巴 SVG */
.cloud-tail {
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 25px;
  pointer-events: none;
}

.dialogue-bubble.dialogue-cloud.dialogue-left .cloud-tail {
  left: 60%;
}

.cloud-tail .tail-group {
  opacity: 0.9;
}

.cloud-tail .tail-part {
  fill: white;
}

.cloud-tail.dark-theme .tail-part {
  fill: #8b5cf6;
}

/* 云朵气泡隐藏普通尾巴 */
.dialogue-bubble.dialogue-cloud .dialogue-tail {
  display: none;
}

/* 云朵顶部装饰 - 已移除，改用整体云朵 */
.dialogue-bubble.dialogue-cloud::before,
.dialogue-bubble.dialogue-cloud::after {
  display: none;
}

/* 云朵装饰 SVG - 已移除 */
.cloud-decoration {
  display: none;
}

/* 云朵尾巴 SVG - 已移除 */
.dialogue-tail-svg {
  display: none;
}

/* 云朵浮动动画 */
@keyframes cloud-float {
  0%,
  100% {
    transform: translateX(-50%) translateY(0) scale(1);
  }
  50% {
    transform: translateX(-50%) translateY(-3px) scale(1.02);
  }
}

.dialogue-bubble.dialogue-cloud.dialogue-visible {
  animation:
    cloud-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
    cloud-float 3s ease-in-out infinite 0.5s;
}

@keyframes cloud-appear {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(10px) scale(0.8);
  }
  50% {
    transform: translateX(-50%) translateY(-5px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

/* ========================================
   数据统计弹窗样式
   ======================================== */
.stats-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  background: v-bind(
    "isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(16, 185, 129, 0.1)'"
  );
  backdrop-filter: blur(8px);
  pointer-events: auto !important;
}

.stats-modal {
  width: 480px;
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 24px;
  background: v-bind(
    "isDark ? 'rgba(30, 35, 40, 0.98)' : 'rgba(255, 255, 255, 0.98)'"
  );
  box-shadow:
    0 20px 60px
      v-bind("isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(16, 185, 129, 0.2)'"),
    0 0 0 1px
      v-bind("isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'");
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  pointer-events: auto !important;
}

.stats-title {
  background: linear-gradient(135deg, #10b981, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: v-bind(
    "isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)'"
  );
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 13px;
}

.stats-date {
  color: v-bind("isDark ? '#9ca3af' : '#6b7280'");
}

.stats-days {
  font-weight: 600;
  color: #10b981;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.streak-card {
  background: linear-gradient(
    135deg,
    rgba(251, 146, 60, 0.15),
    rgba(249, 115, 22, 0.1)
  );
  border: 1px solid rgba(251, 146, 60, 0.2);
}

.duration-card {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.15),
    rgba(168, 85, 247, 0.1)
  );
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.today-card {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.15),
    rgba(6, 182, 212, 0.1)
  );
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.launch-card {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.15),
    rgba(99, 102, 241, 0.1)
  );
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.stat-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: v-bind("isDark ? '#f1f5f9' : '#1f2937'");
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-label {
  font-size: 12px;
  color: v-bind("isDark ? '#9ca3af' : '#6b7280'");
  margin-top: 2px;
}

.stats-section {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: v-bind("isDark ? '#e2e8f0' : '#374151'");
  margin-bottom: 12px;
}

.section-icon {
  font-size: 16px;
}

.interactions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.interaction-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: v-bind(
    "isDark ? 'rgba(55, 65, 81, 0.4)' : 'rgba(243, 244, 246, 0.8)'"
  );
  border-radius: 12px;
  transition: all 0.2s ease;
}

.interaction-item:hover {
  background: v-bind(
    "isDark ? 'rgba(55, 65, 81, 0.6)' : 'rgba(229, 231, 235, 0.9)'"
  );
}

.interaction-icon {
  font-size: 18px;
}

.interaction-label {
  font-size: 11px;
  color: v-bind("isDark ? '#9ca3af' : '#6b7280'");
}

.interaction-value {
  font-size: 16px;
  font-weight: 700;
  color: v-bind("isDark ? '#f1f5f9' : '#1f2937'");
}

.interactions-total {
  text-align: center;
  font-size: 13px;
  color: v-bind("isDark ? '#9ca3af' : '#6b7280'");
}

.total-value {
  font-weight: 700;
  color: #10b981;
  font-size: 15px;
}

.state-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}

.state-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: v-bind(
    "isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(243, 244, 246, 0.6)'"
  );
  border-radius: 10px;
  transition: all 0.2s ease;
}

.state-item:hover {
  background: v-bind(
    "isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.8)'"
  );
}

.state-name {
  width: 60px;
  font-size: 13px;
  font-weight: 500;
  color: v-bind("isDark ? '#e2e8f0' : '#374151'");
  flex-shrink: 0;
}

.state-bar-bg {
  flex: 1;
  height: 8px;
  background: v-bind(
    "isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)'"
  );
  border-radius: 4px;
  overflow: hidden;
}

.state-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #06b6d4);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.state-count {
  width: 40px;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: v-bind("isDark ? '#a78bfa' : '#8b5cf6'");
  flex-shrink: 0;
}

.btn-reset {
  background: v-bind(
    "isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'"
  );
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-reset:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
}

/* 滚动条样式 */
.state-list::-webkit-scrollbar {
  width: 4px;
}

.state-list::-webkit-scrollbar-track {
  background: transparent;
}

.state-list::-webkit-scrollbar-thumb {
  background: v-bind(
    "isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.2)'"
  );
  border-radius: 2px;
}

.state-list::-webkit-scrollbar-thumb:hover {
  background: v-bind(
    "isDark ? 'rgba(167, 139, 250, 0.5)' : 'rgba(139, 92, 246, 0.4)'"
  );
}

/* ========================================
   重置确认弹窗样式
   ======================================== */
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 10002;
  display: flex;
  align-items: center;
  justify-content: center;
  background: v-bind("isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)'");
  backdrop-filter: blur(4px);
  pointer-events: auto !important;
}

.confirm-dialog {
  width: 320px;
  padding: 28px 24px 24px;
  border-radius: 24px;
  background: v-bind(
    "isDark ? 'rgba(35, 30, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)'"
  );
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px
      v-bind("isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'");
  text-align: center;
  pointer-events: auto !important;
  position: relative;
  overflow: hidden;
}

.confirm-dialog::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: radial-gradient(
    ellipse at center top,
    v-bind("isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'") 0%,
    transparent 70%
  );
  pointer-events: none;
}

.confirm-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.confirm-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(251, 191, 36, 0.15),
    rgba(245, 158, 11, 0.1)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  animation: icon-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-icon {
  font-size: 32px;
}

.icon-pulse {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid rgba(251, 191, 36, 0.3);
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes icon-bounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.confirm-content {
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.confirm-title {
  font-size: 18px;
  font-weight: 700;
  color: v-bind("isDark ? '#f1f5f9' : '#1f2937'");
  margin: 0 0 8px;
  letter-spacing: 0.3px;
}

.confirm-message {
  font-size: 14px;
  color: v-bind("isDark ? '#9ca3af' : '#6b7280'");
  margin: 0;
  line-height: 1.6;
}

.confirm-warning {
  color: #ef4444;
  font-weight: 500;
}

.confirm-buttons {
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.confirm-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-cancel {
  background: v-bind(
    "isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(156, 163, 175, 0.15)'"
  );
  color: v-bind("isDark ? '#9ca3af' : '#6b7280'");
}

.confirm-cancel:hover {
  background: v-bind(
    "isDark ? 'rgba(107, 114, 128, 0.3)' : 'rgba(156, 163, 175, 0.25)'"
  );
  transform: translateY(-2px);
}

.confirm-ok {
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
}

.confirm-ok:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45);
}

.confirm-ok:active {
  transform: translateY(0);
}

/* 确认弹窗动画 */
.confirm-pop-enter-active {
  animation: confirm-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-pop-leave-active {
  animation: confirm-out 0.2s ease-in;
}

@keyframes confirm-in {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes confirm-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.95);
  }
}
</style>
