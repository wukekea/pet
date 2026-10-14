<script setup lang="ts">
// 生气效果组件 - 日式动漫夸张风格
// 火焰与锯齿各两份，只有颜色/delay 差异，用 v-for 渲染

// 红色火焰粒子：颜色/位置/delay 差异
const flames = [
  { color: "#ef4444", top: "-18px", left: "-12px", delay: "0s", small: false },
  {
    color: "#f87171",
    top: "-22px",
    right: "-10px",
    delay: "0.5s",
    small: true,
  },
];

// 锯齿状怒气：颜色/位置/delay 差异
const zigzags = [
  { color: "#7f1d1d", top: "-12px", left: "8px", delay: "0s", small: false },
  { color: "#dc2626", top: "-15px", right: "6px", delay: "0.2s", small: true },
];
</script>

<template>
  <div class="angry-effects effect-layer">
    <!-- 额头青筋符号 -->
    <div class="vein-symbol">
      <svg viewBox="0 0 24 24" class="vein-svg">
        <path
          d="M12 2L9 9H2L7.5 13.5L5.5 21L12 16.5L18.5 21L16.5 13.5L22 9H15L12 2Z"
          fill="none"
          stroke="#7f1d1d"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <!-- 愤怒烟尘 -->
    <div class="smoke smoke-1"></div>
    <div class="smoke smoke-2"></div>
    <div class="smoke smoke-3"></div>

    <!-- 红色火焰粒子 -->
    <div
      v-for="(flame, i) in flames"
      :key="`flame-${i}`"
      class="flame"
      :style="{
        top: flame.top,
        left: flame.left,
        right: flame.right,
        '--fx-delay': flame.delay,
      }"
    >
      <svg
        viewBox="0 0 24 24"
        class="flame-svg"
        :class="{ small: flame.small }"
      >
        <path
          d="M12 2C12 2 6 7 6 12C6 15.3 8.7 18 12 18C15.3 18 18 15.3 18 12C18 7 12 2 12 2Z"
          :fill="flame.color"
        />
      </svg>
    </div>

    <!-- 锯齿状怒气 -->
    <div
      v-for="(zig, i) in zigzags"
      :key="`zig-${i}`"
      class="zigzag"
      :style="{
        top: zig.top,
        left: zig.left,
        right: zig.right,
        '--fx-delay': zig.delay,
      }"
    >
      <svg viewBox="0 0 20 20" class="zigzag-svg" :class="{ small: zig.small }">
        <path d="M10 0L0 10L10 20L20 10L10 0Z" :fill="zig.color" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
@import "./shared.css";

.angry-effects {
  inset: -30px;
}

/* 额头青筋符号 */
.vein-symbol {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  animation: vein-pulse 0.6s ease-in-out infinite;
}

.vein-svg {
  width: 20px;
  height: 20px;
  filter: drop-shadow(0 0 3px rgba(127, 29, 29, 0.8));
}

@keyframes vein-pulse {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%) scale(1.2);
    opacity: 0.8;
  }
}

/* 愤怒烟尘 */
.smoke {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.6),
    rgba(127, 29, 29, 0.3)
  );
  animation: smoke-rise 1.2s ease-out infinite;
}

.smoke-1 {
  width: 12px;
  height: 12px;
  top: -15px;
  left: -8px;
  animation-delay: 0s;
}

.smoke-2 {
  width: 10px;
  height: 10px;
  top: -20px;
  right: -5px;
  animation-delay: 0.4s;
}

.smoke-3 {
  width: 8px;
  height: 8px;
  top: -10px;
  left: 5px;
  animation-delay: 0.8s;
}

@keyframes smoke-rise {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  20% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(1.5);
  }
}

/* 红色火焰粒子 */
.flame {
  position: absolute;
  animation: flame-float 1s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
}

.flame-svg {
  width: 14px;
  height: 14px;
  filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.8));
  animation: flame-flicker 0.3s ease-in-out infinite alternate;
}

.flame-svg.small {
  width: 10px;
  height: 10px;
}

@keyframes flame-float {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.8);
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-15px) scale(1.2);
  }
}

@keyframes flame-flicker {
  from {
    filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.8));
    transform: scale(1);
  }
  to {
    filter: drop-shadow(0 0 6px rgba(239, 68, 68, 1));
    transform: scale(1.1);
  }
}

/* 锯齿状怒气 */
.zigzag {
  position: absolute;
  animation: zigzag-shake 0.4s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
}

.zigzag-svg {
  width: 12px;
  height: 12px;
  filter: drop-shadow(0 0 3px rgba(127, 29, 29, 0.6));
}

.zigzag-svg.small {
  width: 8px;
  height: 8px;
}

@keyframes zigzag-shake {
  0%,
  100% {
    transform: rotate(0deg) translateY(0);
  }
  25% {
    transform: rotate(-15deg) translateY(-3px);
  }
  75% {
    transform: rotate(15deg) translateY(-3px);
  }
}
</style>
