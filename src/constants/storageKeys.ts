/**
 * localStorage 存储键集中定义
 * 全项目的 storage key 统一在此登记，避免散落各处导致拼写漂移。
 * 命名约定：pet- 前缀（宠物核心数据），服务类 key 用服务名前缀。
 */
export const STORAGE_KEYS = {
  /** 属性/金币/库存存档 */
  attributes: "pet-attributes",
  /** 宠物形态 */
  petShape: "pet-shape",
  /** 使用统计 */
  stats: "pet-stats-data",
  /** 作息配置 */
  schedule: "pet-schedule-config",
  /** 语音合成设置 */
  speech: "pet-speech-settings",
  /** 语音输入设置 */
  speechInput: "pet-speech-input-settings",
  /** 应用设置（行为/外观等） */
  settings: "pet-settings",
  /** 主题模式（浅色/深色/跟随系统） */
  themeMode: "pet-theme-mode",
  /** LLM 聊天配置 */
  llmConfig: "llm-config",
  /** 聊天历史 */
  chatHistory: "pet-chat-history",
  /** 和风天气 API Key */
  qweatherApiKey: "qweather-api-key",
  /** 和风天气 API Host */
  qweatherApiHost: "qweather-api-host",
  /** 和风天气服务状态缓存 */
  qweatherStatus: "qweather-status",
  /** 高德地图 Key（IP 定位） */
  amapKey: "amap-api-key",
} as const;
