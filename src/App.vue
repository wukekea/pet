<script setup lang="ts">
import { onMounted, ref, defineAsyncComponent } from "vue";
import DesktopPet from "@/components/DesktopPet/index.vue";
import { Z_INDEX } from "@/constants/zIndex";

// 调试面板仅在开发环境加载，生产构建中被 tree-shake 排除
const DebugPanel = import.meta.env.DEV
  ? defineAsyncComponent(() => import("@/components/DebugPanel/index.vue"))
  : null;

// 性能采集控制器（仅开发环境）：暴露 window.__perfSweep 命令通道，
// 供 scripts/perf-sweep.mjs 驱动天气×昼夜遍历并采样 CPU
if (import.meta.env.DEV) {
  import("@/devOnly/perfSweep");
}

const isLoaded = ref(false);

onMounted(() => {
  // 初始加载动画
  setTimeout(() => {
    isLoaded.value = true;
  }, 100);
});
</script>

<template>
  <div
    class="app-shell"
    :class="{ 'is-loaded': isLoaded }"
    :style="{
      '--z-pet-body': Z_INDEX.petBody,
      '--z-chat-panel': Z_INDEX.chatPanel,
      '--z-context-menu': Z_INDEX.contextMenu,
      '--z-menu-backdrop': Z_INDEX.menuBackdrop,
      '--z-modal': Z_INDEX.modal,
      '--z-confirm': Z_INDEX.confirm,
      '--z-debug-panel': Z_INDEX.debugPanel,
    }"
  >
    <!-- 桌面宠物 -->
    <DesktopPet />
    <!-- 调试面板（仅开发环境） -->
    <DebugPanel v-if="DebugPanel" />
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
