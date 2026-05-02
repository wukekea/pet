<script setup lang="ts">
import { computed, ref } from "vue";
import { isDark } from "../composables/theme";
import { useToast } from "../composables/useToast";
import type { DecorationType, DecorationEffectType } from "../types";
import {
  useAttributeRef,
  getCurrentAttributeCap,
  getExpProgress,
  getDailyInteractionProgress,
  startWork,
  canWork,
  equipDecoration,
  unequipDecoration,
  getDecorationSlotConflict,
} from "../composables/attributes";
import {
  WORK_INCOME,
  WORK_STAMINA_REQUIRED,
  getExpRequiredForLevel,
  DECORATION_CONFIGS,
  DECORATION_SLOTS,
  SLOT_NAMES,
  MAX_EQUIPPED_DECORATIONS,
  getActiveEffects,
  EFFECT_TYPE_NAMES,
  SHAPE_SHOP_CONFIGS,
} from "../composables/attributeStorage";
import { currentPetShape, savePetShape } from "../composables/petShapeStorage";
import DecoIcon from "../shapes/decorations/DecoIcon.vue";
import { HEALTH_CAP, MAX_LEVEL } from "../constants";
import type { PetState, PetShape } from "../types";

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
  openShop: [];
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
    rules: [
      { icon: "📉", text: "每 5 分钟 -1" },
      { icon: "⚠️", text: "低于 30 时健康下降" },
      { icon: "🍽️", text: "低于 30 时自动吃饭" },
    ],
  },
  {
    key: "cleanliness" as const,
    icon: "🛁",
    name: "清洁",
    value: attrData.value.cleanliness,
    cap: attrCap.value,
    color: "blue",
    rules: [
      { icon: "📉", text: "每 8 分钟 -1" },
      { icon: "⚠️", text: "低于 30 时健康下降" },
      { icon: "🚿", text: "低于 30 时自动洗澡" },
    ],
  },
  {
    key: "stamina" as const,
    icon: "⚡",
    name: "体力",
    value: attrData.value.stamina,
    cap: attrCap.value,
    color: "green",
    rules: [
      { icon: "📉", text: "打工时每 1 分钟 -1" },
      { icon: "📈", text: "平时每 30 秒 +1" },
      { icon: "😴", text: "睡眠时每 10 秒 +1" },
      { icon: "💤", text: "为 0 时强制睡觉" },
      { icon: "💼", text: "打工需最低体力 15~45" },
    ],
  },
  {
    key: "health" as const,
    icon: "❤️",
    name: "健康",
    value: attrData.value.health,
    cap: HEALTH_CAP,
    color: "red",
    rules: [
      { icon: "📉", text: "饥饿时每 3 分钟 -1" },
      { icon: "📉", text: "脏时每 5 分钟 -1" },
      { icon: "📈", text: "正常时每 3 分钟 +1" },
      { icon: "🔒", text: "上限固定 100" },
      { icon: "🐾", text: "影响宠物行为表现" },
    ],
  },
]);

// 悬浮提示状态
const hoveredAttr = ref<string | null>(null);
const hoveredWork = ref<string | null>(null);

// 打工提示规则
const workRules: Record<string, { icon: string; text: string }[]> = {
  brickCarrying: [
    { icon: "⏱️", text: "持续 30 分钟" },
    { icon: "⚡", text: "每 1 分钟消耗 1 体力" },
    { icon: "📉", text: "饱腹衰减加速 3 倍" },
    { icon: "📉", text: "清洁衰减加速 3 倍" },
    { icon: "💰", text: "完成后获得 35 金币 + 35 经验" },
  ],
  flyerDistributing: [
    { icon: "⏱️", text: "持续 15 分钟" },
    { icon: "⚡", text: "每 1 分钟消耗 1 体力" },
    { icon: "💰", text: "完成后获得 10 金币 + 25 经验" },
  ],
  programmer: [
    { icon: "⏱️", text: "持续 45 分钟" },
    { icon: "⚡", text: "每 1 分钟消耗 1 体力" },
    { icon: "💰", text: "完成后获得 50 金币 + 50 经验" },
  ],
};

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

// 打开商店
const handleOpenShop = () => {
  close();
  emit("openShop");
};

