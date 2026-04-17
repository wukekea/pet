import { ref } from "vue";
import type { WeatherType } from "../types";

// 当前天气状态
export const currentWeather = ref<WeatherType>("default");

// 天气切换过渡状态（退场动画进行中）
export const isWeatherChanging = ref(false);

// 设置天气
export function setWeather(weather: WeatherType) {
  currentWeather.value = weather;
}

// 获取天气
export function getWeather(): WeatherType {
  return currentWeather.value;
}
