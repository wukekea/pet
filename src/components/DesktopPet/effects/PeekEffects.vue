<script setup lang="ts">
// 偷看效果组件
</script>

<template>
  <div class="peek-effects">
    <span class="peek-icon">🤫</span>
  </div>
</template>

<style scoped>
.peek-effects {
  position: absolute;
  top: -35px;
  left: 55%;
  pointer-events: none;
}

.peek-icon {
  animation: peek-shy 1.5s ease-in-out infinite;
  font-size: 24px;
}

@keyframes peek-shy {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-5px) scale(1.1);
    opacity: 1;
  }
}
</style>
