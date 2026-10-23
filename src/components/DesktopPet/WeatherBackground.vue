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
  meteors,
  reportMeteorDone,
  reportStageRect,
  clearStageRect,
  tickStars,
  starAlpha,
  starPhase,
  type Meteor,
} from "./composables/starrySkyState";
import { StarfieldRenderer } from "./particles/StarfieldRenderer";
import {
  hasActiveParticles,
  attachParticleCanvas,
  detachParticleCanvas,
} from "./particles/weatherParticleSystem";
import { wishUponStarMessages } from "@/data/dialogues";
import { randomPick } from "./utils/random";
import { showCustomDialogue } from "./composables/dialogue";
import "./weather.css";

// ========== 昼夜系统 ==========
// 雨天（小雨/暴雨/雷阵雨）隐藏天体与月光层
const isRainy = computed(() =>
  ["lightRain", "heavyRain", "thunderstorm"].includes(currentWeather.value),
);

// 天体可见性：白天出太阳、夜晚出月亮，雨天淡出
const sunVisible = computed(() => isDaytime.value && !isRainy.value);
const moonVisible = computed(() => !isDaytime.value && !isRainy.value);

// 舞台昼夜裁剪：深夜（daylight≈0）不渲染白天舞台（太阳+遮挡 mask），
// 正午（daylight≈1）不渲染夜晚舞台（月亮+星空容器+月相/遮挡 mask）。
// 单个 SVG 舞台带两个 800×800 mask region 的层结构，仅在层树里存在
// 就有 ~7% GPU 合成成本（实测隐藏夜晚舞台 GPU 24→16）。
// 过渡期（黎明 5-7 点、黄昏 17-19 点，daylight 在中间区间）两个舞台
// 都保留——昼夜交叉淡入依赖双方同时在场，裁剪只在稳定态生效。
const DAY_STAGE_THRESHOLD = 0.05; // daylight 低于此值 = 夜晚稳定态
const NIGHT_STAGE_THRESHOLD = 0.95; // daylight 高于此值 = 白天稳定态
const showDayStage = computed(() => daylight.value > DAY_STAGE_THRESHOLD);
const showNightStage = computed(() => daylight.value < NIGHT_STAGE_THRESHOLD);

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

// 星光整体亮度：月光越亮星光越暗（满月夜月光淹没暗星）
// 满月 0.25、半月 0.62、新月 1.0，对比拉满让"满月夜看不到几颗星"可感知；
// daylight 过渡期随夜幕同淡
const starBrightness = computed(() => {
  if (isDaytime.value) return 0;
  const moonDim = 1 - moonIllumination.value * 0.75; // 1 → 0.25
  // 与夜幕同步：黄昏入夜时星星随天黑亮起，黎明随天亮隐去
  return (1 - daylight.value) * moonDim;
});

// ---------- 星空 Canvas 渲染 ----------
// 星星不再是 SVG 元素（46 颗星逐帧重绘整个夜晚舞台是深夜场景的
// 最大热点），改为星空画布 + 每帧快照位图绘制（复用雨雪粒子的
// Canvas 架构）。流星仍走 SVG（同屏最多 4 颗，量级可忽略）。
const starfieldCanvasRef = ref<HTMLCanvasElement | null>(null);
let starfieldRenderer: StarfieldRenderer | null = null;
let starfieldRafId: number | null = null;
let starfieldLastTime = 0;

const starfieldLoop = (now: number) => {
  starfieldRafId = requestAnimationFrame(starfieldLoop);
  const dt = Math.min(now - starfieldLastTime, 100);
  starfieldLastTime = now;

  if (!starfieldRenderer || !starfieldCanvasRef.value) return;
  // 仅夜晚非雨天推进与绘制（白天/雨天隐藏画布，tick 也停——
  // 星星相位冻结，重新入夜时从冻结处继续，无感）
  if (!starsVisible.value || starBrightness.value <= 0) return;

  const stars = tickStars(dt);
  starfieldRenderer.render(
    stars.map((s) => ({
      x: s.x,
      y: s.y,
      r: s.r,
      kind: s.kind,
      phase: starPhase(s),
      alpha: starAlpha(s),
    })),
    280,
    280,
    starBrightness.value,
  );
};

