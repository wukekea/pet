<script setup lang="ts">
defineProps<{
  color?: string;
}>();
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    :fill="color ?? '#fef08a'"
  >
    <path
      d="M12 2L14.09 8.26L22 8.27L16.54 12.97L18.09 20.5L12 16.27L5.91 20.5L7.46 12.97L2 8.27L9.91 8.26L12 2Z"
    />
  </svg>
</template>
