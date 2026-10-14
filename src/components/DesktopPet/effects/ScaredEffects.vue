<script setup lang="ts">
// 惊吓效果组件
// 汗滴复用通用 SweatDropSvg
import SweatDropSvg from "./icons/SweatDropSvg.vue";

// 惊叹号与闪电：各两份，只有颜色/delay 差异
const exclaims = [
  { color: "#ef4444", left: "-15px", delay: "0s" },
  { color: "#dc2626", right: "-15px", delay: "0.2s" },
];

const lightnings = [
  { color: "#fbbf24", top: "-30px", left: "-25px", delay: "0s", small: false },
  {
    color: "#fcd34d",
    top: "-35px",
    right: "-22px",
    delay: "0.4s",
    small: true,
  },
];

// 汗滴：位置、颜色和 delay 差异
const sweatDrops = [
  { color: "#60a5fa", top: "-5px", right: "-20px", delay: "0s", small: false },
  { color: "#93c5fd", top: "5px", right: "-28px", delay: "0.4s", small: true },
];

// 震动线条：位置/角度/高度/delay 差异
const shakeLines = [
  { top: "-20px", left: "5px", height: 12, rotation: "-20deg", delay: "0s" },
  { top: "-25px", left: "20px", height: 16, rotation: "15deg", delay: "0.1s" },
  { top: "-18px", right: "5px", height: 12, rotation: "20deg", delay: "0.05s" },
  {
    top: "-22px",
    right: "20px",
    height: 14,
    rotation: "-15deg",
    delay: "0.15s",
  },
];
</script>

<template>
  <div class="scared-effects effect-layer">
    <!-- 惊叹号 -->
    <div
      v-for="(ex, i) in exclaims"
      :key="`ex-${i}`"
      class="exclaim"
      :style="{ left: ex.left, right: ex.right, '--fx-delay': ex.delay }"
    >
      <svg viewBox="0 0 24 24" class="exclaim-svg">
        <path d="M12 2L14 14H10L12 2Z" :fill="ex.color" />
        <circle cx="12" cy="20" r="2" :fill="ex.color" />
      </svg>
    </div>

    <!-- 震动线条 -->
    <div
      v-for="(line, i) in shakeLines"
      :key="`line-${i}`"
      class="shake-line"
      :style="{
        top: line.top,
        left: line.left,
        right: line.right,
        height: line.height + 'px',
        transform: `rotate(${line.rotation})`,
        '--fx-delay': line.delay,
        '--rotation': line.rotation,
      }"
    ></div>

    <!-- 汗滴 -->
    <div
      v-for="(sweat, i) in sweatDrops"
      :key="`sweat-${i}`"
      class="sweat-drop"
      :style="{ top: sweat.top, right: sweat.right, '--fx-delay': sweat.delay }"
    >
      <SweatDropSvg
        :color="sweat.color"
        class="sweat-svg"
        :class="{ small: sweat.small }"
      />
    </div>

    <!-- 闪电 -->
    <div
      v-for="(bolt, i) in lightnings"
      :key="`bolt-${i}`"
      class="lightning"
      :style="{
        top: bolt.top,
        left: bolt.left,
        right: bolt.right,
        '--fx-delay': bolt.delay,
      }"
    >
      <svg
        viewBox="0 0 24 24"
        class="lightning-svg"
        :class="{ small: bolt.small }"
      >
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" :fill="bolt.color" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
@import "./shared.css";

.scared-effects {
  inset: -50px;
}

/* 惊叹号 */
.exclaim {
  position: absolute;
  top: -25px;
  animation: exclaim-pop 0.4s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
}

.exclaim-svg {
  width: 18px;
  height: 28px;
  filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.8));
}

@keyframes exclaim-pop {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  30% {
    transform: translateY(-12px) scale(1.2);
  }
  60% {
    transform: translateY(-6px) scale(1.1);
  }
}

/* 震动线条 */
.shake-line {
  position: absolute;
  width: 3px;
  height: 12px;
  background: linear-gradient(180deg, #ef4444, transparent);
  border-radius: 2px;
  animation: line-shake 0.2s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
}

@keyframes line-shake {
  0%,
  100% {
    opacity: 0.6;
    transform: rotate(var(--rotation, 0deg)) scaleY(1);
  }
  50% {
    opacity: 1;
    transform: rotate(calc(var(--rotation, 0deg) + 10deg)) scaleY(1.3);
  }
}

/* 汗滴 */
.sweat-drop {
  position: absolute;
  animation: sweat-drip 1s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
}

.sweat-svg {
  width: 12px;
  height: 16px;
  filter: drop-shadow(0 1px 2px rgba(96, 165, 250, 0.4));
}

.sweat-svg.small {
  width: 8px;
  height: 12px;
}

@keyframes sweat-drip {
  0% {
    opacity: 0;
    transform: translateY(-5px) scale(0.5);
  }
  30% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(15px) scale(0.8);
  }
}

/* 闪电 */
.lightning {
  position: absolute;
  animation: lightning-flash 0.8s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
}

.lightning-svg {
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.8));
}

.lightning-svg.small {
  width: 12px;
  height: 12px;
}

@keyframes lightning-flash {
  0%,
  40%,
  60%,
  100% {
    opacity: 0;
    transform: scale(0.5);
  }
  45%,
  55% {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>
