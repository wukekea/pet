// 宠物状态类型
export type PetState =
  | "idle"
  | "walking"
  | "jumping"
  | "sleeping"
  | "happy"
  | "crying"
  | "angry"
  | "fallen"
  | "scared"
  | "thinking"
  | "smug"
  | "shy"
  | "confused"
  | "hello"
  | "sneeze"
  | "grin"
  | "scratch"
  | "celebrate"
  | "peek"
  | "chase"
  | "hide"
  | "dancing"
  | "rolling"
  | "yawn"
  | "sleepy"
  | "stretch"
  | "sleepwalking";

// 宠物朝向：front(正面), left(左转), right(右转), back(背面)
export type PetDirection = "front" | "left" | "right" | "back";

export interface PetPosition {
  x: number;
  y: number;
}

// 脚印数据接口
export interface Footprint {
  id: number;
  x: number;
  y: number;
  isLeft: boolean;
  direction: PetDirection;
  createdAt: number;
}

// 作息状态类型
export type ScheduleState = "free" | "sleep";

// 时间段配置
export interface TimeSlot {
  startHour: number; // 开始小时（0-23）
  startMinute: number; // 开始分钟（0-59）
  endHour: number; // 结束小时（0-23）
  endMinute: number; // 结束分钟（0-59）
  state: ScheduleState; // 状态：free（闲暇）或 sleep（睡觉）
}

// 作息配置
export interface ScheduleConfig {
  enabled: boolean; // 是否启用作息功能
  slots: TimeSlot[]; // 时间段配置列表
}

// 天气类型
export type WeatherType =
  | "sunny" // 晴天
  | "cloudy" // 多云
  | "lightRain" // 小雨
  | "heavyRain" // 暴雨
  | "thunderstorm" // 雷阵雨
  | "lightSnow" // 小雪
  | "heavySnow"; // 大雪

// Electron API 类型声明
declare global {
  interface Window {
    electronAPI?: {
      setIgnoreMouseEvents: (ignore: boolean) => void;
      getScreenSize: () => Promise<{ width: number; height: number }>;
    };
  }
}
