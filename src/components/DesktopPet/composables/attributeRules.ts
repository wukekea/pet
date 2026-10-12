/**
 * 属性/打工规则文案生成
 * 从 constants.ts / attributeStorage.ts 的数值常量生成悬浮提示文案，
 * 消除"文案硬编码"与"数值常量"的双源漂移——调数值后文案自动跟随。
 */
import {
  SATIETY_DECAY_INTERVAL,
  CLEANLINESS_DECAY_INTERVAL,
  STAMINA_WORK_DRAIN_INTERVAL,
  STAMINA_NORMAL_RECOVER_INTERVAL,
  STAMINA_SLEEP_RECOVER_INTERVAL,
  HEALTH_DECAY_HUNGRY_INTERVAL,
  HEALTH_DECAY_DIRTY_INTERVAL,
  HEALTH_RECOVER_INTERVAL,
  HUNGRY_THRESHOLD,
  DIRTY_THRESHOLD,
  STATE_DURATIONS,
  HEALTH_CAP,
} from "../constants";
import {
  WORK_INCOME_PER_MINUTE,
  WORK_COMPLETION_BONUS,
  WORK_STAMINA_REQUIRED,
} from "./attributeStorage";

export interface RuleItem {
  icon: string;
  text: string;
}

/** 秒 → 展示用分钟（整除时）/ 秒 */
function formatInterval(seconds: number): string {
  return seconds % 60 === 0 ? `${seconds / 60} 分钟` : `${seconds} 秒`;
}

/** 毫秒时长 → 展示用分钟 */
function formatDurationMs(ms: number): string {
  return `${Math.round(ms / 60000)} 分钟`;
}

/** 打工时饱腹/清洁衰减加速倍数（与 attributes.ts 的 /3 逻辑对应） */
const WORK_DECAY_MULTIPLIER = 3;

/** 属性条悬浮规则 */
export const attributeRules: Record<string, RuleItem[]> = {
  satiety: [
    { icon: "📉", text: `每 ${formatInterval(SATIETY_DECAY_INTERVAL)} -1` },
    { icon: "⚠️", text: `低于 ${HUNGRY_THRESHOLD} 时健康下降` },
    { icon: "🍽️", text: `低于 ${HUNGRY_THRESHOLD} 时自动吃饭` },
  ],
  cleanliness: [
    {
      icon: "📉",
      text: `每 ${formatInterval(CLEANLINESS_DECAY_INTERVAL)} -1`,
    },
    { icon: "⚠️", text: `低于 ${DIRTY_THRESHOLD} 时健康下降` },
    { icon: "🚿", text: `低于 ${DIRTY_THRESHOLD} 时自动洗澡` },
  ],
  stamina: [
    {
      icon: "📉",
      text: `打工时每 ${formatInterval(STAMINA_WORK_DRAIN_INTERVAL)} -1`,
    },
    {
      icon: "📈",
      text: `平时每 ${formatInterval(STAMINA_NORMAL_RECOVER_INTERVAL)} +1`,
    },
    {
      icon: "😴",
      text: `睡眠时每 ${formatInterval(STAMINA_SLEEP_RECOVER_INTERVAL)} +1`,
    },
    { icon: "💤", text: "为 0 时强制睡觉" },
    {
      icon: "💼",
      text: `打工需最低体力 ${Math.min(...Object.values(WORK_STAMINA_REQUIRED))}~${Math.max(...Object.values(WORK_STAMINA_REQUIRED))}`,
    },
  ],
  health: [
    {
      icon: "📉",
      text: `饥饿时每 ${formatInterval(HEALTH_DECAY_HUNGRY_INTERVAL)} -1`,
    },
    {
      icon: "📉",
      text: `脏时每 ${formatInterval(HEALTH_DECAY_DIRTY_INTERVAL)} -1`,
    },
    {
      icon: "📈",
      text: `正常时每 ${formatInterval(HEALTH_RECOVER_INTERVAL)} +1`,
    },
    { icon: "🔒", text: `上限固定 ${HEALTH_CAP}` },
    { icon: "🐾", text: "影响宠物行为表现" },
  ],
};

/** 打工悬浮规则（时长/体力/收入/完工奖全部来自常量） */
export const workRules: Record<string, RuleItem[]> = {
  brickCarrying: [
    {
      icon: "⏱️",
      text: `持续 ${formatDurationMs(STATE_DURATIONS.brickCarrying ?? 0)}`,
    },
    { icon: "⚡", text: `每 1 分钟消耗 1 体力` },
    { icon: "📉", text: `饱腹衰减加速 ${WORK_DECAY_MULTIPLIER} 倍` },
    { icon: "📉", text: `清洁衰减加速 ${WORK_DECAY_MULTIPLIER} 倍` },
    {
      icon: "💰",
      text: `每分钟获得 ${WORK_INCOME_PER_MINUTE.brickCarrying} 金币`,
    },
    {
      icon: "🎁",
      text: `完工奖 +${WORK_COMPLETION_BONUS.brickCarrying} 金币`,
    },
  ],
  flyerDistributing: [
    {
      icon: "⏱️",
      text: `持续 ${formatDurationMs(STATE_DURATIONS.flyerDistributing ?? 0)}`,
    },
    { icon: "⚡", text: `每 1 分钟消耗 1 体力` },
    {
      icon: "💰",
      text: `每分钟获得 ${WORK_INCOME_PER_MINUTE.flyerDistributing} 金币`,
    },
    {
      icon: "🎁",
      text: `完工奖 +${WORK_COMPLETION_BONUS.flyerDistributing} 金币`,
    },
  ],
  programmer: [
    {
      icon: "⏱️",
      text: `持续 ${formatDurationMs(STATE_DURATIONS.programmer ?? 0)}`,
    },
    { icon: "⚡", text: `每 1 分钟消耗 1 体力` },
    {
      icon: "💰",
      text: `每分钟获得 ${WORK_INCOME_PER_MINUTE.programmer} 金币`,
    },
    {
      icon: "🎁",
      text: `完工奖 +${WORK_COMPLETION_BONUS.programmer} 金币`,
    },
  ],
};
