import { ref } from "vue";
import type { PetState, PetDirection, PetPosition } from "../types";
import {
  PET_SIZE,
  IDLE_DURATION,
  SLEEP_DURATION,
  HAPPY_DURATION,
  JUMP_DURATION,
  CRYING_DURATION,
  ANGRY_DURATION,
  FALLEN_DURATION,
  SCARED_DURATION,
  THINKING_DURATION,
  SMUG_DURATION,
  SHY_DURATION,
  CONFUSED_DURATION,
  HELLO_DURATION,
  SNEEZE_DURATION,
  YAWN_DURATION,
  SCRATCH_DURATION,
  CELEBRATE_DURATION,
  PEEK_DURATION,
  CHASE_DURATION,
  HIDE_DURATION,
  WALK_SPEED,
  FOOTPRINT_INTERVAL,
  FOOTPRINT_LIFETIME,
  MAX_FOOTPRINTS,
  NON_MOVING_STATES,
} from "../constants";
import { petState, petDirection, position, targetPosition, isDragging, stateTimer, animationFrameId, mousePosition } from "./sharedState";
import { screenSize, isVisible } from "./sharedState";

import { addFootprint, cleanupFootprints } from "./useFootprints";
import { showDialogue } from "./useDialogue";
import { isDark, checkSystemTheme } from "./useTheme";

// 内部函数定义
function setPassthrough(ignore: boolean) {
  if (window.electronAPI) {
    window.electronAPI.setIgnoreMouseEvents(ignore);
  }
}

function isMouseOnPet(x: number, y: number): boolean {
  const petX = position.value.x;
  const petY = position.value.y;
  const petCenterX = petX + PET_SIZE / 2;
  const petCenterY = petY + PET_SIZE / 2;
  const distance = Math.sqrt((x - petCenterX) ** 2 + (y - petCenterY) ** 2);
  return distance < PET_SIZE / 2 + 15;
}

// 不允许移动的状态
const NON_MOVING_STATES: PetState[] = [
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
];

// 随机移动到新位置
export function moveToRandomPosition() {
  if (NON_MOVING_STATES.includes(petState.value)) return;
  const maxX = screenSize.value.width - PET_SIZE;
  const maxY = screenSize.value.height - PET_SIZE - 20;
  targetPosition.value = {
    x: Math.random() * maxX,
    y: Math.random() * (maxY - 100) + 100,
  };
  petDirection.value =
    targetPosition.value.x > position.value.x ? "right" : "left";
  petState.value = "walking";
}
// 改变宠物状态
export function changeState(newState: PetState) {
  petState.value = newState;
  showDialogue();
  if (stateTimer.value) {
    clearTimeout(stateTimer.value);
  }
  switch (newState) {
    case "idle":
      stateTimer.value = window.setTimeout(() => {
        if (!isDragging.value) {
          const random = Math.random();
          if (random < 0.08) changeState("sleeping");
          else if (random < 0.15) changeState("jumping");
          else if (random < 0.2) changeState("crying");
          else if (random < 0.25) changeState("angry");
          else if (random < 0.3) changeState("fallen");
          else if (random < 0.35) changeState("scared");
          else if (random < 0.4) changeState("thinking");
          else if (random < 0.45) changeState("smug");
          else if (random < 0.5) changeState("shy");
          else if (random < 0.55) changeState("confused");
          else if (random < 0.6) changeState("hello");
          else if (random < 0.65) changeState("sneeze");
          else if (random < 0.7) changeState("yawn");
          else if (random < 0.75) changeState("scratch");
          else if (random < 0.8) changeState("celebrate");
          else if (random < 0.85) changeState("peek");
          else moveToRandomPosition();
        }
      }, IDLE_DURATION);
      break;
    case "sleeping":
      stateTimer.value = window.setTimeout(() => changeState("idle"), SLEEP_DURATION);
      break;
    case "jumping":
      setTimeout(() => changeState("idle"), JUMP_DURATION);
      break;
    case "happy":
      stateTimer.value = window.setTimeout(() => changeState("idle"), HAPPY_DURATION);
      break;
    case "crying":
      stateTimer.value = window.setTimeout(() => changeState("idle"), CRYING_DURATION);
      break;
    case "angry":
      stateTimer.value = window.setTimeout(() => changeState("idle"), ANGRY_DURATION);
      break;
    case "fallen":
      setTimeout(() => changeState("idle"), FALLEN_DURATION);
      break;
    case "scared":
      stateTimer.value = window.setTimeout(() => changeState("idle"), SCARED_DURATION);
      break;
    case "thinking":
      stateTimer.value = window.setTimeout(() => changeState("idle"), THINKING_DURATION);
      break;
    case "smug":
      stateTimer.value = window.setTimeout(() => changeState("idle"), SMUG_DURATION);
      break;
    case "shy":
      stateTimer.value = window.setTimeout(() => changeState("idle"), SHY_DURATION);
      break;
    case "confused":
      stateTimer.value = window.setTimeout(() => changeState("idle"), CONFUSED_DURATION);
      break;
    case "hello":
      stateTimer.value = window.setTimeout(() => changeState("idle"), HELLO_DURATION);
      break;
    case "sneeze":
      setTimeout(() => changeState("idle"), SNEEZE_DURATION);
      break;
    case "yawn":
      stateTimer.value = window.setTimeout(() => changeState("idle"), YAWN_DURATION);
      break;
    case "scratch":
      stateTimer.value = window.setTimeout(() => changeState("idle"), SCRATCH_DURATION);
      break;
    case "celebrate":
      stateTimer.value = window.setTimeout(() => changeState("idle"), CELEBRATE_DURATION);
      break;
    case "peek":
      stateTimer.value = window.setTimeout(() => changeState("idle"), PEEK_DURATION);
      break;
    case "chase":
      stateTimer.value = window.setTimeout(() => changeState("idle"), CHASE_DURATION);
      break;
    case "hide":
      stateTimer.value = window.setTimeout(() => changeState("idle"), HIDE_DURATION);
      break;
  }
}
// 动画循环
export function animate() {
  cleanupFootprints();

  if (petState.value === "chase" && isVisible.value) {
    const dx = mousePosition.value.x - position.value.x - PET_SIZE / 2;
    const dy = mousePosition.value.y - position.value.y - PET_SIZE / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      const speed = 3;
      const ratio = speed / distance;
      position.value.x += dx * ratio;
      position.value.y += dy * ratio;
      petDirection.value = dx > 0 ? "right" : "left";
      addFootprint(position.value.x, position.value.y, petDirection.value);
    }
  }

  if (isVisible.value && petState.value !== "chase") {
    const dx = targetPosition.value.x - position.value.x;
    const dy = targetPosition.value.y - position.value.y;
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance > WALK_SPEED && petState.value === "walking" && !isDragging.value) {
      const ratio = WALK_SPEED / distance;
      position.value.x += dx * ratio;
      position.value.y += dy * ratio;
      petDirection.value = dx > 0 ? "right" : "left";
      addFootprint(position.value.x, position.value.y, petDirection.value);
    } else if (distance <= WALK_SPEED && petState.value === "walking" && !isDragging.value) {
      position.value.x = targetPosition.value.x;
      position.value.y = targetPosition.value.y;
      changeState("idle");
    }
  }
  animationFrameId.value = requestAnimationFrame(animate);
}
// 点击宠物
export function handlePetClick() {
  if (isDragging.value) return;
  if (petState.value !== "sleeping") {
    const reactions: PetState[] = ["happy", "scared", "fallen", "smug", "shy", "celebrate"];
    changeState(reactions[Math.floor(Math.random() * reactions.length)]);
  }
}
// 拖拽相关
let dragOffset = { x: 0, y: 0 };

