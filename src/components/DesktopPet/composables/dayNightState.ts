import { ref, computed } from "vue";

/**
 * 昼夜系统核心状态
 *
 * 时间与现实同步（本地时区），固定 6:00–18:00 为白天。
 * 所有派生值（daylight、月相、天体坐标）均为纯函数计算——
 * 非累计式，无长期漂移风险，休眠唤醒后重算即恢复。
 */

// ========== 常量 ==========
/** 白天起始时刻（小时，含） */
const DAY_START = 6;
/** 白天结束时刻（小时，不含） */
const DAY_END = 18;
/** 一天的小时数 */
const HOURS_PER_DAY = 24;
/** 朔望月平均周期（天） */
const SYNODIC_MONTH = 29.53058867;
/** 基准新月时刻：2000-01-06 18:14 UTC（已知天文事件） */
const REFERENCE_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14);

// ========== 状态刷新 ==========
/** 刷新间隔（ms）——步长配合 CSS transition，保证亮度变化不可感知 */
const REFRESH_INTERVAL = 30_000;

/** 白天亮度 0~1（0 深夜，1 正午） */
export const daylight = ref(1);
/** 月相档位（0-7：0 新月、2 上弦、4 满月、6 下弦） */
export const moonPhaseIndex = ref(0);
/** 月亮照亮比例 0~1（连续值，用于月光亮度） */
export const moonIllumination = ref(0);
/** 是否为白天 */
export const isDaytime = ref(true);
/** 太阳/月亮沿弧线的水平位置（%，-15 ~ 115，容器坐标系） */
export const celestialX = ref(50);
/** 太阳/月亮沿弧线的垂直位置（%，值越小越高） */
export const celestialY = ref(50);

// 调试用：时间偏移（小时），0 为不偏移
const timeOffsetHours = ref(0);

/** 计算昼夜核心状态（纯计算，幂等） */
function computeState(): void {
  const now = new Date(Date.now() + timeOffsetHours.value * 3600_000);
  const hours =
    now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

  // ---- daylight 分段线性插值 ----
  // 0:00–5:00 深夜 0；5:00–7:00 黎明 0→1；7:00–17:00 白天 1；17:00–19:00 黄昏 1→0；19:00–24:00 深夜 0
  let light: number;
  if (hours < 5) {
    light = 0;
  } else if (hours < 7) {
    light = (hours - 5) / 2;
  } else if (hours < 17) {
    light = 1;
  } else if (hours < 19) {
    light = 1 - (hours - 17) / 2;
  } else {
    light = 0;
  }
  daylight.value = light;
  isDaytime.value = hours >= DAY_START && hours < DAY_END;

  // ---- 月相（非累计式：每次用当前真实日期重算）----
  const daysSinceNewMoon =
    ((now.getTime() - REFERENCE_NEW_MOON_UTC) / 86_400_000) % SYNODIC_MONTH;
  const phase = daysSinceNewMoon / SYNODIC_MONTH; // 0~1，0 和 1 为新月
  moonPhaseIndex.value = Math.floor(phase * 8 + 0.5) % 8;
  moonIllumination.value = (1 - Math.cos(2 * Math.PI * phase)) / 2;

  // ---- 天体弧线坐标 ----
  // 白天进度 / 夜晚进度（6:00→18:00 / 18:00→次日 6:00 各 12 小时，各为一次完整东升西落）
  let progress: number;
  if (isDaytime.value) {
    progress = (hours - DAY_START) / (DAY_END - DAY_START);
  } else if (hours >= DAY_END) {
    // 18:00–24:00：夜晚前半段
    progress = (hours - DAY_END) / (HOURS_PER_DAY - DAY_END);
  } else {
    // 0:00–6:00：夜晚后半段，前半段（18:00–24:00）已走完
    progress = (hours + HOURS_PER_DAY - DAY_END) / (HOURS_PER_DAY - DAY_END);
  }
  // 水平：从容器左侧外(-15%)飘到右侧外(115%)；垂直：正弦弧线，贴近地平线(70%)升至最高(15%)
  celestialX.value = -15 + progress * 130;
  celestialY.value = 70 - Math.sin(Math.PI * progress) * 55;
}

// 测试辅助：用给定时间偏移计算一次坐标（计算后恢复全局偏移状态）
export function computeCelestialPositionForTest(offsetHours: number): {
  daylight: number;
  x: number;
  y: number;
} {
  const saved = timeOffsetHours.value;
  timeOffsetHours.value = offsetHours;
  computeState();
  const result = {
    daylight: daylight.value,
    x: celestialX.value,
    y: celestialY.value,
  };
  timeOffsetHours.value = saved;
  computeState();
  return result;
}

/** 调试：设置时间偏移（小时，可为负），立即重算 */
export function setTimeOffset(hours: number): void {
  timeOffsetHours.value = hours;
  computeState();
}

/** 获取当前时间偏移（调试面板显示用） */
export const timeOffset = computed(() => timeOffsetHours.value);

// ========== 生命周期 ==========
let refreshTimer: ReturnType<typeof setInterval> | null = null;

/** 初始化昼夜系统（幂等，重复调用安全） */
export function initDayNight(): void {
  computeState();
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  refreshTimer = setInterval(computeState, REFRESH_INTERVAL);
}

/** 清理定时器 */
export function cleanupDayNight(): void {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

// 系统休眠唤醒：立即重算（时间已跳变，等不到下一个 30s tick）
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      computeState();
    }
  });
}
