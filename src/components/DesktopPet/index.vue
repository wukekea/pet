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
  isAttributeModalOpen,
  isShopModalOpen,
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
import { STATE_EFFECTS, WORK_STATE_WITH_PROGRESS } from "./effectsMap";
import WeatherBackground from "./WeatherBackground.vue";
import WorkProgressBar from "./effects/WorkProgressBar.vue";
import Footprints from "./footprints/index.vue";
import DialogueBubble from "./dialogue/index.vue";
import ContextMenu from "./contextMenu/index.vue";
import ScheduleModal from "./schedule/index.vue";
import StatsModal from "./stats/index.vue";
import AttributeModal from "./attributes/index.vue";
import ShopModal from "./shop/index.vue";
import { FOOD_CONFIGS } from "./composables/attributeStorage";
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
  return WORK_STATE_WITH_PROGRESS.includes(petState.value);
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

// 右键菜单状态
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

// 作息配置弹窗状态
const scheduleModalVisible = ref(false);

// 数据统计弹窗状态
const statsModalVisible = ref(false);

// 属性面板弹窗状态
const attributeModalVisible = ref(false);

// 商店弹窗状态
const shopModalVisible = ref(false);

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
  if (
    !scheduleModalVisible.value &&
    !statsModalVisible.value &&
    !attributeModalVisible.value &&
    !shopModalVisible.value
  ) {
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

// 打开属性面板弹窗
const openAttributeModal = () => {
  setPassthrough(false);
  isAttributeModalOpen.value = true;
  contextMenuVisible.value = false;
  isContextMenuOpen.value = false;
  attributeModalVisible.value = true;
};

// 关闭属性面板弹窗
const closeAttributeModal = () => {
  attributeModalVisible.value = false;
};

// 打开商店弹窗
const openShopModal = () => {
  setPassthrough(false);
  isShopModalOpen.value = true;
  contextMenuVisible.value = false;
  isContextMenuOpen.value = false;
  shopModalVisible.value = true;
};

// 关闭商店弹窗
const closeShopModal = () => {
  shopModalVisible.value = false;
};

// 从属性面板打开商店
const openShopFromAttributes = () => {
  attributeModalVisible.value = false;
  openShopModal();
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
      @open-schedule="openScheduleModal"
      @open-shop="openShopModal"
      @open-attributes="openAttributeModal"
      @open-stats="openStatsModal"
    />

    <!-- 作息配置弹窗 -->
    <ScheduleModal
      :visible="scheduleModalVisible"
      @close="closeScheduleModal"
    />

    <!-- 属性面板弹窗 -->
    <AttributeModal
      :visible="attributeModalVisible"
      @close="closeAttributeModal"
      @open-shop="openShopFromAttributes"
    />

    <!-- 商店弹窗 -->
    <ShopModal :visible="shopModalVisible" @close="closeShopModal" />

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
