<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import {
  changeState,
  isWorkState,
  stopWork,
} from "../DesktopPet/composables/petController";
import {
  useAttributeRef,
  startWork,
} from "../DesktopPet/composables/attributes";
import {
  petState,
  isDebugPanelOpen,
  currentFood,
  currentBathType,
  currentPetShape,
  type FoodType,
  type BathType,
  type DecorationType,
  FOOD_ICONS,
  BATH_ICONS,
  DECORATION_ICONS,
} from "../DesktopPet/composables/sharedState";
import {
  isDark,
  themeMode,
  setThemeMode,
  type ThemeMode,
} from "../DesktopPet/composables/theme";
import {
  currentWeather,
  setWeather,
} from "../DesktopPet/composables/weatherState";
import { weatherStatus } from "../DesktopPet/composables/qweatherService";
import type { PetState } from "../DesktopPet/types";
import type { WeatherType } from "../DesktopPet/types";
import { setPassthrough } from "../DesktopPet/composables/passthrough";
import { savePetShape } from "../DesktopPet/composables/petShapeStorage";
import {
  FOOD_CONFIGS,
  BATH_CONFIGS,
  DECORATION_CONFIGS,
  DECORATION_SLOTS,
  MAX_EQUIPPED_DECORATIONS,
  saveAttributeData,
} from "../DesktopPet/composables/attributeStorage";
import { getShapeOptions } from "../DesktopPet/shapes";

// 属性数据（用于调试装饰装备）
const attributeData = useAttributeRef();

// 调试物品 Tab
type DebugItemTab = "food" | "bath" | "decoration";
const debugItemTab = ref<DebugItemTab>("food");

const debugTabOptions: { value: DebugItemTab; label: string; icon: string }[] =
  [
    { value: "food", label: "食物", icon: "🍖" },
    { value: "bath", label: "沐浴露", icon: "🛁" },
    { value: "decoration", label: "装饰", icon: "🎀" },
  ];

// 调试物品列表
const debugFoodItems = computed(() => Object.values(FOOD_CONFIGS));
const debugBathItems = computed(() => Object.values(BATH_CONFIGS));
const debugDecorationItems = computed(() => Object.values(DECORATION_CONFIGS));

// 当前装备的装饰（响应式）
const equippedDecorations = computed(
  () => attributeData.value.equippedDecorations,
);

// 判断装饰是否已装备
const isDecorationEquipped = (type: DecorationType) =>
  equippedDecorations.value.includes(type);

// 调试使用食物 - 仅触发动画，不加属性
const debugUseFood = (foodType: FoodType) => {
  currentFood.value = foodType;
  changeState("eating");
};

// 调试使用沐浴露 - 仅触发动画，不加属性
const debugUseBath = (bathType: BathType) => {
  currentBathType.value = bathType;
  changeState("bathing");
};

// 调试切换装饰装备 - 直接修改，不检查拥有/槽位限制
const debugToggleDecoration = (decorationType: DecorationType) => {
  const data = attributeData.value;
  const equipped = [...data.equippedDecorations];

  if (equipped.includes(decorationType)) {
    // 卸下
    data.equippedDecorations = equipped.filter((d) => d !== decorationType);
  } else {
    // 装备：先移除同槽位的装饰，再添加
    const slot = DECORATION_SLOTS[decorationType];
    const filtered = equipped.filter(
      (d) => DECORATION_SLOTS[d as DecorationType] !== slot,
    );
    if (filtered.length < MAX_EQUIPPED_DECORATIONS) {
      filtered.push(decorationType);
    }
    data.equippedDecorations = filtered;
  }

  saveAttributeData(data);
};

// 面板可见性
const isVisible = ref(false);

// 拖拽状态
const isDragging = ref(false);
const position = ref({ x: 20, y: 80 });
const dragOffset = ref({ x: 0, y: 0 });

// 当前选中的状态
const activeState = computed(() => petState.value);

// 判断动作按钮是否高亮
const isActionActive = (action: {
  state: PetState;
  label: string;
  icon: string;
  food?: FoodType;
}) => {
  // 如果是吃东西动作，需要同时匹配状态和食物
  if (action.food) {
    return (
      activeState.value === action.state && currentFood.value === action.food
    );
  }
  // 普通动作只匹配状态
  return activeState.value === action.state;
};

