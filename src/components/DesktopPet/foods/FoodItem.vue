<script setup lang="ts">
import { type FoodType } from "../composables/sharedState";
import FoodApple from "./FoodApple.vue";
import FoodFish from "./FoodFish.vue";
import FoodCake from "./FoodCake.vue";
import FoodMeat from "./FoodMeat.vue";

defineProps<{
  foodType: FoodType;
}>();
</script>

<template>
  <div class="food-container" :class="`food-${foodType}`">
    <FoodApple v-if="foodType === 'apple'" />
    <FoodFish v-else-if="foodType === 'fish'" />
    <FoodCake v-else-if="foodType === 'cake'" />
    <FoodMeat v-else-if="foodType === 'meat'" />
  </div>
</template>

<style scoped>
.food-container {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  animation: food-wobble 0.5s ease-in-out infinite;
}

@keyframes food-wobble {
  0%,
  100% {
    transform: translateX(-50%) rotate(-8deg);
  }
  50% {
    transform: translateX(-50%) rotate(8deg);
  }
}
</style>
