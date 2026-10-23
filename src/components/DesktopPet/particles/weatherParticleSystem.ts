import { ref, watch } from "vue";
import type { Particle } from "./types";
import type { ParticleRenderer } from "./types";
import { CanvasParticleRenderer } from "./CanvasParticleRenderer";
import { currentWeather, isWeatherChanging } from "../composables/weatherState";

/**
 * 雨雪粒子系统（Canvas 渲染）
 *
 * 取代原"Vue 响应式数组 + DOM span + CSS 动画"方案：
 * 粒子状态是普通对象（不进响应式系统），单层 canvas 每帧
 * drawImage，DOM churn 与 Vue 重渲染归零。
 *
 * 分层约定（为未来 WebGL 升级预留）：
 * - 本模块 = 粒子逻辑（数量、运动、生命周期、天气切换过渡）
 * - ParticleRenderer = 渲染实现（当前 Canvas 2D，可替换为
 *   WebGL 着色器实现而不动本模块一行）
 *
 * 运动复刻原 CSS keyframes：雨滴匀速直落（rain-fall），
 * 雪花 ease-in-out 半程摆动 + 回摆（snowfall），全部按
 * 毫秒时间步进，帧率无关。
 */

// ========== 雨雪配置（数值与原 WeatherBackground 保持一致） ==========
interface RainParticlesConfig {
  dropCount: number; // 初始雨滴数量
  maxDrops: number; // 最大雨滴数量
  generateInterval: number; // 生成间隔（ms）
  dropWidth: number; // 雨滴粗细（px）
  dropHeight: number; // 雨滴长度（px）
}

const rainConfigs: Record<string, RainParticlesConfig> = {
  lightRain: {
    dropCount: 25,
    maxDrops: 45,
    generateInterval: 70,
    dropWidth: 1.5,
    dropHeight: 18,
  },
  heavyRain: {
    dropCount: 60,
    maxDrops: 100,
    generateInterval: 30,
    dropWidth: 2.5,
    dropHeight: 25,
  },
  thunderstorm: {
    dropCount: 100,
    maxDrops: 180,
    generateInterval: 12,
    dropWidth: 3,
    dropHeight: 30,
  },
};

interface SnowParticlesConfig {
  flakeCount: number;
  maxFlakes: number;
  generateInterval: number;
  minSize: number;
  maxSize: number;
  minDuration: number; // 秒
  maxDuration: number; // 秒
}

const snowConfigs: Record<string, SnowParticlesConfig> = {
  lightSnow: {
    flakeCount: 18,
    maxFlakes: 25,
    generateInterval: 400,
    minSize: 4,
    maxSize: 8,
    minDuration: 4,
    maxDuration: 7,
  },
  heavySnow: {
    flakeCount: 40,
    maxFlakes: 70,
    generateInterval: 150,
    minSize: 5,
    maxSize: 12,
    minDuration: 3,
    maxDuration: 6,
  },
};

/** 舞台尺寸（与渲染器约定一致） */
const STAGE_SIZE = 280;
/** 雨滴下落行程：出生 -20px 落到 +340px（原 keyframes translateY 340px） */
const RAIN_TRAVEL = 360;
/** 雪花下落行程（原 keyframes translateY 320px，含起止偏移） */
const SNOW_TRAVEL = 330;

// ========== 对象池（复用粒子对象，避免每秒上百次分配） ==========
const particlePool: Particle[] = [];
const acquireParticle = (): Particle => {
  return (
    particlePool.pop() ?? {
      x: 0,
      y: 0,
      size: 0,
      width: 0,
      age: 0,
      lifespan: 1,
      delay: 0,
      dead: false,
    }
  );
};

// ========== 粒子内部字段（不进 ParticleRenderer 接口，渲染器无感知） ==========
interface LiveParticle extends Particle {
  /** 垂直速度（px/ms） */
  vy: number;
  /** 水平摆动幅度（仅雪花，px；雨滴恒为 0） */
  sway: number;
}

// ========== 状态 ==========
/** 当前活跃粒子（普通数组，不进 Vue 响应式） */
let particles: LiveParticle[] = [];
/** 是否有雨雪粒子存活（仅这一个布尔进响应式，供模板控制 canvas 显隐） */
export const hasActiveParticles = ref(false);

let renderer: ParticleRenderer | null = null;
let canvasEl: HTMLCanvasElement | null = null;
let rafId: number | null = null;
let lastTime = 0;
let spawnAcc = 0; // 生成计时累积器（ms）

