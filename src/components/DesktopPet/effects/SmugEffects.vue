<script setup lang="ts">
// 得意效果组件
</script>

<template>
  <div class="smug-effects">
    <span class="thumb-up">👍</span>
  </div>
</template>

<style scoped>
.smug-effects {
  position: absolute;
  top: -30px;
  right: -20px;
  pointer-events: none;
}

.thumb-up {
  display: block;
  animation: thumb-bounce 0.5s ease-in-out infinite;
}

@keyframes thumb-bounce {
  0%,
  100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-15deg);
  }
}
</style>
