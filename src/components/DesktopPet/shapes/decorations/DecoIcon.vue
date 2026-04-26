<script setup lang="ts">
import {
  DECORATION_ICONS,
  type DecorationType,
} from "../../composables/sharedState";

defineProps<{
  type: DecorationType;
}>();
</script>

<template>
  <!-- 魔法杖使用SVG图标，避免emoji兼容性问题 -->
  <svg
    v-if="type === 'magicWand'"
    class="deco-icon-wand"
    viewBox="0 0 24 24"
    fill="none"
  >
    <!-- 杖身 -->
    <line
      x1="4"
      y1="20"
      x2="15"
      y2="9"
      stroke="#78350f"
      stroke-width="2.2"
      stroke-linecap="round"
    />
    <!-- 星形顶部 -->
    <polygon
      points="16,3 17.2,6.8 21,6.8 18,9.2 19.2,13 16,10.5 12.8,13 14,9.2 11,6.8 14.8,6.8"
      fill="#fbbf24"
    />
    <!-- 闪光点 -->
    <circle cx="21" cy="3.5" r="1" fill="#fbbf24" opacity="0.7" />
    <circle cx="12" cy="2" r="0.8" fill="#fbbf24" opacity="0.5" />
  </svg>
  <span v-else>{{ DECORATION_ICONS[type] }}</span>
</template>

<style>
.deco-icon-wand {
  width: 1.2em;
  height: 1.2em;
  vertical-align: middle;
}
</style>
