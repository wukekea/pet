<script setup lang="ts">
// 开心效果组件 - 萌系动漫风格
// 漂浮元素用配置数组 + v-for 渲染（替代手写序号副本）
import FxIcon from "./icons/FxIcon.vue";

// 爱心：颜色/位置/delay 差异
const hearts = [
  { color: "#ff6b9d", top: "0", left: "-10px", delay: "0s", small: false },
  { color: "#ff8fab", top: "5px", right: "-12px", delay: "0.35s", small: true },
  { color: "#ff6b9d", top: "15px", left: "-15px", delay: "0.6s", small: false },
];

// 星星：颜色/位置/delay 差异
const stars = [
  {
    color: "#ffd700",
    top: "-12px",
    left: "50%",
    centered: true,
    delay: "0.2s",
    small: false,
  },
  { color: "#ffe066", top: "-8px", right: "5px", delay: "0.5s", small: true },
];
</script>

<template>
  <div class="happy-effects effect-layer">
    <!-- 漂浮的爱心 -->
    <div
      v-for="(heart, i) in hearts"
      :key="`heart-${i}`"
      class="float-item"
      :style="{
        top: heart.top,
        left: heart.left,
        right: heart.right,
        '--fx-delay': heart.delay,
      }"
    >
      <FxIcon
        name="heart"
        :color="heart.color"
        class="heart-svg"
        :class="{ small: heart.small }"
      />
    </div>

    <!-- 漂浮的星星 -->
    <div
      v-for="(star, i) in stars"
      :key="`star-${i}`"
      class="float-item"
      :class="{ centered: star.centered }"
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
        :class="{ small: star.small }"
      />
    </div>
  </div>
</template>

<style scoped>
@import "./shared.css";

.happy-effects {
  inset: -20px;
}

.float-item {
  position: absolute;
  opacity: 0;
  animation: float-up 1.8s ease-out forwards;
  animation-delay: var(--fx-delay, 0s);
}

/* star-1 原为水平居中定位 */
.float-item.centered {
  left: 50%;
  transform: translateX(-50%);
}

.heart-svg,
.star-svg {
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 2px 4px rgba(255, 100, 150, 0.4));
}

.heart-svg.small {
  width: 12px;
  height: 12px;
}

.star-svg {
  animation: star-twinkle 0.5s ease-in-out infinite alternate;
}

.star-svg.small {
  width: 10px;
  height: 10px;
}

@keyframes star-twinkle {
  from {
    filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.6));
  }
  to {
    filter: drop-shadow(0 0 5px rgba(255, 215, 0, 1));
  }
}

@keyframes float-up {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  30% {
    opacity: 1;
    transform: translateY(-10px) scale(1.1);
  }
  60% {
    opacity: 1;
    transform: translateY(-25px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-40px) scale(0.8);
  }
}
</style>
