import { ref, computed, watch } from "vue";
import { setThemeMode, type ThemeMode } from "./theme";
import {
  speechEnabled,
  speechEngine,
  speechRate,
  speechPitch,
  speechVolume,
  toggleSpeech,
} from "./speech";

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
  // API 配置
  apiConfig: {
    // 和风天气
    qweather: {
      key: string;
      host: string;
    };
    // 高德地图
    amap: {
      key: string;
    };
    // AI 对话
    ai: {
      key: string;
      url: string;
      model: string;
      format: "openai" | "anthropic" | "gemini" | "custom";
    };
  };
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
  apiConfig: {
    qweather: {
      key: "",
      host: "https://devapi.qweather.com",
    },
    amap: {
      key: "",
    },
    ai: {
      key: "",
      url: "",
      model: "",
      format: "openai" as const,
    },
  },
};

// 设置状态
export const settings = ref<PetSettings>({ ...defaultSettings });

// 宠物大小像素值（基础大小 80px 的百分比）
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
  console.log("[Settings] 开始加载设置...");
  try {
    const saved = localStorage.getItem("pet-settings");
    console.log("[Settings] localStorage 原始数据:", saved);
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log("[Settings] 解析后的数据:", parsed);
      settings.value = { ...defaultSettings, ...parsed };
      console.log(
        "[Settings] 已加载设置:",
        JSON.parse(JSON.stringify(settings.value)),
      );
    } else {
      console.log(
        "[Settings] 没有找到保存的设置，使用默认设置:",
        defaultSettings,
      );
    }
  } catch (e) {
    console.error("[Settings] 加载设置失败，使用默认设置", e);
  }

  // 同步语音设置
  if (settings.value.voiceEnabled !== speechEnabled.value) {
    // 如果设置中开启但当前未开启，则开启
    if (settings.value.voiceEnabled) {
      toggleSpeech();
    }
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
    localStorage.setItem("pet-settings", JSON.stringify(dataToSave));
    console.log("[Settings] 已保存设置:", dataToSave);
    // 验证保存是否成功
    const verify = localStorage.getItem("pet-settings");
    console.log("[Settings] 验证保存结果:", verify);
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
console.log(
  "[Settings] 模块加载，检查 localStorage:",
  typeof window !== "undefined" ? localStorage.getItem("pet-settings") : "N/A",
);

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
  console.log(
    "[Settings] initSettings 被调用, isSettingsInitialized:",
    isSettingsInitialized,
  );

  // 开发模式下，如果页面重新加载，强制重新初始化
  if (isSettingsInitialized) {
    console.log("[Settings] 设置已初始化，但强制重新加载设置");
    loadSettings();
    return;
  }

  isSettingsInitialized = true;

  // 先设置监听，再加载设置
  // 监听设置变化自动保存
  const unwatch = watch(
    settings,
    (newVal, oldVal) => {
      console.log("[Settings] 设置发生变化:", oldVal, "->", newVal);
      saveSettings();
    },
    { deep: true },
  );
  settingsWatcher = unwatch;

  loadSettings();
}

// 从设置组件同步语音设置
export function syncSpeechSettings() {
  // 监听语音相关状态的变化
  watch(speechEnabled, (val) => {
    if (settings.value.voiceEnabled !== val) {
      settings.value.voiceEnabled = val;
    }
  });

  watch(speechEngine, () => {
    // 语音引擎变化时保存
    saveSettings();
  });

  watch([speechRate, speechPitch, speechVolume], () => {
    // 语音参数变化时保存
    saveSettings();
  });
}
