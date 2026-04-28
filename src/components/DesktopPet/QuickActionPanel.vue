<script setup lang="ts">
// 快捷操作面板 - 双击宠物后显示属性概览和快捷操作按钮
import { ref, watch, onBeforeUnmount, computed } from "vue";

const props = defineProps<{
  visible: boolean;
  satiety: number;
  cleanliness: number;
  stamina: number;
  health: number;
  attributeCap: number;
  canFeed: boolean;
  canBath: boolean;
  canWork: boolean;
}>();

const emit = defineEmits<{
  close: [];
  feed: [];
  bath: [];
  work: [];
}>();

// 自动关闭计时器
let autoCloseTimer: ReturnType<typeof setTimeout> | null = null;
const AUTO_CLOSE_DELAY = 3000;

// 是否正在显示（用于动画控制）
const isShowing = ref(false);

// 属性百分比
const satietyPct = computed(
  () => Math.min(100, (props.satiety / props.attributeCap) * 100) + "%",
);
const cleanlinessPct = computed(
  () => Math.min(100, (props.cleanliness / props.attributeCap) * 100) + "%",
);
const staminaPct = computed(
  () => Math.min(100, (props.stamina / props.attributeCap) * 100) + "%",
);
const healthPct = computed(
  () => Math.min(100, (props.health / props.attributeCap) * 100) + "%",
);

// 属性是否处于低值警告
const isSatietyLow = computed(() => props.satiety / props.attributeCap < 0.25);
const isCleanlinesLow = computed(
  () => props.cleanliness / props.attributeCap < 0.25,
);
const isStaminaLow = computed(() => props.stamina / props.attributeCap < 0.25);
const isHealthLow = computed(() => props.health / props.attributeCap < 0.25);

function resetAutoClose() {
  if (autoCloseTimer) clearTimeout(autoCloseTimer);
  autoCloseTimer = setTimeout(() => {
    emit("close");
  }, AUTO_CLOSE_DELAY);
}

function handleAction(action: "feed" | "bath" | "work") {
  if (autoCloseTimer) clearTimeout(autoCloseTimer);
  if (action === "feed") emit("feed");
  else if (action === "bath") emit("bath");
  else emit("work");
  emit("close");
}

// 点击面板自身时重置计时器，阻止冒泡
function handlePanelClick(e: MouseEvent) {
  e.stopPropagation();
  resetAutoClose();
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      isShowing.value = true;
      resetAutoClose();
    } else {
      isShowing.value = false;
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
      }
    }
  },
);

onBeforeUnmount(() => {
  if (autoCloseTimer) clearTimeout(autoCloseTimer);
});
</script>

<template>
  <Transition name="qap">
    <div
      v-if="visible"
      class="quick-action-panel"
      @click="handlePanelClick"
      @mouseenter="resetAutoClose"
    >
      <!-- 头顶属性条 -->
      <div class="attr-bars">
        <div class="attr-row" :class="{ warning: isSatietyLow }">
          <span class="attr-icon">🍖</span>
          <div class="attr-track">
            <div
              class="attr-fill attr-satiety"
              :style="{ width: satietyPct }"
            ></div>
          </div>
        </div>
        <div class="attr-row" :class="{ warning: isCleanlinesLow }">
          <span class="attr-icon">💧</span>
          <div class="attr-track">
            <div
              class="attr-fill attr-cleanliness"
              :style="{ width: cleanlinessPct }"
            ></div>
          </div>
        </div>
        <div class="attr-row" :class="{ warning: isStaminaLow }">
          <span class="attr-icon">⚡</span>
          <div class="attr-track">
            <div
              class="attr-fill attr-stamina"
              :style="{ width: staminaPct }"
            ></div>
          </div>
        </div>
        <div class="attr-row" :class="{ warning: isHealthLow }">
          <span class="attr-icon">❤️</span>
          <div class="attr-track">
            <div
              class="attr-fill attr-health"
              :style="{ width: healthPct }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 脚下操作按钮 -->
      <div class="action-btns">
        <button
          class="act-btn act-feed"
          :class="{ disabled: !canFeed }"
          :disabled="!canFeed"
          @click.stop="handleAction('feed')"
          title="喂食"
        >
          <span class="act-icon">🍖</span>
        </button>
        <button
          class="act-btn act-bath"
          :class="{ disabled: !canBath }"
          :disabled="!canBath"
          @click.stop="handleAction('bath')"
          title="清洗"
        >
          <span class="act-icon">🛁</span>
        </button>
        <button
          class="act-btn act-work"
          :class="{ disabled: !canWork }"
          :disabled="!canWork"
          @click.stop="handleAction('work')"
          title="打工"
        >
          <span class="act-icon">💼</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.quick-action-panel {
  position: absolute;
  inset: -55px -30px -48px -30px;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

/* ===== 属性条区域 ===== */
.attr-bars {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px 8px 5px;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  min-width: 90px;
  animation: attr-slide-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.attr-row {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 12px;
}

.attr-icon {
  font-size: 9px;
  line-height: 1;
  width: 12px;
  text-align: center;
  flex-shrink: 0;
}

.attr-track {
  flex: 1;
  height: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  min-width: 60px;
}

.attr-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

/* 进度条末端高光 */
.attr-fill::after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35));
  border-radius: 0 3px 3px 0;
}

