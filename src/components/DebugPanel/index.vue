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

// 主 Tab
type MainTab = "state" | "item" | "env";
const mainTab = ref<MainTab>("state");

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
  <!-- 调试面板 - 赛博朋克数据终端 -->
  <Transition name="panel-fade">
    <div
      v-if="isVisible"
      class="debug-panel"
      :class="{ 'dark-mode': isDark }"
      :style="{ left: `${position.x}px`, top: `${position.y}px` }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- 点阵纹理叠加层 -->
      <div class="dot-matrix"></div>

      <!-- HUD 角标装饰 -->
      <div class="corner-deco corner-tl"></div>
      <div class="corner-deco corner-tr"></div>
      <div class="corner-deco corner-bl"></div>
      <div class="corner-deco corner-br"></div>

      <!-- 标题栏 - 可拖拽 -->
      <div class="panel-header" @mousedown="handleDragStart">
        <div class="header-left">
          <div class="status-dot-wrap">
            <span class="status-dot"></span>
          </div>
          <span class="title-icon">⚙</span>
          <span class="title-text">DEBUG</span>
        </div>
        <span class="state-badge">{{ activeState }}</span>
        <button class="close-btn" @click="togglePanel" title="关闭 (Ctrl+D)">
          ✕
        </button>
      </div>

      <!-- 主 Tab 导航 -->
      <div class="main-tabs">
        <button
          class="main-tab-btn"
          :class="{ active: mainTab === 'state' }"
          @click="mainTab = 'state'"
        >
          <span class="main-tab-icon">🎮</span>
          <span class="main-tab-label">状态</span>
        </button>
        <button
          class="main-tab-btn"
          :class="{ active: mainTab === 'item' }"
          @click="mainTab = 'item'"
        >
          <span class="main-tab-icon">🎒</span>
          <span class="main-tab-label">物品</span>
        </button>
        <button
          class="main-tab-btn"
          :class="{ active: mainTab === 'env' }"
          @click="mainTab = 'env'"
        >
          <span class="main-tab-icon">🌍</span>
          <span class="main-tab-label">环境</span>
        </button>
      </div>

      <!-- Tab 内容区域 -->
      <div class="tab-content">
        <!-- ====== 状态 Tab ====== -->
        <div v-if="mainTab === 'state'" class="state-tab">
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
        </div>

        <!-- ====== 物品 Tab ====== -->
        <div v-if="mainTab === 'item'" class="item-tab">
          <div class="item-hint">仅触发动画，不加属性</div>

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

        <!-- ====== 环境 Tab ====== -->
        <div v-if="mainTab === 'env'" class="env-tab">
          <!-- 实时天气信息 -->
          <div class="weather-card">
            <div class="weather-card-title">实时天气</div>
            <div class="weather-rows">
              <div class="weather-row">
                <span class="weather-key">📍 城市</span>
                <span class="weather-val">{{
                  weatherStatus.cityName || "未获取"
                }}</span>
              </div>
              <div class="weather-row">
                <span class="weather-key">🌡 天气</span>
                <span class="weather-val">{{ realWeatherText }}</span>
              </div>
              <div class="weather-row">
                <span class="weather-key">🔄 状态</span>
                <span
                  class="weather-val"
                  :class="weatherStatus.isLoading ? 'loading' : ''"
                >
                  {{ weatherStatusText }}
                </span>
              </div>
            </div>
          </div>

          <!-- 天气效果切换 -->
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

          <!-- 主题切换 -->
          <div class="theme-section">
            <div class="group-title">主题模式</div>
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
        </div>
      </div>

      <!-- 底部提示 -->
      <div class="panel-footer">
        <span class="hint">Ctrl+D 切换</span>
        <span class="hint">拖拽标题栏移动</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ========================================
   调试面板 - 赛博朋克数据终端
   深邃海军蓝底 + 霓虹青色主线 + 品红激活
   ======================================== */

/* ---------- 面板容器 ---------- */
.debug-panel {
  position: fixed;
  z-index: 9999;
  width: 420px;
  height: 520px;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  overflow: hidden;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f2f5f9;
  border: 1px solid rgba(0, 160, 180, 0.2);
  box-shadow:
    0 32px 64px -16px rgba(0, 50, 80, 0.12),
    0 0 0 1px rgba(0, 160, 180, 0.08);
  user-select: none;
  pointer-events: auto !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.debug-panel.dark-mode {
  background: #0b0f18;
  border-color: rgba(0, 240, 255, 0.15);
  box-shadow:
    0 32px 64px -16px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(0, 240, 255, 0.08),
    0 0 80px -30px rgba(0, 240, 255, 0.08);
  animation: border-breathe 4s ease-in-out infinite;
}

@keyframes border-breathe {
  0%,
  100% {
    box-shadow:
      0 32px 64px -16px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(0, 240, 255, 0.08),
      0 0 60px -30px rgba(0, 240, 255, 0.06);
  }
  50% {
    box-shadow:
      0 32px 64px -16px rgba(0, 0, 0, 0.55),
      0 0 0 1px rgba(0, 240, 255, 0.15),
      0 0 80px -30px rgba(0, 240, 255, 0.12);
  }
}

/* ---------- 点阵纹理 ---------- */
.dot-matrix {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    rgba(0, 160, 180, 0.025) 1px,
    transparent 1px
  );
  background-size: 4px 4px;
  pointer-events: none;
  z-index: 50;
  border-radius: inherit;
}

