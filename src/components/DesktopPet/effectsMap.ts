// 效果组件映射 - 用于根据宠物状态动态渲染对应效果
import { h, type Component } from "vue";

// 效果组件
import BadgeEffect from "./effects/BadgeEffect.vue";
import SleepBubble from "./effects/SleepBubble.vue";
import HappyEffects from "./effects/HappyEffects.vue";
import AngryEffects from "./effects/AngryEffects.vue";
import DizzyEffects from "./effects/DizzyEffects.vue";
import ScaredEffects from "./effects/ScaredEffects.vue";
import ThinkingEffects from "./effects/ThinkingEffects.vue";
import SmugEffects from "./effects/SmugEffects.vue";
import ShyEffects from "./effects/ShyEffects.vue";
import ConfusedEffects from "./effects/ConfusedEffects.vue";
import CelebrateEffects from "./effects/CelebrateEffects.vue";
import DancingEffects from "./effects/DancingEffects.vue";
import BathingEffects from "./effects/BathingEffects.vue";
import EatingEffects from "./effects/EatingEffects.vue";
import BrickCarryingEffects from "./effects/BrickCarryingEffects.vue";
import FlyerDistributingEffects from "./effects/FlyerDistributingEffects.vue";
import ProgrammerEffects from "./effects/ProgrammerEffects.vue";
import EmbarrassedEffects from "./effects/EmbarrassedEffects.vue";

import type { PetState } from "./types";

// 极简徽章特效：单 emoji/文字 + 单动画，统一由 BadgeEffect 配置驱动
// （合并原 Hello/Grin/Peek/Sneeze/Scratch/Sleepy/Yawn/Stretch/
// Sleepwalking 九个结构一致的组件）
const BADGE_EFFECTS: Partial<Record<PetState, Component>> = {
  hello: () =>
    h(BadgeEffect, {
      content: "👋",
      position: "top: -20px; right: -25px;",
      animation: "fx-badge-wave 0.5s ease-in-out infinite",
    }),
  grin: () =>
    h(BadgeEffect, {
      content: "嘿嘿~",
      position: "top: -25px; right: -15px;",
      fontSize: 12,
      color: "#f59e0b",
      animation: "fx-badge-float 2s ease-in-out infinite",
    }),
  peek: () =>
    h(BadgeEffect, {
      content: "🤫",
      position: "top: -35px; left: 55%;",
      animation: "fx-badge-float-scale 1.5s ease-in-out infinite",
    }),
  sneeze: () =>
    h(BadgeEffect, {
      content: "💨",
      subText: "阿嚏!",
      position: "top: -20px; left: 50%; transform: translateX(-50%);",
      animation: "fx-badge-puff 0.5s ease-out infinite",
    }),
  scratch: () =>
    h(BadgeEffect, {
      content: "❓",
      position: "top: -35px; right: -5px;",
      animation: "fx-badge-bounce 0.3s ease-in-out infinite",
    }),
  sleepy: () =>
    h(BadgeEffect, {
      content: "💤",
      position: "top: -35px; right: -15px;",
      animation: "fx-badge-float-scale 3s ease-in-out infinite",
    }),
  yawn: () =>
    h(BadgeEffect, {
      content: "😴",
      position: "top: -35px; left: 50%; transform: translateX(-50%);",
      animation: "fx-badge-float 2s ease-in-out infinite",
    }),
  stretch: () =>
    h(BadgeEffect, {
      content: "✨",
      position: "top: -30px; left: 50%; transform: translateX(-50%);",
      animation: "fx-badge-sparkle 2.5s ease-in-out",
    }),
  sleepwalking: () =>
    h(BadgeEffect, {
      content: "💤",
      position: "top: -30px; left: 50%; transform: translateX(-50%);",
      fontSize: 20,
      animation: "fx-badge-float-scale 0.8s ease-in-out infinite",
    }),
};

// 复合特效组件映射（部分状态没有效果组件）
const COMPLEX_EFFECTS: Partial<Record<PetState, Component>> = {
  sleeping: SleepBubble,
  happy: HappyEffects,
  angry: AngryEffects,
  fallen: DizzyEffects,
  scared: ScaredEffects,
  thinking: ThinkingEffects,
  smug: SmugEffects,
  shy: ShyEffects,
  confused: ConfusedEffects,
  celebrate: CelebrateEffects,
  dancing: DancingEffects,
  bathing: BathingEffects,
  eating: EatingEffects,
  brickCarrying: BrickCarryingEffects,
  flyerDistributing: FlyerDistributingEffects,
  programmer: ProgrammerEffects,
  embarrassed: EmbarrassedEffects,
};

// 状态到效果组件的统一映射
// 徽章类返回内联渲染函数，复合类直接返回组件
export const STATE_EFFECTS: Partial<
  Record<PetState, Component | (() => Component)>
> = { ...COMPLEX_EFFECTS, ...BADGE_EFFECTS };
