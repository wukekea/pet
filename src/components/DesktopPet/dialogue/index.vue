<script setup lang="ts">
import { computed } from "vue";
import { dialogueText, isDialogueVisible } from "../composables/dialogue";
import { isDark } from "../composables/theme";

// 样式变体类型
export type DialogueVariant = "default" | "cloud";

const props = withDefaults(
  defineProps<{
    variant?: DialogueVariant;
    x: number;
    y: number;
    direction?: "left" | "right" | "front" | "back";
  }>(),
  {
    variant: "default",
    direction: "right",
  },
);

// 是否为云朵样式
const isCloud = computed(() => props.variant === "cloud");

// 计算气泡位置
const bubbleStyle = computed(() => {
  const offsetX = isCloud.value ? props.x + 30 : props.x + 40;
  const offsetY = isCloud.value ? props.y - 70 : props.y - 55;
  return {
    left: `${offsetX}px`,
    top: `${offsetY}px`,
  };
});

// 动态颜色
const bubbleBg = computed(() =>
  isDark.value ? "rgba(30, 30, 40, 0.95)" : "rgba(255, 255, 255, 0.95)",
);
const bubbleShadow = computed(() =>
  isDark.value
    ? "0 4px 15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)"
    : "0 4px 15px rgba(139, 92, 246, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.1)",
);
const gradientStart = computed(() =>
  isDark.value ? "rgba(167, 139, 250, 0.3)" : "rgba(139, 92, 246, 0.2)",
);
const gradientEnd = computed(() =>
  isDark.value ? "rgba(244, 114, 182, 0.3)" : "rgba(253, 164, 175, 0.2)",
);
const textColor = computed(() => (isDark.value ? "#e2e8f0" : "#374151"));
const textShadow = computed(() =>
  isDark.value
    ? "0 1px 2px rgba(0, 0, 0, 0.3)"
    : "0 1px 2px rgba(255, 255, 255, 0.5)",
);
const cloudTextColor = computed(() => (isDark.value ? "#c7d2fe" : "#6366f1"));
const cloudTextShadow = computed(() =>
  isDark.value
    ? "0 1px 3px rgba(0, 0, 0, 0.3)"
    : "0 1px 3px rgba(255, 255, 255, 0.9)",
);
</script>

<template>
  <div
    v-show="dialogueText"
    class="dialogue-bubble"
    :class="{
      'dialogue-visible': isDialogueVisible,
      'dialogue-left': direction === 'left',
      'dialogue-cloud': isCloud,
    }"
    :style="bubbleStyle"
  >
    <!-- 云朵样式气泡 -->
    <svg
      v-if="isCloud"
      class="cloud-bubble"
      :class="{ 'dark-theme': isDark }"
      viewBox="0 0 120 42"
    >
      <g class="cloud-group">
        <!-- 底部由多个小椭圆组成 -->
        <ellipse cx="25" cy="32" rx="20" ry="10" class="cloud-part" />
        <ellipse cx="55" cy="34" rx="22" ry="9" class="cloud-part" />
        <ellipse cx="85" cy="32" rx="18" ry="10" class="cloud-part" />
        <!-- 中间椭圆 -->
        <ellipse cx="35" cy="22" rx="26" ry="14" class="cloud-part" />
        <ellipse cx="75" cy="20" rx="24" ry="13" class="cloud-part" />
        <!-- 顶部小椭圆 -->
        <ellipse cx="50" cy="12" rx="16" ry="10" class="cloud-part" />
        <ellipse cx="72" cy="10" rx="14" ry="9" class="cloud-part" />
      </g>
    </svg>
    <!-- 云朵尾巴（三个小气泡） -->
    <svg
      v-if="isCloud"
      class="cloud-tail"
      :class="{ 'dark-theme': isDark }"
      viewBox="0 0 20 25"
    >
      <g class="tail-group">
        <!-- 最上面的气泡（最大，靠近云朵） -->
        <ellipse cx="6" cy="5" rx="5" ry="4" class="tail-part" />
        <!-- 中间的气泡 -->
        <ellipse cx="10" cy="13" rx="4" ry="3.5" class="tail-part" />
        <!-- 最下面的气泡（最小） -->
        <ellipse cx="14" cy="20" rx="3" ry="2.5" class="tail-part" />
      </g>
    </svg>
    <span class="dialogue-text">{{ dialogueText }}</span>
    <!-- 普通气泡尾巴 -->
    <div v-if="!isCloud" class="dialogue-tail"></div>
  </div>
