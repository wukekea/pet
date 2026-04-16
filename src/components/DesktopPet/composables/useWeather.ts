import { ref } from "vue";
import type { WeatherType } from "../types";

// 当前天气状态
export const currentWeather = ref<WeatherType>("sunny");

// 设置天气
export function setWeather(weather: WeatherType) {
  currentWeather.value = weather;
}

// 获取天气
export function getWeather(): WeatherType {
  return currentWeather.value;
}
