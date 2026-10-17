<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { currentWeather, isWeatherChanging } from "./composables/weatherState";
import {
  daylight,
  isDaytime,
  moonPhaseFraction,
  moonIllumination,
  celestialX,
  celestialY,
} from "./composables/dayNightState";
import { position } from "./composables/sharedState";
import {
  stars,
  meteors,
  reportMeteorDone,
  reportStageRect,
  clearStageRect,
  type Meteor,
} from "./composables/starrySkyState";
import { wishUponStarMessages } from "@/data/dialogues";
import { randomPick } from "./utils/random";
import { showCustomDialogue } from "./composables/dialogue";
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
// 注：不再挂载 dark-theme——背景明暗由昼夜遮罩层接管，系统主题只影响 UI 面板
const weatherClass = computed(() => {
  if (isWeatherChanging.value) {
    // 根据是否有雨滴或雪花判断是否显示天气背景
    if (rainDrops.value.length > 0 || snowFlakes.value.length > 0) {
      return `weather-${currentWeather.value}`;
    }
  }
  return `weather-${currentWeather.value}`;
});

// 天气背景位置 - 跟随宠物位置，居中显示
// 使用 transform 替代 left/top，利用 GPU 合成层避免 reflow
// 包含 translate(-50%, -50%) 用于居中（原在 CSS 中定义）
const weatherStyle = computed(() => ({
  transform: `translate(calc(${position.value.x + 40}px - 50%), calc(${position.value.y - 20}px - 50%))`,
}));

// ========== 昼夜系统 ==========
// 雨天（小雨/暴雨/雷阵雨）隐藏天体与月光层
const isRainy = computed(() =>
  ["lightRain", "heavyRain", "thunderstorm"].includes(currentWeather.value),
);

// 天体可见性：白天出太阳、夜晚出月亮，雨天淡出
const sunVisible = computed(() => isDaytime.value && !isRainy.value);
const moonVisible = computed(() => !isDaytime.value && !isRainy.value);

// 天体沿弧线的定位（百分比映射为 SVG viewBox 像素，舞台为 280x280）
const CELESTIAL_CONTAINER_SIZE = 280;
const celestialTransform = computed(
  () =>
    `translate(${(celestialX.value / 100) * CELESTIAL_CONTAINER_SIZE}px, ${(celestialY.value / 100) * CELESTIAL_CONTAINER_SIZE}px)`,
);

// 云道 top 百分比 → 舞台 viewBox 像素（供 <g transform="translate(0, y)"> 定位）
const cloudTopPx = (top: string) => (parseFloat(top) / 100) * 280;

// 夜间遮罩透明度：深夜最深 0.7（保持月夜蓝调的可辨识亮度），随 daylight 增大而变浅
const nightOverlayOpacity = computed(() =>
  ((1 - daylight.value) * 0.7).toFixed(3),
);

// ========== 星空层 ==========
// 星空可见性：与月亮同规则——夜晚、非雨天
const starsVisible = computed(() => !isDaytime.value && !isRainy.value);

// 星光整体亮度：月光越亮星光越淡（满月夜月光淹没了暗星）
// 满月 0.55、半月 0.75、新月 1.0；daylight 过渡期随夜幕同淡
const starBrightness = computed(() => {
  if (isDaytime.value) return 0;
  const moonDim = 1 - moonIllumination.value * 0.45; // 1 → 0.55
  // 与夜幕同步：黄昏入夜时星星随天黑亮起，黎明随天亮隐去
  return ((1 - daylight.value) * moonDim).toFixed(3);
});

// 流星尾迹向量：路径长的 35%，从头部沿运动反方向延伸（拖在头后）
const meteorTail = (m: Meteor) => ({
  dx: (m.x2 - m.x1) * -0.35,
  dy: (m.y2 - m.y1) * -0.35,
});

