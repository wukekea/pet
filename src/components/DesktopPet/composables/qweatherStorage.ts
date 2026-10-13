import { STORAGE_KEYS } from "@/constants/storageKeys";

const API_KEY_STORAGE_KEY = STORAGE_KEYS.qweatherApiKey;
const API_HOST_STORAGE_KEY = STORAGE_KEYS.qweatherApiHost;
const AMAP_KEY_STORAGE_KEY = STORAGE_KEYS.amapKey;
const WEATHER_STATUS_KEY = STORAGE_KEYS.qweatherStatus;

/**
 * 保存 API Key（设置面板写入）
 */
export function saveApiKey(key: string): void {
  try {
    if (key) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
    } else {
      // 空值视为清除配置
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch (e) {
    console.error("保存 API Key 失败:", e);
  }
}

/**
 * 保存 API Host（设置面板写入）
 * 兼容带协议的输入：去除 https:// 前缀只保留域名
 */
export function saveApiHost(host: string): void {
  try {
    const normalized = host
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    if (normalized) {
      localStorage.setItem(API_HOST_STORAGE_KEY, normalized);
    } else {
      localStorage.removeItem(API_HOST_STORAGE_KEY);
    }
  } catch (e) {
    console.error("保存 API Host 失败:", e);
  }
}

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
 * 优先级：localStorage（设置面板写入）> 环境变量
 */
export function loadAmapKey(): string | null {
  try {
    const saved = localStorage.getItem(AMAP_KEY_STORAGE_KEY);
    if (saved) return saved;
    return import.meta.env.VITE_AMAP_KEY || null;
  } catch (e) {
    console.error("加载高德 Key 失败:", e);
    return null;
  }
}

/**
 * 保存高德地图 Key（设置面板写入）
 */
export function saveAmapKey(key: string): void {
  try {
    if (key) {
      localStorage.setItem(AMAP_KEY_STORAGE_KEY, key);
    } else {
      localStorage.removeItem(AMAP_KEY_STORAGE_KEY);
    }
  } catch (e) {
    console.error("保存高德 Key 失败:", e);
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
