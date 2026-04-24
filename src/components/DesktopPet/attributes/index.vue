<script setup lang="ts">
import { computed } from "vue";
import { isDark } from "../composables/theme";
import { setPassthrough } from "../composables/passthrough";
import { isAttributeModalOpen } from "../composables/sharedState";
import {
  useAttributeRef,
  getCurrentAttributeCap,
  getExpProgress,
  getDailyInteractionProgress,
  feedPet,
  bathePet,
  startWork,
  canWork,
} from "../composables/attributes";
import {
  FOOD_CONFIGS,
  BATH_COST,
  WORK_INCOME,
  WORK_STAMINA_REQUIRED,
  getExpRequiredForLevel,
} from "../composables/attributeStorage";
import { HEALTH_CAP, MAX_LEVEL } from "../constants";
import type { FoodType } from "../composables/sharedState";
import type { PetState } from "../types";

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

// 属性数据
const attrData = useAttributeRef();

// 属性上限
const attrCap = computed(() => getCurrentAttributeCap());

// 经验进度
const expPercent = computed(() => getExpProgress());

// 每日交互经验进度
const dailyInteraction = computed(() => getDailyInteractionProgress());

// 升级所需经验
const expRequired = computed(() =>
  getExpRequiredForLevel(attrData.value.level),
);

// 属性条配置
const attributeBars = computed(() => [
  {
    key: "satiety" as const,
    icon: "🍖",
    name: "饱腹",
    value: attrData.value.satiety,
    cap: attrCap.value,
    color: "orange",
  },
  {
    key: "cleanliness" as const,
    icon: "🛁",
    name: "清洁",
    value: attrData.value.cleanliness,
    cap: attrCap.value,
    color: "blue",
  },
  {
    key: "stamina" as const,
    icon: "⚡",
    name: "体力",
    value: attrData.value.stamina,
    cap: attrCap.value,
    color: "green",
  },
  {
    key: "health" as const,
    icon: "❤️",
    name: "健康",
    value: attrData.value.health,
    cap: HEALTH_CAP,
    color: "red",
  },
]);

// 食物列表
const foods = computed(() =>
  Object.values(FOOD_CONFIGS).map((f) => ({
    ...f,
    canAfford: attrData.value.money >= f.cost,
  })),
);

// 工作列表
const workList = computed(() => {
  const states: {
    state: PetState;
    name: string;
    income: number;
    staminaReq: number;
  }[] = [
    {
      state: "brickCarrying",
      name: "搬砖",
      income: WORK_INCOME.brickCarrying,
      staminaReq: WORK_STAMINA_REQUIRED.brickCarrying,
    },
    {
      state: "flyerDistributing",
      name: "发传单",
      income: WORK_INCOME.flyerDistributing,
      staminaReq: WORK_STAMINA_REQUIRED.flyerDistributing,
    },
    {
      state: "programmer",
      name: "写代码",
      income: WORK_INCOME.programmer,
      staminaReq: WORK_STAMINA_REQUIRED.programmer,
    },
  ];
  return states.map((w) => ({
    ...w,
    canStart: attrData.value.stamina >= w.staminaReq && canWork(),
  }));
});

// 处理喂食
const handleFeed = (foodType: FoodType) => {
  feedPet(foodType);
};

// 处理洗澡
const handleBathe = () => {
  bathePet();
};

// 处理打工
const handleWork = (workState: PetState) => {
  startWork(workState);
};

