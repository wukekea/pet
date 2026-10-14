// 宠物形态存储模块
import { ref } from "vue";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { createLocalStorage } from "../utils/storage";
import type { PetShape } from "../types";
import { DEFAULT_SHAPE, PET_SHAPES } from "../shapes";

// 当前形态
export const currentPetShape = ref<PetShape>(DEFAULT_SHAPE);

const petShapeStorage = createLocalStorage<PetShape>(
  STORAGE_KEYS.petShape,
  DEFAULT_SHAPE,
  (data): data is PetShape => typeof data === "string" && data in PET_SHAPES,
);

// 保存形态到 localStorage
export function savePetShape(shape: PetShape): void {
  petShapeStorage.save(shape);
  currentPetShape.value = shape;
}

// 从 localStorage 加载形态
export function loadPetShape(): PetShape {
  const shape = petShapeStorage.load();
  currentPetShape.value = shape;
  return shape;
}

// 初始化形态
export function initPetShape(): void {
  loadPetShape();
}
