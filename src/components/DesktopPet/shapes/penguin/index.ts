// 企鹅形态配置
import type { PetShapeConfig } from "../types";

export const penguinConfig: PetShapeConfig = {
  name: "penguin",
  label: "企鹅",
  icon: "🐧",
  colors: {
    body: { light: "#1e293b", dark: "#334155" },
    bodyGradient: { light: "#334155", dark: "#1e293b" },
    face: { light: "#ffffff", dark: "#1f2937" },
    eyes: { light: "#1c1917", dark: "#fbbf24" },
    cheeks: { light: "#fda4af", dark: "#f472b6" },
    shadow: {
      light: "rgba(30, 41, 59, 0.2)",
      dark: "rgba(51, 65, 85, 0.3)",
    },
    footprint: {
      light: "rgba(30, 41, 59, 0.3)",
      dark: "rgba(51, 65, 85, 0.4)",
    },
    angryFace: "#7f1d1d",
  },
  hasTail: false,
  hasWhiskers: false,
};
