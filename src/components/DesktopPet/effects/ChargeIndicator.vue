<script setup lang="ts">
/**
 * 蓄力指示器组件
 * 显示在宠物上方，随蓄力进度变化
 */
import { computed } from "vue";
import { chargeProgress } from "../composables/sharedState";

// 蓄力等级显示
const chargeLevel = computed(() => {
  const p = chargeProgress.value;
  if (p < 0.2) return 1;
  if (p < 0.4) return 2;
  if (p < 0.6) return 3;
  if (p < 0.8) return 4;
  return 5;
});

// 根据蓄力等级返回颜色
const levelColor = computed(() => {
  const colors = [
    "#94a3b8", // 等级1: 灰色
    "#60a5fa", // 等级2: 蓝色
    "#34d399", // 等级3: 绿色
    "#fbbf24", // 等级4: 黄色
    "#f87171", // 等级5: 红色
  ];
  return colors[chargeLevel.value - 1];
});
</script>

<template>
  <div class="charge-indicator">
    <!-- 蓄力进度环 -->
    <div class="charge-ring" :style="{ '--progress': chargeProgress * 360 }">
      <svg viewBox="0 0 100 100">
        <!-- 背景圆环 -->
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          stroke-width="8"
        />
        <!-- 进度圆环 -->
        <circle
          class="progress-ring"
          cx="50"
          cy="50"
          r="42"
          fill="none"
          :stroke="levelColor"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="`calc(${chargeProgress} * 264) 264`"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <!-- 中心图标 -->
      <div class="center-icon" :style="{ color: levelColor }">
        <span class="rocket-icon">🚀</span>
      </div>
    </div>

    <!-- 蓄力等级点 -->
    <div class="level-dots">
      <span
        v-for="i in 5"
        :key="i"
        class="level-dot"
        :class="{ active: i <= chargeLevel }"
        :style="{
          backgroundColor:
            i <= chargeLevel ? levelColor : 'rgba(255,255,255,0.3)',
          boxShadow: i <= chargeLevel ? `0 0 8px ${levelColor}` : 'none',
        }"
      />
    </div>

    <!-- 蓄力文字 -->
    <div class="charge-text" :style="{ color: levelColor }">
      {{ Math.round(chargeProgress * 100) }}%
    </div>
  </div>
</template>

<style scoped>
.charge-indicator {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
  animation: float-appear 0.3s ease-out;
}

@keyframes float-appear {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.charge-ring {
  position: relative;
  width: 60px;
  height: 60px;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
}

.charge-ring svg {
  width: 100%;
  height: 100%;
}

.progress-ring {
  transition:
    stroke-dasharray 0.1s ease-out,
    stroke 0.2s ease;
  filter: drop-shadow(0 0 6px currentColor);
}

.center-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  animation: pulse-scale 0.5s ease-in-out infinite;
}

@keyframes pulse-scale {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.rocket-icon {
  display: inline-block;
  animation: rocket-tilt 0.5s ease-in-out infinite;
}

@keyframes rocket-tilt {
  0%,
  100% {
    transform: rotate(-5deg);
  }
  50% {
    transform: rotate(5deg);
  }
}

.level-dots {
  display: flex;
  gap: 6px;
}

.level-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.level-dot.active {
  animation: dot-pulse 0.4s ease-out;
}

@keyframes dot-pulse {
  0% {
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.charge-text {
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 10px currentColor;
  font-family: "SF Mono", "Monaco", "Inconsolata", monospace;
}

/* 高蓄力时的特效 */
.charge-indicator.high-charge .charge-ring {
  animation: ring-glow 0.3s ease-in-out infinite alternate;
}

@keyframes ring-glow {
  from {
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
  }
  to {
    filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.6));
  }
}
</style>
