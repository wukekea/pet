<script setup lang="ts">
// 挠头效果组件
</script>

<template>
  <div class="scratch-effects effect-badge">
    <span class="scratch-icon">❓</span>
  </div>
</template>

<style scoped>
@import "./shared.css";

.scratch-effects {
  top: -35px;
  right: -5px;
}

.scratch-icon {
  display: block;
  animation: scratch-bounce 0.3s ease-in-out infinite;
}

@keyframes scratch-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>
