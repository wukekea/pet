import { ref } from "vue";
import {
  loadStatsData,
  saveStatsData,
  updateStreak,
  resetStatsData,
  type StatsData,
} from "./statsStorage";
import { getTodayString } from "../utils/date";
import { createDebouncedSave } from "../utils/debouncedSave";

// 全局统计数据状态
const statsData = ref<StatsData>(loadStatsData());

// 防抖保存
const { save: debouncedSave, flush: flushSave } = createDebouncedSave(() =>
  saveStatsData(statsData.value),
);

// 当前日期（用于跨午夜检测）
let currentDate = getTodayString();

function checkDateRollover(): void {
  const today = getTodayString();
  if (today !== currentDate) {
    currentDate = today;
    statsData.value = updateStreak(statsData.value);
  }
}

// 初始化统计
export function initStats() {
  // 更新连续使用天数
  statsData.value = updateStreak(statsData.value);
  // 增加启动次数
  statsData.value.launchCount += 1;
  saveStatsData(statsData.value);
}

// 清理统计
export function cleanupStats() {
  // 立即保存所有待保存的数据
  flushSave();
}

// 每秒调用一次（由 attributes 的 tick 驱动，避免重复定时器）
export function tickStats(): void {
  checkDateRollover();
  statsData.value.totalDuration += 1;
  statsData.value.todayDuration += 1;
  // 每 60 秒触发一次防抖保存（替代直接写入，避免每分钟同步 I/O 阻塞主线程）
  if (statsData.value.totalDuration % 60 === 0) {
    debouncedSave();
  }
}

// 记录点击互动
export function recordClick() {
  statsData.value.interactions.click += 1;
  debouncedSave();
}

// 记录双击互动
export function recordDoubleClick() {
  statsData.value.interactions.doubleClick += 1;
  debouncedSave();
}

// 记录拖拽互动
export function recordDrag() {
  statsData.value.interactions.drag += 1;
  debouncedSave();
}

// 记录状态触发
export function recordState(state: string) {
  if (!statsData.value.stateCounts[state]) {
    statsData.value.stateCounts[state] = 0;
  }
  statsData.value.stateCounts[state] += 1;
  debouncedSave();
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
