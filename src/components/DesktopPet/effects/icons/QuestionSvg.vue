<script setup lang="ts">
defineProps<{
  color?: string;
  fontSize?: number;
}>();
</script>

<template>
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <text
      x="12"
      y="20"
      text-anchor="middle"
      :font-size="fontSize ?? 18"
      font-weight="bold"
      :fill="color ?? '#60a5fa'"
    >
      ?
    </text>
  </svg>
</template>
