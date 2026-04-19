<script setup lang="ts">
// 害羞效果组件
</script>

<template>
  <div class="shy-effects">
    <span class="shy-icon">🫣</span>
  </div>
</template>

<style scoped>
.shy-effects {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.shy-icon {
  display: block;
  animation: shy-blink 0.5s ease-in-out infinite;
}

@keyframes shy-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
