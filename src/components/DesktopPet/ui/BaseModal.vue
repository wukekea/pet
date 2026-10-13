<script setup lang="ts">
/**
 * 通用弹窗骨架组件
 * 统一 6 个功能弹窗的：Teleport + 进出场动画 + 遮罩层 + 标题栏 +
 * 关闭按钮 + 装饰星星，消除各弹窗的逐字重复样板。
 *
 * 使用方式：
 *   <BaseModal
 *     :visible="visible"
 *     title="商店"
 *     icon="🛒"
 *     :decor-emojis="['🪙', '✨', '💫']"
 *     :width="380"
 *     :height="560"
 *     :css-vars="cssVars"
 *     :title-gradient="'linear-gradient(135deg, #fbbf24, #f59e0b)'"
 *     @close="close"
 *   >
 *     <div class="modal-body">...</div>
 *   </BaseModal>
 */
import { computed } from "vue";
import { isDark } from "../composables/theme";

const props = withDefaults(
  defineProps<{
    /** 是否可见 */
    visible: boolean;
    /** 标题文字 */
    title: string;
    /** 标题图标（emoji） */
    icon: string;
    /** 装饰星星 emoji 列表（右上角依次排列） */
    decorEmojis?: string[];
    /** 弹窗宽度（px） */
    width?: number;
    /** 弹窗固定高度（px），不传则自适应内容 */
    height?: number;
    /** 弹窗最大高度（vh 百分比），默认 85 */
    maxHeight?: number;
    /** 圆角大小（px），默认 24 */
    borderRadius?: number;
    /** 标题渐变色（CSS background 值），不传则纯色 */
    titleGradient?: string;
    /** 主题 CSS 变量集合（含 --overlay-bg/--modal-bg/--modal-shadow 等） */
    cssVars?: Record<string, string>;
  }>(),
  {
    decorEmojis: () => [],
    height: undefined,
    maxHeight: 85,
    borderRadius: 24,
    titleGradient: undefined,
    cssVars: () => ({}),
  },
);

const emit = defineEmits<{
  close: [];
}>();

const close = () => emit("close");

// 弹窗容器尺寸（各弹窗不同，由 props 注入）
const modalStyle = computed(() => {
  const style: Record<string, string> = {
    width: `${props.width ?? 400}px`,
    "max-width": "90vw",
    "max-height": `${props.maxHeight}vh`,
    "border-radius": `${props.borderRadius}px`,
  };
  if (props.height) {
    style.height = `${props.height}px`;
  }
  return style;
});

// 标题文字样式（渐变或继承）
const titleStyle = computed(() => {
  if (!props.titleGradient) return {};
  return {
    background: props.titleGradient,
    "-webkit-background-clip": "text",
    "-webkit-text-fill-color": "transparent",
    "background-clip": "text",
  };
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-pop">
      <div
        v-if="visible"
        class="base-modal-overlay"
        :class="{ 'dark-mode': isDark }"
        :style="cssVars"
        @click="close"
      >
        <div class="base-modal" :style="modalStyle" @click.stop>
          <!-- 装饰星星 -->
          <div v-if="decorEmojis.length" class="modal-decor">
            <span
              v-for="(emoji, i) in decorEmojis"
              :key="i"
              class="decor-star"
              :class="`star-${i + 1}`"
              >{{ emoji }}</span
            >
          </div>

          <!-- 标题栏 -->
          <div class="modal-header">
            <div class="header-title">
              <span class="title-icon">{{ icon }}</span>
              <span class="title-text" :style="titleStyle">{{ title }}</span>
            </div>
            <button class="modal-close" @click="close">
              <span>✕</span>
            </button>
          </div>

          <!-- 内容区（默认插槽） -->
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ===== 遮罩层（统一 z-index，替代散落各处的 10000/10001） ===== */
.base-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal, 10001);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--overlay-bg, rgba(0, 0, 0, 0.4));
  backdrop-filter: blur(8px);
  pointer-events: auto !important;
}

/* ===== 弹窗主体 ===== */
.base-modal {
  background: var(--modal-bg, #fff);
  box-shadow: var(--modal-shadow, 0 20px 60px rgba(0, 0, 0, 0.3));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  pointer-events: auto !important;
}

/* ===== 装饰星星（原 5 份逐字重复的 modal-decor/decor-star/twinkle） ===== */
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

.star-4 {
  top: 80px;
  right: 40px;
  animation-delay: 1.5s;
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

/* ===== 标题栏（原 5 份逐字重复） ===== */
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

/* ===== 关闭按钮（原 5 份逐字重复的 modal-close + hover 旋转变红） ===== */
.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--modal-close-bg, rgba(0, 0, 0, 0.05));
  color: var(--modal-close-color, #9ca3af);
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

/* ===== 进出场动画（原 6 份逐字重复的 modal-pop-in/out） ===== */
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
</style>