.dark-mode .dot-matrix {
  background-image: radial-gradient(
    rgba(0, 240, 255, 0.04) 1px,
    transparent 1px
  );
}

/* ---------- HUD 角标装饰 ---------- */
.corner-deco {
  position: absolute;
  width: 14px;
  height: 14px;
  pointer-events: none;
  z-index: 51;
  border-style: solid;
  border-color: rgba(0, 160, 180, 0.25);
}

.dark-mode .corner-deco {
  border-color: rgba(0, 240, 255, 0.3);
}

.corner-tl {
  top: 3px;
  left: 3px;
  border-width: 2px 0 0 2px;
}

.corner-tr {
  top: 3px;
  right: 3px;
  border-width: 2px 2px 0 0;
}

.corner-bl {
  bottom: 3px;
  left: 3px;
  border-width: 0 0 2px 2px;
}

.corner-br {
  bottom: 3px;
  right: 3px;
  border-width: 0 2px 2px 0;
}

/* ========================================
   标题栏
   ======================================== */
.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  flex-shrink: 0;
  background: linear-gradient(
    90deg,
    rgba(0, 160, 180, 0.06) 0%,
    rgba(0, 160, 180, 0.02) 100%
  );
  cursor: grab;
  border-bottom: 1px solid rgba(0, 160, 180, 0.1);
  position: relative;
  z-index: 2;
}

.dark-mode .panel-header {
  background: linear-gradient(
    90deg,
    rgba(0, 240, 255, 0.06) 0%,
    rgba(0, 240, 255, 0.01) 100%
  );
  border-bottom-color: rgba(0, 240, 255, 0.1);
}

.panel-header:active {
  cursor: grabbing;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 状态指示灯 + 脉冲环 */
.status-dot-wrap {
  position: relative;
  width: 10px;
  height: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00a0a8;
  position: relative;
  z-index: 2;
}

.dark-mode .status-dot {
  background: #00f0ff;
  box-shadow: 0 0 6px rgba(0, 240, 255, 0.6);
}

.status-dot-wrap::after {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 1px solid rgba(0, 160, 180, 0.3);
  animation: ring-pulse 2.5s ease-out infinite;
}

.dark-mode .status-dot-wrap::after {
  border-color: rgba(0, 240, 255, 0.4);
}

@keyframes ring-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}

.title-icon {
  font-size: 13px;
  opacity: 0.85;
}

.title-text {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #008090;
}

.dark-mode .title-text {
  color: #00f0ff;
}

.state-badge {
  flex: 1;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #008090;
  background: rgba(0, 160, 180, 0.06);
  border: 1px solid rgba(0, 160, 180, 0.15);
  padding: 2px 10px;
  border-radius: 2px;
  letter-spacing: 0.5px;
  font-variant: small-caps;
}

.dark-mode .state-badge {
  color: #00f0ff;
  background: rgba(0, 240, 255, 0.06);
  border-color: rgba(0, 240, 255, 0.15);
}

.close-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(220, 50, 80, 0.15);
  background: rgba(220, 50, 80, 0.04);
  color: #c0304a;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: rgba(220, 50, 80, 0.12);
  border-color: rgba(220, 50, 80, 0.3);
}

.dark-mode .close-btn {
  border-color: rgba(255, 45, 120, 0.2);
  background: rgba(255, 45, 120, 0.06);
  color: #ff2d78;
}

.dark-mode .close-btn:hover {
  background: rgba(255, 45, 120, 0.15);
  border-color: rgba(255, 45, 120, 0.4);
  box-shadow: 0 0 8px rgba(255, 45, 120, 0.2);
}

/* ========================================
   主 Tab 导航 - 机械键盘键帽风格
   ======================================== */
.main-tabs {
  display: flex;
  gap: 4px;
  padding: 6px 8px;
  flex-shrink: 0;
  background: rgba(0, 160, 180, 0.03);
  border-bottom: 1px solid rgba(0, 160, 180, 0.08);
}

.dark-mode .main-tabs {
  background: rgba(0, 240, 255, 0.02);
  border-bottom-color: rgba(0, 240, 255, 0.06);
}

.main-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 7px 4px;
  border: 1px solid rgba(0, 160, 180, 0.12);
  border-bottom: 3px solid rgba(0, 160, 180, 0.15);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.1s ease;
  background: #e8edf3;
  box-shadow: 0 3px 4px rgba(0, 40, 60, 0.06);
  position: relative;
  top: 0;
}

.dark-mode .main-tab-btn {
  background: #151c2c;
  border-color: rgba(0, 240, 255, 0.1);
  border-bottom-color: rgba(0, 240, 255, 0.18);
  box-shadow: 0 3px 4px rgba(0, 0, 0, 0.25);
}

