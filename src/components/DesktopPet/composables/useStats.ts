import { ref, onMounted, onBeforeUnmount } from "vue";
import {
  loadStatsData,
  saveStatsData,
  updateStreak,
  resetStatsData,
  type StatsData,
} from "./useStatsStorage";

// 全局统计数据状态
const statsData = ref<StatsData>(loadStatsData());

// 计时器 ID
let durationTimer: ReturnType<typeof setInterval> | null = null;

// 初始化统计
export function initStats() {
  // 更新连续使用天数
  statsData.value = updateStreak(statsData.value);
  // 增加启动次数
  statsData.value.launchCount += 1;
  saveStatsData(statsData.value);

  // 开始计时
  startDurationTimer();
}

// 清理统计
export function cleanupStats() {
  stopDurationTimer();
  // 保存最终数据
  saveStatsData(statsData.value);
}

// 开始陪伴时长计时
function startDurationTimer() {
  if (durationTimer) return;

  durationTimer = setInterval(() => {
    statsData.value.totalDuration += 1;
    statsData.value.todayDuration += 1;
    // 每 60 秒保存一次
    if (statsData.value.totalDuration % 60 === 0) {
      saveStatsData(statsData.value);
    }
  }, 1000);
}

// 停止计时
function stopDurationTimer() {
  if (durationTimer) {
    clearInterval(durationTimer);
    durationTimer = null;
  }
}

// 记录点击互动
export function recordClick() {
  statsData.value.interactions.click += 1;
  saveStatsData(statsData.value);
}

// 记录双击互动
export function recordDoubleClick() {
  statsData.value.interactions.doubleClick += 1;
  saveStatsData(statsData.value);
}

// 记录拖拽互动
export function recordDrag() {
  statsData.value.interactions.drag += 1;
  saveStatsData(statsData.value);
}

// 记录状态触发
export function recordState(state: string) {
  if (!statsData.value.stateCounts[state]) {
    statsData.value.stateCounts[state] = 0;
  }
  statsData.value.stateCounts[state] += 1;
  saveStatsData(statsData.value);
}

// 获取统计数据
export function getStatsData() {
  return statsData.value;
}

// 获取响应式统计数据
export function useStatsRef() {
  return statsData;
}

// 重置统计数据
export function resetStats() {
  statsData.value = resetStatsData();
}

// 组合式函数
export function useStats() {
  onMounted(() => {
    initStats();
  });

  onBeforeUnmount(() => {
    cleanupStats();
  });

  return {
    statsData,
    recordClick,
    recordDoubleClick,
    recordDrag,
    recordState,
    getStatsData,
    resetStats,
  };
}
