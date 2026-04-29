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

// 食物类型
export type FoodType =
  | "apple"
  | "fish"
  | "cake"
  | "lollipop"
  | "riceBall"
  | "milk"
  | "steak";

// 沐浴露类型
export type BathType = "soap" | "showerGel" | "bathBall" | "petShampoo";

// 装饰类型
export type DecorationType =
  | "bow"
  | "scarf"
  | "wreath"
  | "topHat"
  | "sunglasses"
  | "crown"
  | "magicWand"
  | "medal";

// 装饰槽位 - 同槽位互斥
export type DecorationSlot = "head" | "face" | "neck" | "hand";

// 装饰效果类型
export type DecorationEffectType =
  | "staminaRecoverBonus" // 体力恢复加速
  | "satietyDecayReduction" // 饱腹衰减减缓
  | "healthRecoverBonus" // 健康恢复加速
  | "cleanlinessDecayReduction" // 清洁衰减减缓
  | "workIncomeBonus" // 打工收入增加
  | "workDurationReduction" // 打工时间缩短
  | "allDecayReduction"; // 全属性衰减减缓

// 装饰效果
export interface DecorationEffect {
  type: DecorationEffectType;
  value: number; // 百分比，如 0.15 = 15%
}

// 装饰效果汇总（各类型累加值）
export type DecorationEffects = Partial<Record<DecorationEffectType, number>>;

// 宠物形态类型
export type PetShape =
  | "cloud"
  | "cat"
  | "panda"
  | "rabbit"
  | "chick"
  | "dog"
  | "penguin";

// 颜色配置（支持深色/浅色主题）
export interface ShapeColors {
  body: { light: string; dark: string };
  bodyGradient: { light: string; dark: string };
  face: { light: string; dark: string };
  eyes: { light: string; dark: string };
  cheeks: { light: string; dark: string };
  shadow: { light: string; dark: string };
  footprint: { light: string; dark: string };
  angryFace?: string;
}

// 形态完整配置
export interface PetShapeConfig {
  name: PetShape;
  label: string;
  icon: string;
  colors: ShapeColors;
  // 是否有尾巴
  hasTail?: boolean;
  // 是否有胡须
  hasWhiskers?: boolean;
}

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
  ownedDecorations: string[]; // 已拥有的装饰列表
  equippedDecorations: string[]; // 当前装备的装饰列表
  foodInventory: Record<string, number>; // 食物库存 { type: count }
  bathInventory: Record<string, number>; // 沐浴露库存 { type: count }
  decorationInventory: Record<string, number>; // 装饰品库存 { type: count }
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