.main-tab-btn:hover {
  background: #dce3ec;
  border-bottom-color: rgba(0, 160, 180, 0.35);
  box-shadow: 0 4px 8px rgba(0, 40, 60, 0.08);
  top: -1px;
}

.dark-mode .main-tab-btn:hover {
  background: #1a2238;
  border-bottom-color: rgba(0, 240, 255, 0.4);
  box-shadow:
    0 4px 8px rgba(0, 240, 255, 0.08),
    0 3px 4px rgba(0, 0, 0, 0.25);
}

.main-tab-btn:active {
  border-bottom-width: 1px;
  transform: translateY(2px);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.08);
  top: 0;
}

/* Tab 激活态 - 霓虹内发光 */
.main-tab-btn.active {
  background: #00a0a8;
  border-color: #00a0a8;
  border-bottom-color: #007880;
  border-bottom-width: 3px;
  transform: translateY(0);
  top: 0;
  box-shadow:
    0 3px 4px rgba(0, 0, 0, 0.08),
    0 0 12px rgba(0, 160, 180, 0.2);
}

.dark-mode .main-tab-btn.active {
  background: rgba(0, 240, 255, 0.12);
  border-color: #00f0ff;
  border-bottom-color: #00c8d8;
  box-shadow:
    0 3px 4px rgba(0, 0, 0, 0.3),
    0 0 16px rgba(0, 240, 255, 0.15),
    inset 0 0 12px rgba(0, 240, 255, 0.06);
}

.main-tab-btn.active .main-tab-icon,
.main-tab-btn.active .main-tab-label {
  color: white;
}

.dark-mode .main-tab-btn.active .main-tab-icon,
.dark-mode .main-tab-btn.active .main-tab-label {
  color: #00f0ff;
}

.main-tab-icon {
  font-size: 14px;
  line-height: 1;
}

.main-tab-label {
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.5px;
}

.dark-mode .main-tab-label {
  color: #cbd5e1;
}

/* ========================================
   Tab 内容区域
   ======================================== */
.tab-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 10px;
  position: relative;
  z-index: 2;
}

/* ========================================
   状态 Tab
   ======================================== */
.state-tab {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-title {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #008090;
  margin-bottom: 4px;
  padding-left: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dark-mode .group-title {
  color: #00d8e8;
}

.group-title::after {
  content: "";
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(0, 160, 180, 0.15) 0%,
    transparent 100%
  );
}

.dark-mode .group-title::after {
  background: linear-gradient(
    90deg,
    rgba(0, 240, 255, 0.12) 0%,
    transparent 100%
  );
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

/* ========================================
   动作按钮 - 机械键帽风格
   ======================================== */
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px 2px;
  aspect-ratio: 1;
  border: 1px solid rgba(0, 160, 180, 0.1);
  border-bottom: 2px solid rgba(0, 160, 180, 0.12);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.08s ease;
  background: #e4e9f0;
  box-shadow: 0 2px 3px rgba(0, 30, 60, 0.06);
  position: relative;
  top: 0;
}

.dark-mode .action-btn {
  background: #131a2a;
  border-color: rgba(0, 240, 255, 0.06);
  border-bottom-color: rgba(0, 240, 255, 0.1);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
}

.action-btn:hover {
  top: -1px;
  background: #d8e0ea;
  border-bottom-color: rgba(0, 160, 180, 0.35);
  box-shadow: 0 3px 6px rgba(0, 30, 60, 0.08);
}

.dark-mode .action-btn:hover {
  background: #182030;
  border-bottom-color: rgba(0, 240, 255, 0.35);
  box-shadow:
    0 3px 6px rgba(0, 240, 255, 0.06),
    0 2px 3px rgba(0, 0, 0, 0.2);
}

.action-btn:active {
  border-bottom-width: 1px;
  transform: translateY(1px);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.06);
  top: 0;
}

/* 激活态 - 霓虹边框 */
.action-btn.active {
  background: #00a0a8;
  border-color: #00c8d0;
  border-bottom-color: #008088;
  border-bottom-width: 2px;
  transform: translateY(0);
  top: 0;
  box-shadow:
    0 2px 3px rgba(0, 0, 0, 0.08),
    0 0 10px rgba(0, 160, 180, 0.25);
}

.dark-mode .action-btn.active {
  background: rgba(0, 240, 255, 0.08);
  border-color: #00f0ff;
  border-bottom-color: #00c8d8;
  box-shadow:
    0 2px 3px rgba(0, 0, 0, 0.2),
    0 0 14px rgba(0, 240, 255, 0.2),
    inset 0 0 8px rgba(0, 240, 255, 0.04);
}

.action-btn.active .btn-icon,
.action-btn.active .btn-label {
  color: white;
}

.dark-mode .action-btn.active .btn-icon {
  color: #00f0ff;
}

.dark-mode .action-btn.active .btn-label {
  color: #c0f0ff;
}

