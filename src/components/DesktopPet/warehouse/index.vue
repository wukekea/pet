<script setup lang="ts">
import { computed, ref } from "vue";
import { isDark } from "../composables/theme";
import { setPassthrough } from "../composables/passthrough";
import { isAnyUiOpen } from "../composables/sharedState";
import {
  isWarehouseModalOpen,
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
} from "../composables/attributeStorage";
import DecoIcon from "../shapes/decorations/DecoIcon.vue";

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

// 使用提示
const toastMessage = ref("");
const toastVisible = ref(false);
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(msg: string) {
  toastMessage.value = msg;
  toastVisible.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastVisible.value = false;
  }, 2000);
}

// 当前展示的库存列表（只显示有库存或已拥有的物品）
const currentItems = computed(() => {
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
        decoType: undefined as DecorationType | undefined,
        count: foodInv[f.type] || 0,
        effectLabel: `+${f.satietyRestore}饱腹`,
        category: "food" as const,
      }));
  }

  if (activeTab.value === "bath") {
    return Object.values(BATH_CONFIGS)
      .filter((b) => (bathInv[b.type] || 0) > 0)
      .map((b) => ({
        type: b.type as string,
        name: b.name,
        icon: BATH_ICONS[b.type],
        decoType: undefined as DecorationType | undefined,
        count: bathInv[b.type] || 0,
        effectLabel: `+${b.cleanlinessRestore}清洁`,
        category: "bath" as const,
      }));
  }

  return Object.values(DECORATION_CONFIGS)
    .filter((d) => (decoInv[d.type] || 0) > 0 || owned.includes(d.type))
    .map((d) => ({
      type: d.type as string,
      name: d.name,
      icon: "",
      decoType: d.type as DecorationType,
      count: decoInv[d.type] || 0,
      effectLabel: d.description,
      category: "decoration" as const,
      alreadyOwned: owned.includes(d.type),
      isEquipped: equipped.includes(d.type),
    }));
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
const handleItemClick = (item: (typeof currentItems.value)[number]) => {
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
    if ("alreadyOwned" in item && item.alreadyOwned) {
      if ("isEquipped" in item && item.isEquipped) {
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

// CSS 变量
const cssVars = computed(() => ({
  "--overlay-bg": isDark.value
    ? "rgba(0, 0, 0, 0.6)"
    : "rgba(251, 191, 36, 0.08)",
  "--modal-bg": isDark.value
    ? "rgba(30, 28, 20, 0.98)"
    : "rgba(255, 255, 255, 0.98)",
  "--modal-shadow": isDark.value
    ? "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(251, 191, 36, 0.2)"
    : "0 20px 60px rgba(251, 191, 36, 0.2), 0 0 0 1px rgba(251, 191, 36, 0.1)",
  "--modal-close-bg": isDark.value
    ? "rgba(255, 255, 255, 0.05)"
    : "rgba(0, 0, 0, 0.03)",
  "--modal-close-color": "#9ca3af",
  "--text-color": isDark.value ? "#e2e8f0" : "#374151",
  "--value-color": isDark.value ? "#f1f5f9" : "#1f2937",
  "--money-color": isDark.value ? "#fbbf24" : "#d97706",
  "--money-bg": isDark.value
    ? "rgba(251, 191, 36, 0.1)"
    : "rgba(251, 191, 36, 0.08)",
  "--card-bg": isDark.value
    ? "rgba(55, 50, 35, 0.4)"
    : "rgba(254, 243, 199, 0.5)",
  "--card-hover-bg": isDark.value
    ? "rgba(65, 60, 40, 0.5)"
    : "rgba(253, 230, 138, 0.6)",
  "--card-border": isDark.value
    ? "rgba(251, 191, 36, 0.12)"
    : "rgba(251, 191, 36, 0.2)",
  "--card-disabled-bg": isDark.value
    ? "rgba(55, 50, 35, 0.15)"
    : "rgba(243, 244, 246, 0.4)",
  "--card-disabled-border": isDark.value
    ? "rgba(75, 85, 99, 0.1)"
    : "rgba(209, 213, 219, 0.3)",
  "--effect-color": isDark.value
    ? "rgba(251, 191, 36, 0.6)"
    : "rgba(180, 83, 9, 0.5)",
  "--disabled-color": isDark.value
    ? "rgba(156, 163, 175, 0.5)"
    : "rgba(156, 163, 175, 0.6)",
  "--tab-inactive-color": isDark.value
    ? "rgba(156, 163, 175, 0.6)"
    : "rgba(107, 114, 128, 0.6)",
  "--tab-inactive-bg": isDark.value
    ? "rgba(55, 50, 35, 0.3)"
    : "rgba(243, 244, 246, 0.6)",
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
  "--toast-bg": isDark.value
    ? "rgba(30, 28, 20, 0.95)"
    : "rgba(255, 255, 255, 0.97)",
  "--toast-border": isDark.value
    ? "rgba(251, 191, 36, 0.4)"
    : "rgba(251, 191, 36, 0.2)",
  "--toast-shadow": isDark.value
    ? "0 8px 32px rgba(251, 191, 36, 0.15)"
    : "0 8px 32px rgba(251, 191, 36, 0.1)",
  "--empty-color": isDark.value
    ? "rgba(156, 163, 175, 0.5)"
    : "rgba(156, 163, 175, 0.6)",
}));

// 关闭弹窗
const close = () => {
  emit("close");
  isWarehouseModalOpen.value = false;
  if (!isAnyUiOpen.value) setPassthrough(true);
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-pop">
      <div
        v-if="visible"
        class="warehouse-modal-overlay"
        :style="cssVars"
        @click="close"
      >
        <div
          class="warehouse-modal"
          :class="{ 'dark-mode': isDark }"
          @click.stop
        >
          <!-- 装饰元素 -->
          <div class="modal-decor">
            <span class="decor-star star-1">📦</span>
            <span class="decor-star star-2">✨</span>
            <span class="decor-star star-3">💫</span>
          </div>

          <div class="modal-header">
            <div class="header-title">
              <span class="title-icon">📦</span>
              <span class="title-text warehouse-title">仓库</span>
            </div>
            <button class="modal-close" @click="close">
              <span>✕</span>
            </button>
          </div>

          <div class="modal-body">
            <!-- 金币余额 -->
            <div class="money-section">
              <div class="money-badge">
                <span class="money-icon">💰</span>
                <span class="money-amount">{{ attrData.money }}</span>
              </div>
            </div>

            <!-- Tab 切换 -->
            <div class="tab-bar">
              <button
                class="tab-btn"
                :class="{ active: activeTab === 'food' }"
                @click="activeTab = 'food'"
              >
                <span class="tab-icon">🍽️</span>
                <span class="tab-text">食物</span>
                <div
                  v-if="activeTab === 'food'"
                  class="tab-indicator food-indicator"
                ></div>
              </button>
              <button
                class="tab-btn"
                :class="{ active: activeTab === 'bath' }"
                @click="activeTab = 'bath'"
              >
                <span class="tab-icon">🛁</span>
                <span class="tab-text">沐浴露</span>
                <div
                  v-if="activeTab === 'bath'"
                  class="tab-indicator bath-indicator"
                ></div>
              </button>
              <button
                class="tab-btn"
                :class="{ active: activeTab === 'decoration' }"
                @click="activeTab = 'decoration'"
              >
                <span class="tab-icon">💍</span>
                <span class="tab-text">装饰</span>
                <div
                  v-if="activeTab === 'decoration'"
                  class="tab-indicator deco-indicator"
                ></div>
              </button>
            </div>

            <!-- 使用提示 -->
            <Transition name="toast-slide">
              <div v-if="toastVisible" class="toast-notification">
                <span class="toast-icon">🎉</span>
                <span class="toast-text">{{ toastMessage }}</span>
              </div>
            </Transition>

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
              <div v-else class="items-grid">
                <button
                  v-for="item in currentItems"
                  :key="item.type"
                  class="item-card"
                  :class="{
                    disabled:
                      item.count <= 0 &&
                      !('alreadyOwned' in item && item.alreadyOwned),
                    'bath-card': item.category === 'bath',
                    'deco-card': item.category === 'decoration',
                  }"
                  :disabled="
                    item.count <= 0 &&
                    !('alreadyOwned' in item && item.alreadyOwned)
                  "
                  @click="handleItemClick(item)"
                >
                  <span class="item-icon">
                    <DecoIcon
                      v-if="item.decoType || item.category === 'bath'"
                      :type="
                        (item.decoType || item.type) as
                          | DecorationType
                          | BathType
                      "
                    />
                    <template v-else>{{ item.icon }}</template>
                  </span>
                  <span class="item-name">{{ item.name }}</span>
                  <template v-if="'alreadyOwned' in item && item.alreadyOwned">
                    <span class="item-owned-badge">{{
                      item.isEquipped ? "装备中" : "已拥有"
                    }}</span>
                  </template>
                  <template v-else>
                    <span
                      class="item-count"
                      :class="{
                        'bath-count': item.category === 'bath',
                        'deco-count': item.category === 'decoration',
                      }"
                      >×{{ item.count }}</span
                    >
                  </template>
                  <span
                    class="item-effect"
                    :class="{
                      'bath-effect': item.category === 'bath',
                      'deco-effect': item.category === 'decoration',
                    }"
                    >{{ item.effectLabel }}</span
                  >
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.warehouse-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--overlay-bg);
  backdrop-filter: blur(8px);
  pointer-events: auto !important;
}