// 处理打工
const handleWork = (workState: PetState) => {
  if (startWork(workState)) {
    close();
  }
};

// 装饰列表（已拥有的）
const ownedDecoList = computed(() => {
  const owned = attrData.value.ownedDecorations || [];
  const equipped = attrData.value.equippedDecorations || [];
  return owned
    .map((type) => {
      const config = DECORATION_CONFIGS[type as DecorationType];
      if (!config) return null;
      return {
        type,
        name: config.name,
        icon: "",
        isEquipped: equipped.includes(type),
        slot: DECORATION_SLOTS[type as DecorationType],
        slotName: SLOT_NAMES[DECORATION_SLOTS[type as DecorationType]],
      };
    })
    .filter(Boolean);
});

// 当前激活的装饰效果列表
const activeEffectsList = computed(() => {
  const equipped = attrData.value.equippedDecorations || [];
  const effects = getActiveEffects(equipped);
  return Object.entries(effects)
    .filter(([, value]) => value > 0)
    .map(([type, value]) => ({
      name: EFFECT_TYPE_NAMES[type as DecorationEffectType],
      value: `+${Math.round(value * 100)}%`,
    }));
});

// 装饰提示
const {
  toastMessage: decoToast,
  toastVisible: decoToastVisible,
  showToast: showDecoToast,
} = useToast();

// 形态列表（已拥有）
const ownedShapeList = computed(() => {
  const ownedShapes = attrData.value.ownedShapes ?? ["cloud"];
  // cloud 是默认形态
  const allShapes: Array<{ type: PetShape; name: string; icon: string }> = [
    { type: "cloud", name: "云朵", icon: "☁️" },
    ...Object.values(SHAPE_SHOP_CONFIGS).map((s) => ({
      type: s.type as PetShape,
      name: s.name,
      icon: s.icon,
    })),
  ];
  return allShapes.filter((s) => ownedShapes.includes(s.type));
});

// 切换形态
const handleShapeSwitch = (shape: PetShape) => {
  savePetShape(shape);
};

