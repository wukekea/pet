<script setup lang="ts">
import { DECORATION_ICONS, BATH_ICONS } from "../../composables/sharedState";
import type { DecorationType, BathType } from "../../types";

defineProps<{
  type: DecorationType | BathType;
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
  <!-- 浴球使用SVG图标，避免emoji兼容性问题 -->
  <svg
    v-else-if="type === 'bathBall'"
    class="deco-icon-wand"
    viewBox="0 0 24 24"
    fill="none"
  >
    <!-- 大气泡 -->
    <circle cx="12" cy="10" r="6" fill="#93c5fd" opacity="0.5" />
    <circle
      cx="12"
      cy="10"
      r="6"
      stroke="#60a5fa"
      stroke-width="0.8"
      fill="none"
    />
    <!-- 高光 -->
    <ellipse cx="10" cy="8" rx="2" ry="1.5" fill="white" opacity="0.6" />
    <!-- 中气泡 -->
    <circle cx="18" cy="7" r="3.5" fill="#a5f3fc" opacity="0.45" />
    <circle
      cx="18"
      cy="7"
      r="3.5"
      stroke="#67e8f9"
      stroke-width="0.6"
      fill="none"
    />
    <ellipse cx="16.8" cy="5.8" rx="1.2" ry="0.9" fill="white" opacity="0.5" />
    <!-- 小气泡 -->
    <circle cx="6" cy="6" r="2.5" fill="#c4b5fd" opacity="0.4" />
    <circle
      cx="6"
      cy="6"
      r="2.5"
      stroke="#a78bfa"
      stroke-width="0.5"
      fill="none"
    />
    <ellipse cx="5.2" cy="5" rx="0.8" ry="0.6" fill="white" opacity="0.5" />
    <!-- 迷你气泡 -->
    <circle cx="20" cy="14" r="1.8" fill="#a5f3fc" opacity="0.35" />
    <circle cx="3.5" cy="14" r="1.5" fill="#c4b5fd" opacity="0.3" />
    <circle cx="15" cy="17" r="1.2" fill="#93c5fd" opacity="0.3" />
  </svg>
  <span v-else>{{
    (type in DECORATION_ICONS ? DECORATION_ICONS : BATH_ICONS)[
      type as keyof typeof DECORATION_ICONS & keyof typeof BATH_ICONS
    ]
  }}</span>
</template>

<style>
.deco-icon-wand {
  width: 1.2em;
  height: 1.2em;
  vertical-align: middle;
}
</style>
