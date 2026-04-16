import type { ScheduleConfig } from "../types";

// 默认作息配置
export const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  enabled: false, // 默认关闭，用户自行启用
  slots: [
    { startHour: 22, startMinute: 0, endHour: 7, endMinute: 0, state: "sleep" }, // 22:00-07:00 睡觉
    { startHour: 7, startMinute: 0, endHour: 22, endMinute: 0, state: "free" }, // 07:00-22:00 闲暇
  ],
};

const STORAGE_KEY = "pet-schedule-config";

// 保存作息配置到 localStorage
export function saveScheduleConfig(config: ScheduleConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("保存作息配置失败:", e);
  }
}

// 从 localStorage 加载作息配置
export function loadScheduleConfig(): ScheduleConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const config = JSON.parse(saved) as ScheduleConfig;
      // 验证配置格式
      if (typeof config.enabled === "boolean" && Array.isArray(config.slots)) {
        return config;
      }
    }
  } catch (e) {
    console.error("加载作息配置失败:", e);
  }
  return { ...DEFAULT_SCHEDULE_CONFIG };
}

// 重置作息配置
export function resetScheduleConfig(): ScheduleConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("重置作息配置失败:", e);
  }
  return { ...DEFAULT_SCHEDULE_CONFIG };
}