// 宠物形态选项
const shapeOptions = getShapeOptions();

// 切换形态
const setPetShape = (shape: string) => {
  savePetShape(shape as any);
};

// 动作配置 - 带中文标签和分组
const actionGroups = [
  {
    name: "基础状态",
    actions: [
      { state: "idle" as PetState, label: "待机", icon: "◉" },
      { state: "walking" as PetState, label: "行走", icon: "→" },
      { state: "jumping" as PetState, label: "跳跃", icon: "↑" },
      { state: "sleeping" as PetState, label: "睡觉", icon: "zZ" },
    ],
  },
  {
    name: "情绪状态",
    actions: [
      { state: "happy" as PetState, label: "开心", icon: "♥" },
      { state: "crying" as PetState, label: "大哭", icon: "╥" },
      { state: "angry" as PetState, label: "生气", icon: "╬" },
      { state: "fallen" as PetState, label: "摔倒", icon: "◎" },
      { state: "scared" as PetState, label: "惊吓", icon: "!" },
    ],
  },
  {
    name: "表情状态",
    actions: [
      { state: "thinking" as PetState, label: "思考", icon: "?" },
      { state: "smug" as PetState, label: "得意", icon: "★" },
      { state: "shy" as PetState, label: "害羞", icon: "//" },
      { state: "confused" as PetState, label: "疑惑", icon: "?" },
      { state: "hello" as PetState, label: "招呼", icon: "⌒" },
      { state: "sneeze" as PetState, label: "喷嚏", icon: "~" },
      { state: "grin" as PetState, label: "坏笑", icon: "◡" },
      { state: "scratch" as PetState, label: "挠头", icon: "?" },
    ],
  },
  {
    name: "特殊状态",
    actions: [
      { state: "celebrate" as PetState, label: "庆祝", icon: "★" },
      { state: "peek" as PetState, label: "偷看", icon: "🤫" },
      { state: "chase" as PetState, label: "追逐", icon: "→" },
      { state: "dancing" as PetState, label: "跳舞", icon: "♪" },
      { state: "rolling" as PetState, label: "翻滚", icon: "↻" },
    ],
  },
  {
    name: "作息状态",
    actions: [
      { state: "yawn" as PetState, label: "哈欠", icon: "😴" },
      { state: "sleepy" as PetState, label: "朦胧", icon: "💤" },
      { state: "stretch" as PetState, label: "伸懒腰", icon: "✨" },
    ],
  },
  {
    name: "打工状态",
    actions: [
      { state: "brickCarrying" as PetState, label: "搬砖", icon: "🧱" },
      { state: "flyerDistributing" as PetState, label: "发传单", icon: "📄" },
      { state: "programmer" as PetState, label: "程序员", icon: "💻" },
    ],
  },
];

// 天气选项
const weatherOptions: { value: WeatherType; label: string; icon: string }[] = [
  { value: "default", label: "默认", icon: "○" },
  { value: "sunny", label: "晴天", icon: "☀️" },
  { value: "cloudy", label: "多云", icon: "☁️" },
  { value: "lightRain", label: "小雨", icon: "🌧️" },
  { value: "heavyRain", label: "暴雨", icon: "⛈️" },
  { value: "thunderstorm", label: "雷阵雨", icon: "🌩️" },
  { value: "lightSnow", label: "小雪", icon: "🌨️" },
  { value: "heavySnow", label: "大雪", icon: "❄️" },
];

// 主题选项
const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "system", label: "系统", icon: "💻" },
  { value: "light", label: "浅色", icon: "☀️" },
  { value: "dark", label: "深色", icon: "🌙" },
];

// 当前天气
const activeWeather = computed(() => currentWeather.value);

// 真实天气描述（API 返回）
const realWeatherText = computed(() => {
  const text = weatherStatus.value.weatherText;
  const temp = weatherStatus.value.weatherTemp;
  if (text && temp) {
    return `${text} ${temp}°C`;
  }
  return "未获取";
});

// 天气服务状态文本
const weatherStatusText = computed(() => {
  if (weatherStatus.value.isLoading) return "更新中...";
  if (weatherStatus.value.error) return `错误: ${weatherStatus.value.error}`;
  if (!weatherStatus.value.enabled) return "未启用";
  if (weatherStatus.value.lastUpdate) {
    const time = new Date(weatherStatus.value.lastUpdate).toLocaleTimeString();
    return `已更新 (${time})`;
  }
  return "等待更新";
});

