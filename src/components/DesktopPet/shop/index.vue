<script setup lang="ts">
import { computed, ref } from "vue";
import { isDark } from "../composables/theme";
import { setPassthrough } from "../composables/passthrough";
import {
  isShopModalOpen,
  FOOD_ICONS,
  BATH_ICONS,
  type FoodType,
  type BathType,
} from "../composables/sharedState";
import { useAttributeRef, feedPet, bathePet } from "../composables/attributes";
import { FOOD_CONFIGS, BATH_CONFIGS } from "../composables/attributeStorage";

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

// 属性数据
const attrData = useAttributeRef();

// 当前分类 Tab
const activeTab = ref<"food" | "bath">("food");

// 当前展示的物品列表
const currentItems = computed(() => {
  const money = attrData.value.money;
  if (activeTab.value === "food") {
    return Object.values(FOOD_CONFIGS).map((f) => ({
      type: f.type as string,
      name: f.name,
      cost: f.cost,
      icon: FOOD_ICONS[f.type],
      canAfford: money >= f.cost,
      effectLabel: `+${f.satietyRestore}饱腹`,
      category: "food" as const,
    }));
  }
  return Object.values(BATH_CONFIGS).map((b) => ({
    type: b.type as string,
    name: b.name,
    cost: b.cost,
    icon: BATH_ICONS[b.type],
    canAfford: money >= b.cost,
    effectLabel: `+${b.cleanlinessRestore}清洁`,
    category: "bath" as const,
  }));
});

const handleBuy = (item: (typeof currentItems.value)[number]) => {
  if (item.category === "food") {
    feedPet(item.type as FoodType);
  } else {
    if (bathePet(item.type as BathType)) {
      close();
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
  "--label-color": isDark.value ? "#cbd5e1" : "#4b5563",
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
  "--cost-color": isDark.value ? "rgba(251, 191, 36, 0.8)" : "#b45309",
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
}));

// 关闭弹窗
const close = () => {
  emit("close");
  isShopModalOpen.value = false;
  setPassthrough(true);
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-pop">
      <div
        v-if="visible"
        class="shop-modal-overlay"
        :style="cssVars"
        @click="close"
      >
        <div class="shop-modal" :class="{ 'dark-mode': isDark }" @click.stop>
          <!-- 装饰元素 -->
          <div class="modal-decor">
            <span class="decor-star star-1">🪙</span>
            <span class="decor-star star-2">✨</span>
            <span class="decor-star star-3">💫</span>
          </div>

          <div class="modal-header">
            <div class="header-title">
              <span class="title-icon">🛒</span>
              <span class="title-text shop-title">商店</span>
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
            </div>

            <!-- 物品列表 -->
            <div class="items-grid">
              <button
                v-for="item in currentItems"
                :key="item.type"
                class="item-card"
                :class="{ disabled: !item.canAfford }"
                :disabled="!item.canAfford"
                @click="handleBuy(item)"
              >
                <span class="item-icon">{{ item.icon }}</span>
                <span class="item-name">{{ item.name }}</span>
                <div class="item-info">
                  <span class="item-cost">💰{{ item.cost }}</span>
                  <span class="item-effect">{{ item.effectLabel }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.shop-modal-overlay {
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

.shop-modal {
  width: 380px;
  max-width: 90vw;
  max-height: 80vh;
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

.shop-title {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
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
  gap: 8px;
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
  gap: 6px;
  padding: 10px 12px;
  border: none;
  border-radius: 11px;
  background: transparent;
  color: var(--tab-inactive-color);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  font-weight: 500;
  font-size: 14px;
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
  font-size: 16px;
}

.tab-text {
  font-size: 14px;
}

/* Tab 下划线指示器 */
.tab-indicator {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
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

/* 物品卡片网格 */
.items-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 10px 12px;
  border: 1px solid var(--card-border);
  border-radius: 16px;
  background: var(--card-bg);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
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

.item-card:hover:not(.disabled) {
  background: var(--card-hover-bg);
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.15);
  border-color: rgba(251, 191, 36, 0.3);
}

.item-card:active:not(.disabled) {
  transform: translateY(0) scale(0.97);
}

.item-card.disabled {
  background: var(--card-disabled-bg);
  border-color: var(--card-disabled-border);
  cursor: not-allowed;
  opacity: 0.55;
}

.item-icon {
  font-size: 28px;
  line-height: 1;
  position: relative;
}

.item-card:hover:not(.disabled) .item-icon {
  transform: scale(1.15);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--value-color);
  line-height: 1;
}

.item-card.disabled .item-name {
  color: var(--disabled-color);
}

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

.item-effect {
  font-size: 10px;
  color: var(--effect-color);
  line-height: 1;
  padding: 2px 6px;
  background: rgba(251, 191, 36, 0.08);
  border-radius: 6px;
}

.item-card.disabled .item-cost,
.item-card.disabled .item-effect {
  color: var(--disabled-color);
  background: transparent;
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
