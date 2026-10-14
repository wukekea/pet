<script setup lang="ts">
import { computed, ref } from "vue";
import { isDark } from "../composables/theme";
import BaseModal from "../ui/BaseModal.vue";
import MoneyBadge from "../ui/MoneyBadge.vue";
import TabBar from "../ui/TabBar.vue";
import ToastNotification from "../ui/ToastNotification.vue";
import ItemGridPanel from "../ui/ItemGridPanel.vue";
import type { ItemGridItem } from "../ui/ItemGridPanel.vue";
import { usePanelTheme, useAmberCardTheme } from "../composables/usePanelTheme";
import { useToast } from "../composables/useToast";
import {
  baseConsumableItem,
  consumableEffectLabel,
} from "../composables/itemFactories";
import type {
  FoodType,
  BathType,
  DecorationType,
} from "../composables/sharedState";
import {
  useAttributeRef,
  buyFoodItem,
  buyBathItem,
  buyDecoration,
  buyPetShape,
} from "../composables/attributes";
import {
  FOOD_CONFIGS,
  BATH_CONFIGS,
  DECORATION_CONFIGS,
  SHAPE_SHOP_CONFIGS,
  getDecorationEffectDescription,
} from "../composables/attributeStorage";
import type { PetShape } from "../types";

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

// 属性数据
const attrData = useAttributeRef();

// 当前分类 Tab
const activeTab = ref<"food" | "bath" | "decoration" | "shape">("food");

// Tab 配置（TabBar 组件数据驱动）
const shopTabs = [
  { key: "food", icon: "🍽️", label: "食物" },
  { key: "bath", icon: "🛁", label: "沐浴露" },
  { key: "decoration", icon: "💍", label: "装饰" },
  { key: "shape", icon: "🐾", label: "形态" },
];

// 购买提示
const { toastMessage, toastVisible, showToast } = useToast();

// 当前展示的物品列表（通用卡片结构 + 商店特有的价格/拥有字段）
interface ShopItem extends ItemGridItem {
  cost: number;
  canAfford: boolean;
  effectLabel: string;
  equipped: boolean;
  inInventory: boolean;
}

const currentItems = computed<ShopItem[]>(() => {
  const money = attrData.value.money;
  const owned = attrData.value.ownedDecorations || [];
  const equipped = attrData.value.equippedDecorations || [];
  const decoInv = attrData.value.decorationInventory || {};

  if (activeTab.value === "food") {
    return Object.values(FOOD_CONFIGS).map((f) => ({
      ...baseConsumableItem("food", f.type),
      cost: f.cost,
      canAfford: money >= f.cost,
      effectLabel: consumableEffectLabel("food", f.type),
      owned: false,
      equipped: false,
      inInventory: false,
      disabled: money < f.cost,
    }));
  }

  if (activeTab.value === "bath") {
    return Object.values(BATH_CONFIGS).map((b) => ({
      ...baseConsumableItem("bath", b.type),
      cost: b.cost,
      canAfford: money >= b.cost,
      effectLabel: consumableEffectLabel("bath", b.type),
      owned: false,
      equipped: false,
      inInventory: false,
      disabled: money < b.cost,
    }));
  }

  if (activeTab.value === "shape") {
    const ownedShapes = attrData.value.ownedShapes ?? ["cloud"];
    return Object.values(SHAPE_SHOP_CONFIGS).map((s) => ({
      type: s.type as string,
      name: s.name,
      cost: s.cost,
      icon: s.icon,
      decoType: undefined,
      canAfford: money >= s.cost && !ownedShapes.includes(s.type),
      effectLabel: s.description,
      category: "shape" as const,
      owned: ownedShapes.includes(s.type),
      equipped: false,
      inInventory: false,
      disabled: !(money >= s.cost && !ownedShapes.includes(s.type)),
    }));
  }

  return Object.values(DECORATION_CONFIGS).map((d) => ({
    type: d.type as string,
    name: d.name,
    cost: d.cost,
    icon: "",
    decoType: d.type as DecorationType,
    canAfford:
      money >= d.cost && !owned.includes(d.type) && !(decoInv[d.type] > 0),
    effectLabel: getDecorationEffectDescription(d.effects),
    category: "decoration" as const,
    owned: owned.includes(d.type) || decoInv[d.type] > 0,
    inInventory: decoInv[d.type] > 0,
    equipped: equipped.includes(d.type),
    disabled: !(
      money >= d.cost &&
      !owned.includes(d.type) &&
      !(decoInv[d.type] > 0)
    ),
  }));
});

