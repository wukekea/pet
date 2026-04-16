// 共享状态 - 避免循环依赖
import { ref } from "vue";
import type { PetDirection, PetPosition, PetState } from "../types";

// 宠物核心状态
export const petState = ref<PetState>("idle");
export const petDirection = ref<PetDirection>("front");
export const position = ref<PetPosition>({
  x: 50,
  y: window.innerHeight - 120,
});
export const targetPosition = ref<PetPosition>({
  x: 50,
  y: window.innerHeight - 120,
});
export const screenSize = ref({
  width: window.innerWidth,
  height: window.innerHeight,
});
export const isVisible = ref(true);
export const isDragging = ref(false);
export const stateTimer = ref<number | null>(null);
export const animationFrameId = ref<number | null>(null);
export const mousePosition = ref<PetPosition>({ x: 0, y: 0 });

// 调试面板是否打开 - 打开时禁用自动穿透控制
export const isDebugPanelOpen = ref(false);

// 作息设置弹窗是否打开 - 打开时禁用自动穿透控制
export const isScheduleModalOpen = ref(false);

// 右键菜单是否打开 - 打开时禁用自动穿透控制
export const isContextMenuOpen = ref(false);

// 作息相关状态
export const isInSleepSchedule = ref(false); // 当前是否处于睡眠作息时间段
export const scheduleEnabled = ref(false); // 作息功能是否启用
export const dreamTalkTimerId = ref<number | null>(null); // 梦话定时器
export const scheduleEndTime = ref<number | null>(null); // 当前作息结束时间（毫秒时间戳）
