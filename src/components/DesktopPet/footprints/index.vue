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
        footprint.isLeft ? 'foot-side-left' : 'foot-side-right',
        `dir-${footprint.direction}`,
        `footprint-type-${footprint.type}`,
      ]"
      :style="{
        left: `${footprint.x}px`,
        top: `${footprint.y}px`,
        opacity: getOpacity(footprint),
      }"
    >
      <svg viewBox="0 0 24 24" class="footprint-svg" :style="{ color }">
        <!-- 主脚掌 -->
        <ellipse cx="12" cy="15" rx="5.5" ry="4.5" fill="currentColor" />
        <!-- 脚趾：上方三个，略偏前 -->
        <ellipse cx="6.5" cy="8.5" rx="2.5" ry="3" fill="currentColor" />
        <ellipse cx="12" cy="6.5" rx="2.5" ry="3.5" fill="currentColor" />
        <ellipse cx="17.5" cy="8.5" rx="2.5" ry="3" fill="currentColor" />
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

/* 脚印旋转：根据移动方向旋转，脚趾指向移动方向 */
/* 基础朝上（脚趾在上），根据方向旋转 */
/* front = 朝向屏幕前方 = 向下移动 */
/* back = 背对屏幕 = 向上移动 */
.foot-side-left.dir-front {
  transform: translate(-50%, -100%) rotate(-188deg);
}
.foot-side-right.dir-front {
  transform: translate(-50%, -100%) rotate(-172deg);
}
.foot-side-left.dir-back {
  transform: translate(-50%, -100%) rotate(-8deg);
}
.foot-side-right.dir-back {
  transform: translate(-50%, -100%) rotate(8deg);
}
.foot-side-left.dir-left {
  transform: translate(-50%, -100%) rotate(-98deg);
}
.foot-side-right.dir-left {
  transform: translate(-50%, -100%) rotate(-82deg);
}
.foot-side-left.dir-right {
  transform: translate(-50%, -100%) rotate(82deg);
}
.foot-side-right.dir-right {
  transform: translate(-50%, -100%) rotate(98deg);
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
