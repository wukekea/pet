import { ref, watch } from "vue";
import { isDaytime } from "./dayNightState";
import { currentWeather } from "./weatherState";

/**
 * 夜晚星空层状态
 *
 * 星星有生命周期：出生（随机延迟错峰）→ 闪烁 3~6 个周期（每周期
 * 最暗→最亮→最暗）→ 熄灭淡出 → 移除并在别处重生，总星数恒定。
 * 渲染层只负责绘制与转发 animationend，生死流转都在本模块完成。
 * 流星走运行时随机调度；星星亮度由组件按 daylight/月相直接算。
 */

// ========== 常量 ==========
/** 舞台 viewBox 尺寸（与 WeatherBackground 夜晚舞台一致） */
const STAGE_SIZE = 280;
/** 同屏星星总数（密度与 280px 舞台匹配：约 1 颗/170px²） */
const STAR_COUNT = 46;
/** 新星与现有星的最小间距（舞台 px），避免扎堆 */
const STAR_MIN_DISTANCE = 18;
/** 单颗星一次生命的闪烁周期数范围 */
const STAR_MIN_CYCLES = 3;
const STAR_MAX_CYCLES = 6;
/** 同屏流星上限 */
const MAX_METEORS = 4;
/** 流星调度间隔下限（ms） */
const METEOR_MIN_INTERVAL = 9_000;
/** 流星调度间隔上限（ms） */
const METEOR_MAX_INTERVAL = 60_000;
/** 流星动画基础时长（ms），实际时长在此基础上 ±15% 随机 */
const METEOR_DURATION = 5_500;
/** 入夜后首颗流星的延迟（ms）——星星先亮，流星后到 */
const METEOR_INITIAL_DELAY = 3_000;

// ========== 星星（有生命周期） ==========
/** 单颗星：三种形态——普通点星、十字亮星、泛蓝大星 */
export interface Star {
  id: number;
  x: number; // 舞台坐标 0~280
  y: number; // 舞台坐标 0~280（偏上半区）
  r: number; // 半径
  kind: "dot" | "cross" | "bright";
  twinkleDuration: number; // 单个明暗周期时长（s）
  cycles: number; // 本次生命闪烁的周期数
  delay: number; // 出生延迟（s），错开避免整片同步亮起
  dying: boolean; // 周期走完、熄灭淡出中
}

/** 在场星星列表 */
export const liveStars = ref<Star[]>([]);
let starId = 0;

/** 挑一个出生点：随机取点，尽量与现有星保持最小间距（最多尝试 8 次） */
function pickStarPosition(): { x: number; y: number } {
  let x = 0;
  let y = 0;
  for (let i = 0; i < 8; i++) {
    // 星空只占上半区（地平线以下无星），横向略出血增加开阔感
    x = -6 + Math.random() * (STAGE_SIZE + 12);
    y = Math.random() * STAGE_SIZE * 0.62;
    const tooClose = liveStars.value.some(
      (s) => (s.x - x) ** 2 + (s.y - y) ** 2 < STAR_MIN_DISTANCE ** 2,
    );
    if (!tooClose) break;
  }
  return { x, y };
}

/** 生成一颗新星加入列表 */
function spawnStar(): void {
  const { x, y } = pickStarPosition();
  // 星等分布：少量亮星 + 多数暗星
  const roll = Math.random();
  const kind: Star["kind"] =
    roll < 0.08 ? "bright" : roll < 0.24 ? "cross" : "dot";
  liveStars.value.push({
    id: ++starId,
    x,
    y,
    r:
      kind === "bright"
        ? 1.4
        : kind === "cross"
          ? 1.1
          : 0.55 + Math.random() * 0.5,
    kind,
    twinkleDuration: 2.2 + Math.random() * 3.4,
    cycles:
      STAR_MIN_CYCLES +
      Math.floor(Math.random() * (STAR_MAX_CYCLES - STAR_MIN_CYCLES + 1)),
    delay: Math.random() * 3,
    dying: false,
  });
}

/** 闪烁周期全部走完：进入熄灭淡出（重复调用安全） */
export function retireStar(id: number): void {
  const star = liveStars.value.find((s) => s.id === id);
  if (!star || star.dying) return;
  star.dying = true;
}

/** 熄灭淡出结束：移除并另处重生，保持总星数（重复调用安全） */
export function recycleStar(id: number): void {
  if (!liveStars.value.some((s) => s.id === id)) return;
  liveStars.value = liveStars.value.filter((s) => s.id !== id);
  spawnStar();
}

// 初始铺满星表（出生延迟错峰，天空渐次亮起）
for (let i = 0; i < STAR_COUNT; i++) spawnStar();

// ========== 流星 ==========
/** 单颗流星：起止点为舞台坐标 */
export interface Meteor {
  id: number;
  x1: number; // 起点舞台 x
  y1: number; // 起点舞台 y
  x2: number; // 终点舞台 x
  y2: number; // 终点舞台 y
  duration: number; // 飞行时长（ms）
}

/** 当前活动流星列表 */
export const meteors = ref<Meteor[]>([]);

