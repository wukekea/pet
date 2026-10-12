<script setup lang="ts">
/**
 * 通用提示浮层（toast）
 * 替代 shop/warehouse 各自复制的 toast-notification 模板与动画。
 */
import type { StyleValue } from "vue";

defineProps<{
  visible: boolean;
  message: string;
  /** 可选的图标，默认 🎉 */
  icon?: string;
  /** 文字颜色（CSS color 值） */
  color?: string;
}>();
</script>

<template>
  <Transition name="toast-slide">
    <div
      v-if="visible"
      class="toast-notification"
      :style="
        color ? ({ '--toast-text-color': color } as StyleValue) : undefined
      "
    >
      <span class="toast-icon">{{ icon ?? "🎉" }}</span>
      <span class="toast-text">{{ message }}</span>
    </div>
  </Transition>
</template>

<style scoped>
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
  color: var(--toast-text-color, inherit);
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
</style>
