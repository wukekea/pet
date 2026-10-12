<script setup lang="ts">
// 通用砖头图标 - 搬砖效果共用，可配置尺寸由外层 class 控制
</script>

<template>
  <svg viewBox="0 0 40 20" class="brick-svg" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="36" height="16" rx="2" fill="#8B4513" />
    <rect x="4" y="4" width="32" height="12" rx="1" fill="#A0522D" />
    <rect
      x="6"
      y="6"
      width="8"
      height="8"
      rx="1"
      fill="#CD853F"
      opacity="0.5"
    />
    <rect
      x="16"
      y="6"
      width="8"
      height="8"
      rx="1"
      fill="#CD853F"
      opacity="0.5"
    />
    <rect
      x="26"
      y="6"
      width="8"
      height="8"
      rx="1"
      fill="#CD853F"
      opacity="0.5"
    />
  </svg>
</template>

<style scoped>
.brick-svg {
  display: block;
}
</style>
