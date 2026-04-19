<script setup lang="ts">
// 睡眠气泡效果组件
</script>

<template>
  <div class="sleep-bubble">
    <span>Z</span>
    <span class="z2">Z</span>
    <span class="z3">Z</span>
  </div>
</template>

<style scoped>
/* 睡眠气泡 */
.sleep-bubble {
  position: absolute;
  top: -30px;
  right: -20px;
  font-size: 16px;
  animation: float-up 2s ease-in-out infinite;
}

.sleep-bubble span {
  display: block;
  opacity: 0;
  animation: z-fade 2s ease-in-out infinite;
}

.sleep-bubble .z2 {
  margin-left: 10px;
  animation-delay: 0.5s;
}

.sleep-bubble .z3 {
  margin-left: 20px;
  animation-delay: 1s;
}

@keyframes float-up {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes z-fade {
  0% {
    opacity: 0;
    transform: translateY(5px);
  }
  50% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>
