<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { changeState } from "../DesktopPet/composables/petController";
import {
  petState,
  isDebugPanelOpen,
  currentFood,
  type FoodType,
} from "../DesktopPet/composables/sharedState";
import { isDark } from "../DesktopPet/composables/theme";
import {
  currentWeather,
  setWeather,
} from "../DesktopPet/composables/weatherState";
import { weatherStatus } from "../DesktopPet/composables/qweatherService";
import type { PetState } from "../DesktopPet/types";
import type { WeatherType } from "../DesktopPet/types";
import { setPassthrough } from "../DesktopPet/composables/passthrough";

// 面板可见性
const isVisible = ref(false);

// 拖拽状态
const isDragging = ref(false);
const position = ref({ x: 20, y: 80 });
const dragOffset = ref({ x: 0, y: 0 });

// 当前选中的状态
const activeState = computed(() => petState.value);

// 当前选中的食物
const activeFood = computed(() => currentFood.value);

// 食物选项
const foodOptions: { value: FoodType; label: string; icon: string }[] = [
  { value: "apple", label: "苹果", icon: "🍎" },
  { value: "fish", label: "鱼", icon: "🐟" },
  { value: "cake", label: "蛋糕", icon: "🎂" },
  { value: "lollipop", label: "棒棒糖", icon: "🍭" },
];

// 选择食物
const selectFood = (food: FoodType) => {
  currentFood.value = food;
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
      { state: "hide" as PetState, label: "躲藏", icon: "▢" },
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
    name: "日常状态",
    actions: [
      { state: "bathing" as PetState, label: "洗澡", icon: "🛁" },
      { state: "eating" as PetState, label: "吃东西", icon: "🍚" },
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
const triggerState = (state: PetState) => {
  changeState(state);
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
              :key="action.state"
              class="action-btn"
              :class="{ active: activeState === action.state }"
              @click="triggerState(action.state)"
              :title="`${action.label} (${action.state})`"
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

        <!-- 食物选择 -->
        <div class="action-group">
          <div class="group-title">食物选择</div>
          <div class="action-buttons">
            <button
              v-for="food in foodOptions"
              :key="food.value"
              class="action-btn"
              :class="{ active: activeFood === food.value }"
              @click="selectFood(food.value)"
              :title="food.label"
            >
              <span class="btn-icon">{{ food.icon }}</span>
              <span class="btn-label">{{ food.label }}</span>
            </button>
          </div>
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
