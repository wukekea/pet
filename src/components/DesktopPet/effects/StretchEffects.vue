<script setup lang="ts">
// 伸懒腰效果组件
</script>

<template>
  <div class="stretch-effects effect-badge">
    <span class="stretch-icon">✨</span>
  </div>
</template>

<style scoped>
@import "./shared.css";

.stretch-effects {
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
}

.stretch-icon {
  font-size: 24px;
  animation: stretch-sparkle 2.5s ease-in-out;
}

@keyframes stretch-sparkle {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  30% {
    transform: scale(1.2);
    opacity: 1;
  }
  70% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
}
</style>