/** 渲染组件回报流星动画结束（按 id 移除） */
export function reportMeteorDone(id: number): void {
  meteors.value = meteors.value.filter((m) => m.id !== id);
}

/**
 * 鼠标是否命中任一活动流星（用于穿透检测）
 * @param x 鼠标屏幕坐标 x
 * @param y 鼠标屏幕坐标 y
 * @param hitboxOf 流星舞台坐标 → 屏幕矩形的换算函数（由调用方注入，
 *                 因为舞台缩放/位移信息在渲染层）
 */
export function isMouseOnMeteor(
  x: number,
  y: number,
  hitboxOf: (m: Meteor) => {
    left: number;
    top: number;
    right: number;
    bottom: number;
  },
): boolean {
  return meteors.value.some((m) => {
    const box = hitboxOf(m);
    return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
  });
}

// ========== 舞台坐标 → 屏幕坐标 ==========
// 夜晚舞台是 280×280 viewBox 的 SVG，跟随宠物位移（weatherStyle transform）。
// 渲染层挂载后回写舞台元素的 getBoundingClientRect，本模块据此把流星
// 的舞台坐标换算为屏幕坐标。
let stageRect: DOMRect | null = null;
/** 舞台 viewBox 与实际渲染尺寸的换算比例 */
let stageScale = 1;

/** 渲染组件挂载/位移时回写舞台屏幕矩形与缩放 */
export function reportStageRect(rect: DOMRect, scale: number): void {
  stageRect = rect;
  stageScale = scale;
}

/** 清空舞台矩形（组件卸载时调用，避免穿透检测引用过期坐标） */
export function clearStageRect(): void {
  stageRect = null;
}

/** 流星屏幕矩形（含命中加宽），舞台矩形缺失时返回零矩形=不可命中 */
export function meteorScreenHitbox(m: Meteor) {
  const HIT_PAD = 14; // 命中区向四周加宽（px）
  if (!stageRect) {
    return { left: 0, top: 0, right: 0, bottom: 0 };
  }
  const x1 = stageRect.left + m.x1 * stageScale;
  const y1 = stageRect.top + m.y1 * stageScale;
  const x2 = stageRect.left + m.x2 * stageScale;
  const y2 = stageRect.top + m.y2 * stageScale;
  return {
    left: Math.min(x1, x2) - HIT_PAD,
    top: Math.min(y1, y2) - HIT_PAD,
    right: Math.max(x1, x2) + HIT_PAD,
    bottom: Math.max(y1, y2) + HIT_PAD,
  };
}

let meteorId = 0;
let meteorTimer: ReturnType<typeof setTimeout> | null = null;

/** 生成一颗流星：从上半区随机点向左下方划落 */
function spawnMeteor(): void {
  if (meteors.value.length >= MAX_METEORS) return;
  const rand = Math.random;
  // 起点在上半区右半边，向左下划落（与云飘向相反，避免视觉打架）
  const x1 = STAGE_SIZE * (0.45 + rand() * 0.45);
  const y1 = STAGE_SIZE * rand() * 0.3;
  const length = 70 + rand() * 60;
  const angle = Math.PI * (0.68 + rand() * 0.14); // 约 122°~147°：左下方向
  meteors.value.push({
    id: ++meteorId,
    x1,
    y1,
    x2: x1 + Math.cos(angle) * length,
    y2: y1 + Math.sin(angle) * length,
    duration: METEOR_DURATION * (0.85 + rand() * 0.3),
  });
}

/** 递归调度下一颗流星（随机长间隔，肉眼"偶发"感） */
function scheduleNextMeteor(): void {
  if (meteorTimer) {
    clearTimeout(meteorTimer);
    meteorTimer = null;
  }
  const delay =
    METEOR_MIN_INTERVAL +
    Math.random() * (METEOR_MAX_INTERVAL - METEOR_MIN_INTERVAL);
  meteorTimer = setTimeout(() => {
    spawnMeteor();
    scheduleNextMeteor();
  }, delay);
}

/** 停止调度并清空现有流星（天亮/入雨时调用） */
function stopMeteors(): void {
  if (meteorTimer) {
    clearTimeout(meteorTimer);
    meteorTimer = null;
  }
  meteors.value = [];
}

/**
 * 夜间非雨天判定（流星调度启停条件）
 * 雨天隐藏天体（既有规则），星空与之保持一致——入雨时流星立即熄灭
 */
function isNightSkyClear(): boolean {
  return (
    !isDaytime.value &&
    !["lightRain", "heavyRain", "thunderstorm"].includes(currentWeather.value)
  );
}

// 调试/测试入口：无视调度条件立即生成一颗流星
export function triggerMeteorForDebug(): void {
  spawnMeteor();
}

// 夜晚开始/结束、雨天切换时启停流星调度
watch(
  [isDaytime, currentWeather],
  () => {
    if (isNightSkyClear()) {
      if (!meteorTimer && meteors.value.length === 0) {
        meteorTimer = setTimeout(() => {
          meteorTimer = null;
          spawnMeteor();
          scheduleNextMeteor();
        }, METEOR_INITIAL_DELAY);
      }
    } else {
      stopMeteors();
    }
  },
  { immediate: true },
);
