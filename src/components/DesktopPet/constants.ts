// 宠物配置
export const PET_SIZE = 80;
export const TOP_MARGIN = 60; // 宠物最小 Y 坐标，留出顶部空间
export const JUMP_DURATION = 800;
export const WALK_SPEED = 2; // 固定移动速度（像素/帧）
export const IDLE_DURATION = 4000;
export const SLEEP_DURATION = 8000;
export const HAPPY_DURATION = 1500;
export const HELLO_DURATION = 1500;
export const FOOTPRINT_INTERVAL = 150; // 脚印生成间隔（毫秒）
export const FOOTPRINT_LIFETIME = 4000; // 脚印存活时间（毫秒）
export const MAX_FOOTPRINTS = 20; // 最大脚印数量

// 作息相关状态持续时间
export const YAWN_DURATION = 2000; // 打哈欠持续时间
export const SLEEPY_DURATION = 3000; // 睡眼朦胧持续时间
export const STRETCH_DURATION = 2500; // 伸懒腰持续时间
export const DREAM_TALK_INTERVAL = 15000; // 梦话间隔时间（毫秒）

import type { PetState } from "./types";

// 状态持续时间映射
export const STATE_DURATIONS: Partial<Record<PetState, number>> = {
  idle: IDLE_DURATION,
  sleeping: SLEEP_DURATION,
  jumping: JUMP_DURATION,
  happy: HAPPY_DURATION,
  hello: HELLO_DURATION,
  crying: 3000,
  angry: 2500,
  fallen: 2000,
  scared: 1500,
  thinking: 4000,
  smug: 2500,
  shy: 2000,
  confused: 2000,
  sneeze: 1000,
  grin: 2000,
  scratch: 2000,
  celebrate: 3000,
  peek: 3000,
  chase: 5000,
  dancing: 4000,
  rolling: 2000,
  yawn: YAWN_DURATION,
  sleepy: SLEEPY_DURATION,
  stretch: STRETCH_DURATION,
  bathing: 30000,
  eating: 30000,
  brickCarrying: 1800000, // 30分钟
  flyerDistributing: 1800000, // 30分钟
  programmer: 2700000, // 45分钟
};

// 状态名称中文映射
export const STATE_NAMES: Record<string, string> = {
  idle: "发呆",
  walking: "行走",
  jumping: "跳跃",
  sleeping: "睡觉",
  happy: "开心",
  crying: "大哭",
  angry: "生气",
  fallen: "摔倒",
  scared: "惊吓",
  thinking: "思考",
  smug: "得意",
  shy: "害羞",
  confused: "疑惑",
  hello: "招呼",
  sneeze: "喷嚏",
  grin: "坏笑",
  scratch: "挠头",
  celebrate: "庆祝",
  peek: "偷看",
  chase: "追逐",
  dancing: "跳舞",
  rolling: "翻滚",
  yawn: "哈欠",
  sleepy: "困倦",
  stretch: "伸懒腰",
  sleepwalking: "梦游",
  bathing: "洗澡",
  eating: "吃东西",
  brickCarrying: "搬砖",
  flyerDistributing: "发传单",
  programmer: "写代码",
};

// 不允许移动的状态
export const NON_MOVING_STATES: readonly PetState[] = [
  "sleeping",
  "happy",
  "crying",
  "angry",
  "fallen",
  "scared",
  "thinking",
  "smug",
  "shy",
  "confused",
  "hello",
  "sneeze",
  "grin",
  "scratch",
  "celebrate",
  "peek",
  "chase",
  "dancing",
  "rolling",
  "yawn",
  "sleepy",
  "stretch",
  "bathing",
  "eating",
  "brickCarrying",
  "flyerDistributing",
  "programmer",
] as const;

// 打工状态列表
export const WORK_STATES: readonly PetState[] = [
  "brickCarrying",
  "flyerDistributing",
  "programmer",
] as const;
