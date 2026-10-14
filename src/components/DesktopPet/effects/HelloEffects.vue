<script setup lang="ts">
// 打招呼效果组件
</script>

<template>
  <div class="hello-effects effect-badge">
    <span class="wave">👋</span>
  </div>
</template>

<style scoped>
@import "./shared.css";

.hello-effects {
  top: -20px;
  right: -25px;
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
