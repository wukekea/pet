import { ref } from "vue";
import {
  loadStatsData,
  saveStatsData,
  updateStreak,
  resetStatsData,
  type StatsData,
} from "./statsStorage";

// 全局统计数据状态
const statsData = ref<StatsData>(loadStatsData());

// 计时器 ID
let durationTimer: ReturnType<typeof setInterval> | null = null;

// 防抖保存定时器
let saveTimer: ReturnType<typeof setTimeout> | null = null;
// 是否有待保存的数据
let hasPendingSave = false;

// 当前日期（用于跨午夜检测）
let currentDate = getTodayDateString();

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// 跨午夜检查：重置今日数据
function checkDateRollover(): void {
  const today = getTodayDateString();
  if (today !== currentDate) {
    currentDate = today;
    statsData.value = updateStreak(statsData.value);
  }
}

// 防抖保存 - 延迟 2 秒后保存，期间有新变化会重置定时器
function debouncedSave() {
  hasPendingSave = true;
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(() => {
    if (hasPendingSave) {
      saveStatsData(statsData.value);
      hasPendingSave = false;
    }
  }, 2000);
}

// 立即保存（用于关键时机）
function flushSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (hasPendingSave) {
    saveStatsData(statsData.value);
    hasPendingSave = false;
  }
}

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
  // 立即保存所有待保存的数据
  flushSave();
}

// 开始陪伴时长计时
function startDurationTimer() {
  if (durationTimer) return;

  durationTimer = setInterval(() => {
    // 跨午夜检查
    checkDateRollover();
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
