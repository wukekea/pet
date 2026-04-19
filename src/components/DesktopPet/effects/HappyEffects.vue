<script setup lang="ts">
// 开心效果组件
</script>

<template>
  <div class="happy-effects">
    <div class="heart heart-1">❤️</div>
    <div class="heart heart-2">✨</div>
    <div class="heart heart-3">💖</div>
  </div>
</template>

<style scoped>
.happy-effects {
  position: absolute;
  inset: -20px;
  pointer-events: none;
}

.heart {
  position: absolute;
  font-size: 16px;
  opacity: 0;
  animation: heart-float 1.5s ease-out forwards;
}

.heart-1 {
  top: 0;
  left: -10px;
  animation-delay: 0s;
}

.heart-2 {
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0.2s;
}

.heart-3 {
  top: 0;
  right: -10px;
  animation-delay: 0.4s;
}

@keyframes heart-float {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) scale(1.2);
  }
}
</style>
