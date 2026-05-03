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
  coinGainAmount,
  quickPanelVisible,
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
import { isDark, initTheme, cleanupTheme } from "./composables/theme";
import { initStats, cleanupStats } from "./composables/stats";
import { initPetShape } from "./composables/petShapeStorage";
import { getShapeConfig, getShapeComponent } from "./shapes";
import { STATE_EFFECTS } from "./effectsMap";
import { WORK_STATES, UNINTERRUPTIBLE_STATES } from "./constants";
import {
  useAttributeRef,
  useFood,
  useBathItem,
  startWork,
  getAffordableWorkStates,
} from "./composables/attributes";
import {
  getAttributeCap,
  FOOD_CONFIGS,
  BATH_CONFIGS,
  WORK_INCOME,
} from "./composables/attributeStorage";
import type { BathType } from "./types";
import WeatherBackground from "./WeatherBackground.vue";
import WorkProgressBar from "./effects/WorkProgressBar.vue";
import CoinGainEffects from "./effects/CoinGainEffects.vue";
import QuickActionPanel from "./QuickActionPanel.vue";
import Footprints from "./footprints/index.vue";
import DialogueBubble from "./dialogue/index.vue";
import ContextMenu from "./contextMenu/index.vue";
import ScheduleModal from "./schedule/index.vue";
import StatsModal from "./stats/index.vue";
import AttributeModal from "./attributes/index.vue";
import ShopModal from "./shop/index.vue";
import WarehouseModal from "./warehouse/index.vue";
import ChatPanel from "./ChatPanel/index.vue";
import SettingsModal from "./settings/index.vue";
import { randomPick } from "./utils/random";
import { initSpeech, cleanupSpeech } from "./composables/speech";
import {
  initSettings,
  settings,
  petSizePixels,
  opacityValue,
} from "./composables/settings";
import {
  scheduleModal,
  statsModal,
  attributeModal,
  shopModal,
  warehouseModal,
  chatModal,
  settingsModal,
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
import "./shapes/chick/styles.css";
import "./shapes/dog/styles.css";
import "./shapes/penguin/styles.css";
import "./shapes/frog/styles.css";

// 食物类型列表（调试面板使用）
const foodTypes = Object.keys(FOOD_CONFIGS) as FoodType[];

// 调试面板打开时，进入 eating 状态随机选择食物
watch(petState, (newState) => {
  if (newState === "eating" && isDebugPanelOpen.value) {
    currentFood.value = randomPick(foodTypes);
  }
});

// ===== 快捷操作面板 =====

// 属性上限
const attributeCap = computed(() => getAttributeCap(attrData.value.level));

// 是否有可用食物
const canFeed = computed(() => {
  const inv = attrData.value.foodInventory;
  return Object.values(inv).some((count) => count > 0);
});

// 是否有可用沐浴露
const canBath = computed(() => {
  const inv = attrData.value.bathInventory;
  return Object.values(inv).some((count) => count > 0);
});

// 是否可以打工
const canQuickWork = computed(() => {
  return getAffordableWorkStates(WORK_STATES).length > 0;
});

// 双击时显示快捷面板（覆盖原 handlePetDoubleClick）
const onPetDoubleClick = () => {
  handlePetDoubleClick();
  // 不可打断状态下不弹出
  if (UNINTERRUPTIBLE_STATES.includes(petState.value)) return;
  // 睡眠中不弹出
  if (petState.value === "sleeping" || petState.value === "sleepy") return;
  quickPanelVisible.value = true;
};

// 单击/双击区分：延迟单击执行，双击时取消单击
let clickTimer: ReturnType<typeof setTimeout> | null = null;
const DBLCLICK_DELAY = 250;

const onPetClick = () => {
  if (clickTimer) {
    // 双击：取消单击，执行双击
    clearTimeout(clickTimer);
    clickTimer = null;
    onPetDoubleClick();
  } else {
    // 首次点击：延迟执行单击
    clickTimer = setTimeout(() => {
      clickTimer = null;
      handlePetClick();
    }, DBLCLICK_DELAY);
  }
};

// 快捷喂食 - 选库存中恢复值最高的食物
const quickFeed = () => {
  const inv = attrData.value.foodInventory;
  let bestFood: FoodType | null = null;
  let bestRestore = -1;
  for (const [type, count] of Object.entries(inv)) {
    if (count > 0) {
      const config = FOOD_CONFIGS[type as FoodType];
      if (config && config.satietyRestore > bestRestore) {
        bestRestore = config.satietyRestore;
        bestFood = type as FoodType;
      }
    }
  }
  if (bestFood) useFood(bestFood);
};

// 快捷清洗 - 选库存中恢复值最高的沐浴露
const quickBath = () => {
  const inv = attrData.value.bathInventory;
  let bestBath: BathType | null = null;
  let bestRestore = -1;
  for (const [type, count] of Object.entries(inv)) {
    if (count > 0) {
      const config = BATH_CONFIGS[type as BathType];
      if (config && config.cleanlinessRestore > bestRestore) {
        bestRestore = config.cleanlinessRestore;
        bestBath = type as BathType;
      }
    }
  }
  if (bestBath) useBathItem(bestBath);
};

// 快捷打工 - 选收入最高且体力足够的工作
const quickWork = () => {
  const affordable = getAffordableWorkStates(WORK_STATES);
  if (affordable.length === 0) return;
  // 按收入排序，选最高的
  const sorted = [...affordable].sort(
    (a, b) => (WORK_INCOME[b] ?? 0) - (WORK_INCOME[a] ?? 0),
  );
  startWork(sorted[0]);
};

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

  // 初始化设置（在主题之前，因为设置中包含主题）
  initSettings();

  // 初始化主题
  initTheme();

  // 初始化宠物形态
  initPetShape();

  // 初始化宠物
  initPet();

  // 初始化统计
  initStats();

  // 初始化语音系统
  initSpeech();
});

