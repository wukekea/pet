import type { WeatherType } from "@/components/DesktopPet/types";

/**
 * 和风天气代码映射表
 * 文档：https://dev.qweather.com/docs/resource/icons/
 */
export const WEATHER_CODE_MAPPING: Record<string, WeatherType> = {
  // ========== 晴天/多云（白天）==========
  "100": "sunny", // 晴
  "101": "cloudy", // 多云
  "102": "sunny", // 少云
  "103": "cloudy", // 晴间多云
  "104": "cloudy", // 阴

  // ========== 晴天/多云（夜间）==========
  "150": "sunny", // 晴
  "151": "cloudy", // 多云
  "152": "sunny", // 少云
  "153": "cloudy", // 晴间多云

  // ========== 降雨（白天）==========
  "300": "lightRain", // 阵雨
  "301": "heavyRain", // 强阵雨
  "302": "thunderstorm", // 雷阵雨
  "303": "thunderstorm", // 强雷阵雨
  "304": "thunderstorm", // 雷阵雨伴有冰雹
  "305": "lightRain", // 小雨
  "306": "heavyRain", // 中雨
  "307": "heavyRain", // 大雨
  "308": "heavyRain", // 极端降雨
  "309": "lightRain", // 毛毛雨/细雨
  "310": "heavyRain", // 暴雨
  "311": "heavyRain", // 大暴雨
  "312": "heavyRain", // 特大暴雨
  "313": "lightRain", // 冻雨
  "314": "lightRain", // 小到中雨
  "315": "heavyRain", // 中到大雨
  "316": "heavyRain", // 大到暴雨
  "317": "heavyRain", // 暴雨到大暴雨
  "318": "heavyRain", // 大暴雨到特大暴雨
  "399": "heavyRain", // 雨

  // ========== 降雨（夜间）==========
  "350": "lightRain", // 阵雨
  "351": "heavyRain", // 强阵雨

  // ========== 降雪（白天）==========
  "400": "lightSnow", // 小雪
  "401": "heavySnow", // 中雪
  "402": "heavySnow", // 大雪
  "403": "heavySnow", // 暴雪
  "404": "lightRain", // 雨夹雪
  "405": "lightSnow", // 雨雪天气
  "406": "lightSnow", // 阵雨夹雪
  "407": "heavySnow", // 阵雪
  "408": "lightSnow", // 小到中雪
  "409": "heavySnow", // 中到大雪
  "410": "heavySnow", // 大到暴雪
  "499": "heavySnow", // 雪

  // ========== 降雪（夜间）==========
  "456": "lightSnow", // 阵雨夹雪
  "457": "heavySnow", // 阵雪

  // ========== 恶劣天气 ==========
  "500": "default", // 薄雾
  "501": "default", // 雾
  "502": "default", // 霾
  "503": "default", // 扬沙
  "504": "default", // 浮尘
  "507": "default", // 沙尘暴
  "508": "default", // 强沙尘暴
  "509": "default", // 浓雾
  "510": "default", // 强浓雾
  "511": "default", // 中度霾
  "512": "default", // 重度霾
  "513": "default", // 严重霾
  "514": "default", // 大雾
  "515": "default", // 特强浓雾

  // ========== 其他 ==========
  "900": "heavyRain", // 热
  "901": "heavyRain", // 冷
  "999": "default", // 未知
};

/**
 * 将和风天气代码转换为项目天气类型
 */
export function mapWeatherCode(code: string): WeatherType {
  return WEATHER_CODE_MAPPING[code] ?? "default";
}