/* 各属性颜色 */
.attr-satiety {
  background: linear-gradient(90deg, #e8890c, #f5a623);
  box-shadow: 0 0 6px rgba(245, 166, 35, 0.4);
}

.attr-cleanliness {
  background: linear-gradient(90deg, #2d9cdb, #56ccf2);
  box-shadow: 0 0 6px rgba(86, 204, 242, 0.4);
}

.attr-stamina {
  background: linear-gradient(90deg, #27ae60, #6fcf97);
  box-shadow: 0 0 6px rgba(111, 207, 151, 0.4);
}

.attr-health {
  background: linear-gradient(90deg, #eb5757, #ff8a8a);
  box-shadow: 0 0 6px rgba(235, 87, 87, 0.4);
}

/* 低值警告闪烁 */
.attr-row.warning .attr-fill {
  animation: bar-pulse 1s ease-in-out infinite;
}

.attr-row.warning .attr-icon {
  animation: icon-shake 0.8s ease-in-out infinite;
}

@keyframes bar-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes icon-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-1px);
  }
  75% {
    transform: translateX(1px);
  }
}

/* ===== 操作按钮区域 ===== */
.action-btns {
  pointer-events: auto;
  display: flex;
  gap: 8px;
  animation: btns-pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.08s both;
}

.act-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow:
    0 3px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.act-icon {
  font-size: 14px;
  line-height: 1;
}

/* 各按钮独立入场延迟 */
.act-btn:nth-child(1) {
  animation: single-btn-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}
.act-btn:nth-child(2) {
  animation: single-btn-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.18s both;
}
.act-btn:nth-child(3) {
  animation: single-btn-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.26s both;
}

/* 悬停效果 - 各按钮独立主题色 */
.act-feed:hover:not(.disabled) {
  border-color: rgba(245, 166, 35, 0.6);
  background: rgba(245, 166, 35, 0.2);
  box-shadow:
    0 4px 16px rgba(245, 166, 35, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: scale(1.15) translateY(-2px);
}

.act-bath:hover:not(.disabled) {
  border-color: rgba(86, 204, 242, 0.6);
  background: rgba(86, 204, 242, 0.2);
  box-shadow:
    0 4px 16px rgba(86, 204, 242, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: scale(1.15) translateY(-2px);
}

.act-work:hover:not(.disabled) {
  border-color: rgba(111, 207, 151, 0.6);
  background: rgba(111, 207, 151, 0.2);
  box-shadow:
    0 4px 16px rgba(111, 207, 151, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: scale(1.15) translateY(-2px);
}

.act-btn:active:not(.disabled) {
  transform: scale(0.92);
  transition-duration: 0.06s;
}

/* 禁用态 */
.act-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  filter: grayscale(0.8);
}

/* ===== 入场/退场动画 ===== */
@keyframes attr-slide-in {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes btns-pop-in {
  0% {
    opacity: 0;
    transform: translateY(-6px) scale(0.7);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes single-btn-pop {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Vue Transition */
.qap-enter-active {
  transition: opacity 0.25s ease;
}

.qap-leave-active {
  transition: opacity 0.2s ease;
}

.qap-enter-from,
.qap-leave-to {
  opacity: 0;
}

.qap-leave-to .attr-bars {
  transform: translateY(5px) scale(0.9);
  opacity: 0;
  transition: all 0.2s ease;
}

.qap-leave-to .action-btns {
  transform: translateY(-5px) scale(0.9);
  opacity: 0;
  transition: all 0.2s ease;
}
</style>
