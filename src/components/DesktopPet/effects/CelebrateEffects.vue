<script setup lang="ts">
// 跳跃庆祝效果组件
</script>

<template>
  <div class="celebrate-effects">
    <!-- 彩带 -->
    <div class="confetti-ribbon cr-1"></div>
    <div class="confetti-ribbon cr-2"></div>
    <div class="confetti-ribbon cr-3"></div>
    <div class="confetti-ribbon cr-4"></div>
    <div class="confetti-ribbon cr-5"></div>
    <div class="confetti-ribbon cr-6"></div>
    <!-- 星星 -->
    <div class="celebrate-star cs-1">✦</div>
    <div class="celebrate-star cs-2">✧</div>
    <div class="celebrate-star cs-3">⭐</div>
    <div class="celebrate-star cs-4">✨</div>
    <!-- 彩色圆点 -->
    <div class="celebrate-dot cd-1"></div>
    <div class="celebrate-dot cd-2"></div>
    <div class="celebrate-dot cd-3"></div>
    <div class="celebrate-dot cd-4"></div>
    <!-- 光环 -->
    <div class="celebrate-glow"></div>
  </div>
</template>

<style scoped>
.celebrate-effects {
  position: absolute;
  inset: -40px;
  pointer-events: none;
  overflow: visible;
}

/* 彩带 */
.confetti-ribbon {
  position: absolute;
  width: 6px;
  height: 18px;
  border-radius: 3px;
  animation: confetti-burst 1.5s ease-out infinite;
  opacity: 0;
}

.cr-1 {
  background: linear-gradient(180deg, #f472b6 0%, #ec4899 100%);
  left: 50%;
  top: 50%;
  animation-delay: 0s;
}

.cr-2 {
  background: linear-gradient(180deg, #a78bfa 0%, #8b5cf6 100%);
  left: 50%;
  top: 50%;
  animation-delay: 0.1s;
}

.cr-3 {
  background: linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%);
  left: 50%;
  top: 50%;
  animation-delay: 0.2s;
}

.cr-4 {
  background: linear-gradient(180deg, #34d399 0%, #10b981 100%);
  left: 50%;
  top: 50%;
  animation-delay: 0.3s;
}

.cr-5 {
  background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
  left: 50%;
  top: 50%;
  animation-delay: 0.15s;
}

.cr-6 {
  background: linear-gradient(180deg, #f87171 0%, #ef4444 100%);
  left: 50%;
  top: 50%;
  animation-delay: 0.25s;
}

@keyframes confetti-burst {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
  }
  20% {
    opacity: 1;
    transform: translate(var(--x1), var(--y1)) rotate(180deg) scale(1.1);
  }
  40% {
    opacity: 1;
    transform: translate(var(--x2), var(--y2)) rotate(360deg) scale(1);
  }
  60% {
    opacity: 0.8;
    transform: translate(var(--x3), var(--y3)) rotate(540deg) scale(0.9);
  }
  80% {
    opacity: 0.5;
    transform: translate(var(--x4), var(--y4)) rotate(660deg) scale(0.7);
  }
  100% {
    opacity: 0;
    transform: translate(var(--x5), var(--y5)) rotate(720deg) scale(0.5);
  }
}

/* 彩带1 - 左上抛出 */
.cr-1 {
  --x1: -25px;
  --y1: -35px;
  --x2: -40px;
  --y2: -25px;
  --x3: -50px;
  --y3: 0px;
  --x4: -55px;
  --y4: 25px;
  --x5: -60px;
  --y5: 50px;
}

/* 彩带2 - 右上抛出 */
.cr-2 {
  --x1: 25px;
  --y1: -40px;
  --x2: 40px;
  --y2: -30px;
  --x3: 50px;
  --y3: -5px;
  --x4: 55px;
  --y4: 20px;
  --x5: 60px;
  --y5: 50px;
}

/* 彩带3 - 左侧抛出 */
.cr-3 {
  --x1: -20px;
  --y1: -25px;
  --x2: -35px;
  --y2: -15px;
  --x3: -45px;
  --y3: 10px;
  --x4: -50px;
  --y4: 35px;
  --x5: -55px;
  --y5: 60px;
}

/* 彩带4 - 右侧抛出 */
.cr-4 {
  --x1: 20px;
  --y1: -30px;
  --x2: 35px;
  --y2: -20px;
  --x3: 48px;
  --y3: 5px;
  --x4: 55px;
  --y4: 30px;
  --x5: 60px;
  --y5: 55px;
}

/* 彩带5 - 左上高抛 */
.cr-5 {
  --x1: -30px;
  --y1: -45px;
  --x2: -50px;
  --y2: -35px;
  --x3: -60px;
  --y3: -10px;
  --x4: -65px;
  --y4: 15px;
  --x5: -70px;
  --y5: 45px;
}

/* 彩带6 - 右上高抛 */
.cr-6 {
  --x1: 30px;
  --y1: -35px;
  --x2: 48px;
  --y2: -25px;
  --x3: 58px;
  --y3: 0px;
  --x4: 65px;
  --y4: 25px;
  --x5: 70px;
  --y5: 50px;
}

/* 庆祝星星 */
.celebrate-star {
  position: absolute;
  font-size: 14px;
  animation: star-celebrate 1s ease-in-out infinite;
  opacity: 0;
  filter: drop-shadow(0 0 4px currentColor);
}

.cs-1 {
  top: -35px;
  left: -25px;
  color: #fbbf24;
  animation-delay: 0s;
}

.cs-2 {
  top: -40px;
  right: -20px;
  color: #a78bfa;
  animation-delay: 0.3s;
}

.cs-3 {
  top: 10px;
  left: -30px;
  color: #f472b6;
  animation-delay: 0.5s;
}

.cs-4 {
  top: 5px;
  right: -25px;
  color: #34d399;
  animation-delay: 0.7s;
}

@keyframes star-celebrate {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.5) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.3) rotate(15deg);
  }
}

/* 彩色圆点 */
.celebrate-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: dot-float 2s ease-in-out infinite;
  opacity: 0;
}

.cd-1 {
  background: radial-gradient(circle, #fbbf24 0%, #f59e0b 100%);
  top: -20px;
  left: 0;
  animation-delay: 0s;
}

.cd-2 {
  background: radial-gradient(circle, #f472b6 0%, #ec4899 100%);
  top: -15px;
  right: 5px;
  animation-delay: 0.4s;
}

.cd-3 {
  background: radial-gradient(circle, #60a5fa 0%, #3b82f6 100%);
  top: 5px;
  left: -10px;
  animation-delay: 0.8s;
}

.cd-4 {
  background: radial-gradient(circle, #34d399 0%, #10b981 100%);
  top: 10px;
  right: -5px;
  animation-delay: 1.2s;
}

@keyframes dot-float {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-5px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) scale(0.5);
  }
}

/* 光环效果 */
.celebrate-glow {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(
    circle,
    rgba(167, 139, 250, 0.3) 0%,
    rgba(167, 139, 250, 0.1) 40%,
    transparent 70%
  );
  border-radius: 50%;
  animation: glow-pulse 1.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.3);
  }
}
</style>
