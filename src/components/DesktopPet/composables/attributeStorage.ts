import type { AttributeData } from "../types";
import type { FoodType, BathType, DecorationType } from "./sharedState";

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
  lollipop: { type: "lollipop", name: "棒棒糖", cost: 3, satietyRestore: 15 },
  riceBall: { type: "riceBall", name: "饭团", cost: 6, satietyRestore: 30 },
  fish: { type: "fish", name: "小鱼", cost: 8, satietyRestore: 35 },
  milk: { type: "milk", name: "牛奶", cost: 10, satietyRestore: 40 },
  cake: { type: "cake", name: "蛋糕", cost: 12, satietyRestore: 50 },
  steak: { type: "steak", name: "牛排", cost: 18, satietyRestore: 65 },
};

// 沐浴配置
export interface BathConfig {
  type: BathType;
  name: string;
  cost: number;
  cleanlinessRestore: number;
}

export const BATH_CONFIGS: Record<BathType, BathConfig> = {
  soap: { type: "soap", name: "香皂", cost: 5, cleanlinessRestore: 25 },
  showerGel: {
    type: "showerGel",
    name: "沐浴露",
    cost: 10,
    cleanlinessRestore: 45,
  },
  bathBall: {
    type: "bathBall",
    name: "浴球",
    cost: 15,
    cleanlinessRestore: 65,
  },
  petShampoo: {
    type: "petShampoo",
    name: "宠物香波",
    cost: 20,
    cleanlinessRestore: 85,
  },
};

// 装饰配置
export interface DecorationConfig {
  type: DecorationType;
  name: string;
  cost: number;
  description: string;
}

export const DECORATION_CONFIGS: Record<DecorationType, DecorationConfig> = {
  bow: { type: "bow", name: "蝴蝶结", cost: 5, description: "可爱的蝴蝶结" },
  scarf: {
    type: "scarf",
    name: "围巾",
    cost: 8,
    description: "温暖的小围巾",
  },
  wreath: {
    type: "wreath",
    name: "花环",
    cost: 12,
    description: "美丽的花环",
  },
  topHat: {
    type: "topHat",
    name: "礼帽",
    cost: 15,
    description: "优雅的礼帽",
  },
  sunglasses: {
    type: "sunglasses",
    name: "墨镜",
    cost: 18,
    description: "酷酷的墨镜",
  },
  medal: {
    type: "medal",
    name: "勋章",
    cost: 20,
    description: "荣誉勋章",
  },
  crown: {
    type: "crown",
    name: "皇冠",
    cost: 25,
    description: "华丽的皇冠",
  },
  magicWand: {
    type: "magicWand",
    name: "魔法杖",
    cost: 30,
    description: "神奇的魔法杖",
  },
};

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
  ownedDecorations: [],
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
        if (!Array.isArray(data.ownedDecorations)) {
          data.ownedDecorations = [];
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
