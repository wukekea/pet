// 宠物形态存储模块
import { ref } from "vue";
import type { PetShape } from "../shapes/types";
import { DEFAULT_SHAPE } from "../shapes";

const STORAGE_KEY = "pet-shape";

// 当前形态
export const currentPetShape = ref<PetShape>(DEFAULT_SHAPE);

// 保存形态到 localStorage
export function savePetShape(shape: PetShape): void {
  try {
    localStorage.setItem(STORAGE_KEY, shape);
    currentPetShape.value = shape;
  } catch (e) {
    console.error("保存宠物形态失败:", e);
  }
}

// 从 localStorage 加载形态
export function loadPetShape(): PetShape {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ["cloud", "cat"].includes(saved)) {
      currentPetShape.value = saved as PetShape;
      return currentPetShape.value;
    }
  } catch (e) {
    console.error("加载宠物形态失败:", e);
  }
  currentPetShape.value = DEFAULT_SHAPE;
  return currentPetShape.value;
}

// 初始化形态
export function initPetShape(): void {
  loadPetShape();
}
