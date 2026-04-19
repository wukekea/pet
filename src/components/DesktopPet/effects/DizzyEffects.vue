<script setup lang="ts">
// 晕眩效果组件（摔倒时显示）
</script>

<template>
  <div class="dizzy-effects">
    <span class="dizzy-star">⭐</span>
    <span class="dizzy-star star-2">💫</span>
    <span class="dizzy-star star-3">✴️</span>
  </div>
</template>

<style scoped>
.dizzy-effects {
  position: absolute;
  inset: -40px;
  pointer-events: none;
}

.dizzy-star {
  position: absolute;
  font-size: 20px;
  opacity: 0;
  animation: dizzy-spin 1s linear infinite;
}

.dizzy-star:first-child {
  top: -15px;
  left: -25px;
}

.star-2 {
  top: -20px;
  left: 50%;
  animation-delay: 0.3s;
}

.star-3 {
  top: 0;
  right: -25px;
  animation-delay: 0.6s;
}

@keyframes dizzy-spin {
  0% {
    opacity: 0;
    transform: rotate(0deg) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: rotate(180deg) scale(1);
  }
  100% {
    opacity: 0;
    transform: rotate(360deg) scale(0.8);
  }
}
</style>
