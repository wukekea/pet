import { isDark } from "./theme";

/**
 * 面板主题色系定义
 * accent: 主题色 RGB（用于遮罩/描边/卡片等透明度变体）
 * darkModalBg: 深色模式下的弹窗底色（无法从 accent 推导，需各面板指定）
 * lightOverlayAlpha: 浅色模式遮罩透明度（各面板微调，默认 0.1）
 */
export interface PanelTheme {
  /** 主题色 RGB，如 [251, 191, 36] */
  accent: [number, number, number];
  /** 深色模式弹窗底色，如 "rgba(30, 28, 20, 0.98)" */
  darkModalBg: string;
  /** 浅色模式遮罩透明度（默认 0.1） */
  lightOverlayAlpha?: number;
}

/**
 * 通用面板主题变量底盘
 * 生成各功能弹窗共用的一组 CSS 变量（overlay/modal/close 系），
 * 各面板再在此基础上叠加自己的业务变量。
 *
 * 使用方式：
 *   const cssVars = computed(() => ({
 *     ...usePanelTheme({ accent: [251, 191, 36], darkModalBg: "rgba(30, 28, 20, 0.98)" }),
 *     // 面板特有变量
 *     "--money-color": ...,
 *   }));
 */
export function usePanelTheme(theme: PanelTheme): Record<string, string> {
  const [r, g, b] = theme.accent;
  const alpha = theme.lightOverlayAlpha ?? 0.1;

  return {
    // 遮罩层：深色纯黑半透明，浅色为主题色淡染
    "--overlay-bg": isDark.value
      ? "rgba(0, 0, 0, 0.6)"
      : `rgba(${r}, ${g}, ${b}, ${alpha})`,

    // 弹窗底色：浅色统一白，深色各面板指定
    "--modal-bg": isDark.value
      ? theme.darkModalBg
      : "rgba(255, 255, 255, 0.98)",

    // 弹窗阴影：主题色环形描边
    "--modal-shadow": isDark.value
      ? `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(${r}, ${g}, ${b}, 0.2)`
      : `0 20px 60px rgba(${r}, ${g}, ${b}, 0.2), 0 0 0 1px rgba(${r}, ${g}, ${b}, 0.1)`,

    // 关闭按钮：中性灰（各面板一致）
    "--modal-close-bg": isDark.value
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(0, 0, 0, 0.03)",
    "--modal-close-color": "#9ca3af",
  };
}

/**
 * 通用卡片/列表主题变量（shop 与 warehouse 完全同值的 20 个变量，
 * 仅适用于琥珀金系面板；其他色调面板请自行定义卡片变量）
 */
export function useAmberCardTheme(): Record<string, string> {
  return {
    "--text-color": isDark.value ? "#e2e8f0" : "#374151",
    "--value-color": isDark.value ? "#f1f5f9" : "#1f2937",
    "--money-color": isDark.value ? "#fbbf24" : "#d97706",
    "--money-bg": isDark.value
      ? "rgba(251, 191, 36, 0.1)"
      : "rgba(251, 191, 36, 0.08)",
    "--card-bg": isDark.value
      ? "rgba(55, 50, 35, 0.4)"
      : "rgba(254, 243, 199, 0.5)",
    "--card-hover-bg": isDark.value
      ? "rgba(65, 60, 40, 0.5)"
      : "rgba(253, 230, 138, 0.6)",
    "--card-border": isDark.value
      ? "rgba(251, 191, 36, 0.12)"
      : "rgba(251, 191, 36, 0.2)",
    "--card-disabled-bg": isDark.value
      ? "rgba(55, 50, 35, 0.15)"
      : "rgba(243, 244, 246, 0.4)",
    "--card-disabled-border": isDark.value
      ? "rgba(75, 85, 99, 0.1)"
      : "rgba(209, 213, 219, 0.3)",
    "--effect-color": isDark.value
      ? "rgba(251, 191, 36, 0.6)"
      : "rgba(180, 83, 9, 0.5)",
    "--disabled-color": isDark.value
      ? "rgba(156, 163, 175, 0.5)"
      : "rgba(156, 163, 175, 0.6)",
    "--tab-inactive-color": isDark.value
      ? "rgba(156, 163, 175, 0.6)"
      : "rgba(107, 114, 128, 0.6)",
    "--tab-inactive-bg": isDark.value
      ? "rgba(55, 50, 35, 0.3)"
      : "rgba(243, 244, 246, 0.6)",
    "--toast-bg": isDark.value
      ? "rgba(30, 28, 20, 0.95)"
      : "rgba(255, 255, 255, 0.97)",
    "--toast-border": isDark.value
      ? "rgba(251, 191, 36, 0.4)"
      : "rgba(251, 191, 36, 0.2)",
    "--toast-shadow": isDark.value
      ? "0 8px 32px rgba(251, 191, 36, 0.15)"
      : "0 8px 32px rgba(251, 191, 36, 0.1)",
  };
}
