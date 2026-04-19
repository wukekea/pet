import { ref } from "vue";
import { setWeather } from "./weatherState";
import { mapWeatherCode } from "@/config/weatherCodeMapping";
import {
  loadApiKey,
  loadApiHost,
  loadAmapKey,
  hasApiKey,
  saveWeatherStatus,
  loadWeatherStatus,
} from "./qweatherStorage";
import type {
  QWeatherLocationResponse,
  QWeatherNowResponse,
  QWeatherStatus,
} from "@/types/qweather";

// 更新间隔：10 分钟
const UPDATE_INTERVAL = 10 * 60 * 1000;

// 天气服务状态
export const weatherStatus = ref<QWeatherStatus>({
  enabled: false,
  isLoading: false,
  lastUpdate: null,
  lastWeather: null,
  cityId: null,
  cityName: null,
  weatherText: null,
  weatherTemp: null,
  error: null,
  lastIpLocationDate: null,
});

// 定时器 ID
let updateTimerId: ReturnType<typeof setInterval> | null = null;

/**
 * 使用高德地图 IP 定位获取当前位置
 */
async function getIpLocation(): Promise<{ lat: number; lon: number } | null> {
  const amapKey = loadAmapKey();
  if (!amapKey) {
    console.error("未配置高德地图 Key");
    return null;
  }

  try {
    const data = await window.electronAPI!.fetchIpLocation(amapKey);

    if (!data.success) {
      console.error("IP 定位失败:", data.message);
      return null;
    }

    return { lat: data.lat!, lon: data.lon! };
  } catch (error) {
    console.error("IP 定位请求失败:", error);
    return null;
  }
}

/**
 * 通过坐标获取城市 ID
 */
async function fetchCityByLocation(
  lat: number,
  lon: number,
  apiKey: string,
  apiHost: string,
): Promise<string | null> {
  try {
    const data: QWeatherLocationResponse =
      await window.electronAPI!.fetchCityByLocation(lat, lon, apiKey, apiHost);

    if (data.code !== "200" || !data.location?.length) {
      console.error("城市查询失败:", data.code, data.message);
      return null;
    }

    const loc = data.location[0];
    weatherStatus.value.cityId = loc.id;
    weatherStatus.value.cityName = `${loc.adm2} ${loc.name}`.trim();

    return loc.id;
  } catch (error) {
    console.error("城市查询请求失败:", error);
    return null;
  }
}

/**
 * 获取实时天气
 */
async function fetchWeather(
  locationId: string,
  apiKey: string,
  apiHost: string,
) {
  try {
    const data: QWeatherNowResponse = await window.electronAPI!.fetchWeather(
      locationId,
      apiKey,
      apiHost,
    );

    if (data.code !== "200" || !data.now) {
      console.error("天气获取失败:", data.code, data.message);
      return null;
    }

    // 保存真实天气信息
    weatherStatus.value.weatherText = data.now.text;
    weatherStatus.value.weatherTemp = data.now.temp;

    return mapWeatherCode(data.now.icon);
  } catch (error) {
    console.error("天气请求失败:", error);
    return null;
  }
}

/**
 * 执行一次完整的天气更新
 */
async function performUpdate(): Promise<boolean> {
  const apiKey = loadApiKey();
  const apiHost = loadApiHost();

  if (!apiKey) {
    weatherStatus.value.error = "未配置 API Key";
    return false;
  }

  if (!window.electronAPI) {
    console.error("Electron API 不可用");
    weatherStatus.value.error = "Electron API 不可用";
    return false;
  }

  weatherStatus.value.isLoading = true;
  weatherStatus.value.error = null;

  try {
    // 1. 检查是否需要 IP 定位（启动时或每天一次）
    let cityId = weatherStatus.value.cityId;
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const needIpLocation =
      !weatherStatus.value.lastIpLocationDate ||
      weatherStatus.value.lastIpLocationDate !== today;

    if (needIpLocation) {
      const position = await getIpLocation();
      if (position) {
        // IP 定位成功，更新城市 ID
        cityId = await fetchCityByLocation(
          position.lat,
          position.lon,
          apiKey,
          apiHost,
        );
        if (cityId) {
          // 记录今天的 IP 定位日期
          weatherStatus.value.lastIpLocationDate = today;
        }
      } else if (!cityId) {
        // IP 定位失败且没有缓存的城市 ID
        weatherStatus.value.error = "IP 定位失败";
        return false;
      }
      // IP 定位失败但有缓存的城市 ID，继续使用缓存
    }

    if (!cityId) {
      weatherStatus.value.error = "城市查询失败";
      return false;
    }

    // 2. 获取天气
    const weather = await fetchWeather(cityId, apiKey, apiHost);
    if (!weather) {
      weatherStatus.value.error = "天气获取失败";
      return false;
    }

    // 3. 更新天气状态
    setWeather(weather);
    weatherStatus.value.lastWeather = weather;
    weatherStatus.value.lastUpdate = Date.now();

    // 4. 保存状态
    saveWeatherStatus({
      cityId: weatherStatus.value.cityId!,
      cityName: weatherStatus.value.cityName!,
      lastUpdate: weatherStatus.value.lastUpdate,
      lastIpLocationDate: weatherStatus.value.lastIpLocationDate,
    });

    return true;
  } finally {
    weatherStatus.value.isLoading = false;
  }
}

/**
 * 启动天气服务
 */
export function startWeatherService(): void {
  if (!hasApiKey()) {
    console.log("天气服务未启用：缺少 API Key");
    return;
  }

  if (!window.electronAPI) {
    console.log("天气服务未启用：Electron API 不可用");
    return;
  }

  // 恢复上次状态
  const savedStatus = loadWeatherStatus();
  if (savedStatus) {
    weatherStatus.value.cityId = savedStatus.cityId;
    weatherStatus.value.cityName = savedStatus.cityName;
    weatherStatus.value.lastUpdate = savedStatus.lastUpdate;
    weatherStatus.value.lastIpLocationDate = savedStatus.lastIpLocationDate;
  }

  weatherStatus.value.enabled = true;

  performUpdate().catch((error) => {
    console.error("天气更新失败:", error);
  });

  updateTimerId = setInterval(() => {
    performUpdate().catch((error) => {
      console.error("定时天气更新失败:", error);
    });
  }, UPDATE_INTERVAL);

  console.log("天气服务已启动");
}

/**
 * 停止天气服务
 */
export function stopWeatherService(): void {
  weatherStatus.value.enabled = false;

  if (updateTimerId) {
    clearInterval(updateTimerId);
    updateTimerId = null;
  }
}

/**
 * 手动刷新天气
 */
export async function refreshWeather(): Promise<boolean> {
  return performUpdate();
}

/**
 * 重新定位城市
 */
export async function relocateCity(): Promise<boolean> {
  weatherStatus.value.cityId = null;
  return performUpdate();
}

/**
 * 初始化天气服务
 */
export function initWeatherService(): void {
  if (!hasApiKey()) {
    return;
  }

  startWeatherService();
}

/**
 * 清理天气服务
 */
export function cleanupWeatherService(): void {
  stopWeatherService();
}
