import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import type { PetPosition } from "../types";
import { PET_SIZE } from "../constants";

// 当前穿透状态
let isPassthrough = true;

// 屏幕尺寸
export const screenSize = ref({ width: window.innerWidth, height: window.innerHeight });

// 设置穿透状态
export function setPassthrough(ignore: boolean) {
  console.log("setPassthrough called:", ignore, "current:", isPassthrough, "electronAPI:", !!window.electronAPI);
  if (ignore !== isPassthrough) {
    if (window.electronAPI) {
      window.electronAPI.setIgnoreMouseEvents(ignore);
      isPassthrough = ignore;
      console.log("Passthrough changed to:", ignore);
    } else {
      console.log("electronAPI not available!");
    }
  }
}

// 检测鼠标是否在宠物上
export function isMouseOnPet(x: number, y: number, position: PetPosition): boolean {
  const petCenterX = position.x + PET_SIZE / 2;
  const petCenterY = position.y + PET_SIZE / 2;
  const distance = Math.sqrt((x - petCenterX) ** 2 + (y - petCenterY) ** 2);
  return distance < PET_SIZE / 2 + 15;
}

// 监听窗口大小变化
export function handleResize(position: PetPosition) {
  screenSize.value = { width: window.innerWidth, height: window.innerHeight };

  const maxX = screenSize.value.width - PET_SIZE;
  const maxY = screenSize.value.height - PET_SIZE - 20;

  if (position.x > maxX) {
    position.x = maxX;
  }
  if (position.y > maxY) {
    position.y = maxY;
  }
}

// 初始化屏幕尺寸
export async function initScreenSize(position: PetPosition, targetPosition: PetPosition) {
  if (window.electronAPI) {
    try {
      const size = await window.electronAPI.getScreenSize();
      screenSize.value = size;
      position.x = 50;
      position.y = size.height - 120;
      targetPosition.x = 50;
      targetPosition.y = size.height - 120;
    } catch (e) {
      console.log("使用默认屏幕尺寸");
    }
  }
}
