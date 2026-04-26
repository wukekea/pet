import type { ScheduleConfig } from "../types";
import { createLocalStorage } from "../utils/storage";

// 默认作息配置
export const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  enabled: false, // 默认关闭，用户自行启用
  slots: [
    { startHour: 22, startMinute: 0, endHour: 7, endMinute: 0, state: "sleep" }, // 22:00-07:00 睡觉
    { startHour: 7, startMinute: 0, endHour: 22, endMinute: 0, state: "free" }, // 07:00-22:00 闲暇
  ],
};

const scheduleStorage = createLocalStorage<ScheduleConfig>(
  "pet-schedule-config",
  DEFAULT_SCHEDULE_CONFIG,
  (data): data is ScheduleConfig =>
    typeof (data as ScheduleConfig).enabled === "boolean" &&
    Array.isArray((data as ScheduleConfig).slots),
);

// 保存作息配置到 localStorage
export function saveScheduleConfig(config: ScheduleConfig): void {
  scheduleStorage.save(config);
}

// 从 localStorage 加载作息配置
export function loadScheduleConfig(): ScheduleConfig {
  return scheduleStorage.load();
}

// 重置作息配置
export function resetScheduleConfig(): ScheduleConfig {
  return scheduleStorage.reset();
}
