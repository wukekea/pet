// 商店/仓库共用的物品映射工厂
// 消除 shop 与 warehouse 中 food/bath 两个 tab 的重复映射逻辑
// （配置 → 通用卡片字段 + 各面板特有字段）
import type { ItemGridItem } from "../ui/ItemGridPanel.vue";
import { FOOD_ICONS, BATH_ICONS } from "./sharedState";
import { FOOD_CONFIGS, BATH_CONFIGS } from "./attributeStorage";

/** food/bath 的效果文案（"+30饱腹" / "+45清洁"） */
export function consumableEffectLabel(
  category: "food" | "bath",
  type: string,
): string {
  if (category === "food") {
    const f = FOOD_CONFIGS[type as keyof typeof FOOD_CONFIGS];
    return `+${f?.satietyRestore ?? 0}饱腹`;
  }
  const b = BATH_CONFIGS[type as keyof typeof BATH_CONFIGS];
  return `+${b?.cleanlinessRestore ?? 0}清洁`;
}

/** food/bath 的图标 */
export function consumableIcon(
  category: "food" | "bath",
  type: string,
): string {
  return category === "food"
    ? FOOD_ICONS[type as keyof typeof FOOD_ICONS]
    : BATH_ICONS[type as keyof typeof BATH_ICONS];
}

/** 通用卡片基础字段（type/name/icon/category），面板再叠加自己的字段 */
export function baseConsumableItem(
  category: "food" | "bath",
  type: string,
): {
  type: string;
  name: string;
  icon: string;
  decoType: undefined;
  category: "food" | "bath";
} {
  const config =
    category === "food"
      ? FOOD_CONFIGS[type as keyof typeof FOOD_CONFIGS]
      : BATH_CONFIGS[type as keyof typeof BATH_CONFIGS];
  return {
    type,
    name: config?.name ?? type,
    icon: consumableIcon(category, type),
    decoType: undefined,
    category,
  };
}

// 仅为触发 ItemGridItem 类型的引用检查（面板侧的扩展接口各自定义）
export type { ItemGridItem };