// 流星动画结束回调（动画 forwards 结束后从列表移除）
const onMeteorEnd = (m: Meteor) => {
  reportMeteorDone(m.id);
};

// 点击流星：许愿台词（走宠物头顶气泡 + 语音），流星"被接住"立即消失
const onMeteorClick = (m: Meteor) => {
  reportMeteorDone(m.id);
  showCustomDialogue(randomPick(wishUponStarMessages));
};

// 夜晚舞台引用：向 starrySkyState 回写舞台屏幕矩形与缩放，
// 供穿透检测把流星舞台坐标换算为屏幕坐标
const nightStageRef = ref<SVGSVGElement | null>(null);

// 舞台矩形随宠物位移持续变化（weatherStyle transform），
// 用 rAF 轻量同步——仅在流星活动期间才需要精确矩形
let stageRectRafId: number | null = null;
const syncStageRectLoop = () => {
  const el = nightStageRef.value;
  if (el) {
    const rect = el.getBoundingClientRect();
    // viewBox 280 → 实际渲染宽度（舞台无缩放时为 1）
    reportStageRect(rect, rect.width / 280);
  }
  stageRectRafId = requestAnimationFrame(syncStageRectLoop);
};

// 流星存在期间启动矩形同步，空闲时停掉（不常驻耗电）
watch(meteors, (list) => {
  if (list.length > 0 && stageRectRafId === null) {
    stageRectRafId = requestAnimationFrame(syncStageRectLoop);
  } else if (list.length === 0 && stageRectRafId !== null) {
    cancelAnimationFrame(stageRectRafId);
    stageRectRafId = null;
    clearStageRect();
  }
});

onUnmounted(() => {
  if (stageRectRafId !== null) {
    cancelAnimationFrame(stageRectRafId);
    stageRectRafId = null;
  }
  clearStageRect();
});

// 月光层透明度：满月夜最亮约 0.25，且仅夜晚非雨天生效
// 遮罩数值随 30s tick 小步变化，配合 CSS transition 平滑过渡
const moonlightOverlayOpacity = computed(() => {
  if (isDaytime.value || isRainy.value) return "0";
  return (moonIllumination.value * 0.25).toFixed(3);
});

// 月相阴影：真实月相成因是"月球被太阳照亮的一半朝向变化"，非地球遮挡（那是月食）。
// 标准月相画法（terminator 画法）：暗区由"暗侧月缘半圆弧 + 明暗交界椭圆弧"围成：
//   相位 f（0 新月 → 0.5 满月 → 1 新月），交界椭圆的带符号半宽 rx = R·cos(2πf)
//   盈月（f<0.5）亮面在右、暗侧在左；亏月相反
//   |rx|=R（新月/满月）时椭圆弧与月缘重合（全暗/全亮），rx=0（上下弦）时退化为直线
// 另加固定倾角：真实月相的明暗线因黄道倾角略有斜置（娥眉月如小船），约 -15°
const moonShadow = computed(() => {
  const f = moonPhaseFraction.value; // 0~1
  const R = 16; // 月盘半径（viewBox 坐标）
  const cx = 20;
  const cy = 20;
  const TILT_DEG = -15; // 明暗线倾角（度，负=逆时针）

  const waxing = f < 0.5; // 盈月：暗侧在左；亏月：暗侧在右
  const signedRx = Math.cos(2 * Math.PI * f) * R;

  // 两段弧均从上极点 (cx, cy-R) 画到下极点 (cx, cy+R)，再回到上极点围成暗区：
  //   椭圆弧（明暗交界线，上→下）：sweep=1 凸向右、sweep=0 凸向左
  //     娥眉/残月：交界线凸向亮侧（暗区大）；盈凸/亏凸：凸向暗侧（暗区小）
  //   月缘弧（暗侧半圆，下→上）：注意方向反转——sweep=1 凸向左、sweep=0 凸向右
  //     盈月暗侧在左（sweep=1 走左缘）、亏月暗侧在右（sweep=0 走右缘）
  const ellipseSweep = waxing === signedRx > 0 ? 1 : 0;
  const limbSweep = waxing ? 1 : 0;

  const rx = Math.abs(signedRx).toFixed(2);
  return {
    d: `M ${cx} ${cy - R} A ${rx} ${R} 0 0 ${ellipseSweep} ${cx} ${cy + R} A ${R} ${R} 0 0 ${limbSweep} ${cx} ${cy - R} Z`,
    // 整体绕月心旋转，让明暗线斜置
    transform: `rotate(${TILT_DEG} ${cx} ${cy})`,
    // 仅满月（f≈0.5，暗区退化到月缘之外）跳过阴影渲染；
    // 新月时暗区覆盖全盘，必须渲染才能"看不见月亮"
    isFullMoon: f > 0.25 && f < 0.75 && Math.abs(signedRx) >= R * 0.999,
  };
});

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

