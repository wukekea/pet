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
  FOOD_ICONS,
  BATH_ICONS,
  type FoodType,
  type BathType,
  type DecorationType,
} from "../composables/sharedState";
import {
  useAttributeRef,
  useFood,
  useBathItem,
  useDecoration,
  equipDecoration,
  unequipDecoration,
} from "../composables/attributes";
import {
  FOOD_CONFIGS,
  BATH_CONFIGS,
  DECORATION_CONFIGS,
  getDecorationEffectDescription,
} from "../composables/attributeStorage";

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

// 属性数据
const attrData = useAttributeRef();

// 当前分类 Tab
const activeTab = ref<"food" | "bath" | "decoration">("food");

// Tab 配置（TabBar 组件数据驱动）
const warehouseTabs = [
  { key: "food", icon: "🍽️", label: "食物" },
  { key: "bath", icon: "🛁", label: "沐浴露" },
  { key: "decoration", icon: "💍", label: "装饰" },
];

// 使用提示
const { toastMessage, toastVisible, showToast } = useToast();

// 当前展示的库存列表（通用卡片结构 + 仓库特有的数量/拥有字段）
interface WarehouseItem extends ItemGridItem {
  count: number;
  effectLabel: string;
  alreadyOwned?: boolean;
  isEquipped?: boolean;
}

const currentItems = computed<WarehouseItem[]>(() => {
  const foodInv = attrData.value.foodInventory || {};
  const bathInv = attrData.value.bathInventory || {};
  const decoInv = attrData.value.decorationInventory || {};
  const owned = attrData.value.ownedDecorations || [];
  const equipped = attrData.value.equippedDecorations || [];

  if (activeTab.value === "food") {
    return Object.values(FOOD_CONFIGS)
      .filter((f) => (foodInv[f.type] || 0) > 0)
      .map((f) => ({
        type: f.type as string,
        name: f.name,
        icon: FOOD_ICONS[f.type],
        decoType: undefined,
        count: foodInv[f.type] || 0,
        effectLabel: `+${f.satietyRestore}饱腹`,
        category: "food" as const,
        disabled: (foodInv[f.type] || 0) <= 0,
      }));
  }

  if (activeTab.value === "bath") {
    return Object.values(BATH_CONFIGS)
      .filter((b) => (bathInv[b.type] || 0) > 0)
      .map((b) => ({
        type: b.type as string,
        name: b.name,
        icon: BATH_ICONS[b.type],
        decoType: undefined,
        count: bathInv[b.type] || 0,
        effectLabel: `+${b.cleanlinessRestore}清洁`,
        category: "bath" as const,
        disabled: (bathInv[b.type] || 0) <= 0,
      }));
  }

  return Object.values(DECORATION_CONFIGS)
    .filter((d) => (decoInv[d.type] || 0) > 0 || owned.includes(d.type))
    .map((d) => {
      const alreadyOwned = owned.includes(d.type);
      const count = decoInv[d.type] || 0;
      return {
        type: d.type as string,
        name: d.name,
        icon: "",
        decoType: d.type as DecorationType,
        count,
        effectLabel: getDecorationEffectDescription(d.effects),
        category: "decoration" as const,
        alreadyOwned,
        isEquipped: equipped.includes(d.type),
        disabled: count <= 0 && !alreadyOwned,
      };
    });
});

// 是否有任何库存或已拥有装饰
const hasAnyInventory = computed(() => {
  const foodInv = attrData.value.foodInventory || {};
  const bathInv = attrData.value.bathInventory || {};
  const decoInv = attrData.value.decorationInventory || {};
  const owned = attrData.value.ownedDecorations || [];
  const foodCount = Object.values(foodInv).reduce((s, c) => s + c, 0);
  const bathCount = Object.values(bathInv).reduce((s, c) => s + c, 0);
  const decoCount = Object.values(decoInv).reduce((s, c) => s + c, 0);
  return foodCount + bathCount + decoCount > 0 || owned.length > 0;
});

// 点击物品
const handleItemClick = (rawItem: ItemGridItem) => {
  // 类型收窄：网格回传通用 item，实际数据由本组件构造
  const item = rawItem as WarehouseItem;
  if (item.category === "food") {
    if (item.count <= 0) return;
    if (useFood(item.type as FoodType)) {
      showToast(`使用了 ${item.name}！`);
    }
  } else if (item.category === "bath") {
    if (item.count <= 0) return;
    if (useBathItem(item.type as BathType)) {
      close();
    }
  } else if (item.category === "decoration") {
    // 已拥有的装饰品：装备/卸下
    if (item.alreadyOwned) {
      if (item.isEquipped) {
        if (unequipDecoration(item.type as DecorationType)) {
          showToast(`卸下了 ${item.name}`);
        }
      } else {
        if (equipDecoration(item.type as DecorationType)) {
          showToast(`装备了 ${item.name}！`);
        } else {
          showToast("装备失败，请检查槽位冲突");
        }
      }
    } else {
      // 库存中的装饰品：取出
      if (item.count <= 0) return;
      if (useDecoration(item.type as DecorationType)) {
        showToast(`取出了 ${item.name}！`);
      }
    }
  }
};