// 形态 Tab 网格列数较少（卡片更大）
const gridColumns = computed(() => (activeTab.value === "shape" ? 3 : 4));

const handleBuy = (rawItem: ItemGridItem) => {
  // 类型收窄：网格回传通用 item，实际数据由本组件构造
  const item = rawItem as ShopItem;
  if (item.owned) return;

  if (item.category === "food") {
    if (buyFoodItem(item.type as FoodType)) {
      showToast(`成功购买 ${item.name}！已放入仓库`);
    }
  } else if (item.category === "bath") {
    if (buyBathItem(item.type as BathType)) {
      showToast(`成功购买 ${item.name}！已放入仓库`);
    }
  } else if (item.category === "decoration") {
    const success = buyDecoration(item.type as DecorationType);
    if (success) {
      showToast(`成功购买 ${item.name}！已放入仓库`);
    }
  } else if (item.category === "shape") {
    const success = buyPetShape(item.type as PetShape);
    if (success) {
      showToast(`成功购买 ${item.name}形态！`);
    }
  }
};

// CSS 变量（overlay/modal/close 底盘 + 卡片/Tab/Toast 通用系由 usePanelTheme 提供，
// 此处仅保留商店特有的 deco/shape 系列变量）
const cssVars = computed(() => ({
  ...usePanelTheme({
    accent: [251, 191, 36],
    darkModalBg: "rgba(30, 28, 20, 0.98)",
    lightOverlayAlpha: 0.08,
  }),
  ...useAmberCardTheme(),
  "--label-color": isDark.value ? "#cbd5e1" : "#4b5563",
  "--cost-color": isDark.value ? "rgba(251, 191, 36, 0.8)" : "#b45309",
  "--deco-card-bg": isDark.value
    ? "rgba(50, 35, 55, 0.4)"
    : "rgba(243, 232, 255, 0.5)",
  "--deco-card-hover-bg": isDark.value
    ? "rgba(60, 40, 65, 0.5)"
    : "rgba(233, 213, 255, 0.6)",
  "--deco-card-border": isDark.value
    ? "rgba(168, 85, 247, 0.15)"
    : "rgba(168, 85, 247, 0.2)",
  "--deco-cost-color": isDark.value ? "rgba(192, 132, 252, 0.8)" : "#7c3aed",
  "--deco-effect-color": isDark.value
    ? "rgba(168, 85, 247, 0.5)"
    : "rgba(124, 58, 237, 0.45)",
  "--deco-owned-color": isDark.value ? "#a78bfa" : "#7c3aed",
  "--shape-card-bg": isDark.value
    ? "rgba(20, 50, 50, 0.4)"
    : "rgba(209, 250, 229, 0.5)",
  "--shape-card-hover-bg": isDark.value
    ? "rgba(25, 60, 60, 0.5)"
    : "rgba(167, 243, 208, 0.6)",
  "--shape-card-border": isDark.value
    ? "rgba(52, 211, 153, 0.15)"
    : "rgba(52, 211, 153, 0.25)",
  "--shape-cost-color": isDark.value ? "rgba(52, 211, 153, 0.9)" : "#059669",
  "--shape-effect-color": isDark.value
    ? "rgba(52, 211, 153, 0.55)"
    : "rgba(5, 150, 105, 0.5)",
  "--shape-owned-color": isDark.value ? "#34d399" : "#059669",
  "--shape-indicator": isDark.value ? "#34d399" : "#10b981",
  "--toast-bg": isDark.value
    ? "rgba(30, 20, 50, 0.95)"
    : "rgba(255, 255, 255, 0.97)",
  "--toast-border": isDark.value
    ? "rgba(168, 85, 247, 0.4)"
    : "rgba(168, 85, 247, 0.2)",
  "--toast-shadow": isDark.value
    ? "0 8px 32px rgba(168, 85, 247, 0.2)"
    : "0 8px 32px rgba(168, 85, 247, 0.12)",
}));

