<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, watch } from "vue";
// 状态变量从 sharedState 导入
import {
  petState,
  petDirection,
  position,
  isVisible,
  isDragging,
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
import { initPetShape } from "./composables/petShapeStorage";
import { getShapeConfig, getShapeComponent } from "./shapes";
import { STATE_EFFECTS } from "./effectsMap";
import { WORK_STATES } from "./constants";
import { useAttributeRef } from "./composables/attributes";
import WeatherBackground from "./WeatherBackground.vue";
import WorkProgressBar from "./effects/WorkProgressBar.vue";
import Footprints from "./footprints/index.vue";
import DialogueBubble from "./dialogue/index.vue";
import ContextMenu from "./contextMenu/index.vue";
import ScheduleModal from "./schedule/index.vue";
import StatsModal from "./stats/index.vue";
import AttributeModal from "./attributes/index.vue";
import ShopModal from "./shop/index.vue";
import WarehouseModal from "./warehouse/index.vue";
import { FOOD_CONFIGS } from "./composables/attributeStorage";
import {
  scheduleModal,
  statsModal,
  attributeModal,
  shopModal,
  warehouseModal,
  contextMenuVisible,
  contextMenuX,
  contextMenuY,
  closeContextMenu,
  openContextMenu,
} from "./composables/useModal";
import "./shapes/base.css";
import "./shapes/cloud/styles.css";
import "./shapes/cat/styles.css";
import "./shapes/panda/styles.css";
import "./shapes/rabbit/styles.css";

// 食物类型列表（调试面板使用）
const foodTypes = Object.keys(FOOD_CONFIGS) as FoodType[];

// 调试面板打开时，进入 eating 状态随机选择食物
watch(petState, (newState) => {
  if (newState === "eating" && isDebugPanelOpen.value) {
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

// 装备的装饰
const attrData = useAttributeRef();
const equippedDecorations = computed(
  () => attrData.value.equippedDecorations || [],
);

// 对话气泡样式变体
const dialogueVariant = computed(() =>
  ["sleeping", "sleepy", "yawn"].includes(petState.value) ? "cloud" : "default",
);

// 当前效果组件
const currentEffectComponent = computed(() => {
  const state = petState.value;
  return STATE_EFFECTS[state] || null;
});

// 是否显示工作进度条
const showWorkProgressBar = computed(() => {
  return WORK_STATES.includes(petState.value);
});

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

// 右键菜单处理
const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  openContextMenu(e.clientX, e.clientY);
};

// 从属性面板打开商店
const openShopFromAttributes = () => {
  attributeModal.visible.value = false;
  shopModal.open();
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
        :equipped-decorations="equippedDecorations"
      />

      <!-- 状态效果组件 -->
      <component v-if="currentEffectComponent" :is="currentEffectComponent" />

      <!-- 工作进度条 -->
      <WorkProgressBar v-if="showWorkProgressBar" />
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
      @open-schedule="scheduleModal.open"
      @open-shop="shopModal.open"
      @open-warehouse="warehouseModal.open"
      @open-attributes="attributeModal.open"
      @open-stats="statsModal.open"
    />

    <!-- 作息配置弹窗 -->
    <ScheduleModal
      :visible="scheduleModal.visible.value"
      @close="scheduleModal.close"
    />

    <!-- 属性面板弹窗 -->
    <AttributeModal
      :visible="attributeModal.visible.value"
      @close="attributeModal.close"
      @open-shop="openShopFromAttributes"
    />

    <!-- 商店弹窗 -->
    <ShopModal :visible="shopModal.visible.value" @close="shopModal.close" />

    <!-- 仓库弹窗 -->
    <WarehouseModal
      :visible="warehouseModal.visible.value"
      @close="warehouseModal.close"
    />

    <!-- 数据统计弹窗 -->
    <StatsModal :visible="statsModal.visible.value" @close="statsModal.close" />
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
