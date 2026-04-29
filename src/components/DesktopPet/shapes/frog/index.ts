// 青蛙形态配置
import type { PetShapeConfig } from "../types";

export const frogConfig: PetShapeConfig = {
  name: "frog",
  label: "青蛙",
  icon: "🐸",
  colors: {
    body: { light: "#4ade80", dark: "#22c55e" },
    bodyGradient: { light: "#86efac", dark: "#16a34a" },
    face: { light: "#ffffff", dark: "#1f2937" },
    eyes: { light: "#1c1917", dark: "#fbbf24" },
    cheeks: { light: "#fda4af", dark: "#f472b6" },
    shadow: {
      light: "rgba(74, 222, 128, 0.2)",
      dark: "rgba(34, 197, 94, 0.3)",
    },
    footprint: {
      light: "rgba(74, 222, 128, 0.3)",
      dark: "rgba(34, 197, 94, 0.4)",
    },
    angryFace: "#7f1d1d",
  },
  hasTail: false,
  hasWhiskers: false,
};
