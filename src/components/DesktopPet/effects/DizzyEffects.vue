<script setup lang="ts">
// 晕眩效果组件（摔倒时显示）
// 旋转星星与十字眼复用 icons 通用组件，重复模板用 v-for 渲染
import StarSvg from "./icons/StarSvg.vue";
import CrossEyeSvg from "./icons/CrossEyeSvg.vue";

// 旋转的星星：只有颜色/位置/delay 差异
const spinningStars = [
  { color: "#fbbf24", top: "-20px", left: "-30px", delay: "0s", small: false },
  {
    color: "#fcd34d",
    top: "-35px",
    left: "50%",
    delay: "0.5s",
    small: false,
    center: true,
  },
  { color: "#fef3c7", top: "-15px", right: "-25px", delay: "1s", small: true },
];

// 十字眼：左右各一个
const crossEyes = [
  { top: "8px", left: "22px", delay: "0s" },
  { top: "8px", right: "22px", delay: "0.3s" },
];

// 小点点：位置/颜色/尺寸/delay 差异
const dots = [
  { top: "-10px", left: "-5px", delay: "0s", color: "#fcd34d", size: 6 },
  { top: "-8px", right: "-8px", delay: "0.4s", color: "#fbbf24", size: 6 },
  {
    top: "-25px",
    left: "50%",
    centered: true,
    delay: "0.8s",
    color: "#fef3c7",
    size: 4,
  },
];
</script>

<template>
  <div class="dizzy-effects effect-layer">
    <!-- 旋转的星星 -->
    <div
      v-for="(star, i) in spinningStars"
      :key="`star-${i}`"
      class="spinning-star"
      :class="{ centered: star.center }"
      :style="{
        top: star.top,
        left: star.left,
        right: star.right,
        '--fx-delay': star.delay,
      }"
    >
      <StarSvg
        :color="star.color"
        class="star-svg"
        :class="{ small: star.small }"
      />
    </div>

    <!-- 螺旋圈 -->
    <div class="spiral spiral-1"></div>
    <div class="spiral spiral-2"></div>

    <!-- 小点点 -->
    <div
      v-for="(dot, i) in dots"
      :key="`dot-${i}`"
      class="dot"
      :class="{ centered: dot.centered }"
      :style="{
        top: dot.top,
        left: dot.left,
        right: dot.right,
        width: dot.size + 'px',
        height: dot.size + 'px',
        background: dot.color,
        '--fx-delay': dot.delay,
      }"
    ></div>

    <!-- 十字眼特效 -->
    <div
      v-for="(eye, i) in crossEyes"
      :key="`eye-${i}`"
      class="cross-eye"
      :style="{
        top: eye.top,
        left: eye.left,
        right: eye.right,
        '--fx-delay': eye.delay,
      }"
    >
      <CrossEyeSvg class="cross-svg" />
    </div>
  </div>
</template>

<style scoped>
@import "./shared.css";

.dizzy-effects {
  inset: -50px;
}

/* 旋转的星星 */
.spinning-star {
  position: absolute;
  opacity: 0;
  animation: star-spin 1.5s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
}

.spinning-star.centered {
  transform: translateX(-50%);
}

.star-svg {
  width: 22px;
  height: 22px;
  filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.6));
  animation: star-twinkle 0.8s ease-in-out infinite alternate;
}

.star-svg.small {
  width: 14px;
  height: 14px;
}

@keyframes star-spin {
  0% {
    opacity: 0;
    transform: rotate(0deg) scale(0.5);
  }
  30% {
    opacity: 1;
    transform: rotate(180deg) scale(1.1);
  }
  60% {
    opacity: 0.8;
    transform: rotate(360deg) scale(0.9);
  }
  100% {
    opacity: 0;
    transform: rotate(540deg) scale(0.5);
  }
}

@keyframes star-twinkle {
  from {
    filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.6));
  }
  to {
    filter: drop-shadow(0 0 10px rgba(251, 191, 36, 1));
  }
}

/* 螺旋圈 */
.spiral {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: rgba(251, 191, 36, 0.6);
  border-right-color: rgba(252, 211, 77, 0.4);
  animation: spiral-spin 2s linear infinite;
}

.spiral-1 {
  width: 35px;
  height: 35px;
  top: -25px;
  left: -20px;
  animation-delay: 0s;
}

.spiral-2 {
  width: 28px;
  height: 28px;
  top: -18px;
  right: -15px;
  animation-delay: 0.5s;
  animation-direction: reverse;
}

@keyframes spiral-spin {
  from {
    transform: rotate(0deg);
    opacity: 0.7;
  }
  to {
    transform: rotate(360deg);
    opacity: 0.3;
  }
}

/* 小点点 */
.dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fcd34d;
  animation: dot-float 1.2s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
}

.dot.centered {
  transform: translateX(-50%);
}

@keyframes dot-float {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  30% {
    opacity: 1;
    transform: translateY(-8px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.8);
  }
}

/* 十字眼特效 */
.cross-eye {
  position: absolute;
  opacity: 0;
  animation: cross-pop 2s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
}

.cross-svg {
  width: 16px;
  height: 16px;
}

@keyframes cross-pop {
  0%,
  80% {
    opacity: 0;
    transform: scale(0.5);
  }
  85%,
  95% {
    opacity: 0.9;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.5);
  }
}
</style>