// CSS 变量
const cssVars = computed(() => ({
  "--overlay-bg": isDark.value
    ? "rgba(0, 0, 0, 0.6)"
    : "rgba(244, 114, 182, 0.08)",
  "--modal-bg": isDark.value
    ? "rgba(30, 25, 40, 0.98)"
    : "rgba(255, 255, 255, 0.98)",
  "--modal-shadow": isDark.value
    ? "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(244, 114, 182, 0.2)"
    : "0 20px 60px rgba(244, 114, 182, 0.2), 0 0 0 1px rgba(244, 114, 182, 0.1)",
  "--modal-close-bg": isDark.value
    ? "rgba(255, 255, 255, 0.05)"
    : "rgba(0, 0, 0, 0.03)",
  "--modal-close-color": "#9ca3af",
  "--section-title-color": isDark.value ? "#e2e8f0" : "#374151",
  "--attr-label-color": isDark.value ? "#cbd5e1" : "#4b5563",
  "--attr-value-color": isDark.value ? "#f1f5f9" : "#1f2937",
  "--attr-bar-bg": isDark.value
    ? "rgba(75, 85, 99, 0.4)"
    : "rgba(209, 213, 219, 0.4)",
  "--money-color": isDark.value ? "#fbbf24" : "#d97706",
  "--money-bg": isDark.value
    ? "rgba(251, 191, 36, 0.1)"
    : "rgba(251, 191, 36, 0.08)",
  "--action-btn-bg": isDark.value
    ? "rgba(55, 65, 81, 0.4)"
    : "rgba(243, 244, 246, 0.8)",
  "--action-btn-hover-bg": isDark.value
    ? "rgba(75, 85, 99, 0.5)"
    : "rgba(229, 231, 235, 0.9)",
  "--action-btn-disabled-bg": isDark.value
    ? "rgba(55, 65, 81, 0.2)"
    : "rgba(243, 244, 246, 0.4)",
  "--action-btn-disabled-color": isDark.value
    ? "rgba(156, 163, 175, 0.5)"
    : "rgba(156, 163, 175, 0.6)",
  "--cost-color": isDark.value ? "rgba(251, 191, 36, 0.8)" : "#b45309",
  "--level-badge-bg": isDark.value
    ? "rgba(244, 114, 182, 0.15)"
    : "rgba(244, 114, 182, 0.1)",
  "--exp-bar-bg": isDark.value
    ? "rgba(75, 85, 99, 0.4)"
    : "rgba(209, 213, 219, 0.4)",
  "--cap-text-color": isDark.value
    ? "rgba(167, 139, 250, 0.7)"
    : "rgba(139, 92, 246, 0.6)",
}));

