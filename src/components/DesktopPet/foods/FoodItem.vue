<script setup lang="ts">
import { type FoodType } from "../composables/sharedState";
import type { Component } from "vue";
import FoodApple from "./FoodApple.vue";
import FoodFish from "./FoodFish.vue";
import FoodCake from "./FoodCake.vue";
import FoodLollipop from "./FoodLollipop.vue";
import FoodRiceBall from "./FoodRiceBall.vue";
import FoodMilk from "./FoodMilk.vue";
import FoodSteak from "./FoodSteak.vue";

const FOOD_COMPONENT_MAP: Record<FoodType, Component> = {
  apple: FoodApple,
  fish: FoodFish,
  cake: FoodCake,
  lollipop: FoodLollipop,
  riceBall: FoodRiceBall,
  milk: FoodMilk,
  steak: FoodSteak,
};

defineProps<{
  foodType: FoodType;
}>();
</script>

<template>
  <div class="food-eating-wrapper">
    <div class="food-container" :class="`food-${foodType}`">
      <component :is="FOOD_COMPONENT_MAP[foodType]" />
    </div>
  </div>
</template>

<style scoped>
/* 外层包装 - 处理缩放和消失动画 */
.food-eating-wrapper {
  position: absolute;
  bottom: 18px;
  left: 47%;
  transform: translateX(-50%);
  animation: food-being-eaten 30s ease-in-out forwards;
}

/* 棒棒糖位置调整 - 应用到外层包装 */
.food-eating-wrapper:has(.food-lollipop) {
  bottom: 8px;
}

/* 内层容器 - 处理晃动动画 */
.food-container {
  transform: scale(0.67);
  animation: food-wobble 0.5s ease-in-out infinite;
}

/* 晃动动画 */
@keyframes food-wobble {
  0%,
  100% {
    transform: scale(0.67) rotate(-8deg);
  }
  50% {
    transform: scale(0.67) rotate(8deg);
  }
}

/* 被吃掉的动画 - 30秒内逐渐缩小消失 */
@keyframes food-being-eaten {
  0% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
  80% {
    opacity: 1;
    transform: translateX(-50%) scale(0.6);
  }
  95% {
    opacity: 0.5;
    transform: translateX(-50%) scale(0.3);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) scale(0.15);
  }
}
</style>
