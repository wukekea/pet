<script setup lang="ts">
// 挠头效果组件
</script>

<template>
  <div class="scratch-effects">
    <span class="scratch-icon">❓</span>
  </div>
</template>

<style scoped>
.scratch-effects {
  position: absolute;
  top: -35px;
  right: -5px;
  pointer-events: none;
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