.btn-icon {
  font-size: 14px;
  color: #374151;
  line-height: 1;
  transition: transform 0.1s ease;
}

.dark-mode .btn-icon {
  color: #e2e8f0;
}

.action-btn:hover .btn-icon {
  transform: scale(1.12);
}

.btn-label {
  font-size: 10px;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.dark-mode .btn-label {
  color: #cbd5e1;
}

/* ========================================
   分组独立配色 - 每组自己的色彩标识
   ======================================== */

/* 浅色模式变量 */
.state-tab > .action-group:nth-child(1) {
  --gt: #008090;
  --gl: rgba(0, 160, 180, 0.15);
  --gi: #374151;
  --gk: #374151;
  --gb: rgba(0, 160, 180, 0.1);
  --gbb: rgba(0, 160, 180, 0.12);
  --ghb: rgba(0, 160, 180, 0.35);
  --gbs: rgba(0, 160, 180, 0.06);
  --gbg: #dff0f2;
  --gbh: #d0e8ec;
  --gab: #00a0a8;
  --gae: #00c8d0;
  --gad: #008088;
  --gai: white;
  --gak: white;
}
.state-tab > .action-group:nth-child(2) {
  --gt: #c03060;
  --gl: rgba(200, 50, 100, 0.15);
  --gi: #374151;
  --gk: #374151;
  --gb: rgba(200, 50, 100, 0.1);
  --gbb: rgba(200, 50, 100, 0.12);
  --ghb: rgba(200, 50, 100, 0.35);
  --gbs: rgba(200, 50, 100, 0.06);
  --gbg: #f2dfe6;
  --gbh: #ecd5e0;
  --gab: #d04070;
  --gae: #e85090;
  --gad: #b03060;
  --gai: white;
  --gak: white;
}
.state-tab > .action-group:nth-child(3) {
  --gt: #7040c0;
  --gl: rgba(112, 64, 192, 0.15);
  --gi: #374151;
  --gk: #374151;
  --gb: rgba(112, 64, 192, 0.1);
  --gbb: rgba(112, 64, 192, 0.12);
  --ghb: rgba(112, 64, 192, 0.35);
  --gbs: rgba(112, 64, 192, 0.06);
  --gbg: #e8e0f2;
  --gbh: #dfd5ec;
  --gab: #7c3aed;
  --gae: #8b5cf6;
  --gad: #6d28d9;
  --gai: white;
  --gak: white;
}
.state-tab > .action-group:nth-child(4) {
  --gt: #a07000;
  --gl: rgba(180, 120, 0, 0.15);
  --gi: #374151;
  --gk: #374151;
  --gb: rgba(180, 120, 0, 0.1);
  --gbb: rgba(180, 120, 0, 0.12);
  --ghb: rgba(180, 120, 0, 0.35);
  --gbs: rgba(180, 120, 0, 0.06);
  --gbg: #f2ead8;
  --gbh: #ece2c8;
  --gab: #c08800;
  --gae: #d09800;
  --gad: #a07000;
  --gai: white;
  --gak: white;
}
.state-tab > .action-group:nth-child(5) {
  --gt: #4050c0;
  --gl: rgba(64, 80, 192, 0.15);
  --gi: #374151;
  --gk: #374151;
  --gb: rgba(64, 80, 192, 0.1);
  --gbb: rgba(64, 80, 192, 0.12);
  --ghb: rgba(64, 80, 192, 0.35);
  --gbs: rgba(64, 80, 192, 0.06);
  --gbg: #e0e2f2;
  --gbh: #d5d8ec;
  --gab: #5060d0;
  --gae: #6070e0;
  --gad: #4050b0;
  --gai: white;
  --gak: white;
}
.state-tab > .action-group:nth-child(6) {
  --gt: #008860;
  --gl: rgba(0, 136, 96, 0.15);
  --gi: #374151;
  --gk: #374151;
  --gb: rgba(0, 136, 96, 0.1);
  --gbb: rgba(0, 136, 96, 0.12);
  --ghb: rgba(0, 136, 96, 0.35);
  --gbs: rgba(0, 136, 96, 0.06);
  --gbg: #dff2ea;
  --gbh: #d2ecdf;
  --gab: #00a870;
  --gae: #00c080;
  --gad: #009060;
  --gai: white;
  --gak: white;
}

/* 深色模式变量 */
.dark-mode .state-tab > .action-group:nth-child(1) {
  --gt: #00d8e8;
  --gl: rgba(0, 240, 255, 0.12);
  --gi: #e2e8f0;
  --gk: #cbd5e1;
  --gb: rgba(0, 240, 255, 0.06);
  --gbb: rgba(0, 240, 255, 0.1);
  --ghb: rgba(0, 240, 255, 0.35);
  --gbs: rgba(0, 240, 255, 0.04);
  --gbg: #0f1a28;
  --gbh: #142030;
  --gab: rgba(0, 240, 255, 0.08);
  --gae: #00f0ff;
  --gad: #00c8d8;
  --gai: #00f0ff;
  --gak: #c0f0ff;
}
.dark-mode .state-tab > .action-group:nth-child(2) {
  --gt: #ff5090;
  --gl: rgba(255, 80, 144, 0.12);
  --gi: #e2e8f0;
  --gk: #cbd5e1;
  --gb: rgba(255, 45, 120, 0.06);
  --gbb: rgba(255, 45, 120, 0.1);
  --ghb: rgba(255, 45, 120, 0.35);
  --gbs: rgba(255, 45, 120, 0.04);
  --gbg: #1a0f18;
  --gbh: #221420;
  --gab: rgba(255, 45, 120, 0.08);
  --gae: #ff2d78;
  --gad: #d02060;
  --gai: #ff2d78;
  --gak: #ffc0d8;
}
.dark-mode .state-tab > .action-group:nth-child(3) {
  --gt: #a78bfa;
  --gl: rgba(167, 139, 250, 0.12);
  --gi: #e2e8f0;
  --gk: #cbd5e1;
  --gb: rgba(139, 92, 246, 0.06);
  --gbb: rgba(139, 92, 246, 0.1);
  --ghb: rgba(139, 92, 246, 0.35);
  --gbs: rgba(139, 92, 246, 0.04);
  --gbg: #14102a;
  --gbh: #1a1535;
  --gab: rgba(139, 92, 246, 0.08);
  --gae: #8b5cf6;
  --gad: #7c3aed;
  --gai: #8b5cf6;
  --gak: #e0d0ff;
}
.dark-mode .state-tab > .action-group:nth-child(4) {
  --gt: #ffb800;
  --gl: rgba(255, 184, 0, 0.12);
  --gi: #e2e8f0;
  --gk: #cbd5e1;
  --gb: rgba(255, 184, 0, 0.06);
  --gbb: rgba(255, 184, 0, 0.1);
  --ghb: rgba(255, 184, 0, 0.35);
  --gbs: rgba(255, 184, 0, 0.04);
  --gbg: #1a1608;
  --gbh: #221e10;
  --gab: rgba(255, 184, 0, 0.08);
  --gae: #ffb800;
  --gad: #d89800;
  --gai: #ffb800;
  --gak: #ffe8a0;
}
.dark-mode .state-tab > .action-group:nth-child(5) {
  --gt: #818cf8;
  --gl: rgba(129, 140, 248, 0.12);
  --gi: #e2e8f0;
  --gk: #cbd5e1;
  --gb: rgba(99, 102, 241, 0.06);
  --gbb: rgba(99, 102, 241, 0.1);
  --ghb: rgba(99, 102, 241, 0.35);
  --gbs: rgba(99, 102, 241, 0.04);
  --gbg: #10102a;
  --gbh: #161635;
  --gab: rgba(99, 102, 241, 0.08);
  --gae: #6366f1;
  --gad: #4f46e5;
  --gai: #6366f1;
  --gak: #d0d0ff;
}
.dark-mode .state-tab > .action-group:nth-child(6) {
  --gt: #34d399;
  --gl: rgba(52, 211, 153, 0.12);
  --gi: #e2e8f0;
  --gk: #cbd5e1;
  --gb: rgba(16, 185, 129, 0.06);
  --gbb: rgba(16, 185, 129, 0.1);
  --ghb: rgba(16, 185, 129, 0.35);
  --gbs: rgba(16, 185, 129, 0.04);
  --gbg: #0f1a18;
  --gbh: #142220;
  --gab: rgba(16, 185, 129, 0.08);
  --gae: #10b981;
  --gad: #059669;
  --gai: #10b981;
  --gak: #c0ffe0;
}

/* 变量引用 - 覆盖基色 */
.state-tab > .action-group .group-title {
  color: var(--gt);
}
.state-tab > .action-group .group-title::after {
  background: linear-gradient(90deg, var(--gl), transparent);
}
.state-tab > .action-group .action-btn {
  border-color: var(--gb);
  border-bottom-color: var(--gbb);
  background: var(--gbg);
  box-shadow: 0 2px 3px var(--gbs);
}
.state-tab > .action-group .action-btn:hover {
  border-bottom-color: var(--ghb);
  background: var(--gbh);
}
.state-tab > .action-group .action-btn.active {
  background: var(--gab);
  border-color: var(--gae);
  border-bottom-color: var(--gad);
  box-shadow:
    0 2px 3px rgba(0, 0, 0, 0.08),
    0 0 10px var(--gbs);
}
.state-tab > .action-group .btn-icon {
  color: var(--gi);
}
.state-tab > .action-group .btn-label {
  color: var(--gk);
}
.state-tab > .action-group .action-btn.active .btn-icon {
  color: var(--gai);
}
.state-tab > .action-group .action-btn.active .btn-label {
  color: var(--gak);
}

/* 环境Tab分组配色 */
.env-tab > .action-group:nth-child(2) {
  --gt: #0088c0;
  --gl: rgba(0, 136, 192, 0.15);
  --gi: #374151;
  --gk: #374151;
  --gb: rgba(0, 136, 192, 0.1);
  --gbb: rgba(0, 136, 192, 0.12);
  --ghb: rgba(0, 136, 192, 0.35);
  --gbs: rgba(0, 136, 192, 0.06);
  --gbg: #dff0f8;
  --gbh: #d0e8f2;
  --gab: #0098d0;
  --gae: #00a8e0;
  --gad: #0080b0;
  --gai: white;
  --gak: white;
}
.env-tab > .action-group:nth-child(3) {
  --gt: #8848b0;
  --gl: rgba(136, 72, 176, 0.15);
  --gi: #374151;
  --gk: #374151;
  --gb: rgba(136, 72, 176, 0.1);
  --gbb: rgba(136, 72, 176, 0.12);
  --ghb: rgba(136, 72, 176, 0.35);
  --gbs: rgba(136, 72, 176, 0.06);
  --gbg: #e8e0f2;
  --gbh: #dfd5ec;
  --gab: #9858c0;
  --gae: #a868d0;
  --gad: #7840a0;
  --gai: white;
  --gak: white;
}
.dark-mode .env-tab > .action-group:nth-child(2) {
  --gt: #38bdf8;
  --gl: rgba(56, 189, 248, 0.12);
  --gi: #e2e8f0;
  --gk: #cbd5e1;
  --gb: rgba(56, 189, 248, 0.06);
  --gbb: rgba(56, 189, 248, 0.1);
  --ghb: rgba(56, 189, 248, 0.35);
  --gbs: rgba(56, 189, 248, 0.04);
  --gbg: #0f1828;
  --gbh: #142030;
  --gab: rgba(56, 189, 248, 0.08);
  --gae: #38bdf8;
  --gad: #0ea5e9;
  --gai: #38bdf8;
  --gak: #c0e8ff;
}
.dark-mode .env-tab > .action-group:nth-child(3) {
  --gt: #c084fc;
  --gl: rgba(192, 132, 252, 0.12);
  --gi: #e2e8f0;
  --gk: #cbd5e1;
  --gb: rgba(168, 85, 247, 0.06);
  --gbb: rgba(168, 85, 247, 0.1);
  --ghb: rgba(168, 85, 247, 0.35);
  --gbs: rgba(168, 85, 247, 0.04);
  --gbg: #14102a;
  --gbh: #1a1535;
  --gab: rgba(168, 85, 247, 0.08);
  --gae: #a855f7;
  --gad: #9333ea;
  --gai: #a855f7;
  --gak: #e8d0ff;
}
.env-tab > .action-group .group-title {
  color: var(--gt, #008090);
}
.env-tab > .action-group .group-title::after {
  background: linear-gradient(
    90deg,
    var(--gl, rgba(0, 160, 180, 0.15)),
    transparent
  );
}
.env-tab > .action-group .action-btn {
  border-color: var(--gb, rgba(0, 160, 180, 0.1));
  border-bottom-color: var(--gbb, rgba(0, 160, 180, 0.12));
  background: var(--gbg, #e4e9f0);
  box-shadow: 0 2px 3px var(--gbs, rgba(0, 30, 60, 0.06));
}
.env-tab > .action-group .action-btn:hover {
  border-bottom-color: var(--ghb, rgba(0, 160, 180, 0.35));
  background: var(--gbh, #d8e0ea);
}
.env-tab > .action-group .action-btn.active {
  background: var(--gab, #00a0a8);
  border-color: var(--gae, #00c8d0);
  border-bottom-color: var(--gad, #008088);
}
.env-tab > .action-group .btn-icon {
  color: var(--gi, #3a5565);
}
.env-tab > .action-group .btn-label {
  color: var(--gk, #4a6070);
}
.env-tab > .action-group .action-btn.active .btn-icon {
  color: var(--gai, white);
}
.env-tab > .action-group .action-btn.active .btn-label {
  color: var(--gak, white);
}

/* ========================================
   物品 Tab
   ======================================== */
.item-tab {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-hint {
  font-size: 9px;
  font-weight: 500;
  color: #b04070;
  background: rgba(200, 50, 100, 0.05);
  border: 1px solid rgba(200, 50, 100, 0.12);
  padding: 4px 8px;
  border-radius: 2px;
  text-align: center;
  letter-spacing: 0.3px;
}

.dark-mode .item-hint {
  color: #ff2d78;
  background: rgba(255, 45, 120, 0.06);
  border-color: rgba(255, 45, 120, 0.15);
}

/* 物品子 Tab */
.debug-tab-bar {
  display: flex;
  gap: 3px;
  background: rgba(0, 160, 180, 0.04);
  border: 1px solid rgba(0, 160, 180, 0.08);
  border-radius: 3px;
  padding: 2px;
}

.dark-mode .debug-tab-bar {
  background: rgba(0, 240, 255, 0.02);
  border-color: rgba(0, 240, 255, 0.06);
}

.debug-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 5px 4px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.1s ease;
  background: transparent;
}

.debug-tab-btn:hover {
  background: rgba(0, 160, 180, 0.06);
}

.dark-mode .debug-tab-btn:hover {
  background: rgba(0, 240, 255, 0.05);
}

.debug-tab-btn.active {
  background: #00a0a8;
  box-shadow: 0 0 8px rgba(0, 160, 180, 0.2);
}

.dark-mode .debug-tab-btn.active {
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.3);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.1);
}

.debug-tab-icon {
  font-size: 12px;
  line-height: 1;
}

.debug-tab-label {
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.3px;
}

.dark-mode .debug-tab-label {
  color: #cbd5e1;
}

.debug-tab-btn.active .debug-tab-label {
  color: white;
}

.dark-mode .debug-tab-btn.active .debug-tab-label {
  color: #00f0ff;
}

/* 物品网格 */
.debug-item-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
}

/* 物品卡片 - 键帽风格 */
.debug-item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 4px;
  aspect-ratio: 1;
  border: 1px solid rgba(0, 160, 180, 0.08);
  border-bottom: 2px solid rgba(0, 160, 180, 0.1);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.08s ease;
  position: relative;
  background: #e4e9f0;
  box-shadow: 0 2px 3px rgba(0, 30, 60, 0.06);
  top: 0;
}

.dark-mode .debug-item-card {
  background: #131a2a;
  border-color: rgba(0, 240, 255, 0.05);
  border-bottom-color: rgba(0, 240, 255, 0.08);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
}

.debug-item-card:hover {
  top: -1px;
  background: #d8e0ea;
  border-bottom-color: rgba(0, 160, 180, 0.3);
  box-shadow: 0 3px 6px rgba(0, 30, 60, 0.08);
}

.dark-mode .debug-item-card:hover {
  background: #182030;
  border-bottom-color: rgba(0, 240, 255, 0.3);
  box-shadow:
    0 3px 6px rgba(0, 240, 255, 0.06),
    0 2px 3px rgba(0, 0, 0, 0.2);
}

.debug-item-card:active {
  border-bottom-width: 1px;
  transform: translateY(1px);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.06);
  top: 0;
}

/* 食物/沐浴露 选中态 - 品红 */
.debug-item-card.active {
  background: #c03068;
  border-color: #e04080;
  border-bottom-color: #a02858;
  border-bottom-width: 2px;
  top: 0;
  box-shadow:
    0 2px 3px rgba(0, 0, 0, 0.08),
    0 0 12px rgba(200, 50, 100, 0.2);
}

.dark-mode .debug-item-card.active {
  background: rgba(255, 45, 120, 0.1);
  border-color: #ff2d78;
  border-bottom-color: #d02060;
  box-shadow:
    0 2px 3px rgba(0, 0, 0, 0.2),
    0 0 14px rgba(255, 45, 120, 0.2),
    inset 0 0 8px rgba(255, 45, 120, 0.04);
}

.debug-item-card.active .debug-item-icon,
.debug-item-card.active .debug-item-name {
  color: white;
}

.dark-mode .debug-item-card.active .debug-item-icon {
  color: #ff2d78;
}

.dark-mode .debug-item-card.active .debug-item-name {
  color: #ffc0d8;
}

/* 装饰 装备态 - 霓虹青 */
.debug-item-card.equipped {
  background: #00a0a8;
  border-color: #00c8d0;
  border-bottom-color: #008088;
  border-bottom-width: 2px;
  top: 0;
  box-shadow:
    0 2px 3px rgba(0, 0, 0, 0.08),
    0 0 10px rgba(0, 160, 180, 0.25);
}

.dark-mode .debug-item-card.equipped {
  background: rgba(0, 240, 255, 0.08);
  border-color: #00f0ff;
  border-bottom-color: #00c8d8;
  box-shadow:
    0 2px 3px rgba(0, 0, 0, 0.2),
    0 0 14px rgba(0, 240, 255, 0.2),
    inset 0 0 8px rgba(0, 240, 255, 0.04);
}

.debug-item-card.equipped .debug-item-icon,
.debug-item-card.equipped .debug-item-name {
  color: white;
}

.dark-mode .debug-item-card.equipped .debug-item-icon {
  color: #00f0ff;
}

.dark-mode .debug-item-card.equipped .debug-item-name {
  color: #c0f0ff;
}

.debug-item-icon {
  font-size: 18px;
  line-height: 1;
  transition: transform 0.1s ease;
}

.debug-item-card:hover .debug-item-icon {
  transform: scale(1.12);
}

.debug-item-name {
  font-size: 10px;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.dark-mode .debug-item-name {
  color: #cbd5e1;
}

/* 装饰 ON 徽章 */
.debug-item-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 8px;
  font-weight: 700;
  color: #00a0a8;
  background: rgba(0, 160, 180, 0.1);
  padding: 0 3px;
  border-radius: 1px;
  line-height: 12px;
  letter-spacing: 0.5px;
  border: 1px solid rgba(0, 160, 180, 0.2);
}

.dark-mode .debug-item-badge {
  color: #00f0ff;
  background: rgba(0, 240, 255, 0.1);
  border-color: rgba(0, 240, 255, 0.3);
}

/* ========================================
   环境 Tab
   ======================================== */
.env-tab {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 天气信息卡片 */
.weather-card {
  background: rgba(0, 160, 180, 0.03);
  border: 1px solid rgba(0, 160, 180, 0.1);
  border-left: 3px solid rgba(0, 160, 180, 0.25);
  border-radius: 2px;
  padding: 8px 10px;
}

.dark-mode .weather-card {
  background: rgba(0, 240, 255, 0.02);
  border-color: rgba(0, 240, 255, 0.08);
  border-left-color: rgba(0, 240, 255, 0.3);
}

.weather-card-title {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #008090;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.dark-mode .weather-card-title {
  color: #00d8e8;
}

.weather-rows {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.weather-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.weather-key {
  font-size: 11px;
  color: #374151;
  letter-spacing: 0.3px;
}

.dark-mode .weather-key {
  color: #cbd5e1;
}

.weather-val {
  font-size: 11px;
  font-weight: 600;
  color: #008060;
}

.dark-mode .weather-val {
  color: #00e0a0;
}

.weather-val.loading {
  color: #b08000;
  animation: pulse 1s infinite;
}

.dark-mode .weather-val.loading {
  color: #ffb800;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

/* 主题切换 */
.theme-section {
  /* 在环境 Tab 中的主题区域 */
}

.theme-buttons {
  display: flex;
  gap: 4px;
}

.theme-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 7px 4px;
  border: 1px solid rgba(180, 100, 0, 0.1);
  border-bottom: 2px solid rgba(180, 100, 0, 0.12);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.08s ease;
  background: #eae5de;
  box-shadow: 0 2px 3px rgba(0, 30, 60, 0.05);
  top: 0;
  position: relative;
}

.dark-mode .theme-btn {
  background: #1a1820;
  border-color: rgba(255, 184, 0, 0.08);
  border-bottom-color: rgba(255, 184, 0, 0.12);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
}

.theme-btn:hover {
  top: -1px;
  background: #e0dace;
  border-bottom-color: rgba(180, 100, 0, 0.3);
  box-shadow: 0 3px 6px rgba(0, 30, 60, 0.06);
}

.dark-mode .theme-btn:hover {
  background: #201e28;
  border-bottom-color: rgba(255, 184, 0, 0.3);
  box-shadow:
    0 3px 6px rgba(255, 184, 0, 0.05),
    0 2px 3px rgba(0, 0, 0, 0.2);
}

.theme-btn:active {
  border-bottom-width: 1px;
  transform: translateY(1px);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.06);
  top: 0;
}

/* 主题激活态 - 琥珀色 */
.theme-btn.active {
  background: #c08800;
  border-color: #d89800;
  border-bottom-color: #a07000;
  border-bottom-width: 2px;
  top: 0;
  box-shadow:
    0 2px 3px rgba(0, 0, 0, 0.08),
    0 0 10px rgba(200, 140, 0, 0.2);
}

.dark-mode .theme-btn.active {
  background: rgba(255, 184, 0, 0.1);
  border-color: #ffb800;
  border-bottom-color: #d89800;
  box-shadow:
    0 2px 3px rgba(0, 0, 0, 0.2),
    0 0 14px rgba(255, 184, 0, 0.15),
    inset 0 0 8px rgba(255, 184, 0, 0.04);
}

.theme-btn.active .theme-icon,
.theme-btn.active .theme-label {
  color: white;
}

.dark-mode .theme-btn.active .theme-icon {
  color: #ffb800;
}

.dark-mode .theme-btn.active .theme-label {
  color: #ffe8a0;
}

.theme-icon {
  font-size: 14px;
  line-height: 1;
}

.theme-label {
  font-size: 10px;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.3px;
}

.dark-mode .theme-label {
  color: #cbd5e1;
}

/* ========================================
   底部提示 - 终端状态栏风格
   ======================================== */
.panel-footer {
  display: flex;
  justify-content: space-between;
  padding: 4px 12px;
  flex-shrink: 0;
  background: rgba(0, 160, 180, 0.03);
  border-top: 1px solid rgba(0, 160, 180, 0.06);
  position: relative;
  z-index: 2;
}

.dark-mode .panel-footer {
  background: rgba(0, 240, 255, 0.01);
  border-top-color: rgba(0, 240, 255, 0.04);
}

.hint {
  font-size: 9px;
  color: #6b7280;
  letter-spacing: 0.5px;
}

.dark-mode .hint {
  color: #94a3b8;
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
    transform: scale(0.92) translateY(-8px);
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
.tab-content::-webkit-scrollbar {
  width: 3px;
}

.tab-content::-webkit-scrollbar-track {
  background: transparent;
}

.tab-content::-webkit-scrollbar-thumb {
  background: rgba(0, 160, 180, 0.15);
  border-radius: 2px;
}

.tab-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 160, 180, 0.3);
}

.dark-mode .tab-content::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.15);
}

.dark-mode .tab-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 240, 255, 0.3);
}
</style>