// 触发状态
const triggerState = (state: PetState, food?: FoodType) => {
  // 如果指定了食物，先设置食物
  if (food) {
    currentFood.value = food;
  }
  // 打工状态需要通过 startWork 启动完整流程（计时器+工资）
  // 其他打工状态如果已经在打工中，先停止
  if (isWorkState(petState.value)) {
    stopWork();
  }
  if (isWorkState(state)) {
    startWork(state);
  } else {
    changeState(state);
  }
};

// 切换面板显示
const togglePanel = () => {
  isVisible.value = !isVisible.value;
  // 更新调试面板状态标志
  isDebugPanelOpen.value = isVisible.value;
  // 打开面板时禁用穿透，关闭时恢复穿透
  setPassthrough(!isVisible.value);
};

// 鼠标进入面板 - 禁用穿透
const handleMouseEnter = () => {
  setPassthrough(false);
};

// 鼠标离开面板 - 恢复穿透
const handleMouseLeave = () => {
  // 只有关闭面板时才恢复穿透
  if (!isVisible.value) {
    setPassthrough(true);
  }
};

// 拖拽开始
const handleDragStart = (e: MouseEvent) => {
  isDragging.value = true;
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y,
  };
  document.addEventListener("mousemove", handleDragging);
  document.addEventListener("mouseup", handleDragEnd);
};

// 拖拽中
const handleDragging = (e: MouseEvent) => {
  if (!isDragging.value) return;
  position.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y,
  };
};

// 拖拽结束
const handleDragEnd = () => {
  isDragging.value = false;
  document.removeEventListener("mousemove", handleDragging);
  document.removeEventListener("mouseup", handleDragEnd);
};

// 键盘快捷键
const handleKeydown = (e: KeyboardEvent) => {
  // Ctrl+D 切换面板
  if (e.ctrlKey && e.key.toLowerCase() === "d") {
    e.preventDefault();
    togglePanel();
  }
};

// 暴露给全局
onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
  // 挂载到 window 供外部调用
  (window as any).toggleDebugPanel = togglePanel;
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
  delete (window as any).toggleDebugPanel;
});

// 暴露方法
defineExpose({
  togglePanel,
  isVisible,
});
</script>

