/**
 * 时间分区常量
 */

/** 早上 (5:00 - 11:00) */
export const TIME_PERIOD_MORNING = "早上";

/** 中午 (11:00 - 13:00) */
export const TIME_PERIOD_NOON = "中午";

/** 下午 (13:00 - 18:00) */
export const TIME_PERIOD_AFTERNOON = "下午";

/** 黄昏 (18:00 - 20:00) */
export const TIME_PERIOD_DUSK = "黄昏";

/** 夜晚 (20:00 - 24:00) */
export const TIME_PERIOD_NIGHT = "夜晚";

/** 凌晨 (0:00 - 5:00) */
export const TIME_PERIOD_DAWN = "凌晨";

/** 时间分区类型 */
export type TimePeriod =
  | typeof TIME_PERIOD_MORNING
  | typeof TIME_PERIOD_NOON
  | typeof TIME_PERIOD_AFTERNOON
  | typeof TIME_PERIOD_DUSK
  | typeof TIME_PERIOD_NIGHT
  | typeof TIME_PERIOD_DAWN;

/**
 * 获取当前时间分区
 * @returns 当前时间对应的分区名称
 */
export function getTimePeriod(): TimePeriod {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return TIME_PERIOD_MORNING;
  } else if (hour >= 11 && hour < 13) {
    return TIME_PERIOD_NOON;
  } else if (hour >= 13 && hour < 18) {
    return TIME_PERIOD_AFTERNOON;
  } else if (hour >= 18 && hour < 20) {
    return TIME_PERIOD_DUSK;
  } else if (hour >= 20 && hour < 24) {
    return TIME_PERIOD_NIGHT;
  } else {
    return TIME_PERIOD_DAWN;
  }
}
