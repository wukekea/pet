<script setup lang="ts">
/**
 * 通用确认对话框
 * 从 stats 私有的"重置确认"弹窗抽出，供任何危险操作二次确认使用。
 * 视觉与原实现一致：警告图标 + 脉冲光环 + 取消/确认按钮。
 */
import type { StyleValue } from "vue";
import { isDark } from "../composables/theme";

defineProps<{
  /** 是否可见 */
  visible: boolean;
  /** 标题（默认"确认操作"） */
  title?: string;
  /** 提示信息主文案 */
  message: string;
  /** 警示副文案（红字，如"此操作不可撤销"） */
  warning?: string;
  /** 警告图标 emoji（默认 ⚠️） */
  icon?: string;
  /** 确认按钮文字（默认"确认"） */
  confirmText?: string;
  /** 取消按钮文字（默认"取消"） */
  cancelText?: string;
  /** 主题 CSS 变量（含 --confirm-overlay-bg/--confirm-dialog-bg 等） */
  cssVars?: Record<string, string>;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <Transition name="confirm-pop">
    <div
      v-if="visible"
      class="confirm-overlay"
      :style="cssVars as StyleValue"
      @click="emit('cancel')"
    >
      <div class="confirm-dialog" :class="{ 'dark-mode': isDark }" @click.stop>
        <!-- 警告图标区域 -->
        <div class="confirm-icon-wrapper">
          <div class="confirm-icon-circle">
            <span class="confirm-icon">{{ icon ?? "⚠️" }}</span>
          </div>
          <div class="icon-pulse"></div>
        </div>

        <!-- 文字内容 -->
        <div class="confirm-content">
          <h3 class="confirm-title">{{ title ?? "确认操作" }}</h3>
          <p class="confirm-message">
            {{ message }}
            <br v-if="warning" />
            <span v-if="warning" class="confirm-warning">{{ warning }}</span>
          </p>
        </div>

        <!-- 按钮区域 -->
        <div class="confirm-buttons">
          <button class="confirm-btn confirm-cancel" @click="emit('cancel')">
            {{ cancelText ?? "取消" }}
          </button>
          <button class="confirm-btn confirm-ok" @click="emit('confirm')">
            {{ confirmText ?? "确认" }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-confirm, 10002);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--confirm-overlay-bg, rgba(0, 0, 0, 0.5));
  backdrop-filter: blur(4px);
  pointer-events: auto !important;
}

.confirm-dialog {
  width: 320px;
  padding: 28px 24px 24px;
  border-radius: 24px;
  background: var(--confirm-dialog-bg, rgba(255, 255, 255, 0.98));
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px var(--confirm-dialog-border, rgba(0, 0, 0, 0.05));
  text-align: center;
  pointer-events: auto !important;
  position: relative;
  overflow: hidden;
}

.confirm-dialog::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: radial-gradient(
    ellipse at center top,
    var(--confirm-dialog-gradient, rgba(251, 191, 36, 0.1)) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.confirm-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.confirm-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(251, 191, 36, 0.15),
    rgba(245, 158, 11, 0.1)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  animation: icon-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-icon {
  font-size: 32px;
}

.icon-pulse {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid rgba(251, 191, 36, 0.3);
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes icon-bounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.confirm-content {
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.confirm-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--confirm-title-color, #1f2937);
  margin: 0 0 8px;
  letter-spacing: 0.3px;
}

.confirm-message {
  font-size: 14px;
  color: var(--confirm-message-color, #6b7280);
  margin: 0;
  line-height: 1.6;
}

.confirm-warning {
  color: #ef4444;
  font-weight: 500;
}

.confirm-buttons {
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.confirm-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-cancel {
  background: var(--confirm-cancel-bg, rgba(0, 0, 0, 0.05));
  color: var(--confirm-cancel-color, #6b7280);
}

.confirm-cancel:hover {
  background: var(--confirm-cancel-hover-bg, rgba(0, 0, 0, 0.08));
  transform: translateY(-2px);
}

.confirm-ok {
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
}

.confirm-ok:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45);
}

.confirm-ok:active {
  transform: translateY(0);
}

/* 进出场动画 */
.confirm-pop-enter-active {
  animation: confirm-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-pop-leave-active {
  animation: confirm-out 0.2s ease-in;
}

@keyframes confirm-in {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes confirm-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.95);
  }
}
</style>
