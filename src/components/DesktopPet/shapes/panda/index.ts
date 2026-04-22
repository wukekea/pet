// 熊猫形态配置
import type { PetShapeConfig } from "../types";

export const pandaConfig: PetShapeConfig = {
  name: "panda",
  label: "熊猫",
  icon: "🐼",
  colors: {
    body: { light: "#ffffff", dark: "#e5e7eb" },
    bodyGradient: { light: "#f3f4f6", dark: "#d1d5db" },
    face: { light: "#ffffff", dark: "#1f2937" },
    eyes: { light: "#1f2937", dark: "#fbbf24" },
    cheeks: { light: "#fda4af", dark: "#f472b6" },
    shadow: {
      light: "rgba(0, 0, 0, 0.15)",
      dark: "rgba(0, 0, 0, 0.3)",
    },
    footprint: {
      light: "rgba(0, 0, 0, 0.2)",
      dark: "rgba(0, 0, 0, 0.4)",
    },
    angryFace: "#7f1d1d",
  },
  hasTail: false,
  hasWhiskers: false,
};
