<script setup lang="ts">
// 坏笑效果组件
</script>

<template>
  <div class="grin-effects effect-badge">
    <span class="grin-text">嘿嘿~</span>
  </div>
</template>

<style scoped>
@import "./shared.css";

.grin-effects {
  top: -25px;
  right: -15px;
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
