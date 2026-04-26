// 兔子形态配置
import type { PetShapeConfig } from "../types";

export const rabbitConfig: PetShapeConfig = {
  name: "rabbit",
  label: "兔子",
  icon: "🐰",
  colors: {
    body: { light: "#fce7f3", dark: "#f9a8d4" },
    bodyGradient: { light: "#fdf2f8", dark: "#fbcfe8" },
    face: { light: "#ffffff", dark: "#1f2937" },
    eyes: { light: "#be123c", dark: "#fbbf24" },
    cheeks: { light: "#fb7185", dark: "#f472b6" },
    shadow: {
      light: "rgba(244, 114, 182, 0.2)",
      dark: "rgba(249, 168, 212, 0.3)",
    },
    footprint: {
      light: "rgba(244, 114, 182, 0.3)",
      dark: "rgba(249, 168, 212, 0.4)",
    },
    angryFace: "#7f1d1d",
  },
  hasTail: false,
  hasWhiskers: false,
};
