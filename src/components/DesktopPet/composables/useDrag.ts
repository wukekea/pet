import { ref } from "vue";
import type { PetPosition } from "../types";
import { PET_SIZE } from "../constants";
import { setPassthrough } from "./useScreen";
import {
  stateTimer,
  petState,
  petDirection,
  position,
  targetPosition,
} from "./sharedState";
import { addFootprint } from "./useFootprints";
import { changeState } from "./usePetState";
import { screenSize } from "./useScreen";

// 拖拽状态
export const isDragging = ref(false);
export const dragOffset = ref<PetPosition>({ x: 0, y: 0 });

// 开始拖动
export function handleDragStart(e: MouseEvent) {
  isDragging.value = true;

  // 拖动时不穿透
  setPassthrough(false);

  // 计算鼠标相对于宠物位置的偏移
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y,
  };

  // 暂停状态定时器
  if (stateTimer.value) {
    clearTimeout(stateTimer.value);
  }

  petState.value = "walking";

  // 添加全局鼠标事件监听
  window.addEventListener("mousemove", handleDragging);
  window.addEventListener("mouseup", handleDragEnd);
}

// 拖动中
export function handleDragging(e: MouseEvent) {
  if (!isDragging.value) return;

  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // 计算移动方向
  const newX = mouseX - dragOffset.value.x;
  const newY = mouseY - dragOffset.value.y;
  const dx = newX - position.value.x;
  const dy = newY - position.value.y;

  // 根据移动方向设置朝向
  // 水平移动为主
  if (Math.abs(dx) > Math.abs(dy) * 2) {
    petDirection.value = dx > 0 ? "right" : "left";
  } else if (Math.abs(dy) > Math.abs(dx) * 2) {
    // 垂直移动为主
    petDirection.value = dy > 0 ? "front" : "back";
  } else {
    // 斜向移动
    if (dx > 0) {
      petDirection.value = "right";
    } else {
      petDirection.value = "left";
    }
  }

  // 更新位置
  position.value = {
    x: newX,
    y: newY,
  };

  // 添加脚印
  addFootprint(position.value.x, position.value.y, petDirection.value);

  // 同时更新目标位置，防止动画循环将宠物移回原位置
  targetPosition.value = { ...position.value };

  // 限制在窗口范围内
  const maxX = screenSize.value.width - PET_SIZE;
  const maxY = screenSize.value.height - PET_SIZE - 20;

  if (position.value.x < 0) position.value.x = 0;
  if (position.value.x > maxX) position.value.x = maxX;
  if (position.value.y < 60) position.value.y = 60; // 留出工具栏空间
  if (position.value.y > maxY) position.value.y = maxY;
}

// 结束拖动
export function handleDragEnd() {
  if (!isDragging.value) return;

  isDragging.value = false;

  // 确保目标位置等于当前位置
  targetPosition.value = { ...position.value };

  // 移除全局事件监听
  window.removeEventListener("mousemove", handleDragging);
  window.removeEventListener("mouseup", handleDragEnd);

  // 恢复正面朝向
  petDirection.value = "front";
  // 恢复空闲状态
  changeState("idle");
}

// 清理拖拽事件
export function cleanupDrag() {
  window.removeEventListener("mousemove", handleDragging);
  window.removeEventListener("mouseup", handleDragEnd);
}
