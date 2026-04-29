// 小狗形态配置
import type { PetShapeConfig } from "../types";

export const dogConfig: PetShapeConfig = {
  name: "dog",
  label: "小狗",
  icon: "🐶",
  colors: {
    body: { light: "#f6d397", dark: "#e8b86d" },
    bodyGradient: { light: "#fbe8c3", dark: "#c9923a" },
    face: { light: "#ffffff", dark: "#1f2937" },
    eyes: { light: "#1c1917", dark: "#fbbf24" },
    cheeks: { light: "#fda4af", dark: "#f472b6" },
    shadow: {
      light: "rgba(246, 211, 151, 0.25)",
      dark: "rgba(232, 184, 109, 0.3)",
    },
    footprint: {
      light: "rgba(232, 184, 109, 0.3)",
      dark: "rgba(201, 146, 58, 0.4)",
    },
    angryFace: "#7f1d1d",
  },
  hasTail: false,
  hasWhiskers: false,
};