// 关闭弹窗（passthrough 由父组件 useModal 管理）
const close = () => {
  emit("close");
};
</script>

<template>
  <BaseModal
    :visible="visible"
    title="商店"
    icon="🛒"
    :decor-emojis="['🪙', '✨', '💫']"
    :width="380"
    :height="560"
    title-gradient="linear-gradient(135deg, #fbbf24, #f59e0b)"
    :css-vars="cssVars"
    @close="close"
  >
    <div class="modal-body">
      <!-- 金币余额 -->
      <MoneyBadge :amount="attrData.money" />

      <!-- Tab 切换 -->
      <TabBar
        :tabs="shopTabs"
        :active="activeTab"
        @select="(key) => (activeTab = key as typeof activeTab)"
      />

      <!-- 购买提示 -->
      <ToastNotification
        :visible="toastVisible"
        :message="toastMessage"
        :color="'var(--deco-owned-color)'"
      />

      <!-- 物品列表 -->
      <ItemGridPanel
        :items="currentItems"
        :columns="gridColumns"
        @click="handleBuy"
      >
        <template #info="{ item }">
          <div class="item-info">
            <template v-if="item.owned">
              <span class="item-owned-badge">{{
                (item as ShopItem).equipped
                  ? "装备中"
                  : (item as ShopItem).inInventory
                    ? "在仓库"
                    : "已拥有"
              }}</span>
            </template>
            <template v-else>
              <span
                class="item-cost"
                :class="{
                  'deco-cost': item.category === 'decoration',
                  'shape-cost': item.category === 'shape',
                }"
                >💰{{ (item as ShopItem).cost }}</span
              >
              <span
                class="item-effect"
                :class="{
                  'deco-effect': item.category === 'decoration',
                  'shape-effect': item.category === 'shape',
                }"
                >{{ (item as ShopItem).effectLabel }}</span
              >
            </template>
          </div>
        </template>
      </ItemGridPanel>
    </div>
  </BaseModal>
</template>

<style scoped>
/* 内容区（骨架/金币/Tab/Toast/卡片网格由通用组件提供） */
.modal-body {
  padding: 0 24px 24px;
  overflow-y: auto;
  flex: 1;
  position: relative;
}

/* 卡片信息区（价格 + 效果标签） */
.item-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.item-cost {
  font-size: 11px;
  font-weight: 700;
  color: var(--cost-color);
  line-height: 1;
}

.item-cost.deco-cost {
  color: var(--deco-cost-color);
}

.item-cost.shape-cost {
  color: var(--shape-cost-color);
}

.item-effect {
  font-size: 10px;
  color: var(--effect-color);
  line-height: 1;
  padding: 2px 6px;
  background: rgba(251, 191, 36, 0.08);
  border-radius: 6px;
}

.item-effect.deco-effect {
  color: var(--deco-effect-color);
  background: rgba(168, 85, 247, 0.08);
}

.item-effect.shape-effect {
  color: var(--shape-effect-color);
  background: rgba(52, 211, 153, 0.08);
}

.item-card.disabled :deep(.item-cost),
.item-card.disabled :deep(.item-effect) {
  color: var(--disabled-color);
  background: transparent;
}

/* 已拥有/装备中 徽章 */
.item-owned-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 8px;
  letter-spacing: 0.5px;
}

.item-card.owned :deep(.item-owned-badge) {
  color: var(--deco-owned-color);
  background: rgba(168, 85, 247, 0.1);
}

.item-card.owned:not([disabled]) :deep(.item-owned-badge) {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

/* 滚动条 */
.modal-body::-webkit-scrollbar {
  width: 4px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(251, 191, 36, 0.2);
  border-radius: 2px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(251, 191, 36, 0.4);
}
</style>
