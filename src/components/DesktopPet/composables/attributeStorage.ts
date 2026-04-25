import type { AttributeData } from "../types";
import type { FoodType } from "./sharedState";

// localStorage 存储键
const STORAGE_KEY = "pet-attributes";

// 属性上限计算（饱腹/清洁/体力）
export function getAttributeCap(level: number): number {
  return 100 + (level - 1) * 5;
}

// 升级所需经验
export function getExpRequiredForLevel(level: number): number {
  return level * 100;
}

// 食物配置
export interface FoodConfig {
  type: FoodType;
  name: string;
  cost: number;
  satietyRestore: number;
}

export const FOOD_CONFIGS: Record<FoodType, FoodConfig> = {
  apple: { type: "apple", name: "苹果", cost: 5, satietyRestore: 25 },
  fish: { type: "fish", name: "小鱼", cost: 8, satietyRestore: 35 },
  cake: { type: "cake", name: "蛋糕", cost: 12, satietyRestore: 50 },
  lollipop: { type: "lollipop", name: "棒棒糖", cost: 3, satietyRestore: 15 },
};

// 洗澡配置
export const BATH_COST = 10;
export const BATH_CLEANLINESS_RESTORE = 50;

// 打工收入
export const WORK_INCOME: Record<string, number> = {
  brickCarrying: 35,
  flyerDistributing: 10,
  programmer: 50,
};

// 打工经验
export const WORK_EXPERIENCE: Record<string, number> = {
  brickCarrying: 35,
  flyerDistributing: 25,
  programmer: 50,
};

// 打工所需体力（等于持续分钟数）
export const WORK_STAMINA_REQUIRED: Record<string, number> = {
  brickCarrying: 35,
  flyerDistributing: 15,
  programmer: 45,
};

// 初始金币
export const STARTING_MONEY = 50;

// 默认属性数据
export const DEFAULT_ATTRIBUTE_DATA: AttributeData = {
  satiety: 100,
  cleanliness: 100,
  stamina: 100,
  health: 100,
  money: STARTING_MONEY,
  level: 1,
  experience: 0,
  dailyInteractionExp: 0,
  dailyInteractionExpDate: "",
  dailyAllowanceClaimed: "",
  lastUpdateTimestamp: Date.now(),
};

// 保存属性数据
export function saveAttributeData(data: AttributeData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("保存属性数据失败:", e);
  }
}

// 加载属性数据
export function loadAttributeData(): AttributeData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as AttributeData;
      // 基本格式验证
      if (
        typeof data.satiety === "number" &&
        typeof data.cleanliness === "number" &&
        typeof data.stamina === "number" &&
        typeof data.health === "number" &&
        typeof data.money === "number" &&
        typeof data.level === "number" &&
        typeof data.experience === "number"
      ) {
        // 兼容旧数据：补全新增字段
        if (typeof data.dailyInteractionExp !== "number") {
          data.dailyInteractionExp = 0;
        }
        if (typeof data.dailyInteractionExpDate !== "string") {
          data.dailyInteractionExpDate = "";
        }
        if (typeof data.dailyAllowanceClaimed !== "string") {
          data.dailyAllowanceClaimed = "";
        }
        return data;
      }
    }
  } catch (e) {
    console.error("加载属性数据失败:", e);
  }
  return { ...DEFAULT_ATTRIBUTE_DATA, lastUpdateTimestamp: Date.now() };
}

// 重置属性数据
export function resetAttributeData(): AttributeData {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_ATTRIBUTE_DATA, lastUpdateTimestamp: Date.now() };
}
