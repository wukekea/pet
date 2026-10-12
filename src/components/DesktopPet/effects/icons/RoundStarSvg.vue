<script setup lang="ts">
// 通用五角星图标（圆润版）- 与 StarSvg 的尖角版区分，可配置颜色
defineProps<{
  color?: string;
}>();
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    :fill="color ?? '#FFD700'"
  >
    <path
      d="M12 2 L14.4 8.5 L22 9 L16.5 13.5 L18.5 21 L12 16.5 L5.5 21 L7.5 13.5 L2 9 L9.6 8.5 Z"
    />
  </svg>
</template>
