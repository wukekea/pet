<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { currentWeather, isWeatherChanging } from "./composables/weatherState";
import { isDark } from "./composables/theme";
import { position } from "./composables/sharedState";
import "./weather.css";

// ========== 类型定义 ==========
// 雨滴数据结构
interface RainDrop {
  id: number;
  x: string;
  duration: number;
  delay: number;
  width: number;
  height: number;
}

// 雪花数据结构
interface SnowFlake {
  id: number;
  x: string;
  duration: number;
  delay: number;
  size: number;
  sway: number;
}

// ========== 对象池 ==========
// 雨滴对象池：预创建对象，避免频繁内存分配
const rainDropPool: RainDrop[] = [];
const RAIN_POOL_SIZE = 200; // 预创建数量，覆盖最大雨滴需求

// 初始化雨滴对象池
const initRainDropPool = () => {
  for (let i = 0; i < RAIN_POOL_SIZE; i++) {
    rainDropPool.push({
      id: 0,
      x: "",
      duration: 0,
      delay: 0,
      width: 0,
      height: 0,
    });
  }
};
initRainDropPool();

// 从池中获取雨滴对象
let rainDropId = 0;
const acquireRainDrop = (): RainDrop => {
  const drop = rainDropPool.pop();
  if (drop) return drop;
  // 池空了才创建新对象
  return { id: 0, x: "", duration: 0, delay: 0, width: 0, height: 0 };
};

// 归还雨滴对象到池中
const releaseRainDrop = (drop: RainDrop) => {
  rainDropPool.push(drop);
};

// 雪花对象池：预创建对象，避免频繁内存分配
const snowFlakePool: SnowFlake[] = [];
const SNOW_POOL_SIZE = 80; // 预创建数量，覆盖最大雪花需求

// 初始化雪花对象池
const initSnowFlakePool = () => {
  for (let i = 0; i < SNOW_POOL_SIZE; i++) {
    snowFlakePool.push({
      id: 0,
      x: "",
      duration: 0,
      delay: 0,
      size: 0,
      sway: 0,
    });
  }
};
initSnowFlakePool();

// 从池中获取雪花对象
let snowFlakeId = 0;
const acquireSnowFlake = (): SnowFlake => {
  const flake = snowFlakePool.pop();
  if (flake) return flake;
  return { id: 0, x: "", duration: 0, delay: 0, size: 0, sway: 0 };
};

// 归还雪花对象到池中
const releaseSnowFlake = (flake: SnowFlake) => {
  snowFlakePool.push(flake);
};

// ========== 响应式数组 ==========
// 雨滴响应式数组
const rainDrops = ref<RainDrop[]>([]);
// 雪花响应式数组
const snowFlakes = ref<SnowFlake[]>([]);
// 涟漪数据（带唯一 key）
const ripples = ref<{ id: number; x: string; y: string }[]>([]);
let rippleId = 0;

// ========== 计算属性 ==========
// 天气背景样式类（退场时保持原天气样式）
const weatherClass = computed(() => {
  if (isWeatherChanging.value) {
    // 根据是否有雨滴或雪花判断是否显示天气背景
    if (rainDrops.value.length > 0 || snowFlakes.value.length > 0) {
      return `weather-${currentWeather.value}`;
    }
  }
  return `weather-${currentWeather.value}`;
});
const themeClass = computed(() =>
  isDark.value ? "dark-theme" : "light-theme",
);

// 天气背景位置 - 跟随宠物位置，居中显示
// 使用 transform 替代 left/top，利用 GPU 合成层避免 reflow
// 包含 translate(-50%, -50%) 用于居中（原在 CSS 中定义）
const weatherStyle = computed(() => ({
  transform: `translate(calc(${position.value.x + 40}px - 50%), calc(${position.value.y - 20}px - 50%))`,
}));

// ========== 工具函数 ==========
// 生成随机数序列用于动画延迟
const getRandomDelay = (index: number, base: number = 0.5) =>
  `${(index * 0.15 + Math.sin(index) * base).toFixed(2)}s`;

// 生成随机位置
const getRandomPos = (index: number) => `${(index * 37) % 100}%`;

// ========== 涟漪效果 ==========
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
let rippleDelayTimer: ReturnType<typeof setTimeout> | null = null;
let rippleIntervalTimer: ReturnType<typeof setInterval> | null = null;

