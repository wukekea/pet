<script setup lang="ts">
// 惊吓效果组件
</script>

<template>
  <div class="scared-effects">
    <span class="exclaim">❗</span>
    <span class="exclaim exclaim-2">❗</span>
  </div>
</template>

<style scoped>
.scared-effects {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  display: flex;
  gap: 20px;
}

.exclaim {
  font-size: 24px;
  animation: exclaim-bounce 0.3s ease-in-out infinite;
}

.exclaim-2 {
  animation-delay: 0.15s;
}

@keyframes exclaim-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
</style>
