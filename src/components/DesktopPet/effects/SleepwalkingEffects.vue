<script setup lang="ts">
// 睡眠行走效果组件
</script>

<template>
  <div class="sleepwalking-effects">
    <span class="sleepwalking-icon">💤</span>
  </div>
</template>

<style scoped>
.sleepwalking-effects {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.sleepwalking-icon {
  font-size: 20px;
  animation: sleepwalking-sparkle 0.8s ease-in-out infinite;
}

@keyframes sleepwalking-sparkle {
  0%,
  100% {
    opacity: 0.6;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateY(-3px) scale(1.1);
  }
}
</style>