watch(
  currentWeather,
  (newWeather) => {
    if (rippleDelayTimer) {
      clearTimeout(rippleDelayTimer);
      rippleDelayTimer = null;
    }
    if (rippleIntervalTimer) {
      clearInterval(rippleIntervalTimer);
      rippleIntervalTimer = null;
    }
    ripples.value = [];
    if (newWeather === "lightRain") {
      // 延迟 1s 后开始生成涟漪（等雨水先落地）
      rippleDelayTimer = setTimeout(() => {
        rippleIntervalTimer = setInterval(addRipple, 500);
      }, 1000);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (rippleDelayTimer) {
    clearTimeout(rippleDelayTimer);
  }
  if (rippleIntervalTimer) {
    clearInterval(rippleIntervalTimer);
  }
});

// ========== 雨天效果配置 ==========
// 雨量配置（三种雨共用同一套动画，仅雨量不同）
interface RainConfig {
  dropCount: number; // 初始雨滴数量
  maxDrops: number; // 最大雨滴数量
  generateInterval: number; // 生成间隔（ms）
  dropWidth: number; // 雨滴粗细（px）
  dropHeight: number; // 雨滴长度（px）
  hasRipple: boolean; // 是否有涟漪效果
  hasLightning: boolean; // 是否有闪电效果
}

const rainConfigs: Record<string, RainConfig> = {
  lightRain: {
    dropCount: 25, // 适中初始雨滴
    maxDrops: 45, // 屏幕上最多45颗
    generateInterval: 70, // 70ms一颗
    dropWidth: 1.5, // 较细
    dropHeight: 18, // 较短
    hasRipple: true,
    hasLightning: false,
  },
  heavyRain: {
    dropCount: 60, // 较多初始雨滴
    maxDrops: 100, // 屏幕上最多100颗
    generateInterval: 30, // 生成快，30ms一颗
    dropWidth: 2.5, // 较粗
    dropHeight: 25, // 较长
    hasRipple: false,
    hasLightning: false,
  },
  thunderstorm: {
    dropCount: 100, // 大量初始雨滴
    maxDrops: 180, // 屏幕上最多180颗
    generateInterval: 12, // 生成非常快，12ms一颗
    dropWidth: 3, // 最粗
    dropHeight: 30, // 最长
    hasRipple: false,
    hasLightning: true,
  },
};

// ========== 雪天效果配置 ==========
// 雪量配置（两种雪共用同一套动画，仅雪量不同）
interface SnowConfig {
  flakeCount: number; // 初始雪花数量
  maxFlakes: number; // 最大雪花数量
  generateInterval: number; // 生成间隔（ms）
  minSize: number; // 最小尺寸
  maxSize: number; // 最大尺寸
  minDuration: number; // 最小下落时长
  maxDuration: number; // 最大下落时长
  hasSparkles: boolean; // 是否有闪光效果
  hasSnowGround: boolean; // 是否有积雪效果
}

const snowConfigs: Record<string, SnowConfig> = {
  lightSnow: {
    flakeCount: 18,
    maxFlakes: 25,
    generateInterval: 400,
    minSize: 4,
    maxSize: 8,
    minDuration: 4,
    maxDuration: 7,
    hasSparkles: true,
    hasSnowGround: false,
  },
  heavySnow: {
    flakeCount: 40,
    maxFlakes: 70,
    generateInterval: 150,
    minSize: 5,
    maxSize: 12,
    minDuration: 3,
    maxDuration: 6,
    hasSparkles: false,
    hasSnowGround: true,
  },
};

// 获取当前雪的配置
const getCurrentSnowConfig = (): SnowConfig | null => {
  const weather = currentWeather.value;
  if (["lightSnow", "heavySnow"].includes(weather)) {
    return snowConfigs[weather];
  }
  return null;
};

// 生成雪花（使用对象池）
const spawnSnowFlake = () => {
  if (isWeatherChanging.value) return;

  const config = getCurrentSnowConfig();
  if (!config) return;

  // 从对象池获取
  const flake = acquireSnowFlake();
  flake.id = ++snowFlakeId;
  flake.x = `${Math.floor(Math.random() * 100)}%`;
  flake.duration =
    config.minDuration +
    Math.random() * (config.maxDuration - config.minDuration);
  flake.delay = 0;
  flake.size =
    config.minSize + Math.random() * (config.maxSize - config.minSize);
  flake.sway = 15 + Math.random() * 25;

  snowFlakes.value.push(flake);
};

// 移除雪花（动画结束后调用，归还对象池）
const removeSnowFlake = (id: number) => {
  const index = snowFlakes.value.findIndex((f) => f.id === id);
  if (index !== -1) {
    const flake = snowFlakes.value[index];
    releaseSnowFlake(flake); // 归还对象池
    snowFlakes.value.splice(index, 1);
  }
};

// 启动雪花生成
const startSnowGeneration = (initialBatch: boolean = true) => {
  const config = getCurrentSnowConfig();
  if (!config) return;

  // 立即生成一批雪花（仅首次进入雪天时）
  if (initialBatch) {
    for (let i = 0; i < config.flakeCount; i++) {
      // 从对象池获取
      const flake = acquireSnowFlake();
      flake.id = ++snowFlakeId;
      flake.x = `${(i * 5 + Math.random() * 10) % 100}%`;
      flake.duration = config.minDuration + (i % 4) * 0.5;
      flake.delay = parseFloat(getRandomDelay(i, 0.5));
      flake.size = config.minSize + (i % 3) * 2;
      flake.sway = 15 + (i % 5) * 5;

      snowFlakes.value.push(flake);
    }
  }

  // 持续生成新雪花
  snowTimer = setInterval(() => {
    if (snowFlakes.value.length < config.maxFlakes) {
      spawnSnowFlake();
    }
  }, config.generateInterval);
};

// 停止雪花生成
const stopSnowGeneration = () => {
  if (snowTimer) {
    clearInterval(snowTimer);
    snowTimer = null;
  }
};

// 雨滴相关变量
let rainTimer: ReturnType<typeof setInterval> | null = null;
let snowTimer: ReturnType<typeof setInterval> | null = null;

// 获取当前雨的配置
const getCurrentRainConfig = (): RainConfig | null => {
  const weather = currentWeather.value;
  if (["lightRain", "heavyRain", "thunderstorm"].includes(weather)) {
    return rainConfigs[weather];
  }
  return null;
};

// 生成雨滴（使用对象池）
const spawnRainDrop = () => {
  // 退出状态下不再生成新雨滴
  if (isWeatherChanging.value) return;

  const config = getCurrentRainConfig();
  if (!config) return;

  // 统一的雨滴动画参数
  const baseDuration = 0.6;
  const durationVariation = 0.3;

  // 从对象池获取
  const drop = acquireRainDrop();
  drop.id = ++rainDropId;
  drop.x = `${Math.floor(Math.random() * 100)}%`;
  drop.duration = baseDuration + Math.random() * durationVariation;
  drop.delay = 0;
  drop.width = config.dropWidth;
  drop.height = config.dropHeight;

  rainDrops.value.push(drop);
};

// 移除雨滴（动画结束后调用，归还对象池）
const removeRainDrop = (id: number) => {
  const index = rainDrops.value.findIndex((d) => d.id === id);
  if (index !== -1) {
    const drop = rainDrops.value[index];
    releaseRainDrop(drop); // 归还对象池
    rainDrops.value.splice(index, 1);
  }
};

// 监听雨滴列表变化，所有雨滴消失后重置退出状态并启动新天气效果
watch(
  rainDrops,
  (newDrops) => {
    if (
      isWeatherChanging.value &&
      newDrops.length === 0 &&
      snowFlakes.value.length === 0
    ) {
      isWeatherChanging.value = false;

      // 检查新天气是否需要启动效果
      const newWeather = currentWeather.value;
      const isNewRain = ["lightRain", "heavyRain", "thunderstorm"].includes(
        newWeather,
      );
      const isNewSnow = ["lightSnow", "heavySnow"].includes(newWeather);

      if (newWeather === "cloudy") {
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
      } else if (isNewRain) {
        rainDrops.value = [];
        startRainGeneration();
      } else if (isNewSnow) {
        snowFlakes.value = [];
        startSnowGeneration();
      }
    }
  },
  { deep: true },
);

// 监听雪花列表变化，所有雪花消失后重置退出状态并启动新天气效果
watch(
  snowFlakes,
  (newFlakes) => {
    if (
      isWeatherChanging.value &&
      newFlakes.length === 0 &&
      rainDrops.value.length === 0
    ) {
      isWeatherChanging.value = false;

      // 检查新天气是否需要启动效果
      const newWeather = currentWeather.value;
      const isNewRain = ["lightRain", "heavyRain", "thunderstorm"].includes(
        newWeather,
      );
      const isNewSnow = ["lightSnow", "heavySnow"].includes(newWeather);

      if (newWeather === "cloudy") {
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
      } else if (isNewRain) {
        rainDrops.value = [];
        startRainGeneration();
      } else if (isNewSnow) {
        snowFlakes.value = [];
        startSnowGeneration();
      }
    }
  },
  { deep: true },
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
      // 从对象池获取
      const drop = acquireRainDrop();
      drop.id = ++rainDropId;
      drop.x = `${(i * 5) % 100}%`;
      drop.duration = baseDuration + (i % 4) * 0.05;
      drop.delay = parseFloat(getRandomDelay(i, 0.2));
      drop.width = config.dropWidth;
      drop.height = config.dropHeight;

      rainDrops.value.push(drop);
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
  { startX: -90, endX: 270, speedMultiplier: 0.95, top: "5%" },
  { startX: -90, endX: 270, speedMultiplier: 0.85, top: "20%" },
  { startX: -90, endX: 270, speedMultiplier: 0.9, top: "35%" },
];

// 计算云朵动画持续时间（秒）
const getCloudDuration = (cloud: Cloud) => {
  const distance = cloud.config.endX - cloud.startPosition;
  const speedMultiplier = isWeatherChanging.value
    ? CLOUD_EXIT_SPEED_MULTIPLIER
    : 1;
  const speed =
    CLOUD_BASE_SPEED * cloud.config.speedMultiplier * speedMultiplier;
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

  const randomConfig =
    cloudPositions[Math.floor(Math.random() * cloudPositions.length)];
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

      // 检查新天气是否需要启动效果
      const newWeather = currentWeather.value;
      const isNewRain = ["lightRain", "heavyRain", "thunderstorm"].includes(
        newWeather,
      );
      const isNewSnow = ["lightSnow", "heavySnow"].includes(newWeather);

      if (isNewRain) {
        rainDrops.value = [];
        startRainGeneration();
      } else if (isNewSnow) {
        snowFlakes.value = [];
        startSnowGeneration();
      }
    }
  },
  { deep: true },
);

