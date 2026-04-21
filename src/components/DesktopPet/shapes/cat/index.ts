// 猫咪形态配置
import type { PetShapeConfig } from "../types";

export const catConfig: PetShapeConfig = {
  name: "cat",
  label: "猫咪",
  icon: "🐱",
  colors: {
    body: { light: "#fb923c", dark: "#ea580c" },
    bodyGradient: { light: "#fdba74", dark: "#c2410c" },
    face: { light: "#ffffff", dark: "#1f2937" },
    eyes: { light: "#1f2937", dark: "#fbbf24" },
    cheeks: { light: "#fda4af", dark: "#f472b6" },
    shadow: {
      light: "rgba(251, 146, 60, 0.2)",
      dark: "rgba(234, 88, 12, 0.3)",
    },
    footprint: {
      light: "rgba(251, 146, 60, 0.3)",
      dark: "rgba(234, 88, 12, 0.4)",
    },
    angryFace: "#7f1d1d",
  },
  hasTail: true,
  hasWhiskers: true,
};
