<script setup lang="ts">
// 搬砖效果组件 - 体力劳动动画
// 砖头 SVG 与音符复用 icons 通用组件，重复模板用 v-for 渲染
import BrickSvg from "./icons/BrickSvg.vue";
import SmallBrickSvg from "./icons/SmallBrickSvg.vue";
import SweatDropSvg from "./icons/SweatDropSvg.vue";
import NoteSvg from "./icons/NoteSvg.vue";

// 头顶搬运的三块砖：只有 delay 和 margin 差异
const stackBricks = [{ delay: "0s" }, { delay: "0.2s" }, { delay: "0.4s" }].map(
  (b) => ({ "--fx-delay": b.delay }),
);

// 左侧杂乱砖堆：只有旋转和位移差异
const messyBricks = [
  { "--fx-transform": "rotate(-15deg) translateX(-5px)" },
  { "--fx-transform": "rotate(8deg) translateX(3px)" },
  { "--fx-transform": "rotate(-5deg) translateX(-2px)" },
  { "--fx-transform": "rotate(12deg) translateX(4px)" },
  { "--fx-transform": "rotate(-8deg) translateX(-3px)" },
];

// 右侧整齐砖堆：只有 delay 差异（0.1s 步进）
const neatBricks = Array.from({ length: 5 }, (_, i) => ({
  "--fx-delay": `${(i + 1) * 0.1}s`,
}));

// 汗珠：位置和 delay 差异
const sweatDrops = [
  { top: "-15px", left: "-8px", "--fx-delay": "0s" },
  { top: "-10px", right: "-5px", "--fx-delay": "0.7s" },
  { top: "20px", left: "5px", "--fx-delay": "1.4s" },
];

// 努力音符：位置和 delay 差异
const effortNotes = [
  {
    top: "-20px",
    right: "-15px",
    "--fx-delay": "0.3s",
    "--note-color": "#FF6B6B",
  },
  {
    top: "5px",
    left: "-12px",
    "--fx-delay": "0.9s",
    "--note-color": "#FF8E8E",
  },
];
</script>

<template>
  <div class="brick-carrying-effects">
    <!-- 搬运的砖头堆 -->
    <div class="brick-stack">
      <div
        v-for="(brick, i) in stackBricks"
        :key="i"
        class="brick"
        :style="brick"
      >
        <BrickSvg />
      </div>
    </div>

    <!-- 汗珠效果 -->
    <div
      v-for="(sweat, i) in sweatDrops"
      :key="i"
      class="sweat-drop"
      :style="sweat"
    >
      <SweatDropSvg
        color="#87CEEB"
        class="sweat-svg"
        :class="{ small: i > 0 }"
      />
    </div>

    <!-- 力量符号 -->
    <div class="power-symbol">
      <svg viewBox="0 0 32 32" class="power-svg">
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke="#FF6B35"
          stroke-width="3"
        />
        <path
          d="M16 4 L16 14 M16 18 L16 28 M10 10 L13 13 M19 13 L22 10 M10 22 L13 19 M19 19 L22 22"
          stroke="#FF6B35"
          stroke-width="3"
          stroke-linecap="round"
        />
        <circle cx="16" cy="16" r="4" fill="#FF6B35" />
      </svg>
    </div>

    <!-- 劳动工具图标 -->
    <div class="tool-icon hammer">
      <svg viewBox="0 0 32 32" class="tool-svg">
        <!-- 锤头 -->
        <rect x="4" y="8" width="18" height="10" rx="2" fill="#4A4A4A" />
        <rect x="6" y="10" width="14" height="6" rx="1" fill="#6A6A6A" />
        <!-- 锤柄 -->
        <rect x="12" y="16" width="4" height="14" rx="1" fill="#DEB887" />
        <rect
          x="13"
          y="17"
          width="2"
          height="12"
          fill="#D2B48C"
          opacity="0.5"
        />
      </svg>
    </div>

    <!-- 体力条 -->
    <div class="stamina-bar">
      <div class="stamina-background">
        <div class="stamina-fill"></div>
      </div>
      <div class="stamina-sparkles">
        <span class="sparkle">⚡</span>
        <span class="sparkle">⚡</span>
        <span class="sparkle">⚡</span>
      </div>
    </div>

    <!-- 努力音符 -->
    <div
      v-for="(note, i) in effortNotes"
      :key="i"
      class="effort-note"
      :style="note"
    >
      <NoteSvg :color="note['--note-color']" class="note-svg" />
    </div>

    <!-- 左边杂乱的砖堆 -->
    <div class="messy-bricks-left">
      <div
        v-for="(brick, i) in messyBricks"
        :key="i"
        class="messy-brick"
        :style="brick"
      >
        <SmallBrickSvg />
      </div>
    </div>

    <!-- 右边整齐的砖堆 -->
    <div class="neat-bricks-right">
      <div
        v-for="(brick, i) in neatBricks"
        :key="i"
        class="neat-brick"
        :style="brick"
      >
        <SmallBrickSvg />
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "./shared.css";

.brick-carrying-effects {
  position: absolute;
  inset: -40px;
  pointer-events: none;
  overflow: visible;
}

