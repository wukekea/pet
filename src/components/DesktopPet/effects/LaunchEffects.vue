<script setup lang="ts">
/**
 * 发射效果组件
 * 显示发射时的轨迹和特效
 */
import { computed } from "vue";
import { currentLaunchHeight } from "../composables/sharedState";

// 根据高度计算透明度
const trailOpacity = computed(() => {
  const h = currentLaunchHeight.value;
  if (h < 100) return 0.8;
  if (h < 300) return 0.6;
  return 0.4;
});

// 计算星尘数量
const dustCount = computed(() => {
  return Math.min(Math.floor(currentLaunchHeight.value / 50), 8);
});
</script>

<template>
  <div class="launch-effects">
    <!-- 飞行轨迹 -->
    <div class="launch-trail" :style="{ opacity: trailOpacity }">
      <div class="trail-line" />
      <div class="trail-line trail-line-2" />
      <div class="trail-line trail-line-3" />
    </div>

    <!-- 星尘粒子 -->
    <div class="dust-container">
      <span
        v-for="i in dustCount"
        :key="i"
        class="dust-particle"
        :style="{
          '--delay': `${i * 0.1}s`,
          '--offset': `${(i % 3) * 15 - 15}px`,
        }"
      />
    </div>

    <!-- 速度线 -->
    <div class="speed-lines">
      <div class="speed-line" v-for="i in 5" :key="i" :style="{ '--i': i }" />
    </div>
  </div>
</template>

<style scoped>
.launch-effects {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 100vh;
  pointer-events: none;
  overflow: visible;
}

.launch-trail {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease;
}

.trail-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 100%;
  background: linear-gradient(
    to top,
    rgba(251, 191, 36, 0.8) 0%,
    rgba(251, 146, 60, 0.4) 30%,
    transparent 100%
  );
  border-radius: 2px;
  animation: trail-pulse 0.2s ease-in-out infinite;
}

.trail-line-2 {
  left: calc(50% - 8px);
  width: 2px;
  animation-delay: 0.05s;
  opacity: 0.6;
}

.trail-line-3 {
  left: calc(50% + 8px);
  width: 2px;
  animation-delay: 0.1s;
  opacity: 0.6;
}

@keyframes trail-pulse {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

.dust-container {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.dust-particle {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: radial-gradient(circle, #fbbf24 0%, transparent 70%);
  animation: dust-fall 0.8s ease-out infinite;
  animation-delay: var(--delay);
  transform: translateX(var(--offset));
}

@keyframes dust-fall {
  0% {
    opacity: 1;
    transform: translateX(var(--offset)) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(calc(var(--offset) + 10px)) translateY(80px)
      scale(0.3);
  }
}

.speed-lines {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
}

.speed-line {
  position: absolute;
  left: 50%;
  width: 2px;
  height: 30px;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.8), transparent);
  animation: speed-flash 0.15s linear infinite;
  transform: translateX(calc((var(--i) - 3) * 12px - 1px));
  animation-delay: calc(var(--i) * 0.02s);
  opacity: 0.6;
}

@keyframes speed-flash {
  0% {
    opacity: 0;
    transform: translateX(calc((var(--i) - 3) * 12px - 1px)) translateY(0);
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
    transform: translateX(calc((var(--i) - 3) * 12px - 1px)) translateY(-50px);
  }
}
</style>
