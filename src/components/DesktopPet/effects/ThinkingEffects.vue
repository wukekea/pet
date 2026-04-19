<script setup lang="ts">
// 思考效果组件
</script>

<template>
  <div class="thinking-effects">
    <span class="think-icon">💭</span>
  </div>
</template>

<style scoped>
.thinking-effects {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}

.think-icon {
  display: block;
  animation: think-float 2s ease-in-out infinite;
}

@keyframes think-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>
