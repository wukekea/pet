<script setup lang="ts">
// 疑惑效果组件
// 问号/星星复制差异用配置数组 + v-for 渲染
import FxIcon from "./icons/FxIcon.vue";
import QuestionSvg from "./icons/QuestionSvg.vue";

// 问号：颜色/位置/尺寸/delay 差异
const questions = [
  { color: "#60a5fa", top: "-30px", left: "-10px", delay: "0s", size: "" },
  {
    color: "#93c5fd",
    top: "-40px",
    left: "15px",
    delay: "0.5s",
    size: "small",
  },
  { color: "#bfdbfe", top: "-25px", right: "-15px", delay: "1s", size: "tiny" },
];

// 小星星：颜色/位置/尺寸差异
const stars = [
  { color: "#cbd5e1", top: "-25px", left: "5px", delay: "0.3s", size: "" },
  {
    color: "#e2e8f0",
    top: "-18px",
    right: "5px",
    delay: "1s",
    size: "small",
  },
];

// 波浪线：位置/配色/delay 差异
const wiggles = [
  {
    top: "-15px",
    left: "-20px",
    background:
      "linear-gradient(90deg, transparent, #93c5fd 40%, transparent 70%)",
    delay: "0s",
  },
  {
    top: "-10px",
    right: "-18px",
    background:
      "linear-gradient(90deg, transparent, #bfdbfe 40%, transparent 70%)",
    delay: "0.7s",
  },
];
</script>

<template>
  <div class="confused-effects effect-layer">
    <!-- 问号 -->
    <div
      v-for="(q, i) in questions"
      :key="`q-${i}`"
      class="question"
      :style="{
        top: q.top,
        left: q.left,
        right: q.right,
        '--fx-delay': q.delay,
      }"
    >
      <QuestionSvg :color="q.color" class="question-svg" :class="q.size" />
    </div>

    <!-- 旋转的螺旋 -->
    <div class="spiral spiral-1"></div>
    <div class="spiral spiral-2"></div>

    <!-- 感叹号和问号组合 -->
    <div class="combo">
      <svg viewBox="0 0 24 32" class="combo-svg">
        <!-- 问号 -->
        <text
          x="6"
          y="18"
          text-anchor="middle"
          font-size="14"
          font-weight="bold"
          fill="#60a5fa"
        >
          ?
        </text>
        <!-- 感叹号 -->
        <text
          x="18"
          y="18"
          text-anchor="middle"
          font-size="14"
          font-weight="bold"
          fill="#f59e0b"
        >
          !
        </text>
      </svg>
    </div>

    <!-- 曲线箭头 -->
    <div class="curved-arrow">
      <svg viewBox="0 0 32 24" class="arrow-svg">
        <path
          d="M2 12 Q16 2 24 12"
          stroke="#94a3b8"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
        />
        <path
          d="M20 8 L24 12 L20 16"
          stroke="#94a3b8"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <!-- 小星星 -->
    <div
      v-for="(star, i) in stars"
      :key="`star-${i}`"
      class="star"
      :style="{
        top: star.top,
        left: star.left,
        right: star.right,
        '--fx-delay': star.delay,
      }"
    >
      <FxIcon
        name="star"
        :color="star.color"
        class="star-svg"
        :class="star.size"
      />
    </div>

    <!-- 波浪线 -->
    <div
      v-for="(wiggle, i) in wiggles"
      :key="`wiggle-${i}`"
      class="wiggle"
      :style="{
        top: wiggle.top,
        left: wiggle.left,
        right: wiggle.right,
        background: wiggle.background,
        '--fx-delay': wiggle.delay,
      }"
    ></div>
  </div>
</template>

<style scoped>
@import "./shared.css";

.confused-effects {
  inset: -45px;
}

/* 问号 */
.question {
  position: absolute;
  opacity: 0;
  animation: question-float 2.5s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
}

.question-svg {
  width: 20px;
  height: 24px;
  filter: drop-shadow(0 0 4px rgba(96, 165, 250, 0.5));
}

.question-svg.small {
  width: 16px;
  height: 20px;
}

.question-svg.tiny {
  width: 12px;
  height: 16px;
}

@keyframes question-float {
  0% {
    opacity: 0;
    transform: translateY(5px) rotate(-10deg);
  }
  30% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-15px) rotate(10deg);
  }
}

/* 旋转的螺旋 */
.spiral {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #93c5fd;
  border-right-color: #bfdbfe;
  animation: spiral-spin 1.5s linear infinite;
}

.spiral-1 {
  width: 24px;
  height: 24px;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
}

.spiral-2 {
  width: 16px;
  height: 16px;
  top: -20px;
  right: -20px;
  animation-direction: reverse;
  animation-delay: 0.5s;
}

@keyframes spiral-spin {
  from {
    transform: translateX(-50%) rotate(0deg);
    opacity: 0.6;
  }
  to {
    transform: translateX(-50%) rotate(360deg);
    opacity: 0.3;
  }
}

.spiral-2 {
  animation-name: spiral-spin-2;
}

@keyframes spiral-spin-2 {
  from {
    transform: rotate(0deg);
    opacity: 0.6;
  }
  to {
    transform: rotate(-360deg);
    opacity: 0.3;
  }
}

/* 感叹号和问号组合 */
.combo {
  position: absolute;
  top: -45px;
  left: -30px;
  opacity: 0;
  animation: combo-pop 3s ease-in-out infinite;
}

.combo-svg {
  width: 24px;
  height: 32px;
  filter: drop-shadow(0 0 3px rgba(96, 165, 250, 0.4));
}

@keyframes combo-pop {
  0%,
  40% {
    opacity: 0;
    transform: scale(0.8);
  }
  50%,
  85% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}

/* 曲线箭头 */
.curved-arrow {
  position: absolute;
  top: -30px;
  right: -25px;
  opacity: 0;
  animation: arrow-appear 2.5s ease-in-out infinite;
}

.arrow-svg {
  width: 28px;
  height: 20px;
}

@keyframes arrow-appear {
  0%,
  60% {
    opacity: 0;
    transform: translateX(5px);
  }
  70%,
  90% {
    opacity: 0.8;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-5px);
  }
}

/* 小星星 */
.star {
  position: absolute;
  opacity: 0;
  animation: fx-twinkle 2s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
  /* 与原 star-twinkle 关键帧的显示幅度保持一致 */
  --fx-show-opacity: 0.7;
  --fx-show-scale: 1;
}

.star-svg {
  width: 12px;
  height: 12px;
}

.star-svg.small {
  width: 8px;
  height: 8px;
}

/* 波浪线 */
.wiggle {
  position: absolute;
  width: 15px;
  height: 3px;
  border-radius: 2px;
  opacity: 0;
  animation: wiggle-wave 1.5s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
}

@keyframes wiggle-wave {
  0%,
  80% {
    opacity: 0;
    transform: scaleX(0.5);
  }
  90%,
  95% {
    opacity: 0.6;
    transform: scaleX(1);
  }
  100% {
    opacity: 0;
    transform: scaleX(0.8);
  }
}
</style>
