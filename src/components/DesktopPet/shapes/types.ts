// 宠物形态相关类型定义

// 宠物形态类型
export type PetShape = "cloud" | "cat" | "panda";

// 颜色配置（支持深色/浅色主题）
export interface ShapeColors {
  body: { light: string; dark: string };
  bodyGradient: { light: string; dark: string };
  face: { light: string; dark: string };
  eyes: { light: string; dark: string };
  cheeks: { light: string; dark: string };
  shadow: { light: string; dark: string };
  footprint: { light: string; dark: string };
  angryFace?: string;
}

// 形态完整配置
export interface PetShapeConfig {
  name: PetShape;
  label: string;
  icon: string;
  colors: ShapeColors;
  // 是否有尾巴
  hasTail?: boolean;
  // 是否有胡须
  hasWhiskers?: boolean;
}
