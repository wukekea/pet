<script setup lang="ts">
// 开心效果组件 - 萌系动漫风格
import HeartSvg from "./icons/HeartSvg.vue";
import StarSvg from "./icons/StarSvg.vue";
</script>

<template>
  <div class="happy-effects">
    <!-- 漂浮的爱心和星星 -->
    <div class="float-item heart-1">
      <HeartSvg color="#ff6b9d" class="heart-svg" />
    </div>
    <div class="float-item star-1">
      <StarSvg color="#ffd700" class="star-svg" />
    </div>
    <div class="float-item heart-2">
      <HeartSvg color="#ff8fab" class="heart-svg small" />
    </div>
    <div class="float-item star-2">
      <StarSvg color="#ffe066" class="star-svg small" />
    </div>
    <div class="float-item heart-3">
      <HeartSvg color="#ff6b9d" class="heart-svg" />
    </div>
  </div>
</template>

<style scoped>
.happy-effects {
  position: absolute;
  inset: -20px;
  pointer-events: none;
  overflow: visible;
}

.float-item {
  position: absolute;
  opacity: 0;
  animation: float-up 1.8s ease-out forwards;
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

/* 位置和延迟 */
.heart-1 {
  top: 0;
  left: -10px;
  animation-delay: 0s;
}

.star-1 {
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0.2s;
}

.heart-2 {
  top: 5px;
  right: -12px;
  animation-delay: 0.35s;
}

.star-2 {
  top: -8px;
  right: 5px;
  animation-delay: 0.5s;
}

.heart-3 {
  top: 15px;
  left: -15px;
  animation-delay: 0.6s;
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
