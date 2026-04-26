import type { StatsData } from "../types";
import { getTodayString } from "../utils/date";
import { createLocalStorage } from "../utils/storage";

// 导出 StatsData 类型供其他模块使用
export type { StatsData };

// 默认统计数据
export const DEFAULT_STATS_DATA: StatsData = {
  startDate: new Date().toISOString(),
  lastActiveDate: getTodayString(),
  streakDays: 1,
  totalDuration: 0,
  todayDuration: 0,
  launchCount: 1,
  interactions: {
    click: 0,
    doubleClick: 0,
    drag: 0,
  },
  stateCounts: {},
};

const statsStorage = createLocalStorage<StatsData>(
  "pet-stats-data",
  DEFAULT_STATS_DATA,
  (data): data is StatsData =>
    !!(data as StatsData).startDate &&
    typeof (data as StatsData).totalDuration === "number",
);

// 保存统计数据到 localStorage
export function saveStatsData(data: StatsData): void {
  statsStorage.save(data);
}

// 从 localStorage 加载统计数据
export function loadStatsData(): StatsData {
  return statsStorage.load();
}

// 更新连续使用天数
export function updateStreak(data: StatsData): StatsData {
  const today = getTodayString();
  const lastActive = data.lastActiveDate;

  if (lastActive === today) {
    // 同一天，不更新
    return data;
  }

  const diff = getDaysDiff(lastActive, today);

  if (diff === 1) {
    // 连续使用
    data.streakDays += 1;
  } else if (diff > 1) {
    // 断签，重置为 1
    data.streakDays = 1;
  }

  // 更新最后活跃日期，重置今日时长
  data.lastActiveDate = today;
  data.todayDuration = 0;

  return data;
}

// 重置统计数据
export function resetStatsData(): StatsData {
  return statsStorage.reset();
}

// 计算两个日期之间的天数差
function getDaysDiff(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// 格式化时长显示
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} 秒`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} 分钟`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (minutes > 0) {
      return `${hours} 小时 ${minutes} 分`;
    }
    return `${hours} 小时`;
  }
}

// 获取统计天数
export function getStatsDays(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = now.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}