export function handleDragStart(e: MouseEvent) {
  isDragging.value = true;
  setPassthrough(false);
  dragOffset = { x: e.clientX - position.value.x, y: e.clientY - position.value.y };
  if (stateTimer.value) clearTimeout(stateTimer.value);
  petState.value = "walking";
  window.addEventListener("mousemove", handleDragging);
  window.addEventListener("mouseup", handleDragEnd);
}
function handleDragging(e: MouseEvent) {
  if (!isDragging.value || !isVisible.value) return;
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  petDirection.value = mouseX > position.value.x ? "right" : "left";
  position.value = { x: mouseX - dragOffset.x, y: mouseY - dragOffset.y };
  addFootprint(position.value.x, position.value.y, petDirection.value);
  targetPosition.value = { ...position.value };
  const maxX = screenSize.value.width - PET_SIZE;
  const maxY = screenSize.value.height - PET_SIZE - 20;
  if (position.value.x < 0) position.value.x = 0;
  if (position.value.x > maxX) position.value.x = maxX;
  if (position.value.y < 60) position.value.y = 60;
  if (position.value.y > maxY) position.value.y = maxY;
}
function handleDragEnd() {
  if (!isDragging.value) return;
  isDragging.value = false;
  targetPosition.value = { ...position.value };
  window.removeEventListener("mousemove", handleDragging);
  window.removeEventListener("mouseup", handleDragEnd);
  changeState("idle");
}
// 切换宠物显示
export function togglePet() {
  isVisible.value = !isVisible.value;
  if (!isVisible.value) {
    if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value);
    if (stateTimer.value) clearTimeout(stateTimer.value);
  } else {
    animate();
    changeState("idle");
  }
}
// 监听窗口大小变化
export function handleResize() {
  screenSize.value = { width: window.innerWidth, height: window.innerHeight };
  const maxX = screenSize.value.width - PET_SIZE;
  const maxY = screenSize.value.height - PET_SIZE - 20;
  if (position.value.x > maxX) position.value.x = maxX;
  if (position.value.y > maxY) position.value.y = maxY;
}
// 初始化屏幕尺寸
export async function initScreenSize() {
  if (window.electronAPI) {
    try {
      const size = await window.electronAPI.getScreenSize();
      screenSize.value = size;
      position.value = { x: 50, y: size.height - 120 };
      targetPosition.value = { x: 50, y: size.height - 120 };
    } catch (e) {
      console.log("使用默认屏幕尺寸");
    }
  }
}
// 处理鼠标移动
export function handleMouseMove(e: MouseEvent) {
  mousePosition.value = { x: e.clientX, y: e.clientY };
  const onPet = isMouseOnPet(e.clientX, e.clientY);
  setPassthrough(!onPet);
}
// 初始化宠物
export function initPet(checkSystemThemeFn: () => void) {
  checkSystemThemeFn();
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", checkSystemThemeFn);
  const savedState = localStorage.getItem("pet-visibility");
  if (savedState !== null) {
    isVisible.value = savedState === "true";
  }
  if (isVisible.value) {
    animate();
    setTimeout(() => changeState("idle"), 1000);
  }
  window.addEventListener("resize", handleResize);
  window.addEventListener("mousemove", handleMouseMove);
  (window as any).togglePet = togglePet;
}
// 清理
export function cleanupPet() {
  if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value);
  if (stateTimer.value) clearTimeout(stateTimer.value);
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("mousemove", handleMouseMove);
}