// 装备/卸下装饰
const handleDecoClick = (type: string) => {
  const dType = type as DecorationType;
  const equipped = attrData.value.equippedDecorations || [];

  if (equipped.includes(type)) {
    unequipDecoration(dType);
    return;
  }

  // 检查槽位冲突
  const conflict = getDecorationSlotConflict(dType);
  if (conflict) {
    const slotName = SLOT_NAMES[DECORATION_SLOTS[dType]];
    showDecoToast(`需先卸下${conflict}(${slotName}位)`);
    return;
  }

  // 检查数量上限
  if (equipped.length >= MAX_EQUIPPED_DECORATIONS) {
    showDecoToast("最多同时装备3个装饰");
    return;
  }

  equipDecoration(dType);
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

// 关闭弹窗（passthrough 由父组件 useModal 管理）
const close = () => {
  emit("close");
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
                @mouseenter="hoveredAttr = bar.key"
                @mouseleave="hoveredAttr = null"
              >
                <div class="attr-header">
                  <span class="attr-icon">{{ bar.icon }}</span>
                  <span class="attr-name">{{ bar.name }}</span>
                  <span class="attr-value">
                    {{ bar.value }}<span class="attr-cap">/{{ bar.cap }}</span>
                  </span>
                  <span class="attr-info-icon">ⓘ</span>
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
                <!-- 悬浮提示 -->
                <Transition name="tooltip-fade">
                  <div
                    v-if="hoveredAttr === bar.key"
                    class="attr-tooltip"
                    :class="`tooltip-${bar.color}`"
                  >
                    <div class="tooltip-title">
                      {{ bar.icon }} {{ bar.name }}规则
                    </div>
                    <div
                      v-for="(rule, i) in bar.rules"
                      :key="i"
                      class="tooltip-rule"
                    >
                      <span class="rule-icon">{{ rule.icon }}</span>
                      <span class="rule-text">{{ rule.text }}</span>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- 金币 -->
            <div class="money-section">
              <div class="money-badge">
                <span class="money-icon">💰</span>
                <span class="money-amount">{{ attrData.money }}</span>
              </div>
            </div>

            <!-- 我的形态 -->
            <div class="shape-section">
              <div class="shape-header">
                <span class="shape-title">🐾 我的形态</span>
                <button class="deco-shop-link" @click="handleOpenShop">
                  去商店 ›
                </button>
              </div>
              <div class="shape-grid">
                <button
                  v-for="shape in ownedShapeList"
                  :key="shape.type"
                  class="shape-item"
                  :class="{ active: currentPetShape === shape.type }"
                  @click="handleShapeSwitch(shape.type)"
                >
                  <span class="shape-item-icon">{{ shape.icon }}</span>
                  <span class="shape-item-name">{{ shape.name }}</span>
                  <span
                    class="shape-item-badge"
                    :class="
                      currentPetShape === shape.type
                        ? 'badge-active'
                        : 'badge-inactive'
                    "
                  >
                    {{ currentPetShape === shape.type ? "使用中" : "切换" }}
                  </span>
                </button>
              </div>
            </div>

            <!-- 我的装饰 -->
            <div class="deco-section">
              <div class="deco-header">
                <span class="deco-title">💍 我的装饰</span>
                <button class="deco-shop-link" @click="handleOpenShop">
                  去商店 ›
                </button>
              </div>

              <!-- 提示 -->
              <Transition name="toast-slide">
                <div v-if="decoToastVisible" class="deco-toast">
                  <span>{{ decoToast }}</span>
                </div>
              </Transition>

              <template v-if="ownedDecoList.length > 0">
                <div class="deco-grid">
                  <button
                    v-for="item in ownedDecoList"
                    :key="item!.type"
                    class="deco-item"
                    :class="{ equipped: item!.isEquipped }"
                    @click="handleDecoClick(item!.type)"
                  >
                    <span class="deco-item-icon"
                      ><DecoIcon :type="item!.type as DecorationType"
                    /></span>
                    <span class="deco-item-name">{{ item!.name }}</span>
                    <span
                      class="deco-item-badge"
                      :class="
                        item!.isEquipped ? 'badge-equipped' : 'badge-equip'
                      "
                    >
                      {{ item!.isEquipped ? "已装备" : item!.slotName }}
                    </span>
                  </button>
                </div>
              </template>
              <div v-else class="deco-empty">还没有装饰，去商店看看吧</div>

              <!-- 装饰效果汇总 -->
              <div v-if="activeEffectsList.length > 0" class="active-effects">
                <div class="effects-title">✨ 装饰效果</div>
                <div class="effects-list">
                  <span
                    v-for="effect in activeEffectsList"
                    :key="effect.name"
                    class="effect-tag"
                  >
                    {{ effect.name }}{{ effect.value }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 操作区域 -->
            <div class="actions-section">
              <!-- 去商店 -->
              <button class="shop-btn" @click="handleOpenShop">
                <span class="shop-btn-icon">🛒</span>
                <span class="shop-btn-text">去商店</span>
                <span class="shop-btn-desc">购买食物和沐浴露</span>
              </button>

              <!-- 打工 -->
              <div class="action-group">
                <div class="action-label">
                  <span>💼 打工</span>
                </div>
                <div class="work-grid">
                  <div
                    v-for="work in workList"
                    :key="work.state"
                    class="work-btn-wrapper"
                    @mouseenter="hoveredWork = work.state"
                    @mouseleave="hoveredWork = null"
                  >
                    <button
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
                        <span class="btn-restore"
                          >需⚡{{ work.staminaReq }}</span
                        >
                      </span>
                    </button>
                    <Transition name="tooltip-fade">
                      <div
                        v-if="
                          hoveredWork === work.state && workRules[work.state]
                        "
                        class="work-tooltip"
                      >
                        <div class="tooltip-title tooltip-title-purple">
                          {{
                            work.state === "brickCarrying"
                              ? "🧱"
                              : work.state === "flyerDistributing"
                                ? "📢"
                                : "💻"
                          }}
                          {{ work.name }}规则
                        </div>
                        <div
                          v-for="(rule, i) in workRules[work.state]"
                          :key="i"
                          class="tooltip-rule"
                        >
                          <span class="rule-icon">{{ rule.icon }}</span>
                          <span class="rule-text">{{ rule.text }}</span>
                        </div>
                      </div>
                    </Transition>
                  </div>
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
  width: 360px;
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
  position: relative;
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

/* 属性信息图标 */
.attr-info-icon {
  font-size: 12px;
  color: var(--cap-text-color);
  opacity: 0.6;
  transition: opacity 0.2s ease;
  cursor: help;
}

.attr-item:hover .attr-info-icon {
  opacity: 1;
}

/* 属性悬浮提示 */
.attr-tooltip {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  z-index: 10;
  margin-top: 6px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 11px;
  line-height: 1.5;
  pointer-events: none;
  border: 1px solid;
}

.dark-mode .attr-tooltip {
  background: rgba(20, 16, 30, 0.96);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

:not(.dark-mode) .attr-tooltip {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 提示框主题色 */
.tooltip-orange {
  border-color: rgba(249, 115, 22, 0.25);
}
.tooltip-blue {
  border-color: rgba(59, 130, 246, 0.25);
}
.tooltip-green {
  border-color: rgba(16, 185, 129, 0.25);
}
.tooltip-red {
  border-color: rgba(239, 68, 68, 0.25);
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 12px;
}

.tooltip-orange .tooltip-title {
  color: #f97316;
}
.tooltip-blue .tooltip-title {
  color: #3b82f6;
}
.tooltip-green .tooltip-title {
  color: #10b981;
}
.tooltip-red .tooltip-title {
  color: #ef4444;
}

.dark-mode .tooltip-orange .tooltip-title {
  color: #fb923c;
}
.dark-mode .tooltip-blue .tooltip-title {
  color: #60a5fa;
}
.dark-mode .tooltip-green .tooltip-title {
  color: #34d399;
}
.dark-mode .tooltip-red .tooltip-title {
  color: #f87171;
}

.tooltip-rule {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
}

.rule-icon {
  font-size: 11px;
  flex-shrink: 0;
  width: 16px;
  text-align: center;
}

.rule-text {
  color: var(--attr-label-color);
}

/* 提示框动画 */
.tooltip-fade-enter-active {
  animation: tooltip-in 0.2s ease-out;
}
.tooltip-fade-leave-active {
  animation: tooltip-out 0.15s ease-in;
}

@keyframes tooltip-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes tooltip-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-4px);
  }
}

/* 打工按钮提示 */
.work-btn-wrapper {
  position: relative;
}

.work-btn-wrapper .work-btn {
  width: 100%;
}

.work-tooltip {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 100%;
  z-index: 10;
  margin-bottom: 4px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 11px;
  line-height: 1.5;
  pointer-events: none;
  border: 1px solid rgba(139, 92, 246, 0.25);
}

.dark-mode .work-tooltip {
  background: rgba(20, 16, 30, 0.96);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

:not(.dark-mode) .work-tooltip {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.tooltip-title-purple {
  color: #8b5cf6;
}

.dark-mode .tooltip-title-purple {
  color: #a78bfa;
}

/* 我的形态 */
.shape-section {
  margin-bottom: 16px;
}

.shape-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.shape-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--section-title-color);
}

.shape-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.shape-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 4px 6px;
  border: 1px solid rgba(52, 211, 153, 0.12);
  border-radius: 10px;
  background: rgba(52, 211, 153, 0.04);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.shape-item.active {
  border-color: rgba(52, 211, 153, 0.35);
  background: rgba(52, 211, 153, 0.1);
  box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.1);
}

.shape-item:hover:not(.active) {
  border-color: rgba(52, 211, 153, 0.25);
  background: rgba(52, 211, 153, 0.07);
  transform: translateY(-2px);
}

.shape-item:active {
  transform: translateY(0) scale(0.96);
}

.shape-item-icon {
  font-size: 18px;
  line-height: 1;
}

.shape-item-name {
  font-size: 10px;
  font-weight: 600;
  color: var(--attr-value-color);
  line-height: 1;
}

.shape-item-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 6px;
  line-height: 1.3;
}

