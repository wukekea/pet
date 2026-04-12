// 共享状态 - 避免循环依赖
import { ref } from "vue";
import type { PetState, PetDirection, PetPosition } from "./types";
import { PET_SIZE } from "./constants";

// 宠物核心状态
export const petState = ref<PetState>("idle");
export const petDirection = ref<PetDirection>("right");
export const position = ref<PetPosition>({ x: 50, y: window.innerHeight - 120 });
export const targetPosition = ref<PetPosition>({ x: 50, y: window.innerHeight - 120 });
export const screenSize = ref({ width: window.innerWidth, height: window.innerHeight });
export const isVisible = ref(true);
export const isDragging = ref(false);
export const stateTimer = ref<number | null>(null);
export const animationFrameId = ref<number | null>(null);
export const mousePosition = ref<PetPosition>({ x: 0, y: 0 });
