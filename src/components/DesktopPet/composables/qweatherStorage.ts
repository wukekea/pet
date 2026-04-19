const API_KEY_STORAGE_KEY = "qweather-api-key";
const API_HOST_STORAGE_KEY = "qweather-api-host";
const WEATHER_STATUS_KEY = "qweather-status";

/**
 * 加载 API Key
 */
export function loadApiKey(): string | null {
  try {
    // 优先从 localStorage 获取
    const saved = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (saved) {
      console.log("从 localStorage 加载 API Key");
      return saved;
    }

    // 回退到环境变量（开发环境）
    const envKey = import.meta.env.VITE_QWEATHER_API_KEY;
    if (envKey) {
      console.log("从环境变量加载 API Key");
      return envKey;
    }

    console.log("未找到 API Key");
    return null;
  } catch (e) {
    console.error("加载 API Key 失败:", e);
    return null;
  }
}

/**
 * 检查 API Key 是否已配置
 */
export function hasApiKey(): boolean {
  return !!loadApiKey();
}

/**
 * 加载 API Host
 * 优先级：localStorage > 环境变量
 */
export function loadApiHost(): string {
  try {
    // 优先从 localStorage 获取
    const saved = localStorage.getItem(API_HOST_STORAGE_KEY);
    if (saved) return saved;

    // 回退到环境变量
    return import.meta.env.VITE_QWEATHER_API_HOST || "devapi.qweather.com";
  } catch (e) {
    console.error("加载 API Host 失败:", e);
    return "devapi.qweather.com";
  }
}

/**
 * 加载高德地图 Key（用于 IP 定位）
 */
export function loadAmapKey(): string | null {
  try {
    return import.meta.env.VITE_AMAP_KEY || null;
  } catch (e) {
    console.error("加载高德 Key 失败:", e);
    return null;
  }
}

/**
 * 保存天气服务状态（用于恢复）
 */
export function saveWeatherStatus(status: {
  cityId: string;
  cityName: string;
  lastUpdate: number;
  lastIpLocationDate: string | null;
}): void {
  try {
    localStorage.setItem(WEATHER_STATUS_KEY, JSON.stringify(status));
  } catch (e) {
    console.error("保存天气状态失败:", e);
  }
}

/**
 * 加载天气服务状态
 */
export function loadWeatherStatus(): {
  cityId: string | null;
  cityName: string | null;
  lastUpdate: number | null;
  lastIpLocationDate: string | null;
} | null {
  try {
    const saved = localStorage.getItem(WEATHER_STATUS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("加载天气状态失败:", e);
  }
  return null;
}
