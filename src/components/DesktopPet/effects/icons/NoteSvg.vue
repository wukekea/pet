<script setup lang="ts">
// 通用音符图标 - 双八分音符，可配置颜色
defineProps<{
  color?: string;
}>();
</script>

<template>
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 4 L12 16 M8 14 L8 18 L16 16 L16 12 L8 14Z"
      :stroke="color ?? '#FF6B6B'"
      stroke-width="2"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="6" cy="18" r="3" :fill="color ?? '#FF6B6B'" />
    <circle cx="14" cy="16" r="3" :fill="color ?? '#FF6B6B'" />
  </svg>
</template>
