<script setup lang="ts">
/**
 * 通用定位装饰层 — 管理相对于 pet-body 绝对定位的装饰品
 *
 * 注意：bow（蝴蝶结）和 magicWand（魔法杖）不在此管理，
 * 它们需要嵌入各 Shape 的耳朵/手臂 DOM 子节点中以跟随 CSS 动画。
 * 详见 decorations/index.ts 的说明。
 */
import DecoScarf from "./DecoScarf.vue";
import DecoWreath from "./DecoWreath.vue";
import DecoTopHat from "./DecoTopHat.vue";
import DecoSunglasses from "./DecoSunglasses.vue";
import DecoCrown from "./DecoCrown.vue";
import DecoMedal from "./DecoMedal.vue";
import "../decoration-overrides.css";

defineProps<{
  equippedDecorations: string[];
}>();
</script>

<template>
  <div class="pet-decorations">
    <DecoScarf v-if="equippedDecorations.includes('scarf')" />
    <DecoWreath v-if="equippedDecorations.includes('wreath')" />
    <DecoTopHat v-if="equippedDecorations.includes('topHat')" />
    <DecoSunglasses v-if="equippedDecorations.includes('sunglasses')" />
    <DecoCrown v-if="equippedDecorations.includes('crown')" />
    <DecoMedal v-if="equippedDecorations.includes('medal')" />
  </div>
</template>

<style>
/* 装饰层容器 */
.pet-decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 20;
}

.deco {
  position: absolute;
  pointer-events: none;
}
</style>