<template>
  <!-- 调试面板 -->
  <Transition name="panel-fade">
    <div
      v-if="isVisible"
      class="debug-panel"
      :class="{ 'dark-mode': isDark }"
      :style="{ left: `${position.x}px`, top: `${position.y}px` }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- 标题栏 - 可拖拽 -->
      <div class="panel-header" @mousedown="handleDragStart">
        <div class="panel-title">
          <span class="title-icon">⚙</span>
          <span class="title-text">调试控制台</span>
        </div>
        <button class="close-btn" @click="togglePanel" title="关闭 (Ctrl+D)">
          ✕
        </button>
      </div>

      <!-- 当前状态指示器 -->
      <div class="current-state">
        <span class="state-label">当前状态:</span>
        <span class="state-value">{{ activeState }}</span>
      </div>

      <!-- 天气信息 -->
      <div class="weather-info">
        <div class="weather-row">
          <span class="weather-label">📍 城市:</span>
          <span class="weather-value">{{
            weatherStatus.cityName || "未获取"
          }}</span>
        </div>
        <div class="weather-row">
          <span class="weather-label">🌤️ 天气:</span>
          <span class="weather-value">{{ realWeatherText }}</span>
        </div>
        <div class="weather-row">
          <span class="weather-label">🔄 状态:</span>
          <span
            class="weather-value"
            :class="weatherStatus.isLoading ? 'loading' : ''"
          >
            {{ weatherStatusText }}
          </span>
        </div>
      </div>

      <!-- 主题切换 -->
      <div class="theme-section">
        <div class="theme-title">🎨 主题模式</div>
        <div class="theme-buttons">
          <button
            v-for="theme in themeOptions"
            :key="theme.value"
            class="theme-btn"
            :class="{ active: themeMode === theme.value }"
            @click="setThemeMode(theme.value)"
            :title="theme.label"
          >
            <span class="theme-icon">{{ theme.icon }}</span>
            <span class="theme-label">{{ theme.label }}</span>
          </button>
        </div>
      </div>

      <!-- 动作分组 -->
      <div class="action-groups">
        <div
          v-for="group in actionGroups"
          :key="group.name"
          class="action-group"
        >
          <div class="group-title">{{ group.name }}</div>
          <div class="action-buttons">
            <button
              v-for="action in group.actions"
              :key="action.label"
              class="action-btn"
              :class="{ active: isActionActive(action) }"
              @click="triggerState(action.state, (action as any).food)"
              :title="action.label"
            >
              <span class="btn-icon">{{ action.icon }}</span>
              <span class="btn-label">{{ action.label }}</span>
            </button>
          </div>
        </div>

        <!-- 天气切换 -->
        <div class="action-group">
          <div class="group-title">天气效果</div>
          <div class="action-buttons">
            <button
              v-for="weather in weatherOptions"
              :key="weather.value"
              class="action-btn"
              :class="{ active: activeWeather === weather.value }"
              @click="setWeather(weather.value)"
              :title="weather.label"
            >
              <span class="btn-icon">{{ weather.icon }}</span>
              <span class="btn-label">{{ weather.label }}</span>
            </button>
          </div>
        </div>

        <!-- 宠物形态切换 -->
        <div class="action-group">
          <div class="group-title">宠物形态</div>
          <div class="action-buttons">
            <button
              v-for="shape in shapeOptions"
              :key="shape.value"
              class="action-btn"
              :class="{ active: currentPetShape === shape.value }"
              @click="setPetShape(shape.value)"
              :title="shape.label"
            >
              <span class="btn-icon">{{ shape.icon }}</span>
              <span class="btn-label">{{ shape.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 调试物品 -->
      <div class="debug-items-section">
        <div class="debug-items-title">
          🎒 调试物品 <span class="debug-items-hint">仅触发动画</span>
        </div>

        <!-- 分类 Tab -->
        <div class="debug-tab-bar">
          <button
            v-for="tab in debugTabOptions"
            :key="tab.value"
            class="debug-tab-btn"
            :class="{ active: debugItemTab === tab.value }"
            @click="debugItemTab = tab.value"
          >
            <span class="debug-tab-icon">{{ tab.icon }}</span>
            <span class="debug-tab-label">{{ tab.label }}</span>
          </button>
        </div>

        <!-- 食物列表 -->
        <div v-if="debugItemTab === 'food'" class="debug-item-grid">
          <button
            v-for="item in debugFoodItems"
            :key="item.type"
            class="debug-item-card"
            :class="{
              active: petState === 'eating' && currentFood === item.type,
            }"
            @click="debugUseFood(item.type)"
            :title="item.name"
          >
            <span class="debug-item-icon">{{ FOOD_ICONS[item.type] }}</span>
            <span class="debug-item-name">{{ item.name }}</span>
          </button>
        </div>

        <!-- 沐浴露列表 -->
        <div v-if="debugItemTab === 'bath'" class="debug-item-grid">
          <button
            v-for="item in debugBathItems"
            :key="item.type"
            class="debug-item-card"
            :class="{
              active: petState === 'bathing' && currentBathType === item.type,
            }"
            @click="debugUseBath(item.type)"
            :title="item.name"
          >
            <span class="debug-item-icon">{{ BATH_ICONS[item.type] }}</span>
            <span class="debug-item-name">{{ item.name }}</span>
          </button>
        </div>

        <!-- 装饰品列表 -->
        <div v-if="debugItemTab === 'decoration'" class="debug-item-grid">
          <button
            v-for="item in debugDecorationItems"
            :key="item.type"
            class="debug-item-card"
            :class="{ equipped: isDecorationEquipped(item.type) }"
            @click="debugToggleDecoration(item.type)"
            :title="item.name"
          >
            <span class="debug-item-icon">{{
              DECORATION_ICONS[item.type]
            }}</span>
            <span class="debug-item-name">{{ item.name }}</span>
            <span
              v-if="isDecorationEquipped(item.type)"
              class="debug-item-badge"
              >ON</span
            >
          </button>
        </div>
      </div>

      <!-- 底部提示 -->
      <div class="panel-footer">
        <span class="hint">按 Ctrl+D 切换面板</span>
        <span class="hint">拖拽标题栏移动</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ========================================
   调试面板 - 复古街机控制台风格
   ======================================== */