.warehouse-modal {
  width: 380px;
  max-width: 90vw;
  height: 560px;
  border-radius: 24px;
  background: var(--modal-bg);
  box-shadow: var(--modal-shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  pointer-events: auto !important;
}

/* 装饰元素 */
.modal-decor {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.decor-star {
  position: absolute;
  font-size: 16px;
  opacity: 0.4;
  animation: twinkle 2s ease-in-out infinite;
}

.star-1 {
  top: 20px;
  right: 60px;
  animation-delay: 0s;
}

.star-2 {
  top: 40px;
  right: 20px;
  animation-delay: 0.5s;
}

.star-3 {
  top: 60px;
  right: 80px;
  animation-delay: 1s;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

/* 头部 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 12px;
  position: relative;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 24px;
}

.title-text {
  font-size: 18px;
  font-weight: 700;
}

.warehouse-title {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--modal-close-bg);
  color: var(--modal-close-color);
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  transform: rotate(90deg);
}

/* 内容区 */
.modal-body {
  padding: 0 24px 24px;
  overflow-y: auto;
  flex: 1;
  position: relative;
}

/* 金币余额 */
.money-section {
  margin-bottom: 16px;
}

.money-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--money-bg);
  border-radius: 20px;
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.money-icon {
  font-size: 18px;
}

.money-amount {
  font-size: 20px;
  font-weight: 800;
  color: var(--money-color);
}

/* Tab 切换 */
.tab-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  background: var(--tab-inactive-bg);
  padding: 4px;
  border-radius: 14px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 6px;
  border: none;
  border-radius: 11px;
  background: transparent;
  color: var(--tab-inactive-color);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  font-weight: 500;
  font-size: 13px;
}

.tab-btn.active {
  background: var(--modal-bg);
  color: var(--text-color);
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tab-btn:not(.active):hover {
  color: var(--text-color);
  background: rgba(251, 191, 36, 0.06);
}

.tab-icon {
  font-size: 14px;
}

.tab-text {
  font-size: 13px;
}

/* Tab 下划线指示器 */
.tab-indicator {
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  border-radius: 2px;
}

.food-indicator {
  background: linear-gradient(90deg, #f97316, #fb923c);
  box-shadow: 0 0 6px rgba(249, 115, 22, 0.4);
}

.bath-indicator {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.4);
}

.deco-indicator {
  background: linear-gradient(90deg, #a855f7, #ec4899);
  box-shadow: 0 0 6px rgba(168, 85, 247, 0.4);
}

/* 使用提示 */
.toast-notification {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--toast-bg);
  border: 1px solid var(--toast-border);
  border-radius: 12px;
  box-shadow: var(--toast-shadow);
  pointer-events: none;
  position: absolute;
  top: 8px;
  left: 24px;
  right: 24px;
  z-index: 10;
}

.toast-icon {
  font-size: 16px;
}

.toast-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--count-color);
}

