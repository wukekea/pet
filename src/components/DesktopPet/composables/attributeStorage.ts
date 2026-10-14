import type { AttributeData } from "../types";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { STARTING_MONEY } from "@/data/gameData";
import { createLocalStorage } from "../utils/storage";

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
  lastUpdateTimestamp: 0, // 加载/重置时按当前时间生成
  ownedDecorations: [],
  equippedDecorations: [],
  ownedShapes: ["cloud"],
  foodInventory: {},
  bathInventory: {},
  decorationInventory: {},
};

// 兼容旧数据：补全新增字段、清理无效装备、补全形态列表。
// 返回 null 表示数据结构非法（调用方回退默认值）。
function migrate(data: Record<string, unknown>): AttributeData | null {
  // 基本格式验证
  const numericKeys = [
    "satiety",
    "cleanliness",
    "stamina",
    "health",
    "money",
    "level",
    "experience",
  ];
  for (const key of numericKeys) {
    if (typeof data[key] !== "number") return null;
  }

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
  // 兼容旧数据：补全形态列表（cloud 是默认形态，始终拥有）
  if (!Array.isArray(data.ownedShapes)) {
    data.ownedShapes = ["cloud"];
  }
  if (!(data.ownedShapes as string[]).includes("cloud")) {
    data.ownedShapes = ["cloud", ...(data.ownedShapes as string[])];
  }
  // 清理无效装备（不在拥有列表中的）
  data.equippedDecorations = (data.equippedDecorations as string[]).filter(
    (d: string) =>
      Array.isArray(data.ownedDecorations) &&
      (data.ownedDecorations as string[]).includes(d),
  );
  // 兼容库存字段
  for (const key of [
    "foodInventory",
    "bathInventory",
    "decorationInventory",
  ] as const) {
    if (typeof data[key] !== "object" || !data[key]) {
      data[key] = {};
    }
  }

  return data as unknown as AttributeData;
}

const attributeStorage = createLocalStorage<AttributeData>(
  STORAGE_KEY,
  DEFAULT_ATTRIBUTE_DATA,
  (raw): raw is AttributeData =>
    migrate(raw as Record<string, unknown>) !== null,
);

// 保存属性数据
export function saveAttributeData(data: AttributeData): void {
  attributeStorage.save(data);
}

// 加载属性数据
export function loadAttributeData(): AttributeData {
  const data = attributeStorage.load();
  // 每次加载时刷新时间戳（createLocalStorage 返回默认值的深拷贝，无共享引用问题）
  data.lastUpdateTimestamp = Date.now();
  return data;
}

// 重置属性数据
export function resetAttributeData(): AttributeData {
  const data = attributeStorage.reset();
  data.lastUpdateTimestamp = Date.now();
  return data;
}
