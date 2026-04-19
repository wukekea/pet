<script setup lang="ts">
// 打招呼效果组件
</script>

<template>
  <div class="hello-effects">
    <span class="wave">👋</span>
  </div>
</template>

<style scoped>
.hello-effects {
  position: absolute;
  top: -20px;
  right: -25px;
  pointer-events: none;
}

.wave {
  display: block;
  animation: wave-animation 0.5s ease-in-out infinite;
}

@keyframes wave-animation {
  0%,
  100% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(20deg);
  }
}
</style>
