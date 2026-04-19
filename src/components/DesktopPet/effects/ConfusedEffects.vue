<script setup lang="ts">
// 疑惑效果组件
</script>

<template>
  <div class="confused-effects">
    <span class="confused-icon">🤔</span>
  </div>
</template>

<style scoped>
.confused-effects {
  position: absolute;
  top: -35px;
  right: -10px;
  pointer-events: none;
}

.confused-icon {
  display: block;
  animation: confused-bounce 0.5s ease-in-out infinite;
}

@keyframes confused-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>
