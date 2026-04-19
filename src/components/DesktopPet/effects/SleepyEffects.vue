<script setup lang="ts">
// 睡眼朦胧效果组件
</script>

<template>
  <div class="sleepy-effects">
    <span class="sleepy-icon">💤</span>
  </div>
</template>

<style scoped>
.sleepy-effects {
  position: absolute;
  top: -35px;
  right: -15px;
  pointer-events: none;
}

.sleepy-icon {
  font-size: 24px;
  animation: sleepy-float 3s ease-in-out infinite;
}

@keyframes sleepy-float {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-10px) scale(1.1);
    opacity: 1;
  }
}
</style>