// 清理
onBeforeUnmount(() => {
  cleanupPet();
  cleanupStats();
  cleanupTheme();
  cleanupSpeech();
  // 清理点击定时器
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
  }
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

// 金币特效播放完毕
const onCoinGainComplete = () => {
  coinGainAmount.value = null;
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
    :style="{
      '--pet-opacity': opacityValue,
    }"
  >
    <!-- 脚印 -->
    <Footprints
      v-if="settings.showFootprints"
      :footprints="footprints"
      :color="petColors.footprint"
    />

    <!-- 宠物容器 -->
    <div
      class="pet-container"
      :class="{ 'is-dragging': isDragging }"
      :style="{
        left: `${position.x}px`,
        top: `${position.y}px`,
        '--pet-size': `${petSizePixels}px`,
        opacity: opacityValue,
      }"
      @mousedown="handleDragStart"
      @click="onPetClick"
      @contextmenu="handleContextMenu"
      title="拖动：移动位置 | 单击：互动 | 右键：菜单"
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

      <!-- 金币增长特效 -->
      <CoinGainEffects
        v-if="coinGainAmount !== null"
        :amount="coinGainAmount"
        @complete="onCoinGainComplete"
      />

      <!-- 快捷操作面板 -->
      <QuickActionPanel
        :visible="quickPanelVisible"
        :satiety="attrData.satiety"
        :cleanliness="attrData.cleanliness"
        :stamina="attrData.stamina"
        :health="attrData.health"
        :attribute-cap="attributeCap"
        :can-feed="canFeed"
        :can-bath="canBath"
        :can-work="canQuickWork"
        @close="quickPanelVisible = false"
        @feed="quickFeed"
        @bath="quickBath"
        @work="quickWork"
      />
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
      @open-chat="chatModal.open"
      @open-settings="settingsModal.open"
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

    <!-- AI 聊天面板 -->
    <ChatPanel />

    <!-- 设置弹窗 -->
    <SettingsModal
      :visible="settingsModal.visible.value"
      @close="settingsModal.close"
    />
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