.badge-active {
  color: #059669;
  background: rgba(52, 211, 153, 0.12);
}

.dark-mode .badge-active {
  color: #34d399;
  background: rgba(52, 211, 153, 0.15);
}

.badge-inactive {
  color: var(--attr-label-color);
  background: rgba(107, 114, 128, 0.08);
}

/* 我的装饰 */
.deco-section {
  margin-bottom: 16px;
}

.deco-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.deco-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--section-title-color);
}

.deco-shop-link {
  font-size: 12px;
  color: #a855f7;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.deco-shop-link:hover {
  background: rgba(168, 85, 247, 0.1);
}

.deco-toast {
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  color: #7c3aed;
  background: rgba(168, 85, 247, 0.08);
  border: 1px solid rgba(168, 85, 247, 0.15);
  text-align: center;
}

.toast-slide-enter-active {
  animation: toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-slide-leave-active {
  animation: toast-out 0.2s ease-in;
}

@keyframes toast-in {
  0% {
    opacity: 0;
    transform: translateY(-6px) scale(0.95);
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
    transform: translateY(-4px) scale(0.95);
  }
}

.deco-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.deco-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 4px 6px;
  border: 1px solid rgba(168, 85, 247, 0.12);
  border-radius: 10px;
  background: rgba(168, 85, 247, 0.04);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.deco-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(
    180deg,
    rgba(168, 85, 247, 0.04) 0%,
    transparent 100%
  );
  pointer-events: none;
  border-radius: 14px 14px 0 0;
}