.debug-panel {
  position: fixed;
  z-index: 9999;
  min-width: 280px;
  max-width: 340px;
  border-radius: 16px;
  overflow: hidden;
  font-family: "SF Mono", "Consolas", "Liberation Mono", monospace;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(250, 245, 255, 0.95) 100%
  );
  backdrop-filter: blur(20px);
  user-select: none;
  pointer-events: auto !important;
}

/* 深色模式 */
.debug-panel.dark-mode {
  background: linear-gradient(
    135deg,
    rgba(30, 27, 45, 0.95) 0%,
    rgba(25, 23, 40, 0.95) 100%
  );
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(167, 139, 250, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* ========================================
   标题栏
   ======================================== */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.15) 0%,
    rgba(167, 139, 250, 0.1) 100%
  );
  cursor: grab;
  border-bottom: 1px solid rgba(139, 92, 246, 0.15);
}

.dark-mode .panel-header {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.2) 0%,
    rgba(167, 139, 250, 0.15) 100%
  );
  border-bottom-color: rgba(167, 139, 250, 0.2);
}

.panel-header:active {
  cursor: grabbing;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 16px;
  opacity: 0.8;
}

.title-text {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #6d28d9;
}

.dark-mode .title-text {
  color: #c4b5fd;
}

.close-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

.dark-mode .close-btn {
  background: rgba(239, 68, 68, 0.15);
}

/* ========================================
   当前状态指示器
   ======================================== */
.current-state {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(
    90deg,
    rgba(139, 92, 246, 0.08) 0%,
    transparent 100%
  );
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
}

.dark-mode .current-state {
  background: linear-gradient(
    90deg,
    rgba(139, 92, 246, 0.12) 0%,
    transparent 100%
  );
  border-bottom-color: rgba(167, 139, 250, 0.15);
}

.state-label {
  font-size: 11px;
  color: #9ca3af;
  letter-spacing: 0.3px;
}

.state-value {
  font-size: 12px;
  font-weight: 600;
  color: #7c3aed;
  background: rgba(139, 92, 246, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-variant: small-caps;
}

.dark-mode .state-value {
  color: #a78bfa;
  background: rgba(167, 139, 250, 0.15);
}

/* ========================================
   天气信息
   ======================================== */
.weather-info {
  padding: 10px 16px;
  background: linear-gradient(
    90deg,
    rgba(34, 197, 94, 0.08) 0%,
    transparent 100%
  );
  border-bottom: 1px solid rgba(34, 197, 94, 0.1);
}

.dark-mode .weather-info {
  background: linear-gradient(
    90deg,
    rgba(34, 197, 94, 0.12) 0%,
    transparent 100%
  );
  border-bottom-color: rgba(34, 197, 94, 0.15);
}

.weather-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.weather-label {
  font-size: 11px;
  color: #6b7280;
  letter-spacing: 0.3px;
}

.weather-value {
  font-size: 11px;
  font-weight: 500;
  color: #059669;
}

.weather-value.loading {
  color: #f59e0b;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.dark-mode .weather-label {
  color: #9ca3af;
}

.dark-mode .weather-value {
  color: #34d399;
}

/* ========================================
   主题切换
   ======================================== */
.theme-section {
  padding: 10px 16px;
  background: linear-gradient(
    90deg,
    rgba(249, 115, 22, 0.08) 0%,
    transparent 100%
  );
  border-bottom: 1px solid rgba(249, 115, 22, 0.1);
}

.dark-mode .theme-section {
  background: linear-gradient(
    90deg,
    rgba(249, 115, 22, 0.12) 0%,
    transparent 100%
  );
  border-bottom-color: rgba(249, 115, 22, 0.15);
}

.theme-title {
  font-size: 11px;
  color: #6b7280;
  letter-spacing: 0.3px;
  margin-bottom: 8px;
}

.dark-mode .theme-title {
  color: #9ca3af;
}

.theme-buttons {
  display: flex;
  gap: 8px;
}

.theme-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(250, 245, 255, 0.9) 100%
  );
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(249, 115, 22, 0.1);
}

