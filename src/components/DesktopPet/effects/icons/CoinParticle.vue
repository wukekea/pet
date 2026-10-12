<script setup lang="ts">
// 通用小金币粒子 - 金币增长特效的弹出小金币
</script>

<template>
  <div class="coin-particle">
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <circle
        cx="8"
        cy="8"
        r="7"
        fill="#ffc833"
        stroke="#d4960a"
        stroke-width="0.5"
      />
      <circle cx="8" cy="8" r="5" fill="#ffe066" />
    </svg>
  </div>
</template>

<style scoped>
.coin-particle {
  position: absolute;
  width: 12px;
  height: 12px;
  opacity: 0;
  filter: drop-shadow(0 1px 3px rgba(255, 180, 0, 0.4));
}
</style>
