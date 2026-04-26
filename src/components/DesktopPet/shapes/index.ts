// 宠物形态导出入口
import type { Component } from "vue";
import type { PetShape, PetShapeConfig } from "./types";
import { cloudConfig } from "./cloud";
import { catConfig } from "./cat";
import { pandaConfig } from "./panda";
import { rabbitConfig } from "./rabbit";
import CatShape from "./cat/CatShape.vue";
import CloudShape from "./cloud/CloudShape.vue";
import PandaShape from "./panda/PandaShape.vue";
import RabbitShape from "./rabbit/RabbitShape.vue";

// 所有形态配置
export const PET_SHAPES: Record<PetShape, PetShapeConfig> = {
  cloud: cloudConfig,
  cat: catConfig,
  panda: pandaConfig,
  rabbit: rabbitConfig,
};

// 默认形态
export const DEFAULT_SHAPE: PetShape = "cloud";

// 获取形态配置
export function getShapeConfig(shape: PetShape): PetShapeConfig {
  return PET_SHAPES[shape];
}

// 获取形态组件
export function getShapeComponent(shape: PetShape): Component {
  const components: Record<PetShape, Component> = {
    cloud: CloudShape,
    cat: CatShape,
    panda: PandaShape,
    rabbit: RabbitShape,
  };
  return components[shape];
}

// 获取所有形态选项（用于 UI）
export function getShapeOptions(): Array<{
  value: PetShape;
  label: string;
  icon: string;
}> {
  return Object.values(PET_SHAPES).map((config) => ({
    value: config.name,
    label: config.label,
    icon: config.icon,
  }));
}

// 导出类型
export type { PetShape, PetShapeConfig };
