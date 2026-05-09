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
  showParachute,
  showSwing,
  isCharging,
  chargeProgress,
  type FoodType,
} from "./composables/sharedState";
// 函数从 usePetState 导入
import {
  handlePetClick,
  handlePetDoubleClick,
  handleDragStart,
  initScreenSize,
  initPet,
  cleanupPet,
  toggleSwing,
} from "./composables/petController";
import {
  startCharging,
  endCharging,
  isFlyingState,
} from "./composables/launchController";
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
import ParachuteEffect from "./effects/ParachuteEffect.vue";
import SwingEffect from "./effects/SwingEffect.vue";
import ChargeIndicator from "./effects/ChargeIndicator.vue";
import LaunchEffects from "./effects/LaunchEffects.vue";
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
  // 不可打断状态下不弹出（打工、吃东西、洗澡、发射、降落伞）
  if (UNINTERRUPTIBLE_STATES.includes(petState.value)) return;
  // 睡眠中不弹出
  if (petState.value === "sleeping" || petState.value === "sleepy") return;
  quickPanelVisible.value = true;
};

// 单击/双击区分：延迟单击执行，双击时取消单击
let clickTimer: ReturnType<typeof setTimeout> | null = null;
const DBLCLICK_DELAY = 250;

const onPetClick = () => {
  // 荡秋千时只响应双击打开面板，不响应单击
  if (showSwing.value) {
    if (clickTimer) {
      // 双击
      clearTimeout(clickTimer);
      clickTimer = null;
      onPetDoubleClick();
    } else {
      clickTimer = setTimeout(() => {
        clickTimer = null;
        // 单击不做任何事
      }, DBLCLICK_DELAY);
    }
    return;
  }
  // 不可打断状态时不响应点击
  if (UNINTERRUPTIBLE_STATES.includes(petState.value)) return;

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

// ===== 蓄力发射相关 =====

// 记录鼠标按下的初始位置
let chargeStartPos = { x: 0, y: 0 };
// 拖拽阈值（像素）
const DRAG_THRESHOLD = 10;
// 是否处于"允许拖拽检测"模式（鼠标按下后）
let isMouseDown = false;

// 处理 mousedown - 开始蓄力或允许拖拽
const onPetMouseDown = (e: MouseEvent) => {
  // 只响应左键
  if (e.button !== 0) return;

  // 荡秋千时不处理
  if (showSwing.value) return;

  // 飞行状态中不处理
  if (isFlyingState()) return;

  // 记录按下位置（用于拖拽检测）
  chargeStartPos = { x: e.clientX, y: e.clientY };
  isMouseDown = true;

  // 不可打断状态时，只允许拖拽，不允许蓄力发射
  if (UNINTERRUPTIBLE_STATES.includes(petState.value)) {
    return;
  }

  // 开始蓄力
  startCharging();
};

// 处理 mousemove - 检测是否拖拽
const onPetMouseMove = (e: MouseEvent) => {
  // 如果不是鼠标按下状态或已经在拖拽，不做处理
  if (!isMouseDown || isDragging.value) return;

  // 计算移动距离
  const dx = e.clientX - chargeStartPos.x;
  const dy = e.clientY - chargeStartPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 超过阈值，开始拖拽
  if (distance > DRAG_THRESHOLD) {
    // 结束蓄力（如果正在蓄力）
    if (isCharging.value) {
      endCharging();
    }
    // 创建一个模拟的 mousedown 事件来触发拖拽
    const mockEvent = {
      ...e,
      button: 0,
      clientX: chargeStartPos.x,
      clientY: chargeStartPos.y,
    } as MouseEvent;
    handleDragStart(mockEvent);
  }
};

// 处理 mouseup - 结束蓄力
const onPetMouseUp = (e: MouseEvent) => {
  // 只响应左键
  if (e.button !== 0) return;

  // 重置鼠标按下状态
  isMouseDown = false;

  // 如果正在蓄力，结束蓄力
  if (isCharging.value) {
    endCharging();
  }
};

// 处理 mouseleave - 取消蓄力
const onPetMouseLeave = () => {
  // 重置鼠标按下状态
  isMouseDown = false;

  // 如果正在蓄力，取消蓄力
  if (isCharging.value) {
    endCharging();
  }
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
      :class="{
        'is-dragging': isDragging,
        'is-charging': isCharging,
        'is-swinging': showSwing,
      }"
      :style="{
        left: `${position.x}px`,
        top: `${position.y}px`,
        '--pet-size': `${petSizePixels}px`,
        opacity: opacityValue,
      }"
      @mousedown="onPetMouseDown"
      @mousemove="onPetMouseMove"
      @mouseup="onPetMouseUp"
      @mouseleave="onPetMouseLeave"
      @click="onPetClick"
      @contextmenu="handleContextMenu"
      title="长按：蓄力发射 | 单击：互动 | 右键：菜单"
    >
      <!-- 阴影（飞行时隐藏） -->
      <div
        v-if="petState !== 'launching' && petState !== 'parachuting'"
        class="pet-shadow"
      ></div>

      <!-- 形态组件 -->
      <component
        :is="currentShapeComponent"
        :pet-state="petState"
        :pet-direction="petDirection"
        :equipped-decorations="equippedDecorations"
      />

      <!-- 状态效果组件 -->
      <component v-if="currentEffectComponent" :is="currentEffectComponent" />

      <!-- 蓄力指示器（蓄力进度超过10%时才显示，避免单击时闪烁） -->
      <ChargeIndicator v-if="isCharging && chargeProgress > 0.1" />

      <!-- 发射效果 -->
      <LaunchEffects v-if="petState === 'launching'" />

      <!-- 降落伞效果 -->
      <ParachuteEffect v-if="showParachute" />

      <!-- 秋千效果 -->
      <SwingEffect v-if="showSwing" />

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
        :is-swinging="showSwing"
        @close="quickPanelVisible = false"
        @feed="quickFeed"
        @bath="quickBath"
        @work="quickWork"
        @swing="toggleSwing"
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

/* 蓄力状态样式 */
.pet-container.is-charging {
  animation: charging-pulse 0.3s ease-in-out infinite;
}

@keyframes charging-pulse {
  0%,
  100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.1);
  }
}

/* 秋千摇摆状态样式 */
.pet-container.is-swinging {
  animation: swing-forward-back 3s ease-in-out infinite;
}

@keyframes swing-forward-back {
  0%,
  100% {
    transform: translateY(-6px) scale(0.97);
  }
  50% {
    transform: translateY(6px) scale(1.03);
  }
}
</style>
