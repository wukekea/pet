import { ref } from "vue";
import { STORAGE_KEYS } from "@/constants/storageKeys";

// 主题模式类型
export type ThemeMode = "system" | "light" | "dark";

// 清理函数引用
let themeCleanupFn: (() => void) | null = null;

// 当前主题模式（默认跟随系统）
export const themeMode = ref<ThemeMode>("system");

// 当前是否为深色模式 - 初始化时立即检测系统主题
export const isDark = ref(
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false,
);

// 检测系统主题
export function checkSystemTheme() {
  isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// 根据主题模式更新 isDark
export function updateTheme() {
  if (themeMode.value === "system") {
    checkSystemTheme();
  } else {
    isDark.value = themeMode.value === "dark";
  }
}

// 切换主题模式
export function setThemeMode(mode: ThemeMode) {
  themeMode.value = mode;
  updateTheme();
  // 保存到 localStorage
  localStorage.setItem(STORAGE_KEYS.themeMode, mode);
}

// 切换深色/浅色（便捷方法）
export function toggleDarkMode() {
  setThemeMode(isDark.value ? "light" : "dark");
}

// 清理主题监听
export function cleanupTheme(): void {
  if (themeCleanupFn) {
    themeCleanupFn();
    themeCleanupFn = null;
  }
}

// 初始化主题
// 主题真相在 pet-settings.theme（由 settings.ts 加载）；
// pet-theme-mode 是旧版 key，仅在 settings 未存时作一次性迁移回退
export function initTheme() {
  // 清理之前的监听
  cleanupTheme();

  // 优先从新的设置存储中读取
  const savedSettings = localStorage.getItem(STORAGE_KEYS.settings);
  let restored = false;
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      if (parsed.theme && ["system", "light", "dark"].includes(parsed.theme)) {
        themeMode.value = parsed.theme;
        restored = true;
      }
    } catch {
      // 解析失败，走旧格式回退
    }
  }
  if (!restored) {
    // 兼容旧格式
    const savedMode = localStorage.getItem(
      STORAGE_KEYS.themeMode,
    ) as ThemeMode | null;
    if (savedMode && ["system", "light", "dark"].includes(savedMode)) {
      themeMode.value = savedMode;
    }
  }
  updateTheme();

  // 监听系统主题变化
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => {
    if (themeMode.value === "system") {
      checkSystemTheme();
    }
  };
  mediaQuery.addEventListener("change", handleChange);

  // 保存清理函数
  themeCleanupFn = () => {
    mediaQuery.removeEventListener("change", handleChange);
  };
}
