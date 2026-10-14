<script setup lang="ts">
// 害羞效果组件
// 爱心复用 HeartSvg，腮红/小花/闪烁星重复模板用 v-for 渲染
import HeartSvg from "./icons/HeartSvg.vue";

// 腮红：左右各一份
const blushes = [
  { left: "8px", delay: "0s" },
  { right: "8px", delay: "0.3s" },
];

// 小爱心：三个颜色/位置/delay 差异
const hearts = [
  { color: "#ff6b9d", top: "-25px", left: "-15px", delay: "0s", size: "" },
  {
    color: "#fda4af",
    top: "-35px",
    right: "-10px",
    delay: "0.8s",
    size: "small",
  },
  {
    color: "#fecdd3",
    top: "-15px",
    right: "-25px",
    delay: "1.6s",
    size: "tiny",
  },
];

// 小花：两个配色/位置差异（petalColor 避免与花心 center 布尔冲突）
const flowers = [
  {
    petalColor: "#f9a8d4",
    centerColor: "#fcd34d",
    top: "-40px",
    left: "50%",
    delay: "0.5s",
    centered: true,
    size: "",
  },
  {
    petalColor: "#fbcfe8",
    centerColor: "#fef08a",
    top: "-20px",
    left: "-30px",
    delay: "1.8s",
    centered: false,
    size: "small",
  },
];

// 闪烁小点：两个颜色/位置差异
const twinkles = [
  { color: "#fecdd3", top: "-45px", left: "5px", delay: "0.3s", size: "" },
  { color: "#fda4af", top: "-38px", right: "0", delay: "1.2s", size: "small" },
];
</script>

<template>
  <div class="shy-effects effect-layer">
    <!-- 粉红色腮红 -->
    <div
      v-for="(blush, i) in blushes"
      :key="`blush-${i}`"
      class="blush"
      :style="{
        left: blush.left,
        right: blush.right,
        '--fx-delay': blush.delay,
      }"
    >
      <svg viewBox="0 0 20 12" class="blush-svg">
        <ellipse cx="10" cy="6" rx="9" ry="5" fill="#fecdd3" />
        <ellipse cx="10" cy="6" rx="6" ry="3" fill="#fda4af" />
      </svg>
    </div>

    <!-- 小爱心 -->
    <div
      v-for="(heart, i) in hearts"
      :key="`heart-${i}`"
      class="heart"
      :style="{
        top: heart.top,
        left: heart.left,
        right: heart.right,
        '--fx-delay': heart.delay,
      }"
    >
      <HeartSvg :color="heart.color" class="heart-svg" :class="heart.size" />
    </div>

    <!-- 小花 -->
    <div
      v-for="(flower, i) in flowers"
      :key="`flower-${i}`"
      class="flower"
      :class="{ centered: flower.centered }"
      :style="{
        top: flower.top,
        left: flower.left,
        '--fx-delay': flower.delay,
      }"
    >
      <svg viewBox="0 0 24 24" class="flower-svg" :class="flower.size">
        <circle cx="12" cy="8" r="4" :fill="flower.petalColor" />
        <circle cx="8" cy="12" r="4" :fill="flower.petalColor" />
        <circle cx="16" cy="12" r="4" :fill="flower.petalColor" />
        <circle cx="10" cy="16" r="4" :fill="flower.petalColor" />
        <circle cx="14" cy="16" r="4" :fill="flower.petalColor" />
        <circle cx="12" cy="12" r="3" :fill="flower.centerColor" />
      </svg>
    </div>

    <!-- 波浪线 -->
    <div class="wave wave-1"></div>
    <div class="wave wave-2"></div>
    <div class="wave wave-3"></div>

    <!-- 闪烁小点 -->
    <div
      v-for="(tw, i) in twinkles"
      :key="`tw-${i}`"
      class="twinkle"
      :style="{
        top: tw.top,
        left: tw.left,
        right: tw.right,
        '--fx-delay': tw.delay,
      }"
    >
      <svg viewBox="0 0 24 24" class="twinkle-svg" :class="tw.size">
        <path
          d="M12 2L14 10H22L16 15L18 23L12 18L6 23L8 15L2 10H10L12 2Z"
          :fill="tw.color"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
@import "./shared.css";

.shy-effects {
  inset: -40px;
}

/* 粉红色腮红 */
.blush {
  position: absolute;
  top: 42px;
  opacity: 0;
  animation: blush-appear 2s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
}

.blush-svg {
  width: 16px;
  height: 10px;
  filter: blur(1px);
}

@keyframes blush-appear {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.2);
  }
}

/* 小爱心 */
.heart {
  position: absolute;
  opacity: 0;
  animation: heart-float 2.5s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
}

.heart-svg {
  width: 14px;
  height: 14px;
  filter: drop-shadow(0 0 3px rgba(255, 107, 157, 0.6));
}

.heart-svg.small {
  width: 10px;
  height: 10px;
}

.heart-svg.tiny {
  width: 8px;
  height: 8px;
}

@keyframes heart-float {
  0% {
    opacity: 0;
    transform: translateY(5px) scale(0.5);
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(1);
  }
}

/* 小花 */
.flower {
  position: absolute;
  opacity: 0;
  animation: flower-bloom 3s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
}

.flower.centered {
  transform: translateX(-50%);
}

.flower-svg {
  width: 16px;
  height: 16px;
}

.flower-svg.small {
  width: 12px;
  height: 12px;
}

@keyframes flower-bloom {
  0%,
  60% {
    opacity: 0;
    transform: translateY(5px) scale(0.5) rotate(0deg);
  }
  70%,
  90% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(20deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-5px) scale(0.8) rotate(40deg);
  }
}

/* 波浪线 */
.wave {
  position: absolute;
  width: 25px;
  height: 6px;
  opacity: 0;
  animation: wave-flow 2s ease-in-out infinite;
}

.wave-1 {
  top: -30px;
  left: -25px;
  border-radius: 3px;
  background: linear-gradient(90deg, transparent, #fda4af 30%, transparent 60%);
  animation-delay: 0s;
}

.wave-2 {
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 3px;
  background: linear-gradient(90deg, transparent, #fecdd3 30%, transparent 60%);
  animation-delay: 0.5s;
}

.wave-3 {
  top: -25px;
  right: -25px;
  border-radius: 3px;
  background: linear-gradient(90deg, transparent, #fda4af 30%, transparent 60%);
  animation-delay: 1s;
}

@keyframes wave-flow {
  0%,
  80% {
    opacity: 0;
    transform: translateX(-5px);
  }
  85%,
  95% {
    opacity: 0.8;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(5px);
  }
}

/* 闪烁小点 */
.twinkle {
  position: absolute;
  opacity: 0;
  animation: fx-twinkle 2s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
}

.twinkle-svg {
  width: 10px;
  height: 10px;
}

.twinkle-svg.small {
  width: 6px;
  height: 6px;
}
</style>