</template>

<style scoped>
/* ========================================
   对话气泡基础样式
   ======================================== */
.dialogue-bubble {
  position: fixed;
  transform: translateX(-50%);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 8px 14px;
  pointer-events: none;
  opacity: 0;
  transform: translateX(-50%) translateY(5px) scale(0.9);
  transition:
    opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 100;
  white-space: nowrap;
  background: v-bind("bubbleBg");
  box-shadow: v-bind("bubbleShadow");
}

.dialogue-bubble::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 18px;
  z-index: -1;
  opacity: 0.5;
  background: linear-gradient(
    135deg,
    v-bind("gradientStart"),
    v-bind("gradientEnd")
  );
}

.dialogue-bubble.dialogue-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}

.dialogue-bubble.dialogue-left {
  transform: translateX(-30%) translateY(5px) scale(0.9);
}

.dialogue-bubble.dialogue-left.dialogue-visible {
  transform: translateX(-30%) translateY(0) scale(1);
}

.dialogue-text {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
  color: v-bind("textColor");
  text-shadow: v-bind("textShadow");
}

.dialogue-tail {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 8px;
  background: v-bind("bubbleBg");
  clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
}

.dialogue-bubble.dialogue-left .dialogue-tail {
  left: 65%;
}

/* ========================================
   云朵对话气泡样式
   ======================================== */
.dialogue-bubble.dialogue-cloud {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0;
  width: 120px;
  height: 42px;
  position: relative;
  backdrop-filter: none !important;
  border-radius: 0 !important;
}

.dialogue-bubble.dialogue-cloud::before {
  display: none !important;
  content: none !important;
}

/* 云朵 SVG */
.cloud-bubble {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.cloud-bubble .cloud-group {
  opacity: 0.9;
}

.cloud-bubble .cloud-part {
  fill: white;
}

.cloud-bubble.dark-theme .cloud-part {
  fill: #8b5cf6;
}

/* 云朵文字 - 居中显示在云朵内部 */
.dialogue-bubble.dialogue-cloud .dialogue-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  color: v-bind("cloudTextColor");
  font-weight: 500;
  text-shadow: v-bind("cloudTextShadow");
  white-space: nowrap;
}

/* 云朵尾巴 SVG */
.cloud-tail {
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 25px;
  pointer-events: none;
}

.dialogue-bubble.dialogue-cloud.dialogue-left .cloud-tail {
  left: 60%;
}

.cloud-tail .tail-group {
  opacity: 0.9;
}

.cloud-tail .tail-part {
  fill: white;
}

.cloud-tail.dark-theme .tail-part {
  fill: #8b5cf6;
}

/* 云朵气泡隐藏普通尾巴 */
.dialogue-bubble.dialogue-cloud .dialogue-tail {
  display: none;
}

/* 云朵浮动动画 */
@keyframes cloud-float {
  0%,
  100% {
    transform: translateX(-50%) translateY(0) scale(1);
  }
  50% {
    transform: translateX(-50%) translateY(-3px) scale(1.02);
  }
}

.dialogue-bubble.dialogue-cloud.dialogue-visible {
  animation:
    cloud-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
    cloud-float 3s ease-in-out infinite 0.5s;
}

@keyframes cloud-appear {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(10px) scale(0.8);
  }
  50% {
    transform: translateX(-50%) translateY(-5px) scale(1.05);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}
</style>