.deco-item.equipped {
  border-color: rgba(168, 85, 247, 0.35);
  background: rgba(168, 85, 247, 0.1);
  box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.1);
}

.deco-item.equipped::before {
  background: linear-gradient(
    180deg,
    rgba(168, 85, 247, 0.08) 0%,
    transparent 100%
  );
}

.deco-item:hover:not(.equipped) {
  border-color: rgba(168, 85, 247, 0.25);
  background: rgba(168, 85, 247, 0.07);
  transform: translateY(-2px);
}

.deco-item:active {
  transform: translateY(0) scale(0.96);
}

.deco-item-icon {
  font-size: 18px;
  line-height: 1;
}

.deco-item:hover .deco-item-icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

.deco-item-name {
  font-size: 10px;
  font-weight: 600;
  color: var(--attr-value-color);
  line-height: 1;
}

.deco-item-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 6px;
  line-height: 1.3;
}

.badge-equipped {
  color: #7c3aed;
  background: rgba(168, 85, 247, 0.12);
}

.badge-equip {
  color: var(--attr-label-color);
  background: rgba(107, 114, 128, 0.08);
}

.deco-empty {
  text-align: center;
  font-size: 12px;
  color: var(--attr-label-color);
  padding: 16px 0;
  opacity: 0.7;
}

/* 装饰效果汇总 */
.active-effects {
  margin-top: 10px;
  padding: 8px 10px;
  background: rgba(168, 85, 247, 0.06);
  border-radius: 10px;
  border: 1px solid rgba(168, 85, 247, 0.1);
}

.effects-title {
  font-size: 11px;
  font-weight: 600;
  color: #7c3aed;
  margin-bottom: 6px;
}

.dark-mode .effects-title {
  color: #a78bfa;
}

.effects-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.effect-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(168, 85, 247, 0.1);
  color: #7c3aed;
}

.dark-mode .effect-tag {
  background: rgba(168, 85, 247, 0.15);
  color: #a78bfa;
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

/* 去商店按钮 */
.shop-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    rgba(251, 191, 36, 0.08),
    rgba(245, 158, 11, 0.04)
  );
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.shop-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(
    180deg,
    rgba(251, 191, 36, 0.06) 0%,
    transparent 100%
  );
  pointer-events: none;
}

.shop-btn:hover {
  background: linear-gradient(
    135deg,
    rgba(251, 191, 36, 0.15),
    rgba(245, 158, 11, 0.08)
  );
  border-color: rgba(251, 191, 36, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.15);
}

.shop-btn:active {
  transform: translateY(0) scale(0.98);
}

.shop-btn-icon {
  font-size: 20px;
}

.shop-btn-text {
  font-size: 14px;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.shop-btn-desc {
  font-size: 11px;
  color: var(--attr-label-color);
  flex: 1;
  text-align: right;
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
