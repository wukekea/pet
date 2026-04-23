<script setup lang="ts">
// 工作进度条组件 - 显示打工状态的完成进度
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { STATE_DURATIONS } from "../constants";
import { petState } from "../composables/sharedState";

// 工作状态列表
const workStates = [
  "brickCarrying",
  "flyerDistributing",
  "programmer",
] as const;
type WorkState = (typeof workStates)[number];

// 状态名称映射
const workNames: Record<WorkState, string> = {
  brickCarrying: "搬砖中",
  flyerDistributing: "发传单中",
  programmer: "写代码中",
};

// 计算当前工作状态
const currentWorkState = computed(() => {
  const state = petState.value;
  if (workStates.includes(state as WorkState)) {
    return state as WorkState;
  }
  return null;
});

// 进度百分比
const progress = ref(0);

// 已用时间（秒）
const elapsedSeconds = ref(0);

// 剩余时间（秒）
const remainingSeconds = ref(0);

// 总时长（秒）
const totalSeconds = computed(() => {
  if (!currentWorkState.value) return 0;
  return (STATE_DURATIONS[currentWorkState.value] || 0) / 1000;
});

// 格式化时间显示
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// 开始时间
let startTime = 0;
let animationFrame: number | null = null;

// 更新进度
const updateProgress = () => {
  if (!currentWorkState.value || startTime === 0) return;

  const now = Date.now();
  const elapsed = now - startTime;
  const duration = STATE_DURATIONS[currentWorkState.value] || 0;

  if (duration > 0) {
    elapsedSeconds.value = Math.floor(elapsed / 1000);
    remainingSeconds.value = Math.max(
      0,
      Math.ceil((duration - elapsed) / 1000),
    );
    progress.value = Math.min(100, (elapsed / duration) * 100);
  }

  // 继续动画
  if (progress.value < 100) {
    animationFrame = requestAnimationFrame(updateProgress);
  }
};

// 监听状态变化
const startTracking = () => {
  if (currentWorkState.value) {
    startTime = Date.now();
    progress.value = 0;
    elapsedSeconds.value = 0;
    remainingSeconds.value = totalSeconds.value;
    updateProgress();
  }
};

// 停止追踪
const stopTracking = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  startTime = 0;
};

// 监听状态变化
onMounted(() => {
  if (currentWorkState.value) {
    startTracking();
  }
});

onBeforeUnmount(() => {
  stopTracking();
});

// 暴露方法供外部调用
defineExpose({
  startTracking,
  stopTracking,
});
</script>

<template>
  <div v-if="currentWorkState" class="work-progress-bar">
    <!-- 工作名称 -->
    <div class="work-title">
      <span class="work-icon">💼</span>
      <span class="work-name">{{ workNames[currentWorkState] }}</span>
    </div>

    <!-- 进度条 -->
    <div class="progress-container">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        <!-- 进度闪烁效果 -->
        <div
          class="progress-shine"
          :style="{ left: `${progress - 20}%` }"
        ></div>
      </div>
    </div>

    <!-- 时间信息 -->
    <div class="time-info">
      <span class="elapsed">{{ formatTime(elapsedSeconds) }}</span>
      <span class="separator">/</span>
      <span class="remaining">{{ formatTime(remainingSeconds) }}</span>
    </div>

    <!-- 完成百分比 -->
    <div class="percentage">{{ Math.floor(progress) }}%</div>
  </div>
</template>

<style scoped>
.work-progress-bar {
  position: absolute;
  bottom: -80px;
  left: 50%;
  transform: translateX(-50%);
  will-change: transform;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 12px;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  width: 120px;
}

/* 工作名称 */
.work-title {
  display: flex;
  align-items: center;
  gap: 4px;
}

.work-icon {
  font-size: 10px;
}

.work-name {
  font-size: 10px;
  font-weight: 600;
  color: #fbbf24;
  letter-spacing: 0.5px;
}

/* 进度条容器 */
.progress-container {
  width: 100%;
  padding: 2px 0;
}

.progress-track {
  position: relative;
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #fbbf24, #fcd34d);
  border-radius: 3px;
  transition: width 0.3s ease;
  position: relative;
}

/* 进度条闪烁效果 */
.progress-shine {
  position: absolute;
  top: 0;
  width: 40%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: shine-move 2s ease-in-out infinite;
}

@keyframes shine-move {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(300%);
  }
}

/* 时间信息 */
.time-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: "SF Mono", "Consolas", monospace;
  font-size: 9px;
}

.elapsed {
  color: #4ade80;
  font-weight: 600;
}

.separator {
  color: rgba(255, 255, 255, 0.4);
}

.remaining {
  color: #f87171;
  font-weight: 600;
}

/* 百分比 */
.percentage {
  font-size: 9px;
  font-weight: 700;
  color: #fbbf24;
  letter-spacing: 0.5px;
}
</style>