.toast-slide-enter-active {
  animation: toast-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-slide-leave-active {
  animation: toast-out 0.25s ease-in;
}

@keyframes toast-in {
  0% {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toast-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-6px) scale(0.95);
  }
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

/* 物品卡片网格 */
.items-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 6px 8px;
  border: 1px solid var(--card-border);
  border-radius: 12px;
  background: var(--card-bg);
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.item-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(
    180deg,
    rgba(251, 191, 36, 0.04) 0%,
    transparent 100%
  );
  pointer-events: none;
  border-radius: 16px 16px 0 0;
}

/* 沐浴露蓝色主题卡片 */
.item-card.bath-card {
  border-color: var(--bath-card-border);
  background: var(--bath-card-bg);
}

.item-card.bath-card::before {
  background: linear-gradient(
    180deg,
    rgba(59, 130, 246, 0.04) 0%,
    transparent 100%
  );
}

/* 装饰紫色主题卡片 */
.item-card.deco-card {
  border-color: var(--deco-card-border);
  background: var(--deco-card-bg);
}

.item-card.deco-card::before {
  background: linear-gradient(
    180deg,
    rgba(168, 85, 247, 0.06) 0%,
    transparent 100%
  );
}

.item-card.disabled {
  background: var(--card-disabled-bg);
  border-color: var(--card-disabled-border);
  opacity: 0.55;
}

.item-icon {
  font-size: 20px;
  line-height: 1;
  position: relative;
}

.item-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--value-color);
  line-height: 1;
}

.item-card.disabled .item-name {
  color: var(--disabled-color);
}

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

.item-card.disabled .item-count {
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

.item-card.disabled .item-effect {
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

/* 弹窗动画 */
.modal-pop-enter-active {
  animation: modal-pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-pop-leave-active {
  animation: modal-pop-out 0.2s ease-in;
}

@keyframes modal-pop-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes modal-pop-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
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
