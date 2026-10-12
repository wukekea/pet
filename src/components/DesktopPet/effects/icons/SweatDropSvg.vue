<script setup lang="ts">
// 通用汗滴图标 - 水滴形状，可配置颜色与高光
defineProps<{
  color?: string;
}>();
</script>

<template>
  <svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C12 2 4 12 4 20C4 24.4 7.6 28 12 28C16.4 28 20 24.4 20 20C20 12 12 2 12 2Z"
      :fill="color ?? '#60a5fa'"
    />
  </svg>
</template>