// CSS 变量（overlay/modal/close 底盘 + 卡片/Tab/Toast 通用系由 usePanelTheme 提供，
// 此处仅保留仓库特有的 bath/deco/count 系列变量）
const cssVars = computed(() => ({
  ...usePanelTheme({
    accent: [251, 191, 36],
    darkModalBg: "rgba(30, 28, 20, 0.98)",
    lightOverlayAlpha: 0.08,
  }),
  ...useAmberCardTheme(),
  "--bath-card-bg": isDark.value
    ? "rgba(30, 40, 55, 0.4)"
    : "rgba(219, 234, 254, 0.5)",
  "--bath-card-hover-bg": isDark.value
    ? "rgba(35, 50, 65, 0.5)"
    : "rgba(191, 219, 254, 0.6)",
  "--bath-card-border": isDark.value
    ? "rgba(59, 130, 246, 0.12)"
    : "rgba(59, 130, 246, 0.2)",
  "--bath-effect-color": isDark.value
    ? "rgba(96, 165, 250, 0.6)"
    : "rgba(37, 99, 235, 0.5)",
  "--count-color": isDark.value ? "#fbbf24" : "#d97706",
  "--bath-count-color": isDark.value ? "#60a5fa" : "#2563eb",
  "--deco-card-bg": isDark.value
    ? "rgba(50, 35, 55, 0.4)"
    : "rgba(243, 232, 255, 0.5)",
  "--deco-card-border": isDark.value
    ? "rgba(168, 85, 247, 0.15)"
    : "rgba(168, 85, 247, 0.2)",
  "--deco-count-color": isDark.value ? "#a78bfa" : "#7c3aed",
  "--deco-effect-color": isDark.value
    ? "rgba(168, 85, 247, 0.5)"
    : "rgba(124, 58, 237, 0.45)",
  "--owned-badge-color": isDark.value ? "#10b981" : "#059669",
  "--owned-badge-bg": isDark.value
    ? "rgba(16, 185, 129, 0.12)"
    : "rgba(16, 185, 129, 0.1)",
  "--empty-color": isDark.value
    ? "rgba(156, 163, 175, 0.5)"
    : "rgba(156, 163, 175, 0.6)",
}));

// 关闭弹窗（passthrough 由父组件 useModal 管理）
const close = () => {
  emit("close");
};
</script>

<template>
  <BaseModal
    :visible="visible"
    title="仓库"
    icon="📦"
    :decor-emojis="['📦', '✨', '💫']"
    :width="380"
    :height="560"
    title-gradient="linear-gradient(135deg, #f59e0b, #d97706)"
    :css-vars="cssVars"
    @close="close"
  >
    <div class="modal-body">
      <!-- 金币余额 -->
      <MoneyBadge :amount="attrData.money" />

      <!-- Tab 切换 -->
      <TabBar
        :tabs="warehouseTabs"
        :active="activeTab"
        @select="(key) => (activeTab = key as typeof activeTab)"
      />

      <!-- 使用提示 -->
      <ToastNotification
        :visible="toastVisible"
        :message="toastMessage"
        :color="'var(--count-color)'"
      />

      <!-- 空状态 -->
      <div v-if="!hasAnyInventory" class="empty-state">
        <span class="empty-icon">📭</span>
        <span class="empty-text">仓库空空如也，去商店看看吧</span>
      </div>

      <!-- 物品列表 -->
      <template v-else>
        <div v-if="currentItems.length === 0" class="tab-empty">
          <span class="tab-empty-text">当前分类没有库存</span>
        </div>
        <ItemGridPanel v-else :items="currentItems" @click="handleItemClick">
          <template #info="{ item }">
            <template v-if="(item as WarehouseItem).alreadyOwned">
              <span class="item-owned-badge">{{
                (item as WarehouseItem).isEquipped ? "装备中" : "已拥有"
              }}</span>
            </template>
            <template v-else>
              <span
                class="item-count"
                :class="{
                  'bath-count': item.category === 'bath',
                  'deco-count': item.category === 'decoration',
                }"
                >×{{ (item as WarehouseItem).count }}</span
              >
            </template>
            <span
              class="item-effect"
              :class="{
                'bath-effect': item.category === 'bath',
                'deco-effect': item.category === 'decoration',
              }"
              >{{ (item as WarehouseItem).effectLabel }}</span
            >
          </template>
        </ItemGridPanel>
      </template>
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

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
}

.empty-icon {
  font-size: 40px;
  opacity: 0.6;
}

.empty-text {
  font-size: 14px;
  color: var(--empty-color);
  font-weight: 500;
}

.tab-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36px 24px;
}

.tab-empty-text {
  font-size: 13px;
  color: var(--empty-color);
  font-weight: 500;
}

/* 卡片数量角标 */
.item-count {
  font-size: 12px;
  font-weight: 800;
  color: var(--count-color);
  line-height: 1;
}

.item-count.bath-count {
  color: var(--bath-count-color);
}

.item-count.deco-count {
  color: var(--deco-count-color);
}

.item-card.disabled :deep(.item-count) {
  color: var(--disabled-color);
}

.item-effect {
  font-size: 10px;
  color: var(--effect-color);
  line-height: 1;
  padding: 2px 6px;
  background: rgba(251, 191, 36, 0.08);
  border-radius: 6px;
}

.item-effect.bath-effect {
  color: var(--bath-effect-color);
  background: rgba(59, 130, 246, 0.08);
}

.item-effect.deco-effect {
  color: var(--deco-effect-color);
  background: rgba(168, 85, 247, 0.08);
}

.item-card.disabled :deep(.item-effect) {
  color: var(--disabled-color);
  background: transparent;
}

/* 已拥有徽章 */
.item-owned-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 8px;
  letter-spacing: 0.5px;
  color: var(--owned-badge-color);
  background: var(--owned-badge-bg);
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
