<script setup lang="ts">
import { currentFood } from "../composables/sharedState";
import FoodItem from "../foods/FoodItem.vue";
</script>

<template>
  <div class="eating-effects">
    <!-- 食物容器 -->
    <FoodItem :food-type="currentFood" />

    <!-- 心心眼 -->
    <div class="heart-eyes">
      <span class="h-eye left">❤</span>
      <span class="h-eye right">❤</span>
    </div>

    <!-- 满足飘心 -->
    <div class="satisfaction-hearts">
      <span class="sat-heart sh-1">💕</span>
      <span class="sat-heart sh-2">💖</span>
      <span class="sat-heart sh-3">✨</span>
      <span class="sat-heart sh-4">💗</span>
    </div>

    <!-- 咀嚼粒子 -->
    <div class="crumb-particles">
      <span class="crumb cr-1"></span>
      <span class="crumb cr-2"></span>
      <span class="crumb cr-3"></span>
      <span class="crumb cr-4"></span>
    </div>

    <!-- 满足星光 -->
    <div class="satisfaction-stars">
      <span class="sat-star ss-1">⭐</span>
      <span class="sat-star ss-2">✦</span>
      <span class="sat-star ss-3">✧</span>
    </div>

    <!-- 好吃文字 -->
    <div class="yummy-text">
      <span class="yummy-char yc-1">好</span>
      <span class="yummy-char yc-2">吃</span>
      <span class="yummy-char yc-3">~</span>
    </div>
  </div>
</template>

<style scoped>
.eating-effects {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 140px;
  top: -50px;
  pointer-events: none;
}

/* ========================================
   心心眼
   ======================================== */
.heart-eyes {
  position: absolute;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 14px;
}

.h-eye {
  font-size: 14px;
  animation: heart-eye-beat 0.4s ease-in-out infinite;
  filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.6));
  color: #ef4444;
}

.h-eye.left {
  animation-delay: 0s;
}

.h-eye.right {
  animation-delay: 0.1s;
}

@keyframes heart-eye-beat {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
}

/* ========================================
   满足飘心
   ======================================== */
.satisfaction-hearts {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 60px;
}

.sat-heart {
  position: absolute;
  font-size: 14px;
  animation: heart-float-up 2s ease-out infinite;
  opacity: 0;
}

.sh-1 {
  left: 10px;
  animation-delay: 0s;
}
.sh-2 {
  left: 30px;
  animation-delay: 0.5s;
}
.sh-3 {
  left: 50px;
  animation-delay: 1s;
}
.sh-4 {
  left: 70px;
  animation-delay: 1.5s;
}

@keyframes heart-float-up {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.5) rotate(-10deg);
  }
  30% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(0deg);
  }
  70% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
    transform: translateY(-40px) scale(0.8) rotate(10deg);
  }
}

/* ========================================
   咀嚼粒子
   ======================================== */
.crumb-particles {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 20px;
}

.crumb {
  position: absolute;
  width: 4px;
  height: 4px;
  background: linear-gradient(135deg, #fde68a 0%, #f59e0b 100%);
  border-radius: 50%;
  animation: crumb-fall 0.8s ease-out infinite;
  opacity: 0;
}

.cr-1 {
  left: 5px;
  animation-delay: 0s;
}
.cr-2 {
  left: 15px;
  animation-delay: 0.2s;
}
.cr-3 {
  left: 25px;
  animation-delay: 0.4s;
}
.cr-4 {
  left: 35px;
  animation-delay: 0.6s;
}

@keyframes crumb-fall {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(15px) scale(0.5) translateX(var(--drift, 5px));
  }
}

/* ========================================
   满足星光
   ======================================== */
.satisfaction-stars {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 30px;
}

.sat-star {
  position: absolute;
  font-size: 12px;
  animation: star-twinkle-eat 1s ease-in-out infinite;
  opacity: 0;
}

.ss-1 {
  left: 0;
  animation-delay: 0s;
}
.ss-2 {
  left: 25px;
  animation-delay: 0.3s;
}
.ss-3 {
  left: 50px;
  animation-delay: 0.6s;
}

@keyframes star-twinkle-eat {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.3) rotate(15deg);
  }
}

/* ========================================
   好吃文字动画
   ======================================== */
.yummy-text {
  position: absolute;
  top: -45px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
}

.yummy-char {
  font-size: 14px;
  font-weight: 700;
  background: linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #fbbf24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
  animation: yummy-bounce 0.6s ease-out infinite;
  opacity: 0;
}

.yc-1 {
  animation-delay: 0s;
}
.yc-2 {
  animation-delay: 0.15s;
}
.yc-3 {
  animation-delay: 0.3s;
}

@keyframes yummy-bounce {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.5);
  }
  30% {
    opacity: 1;
    transform: translateY(-5px) scale(1.2);
  }
  50% {
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
