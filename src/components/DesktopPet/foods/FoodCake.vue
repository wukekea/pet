<script setup lang="ts">
// 蛋糕食物组件
</script>

<template>
  <div class="food-cake">
    <div class="cake-base"></div>
    <div class="cake-cream"></div>
    <div class="cake-top"></div>
    <div class="cake-cherry"></div>
    <div class="cake-candle">
      <div class="candle-flame"></div>
    </div>
  </div>
</template>

<style scoped>
.food-cake {
  position: relative;
}

.cake-base {
  width: 45px;
  height: 20px;
  background: linear-gradient(180deg, #fde68a 0%, #f59e0b 100%);
  border-radius: 5px;
  box-shadow:
    inset 0 3px 8px rgba(255, 255, 255, 0.5),
    0 4px 10px rgba(245, 158, 11, 0.4);
}

.cake-cream {
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  height: 12px;
  background: linear-gradient(180deg, #fef3c7 0%, #fcd34d 100%);
  border-radius: 8px 8px 0 0;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.6);
}

.cake-top {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 35px;
  height: 10px;
  background: linear-gradient(180deg, #fda4af 0%, #f472b6 100%);
  border-radius: 4px;
}

.cake-cherry {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, #fca5a5 0%, #ef4444 50%, #dc2626 100%);
  border-radius: 50%;
  box-shadow:
    inset 2px 2px 4px rgba(255, 255, 255, 0.5),
    0 2px 6px rgba(239, 68, 68, 0.4);
}

.cake-cherry::after {
  content: "";
  position: absolute;
  top: 1px;
  left: 2px;
  width: 3px;
  height: 2px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
}

.cake-candle {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 15px;
  background: linear-gradient(180deg, #c4b5fd 0%, #a78bfa 100%);
  border-radius: 2px;
}

.candle-flame {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 10px;
  background: linear-gradient(180deg, #fef3c7 0%, #fbbf24 50%, #f97316 100%);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  animation: flame-flicker 0.3s ease-in-out infinite alternate;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
}

@keyframes flame-flicker {
  0% {
    transform: translateX(-50%) scale(1) rotate(-5deg);
  }
  100% {
    transform: translateX(-50%) scale(1.1) rotate(5deg);
  }
}
</style>
