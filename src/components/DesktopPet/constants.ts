// 宠物配置
export const PET_SIZE = 80;
export const JUMP_DURATION = 800;
export const WALK_SPEED = 2; // 固定移动速度（像素/帧）
export const IDLE_DURATION = 4000;
export const SLEEP_DURATION = 8000;
export const HAPPY_DURATION = 1500;
export const FOOTPRINT_INTERVAL = 150; // 脚印生成间隔（毫秒）
export const FOOTPRINT_LIFETIME = 4000; // 脚印存活时间（毫秒）
export const MAX_FOOTPRINTS = 20; // 最大脚印数量

// 状态持续时间
export const CRYING_DURATION = 3000;
export const ANGRY_DURATION = 2500;
export const FALLEN_DURATION = 2000;
export const SCARED_DURATION = 1500;
export const THINKING_DURATION = 4000;
export const SMUG_DURATION = 2500;
export const SHY_DURATION = 2000;
export const CONFUSED_DURATION = 2000;
export const HELLO_DURATION = 1500;
export const SNEEZE_DURATION = 1000;
export const YAWN_DURATION = 2000;
export const SCRATCH_DURATION = 2000;
export const CELEBRATE_DURATION = 3000;
export const PEEK_DURATION = 3000;
export const CHASE_DURATION = 5000;
export const HIDE_DURATION = 4000;

// 不允许移动的状态
export const NON_MOVING_STATES = [
  "sleeping",
  "happy",
  "crying",
  "angry",
  "fallen",
  "scared",
  "thinking",
  "smug",
  "shy",
  "confused",
  "hello",
  "sneeze",
  "yawn",
  "scratch",
  "celebrate",
  "peek",
  "chase",
  "hide",
] as const;