// 监听雨滴/雪花列表变化：退出动画进行中且两类粒子都已落尽时，
// 重置退出状态并启动新天气效果（此前两个回调体相同的 watcher 已合并）
watch([() => rainDrops.value.length, () => snowFlakes.value.length], () => {
  if (
    !isWeatherChanging.value ||
    rainDrops.value.length > 0 ||
    snowFlakes.value.length > 0
  ) {
    return;
  }
  isWeatherChanging.value = false;

  // 检查新天气是否需要启动效果
  const newWeather = currentWeather.value;
  const isNewRain = ["lightRain", "heavyRain", "thunderstorm"].includes(
    newWeather,
  );
  const isNewSnow = ["lightSnow", "heavySnow"].includes(newWeather);

  if (newWeather === "cloudy") {
    startCloudGeneration();
  } else if (isNewRain) {
    rainDrops.value = [];
    startRainGeneration();
  } else if (isNewSnow) {
    snowFlakes.value = [];
    startSnowGeneration();
  }
});

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

// 递归调度下一朵云（模块级函数，防止多条递归链同时运行）
const scheduleNextCloud = () => {
  if (cloudTimer) {
    clearTimeout(cloudTimer);
    cloudTimer = null;
  }
  const randomDelay = CLOUD_GENERATE_INTERVAL + Math.random() * 5000;
  cloudTimer = setTimeout(() => {
    spawnCloud();
    scheduleNextCloud();
  }, randomDelay);
};

// 启动云朵生成（清理旧链，重新生成）
const startCloudGeneration = () => {
  if (cloudTimer) {
    clearTimeout(cloudTimer);
    cloudTimer = null;
  }
  clouds.value = [];
  spawnCloud();
  scheduleNextCloud();
};

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
  () => clouds.value.length,
  (newLen) => {
    if (isWeatherChanging.value && newLen === 0) {
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
      startCloudGeneration();
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
  document.addEventListener("visibilitychange", handleWeatherVisibilityChange);
});

// 系统休眠唤醒处理：重置天气效果，防止云朵/雨滴/雪花积累堆叠
function handleWeatherVisibilityChange(): void {
  if (document.visibilityState !== "visible") return;

  const weather = currentWeather.value;

  if (weather === "cloudy") {
    // 清除积累的定时器和旧云朵，重新生成
    isWeatherChanging.value = false;
    startCloudGeneration();
  } else if (["lightRain", "heavyRain", "thunderstorm"].includes(weather)) {
    // 重置雨滴
    stopRainGeneration();
    isWeatherChanging.value = false;
    rainDrops.value = [];
    startRainGeneration();
  } else if (["lightSnow", "heavySnow"].includes(weather)) {
    // 重置雪花
    stopSnowGeneration();
    isWeatherChanging.value = false;
    snowFlakes.value = [];
    startSnowGeneration();
  }
}

