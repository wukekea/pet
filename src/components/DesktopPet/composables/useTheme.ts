import { ref } from "vue";

// 当前主题（使用系统主题）
export const isDark = ref(false);

// 检测系统主题
export function checkSystemTheme() {
  isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
}