/* 砖头堆 */
.brick-stack {
  position: absolute;
  top: 65px;
  left: 47%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  animation: carry-bounce 1s ease-in-out infinite;
}

.brick {
  position: relative;
  animation: brick-wobble 0.8s ease-in-out infinite alternate;
  animation-delay: var(--fx-delay, 0s);
}

/* 前两块砖之间的叠压间距 */
.brick + .brick {
  margin-top: -8px;
}

.brick:nth-child(1) {
  z-index: 3;
}

.brick:nth-child(2) {
  z-index: 2;
}

.brick:nth-child(3) {
  z-index: 1;
}

.brick :deep(.brick-svg) {
  width: 32px;
  height: 16px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
}

@keyframes carry-bounce {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-5px);
  }
}

@keyframes brick-wobble {
  0% {
    transform: rotate(-2deg);
  }
  100% {
    transform: rotate(2deg);
  }
}

/* 汗珠 */
.sweat-drop {
  position: absolute;
  animation: sweat-fall 2s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
  opacity: 0;
}

.sweat-svg {
  width: 14px;
  height: 20px;
  filter: drop-shadow(0 2px 2px rgba(135, 206, 235, 0.5));
}

.sweat-svg.small {
  width: 10px;
  height: 14px;
}

@keyframes sweat-fall {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translateY(-3px) scale(1);
  }
  80% {
    opacity: 1;
    transform: translateY(15px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(25px) scale(0.7);
  }
}

/* 力量符号 */
.power-symbol {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  animation: power-pulse 2s ease-in-out infinite;
}

.power-svg {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 0 6px rgba(255, 107, 53, 0.6));
}

@keyframes power-pulse {
  0%,
  70% {
    opacity: 0;
    transform: translateX(-50%) scale(0.5);
  }
  75%,
  90% {
    opacity: 1;
    transform: translateX(-50%) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) scale(0.8);
  }
}

/* 劳动工具 */
.tool-icon {
  position: absolute;
  opacity: 0;
  animation: tool-float 2.5s ease-in-out infinite;
}

.hammer {
  top: 10px;
  right: -20px;
  animation-delay: 1s;
}

.tool-svg {
  width: 20px;
  height: 20px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

@keyframes tool-float {
  0%,
  60% {
    opacity: 0;
    transform: translateY(0) rotate(0deg);
  }
  65%,
  85% {
    opacity: 0.8;
    transform: translateY(-8px) rotate(15deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-15px) rotate(30deg);
  }
}

/* 体力条 */
.stamina-bar {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stamina-background {
  width: 50px;
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stamina-fill {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #ff6b35, #ff8e53);
  border-radius: 4px;
  animation: stamina-drain 1.5s ease-in-out infinite;
}

@keyframes stamina-drain {
  0% {
    width: 100%;
    background: linear-gradient(90deg, #ff6b35, #ff8e53);
  }
  50% {
    width: 60%;
    background: linear-gradient(90deg, #ff8e53, #ffaa77);
  }
  100% {
    width: 100%;
    background: linear-gradient(90deg, #ff6b35, #ff8e53);
  }
}

.stamina-sparkles {
  display: flex;
  gap: 3px;
  animation: sparkle-flicker 0.8s ease-in-out infinite alternate;
}

.sparkle {
  font-size: 8px;
  animation: sparkle-pop 1s ease-in-out infinite;
}

.sparkle:nth-child(2) {
  animation-delay: 0.2s;
}

.sparkle:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes sparkle-flicker {
  0% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

@keyframes sparkle-pop {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
}

/* 努力音符 */
.effort-note {
  position: absolute;
  opacity: 0;
  animation: note-float 2s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
}

.note-svg {
  width: 14px;
  height: 14px;
  filter: drop-shadow(0 0 4px rgba(255, 107, 107, 0.5));
}

@keyframes note-float {
  0%,
  60% {
    opacity: 0;
    transform: translateY(0) rotate(-10deg) scale(0.8);
  }
  65%,
  85% {
    opacity: 1;
    transform: translateY(-10px) rotate(5deg) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) rotate(15deg) scale(0.9);
  }
}

/* 左边杂乱的砖堆 */
.messy-bricks-left {
  position: absolute;
  top: 40px;
  left: -35px;
  display: flex;
  flex-direction: column;
  gap: -6px;
  animation: bricks-appear-left 2s ease-out forwards;
}

.messy-brick {
  position: relative;
  transform: var(--fx-transform);
}

.messy-brick :deep(.small-brick-svg) {
  width: 28px;
  height: 12px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
}

/* 右边整齐的砖堆 */
.neat-bricks-right {
  position: absolute;
  top: 40px;
  right: -35px;
  display: flex;
  flex-direction: column;
  animation: bricks-appear-right 2s ease-out forwards;
}

.neat-brick {
  position: relative;
  animation: bricks-appear-right 2s ease-out forwards;
  animation-delay: var(--fx-delay, 0s);
}

.neat-brick :deep(.small-brick-svg) {
  width: 28px;
  height: 12px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
}

@keyframes bricks-appear-left {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bricks-appear-right {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
