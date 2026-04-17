<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { currentWeather, isWeatherChanging } from "./composables/useWeather";
import { isDark } from "./composables/useTheme";
import { position } from "./composables/sharedState";
import "./weather.css";

// 天气背景样式类（退出多云时保持 cloudy 样式）
const weatherClass = computed(() =>
  isWeatherChanging.value ? 'weather-cloudy' : `weather-${currentWeather.value}`
);
const themeClass = computed(() =>
  isDark.value ? "dark-theme" : "light-theme",
);

// 天气背景位置 - 跟随宠物位置，居中显示
// 偏移量：left 向右偏移 40px，top 向上偏移（负值），使宠物在天气背景中位置偏下
const weatherStyle = computed(() => ({
  left: `${position.value.x + 40}px`,
  top: `${position.value.y - 20}px`,
}));

// 生成随机数序列用于动画延迟
const getRandomDelay = (index: number, base: number = 0.5) =>
  `${(index * 0.15 + Math.sin(index) * base).toFixed(2)}s`;

// 生成随机位置
const getRandomPos = (index: number) => `${(index * 37) % 100}%`;

// 涟漪数据（带唯一 key）
const ripples = ref<{ id: number; x: string; y: string }[]>([]);
let rippleId = 0;

// 创建一个新涟漪
const createRipple = () => ({
  id: ++rippleId,
  x: `${Math.floor(Math.random() * 100)}%`,
  y: `${60 + Math.floor(Math.random() * 30)}%`,
});

// 添加一个涟漪
const addRipple = () => {
  // 限制最大数量，避免堆积太多
  if (ripples.value.length < 8) {
    ripples.value.push(createRipple());
  }
};

// 移除涟漪（动画结束后调用）
const removeRipple = (id: number) => {
  const index = ripples.value.findIndex((r) => r.id === id);
  if (index !== -1) {
    ripples.value.splice(index, 1);
  }
};

// 定时器
let rippleTimer: ReturnType<typeof setInterval> | null = null;

