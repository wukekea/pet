/** 和风天气 API 通用响应结构 */
export interface QWeatherBaseResponse {
  code: string; // 状态码，200 表示成功
  message?: string; // 错误信息
}

/** 城市查询响应 */
export interface QWeatherLocationResponse extends QWeatherBaseResponse {
  location?: Array<{
    id: string; // 城市 ID
    name: string; // 城市名称
    adm1: string; // 上级行政区（省/州）
    adm2: string; // 上级行政区（市）
  }>;
}

/** 实时天气响应 */
export interface QWeatherNowResponse extends QWeatherBaseResponse {
  now?: {
    obsTime: string; // 观测时间
    temp: string; // 温度
    icon: string; // 天气图标代码
    text: string; // 天气文字描述
    windDir: string; // 风向
    windScale: string; // 风力等级
    humidity: string; // 湿度
  };
  refer?: {
    sources: string[];
    license: string[];
  };
}

/** 天气服务状态 */
export interface QWeatherStatus {
  enabled: boolean; // 是否启用天气服务
  isLoading: boolean; // 是否正在加载
  lastUpdate: number | null; // 上次更新时间戳
  lastWeather: string | null; // 上次成功的天气代码
  cityId: string | null; // 当前城市 ID
  cityName: string | null; // 当前城市名称
  weatherText: string | null; // 真实天气描述（如"霾"）
  weatherTemp: string | null; // 真实温度（如"21"）
  error: string | null; // 错误信息
}
