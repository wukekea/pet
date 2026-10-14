import { ref, computed, watch } from "vue";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { setThemeMode, type ThemeMode } from "./theme";
import { speechEnabled, toggleSpeech } from "./speech";
import { llmConfig, type LLMConfig } from "./sharedState";
import { saveApiKey, saveApiHost, saveAmapKey } from "./qweatherStorage";

// 设置配置接口
export interface PetSettings {
  // 宠物行为
  autoStart: boolean;
  petSize: number;
  moveSpeed: number;
  autoSleep: boolean;
  // 外观
  theme: ThemeMode;
  opacity: number;
  showFootprints: boolean;
  // 语音
  voiceEnabled: boolean;
  // 交互
  clickReaction: boolean;
  dragSound: boolean;
}

// API 配置接口（接通真实存储：qweatherStorage / llmConfig，
// 不再作为 pet-settings 的一部分持久化，避免双源真相）
export interface ApiConfig {
  // 和风天气
  qweather: {
    key: string;
    host: string;
  };
  // 高德地图
  amap: {
    key: string;
  };
  // AI 对话（字段名与 LLMConfig 对齐）
  ai: {
    key: string;
    url: string;
    model: string;
    format: LLMConfig["requestFormat"];
  };
}

// 读取当前 API 配置（从各真实存储汇总，供设置面板展示）
export function loadApiConfig(): ApiConfig {
  return {
    qweather: {
      key: localStorage.getItem(STORAGE_KEYS.qweatherApiKey) ?? "",
      host:
        localStorage.getItem(STORAGE_KEYS.qweatherApiHost) ??
        "devapi.qweather.com",
    },
    amap: {
      key: localStorage.getItem(STORAGE_KEYS.amapKey) ?? "",
    },
    ai: {
      key: llmConfig.value.apiKey,
      url: llmConfig.value.baseURL,
      model: llmConfig.value.model,
      format: llmConfig.value.requestFormat,
    },
  };
}

// 保存 API 配置到各真实存储（天气/定位重启应用后生效）
export function saveApiConfig(config: ApiConfig): void {
  saveApiKey(config.qweather.key);
  saveApiHost(config.qweather.host);
  saveAmapKey(config.amap.key);
  llmConfig.value = {
    baseURL: config.ai.url,
    apiKey: config.ai.key,
    model: config.ai.model,
    requestFormat: config.ai.format,
  };
  localStorage.setItem(STORAGE_KEYS.llmConfig, JSON.stringify(llmConfig.value));
}

// 默认设置
const defaultSettings: PetSettings = {
  autoStart: false,
  petSize: 100,
  moveSpeed: 50,
  autoSleep: true,
  theme: "system",
  opacity: 100,
  showFootprints: true,
  voiceEnabled: true,
  clickReaction: true,
  dragSound: true,
};

// 设置状态
export const settings = ref<PetSettings>({ ...defaultSettings });

// 宠物大小像素值（基础大小 80px 的百分比）
// 逻辑层（碰撞/边界/脚印）也读取此值，与 CSS --pet-size 保持一致
export const petSizePixels = computed(() => {
  const baseSize = 80;
  return Math.round(baseSize * (settings.value.petSize / 100));
});

// 移动速度系数
export const moveSpeedFactor = computed(() => {
  // 将 20-100 映射到 0.5-2.0
  return 0.5 + (settings.value.moveSpeed / 100) * 1.5;
});

// 透明度值（0-1）
export const opacityValue = computed(() => {
  return settings.value.opacity / 100;
});

// 加载设置
export function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.settings);
    if (saved) {
      const parsed = JSON.parse(saved);
      // 旧版本曾把 apiConfig 存在 pet-settings 里（死配置），加载时剔除
      delete parsed.apiConfig;
      settings.value = { ...defaultSettings, ...parsed };
    }
  } catch (e) {
    console.error("[Settings] 加载设置失败，使用默认设置", e);
  }

  // 同步语音设置（与 updateSetting 的对称逻辑一致：双向对齐）
  if (settings.value.voiceEnabled !== speechEnabled.value) {
    toggleSpeech();
  }

  // 同步主题设置
  if (settings.value.theme) {
    setThemeMode(settings.value.theme);
  }
}

// 保存设置
export function saveSettings() {
  try {
    const dataToSave = JSON.parse(JSON.stringify(settings.value));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(dataToSave));
  } catch (e) {
    console.error("[Settings] 保存设置失败", e);
  }
}

// 更新单个设置项
export function updateSetting<K extends keyof PetSettings>(
  key: K,
  value: PetSettings[K],
) {
  settings.value[key] = value;
  saveSettings();

  // 同步到相关系统
  if (key === "theme") {
    setThemeMode(value as ThemeMode);
  } else if (key === "voiceEnabled") {
    if (value !== speechEnabled.value) {
      toggleSpeech();
    }
  }
}

// 页面加载时立即检查 localStorage（调试用）

// 重置设置
export function resetSettings() {
  settings.value = { ...defaultSettings };
  saveSettings();
  setThemeMode(defaultSettings.theme);
}

// 是否已初始化
let isSettingsInitialized = false;
let settingsWatcher: (() => void) | null = null;

// 重置初始化状态（用于开发模式热重载）
export function resetSettingsInit() {
  isSettingsInitialized = false;
  if (settingsWatcher) {
    settingsWatcher();
    settingsWatcher = null;
  }
}

// 初始化设置
export function initSettings() {
  // 开发模式下，如果页面重新加载，强制重新初始化
  if (isSettingsInitialized) {
    loadSettings();
    return;
  }

  isSettingsInitialized = true;

  // 先设置监听，再加载设置
  // 监听设置变化自动保存
  const unwatch = watch(
    settings,
    () => {
      saveSettings();
    },
    { deep: true },
  );
  settingsWatcher = unwatch;

  loadSettings();
}
