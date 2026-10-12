<script setup lang="ts">
// 通用传单图标 - 可配置主色与点缀色
import { computed } from "vue";

const props = defineProps<{
  color?: string;
  accent?: string;
}>();

// 背景色由主色调浅得到，保持原三份传单的底色差异
const bgColor = computed(() => {
  if (props.color === "#4CAF50") return "#E8F5E9";
  if (props.color === "#2196F3") return "#E3F2FD";
  return "#FFF5E6";
});
</script>

<template>
  <svg viewBox="0 0 40 50" class="flyer-svg" xmlns="http://www.w3.org/2000/svg">
    <!-- 传单背景 -->
    <rect x="2" y="2" width="36" height="46" rx="2" :fill="bgColor" />
    <rect x="4" y="4" width="32" height="42" rx="1" fill="#FFFFFF" />
    <!-- 传单内容模拟 -->
    <rect x="7" y="8" width="26" height="8" rx="1" :fill="color ?? '#FF6B6B'" />
    <rect x="7" y="20" width="12" height="3" rx="1" fill="#E0E0E0" />
    <rect x="7" y="26" width="18" height="3" rx="1" fill="#E0E0E0" />
    <rect x="7" y="32" width="14" height="3" rx="1" fill="#E0E0E0" />
    <rect
      x="7"
      y="38"
      width="10"
      height="4"
      rx="1"
      :fill="accent ?? '#4ECDC4'"
    />
    <!-- 传单边框 -->
    <rect
      x="2"
      y="2"
      width="36"
      height="46"
      rx="2"
      fill="none"
      :stroke="color ?? '#FF6B6B'"
      stroke-width="2"
    />
  </svg>
</template>
