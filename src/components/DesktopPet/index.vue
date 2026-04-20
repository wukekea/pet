<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
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
import { isDark, initTheme } from "./composables/theme";
import { initStats, cleanupStats } from "./composables/stats";
import { setPassthrough } from "./composables/passthrough";
import WeatherBackground from "./WeatherBackground.vue";
import EatingEffects from "./EatingEffects.vue";
// 效果组件
import SleepBubble from "./effects/SleepBubble.vue";
import HappyEffects from "./effects/HappyEffects.vue";
import DizzyEffects from "./effects/DizzyEffects.vue";
import ScaredEffects from "./effects/ScaredEffects.vue";
import ThinkingEffects from "./effects/ThinkingEffects.vue";
import SmugEffects from "./effects/SmugEffects.vue";
import ShyEffects from "./effects/ShyEffects.vue";
import ConfusedEffects from "./effects/ConfusedEffects.vue";
import HelloEffects from "./effects/HelloEffects.vue";
import SneezeEffects from "./effects/SneezeEffects.vue";
import GrinEffects from "./effects/GrinEffects.vue";
import ScratchEffects from "./effects/ScratchEffects.vue";
import CelebrateEffects from "./effects/CelebrateEffects.vue";
import PeekEffects from "./effects/PeekEffects.vue";
import DancingEffects from "./effects/DancingEffects.vue";
import RollingEffects from "./effects/RollingEffects.vue";
import YawnEffects from "./effects/YawnEffects.vue";
import SleepyEffects from "./effects/SleepyEffects.vue";
import SleepwalkingEffects from "./effects/SleepwalkingEffects.vue";
import StretchEffects from "./effects/StretchEffects.vue";
import BathingEffects from "./effects/BathingEffects.vue";
import Footprints from "./footprints/index.vue";
import DialogueBubble from "./dialogue/index.vue";
import ScheduleModal from "./schedule/index.vue";
import StatsModal from "./stats/index.vue";
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

// 对话气泡样式变体
const dialogueVariant = computed(() =>
  ["sleeping", "sleepy", "yawn"].includes(petState.value) ? "cloud" : "default",
);

// 初始化
onMounted(async () => {
  // 初始化屏幕尺寸
  await initScreenSize();

  // 初始化主题
  initTheme();

  // 初始化宠物
  initPet();

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

// 数据统计弹窗状态
const statsModalVisible = ref(false);

// 打开右键菜单
const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setPassthrough(false);
  isContextMenuOpen.value = true;
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;
  contextMenuVisible.value = true;
};

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false;
  isContextMenuOpen.value = false;
  if (!scheduleModalVisible.value && !statsModalVisible.value) {
    setPassthrough(true);
  }
};

// 打开作息配置弹窗
const openScheduleModal = () => {
  setPassthrough(false);
  isScheduleModalOpen.value = true;
  contextMenuVisible.value = false;
  isContextMenuOpen.value = false;
  scheduleModalVisible.value = true;
};

// 关闭作息配置弹窗
const closeScheduleModal = () => {
  scheduleModalVisible.value = false;
};

// 打开数据统计弹窗
const openStatsModal = () => {
  setPassthrough(false);
  isStatsModalOpen.value = true;
  contextMenuVisible.value = false;
  isContextMenuOpen.value = false;
  statsModalVisible.value = true;
};

// 关闭数据统计弹窗
const closeStatsModal = () => {
  statsModalVisible.value = false;
};

// 点击其他地方关闭菜单
const handleGlobalClick = () => {
  if (contextMenuVisible.value) {
    closeContextMenu();
  }
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
    <!-- 脚印 -->
    <Footprints :footprints="footprints" :color="petColors.footprint" />

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
      <SleepBubble v-if="petState === 'sleeping'" />

      <!-- 开心效果 -->
      <HappyEffects v-if="petState === 'happy'" />

      <!-- 晕眩效果（摔倒时显示） -->
      <DizzyEffects v-if="petState === 'fallen'" />

      <!-- 惊吓效果 -->
      <ScaredEffects v-if="petState === 'scared'" />

      <!-- 思考效果 -->
      <ThinkingEffects v-if="petState === 'thinking'" />

      <!-- 得意效果 -->
      <SmugEffects v-if="petState === 'smug'" />

      <!-- 害羞效果 -->
      <ShyEffects v-if="petState === 'shy'" />

      <!-- 疑惑效果 -->
      <ConfusedEffects v-if="petState === 'confused'" />

      <!-- 打招呼效果 -->
      <HelloEffects v-if="petState === 'hello'" />

      <!-- 打喷嚏效果 -->
      <SneezeEffects v-if="petState === 'sneeze'" />

      <!-- 坏笑效果 -->
      <GrinEffects v-if="petState === 'grin'" />

      <!-- 挠头效果 -->
      <ScratchEffects v-if="petState === 'scratch'" />

      <!-- 跳跃庆祝效果 -->
      <CelebrateEffects v-if="petState === 'celebrate'" />

      <!-- 偷看效果 -->
      <PeekEffects v-if="petState === 'peek'" />

      <!-- 跳舞效果 -->
      <DancingEffects v-if="petState === 'dancing'" />

      <!-- 翻滚效果 -->
      <RollingEffects v-if="petState === 'rolling'" />

      <!-- 打哈欠效果 -->
      <YawnEffects v-if="petState === 'yawn'" />

      <!-- 睡眼朦胧效果 -->
      <SleepyEffects v-if="petState === 'sleepy'" />

      <!-- 睡眠行走效果 -->
      <SleepwalkingEffects v-if="petState === 'sleepwalking'" />

      <!-- 伸懒腰效果 -->
      <StretchEffects v-if="petState === 'stretch'" />

      <!-- 洗澡效果 -->
      <BathingEffects v-if="petState === 'bathing'" />

      <!-- 吃东西效果 -->
      <EatingEffects v-if="petState === 'eating'" />
    </div>

    <!-- 对话气泡 -->
    <DialogueBubble
      :variant="dialogueVariant"
      :x="position.x"
      :y="position.y"
      :direction="petDirection"
    />

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
      <ScheduleModal
        :visible="scheduleModalVisible"
        @close="closeScheduleModal"
      />

      <!-- 数据统计弹窗 -->
      <StatsModal :visible="statsModalVisible" @close="closeStatsModal" />
    </Teleport>
  </div>
</template>

<style scoped>
/* 动态颜色绑定 - 需要使用 v-bind */
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
</style>
