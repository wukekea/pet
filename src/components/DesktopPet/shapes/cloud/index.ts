// 云朵形态配置
import type { PetShapeConfig } from "../types";

export const cloudConfig: PetShapeConfig = {
  name: "cloud",
  label: "云朵",
  icon: "☁️",
  colors: {
    body: { light: "#8b5cf6", dark: "#a78bfa" },
    bodyGradient: { light: "#a78bfa", dark: "#c4b5fd" },
    face: { light: "#ffffff", dark: "#1f2937" },
    eyes: { light: "#1f2937", dark: "#fbbf24" },
    cheeks: { light: "#fda4af", dark: "#f472b6" },
    shadow: {
      light: "rgba(139, 92, 246, 0.2)",
      dark: "rgba(167, 139, 250, 0.3)",
    },
    footprint: {
      light: "rgba(139, 92, 246, 0.3)",
      dark: "rgba(167, 139, 250, 0.4)",
    },
    angryFace: "#7f1d1d",
  },
  hasTail: false,
  hasWhiskers: false,
};
