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
  currentPetShape,
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
import { initPetShape } from "./composables/petShapeStorage";
import { getShapeConfig, getShapeComponent } from "./shapes";
import WeatherBackground from "./WeatherBackground.vue";
import EatingEffects from "./EatingEffects.vue";
// 效果组件
import SleepBubble from "./effects/SleepBubble.vue";
import HappyEffects from "./effects/HappyEffects.vue";
import AngryEffects from "./effects/AngryEffects.vue";
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
import ContextMenu from "./contextMenu/index.vue";
import ScheduleModal from "./schedule/index.vue";
import StatsModal from "./stats/index.vue";
import "./shapes/base.css";
import "./shapes/cloud/styles.css";
import "./shapes/cat/styles.css";

// 食物类型列表
const foodTypes: FoodType[] = ["apple", "fish", "cake", "lollipop"];

// 当进入 eating 状态时随机选择食物（调试面板打开时不随机，保留用户选择）
watch(petState, (newState) => {
  if (newState === "eating" && !isDebugPanelOpen.value) {
    const randomIndex = Math.floor(Math.random() * foodTypes.length);
    currentFood.value = foodTypes[randomIndex];
  }
});

// 宠物颜色 - 根据主题和形态变化
const petColors = computed(() => {
  const isAngry = petState.value === "angry";
  const shapeConfig = getShapeConfig(currentPetShape.value);

  return {
    body: isAngry
      ? "#ef4444"
      : isDark.value
        ? shapeConfig.colors.body.dark
        : shapeConfig.colors.body.light,
    bodyGradient: isAngry
      ? "#f87171"
      : isDark.value
        ? shapeConfig.colors.bodyGradient.dark
        : shapeConfig.colors.bodyGradient.light,
    face: isDark.value
      ? shapeConfig.colors.face.dark
      : shapeConfig.colors.face.light,
    eyes: isDark.value
      ? shapeConfig.colors.eyes.dark
      : shapeConfig.colors.eyes.light,
    cheeks: isDark.value
      ? shapeConfig.colors.cheeks.dark
      : shapeConfig.colors.cheeks.light,
    shadow: isDark.value
      ? shapeConfig.colors.shadow.dark
      : shapeConfig.colors.shadow.light,
    footprint: isDark.value
      ? shapeConfig.colors.footprint.dark
      : shapeConfig.colors.footprint.light,
    angryFace: shapeConfig.colors.angryFace || "#7f1d1d",
  };
});

// 当前形态组件
const currentShapeComponent = computed(() =>
  getShapeComponent(currentPetShape.value),
);

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

  // 初始化宠物形态
  initPetShape();

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
</script>

<template>
  <!-- 天气背景 -->
  <WeatherBackground />

  <div
    v-if="isVisible"
    class="desktop-pet"
    :class="[
      `pet-${petState}`,
      `pet-${petDirection}`,
      `pet-shape-${currentPetShape}`,
    ]"
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

      <!-- 形态组件 -->
      <component
        :is="currentShapeComponent"
        :pet-state="petState"
        :pet-direction="petDirection"
      />

      <!-- 睡眠气泡 -->
      <SleepBubble v-if="petState === 'sleeping'" />

      <!-- 开心效果 -->
      <HappyEffects v-if="petState === 'happy'" />

      <!-- 生气效果 -->
      <AngryEffects v-if="petState === 'angry'" />

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
    <ContextMenu
      :visible="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      @close="closeContextMenu"
      @open-schedule="openScheduleModal"
      @open-stats="openStatsModal"
    />

    <!-- 作息配置弹窗 -->
    <ScheduleModal
      :visible="scheduleModalVisible"
      @close="closeScheduleModal"
    />

    <!-- 数据统计弹窗 -->
    <StatsModal :visible="statsModalVisible" @close="closeStatsModal" />
  </div>
</template>

<style>
/* CSS 变量定义 - 供形态组件使用 */
.desktop-pet {
  --pet-body: v-bind("petColors.body");
  --pet-body-gradient: v-bind("petColors.bodyGradient");
  --pet-face: v-bind("petColors.face");
  --pet-eyes: v-bind("petColors.eyes");
  --pet-cheeks: v-bind("petColors.cheeks");
  --pet-shadow: v-bind("petColors.shadow");
  --pet-footprint: v-bind("petColors.footprint");
}
</style>
