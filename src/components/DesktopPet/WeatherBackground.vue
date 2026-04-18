<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { currentWeather, isWeatherChanging } from "./composables/useWeather";
import { isDark } from "./composables/useTheme";
import { position } from "./composables/sharedState";
import "./weather.css";

// 天气背景样式类（退场时保持原天气样式）
const weatherClass = computed(() => {
  if (isWeatherChanging.value) {
    // 根据是否有雨滴判断是否显示雨天背景
    if (rainDrops.value.length > 0) {
      return `weather-${currentWeather.value}`;
    }
  }
  return `weather-${currentWeather.value}`;
});
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
      clearTimeout(rippleTimer);
      clearInterval(rippleTimer);
      rippleTimer = null;
    }
    ripples.value = [];
    if (newWeather === "lightRain") {
      // 延迟 1s 后开始生成涟漪（等雨水先落地）
      rippleTimer = setTimeout(() => {
        rippleTimer = setInterval(addRipple, 500);
      }, 1000);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (rippleTimer) {
    clearInterval(rippleTimer);
  }
});

// ========== 雨天效果配置 ==========
// 雨量配置（三种雨共用同一套动画，仅雨量不同）
interface RainConfig {
  dropCount: number;      // 初始雨滴数量
  maxDrops: number;       // 最大雨滴数量
  generateInterval: number; // 生成间隔（ms）
  dropWidth: number;      // 雨滴粗细（px）
  dropHeight: number;     // 雨滴长度（px）
  hasRipple: boolean;     // 是否有涟漪效果
  hasLightning: boolean;  // 是否有闪电效果
}

const rainConfigs: Record<string, RainConfig> = {
  lightRain: {
    dropCount: 25,        // 适中初始雨滴
    maxDrops: 45,         // 屏幕上最多45颗
    generateInterval: 70, // 70ms一颗
    dropWidth: 1.5,       // 较细
    dropHeight: 18,       // 较短
    hasRipple: true,
    hasLightning: false,
  },
  heavyRain: {
    dropCount: 60,        // 较多初始雨滴
    maxDrops: 100,        // 屏幕上最多100颗
    generateInterval: 30, // 生成快，30ms一颗
    dropWidth: 2.5,       // 较粗
    dropHeight: 25,       // 较长
    hasRipple: false,
    hasLightning: false,
  },
  thunderstorm: {
    dropCount: 100,       // 大量初始雨滴
    maxDrops: 180,        // 屏幕上最多180颗
    generateInterval: 12, // 生成非常快，12ms一颗
    dropWidth: 3,         // 最粗
    dropHeight: 30,       // 最长
    hasRipple: false,
    hasLightning: true,
  },
};

// 雨滴数据结构
interface RainDrop {
  id: number;
  x: string;
  duration: number;
  delay: number;
  width: number;   // 雨滴粗细
  height: number;  // 雨滴长度
}
const rainDrops = ref<RainDrop[]>([]);
let rainDropId = 0;
let rainTimer: ReturnType<typeof setInterval> | null = null;

// 获取当前雨的配置
const getCurrentRainConfig = (): RainConfig | null => {
  const weather = currentWeather.value;
  if (['lightRain', 'heavyRain', 'thunderstorm'].includes(weather)) {
    return rainConfigs[weather];
  }
  return null;
};

// 生成雨滴
const spawnRainDrop = () => {
  // 退出状态下不再生成新雨滴
  if (isWeatherChanging.value) return;

  const config = getCurrentRainConfig();
  if (!config) return;

  // 统一的雨滴动画参数
  const baseDuration = 0.6;
  const durationVariation = 0.3;

  rainDrops.value.push({
    id: ++rainDropId,
    x: `${Math.floor(Math.random() * 100)}%`,
    duration: baseDuration + Math.random() * durationVariation,
    delay: 0,
    width: config.dropWidth,
    height: config.dropHeight,
  });
};

// 移除雨滴（动画结束后调用）
const removeRainDrop = (id: number) => {
  const index = rainDrops.value.findIndex((d) => d.id === id);
  if (index !== -1) {
    rainDrops.value.splice(index, 1);
  }
};

// 监听雨滴列表变化，所有雨滴消失后重置退出状态并启动新天气效果
watch(
  rainDrops,
  (newDrops) => {
    if (isWeatherChanging.value && newDrops.length === 0) {
      isWeatherChanging.value = false;

      // 检查新天气是否需要启动效果（如多云）
      const newWeather = currentWeather.value;
      if (newWeather === 'cloudy') {
        clouds.value = [];
        spawnCloud();
        const scheduleNextCloud = () => {
          const randomDelay = CLOUD_GENERATE_INTERVAL + Math.random() * 5000;
          cloudTimer = setTimeout(() => {
            spawnCloud();
            scheduleNextCloud();
          }, randomDelay);
        };
        scheduleNextCloud();
      }
    }
  },
  { deep: true }
);