watch(
  currentWeather,
  (newWeather) => {
    if (rippleTimer) {
      clearInterval(rippleTimer);
      rippleTimer = null;
    }
    ripples.value = [];
    if (newWeather === "lightRain") {
      // 延迟 1.5s 后开始生成涟漪（等雨水先落地）
      rippleTimer = setTimeout(() => {
        rippleTimer = setInterval(addRipple, 500);
      }, 1500);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (rippleTimer) {
    clearInterval(rippleTimer);
  }
});

// ========== 多云效果配置 ==========
// 基础速度（px/s）- 修改此值可统一调整所有云朵速度
const CLOUD_BASE_SPEED = 12;
// 云朵退出时的速度倍数
const CLOUD_EXIT_SPEED_MULTIPLIER = 10;
// 每朵云生成的时间间隔
const CLOUD_GENERATE_INTERVAL = 10000;

// 云朵位置配置：起始X、结束X、速度乘率、垂直位置
const cloudPositions = [
  { startX: -90, endX: 270, speedMultiplier: 0.95, top: '5%' },
  { startX: -90, endX: 270, speedMultiplier: 0.85, top: '20%' },
  { startX: -90, endX: 270, speedMultiplier: 0.90, top: '35%' },
];

// 计算云朵动画持续时间（秒）
const getCloudDuration = (cloud: Cloud) => {
  const distance = cloud.config.endX - cloud.startPosition;
  const speedMultiplier = isWeatherChanging.value ? CLOUD_EXIT_SPEED_MULTIPLIER : 1;
  const speed = CLOUD_BASE_SPEED * cloud.config.speedMultiplier * speedMultiplier;
  return (distance / speed).toFixed(1);
};

// 当前显示的云朵列表
interface Cloud {
  id: number;
  config: (typeof cloudPositions)[0];
  startPosition: number; // 动画起始位置（用于退出时从当前位置继续）
  startTime: number; // 动画开始时间
  renderKey: number; // 用于强制重新渲染
}
const clouds = ref<Cloud[]>([]);
let cloudId = 0;
let cloudTimer: ReturnType<typeof setTimeout> | null = null;

// 云朵退出状态（已移至 useWeather.ts）
let exitKey = 0; // 退出时的渲染 key

// 随机选择一个位置生成云朵
const spawnCloud = () => {
  // 退出状态下不再生成新云
  if (isWeatherChanging.value) return;

  const randomConfig = cloudPositions[Math.floor(Math.random() * cloudPositions.length)];
  clouds.value.push({
    id: ++cloudId,
    config: randomConfig,
    startPosition: randomConfig.startX,
    startTime: Date.now(),
    renderKey: 0,
  });
};

// 移除云朵（动画结束后调用）
const removeCloud = (id: number) => {
  const index = clouds.value.findIndex((c) => c.id === id);
  if (index !== -1) {
    clouds.value.splice(index, 1);
  }
};

// 启动云朵退出动画
const startCloudExit = () => {
  const now = Date.now();
  exitKey++; // 更新退出 key
  clouds.value.forEach((cloud) => {
    // 计算已运行时间和当前位置
    const distance = cloud.config.endX - cloud.config.startX;
    const normalSpeed = CLOUD_BASE_SPEED * cloud.config.speedMultiplier;
    const normalDuration = distance / normalSpeed;

    const elapsed = (now - cloud.startTime) / 1000; // 秒
    const progress = Math.min(elapsed / normalDuration, 1);

    // 当前位置
    const currentX = cloud.config.startX + distance * progress;

    // 更新云朵的起始位置和开始时间（从当前位置继续）
    cloud.startPosition = currentX;
    cloud.startTime = now;
    cloud.renderKey = exitKey; // 更新 renderKey 强制重新渲染
  });
};

// 监听云朵列表变化，所有云朵消失后重置退出状态
watch(
  clouds,
  (newClouds) => {
    if (isWeatherChanging.value && newClouds.length === 0) {
      // 所有云朵消失，恢复状态
      isWeatherChanging.value = false;
    }
  },
  { deep: true }
);

// 监听天气变化，启动/停止云朵生成
watch(
  currentWeather,
  (newWeather, oldWeather) => {
    // 从多云切换到其他天气：启动退出动画
    if (oldWeather === 'cloudy' && newWeather !== 'cloudy' && clouds.value.length > 0) {
      // 停止生成新云
      if (cloudTimer) {
        clearTimeout(cloudTimer);
        cloudTimer = null;
      }
      // 设置退出状态，启动退出动画
      isWeatherChanging.value = true;
      startCloudExit();
      return; // 保持在多云状态，等待云朵全部消失
    }

    // 正常切换逻辑
    if (cloudTimer) {
      clearTimeout(cloudTimer);
      cloudTimer = null;
    }

    // 非 cloudy 天气时清空云朵
    if (newWeather !== 'cloudy') {
      clouds.value = [];
      isWeatherChanging.value = false;
    }

    if (newWeather === 'cloudy') {
      // 重置退出状态，清空旧云朵，开始生成新云朵
      isWeatherChanging.value = false;
      clouds.value = [];
      // 立即生成第一朵云
      spawnCloud();
      // 每隔 CLOUD_GENERATE_INTERVAL + 随机(0-5s) 生成一朵新云
      const scheduleNextCloud = () => {
        const randomDelay = CLOUD_GENERATE_INTERVAL + Math.random() * 5000;
        cloudTimer = setTimeout(() => {
          spawnCloud();
          scheduleNextCloud();
        }, randomDelay);
      };
      scheduleNextCloud();
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (cloudTimer) {
    clearTimeout(cloudTimer);
  }
});

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
    <div v-if="currentWeather === 'sunny' && !isWeatherChanging" class="sunny-container">
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
            '--y-start': `${15 + (i % 5) * 18}%`,
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
    <div v-if="currentWeather === 'cloudy' || isWeatherChanging" class="cloudy-container">
      <div class="cloud-layer layer-back">
        <svg
          v-for="cloud in clouds"
          :key="`${cloud.id}-${cloud.renderKey}`"
          class="cloud cloud-back cloud-anim"
          viewBox="0 0 100 50"
          :style="{
            '--cloud-start-x': `${cloud.startPosition}px`,
            '--cloud-end-x': `${cloud.config.endX}px`,
            '--cloud-duration': `${getCloudDuration(cloud)}s`,
            top: cloud.config.top,
          }"
          @animationend="removeCloud(cloud.id)"
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
      v-if="currentWeather === 'lightRain' && !isWeatherChanging"
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
          v-for="ripple in ripples"
          :key="ripple.id"
          class="ripple"
          :style="{
            '--x': ripple.x,
            '--y': ripple.y,
          }"
          @animationend="removeRipple(ripple.id)"
        ></span>
      </div>
      <!-- 雾气效果 -->
      <div class="mist"></div>
    </div>

    <!-- 暴雨效果 - 密集倾盆大雨 -->
    <div
      v-if="currentWeather === 'heavyRain' && !isWeatherChanging"
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
      v-if="currentWeather === 'thunderstorm' && !isWeatherChanging"
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
      v-if="currentWeather === 'lightSnow' && !isWeatherChanging"
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
      v-if="currentWeather === 'heavySnow' && !isWeatherChanging"
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