// 画布显隐挂 visible 类驱动 CSS opacity 过渡（入夜淡入/天亮淡出）
watch(starsVisible, (visible) => {
  starfieldCanvasRef.value?.classList.toggle("visible", visible);
});

watch(starfieldCanvasRef, (canvas) => {
  if (canvas) {
    starfieldRenderer = new StarfieldRenderer(canvas);
    if (starfieldRafId === null) {
      starfieldLastTime = performance.now();
      starfieldRafId = requestAnimationFrame(starfieldLoop);
    }
  } else {
    if (starfieldRafId !== null) {
      cancelAnimationFrame(starfieldRafId);
      starfieldRafId = null;
    }
    starfieldRenderer?.dispose();
    starfieldRenderer = null;
  }
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

// ========== 天气背景样式与位置 ==========
// 天气背景样式类（退场时保持原天气样式）
// 注：不再挂载 dark-theme——背景明暗由昼夜遮罩层接管，系统主题只影响 UI 面板
const weatherClass = computed(() => `weather-${currentWeather.value}`);

// 天气背景位置 - 跟随宠物位置，居中显示
// 性能：position 是高频变化源（宠物走动时每帧都动），走 Vue 响应式
// 会让整个组件的渲染链每帧重跑。改为 ref 拿到根元素后直改
// style.transform（只合成该层，不触发 Vue 重渲染）；transform 里的
// translate(-50%, -50%) 用于居中（原在 CSS 中定义）
//
// watch 源必须用 getter 读取深层属性：行走路径是 position.value.x +=
// 的属性突变（对象引用不变），直接 watch(position) 只浅层监听 .value
// 替换——拖动路径（整体替换对象）能触发、行走路径不触发，背景就会
// 停在原地。getter 里读取 x/y 即建立深层依赖，两种路径都能捕获，
// 且比 deep: true（整树深比较）便宜
const weatherBackgroundRef = ref<HTMLElement | null>(null);
watch(
  [() => ({ x: position.value.x, y: position.value.y }), weatherBackgroundRef],
  () => {
    const el = weatherBackgroundRef.value;
    if (!el) return;
    el.style.transform = `translate(calc(${position.value.x + 40}px - 50%), calc(${position.value.y - 20}px - 50%))`;
  },
  { immediate: true },
);

// ========== 雨雪粒子（Canvas 渲染） ==========
// 粒子逻辑与渲染在 particles/weatherParticleSystem，组件只提供画布并
// 按"天气是否需要粒子 / 退场期是否还有粒子"控制画布显隐
const particleCanvasRef = ref<HTMLCanvasElement | null>(null);
const showParticles = computed(() => {
  const w = currentWeather.value;
  const isRain = ["lightRain", "heavyRain", "thunderstorm"].includes(w);
  const isSnow = ["lightSnow", "heavySnow"].includes(w);
  return (
    isRain || isSnow || (isWeatherChanging.value && hasActiveParticles.value)
  );
});

watch(
  particleCanvasRef,
  (canvas) => {
    if (canvas) {
      attachParticleCanvas(canvas);
    } else {
      detachParticleCanvas();
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  detachParticleCanvas();
});

// ========== 涟漪效果 ==========
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

// ========== 雨雪天气标记 ==========
// 粒子的生成/回收已迁移至 particles/weatherParticleSystem（Canvas 渲染），
// 组件只保留"是否雨/雪"的判定供云朵退场与容器显隐逻辑使用
const isRainWeatherType = (w: string) =>
  ["lightRain", "heavyRain", "thunderstorm"].includes(w);
const isSnowWeatherType = (w: string) => ["lightSnow", "heavySnow"].includes(w);

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

// 监听云朵列表变化，所有云朵消失后与粒子落尽共同收口（见下方合并 watcher）

// 监听天气变化，管理云朵与退场状态
// 雨雪粒子的生成/停发由 particles/weatherParticleSystem 的 watch 与
// tick 读取 isWeatherChanging 自行处理，这里只管云与容器
watch(
  currentWeather,
  (newWeather, oldWeather) => {
    const isOldRain = isRainWeatherType(oldWeather || "");
    const isNewRain = isRainWeatherType(newWeather);
    const isOldSnow = isSnowWeatherType(oldWeather || "");
    const isNewSnow = isSnowWeatherType(newWeather);
    const isCrossCategory =
      (isOldRain && !isNewRain) || (isOldSnow && !isNewSnow);

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

    // 雨雪跨类切换：进入退场（粒子系统停发，在场粒子落尽后归位）。
    // 云朵退出与粒子退场并行进行，等两者都落定再复位（watcher 各自复位
    // 会互相打断——粒子先落尽时复位会让云动画还没播完就被清场跳变）
    if (isCrossCategory && hasActiveParticles.value) {
      isWeatherChanging.value = true;
      return;
    }

    // 正常切换逻辑
    if (cloudTimer) {
      clearTimeout(cloudTimer);
      cloudTimer = null;
    }

    // 非 cloudy 天气时清空云朵
    if (newWeather !== "cloudy") {
      clouds.value = [];
    }

    // 重置退出状态
    isWeatherChanging.value = false;

    if (newWeather === "cloudy") {
      startCloudGeneration();
    }
  },
  { immediate: true },
);

// 退场收口：粒子落尽或云朵落尽都只是"完成了一半"，两边都完成才复位
// isWeatherChanging（跨类雨雪切换时粒子与云朵退场并行进行）。
// 收口时机不是终点：复位后新天气的进场效果才开始（雨雪粒子铺底由
// 粒子系统 needsEntryBatch 驱动，云朵在此重新生成）
watch(
  [hasActiveParticles, () => clouds.value.length],
  ([activeParticles, cloudCount]) => {
    if (isWeatherChanging.value && !activeParticles && cloudCount === 0) {
      isWeatherChanging.value = false;
      // 跨类切到多云：退场复位后云朵才能重新生成（退场期间
      // spawnCloud 会因 isWeatherChanging 拒绝生成）
      if (currentWeather.value === "cloudy") {
        startCloudGeneration();
      }
    }
  },
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
  document.addEventListener("visibilitychange", handleWeatherVisibilityChange);
});

// 系统休眠唤醒处理：重置云朵，防止休眠期间积累堆叠
// （雨雪粒子由粒子系统自身的 visibilitychange 监听重置，此处不再管）
function handleWeatherVisibilityChange(): void {
  if (document.visibilityState !== "visible") return;

  const weather = currentWeather.value;

  if (weather === "cloudy") {
    // 清除积累的定时器和旧云朵，重新生成
    isWeatherChanging.value = false;
    startCloudGeneration();
  } else if (isRainWeatherType(weather) || isSnowWeatherType(weather)) {
    // 雨雪退场标记复位（粒子在粒子系统中自愈）
    isWeatherChanging.value = false;
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
  <div
    ref="weatherBackgroundRef"
    class="weather-background"
    :class="weatherClass"
  >
    <!-- 共享资源定义：云形 + 圆形裁剪。必须在两个 celestial-stage 之外——
         舞台按昼夜 v-if 裁剪后，定义若在舞台内会导致另一舞台的
         <use href="#cloud-shape"> 引用悬空（夜云消失的根因）。
         此 SVG 零渲染成本（只有 defs，无可见内容） -->
    <svg class="shared-defs" width="0" height="0" aria-hidden="true">
      <defs>
        <!-- 云形唯一定义：日云/夜云/两个遮挡 mask 副本共用 <use> 实例 -->
        <g id="cloud-shape">
          <ellipse cx="30" cy="35" rx="25" ry="15" fill="currentColor" />
          <ellipse cx="50" cy="28" rx="30" ry="20" fill="currentColor" />
          <ellipse cx="70" cy="35" rx="22" ry="14" fill="currentColor" />
          <ellipse cx="45" cy="38" rx="20" ry="12" fill="currentColor" />
        </g>
        <!-- 复刻原 cloudy-container 的 border-radius:50% 圆形裁剪（两舞台共用） -->
        <clipPath id="sky-clip">
          <circle cx="140" cy="140" r="140" />
        </clipPath>
        <clipPath id="sky-clip-night">
          <circle cx="140" cy="140" r="140" />
        </clipPath>
      </defs>
    </svg>
    <!-- 白天舞台：太阳 + 白天云，同层 SVG 内云对太阳像素级遮挡
         （天体组套云遮挡 mask，云画在天体之后；mask 坐标系为舞台根坐标——
         遮挡 mask 必须挂在外层无 transform 的 g 上，celestialStyle 挂中层，
         否则 mask 内容会随天体位移一起平移，挖空与可见云错位） -->
    <!-- v-if 昼夜裁剪：深夜不渲染白天舞台（约省 3-4% GPU 层成本），
         过渡期保留（见 showDayStage 注释） -->
    <svg
      v-if="showDayStage"
      class="celestial-stage day-stage"
      viewBox="0 0 280 280"
    >
      <defs>
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
         暗面比亮面亮、月相视觉反转，故舞台必须高于夜幕（既有约束）。
         v-if 昼夜裁剪：正午不渲染夜晚舞台（实测省 ~6-8% GPU），
         过渡期保留（见 showNightStage 注释） -->
    <svg
      v-if="showNightStage"
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
           星星在独立 Canvas 渲染（particles/StarfieldRenderer，
           原 SVG 逐星动画会整舞台逐帧重绘），流星仍为 SVG 元素；
           亮度由组件按 (1-daylight)×月相反比注入画布 -->
      <g class="starfield">
        <!-- 星空画布：z 序与原 starfield 一致（月亮之下、夜幕之上）。
             canvas 的 width/height 属性会被渲染器按 dpr 重设（物理像素），
             CSS 尺寸固定 280 逻辑像素（见 .starfield-canvas），勿写内联
             width/height 避免覆盖渲染器的物理尺寸设置 -->
        <foreignObject x="0" y="0" width="280" height="280">
          <canvas
            ref="starfieldCanvasRef"
            xmlns="http://www.w3.org/1999/xhtml"
            class="starfield-canvas"
          ></canvas>
        </foreignObject>
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
          <!-- 头部光点：辉光圆 + 核心亮点（替代原 drop-shadow 滤镜） -->
          <circle :cx="m.x1" :cy="m.y1" r="3.5" class="meteor-head-glow" />
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

    <!-- 雨雪粒子层 - Canvas 渲染（particles/weatherParticleSystem）：
         单画布替代原雨滴/雪花 DOM span，显隐跟随天气与退场期 -->
    <canvas
      v-show="showParticles"
      ref="particleCanvasRef"
      class="particle-canvas"
      width="280"
      height="280"
    ></canvas>

    <!-- 雨天辅助效果（粒子在 Canvas，此处为雾气/涟漪/闪电） -->
    <div
      v-if="isRainWeatherType(currentWeather) && !isWeatherChanging"
      class="rain-container"
    >
      <!-- 涟漪效果（仅小雨） -->
      <div v-if="currentWeather === 'lightRain'" class="ripples">
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
      <!-- 闪电效果（仅雷阵雨） -->
      <div
        v-if="currentWeather === 'thunderstorm'"
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

    <!-- 雪天辅助效果（雪花粒子在 Canvas，此处为闪光/积雪） -->
    <div
      v-if="isSnowWeatherType(currentWeather) && !isWeatherChanging"
      class="snow-container"
    >
      <!-- 雪花闪光（仅小雪） -->
      <div v-if="currentWeather === 'lightSnow'" class="sparkles">
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
      <div v-if="currentWeather === 'heavySnow'" class="snow-ground"></div>
    </div>
  </div>
</template>
