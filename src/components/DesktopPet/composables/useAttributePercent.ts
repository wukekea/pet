/**
 * 属性百分比换算
 * 统一 attributes 面板 / QuickActionPanel 等处的
 * Math.min(100, value / cap * 100) 换算与低值判断，
 * 消除"健康上限固定 100、其他属性随等级"规则的散落实现。
 */
import { computed, type Ref } from "vue";
import { HEALTH_CAP } from "../constants";

/**
 * 计算单个属性的百分比（0-100）
 * @param value 当前值
 * @param cap 上限（健康为 HEALTH_CAP，其他为等级上限）
 */
export function attrPercent(value: number, cap: number): number {
  return Math.min(100, (value / cap) * 100);
}

/**
 * 批量属性百分比 composable
 * @param attrs 响应式属性数据（含 satiety/cleanliness/stamina/health）
 * @param attributeCap 响应式等级上限
 */
export function useAttributePercent(
  attrs: Ref<{
    satiety: number;
    cleanliness: number;
    stamina: number;
    health: number;
  }>,
  attributeCap: Ref<number>,
) {
  const satietyPct = computed(() =>
    attrPercent(attrs.value.satiety, attributeCap.value),
  );
  const cleanlinessPct = computed(() =>
    attrPercent(attrs.value.cleanliness, attributeCap.value),
  );
  const staminaPct = computed(() =>
    attrPercent(attrs.value.stamina, attributeCap.value),
  );
  const healthPct = computed(() => attrPercent(attrs.value.health, HEALTH_CAP));

  // 低值警告（低于上限 25%）
  const LOW_RATIO = 0.25;
  const isSatietyLow = computed(
    () => attrs.value.satiety / attributeCap.value < LOW_RATIO,
  );
  const isCleanlinessLow = computed(
    () => attrs.value.cleanliness / attributeCap.value < LOW_RATIO,
  );
  const isStaminaLow = computed(
    () => attrs.value.stamina / attributeCap.value < LOW_RATIO,
  );
  const isHealthLow = computed(
    () => attrs.value.health / HEALTH_CAP < LOW_RATIO,
  );

  return {
    satietyPct,
    cleanlinessPct,
    staminaPct,
    healthPct,
    isSatietyLow,
    isCleanlinessLow,
    isStaminaLow,
    isHealthLow,
  };
}