// 启动雨滴生成
// initialBatch: 是否立即生成初始批次（雨天之间切换时传 false）
const startRainGeneration = (initialBatch: boolean = true) => {
  const config = getCurrentRainConfig();
  if (!config) return;

  // 统一的雨滴动画参数
  const baseDuration = 0.6;

  // 立即生成一批雨滴（仅首次进入雨天时）
  if (initialBatch) {
    for (let i = 0; i < config.dropCount; i++) {
      rainDrops.value.push({
        id: ++rainDropId,
        x: `${(i * 5) % 100}%`,
        duration: baseDuration + (i % 4) * 0.05,
        delay: parseFloat(getRandomDelay(i, 0.2)),
        width: config.dropWidth,
        height: config.dropHeight,
      });
    }
  }

  // 持续生成新雨滴
  rainTimer = setInterval(() => {
    if (rainDrops.value.length < config.maxDrops) {
      spawnRainDrop();
    }
  }, config.generateInterval);
};

// 停止雨滴生成
const stopRainGeneration = () => {
  if (rainTimer) {
    clearInterval(rainTimer);
    rainTimer = null;
  }
};

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

// 监听云朵列表变化，所有云朵消失后重置退出状态并启动新天气效果
watch(
  clouds,
  (newClouds) => {
    if (isWeatherChanging.value && newClouds.length === 0) {
      // 所有云朵消失，恢复状态
      isWeatherChanging.value = false;

      // 检查新天气是否需要启动效果（如雨天）
      const newWeather = currentWeather.value;
      const isNewRain = ['lightRain', 'heavyRain', 'thunderstorm'].includes(newWeather);
      if (isNewRain) {
        rainDrops.value = [];
        startRainGeneration();
      }
    }
  },
  { deep: true }
);

// 监听天气变化，启动/停止云朵和雨滴生成
watch(
  currentWeather,
  (newWeather, oldWeather) => {
    const isOldRain = ['lightRain', 'heavyRain', 'thunderstorm'].includes(oldWeather || '');
    const isNewRain = ['lightRain', 'heavyRain', 'thunderstorm'].includes(newWeather);

    // 从多云切换到其他天气：启动云朵退出动画
    if (oldWeather === 'cloudy' && newWeather !== 'cloudy' && clouds.value.length > 0) {
      if (cloudTimer) {
        clearTimeout(cloudTimer);
        cloudTimer = null;
      }
      isWeatherChanging.value = true;
      startCloudExit();
      return;
    }

    // 从雨天切换到非雨天：启动雨滴退出（等待现有雨滴落尽）
    if (isOldRain && !isNewRain && rainDrops.value.length > 0) {
      stopRainGeneration();
      isWeatherChanging.value = true;
      return;
    }

    // 雨天之间切换：平滑过渡，不清空现有雨滴
    if (isOldRain && isNewRain) {
      stopRainGeneration();
      isWeatherChanging.value = false;
      // 不清空 rainDrops，现有雨滴继续落下
      // 以新参数启动生成器，不生成初始批次
      startRainGeneration(false);
      return;
    }

    // 正常切换逻辑
    if (cloudTimer) {
      clearTimeout(cloudTimer);
      cloudTimer = null;
    }
    stopRainGeneration();

    // 非 cloudy 天气时清空云朵
    if (newWeather !== 'cloudy') {
      clouds.value = [];
    }

    // 非雨天时清空雨滴
    if (!isNewRain) {
      rainDrops.value = [];
    }

    // 重置退出状态
    isWeatherChanging.value = false;

    if (newWeather === 'cloudy') {
      clouds.value = [];
      spawnCloud();
      const scheduleNextCloud = () => {
        const randomDelay = CLOUD_GENERATE_INTERVAL + Math.random() * 5000;
        cloudTimer = setTimeout(() => {
          spawnCloud();
          scheduleNextCloud();
        }, randomDelay);
      };
      scheduleNextCloud();
    }

    // 启动雨天（从非雨天切换到雨天）
    if (isNewRain) {
      rainDrops.value = [];
      startRainGeneration();
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (cloudTimer) {
    clearTimeout(cloudTimer);
  }
  stopRainGeneration();
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

    <!-- 雨天效果 - 统一动画，雨量不同 -->
    <div
      v-if="(['lightRain', 'heavyRain', 'thunderstorm'].includes(currentWeather) || (isWeatherChanging && rainDrops.length > 0)) && rainDrops.length > 0"
      class="rain-container"
    >
      <!-- 雨滴 -->
      <div class="rain-drops">
        <span
          v-for="drop in rainDrops"
          :key="drop.id"
          class="rain-drop"
          :style="{
            '--delay': `${drop.delay}s`,
            '--x': drop.x,
            '--duration': `${drop.duration}s`,
            '--width': `${drop.width}px`,
            '--height': `${drop.height}px`,
          }"
          @animationend="removeRainDrop(drop.id)"
        ></span>
      </div>
      <!-- 涟漪效果（仅小雨） -->
      <div v-if="currentWeather === 'lightRain' && !isWeatherChanging" class="ripples">
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
      <!-- 闪电效果（仅雷阵雨，退场时不显示） -->
      <div
        v-if="currentWeather === 'thunderstorm' && !isWeatherChanging"
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
