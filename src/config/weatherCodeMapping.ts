import type { WeatherType } from "@/components/DesktopPet/types";

/**
 * 和风天气代码映射表
 * 文档：https://dev.qweather.com/docs/resource/icons/
 *
 * 和风天气代码分类：
 * 100-102：晴
 * 103-104：多云/阴
 * 300-313：雨
 * 400-410：雪
 * 500-515：恶劣天气（雾、霾、沙尘等）
 */
export const WEATHER_CODE_MAPPING: Record<string, WeatherType> = {
  // 晴天
  "100": "sunny", // 晴
  "101": "sunny", // 多云
  "102": "sunny", // 少云
  "103": "cloudy", // 晴间多云
  "104": "cloudy", // 阴

  // 夜间天气（映射逻辑相同）
  "150": "sunny", // 晴（夜间）
  "151": "cloudy", // 多云（夜间）
  "152": "sunny", // 少云（夜间）
  "153": "cloudy", // 晴间多云（夜间）

  // 降雨
  "300": "lightRain", // 阵雨
  "301": "heavyRain", // 强阵雨
  "302": "thunderstorm", // 雷阵雨
  "303": "thunderstorm", // 强雷阵雨
  "304": "thunderstorm", // 雷阵雨伴有冰雹
  "305": "lightRain", // 小雨
  "306": "heavyRain", // 中雨
  "307": "heavyRain", // 大雨
  "308": "heavyRain", // 极端降雨
  "309": "heavyRain", // 暴雨
  "310": "heavyRain", // 大暴雨
  "311": "heavyRain", // 特大暴雨
  "312": "heavyRain", // 强阵雨
  "313": "lightRain", // 冻雨

  // 降雪
  "400": "lightSnow", // 小雪
  "401": "heavySnow", // 中雪
  "402": "heavySnow", // 大雪
  "403": "heavySnow", // 暴雪
  "404": "lightRain", // 雨夹雪（当作小雨处理）
  "405": "lightSnow", // 雨雪天气
  "406": "lightSnow", // 阵雨夹雪
  "407": "heavySnow", // 阵雪
  "408": "lightSnow", // 小到中雪
  "409": "heavySnow", // 中到大雪
  "410": "heavySnow", // 大到暴雪

  // 恶劣天气 - 回退到默认
  "500": "default", // 薄雾
  "501": "default", // 雾
  "502": "default", // 霾
  "503": "default", // 扬沙
  "504": "default", // 浮尘
  "505": "default", // 沙尘暴
  "506": "default", // 强沙尘暴
  "507": "default", // 浓雾
  "508": "default", // 特强浓雾
  "509": "default", // 中霾
  "510": "default", // 重霾
  "511": "default", // 特强霾
  "512": "default", // 浓雾
  "513": "default", // 特强浓雾
  "514": "default", // 中霾
  "515": "default", // 重霾

  // 热带气旋（台风等）
  "900": "heavyRain", // 热
  "901": "heavyRain", // 冷
  "902": "heavyRain", // 未知
};

/**
 * 将和风天气代码转换为项目天气类型
 */
export function mapWeatherCode(code: string): WeatherType {
  return WEATHER_CODE_MAPPING[code] ?? "default";
}