// 关闭弹窗
const close = () => {
  emit("close");
  isAttributeModalOpen.value = false;
  setPassthrough(true);
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-pop">
      <div
        v-if="visible"
        class="attr-modal-overlay"
        :style="cssVars"
        @click="close"
      >
        <div class="attr-modal" :class="{ 'dark-mode': isDark }" @click.stop>
          <!-- 装饰元素 -->
          <div class="modal-decor">
            <span class="decor-star star-1">💖</span>
            <span class="decor-star star-2">✨</span>
            <span class="decor-star star-3">🌟</span>
          </div>

          <div class="modal-header">
            <div class="header-title">
              <span class="title-icon">💖</span>
              <span class="title-text attr-title">宠物属性</span>
            </div>
            <button class="modal-close" @click="close">
              <span>✕</span>
            </button>
          </div>

          <div class="modal-body">
            <!-- 等级与经验 -->
            <div class="level-section">
              <div class="level-row">
                <div class="level-badge">
                  <span class="level-icon">⭐</span>
                  <span class="level-number">Lv.{{ attrData.level }}</span>
                </div>
                <div class="cap-hint">
                  属性上限 <span class="cap-value">{{ attrCap }}</span>
                </div>
              </div>
              <div class="exp-bar-wrapper" v-if="attrData.level < MAX_LEVEL">
                <div class="exp-bar-bg">
                  <div
                    class="exp-bar-fill"
                    :style="{ width: expPercent + '%' }"
                  ></div>
                </div>
                <span class="exp-text">
                  {{ attrData.experience }} / {{ expRequired }}
                </span>
              </div>
              <div class="max-level-hint" v-else>✦ 满级 ✦</div>
              <div class="daily-exp-hint">
                今日互动经验 {{ dailyInteraction.earned }}/{{
                  dailyInteraction.cap
                }}
              </div>
            </div>

            <!-- 属性条 -->
            <div class="attributes-section">
              <div
                v-for="bar in attributeBars"
                :key="bar.key"
                class="attr-item"
                :class="{ 'attr-warning': bar.value < 30 }"
              >
                <div class="attr-header">
                  <span class="attr-icon">{{ bar.icon }}</span>
                  <span class="attr-name">{{ bar.name }}</span>
                  <span class="attr-value">
                    {{ bar.value }}<span class="attr-cap">/{{ bar.cap }}</span>
                  </span>
                </div>
                <div class="attr-bar-bg">
                  <div
                    class="attr-bar-fill"
                    :class="`bar-${bar.color}`"
                    :style="{
                      width: Math.min(100, (bar.value / bar.cap) * 100) + '%',
                    }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- 金币 -->
            <div class="money-section">
              <div class="money-badge">
                <span class="money-icon">💰</span>
                <span class="money-amount">{{ attrData.money }}</span>
              </div>
            </div>

            <!-- 操作区域 -->
            <div class="actions-section">
              <!-- 喂食 -->
              <div class="action-group">
                <div class="action-label">
                  <span>🍽️ 喂食</span>
                </div>
                <div class="food-grid">
                  <button
                    v-for="food in foods"
                    :key="food.type"
                    class="action-btn food-btn"
                    :class="{ disabled: !food.canAfford }"
                    :disabled="!food.canAfford"
                    @click="handleFeed(food.type)"
                  >
                    <span class="btn-emoji">
                      {{
                        food.type === "apple"
                          ? "🍎"
                          : food.type === "fish"
                            ? "🐟"
                            : food.type === "cake"
                              ? "🎂"
                              : "🍭"
                      }}
                    </span>
                    <span class="btn-cost">💰{{ food.cost }}</span>
                    <span class="btn-restore">+{{ food.satietyRestore }}</span>
                  </button>
                </div>
              </div>

              <!-- 洗澡 -->
              <div class="action-group">
                <div class="action-label">
                  <span>🛁 洗澡</span>
                </div>
                <button
                  class="action-btn bath-btn"
                  :class="{ disabled: attrData.money < BATH_COST }"
                  :disabled="attrData.money < BATH_COST"
                  @click="handleBathe"
                >
                  <span class="btn-emoji">🚿</span>
                  <span class="btn-info">
                    <span class="btn-cost">💰{{ BATH_COST }}</span>
                    <span class="btn-restore">+50清洁</span>
                  </span>
                </button>
              </div>

              <!-- 打工 -->
              <div class="action-group">
                <div class="action-label">
                  <span>💼 打工</span>
                </div>
                <div class="work-grid">
                  <button
                    v-for="work in workList"
                    :key="work.state"
                    class="action-btn work-btn"
                    :class="{ disabled: !work.canStart }"
                    :disabled="!work.canStart"
                    @click="handleWork(work.state)"
                  >
                    <span class="btn-emoji">
                      {{
                        work.state === "brickCarrying"
                          ? "🧱"
                          : work.state === "flyerDistributing"
                            ? "📢"
                            : "💻"
                      }}
                    </span>
                    <span class="btn-info">
                      <span class="work-name">{{ work.name }}</span>
                      <span class="btn-cost">+💰{{ work.income }}</span>
                      <span class="btn-restore">需⚡{{ work.staminaReq }}</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.attr-modal-overlay {
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

.attr-modal {
  width: 320px;
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

.attr-title {
  background: linear-gradient(135deg, #f472b6, #fb923c);
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

.modal-body {
  padding: 0 20px 20px;
  overflow-y: auto;
  flex: 1;
}

/* 等级区域 */
.level-section {
  padding: 14px 16px;
  background: linear-gradient(
    135deg,
    rgba(244, 114, 182, 0.08),
    rgba(251, 146, 60, 0.06)
  );
  border-radius: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(244, 114, 182, 0.12);
}

.level-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.level-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  background: var(--level-badge-bg);
  border-radius: 20px;
}

.level-icon {
  font-size: 16px;
}

.level-number {
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, #f472b6, #fb923c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cap-hint {
  font-size: 12px;
  color: var(--cap-text-color);
}

.cap-value {
  font-weight: 700;
}

.exp-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.exp-bar-bg {
  flex: 1;
  height: 8px;
  background: var(--exp-bar-bg);
  border-radius: 4px;
  overflow: hidden;
}

.exp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #f472b6, #fb923c);
  border-radius: 4px;
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 8px rgba(244, 114, 182, 0.4);
}

.exp-text {
  font-size: 11px;
  color: var(--attr-label-color);
  white-space: nowrap;
  min-width: 60px;
  text-align: right;
}

.max-level-hint {
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  background: linear-gradient(135deg, #f472b6, #fb923c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.daily-exp-hint {
  text-align: center;
  font-size: 11px;
  color: var(--cap-text-color);
  margin-top: 6px;
}

/* 属性条 */
.attributes-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.attr-item {
  padding: 10px 14px;
  background: var(--action-btn-bg);
  border-radius: 14px;
  transition: all 0.2s ease;
}

.attr-item.attr-warning {
  animation: attr-pulse 1.5s ease-in-out infinite;
}

@keyframes attr-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
  50% {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
  }
}

.attr-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.attr-icon {
  font-size: 14px;
}

.attr-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--attr-label-color);
  flex: 1;
}

