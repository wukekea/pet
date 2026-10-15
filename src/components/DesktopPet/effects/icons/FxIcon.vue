<script setup lang="ts">
// 通用特效图标 - 单 path + 纯色填充的图标统一由本组件渲染，
// 路径数据见同目录 iconPaths.ts
import { computed } from "vue";
import { ICON_PATHS, type FxIconName } from "./iconPaths";

const props = defineProps<{
  /** 图标名，见 iconPaths.ts */
  name: FxIconName;
  /** 覆盖默认色 */
  color?: string;
}>();

const icon = computed(() => ICON_PATHS[props.name]);
</script>

<template>
  <svg
    :viewBox="icon.viewBox"
    xmlns="http://www.w3.org/2000/svg"
    :fill="color ?? icon.color"
  >
    <path :d="icon.d" />
  </svg>
</template>