/** 是否为雨天类型 */
const isRainWeather = (w: string) =>
  w === "lightRain" || w === "heavyRain" || w === "thunderstorm";
const isSnowWeather = (w: string) => w === "lightSnow" || w === "heavySnow";

// ========== 生成 ==========
const spawnRain = (config: RainParticlesConfig, initialDelay: number = 0) => {
  const p = acquireParticle() as LiveParticle;
  const duration = 600 + Math.random() * 300; // 0.6~0.9s，与原 spawnRainDrop 一致
  p.x = Math.random() * STAGE_SIZE;
  p.y = -20 - Math.random() * 40;
  p.size = config.dropHeight;
  p.width = config.dropWidth;
  p.vy = RAIN_TRAVEL / duration;
  p.sway = 0;
  p.age = 0;
  p.lifespan = duration;
  p.delay = initialDelay;
  p.dead = false;
  particles.push(p);
};

const spawnSnow = (config: SnowParticlesConfig, initialDelay: number = 0) => {
  const p = acquireParticle() as LiveParticle;
  const durationSec =
    config.minDuration +
    Math.random() * (config.maxDuration - config.minDuration);
  const duration = durationSec * 1000;
  p.x = Math.random() * STAGE_SIZE;
  p.y = -10;
  p.size = config.minSize + Math.random() * (config.maxSize - config.minSize);
  p.width = 0;
  p.vy = SNOW_TRAVEL / duration;
  p.sway = 15 + Math.random() * 25;
  p.age = 0;
  p.lifespan = duration;
  p.delay = initialDelay;
  p.dead = false;
  particles.push(p);
};

