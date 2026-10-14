<script setup lang="ts">
// 打哈欠效果组件
</script>

<template>
  <div class="yawn-effects effect-badge">
    <span class="yawn-icon">😴</span>
  </div>
</template>

<style scoped>
@import "./shared.css";

.yawn-effects {
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
}

.yawn-icon {
  font-size: 24px;
  animation: yawn-float 2s ease-in-out infinite;
}

@keyframes yawn-float {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-8px);
    opacity: 1;
  }
}
</style>
