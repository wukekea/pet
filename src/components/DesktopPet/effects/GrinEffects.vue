<script setup lang="ts">
// 坏笑效果组件
</script>

<template>
  <div class="grin-effects">
    <span class="grin-text">嘿嘿~</span>
  </div>
</template>

<style scoped>
.grin-effects {
  position: absolute;
  top: -25px;
  right: -15px;
  pointer-events: none;
}

.grin-text {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #f59e0b;
  animation: grin-float 2s ease-in-out infinite;
}

@keyframes grin-float {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-5px);
    opacity: 1;
  }
}
</style>
