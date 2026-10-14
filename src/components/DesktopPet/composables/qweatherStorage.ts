import { STORAGE_KEYS } from "@/constants/storageKeys";
import { createLocalStorage } from "../utils/storage";

const API_KEY_STORAGE_KEY = STORAGE_KEYS.qweatherApiKey;
const API_HOST_STORAGE_KEY = STORAGE_KEYS.qweatherApiHost;
const AMAP_KEY_STORAGE_KEY = STORAGE_KEYS.amapKey;
const WEATHER_STATUS_KEY = STORAGE_KEYS.qweatherStatus;

// 天气服务状态（用于恢复）
interface WeatherStatusCache {
  cityId: string | null;
  cityName: string | null;
  lastUpdate: number | null;
  lastIpLocationDate: string | null;
}

const weatherStatusStorage = createLocalStorage<WeatherStatusCache>(
  WEATHER_STATUS_KEY,
  {
    cityId: null,
    cityName: null,
    lastUpdate: null,
    lastIpLocationDate: null,
  },
  (data): data is WeatherStatusCache =>
    typeof data === "object" && data !== null && "cityId" in data,
);

/**
 * 保存 API Key（设置面板写入）
 * 空值视为清除配置
 */
export function saveApiKey(key: string): void {
  if (key) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

/**
 * 保存 API Host（设置面板写入）
 * 兼容带协议的输入：去除 https:// 前缀只保留域名
 */
export function saveApiHost(host: string): void {
  const normalized = host
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  if (normalized) {
    localStorage.setItem(API_HOST_STORAGE_KEY, normalized);
  } else {
    localStorage.removeItem(API_HOST_STORAGE_KEY);
  }
}

/**
 * 加载 API Key
 * 优先级：localStorage > 环境变量（开发环境）
 */
export function loadApiKey(): string | null {
  const saved = localStorage.getItem(API_KEY_STORAGE_KEY);
  if (saved) return saved;
  return import.meta.env.VITE_QWEATHER_API_KEY || null;
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
  const saved = localStorage.getItem(API_HOST_STORAGE_KEY);
  if (saved) return saved;
  return import.meta.env.VITE_QWEATHER_API_HOST || "devapi.qweather.com";
}

/**
 * 加载高德地图 Key（用于 IP 定位）
 * 优先级：localStorage（设置面板写入）> 环境变量
 */
export function loadAmapKey(): string | null {
  const saved = localStorage.getItem(AMAP_KEY_STORAGE_KEY);
  if (saved) return saved;
  return import.meta.env.VITE_AMAP_KEY || null;
}

/**
 * 保存高德地图 Key（设置面板写入）
 * 空值视为清除配置
 */
export function saveAmapKey(key: string): void {
  if (key) {
    localStorage.setItem(AMAP_KEY_STORAGE_KEY, key);
  } else {
    localStorage.removeItem(AMAP_KEY_STORAGE_KEY);
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
  weatherStatusStorage.save(status);
}

/**
 * 加载天气服务状态（从未保存过返回 null）
 */
export function loadWeatherStatus(): WeatherStatusCache | null {
  const saved = localStorage.getItem(WEATHER_STATUS_KEY);
  if (!saved) return null;
  return weatherStatusStorage.load();
}