// 监听天气变化，启动/停止云朵和雨滴生成
watch(
  currentWeather,
  (newWeather, oldWeather) => {
    const isOldRain = ["lightRain", "heavyRain", "thunderstorm"].includes(
      oldWeather || "",
    );
    const isNewRain = ["lightRain", "heavyRain", "thunderstorm"].includes(
      newWeather,
    );
    const isOldSnow = ["lightSnow", "heavySnow"].includes(oldWeather || "");
    const isNewSnow = ["lightSnow", "heavySnow"].includes(newWeather);

    // 从多云切换到其他天气：启动云朵退出动画
    if (
      oldWeather === "cloudy" &&
      newWeather !== "cloudy" &&
      clouds.value.length > 0
    ) {
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
      startRainGeneration(false);
      return;
    }

    // 从雪天切换到非雪天：启动雪花退出（等待现有雪花落尽）
    if (isOldSnow && !isNewSnow && snowFlakes.value.length > 0) {
      stopSnowGeneration();
      isWeatherChanging.value = true;
      return;
    }

    // 雪天之间切换：平滑过渡，不清空现有雪花
    if (isOldSnow && isNewSnow) {
      stopSnowGeneration();
      isWeatherChanging.value = false;
      startSnowGeneration(false);
      return;
    }

    // 正常切换逻辑
    if (cloudTimer) {
      clearTimeout(cloudTimer);
      cloudTimer = null;
    }
    stopRainGeneration();
    stopSnowGeneration();

    // 非 cloudy 天气时清空云朵
    if (newWeather !== "cloudy") {
      clouds.value = [];
    }

    // 非雨天时清空雨滴
    if (!isNewRain) {
      rainDrops.value = [];
    }

    // 非雪天时清空雪花
    if (!isNewSnow) {
      snowFlakes.value = [];
    }

    // 重置退出状态
    isWeatherChanging.value = false;

    if (newWeather === "cloudy") {
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

    // 启动雪天（从非雪天切换到雪天）
    if (isNewSnow) {
      snowFlakes.value = [];
      startSnowGeneration();
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (cloudTimer) {
    clearTimeout(cloudTimer);
  }
  stopRainGeneration();
  stopSnowGeneration();
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
    <div
      v-if="currentWeather === 'sunny' && !isWeatherChanging"
      class="sunny-container"
    >
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
    <div
      v-if="currentWeather === 'cloudy' || isWeatherChanging"
      class="cloudy-container"
    >
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
      v-if="
        (['lightRain', 'heavyRain', 'thunderstorm'].includes(currentWeather) ||
          (isWeatherChanging && rainDrops.length > 0)) &&
        rainDrops.length > 0
      "
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
      <div
        v-if="currentWeather === 'lightRain' && !isWeatherChanging"
        class="ripples"
      >
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

    <!-- 雪天效果 - 统一动画，雪量不同 -->
    <div
      v-if="
        (['lightSnow', 'heavySnow'].includes(currentWeather) ||
          (isWeatherChanging && snowFlakes.length > 0)) &&
        snowFlakes.length > 0
      "
      class="snow-container"
    >
      <!-- 雪花 -->
      <div class="snowflakes">
        <span
          v-for="flake in snowFlakes"
          :key="flake.id"
          class="snowflake"
          :style="{
            '--delay': `${flake.delay}s`,
            '--x': flake.x,
            '--duration': `${flake.duration}s`,
            '--size': `${flake.size}px`,
            '--sway': `${flake.sway}px`,
          }"
          @animationend="removeSnowFlake(flake.id)"
        ></span>
      </div>
      <!-- 雪花闪光（仅小雪） -->
      <div
        v-if="currentWeather === 'lightSnow' && !isWeatherChanging"
        class="sparkles"
      >
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
      <!-- 积雪效果（仅大雪） -->
      <div
        v-if="currentWeather === 'heavySnow' && !isWeatherChanging"
        class="snow-ground"
      ></div>
    </div>
  </div>
</template>