.attr-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--attr-value-color);
}

.attr-cap {
  font-size: 12px;
  font-weight: 400;
  color: var(--attr-label-color);
}

.attr-bar-bg {
  height: 6px;
  background: var(--attr-bar-bg);
  border-radius: 3px;
  overflow: hidden;
}

.attr-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bar-orange {
  background: linear-gradient(90deg, #f97316, #fb923c);
  box-shadow: 0 0 6px rgba(249, 115, 22, 0.4);
}

.bar-blue {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.4);
}

.bar-green {
  background: linear-gradient(90deg, #10b981, #34d399);
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
}

.bar-red {
  background: linear-gradient(90deg, #ef4444, #f87171);
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
}

/* 金币 */
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

/* 操作区域 */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.action-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--section-title-color);
}

.food-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.work-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 6px;
  border: none;
  border-radius: 14px;
  background: var(--action-btn-bg);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.action-btn:hover:not(.disabled) {
  background: var(--action-btn-hover-bg);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn:active:not(.disabled) {
  transform: translateY(0) scale(0.97);
}

.action-btn.disabled {
  background: var(--action-btn-disabled-bg);
  cursor: not-allowed;
}

.btn-emoji {
  font-size: 20px;
  line-height: 1;
}

.btn-cost {
  font-size: 10px;
  font-weight: 600;
  color: var(--cost-color);
  line-height: 1;
}

.btn-restore {
  font-size: 9px;
  color: var(--attr-label-color);
  line-height: 1;
}

.action-btn.disabled .btn-cost,
.action-btn.disabled .btn-restore {
  color: var(--action-btn-disabled-color);
}

/* 洗澡按钮 */
.bath-btn {
  flex-direction: row;
  padding: 10px 14px;
  gap: 10px;
}

.bath-btn .btn-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

/* 打工按钮 */
.work-btn {
  flex-direction: row;
  padding: 10px 14px;
  gap: 10px;
}

.work-btn .btn-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.work-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--attr-value-color);
}

.work-btn.disabled .work-name {
  color: var(--action-btn-disabled-color);
}

/* 动画 */
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
  background: rgba(244, 114, 182, 0.2);
  border-radius: 2px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(244, 114, 182, 0.4);
}
</style>
