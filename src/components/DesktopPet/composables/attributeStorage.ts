import type { AttributeData } from "../types";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { STARTING_MONEY } from "@/data/gameData";

// localStorage 存储键
const STORAGE_KEY = STORAGE_KEYS.attributes;

// 属性上限计算（饱腹/清洁/体力）
export function getAttributeCap(level: number): number {
  return 100 + (level - 1) * 5;
}

// 升级所需经验
export function getExpRequiredForLevel(level: number): number {
  return level * 100;
}

// 食物配置// 游戏配置常量已迁至 src/data/gameData.ts（此处 re-export 保持调用方兼容）
export * from "@/data/gameData";

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
  equippedDecorations: [],
  ownedShapes: ["cloud"],
  foodInventory: {},
  bathInventory: {},
  decorationInventory: {},
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
        if (!Array.isArray(data.equippedDecorations)) {
          data.equippedDecorations = [];
        }
        // 兼容旧数据：补全形态列表
        if (!Array.isArray(data.ownedShapes)) {
          data.ownedShapes = ["cloud"];
        }
        if (!data.ownedShapes.includes("cloud")) {
          data.ownedShapes = ["cloud", ...data.ownedShapes];
        }
        // 清理无效装备（不在拥有列表中的）
        if (Array.isArray(data.equippedDecorations)) {
          data.equippedDecorations = data.equippedDecorations.filter(
            (d: string) =>
              Array.isArray(data.ownedDecorations) &&
              data.ownedDecorations.includes(d),
          );
        }
        // 兼容库存字段
        if (typeof data.foodInventory !== "object" || !data.foodInventory) {
          data.foodInventory = {};
        }
        if (typeof data.bathInventory !== "object" || !data.bathInventory) {
          data.bathInventory = {};
        }
        if (
          typeof data.decorationInventory !== "object" ||
          !data.decorationInventory
        ) {
          data.decorationInventory = {};
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
