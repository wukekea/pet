<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import DesktopPet from "@/components/DesktopPet/index.vue";

const isLoaded = ref(false);

onMounted(() => {
  // 初始加载动画
  setTimeout(() => {
    isLoaded.value = true;
  }, 100);
});
</script>

<template>
  <div class="app-shell" :class="{ 'is-loaded': isLoaded }">
    <!-- 桌面宠物 -->
    <DesktopPet />
  </div>
</template>

<style scoped>
.app-shell {
  width: 100vw;
  height: 100vh;
  opacity: 0;
  transition: opacity 0.35s;
}

.app-shell.is-loaded {
  opacity: 1;
}
</style>
