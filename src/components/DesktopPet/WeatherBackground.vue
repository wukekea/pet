<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { currentWeather } from "./composables/useWeather";
import { isDark } from "./composables/useTheme";
import { position } from "./composables/sharedState";
import "./weather.css";

// 天气背景样式类
const weatherClass = computed(() => `weather-${currentWeather.value}`);
const themeClass = computed(() =>
  isDark.value ? "dark-theme" : "light-theme",
);

// 天气背景位置 - 跟随宠物位置，居中显示
const weatherStyle = computed(() => ({
  left: `${position.value.x + 40}px`,
  top: `${position.value.y + 40}px`,
}));

// 生成随机数序列用于动画延迟
const getRandomDelay = (index: number, base: number = 0.5) =>
  `${(index * 0.15 + Math.sin(index) * base).toFixed(2)}s`;

// 生成随机位置
const getRandomPos = (index: number) => `${(index * 37) % 100}%`;

// ========== 闪电效果 ==========
const lightningActive = ref(false);
const lightningBolt = ref<string | null>(null);
let lightningTimer: ReturnType<typeof setTimeout> | null = null;

// 生成随机闪电形状
const generateLightningPath = (): string => {
  // 主闪电路径 - 从顶部到中部
  let path = "M 140 0";
  let x = 140;
  let y = 0;

  // 主干道 - 锯齿状向下
  const segments = 6 + Math.floor(Math.random() * 3);
  for (let i = 0; i < segments; i++) {
    const nextY = y + (20 + Math.random() * 15);
    const nextX = x + (Math.random() - 0.5) * 60;
    path += ` L ${nextX} ${nextY}`;
    x = nextX;
    y = nextY;
  }

  // 添加分支
  const branchCount = 2 + Math.floor(Math.random() * 2);
  let branchPaths = "";

  // 重置位置用于分支
  x = 140;
  y = 0;
  let branchX = x;
  let branchY = y;

  for (let b = 0; b < branchCount; b++) {
    // 随机选择分支起点
    const startSegment = 1 + Math.floor(Math.random() * 3);
    branchX = 140 + (Math.random() - 0.5) * 40;
    branchY = startSegment * 25;

    branchPaths += ` M ${branchX} ${branchY}`;

    // 分支路径
    const branchSegments = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < branchSegments; i++) {
      const nextY = branchY + (15 + Math.random() * 10);
      const direction = Math.random() > 0.5 ? 1 : -1;
      const nextX = branchX + direction * (20 + Math.random() * 25);
      branchPaths += ` L ${nextX} ${nextY}`;
      branchX = nextX;
      branchY = nextY;
    }
  }

  return path + branchPaths;
};

// 触发闪电
const triggerLightning = () => {
  if (currentWeather.value !== "thunderstorm") return;

  // 生成新的闪电形状
  lightningBolt.value = generateLightningPath();
  lightningActive.value = true;

  // 第一次闪亮
  setTimeout(() => {
    lightningActive.value = false;

    // 短暂间隙后第二次闪亮
    setTimeout(() => {
      lightningActive.value = true;
      lightningBolt.value = generateLightningPath();

      setTimeout(() => {
        lightningActive.value = false;
        // 重新调度下一次闪电
        scheduleNextLightning();
      }, 150);
    }, 80);
  }, 120);
};

// 调度下一次闪电（随机 1-3 分钟）
const scheduleNextLightning = () => {
  if (lightningTimer) {
    clearTimeout(lightningTimer);
  }

  // 1-3 分钟随机间隔 (60000ms - 180000ms)
  const delay = 60000 + Math.random() * 120000;

  lightningTimer = setTimeout(() => {
    triggerLightning();
  }, delay);
};

// 监听天气变化
watch(currentWeather, (newWeather) => {
  if (newWeather === "thunderstorm") {
    // 进入雷阵雨天气时，随机延迟后开始闪电
    const initialDelay = 5000 + Math.random() * 10000;
    lightningTimer = setTimeout(() => {
      triggerLightning();
    }, initialDelay);
  } else {
    // 离开雷阵雨天气时清除定时器
    if (lightningTimer) {
      clearTimeout(lightningTimer);
      lightningTimer = null;
    }
    lightningActive.value = false;
  }
});

// 组件挂载时检查是否需要启动闪电
onMounted(() => {
  if (currentWeather.value === "thunderstorm") {
    const initialDelay = 3000 + Math.random() * 5000;
    lightningTimer = setTimeout(() => {
      triggerLightning();
    }, initialDelay);
  }
});

// 组件卸载时清理
onUnmounted(() => {
  if (lightningTimer) {
    clearTimeout(lightningTimer);
  }
});
</script>

