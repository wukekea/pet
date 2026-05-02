// 共享状态 - 避免循环依赖
import { ref, computed } from "vue";
import type {
  PetDirection,
  PetPosition,
  PetState,
  FoodType,
  BathType,
  DecorationType,
} from "../types";

// 重新导出类型，保持兼容
export type { FoodType, BathType, DecorationType } from "../types";

// 宠物核心状态
export const petState = ref<PetState>("idle");
export const petDirection = ref<PetDirection>("front");
export const position = ref<PetPosition>({
  x: 50,
  y: window.innerHeight - 120,
});
export const targetPosition = ref<PetPosition>({
  x: 50,
  y: window.innerHeight - 120,
});
export const screenSize = ref({
  width: window.innerWidth,
  height: window.innerHeight,
});
export const isVisible = ref(true);
export const isDragging = ref(false);
export const stateTimer = ref<ReturnType<typeof setTimeout> | null>(null);
export const animationFrameId = ref<number | null>(null);
export const mousePosition = ref<PetPosition>({ x: 0, y: 0 });

// UI 弹窗状态 - 打开时禁用自动穿透控制
export const isDebugPanelOpen = ref(false);
export const isScheduleModalOpen = ref(false);
export const isStatsModalOpen = ref(false);
export const isContextMenuOpen = ref(false);
export const isAttributeModalOpen = ref(false);
export const isShopModalOpen = ref(false);
export const isWarehouseModalOpen = ref(false);
export const isChatPanelOpen = ref(false);

// 统一的 UI 打开状态 - 用于穿透控制
export const isAnyUiOpen = computed(
  () =>
    isDebugPanelOpen.value ||
    isScheduleModalOpen.value ||
    isStatsModalOpen.value ||
    isContextMenuOpen.value ||
    isAttributeModalOpen.value ||
    isShopModalOpen.value ||
    isWarehouseModalOpen.value ||
    isChatPanelOpen.value,
);

// 作息相关状态
export const isInSleepSchedule = ref(false);
export const isInWorkSchedule = ref(false);
export const scheduleEnabled = ref(false);
export const dreamTalkTimerId = ref<ReturnType<typeof setTimeout> | null>(null);
export const scheduleEndTime = ref<number | null>(null);

// 打工相关状态
export const workEndTime = ref<number | null>(null);

// 金币增长特效状态
export const coinGainAmount = ref<number | null>(null);

// 快捷操作面板状态
export const quickPanelVisible = ref(false);

// 食物
export const currentFood = ref<FoodType>("apple");

// 沐浴露
export const currentBathType = ref<BathType>("showerGel");

// 食物图标映射
export const FOOD_ICONS: Record<FoodType, string> = {
  apple: "🍎",
  fish: "🐟",
  cake: "🎂",
  lollipop: "🍭",
  riceBall: "🍙",
  milk: "🥛",
  steak: "🥩",
};

// 沐浴露图标映射
export const BATH_ICONS: Record<BathType, string> = {
  soap: "🧼",
  showerGel: "🧴",
  bathBall: "🫧",
  petShampoo: "🧽",
};

// 装饰图标映射
export const DECORATION_ICONS: Record<DecorationType, string> = {
  bow: "🎀",
  scarf: "🧣",
  wreath: "🌸",
  topHat: "🎩",
  sunglasses: "🕶️",
  medal: "🏅",
  crown: "👑",
  magicWand: "✨",
};

// 心情系统
export const mood = ref(60);
export type MoodLevel = "good" | "normal" | "bad";
export const moodLevel = computed<MoodLevel>(() => {
  if (mood.value >= 70) return "good";
  if (mood.value < 30) return "bad";
  return "normal";
});

// 宠物形态（从 petShapeStorage 导入）
export { currentPetShape } from "./petShapeStorage";

// LLM 配置
export interface LLMConfig {
  baseURL: string;
  apiKey: string;
  model: string;
}

function loadLLMConfig(): LLMConfig {
  try {
    const saved = localStorage.getItem("llm-config");
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    baseURL: "https://api.openai.com/v1/chat/completions",
    apiKey: "",
    model: "gpt-4o-mini",
  };
}

export const llmConfig = ref<LLMConfig>(loadLLMConfig());
