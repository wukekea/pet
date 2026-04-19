<script setup lang="ts">
// 翻滚效果组件
</script>

<template>
  <div class="rolling-effects">
    <span class="spin-star">⭐</span>
  </div>
</template>

<style scoped>
.rolling-effects {
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
}

.spin-star {
  position: absolute;
  font-size: 24px;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  animation: star-spin 0.5s linear infinite;
  z-index: 10;
}

@keyframes star-spin {
  0% {
    transform: translateX(-50%) rotate(0deg) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%) rotate(180deg) scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: translateX(-50%) rotate(360deg) scale(1);
    opacity: 1;
  }
}
</style>
