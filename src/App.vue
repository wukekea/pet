<script setup lang="ts">
import { onMounted, ref } from "vue";
import DesktopPet from "@/components/DesktopPet/index.vue";
import DebugPanel from "@/components/DebugPanel/index.vue";

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
    <!-- 调试面板 -->
    <DebugPanel />
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
