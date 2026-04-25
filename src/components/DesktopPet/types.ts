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
  | "dancing"
  | "rolling"
  | "yawn"
  | "sleepy"
  | "stretch"
  | "sleepwalking"
  | "bathing"
  | "eating"
  | "brickCarrying"
  | "flyerDistributing"
  | "programmer";

// 宠物朝向：front(正面), left(左转), right(右转), back(背面)
export type PetDirection = "front" | "left" | "right" | "back";

export interface PetPosition {
  x: number;
  y: number;
}

// 脚印数据接口
// 脚印类型
export type FootprintType = "default" | "snow" | "water";

export interface Footprint {
  id: number;
  x: number;
  y: number;
  isLeft: boolean;
  direction: PetDirection;
  createdAt: number;
  type: FootprintType;
}

// 作息状态类型
export type ScheduleState = "free" | "sleep" | "work";

// 时间段配置
export interface TimeSlot {
  startHour: number; // 开始小时（0-23）
  startMinute: number; // 开始分钟（0-59）
  endHour: number; // 结束小时（0-23）
  endMinute: number; // 结束分钟（0-59）
  state: ScheduleState; // 状态：free（闲暇）、sleep（睡觉）或 work（工作）
}

// 作息配置
export interface ScheduleConfig {
  enabled: boolean; // 是否启用作息功能
  slots: TimeSlot[]; // 时间段配置列表
}

// 天气类型
export type WeatherType =
  | "default" // 默认（无特效）
  | "sunny" // 晴天
  | "cloudy" // 多云
  | "lightRain" // 小雨
  | "heavyRain" // 暴雨
  | "thunderstorm" // 雷阵雨
  | "lightSnow" // 小雪
  | "heavySnow"; // 大雪

// 属性数据接口
export interface AttributeData {
  satiety: number; // 饱腹值
  cleanliness: number; // 清洁值
  stamina: number; // 体力值
  health: number; // 健康值
  money: number; // 金币
  level: number; // 等级
  experience: number; // 当前经验值
  dailyInteractionExp: number; // 今日交互经验累计
  dailyInteractionExpDate: string; // 今日交互经验日期（YYYY-MM-DD）
  dailyAllowanceClaimed: string; // 上次领取救济金日期（YYYY-MM-DD）
  lastUpdateTimestamp: number; // 上次更新时间戳（毫秒）
}

// 统计数据接口
export interface StatsData {
  // 统计开始日期（ISO 格式）
  startDate: string;
  // 最后活跃日期（YYYY-MM-DD）
  lastActiveDate: string;
  // 连续使用天数
  streakDays: number;
  // 总陪伴时长（秒）
  totalDuration: number;
  // 今日陪伴时长（秒）
  todayDuration: number;
  // 应用启动次数
  launchCount: number;
  // 互动次数
  interactions: {
    click: number; // 点击次数
    doubleClick: number; // 双击次数
    drag: number; // 拖拽次数
  };
  // 各状态触发次数
  stateCounts: Record<string, number>;
}

// Electron API 类型声明
declare global {
  interface Window {
    electronAPI?: {
      setIgnoreMouseEvents: (ignore: boolean) => void;
      getScreenSize: () => Promise<{ width: number; height: number }>;
      fetchIpLocation: (amapKey: string) => Promise<{
        success: boolean;
        lat?: number;
        lon?: number;
        city?: string;
        message?: string;
      }>;
      fetchCityByLocation: (
        lat: number,
        lon: number,
        apiKey: string,
        apiHost: string,
      ) => Promise<{
        code: string;
        message?: string;
        location?: Array<{
          id: string;
          name: string;
          adm1: string;
          adm2: string;
        }>;
      }>;
      fetchWeather: (
        locationId: string,
        apiKey: string,
        apiHost: string,
      ) => Promise<{
        code: string;
        message?: string;
        now?: {
          obsTime: string;
          temp: string;
          icon: string;
          text: string;
          windDir: string;
          windScale: string;
          humidity: string;
        };
      }>;
    };
  }
}
