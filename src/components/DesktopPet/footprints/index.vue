<script setup lang="ts">
import type { Footprint } from "../types";

// 脚印组件
defineProps<{
  footprints: Footprint[];
  color: string;
}>();

// 获取脚印透明度
const getOpacity = (footprint: Footprint): number => {
  const age = Date.now() - footprint.createdAt;
  const maxAge = 3000; // 3秒后完全消失
  return Math.max(0, 1 - age / maxAge);
};
</script>

<template>
  <div class="footprints-container">
    <div
      v-for="footprint in footprints"
      :key="footprint.id"
      class="footprint"
      :class="[
        footprint.isLeft ? 'footprint-left' : 'footprint-right',
        `footprint-${footprint.direction}`,
        `footprint-type-${footprint.type}`,
      ]"
      :style="{
        left: `${footprint.x}px`,
        top: `${footprint.y}px`,
        opacity: getOpacity(footprint),
      }"
    >
      <svg viewBox="0 0 24 24" class="footprint-svg" :style="{ color }">
        <path
          d="M12 2C9.5 2 7.5 4.5 7.5 7.5C7.5 10.5 9.5 13 12 13C14.5 13 16.5 10.5 16.5 7.5C16.5 4.5 14.5 2 12 2Z"
          fill="currentColor"
        />
        <ellipse cx="7" cy="17" rx="3" ry="2" fill="currentColor" />
        <ellipse cx="12" cy="19" rx="3.5" ry="2.5" fill="currentColor" />
        <ellipse cx="17" cy="17" rx="3" ry="2" fill="currentColor" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.footprints-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.footprint {
  position: absolute;
  width: 20px;
  height: 20px;
  transform: translate(-50%, -100%);
  transition: opacity 0.1s linear;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.footprint-svg {
  width: 100%;
  height: 100%;
}

.footprint-left.footprint-right {
  transform: translate(-50%, -100%) rotate(-15deg);
}

.footprint-left.footprint-left {
  transform: translate(-50%, -100%) rotate(15deg);
}

.footprint-right.footprint-right {
  transform: translate(-50%, -100%) rotate(15deg);
}

.footprint-right.footprint-left {
  transform: translate(-50%, -100%) rotate(-15deg);
}

/* 雪脚印样式 */
.footprint-type-snow {
  filter: blur(0.5px);
}

.footprint-type-snow .footprint-svg {
  color: rgba(255, 255, 255, 0.9) !important;
  filter: drop-shadow(0 0 3px rgba(200, 220, 255, 0.6));
}

/* 水脚印样式 */
.footprint-type-water .footprint-svg {
  color: rgba(100, 180, 255, 0.7) !important;
  filter: drop-shadow(0 0 4px rgba(100, 180, 255, 0.5));
}
</style>
