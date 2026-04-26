// 效果组件映射 - 用于根据宠物状态动态渲染对应效果
import type { Component } from "vue";

// 效果组件
import SleepBubble from "./effects/SleepBubble.vue";
import HappyEffects from "./effects/HappyEffects.vue";
import AngryEffects from "./effects/AngryEffects.vue";
import DizzyEffects from "./effects/DizzyEffects.vue";
import ScaredEffects from "./effects/ScaredEffects.vue";
import ThinkingEffects from "./effects/ThinkingEffects.vue";
import SmugEffects from "./effects/SmugEffects.vue";
import ShyEffects from "./effects/ShyEffects.vue";
import ConfusedEffects from "./effects/ConfusedEffects.vue";
import HelloEffects from "./effects/HelloEffects.vue";
import SneezeEffects from "./effects/SneezeEffects.vue";
import GrinEffects from "./effects/GrinEffects.vue";
import ScratchEffects from "./effects/ScratchEffects.vue";
import CelebrateEffects from "./effects/CelebrateEffects.vue";
import PeekEffects from "./effects/PeekEffects.vue";
import DancingEffects from "./effects/DancingEffects.vue";
import RollingEffects from "./effects/RollingEffects.vue";
import YawnEffects from "./effects/YawnEffects.vue";
import SleepyEffects from "./effects/SleepyEffects.vue";
import SleepwalkingEffects from "./effects/SleepwalkingEffects.vue";
import StretchEffects from "./effects/StretchEffects.vue";
import BathingEffects from "./effects/BathingEffects.vue";
import EatingEffects from "./EatingEffects.vue";
import BrickCarryingEffects from "./effects/BrickCarryingEffects.vue";
import FlyerDistributingEffects from "./effects/FlyerDistributingEffects.vue";
import ProgrammerEffects from "./effects/ProgrammerEffects.vue";

import type { PetState } from "./types";

// 状态到效果组件的映射（部分状态没有效果组件）
export const STATE_EFFECTS: Partial<Record<PetState, Component>> = {
  sleeping: SleepBubble,
  happy: HappyEffects,
  angry: AngryEffects,
  fallen: DizzyEffects,
  scared: ScaredEffects,
  thinking: ThinkingEffects,
  smug: SmugEffects,
  shy: ShyEffects,
  confused: ConfusedEffects,
  hello: HelloEffects,
  sneeze: SneezeEffects,
  grin: GrinEffects,
  scratch: ScratchEffects,
  celebrate: CelebrateEffects,
  peek: PeekEffects,
  dancing: DancingEffects,
  rolling: RollingEffects,
  yawn: YawnEffects,
  sleepy: SleepyEffects,
  sleepwalking: SleepwalkingEffects,
  stretch: StretchEffects,
  bathing: BathingEffects,
  eating: EatingEffects,
  brickCarrying: BrickCarryingEffects,
  flyerDistributing: FlyerDistributingEffects,
  programmer: ProgrammerEffects,
};
