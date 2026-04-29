// 小鸡形态配置
import type { PetShapeConfig } from "../types";

export const chickConfig: PetShapeConfig = {
  name: "chick",
  label: "小鸡",
  icon: "🐤",
  colors: {
    body: { light: "#fbbf24", dark: "#f59e0b" },
    bodyGradient: { light: "#fde68a", dark: "#d97706" },
    face: { light: "#ffffff", dark: "#1f2937" },
    eyes: { light: "#1c1917", dark: "#fbbf24" },
    cheeks: { light: "#fb923c", dark: "#f97316" },
    shadow: {
      light: "rgba(251, 191, 36, 0.2)",
      dark: "rgba(245, 158, 11, 0.3)",
    },
    footprint: {
      light: "rgba(251, 191, 36, 0.3)",
      dark: "rgba(245, 158, 11, 0.4)",
    },
    angryFace: "#7f1d1d",
  },
  hasTail: false,
  hasWhiskers: false,
};