// 组件卸载时清理
onUnmounted(() => {
  if (lightningTimer) {
    clearTimeout(lightningTimer);
  }
  document.removeEventListener(
    "visibilitychange",
    handleWeatherVisibilityChange,
  );
});
</script>

<template>
  <div class="weather-background" :class="weatherClass" :style="weatherStyle">
    <!-- 白天舞台：太阳 + 白天云，同层 SVG 内云对太阳像素级遮挡
         （天体组套云遮挡 mask，云画在天体之后；mask 坐标系为舞台根坐标——
         遮挡 mask 必须挂在外层无 transform 的 g 上，celestialStyle 挂中层，
         否则 mask 内容会随天体位移一起平移，挖空与可见云错位） -->
    <svg class="celestial-stage day-stage" viewBox="0 0 280 280">
      <defs>
        <!-- 云形唯一定义：日云/夜云/两个遮挡 mask 副本共用 <use> 实例 -->
        <g id="cloud-shape">
          <ellipse cx="30" cy="35" rx="25" ry="15" fill="currentColor" />
          <ellipse cx="50" cy="28" rx="30" ry="20" fill="currentColor" />
          <ellipse cx="70" cy="35" rx="22" ry="14" fill="currentColor" />
          <ellipse cx="45" cy="38" rx="20" ry="12" fill="currentColor" />
        </g>
        <!-- 太阳被云挖空：mask region 显式覆盖全弧线（-200..600），
             region 外 mask 值为 0（不可见），缺省 bbox±10% 会让
             弧线两端伸出画布的天体突然消失 -->
        <mask
          id="sun-occlusion-mask"
          maskUnits="userSpaceOnUse"
          x="-200"
          y="-200"
          width="800"
          height="800"
        >
          <rect x="-200" y="-200" width="800" height="800" fill="white" />
          <!-- 挖空副本：纯黑、不透明、无滤镜，套与可见云相同的圆形裁剪
               （继承可见云的 opacity/drop-shadow 会变成"部分挖空"＝调暗效果）；
               外层 g 定位云道，内层 g 跑动画（transform 属性与 CSS transform 分层） -->
          <g clip-path="url(#sky-clip)">
            <g
              v-for="cloud in clouds"
              :key="`sun-mask-${cloud.id}-${cloud.renderKey}`"
              :transform="`translate(0 ${cloudTopPx(cloud.config.top)})`"
            >
              <g
                class="cloud-anim cloud-mask-copy"
                :style="{
                  '--cloud-start-x': `${cloud.startPosition}px`,
                  '--cloud-end-x': `${cloud.config.endX}px`,
                  '--cloud-duration': `${getCloudDuration(cloud)}s`,
                }"
              >
                <use href="#cloud-shape" />
              </g>
            </g>
          </g>
        </mask>
        <!-- 复刻原 cloudy-container 的 border-radius:50% 圆形裁剪 -->
        <clipPath id="sky-clip">
          <circle cx="140" cy="140" r="140" />
        </clipPath>
        <!-- 太阳盘面渐变（复刻原 CSS radial-gradient at 38% 34%） -->
        <radialGradient id="sun-disc-gradient" cx="0.38" cy="0.34" r="0.9">
          <stop offset="0%" stop-color="#fffdf5" />
          <stop offset="45%" stop-color="#ffe9a8" />
          <stop offset="78%" stop-color="#ffd166" />
          <stop offset="100%" stop-color="#ffb84d" />
        </radialGradient>
        <radialGradient id="sun-halo-outer-gradient">
          <stop offset="0%" stop-color="rgba(255, 224, 130, 0.35)" />
          <stop offset="45%" stop-color="rgba(255, 213, 79, 0.16)" />
          <stop offset="70%" stop-color="rgba(255, 213, 79, 0)" />
        </radialGradient>
        <radialGradient id="sun-halo-inner-gradient">
          <stop offset="0%" stop-color="rgba(255, 248, 225, 0.5)" />
          <stop offset="55%" stop-color="rgba(255, 236, 179, 0.22)" />
          <stop offset="75%" stop-color="rgba(255, 236, 179, 0)" />
        </radialGradient>
      </defs>
      <!-- 太阳：外层 g 只挂遮挡 mask（无 transform，mask 云与可见云同坐标系），
           中层 g 挂弧线位移，雨天淡出用组级 opacity 过渡 -->
      <g mask="url(#sun-occlusion-mask)">
        <g
          class="celestial-g"
          :class="{ visible: sunVisible }"
          :style="{ transform: celestialTransform }"
        >
          <circle
            class="sun-halo-svg sun-halo-outer-svg"
            cx="0"
            cy="0"
            r="40"
          />
          <circle
            class="sun-halo-svg sun-halo-inner-svg"
            cx="0"
            cy="0"
            r="26"
          />
          <circle class="sun-disc-svg" cx="0" cy="0" r="15" />
        </g>
      </g>
      <!-- 白天云：画在太阳之后（遮挡感由上方 mask 完成，此处为可见层）
           外层 g 挂 SVG transform 属性（云道垂直定位），内层 g 跑 CSS 动画
           ——CSS transform 会覆盖 transform 属性，两者必须分层 -->
      <g clip-path="url(#sky-clip)">
        <g
          v-for="cloud in clouds"
          :key="`day-${cloud.id}-${cloud.renderKey}`"
          class="cloud-svg"
          :transform="`translate(0 ${cloudTopPx(cloud.config.top)})`"
        >
          <g
            class="cloud-anim"
            :style="{
              '--cloud-start-x': `${cloud.startPosition}px`,
              '--cloud-end-x': `${cloud.config.endX}px`,
              '--cloud-duration': `${getCloudDuration(cloud)}s`,
            }"
            @animationend="removeCloud(cloud.id)"
          >
            <use href="#cloud-shape" class="cloud-use-day" />
          </g>
        </g>
      </g>
    </svg>

    <!-- 亮度遮罩层 - 平滑过渡由 CSS transition 保证 -->
    <div class="night-overlay" :style="{ opacity: nightOverlayOpacity }"></div>

    <!-- 夜晚舞台：月亮 + 夜间蓝灰云 + 星空，在夜幕之上（z:6）——
         月相暗面由 mask 挖空透出桌面，若被夜幕压暗则亮色桌面上
         暗面比亮面亮、月相视觉反转，故舞台必须高于夜幕（既有约束） -->
    <svg
      ref="nightStageRef"
      class="celestial-stage night-stage"
      viewBox="0 0 280 280"
    >
      <defs>
        <!-- 月亮被云挖空：结构同太阳舞台 -->
        <mask
          id="moon-occlusion-mask"
          maskUnits="userSpaceOnUse"
          x="-200"
          y="-200"
          width="800"
          height="800"
        >
          <rect x="-200" y="-200" width="800" height="800" fill="white" />
          <g clip-path="url(#sky-clip-night)">
            <g
              v-for="cloud in clouds"
              :key="`moon-mask-${cloud.id}-${cloud.renderKey}`"
              :transform="`translate(0 ${cloudTopPx(cloud.config.top)})`"
            >
              <g
                class="cloud-anim cloud-mask-copy"
                :style="{
                  '--cloud-start-x': `${cloud.startPosition}px`,
                  '--cloud-end-x': `${cloud.config.endX}px`,
                  '--cloud-duration': `${getCloudDuration(cloud)}s`,
                }"
              >
                <use href="#cloud-shape" />
              </g>
            </g>
          </g>
        </mask>
        <clipPath id="sky-clip-night">
          <circle cx="140" cy="140" r="140" />
        </clipPath>
        <!-- 月相 mask：白=显示、黑=隐藏。暗区 path 以黑色挖空，
             被遮住的月面直接透明露出背景——暗面与天空天然融合，
             不再需要"猜背景色"，任何天气/亮度下都不会出现突兀色块 -->
        <mask id="moon-phase-mask">
          <rect x="0" y="0" width="40" height="40" fill="white" />
          <path
            v-if="!moonShadow.isFullMoon"
            :d="moonShadow.d"
            :transform="moonShadow.transform"
            fill="black"
          />
        </mask>
        <!-- 月盘渐变（补上现状 url(#moon-gradient) 无定义的兜底缺失） -->
        <radialGradient id="moon-gradient" cx="0.4" cy="0.35" r="0.85">
          <stop offset="0%" stop-color="#f2f5fa" />
          <stop offset="60%" stop-color="#e4eaf3" />
          <stop offset="100%" stop-color="#d3dce9" />
        </radialGradient>
        <radialGradient id="moon-halo-gradient">
          <stop offset="0%" stop-color="rgba(214, 226, 244, 0.3)" />
          <stop offset="45%" stop-color="rgba(190, 208, 236, 0.14)" />
          <stop offset="70%" stop-color="rgba(190, 208, 236, 0)" />
        </radialGradient>
        <!-- 流星拖尾渐变说明已迁移至流星元素内（按 id 动态生成） -->
      </defs>
      <!-- 星空层：夜幕之上（z:6 舞台内）、月亮之下——
           亮度由组件按 (1-daylight)×月相反比注入，雨天/白天整体隐藏；
           不挂月亮遮挡 mask（星星远比云近，被云"挖空"反而失真，云飘过星光变暗即可） -->
      <g
        class="starfield"
        :class="{ visible: starsVisible }"
        :style="{ '--star-brightness': starBrightness }"
      >
        <circle
          v-for="star in stars"
          :key="`star-${star.id}`"
          class="star"
          :class="`star-${star.kind}`"
          :cx="star.x"
          :cy="star.y"
          :r="star.r"
          :style="{
            '--twinkle-duration': `${star.twinkleDuration}s`,
            '--twinkle-delay': `${star.twinkleDelay}s`,
          }"
        />
        <!-- 十字亮星：中心点星已由上方 circle 渲染，这里补四芒 -->
        <g
          v-for="star in stars.filter((s) => s.kind === 'cross')"
          :key="`star-cross-${star.id}`"
          :transform="`translate(${star.x} ${star.y})`"
          :style="{
            '--twinkle-duration': `${star.twinkleDuration}s`,
            '--twinkle-delay': `${star.twinkleDelay}s`,
          }"
        >
          <path
            class="star star-cross-rays"
            :d="`M ${-star.r * 4.5} 0 H ${star.r * 4.5} M 0 ${-star.r * 4.5} V ${star.r * 4.5}`"
          />
        </g>
        <!-- 流星：渐隐线段 + 头部光点，CSS 动画沿起止点平移；
             点击许愿，穿透开关由 petController 按流星屏幕矩形控制 -->
        <g
          v-for="m in meteors"
          :key="`meteor-${m.id}`"
          class="meteor"
          :style="{
            '--meteor-duration': `${m.duration}ms`,
            '--meteor-x1': `${m.x1}px`,
            '--meteor-y1': `${m.y1}px`,
            '--meteor-x2': `${m.x2}px`,
            '--meteor-y2': `${m.y2}px`,
          }"
          @animationend="onMeteorEnd(m)"
          @click="onMeteorClick(m)"
        >
          <!-- 拖尾：尾部渐隐的渐变线段（渐变按头部位置与尾迹向量生成） -->
          <line
            class="meteor-tail"
            :x1="m.x1 + meteorTail(m).dx"
            :y1="m.y1 + meteorTail(m).dy"
            :x2="m.x1"
            :y2="m.y1"
            :stroke="`url(#meteor-tail-${m.id})`"
          />
          <defs>
            <linearGradient
              :id="`meteor-tail-${m.id}`"
              gradientUnits="userSpaceOnUse"
              :x1="m.x1 + meteorTail(m).dx"
              :y1="m.y1 + meteorTail(m).dy"
              :x2="m.x1"
              :y2="m.y1"
            >
              <stop offset="0%" stop-color="rgba(255, 255, 255, 0)" />
              <stop offset="70%" stop-color="rgba(220, 232, 255, 0.7)" />
              <stop offset="100%" stop-color="rgba(255, 255, 255, 0.95)" />
            </linearGradient>
          </defs>
          <!-- 头部光点 -->
          <circle :cx="m.x1" :cy="m.y1" r="1.6" class="meteor-head" />
          <!-- 不可见加宽命中线：覆盖尾迹（头部所在段），否则 1.2px 几乎点不中 -->
          <line
            class="meteor-hit"
            :x1="m.x1 + meteorTail(m).dx"
            :y1="m.y1 + meteorTail(m).dy"
            :x2="m.x1"
            :y2="m.y1"
          />
        </g>
      </g>
      <!-- 月亮三层结构：遮挡 mask（无 transform）→ 弧线位移 → 月相 mask -->
      <g mask="url(#moon-occlusion-mask)">
        <g
          class="celestial-g"
          :class="{ visible: moonVisible }"
          :style="{ transform: celestialTransform }"
        >
          <circle class="moon-halo-svg" cx="0" cy="0" r="30" />
          <!-- 月盘本体 + 环形山，按月相裁剪：只显示亮面
               mask 必须与 translate(-20 -20) 挂同一个 g：mask 内容在引用元素
               的用户坐标系里解析，元素 transform 会连同 mask 一起变换——
               挂到外层（无 translate）会让白底 rect(0..40) 与月盘(-16..16)
               只剩一个象限重叠，满月只剩 1/4 扇形 -->
          <g mask="url(#moon-phase-mask)" transform="translate(-20 -20)">
            <circle cx="20" cy="20" r="16" class="moon-body-svg" />
            <circle cx="14" cy="15" r="3" class="moon-crater-svg" />
            <circle cx="25" cy="24" r="2.2" class="moon-crater-svg" />
            <circle cx="21" cy="12" r="1.6" class="moon-crater-svg" />
          </g>
          <!-- 地照：放月相 mask 之外、遮挡 mask 之内——新月夜仍隐约可见整轮轮廓 -->
          <g transform="translate(-20 -20)">
            <circle cx="20" cy="20" r="16" class="moon-earthshine-svg" />
          </g>
        </g>
      </g>
      <!-- 夜间云：蓝灰配色，画在月亮之后（同白天云的双层结构） -->
      <g clip-path="url(#sky-clip-night)">
        <g
          v-for="cloud in clouds"
          :key="`night-${cloud.id}-${cloud.renderKey}`"
          class="cloud-svg"
          :transform="`translate(0 ${cloudTopPx(cloud.config.top)})`"
        >
          <g
            class="cloud-anim"
            :style="{
              '--cloud-start-x': `${cloud.startPosition}px`,
              '--cloud-end-x': `${cloud.config.endX}px`,
              '--cloud-duration': `${getCloudDuration(cloud)}s`,
            }"
            @animationend="removeCloud(cloud.id)"
          >
            <use href="#cloud-shape" class="cloud-use-night" />
          </g>
        </g>
      </g>
    </svg>

    <!-- 月光层 -->
    <div
      class="moonlight-overlay"
      :style="{ opacity: moonlightOverlayOpacity }"
    ></div>

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

    <!-- 多云效果 - 舞台 SVG 内已含天体与云（含遮挡），此容器仅保留给
         非白天/非夜晚舞台渲染的场景（已无内容，见上方两个 celestial-stage） -->
    <div
      v-if="currentWeather === 'cloudy' || isWeatherChanging"
      class="cloudy-container"
    ></div>

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