<template>
  <div
    class="weather-background"
    :class="[weatherClass, themeClass]"
    :style="weatherStyle"
  >
    <!-- 晴天效果 - 温柔的光晕与漂浮光点 -->
    <div v-if="currentWeather === 'sunny'" class="sunny-container">
      <!-- 多层光晕背景 -->
      <div class="sun-glow sun-glow-outer"></div>
      <div class="sun-glow sun-glow-mid"></div>
      <div class="sun-glow sun-glow-inner"></div>
      <!-- 漂浮光点 -->
      <div class="floating-particles">
        <span
          v-for="i in 12"
          :key="i"
          class="particle"
          :style="{
            '--delay': getRandomDelay(i, 0.8),
            '--x-start': `${10 + i * 7}%`,
            '--x-end': `${15 + i * 6}%`,
          }"
        ></span>
      </div>
      <!-- 柔和光斑 -->
      <div class="light-spots">
        <div
          v-for="i in 5"
          :key="i"
          class="light-spot"
          :style="{
            '--delay': getRandomDelay(i, 1.2),
            '--size': `${40 + i * 15}px`,
            left: getRandomPos(i),
            top: `${20 + i * 15}%`,
          }"
        ></div>
      </div>
    </div>

    <!-- 多云效果 - 柔软的云朵层叠 -->
    <div v-if="currentWeather === 'cloudy'" class="cloudy-container">
      <div class="cloud-layer layer-back">
        <svg
          v-for="i in 3"
          :key="`back-${i}`"
          class="cloud cloud-back"
          :class="`cloud-anim-${i}`"
          viewBox="0 0 100 50"
          :style="{ '--delay': `${i * 2}s`, '--offset': `${i * 30}px` }"
        >
          <g class="cloud-group" :class="{ 'dark-theme': isDark }">
            <ellipse cx="30" cy="35" rx="25" ry="15" class="cloud-part" />
            <ellipse cx="50" cy="28" rx="30" ry="20" class="cloud-part" />
            <ellipse cx="70" cy="35" rx="22" ry="14" class="cloud-part" />
            <ellipse cx="45" cy="38" rx="20" ry="12" class="cloud-part" />
          </g>
        </svg>
      </div>
    </div>

    <!-- 小雨效果 - 稀疏细腻的雨丝 -->
    <div
      v-if="currentWeather === 'lightRain'"
      class="rain-container light-rain"
    >
      <!-- 雨丝 -->
      <div class="rain-drops light">
        <span
          v-for="i in 20"
          :key="i"
          class="rain-drop light"
          :style="{
            '--delay': getRandomDelay(i, 0.3),
            '--x': `${(i * 5) % 100}%`,
            '--duration': `${2 + (i % 3) * 0.3}s`,
          }"
        ></span>
      </div>
      <!-- 涟漪效果 -->
      <div class="ripples">
        <span
          v-for="i in 4"
          :key="i"
          class="ripple"
          :style="{
            '--delay': getRandomDelay(i, 1.5),
            '--x': `${(i * 25) % 100}%`,
            '--y': `${65 + i * 8}%`,
          }"
        ></span>
      </div>
      <!-- 雾气效果 -->
      <div class="mist"></div>
    </div>

    <!-- 暴雨效果 - 密集倾盆大雨 -->
    <div
      v-if="currentWeather === 'heavyRain'"
      class="rain-container heavy-rain"
    >
      <div class="rain-drops heavy">
        <span
          v-for="i in 50"
          :key="i"
          class="rain-drop heavy"
          :style="{
            '--delay': getRandomDelay(i, 0.08),
            '--x': getRandomPos(i),
            '--duration': `${0.4 + (i % 4) * 0.08}s`,
          }"
        ></span>
      </div>
      <div class="rain-overlay"></div>
      <div class="heavy-mist"></div>
    </div>

    <!-- 雷阵雨效果 - 暴雨 + 闪电 -->
    <div
      v-if="currentWeather === 'thunderstorm'"
      class="rain-container thunderstorm"
    >
      <div class="rain-drops storm">
        <span
          v-for="i in 65"
          :key="i"
          class="rain-drop storm"
          :style="{
            '--delay': getRandomDelay(i, 0.06),
            '--x': getRandomPos(i),
            '--duration': `${0.4 + (i % 4) * 0.08}s`,
          }"
        ></span>
      </div>
      <!-- 闪电效果 -->
      <div
        class="lightning-container"
        :class="{ 'lightning-active': lightningActive }"
      >
        <!-- 背景闪光 -->
        <div class="lightning-flash"></div>
        <!-- 闪电图形 -->
        <svg
          v-if="lightningActive && lightningBolt"
          class="lightning-bolt"
          viewBox="0 0 280 280"
          preserveAspectRatio="xMidYMin meet"
        >
          <!-- 光晕效果 -->
          <filter id="lightning-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <!-- 主闪电 -->
          <path
            :d="lightningBolt"
            class="bolt-main"
            filter="url(#lightning-glow)"
          />
          <!-- 内部亮线 -->
          <path :d="lightningBolt" class="bolt-core" />
        </svg>
      </div>
    </div>

    <!-- 小雪效果 - 优雅飘落 -->
    <div
      v-if="currentWeather === 'lightSnow'"
      class="snow-container light-snow"
    >
      <div class="snowflakes">
        <span
          v-for="i in 18"
          :key="i"
          class="snowflake"
          :style="{
            '--delay': getRandomDelay(i, 0.6),
            '--x': getRandomPos(i),
            '--duration': `${5 + (i % 4)}s`,
            '--size': `${4 + (i % 3) * 2}px`,
            '--sway': `${20 + (i % 5) * 5}px`,
          }"
        ></span>
      </div>
      <!-- 雪花闪光 -->
      <div class="sparkles">
        <span
          v-for="i in 8"
          :key="i"
          class="sparkle"
          :style="{
            '--delay': getRandomDelay(i, 0.8),
            '--x': getRandomPos(i),
            '--y': `${20 + i * 8}%`,
          }"
        ></span>
      </div>
    </div>

    <!-- 大雪效果 -->
    <div
      v-if="currentWeather === 'heavySnow'"
      class="snow-container heavy-snow"
    >
      <div class="snowflakes heavy">
        <span
          v-for="i in 40"
          :key="i"
          class="snowflake heavy"
          :style="{
            '--delay': getRandomDelay(i, 0.2),
            '--x': getRandomPos(i),
            '--duration': `${3 + (i % 5)}s`,
            '--size': `${5 + (i % 4) * 2}px`,
            '--sway': `${15 + (i % 6) * 8}px`,
          }"
        ></span>
      </div>
      <div class="snow-overlay"></div>
      <!-- 积雪效果 -->
      <div class="snow-ground"></div>
    </div>
  </div>
</template>
