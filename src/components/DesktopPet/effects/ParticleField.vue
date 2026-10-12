<script setup lang="ts">
/**
 * 通用粒子场组件
 * 用 v-for + CSS 变量替代"同一元素复制 N 份只改 delay/位置"的手写模式。
 * 每个粒子通过 style 注入 --fx-x/--fx-y/--fx-delay/--fx-duration/--fx-color
 * 等变量，动画与定位由使用方的 CSS 配合这些变量定义。
 */
import type { StyleValue } from "vue";

export interface ParticleItem {
  /** 自定义 style 变量透传，如 { '--fx-delay': '0.3s', '--fx-x': '10px' } */
  [cssVar: string]: string | number;
}

const props = defineProps<{
  /** 粒子配置数组，数组元素会作为 style 绑定到粒子元素上 */
  items: ParticleItem[];
}>();

// 把对象转成 Vue 可接受的 style 绑定
const particleStyle = (item: ParticleItem): StyleValue => item;
</script>

<template>
  <div
    v-for="(item, i) in props.items"
    :key="i"
    class="fx-particle"
    :style="particleStyle(item)"
  >
    <slot />
  </div>
</template>

<style scoped>
.fx-particle {
  position: absolute;
  /* 默认动画名，使用方可通过 --fx-animation 覆盖 */
  animation: var(--fx-animation) var(--fx-duration, 2s)
    var(--fx-timing, ease-in-out) infinite;
  animation-delay: var(--fx-delay, 0s);
  opacity: var(--fx-base-opacity, 0);
}
</style>