.dark-mode .theme-btn {
  background: linear-gradient(
    145deg,
    rgba(55, 48, 85, 0.9) 0%,
    rgba(45, 40, 70, 0.9) 100%
  );
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-color: rgba(249, 115, 22, 0.15);
}

.theme-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 8px rgba(249, 115, 22, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.dark-mode .theme-btn:hover {
  box-shadow:
    0 4px 8px rgba(249, 115, 22, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.theme-btn:active {
  transform: translateY(1px);
}

/* 激活状态 */
.theme-btn.active {
  background: linear-gradient(145deg, #f97316 0%, #ea580c 100%);
  box-shadow:
    0 4px 12px rgba(249, 115, 22, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-color: transparent;
}

.theme-btn.active .theme-icon,
.theme-btn.active .theme-label {
  color: white;
}

.theme-icon {
  font-size: 16px;
  line-height: 1;
}

.theme-label {
  font-size: 10px;
  font-weight: 500;
  color: #ea580c;
  letter-spacing: 0.3px;
}

.dark-mode .theme-label {
  color: #fb923c;
}

/* ========================================
   动作分组
   ======================================== */
.action-groups {
  padding: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.action-group {
  margin-bottom: 12px;
}

.action-group:last-child {
  margin-bottom: 0;
}

.group-title {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #a78bfa;
  margin-bottom: 8px;
  padding-left: 4px;
}

.dark-mode .group-title {
  color: #8b5cf6;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

/* ========================================
   动作按钮 - 街机风格
   ======================================== */
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 4px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(250, 245, 255, 0.9) 100%
  );
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.1);
}

.dark-mode .action-btn {
  background: linear-gradient(
    145deg,
    rgba(55, 48, 85, 0.9) 0%,
    rgba(45, 40, 70, 0.9) 100%
  );
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-color: rgba(167, 139, 250, 0.15);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 8px rgba(139, 92, 246, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 1) 0%,
    rgba(250, 245, 255, 1) 100%
  );
}

.dark-mode .action-btn:hover {
  background: linear-gradient(
    145deg,
    rgba(65, 55, 100, 0.95) 0%,
    rgba(55, 48, 85, 0.95) 100%
  );
  box-shadow:
    0 4px 8px rgba(139, 92, 246, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.action-btn:active {
  transform: translateY(1px);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.1),
    inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 激活状态 */
.action-btn.active {
  background: linear-gradient(145deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow:
    0 4px 12px rgba(139, 92, 246, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-color: transparent;
}

.action-btn.active .btn-icon,
.action-btn.active .btn-label {
  color: white;
}

.btn-icon {
  font-size: 14px;
  color: #6d28d9;
  line-height: 1;
  transition: transform 0.15s ease;
}

.dark-mode .btn-icon {
  color: #c4b5fd;
}

.action-btn:hover .btn-icon {
  transform: scale(1.2);
}

.btn-label {
  font-size: 10px;
  font-weight: 500;
  color: #7c3aed;
  letter-spacing: 0.3px;
}

.dark-mode .btn-label {
  color: #a78bfa;
}

/* ========================================
   调试物品区域
   ======================================== */
.debug-items-section {
  padding: 10px 12px 12px;
  border-top: 1px solid rgba(139, 92, 246, 0.12);
  background: linear-gradient(
    180deg,
    rgba(236, 72, 153, 0.05) 0%,
    transparent 100%
  );
}

.dark-mode .debug-items-section {
  border-top-color: rgba(167, 139, 250, 0.15);
  background: linear-gradient(
    180deg,
    rgba(236, 72, 153, 0.08) 0%,
    transparent 100%
  );
}

.debug-items-title {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #a78bfa;
  margin-bottom: 8px;
  padding-left: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dark-mode .debug-items-title {
  color: #8b5cf6;
}

.debug-items-hint {
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 0;
  text-transform: none;
  color: #ec4899;
  background: rgba(236, 72, 153, 0.1);
  padding: 1px 6px;
  border-radius: 3px;
}

.dark-mode .debug-items-hint {
  color: #f472b6;
  background: rgba(236, 72, 153, 0.15);
}

/* Tab 切换栏 */
.debug-tab-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
  background: rgba(139, 92, 246, 0.06);
  border-radius: 8px;
  padding: 3px;
}

.dark-mode .debug-tab-bar {
  background: rgba(139, 92, 246, 0.1);
}

.debug-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 4px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  background: transparent;
  font-family: inherit;
}

.debug-tab-btn:hover {
  background: rgba(139, 92, 246, 0.08);
}

.dark-mode .debug-tab-btn:hover {
  background: rgba(167, 139, 250, 0.12);
}

.debug-tab-btn.active {
  background: linear-gradient(145deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.debug-tab-icon {
  font-size: 12px;
  line-height: 1;
}

.debug-tab-label {
  font-size: 10px;
  font-weight: 500;
  color: #7c3aed;
  letter-spacing: 0.3px;
}

.dark-mode .debug-tab-label {
  color: #a78bfa;
}

.debug-tab-btn.active .debug-tab-label {
  color: white;
}

/* 物品网格 */
.debug-item-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

/* 物品卡片 */
.debug-item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 4px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(250, 245, 255, 0.9) 100%
  );
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(236, 72, 153, 0.1);
  font-family: inherit;
}

.dark-mode .debug-item-card {
  background: linear-gradient(
    145deg,
    rgba(55, 48, 85, 0.9) 0%,
    rgba(45, 40, 70, 0.9) 100%
  );
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  border-color: rgba(236, 72, 153, 0.15);
}

.debug-item-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 8px rgba(236, 72, 153, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 1) 0%,
    rgba(250, 245, 255, 1) 100%
  );
}

.dark-mode .debug-item-card:hover {
  background: linear-gradient(
    145deg,
    rgba(65, 55, 100, 0.95) 0%,
    rgba(55, 48, 85, 0.95) 100%
  );
  box-shadow:
    0 4px 8px rgba(236, 72, 153, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.debug-item-card:active {
  transform: translateY(1px);
}

/* 食物/沐浴露 选中态 */
.debug-item-card.active {
  background: linear-gradient(145deg, #ec4899 0%, #db2777 100%);
  box-shadow:
    0 4px 12px rgba(236, 72, 153, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-color: transparent;
}

.debug-item-card.active .debug-item-icon,
.debug-item-card.active .debug-item-name {
  color: white;
}

/* 装饰 装备态 */
.debug-item-card.equipped {
  background: linear-gradient(145deg, #8b5cf6 0%, #7c3aed 100%);
  box-shadow:
    0 4px 12px rgba(139, 92, 246, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border-color: transparent;
}

.debug-item-card.equipped .debug-item-icon,
.debug-item-card.equipped .debug-item-name {
  color: white;
}

.debug-item-icon {
  font-size: 18px;
  line-height: 1;
  transition: transform 0.15s ease;
}

.debug-item-card:hover .debug-item-icon {
  transform: scale(1.2);
}

.debug-item-name {
  font-size: 10px;
  font-weight: 500;
  color: #7c3aed;
  letter-spacing: 0.3px;
}

.dark-mode .debug-item-name {
  color: #a78bfa;
}

/* 装饰 ON 徽章 */
.debug-item-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 8px;
  font-weight: 700;
  color: white;
  background: #22c55e;
  padding: 0 4px;
  border-radius: 3px;
  line-height: 14px;
  letter-spacing: 0.5px;
}

/* ========================================
   底部提示
   ======================================== */
.panel-footer {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  background: rgba(139, 92, 246, 0.05);
  border-top: 1px solid rgba(139, 92, 246, 0.1);
}

.dark-mode .panel-footer {
  background: rgba(0, 0, 0, 0.2);
  border-top-color: rgba(167, 139, 250, 0.15);
}

.hint {
  font-size: 9px;
  color: #9ca3af;
  letter-spacing: 0.3px;
}

/* ========================================
   面板动画
   ======================================== */
.panel-fade-enter-active {
  animation: panel-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.panel-fade-leave-active {
  animation: panel-out 0.2s ease-in;
}

@keyframes panel-in {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes panel-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* ========================================
   滚动条样式
   ======================================== */
.action-groups::-webkit-scrollbar {
  width: 4px;
}

.action-groups::-webkit-scrollbar-track {
  background: transparent;
}

.action-groups::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.3);
  border-radius: 2px;
}

.action-groups::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.5);
}
</style>