// ========== 主循环 ==========
const tick = (now: number) => {
  rafId = requestAnimationFrame(tick);
  const dt = Math.min(now - lastTime, 100); // 页签切回时钳制大步长
  lastTime = now;

  const weather = currentWeather.value;
  const exiting = isWeatherChanging.value;
  const rainConfig = isRainWeather(weather) ? rainConfigs[weather] : null;
  const snowConfig = isSnowWeather(weather) ? snowConfigs[weather] : null;

  // ---- 时间步进 ----
  for (const p of particles) {
    if (p.delay > 0) {
      p.delay -= dt;
      continue;
    }
    p.age += dt;
    p.y += p.vy * dt;
    if (p.sway > 0) {
      // 雪花水平摆动（复刻原 snowfall keyframes 的 ease-in-out 节奏）：
      // x(t) = sway × sin²(πt)，前半程 0→sway、后半程 sway→0 再回摆；
      // 位置直接由 t 求导得瞬时速度，无需逐步积分，帧率无关且精确
      const t = Math.min(p.age / p.lifespan, 1);
      // x 目标曲线：前半程 sin 包络摆到 +sway，后半程回摆到 -sway×0.5
      const targetX =
        t < 0.5
          ? p.sway * Math.sin(t * 2 * Math.PI) ** 2
          : p.sway * -0.5 * Math.sin((t - 0.5) * 2 * Math.PI) ** 2;
      const prevT = Math.max((p.age - dt) / p.lifespan, 0);
      const prevX =
        prevT < 0.5
          ? p.sway * Math.sin(prevT * 2 * Math.PI) ** 2
          : p.sway * -0.5 * Math.sin((prevT - 0.5) * 2 * Math.PI) ** 2;
      p.x += targetX - prevX;
    }
    if (p.age >= p.lifespan || p.y > STAGE_SIZE + 40) {
      p.dead = true;
    }
  }

  // ---- 回收死亡粒子（swap-pop，O(1) 删除） ----
  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].dead) {
      particlePool.push(particles[i]);
      particles[i] = particles[particles.length - 1];
      particles.pop();
    }
  }

  // ---- 跨类进场铺底：等退场结束（旧粒子落尽）才铺新天气初始批 ----
  // （needsEntryBatch 由 watch 置位；在这里而非 watch 里铺，是因为
  //  watch 触发时 isWeatherChanging 还没来得及置位，读到的是过期值）
  if (needsEntryBatch && !exiting) {
    if (rainConfig === null && snowConfig === null) {
      // 天气又变了且不再是雨雪：取消铺底
      needsEntryBatch = false;
    } else if (particles.length === 0) {
      // 旧粒子全部落尽：铺底批次上屏
      needsEntryBatch = false;
      spawnInitialBatch(weather);
    }
  }

  // ---- 按配置持续生成（退出过渡期间停发） ----
  if (!exiting && rainConfig) {
    spawnAcc += dt;
    while (spawnAcc >= rainConfig.generateInterval) {
      spawnAcc -= rainConfig.generateInterval;
      if (particles.length < rainConfig.maxDrops) spawnRain(rainConfig);
    }
  } else if (!exiting && snowConfig) {
    spawnAcc += dt;
    while (spawnAcc >= snowConfig.generateInterval) {
      spawnAcc -= snowConfig.generateInterval;
      if (particles.length < snowConfig.maxFlakes) spawnSnow(snowConfig);
    }
  }

  // ---- 渲染 ----
  hasActiveParticles.value = particles.length > 0;
  if (renderer && canvasEl) {
    renderer.render(
      {
        particles,
        width: STAGE_SIZE,
        height: STAGE_SIZE,
        dark: document.documentElement.classList.contains("dark-theme"),
      },
      dt,
    );
  }

  // 全部落尽且无新配置：停帧（空闲归零功耗）
  if (particles.length === 0 && !rainConfig && !snowConfig && rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

const startLoop = () => {
  if (rafId === null) {
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }
};

// ========== 生命周期入口（WeatherBackground 挂载 canvas 时调用） ==========
export function attachParticleCanvas(canvas: HTMLCanvasElement) {
  canvasEl = canvas;
  renderer?.dispose();
  renderer = new CanvasParticleRenderer(canvas);
  // 已有天气则立即进场
  ensureRunning();
}

export function detachParticleCanvas() {
  renderer?.dispose();
  renderer = null;
  canvasEl = null;
}

/** 确保循环在跑（天气进场时调用） */
function ensureRunning() {
  const w = currentWeather.value;
  if (isRainWeather(w) || isSnowWeather(w) || particles.length > 0) {
    startLoop();
  }
}

// ========== 天气切换过渡（衔接原 WeatherBackground 的切换语义） ==========
// - 雨→雨/雪→雪同类切换：在场粒子保留自然落完，只换后续生成参数
// - 雨↔雪跨类切换：先等旧粒子落尽（isWeatherChanging 退场期），
//   落尽后再铺新天气的初始批次——复刻原"雨量渐少消失，然后开始下雪"
// - 切到非雨雪：停发，落尽即停帧
//
// 铺底批次不在本 watch 里直接生成：本 watch 先于 WeatherBackground 的
// 同名 watch 触发（模块导入时注册），此刻 isWeatherChanging 尚未置位，
// 在这里读它必然是过期的 false。改为置 needsEntryBatch 标记，由 tick
// 每帧读最新状态决定时机。
let needsEntryBatch = false;

/** 铺底批次：生成一批带错峰出生延迟的粒子（复刻原 initialBatch 语义：
    正延迟 = CSS animation-delay，天空在头一两秒内逐渐下满） */
const spawnInitialBatch = (weather: string) => {
  const rainCfg = isRainWeather(weather) ? rainConfigs[weather] : null;
  const snowCfg = isSnowWeather(weather) ? snowConfigs[weather] : null;
  const count = rainCfg?.dropCount ?? snowCfg?.flakeCount ?? 0;
  for (let i = 0; i < count; i++) {
    if (rainCfg) {
      spawnRain(rainCfg, Math.random() * 1500); // 原初始批错峰约 0~1.5s
    } else if (snowCfg) {
      spawnSnow(snowCfg, Math.random() * 2500); // 原初始批错峰约 0~2.5s
    }
  }
  spawnAcc = 0;
};

watch(
  currentWeather,
  (newWeather, oldWeather) => {
    const sameCategory =
      (isRainWeather(newWeather) && isRainWeather(oldWeather || "")) ||
      (isSnowWeather(newWeather) && isSnowWeather(oldWeather || ""));

    if (isRainWeather(newWeather) || isSnowWeather(newWeather)) {
      // 跨类进场：置铺底标记，等 tick 确认退场结束再铺；
      // 同类切换：不铺底，tick 直接按新参数持续生成
      if (!sameCategory) {
        needsEntryBatch = true;
      }
      ensureRunning();
    } else {
      needsEntryBatch = false;
    }
  },
  { immediate: true },
);

// ========== 系统休眠唤醒 / 页签恢复：清空重铺，防止 dt 大跳导致瞬移 ==========
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  const w = currentWeather.value;
  if (isRainWeather(w) || isSnowWeather(w)) {
    particles.forEach((p) => particlePool.push(p));
    particles = [];
    needsEntryBatch = false;
    spawnInitialBatch(w);
    startLoop();
  }
});
