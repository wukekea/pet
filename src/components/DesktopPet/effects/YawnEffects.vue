<script setup lang="ts">
// 打哈欠效果组件
</script>

<template>
  <div class="yawn-effects">
    <span class="yawn-icon">😴</span>
  </div>
</template>

<style scoped>
.yawn-effects {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
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
