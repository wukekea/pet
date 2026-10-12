<script setup lang="ts">
// 通用 Bug 图标 - 程序员效果共用
</script>

<template>
  <svg viewBox="0 0 24 24" class="bug-svg" xmlns="http://www.w3.org/2000/svg">
    <!-- Bug 身体 -->
    <ellipse cx="12" cy="12" rx="6" ry="5" fill="#8B4513" />
    <ellipse cx="12" cy="10" rx="4" ry="3" fill="#A0522D" />
    <!-- 眼睛 -->
    <circle cx="10" cy="9" r="1.5" fill="#333" />
    <circle cx="14" cy="9" r="1.5" fill="#333" />
    <!-- 触角 -->
    <path
      d="M8 6 L6 3"
      stroke="#8B4513"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M16 6 L18 3"
      stroke="#8B4513"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <!-- 腿 -->
    <path
      d="M6 10 L3 8"
      stroke="#8B4513"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M6 14 L3 16"
      stroke="#8B4513"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M18 10 L21 8"
      stroke="#8B4513"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path
      d="M18 14 L21 16"
      stroke="#8B4513"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
.bug-svg {
  display: block;
}
</style>
