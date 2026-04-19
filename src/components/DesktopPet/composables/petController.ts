import {
  ANGRY_DURATION,
  CELEBRATE_DURATION,
  CHASE_DURATION,
  CONFUSED_DURATION,
  CRYING_DURATION,
  DANCING_DURATION,
  FALLEN_DURATION,
  GRIN_DURATION,
  HAPPY_DURATION,
  HELLO_DURATION,
  HIDE_DURATION,
  IDLE_DURATION,
  JUMP_DURATION,
  PEEK_DURATION,
  PET_SIZE,
  ROLLING_DURATION,
  SCARED_DURATION,
  SCRATCH_DURATION,
  SHY_DURATION,
  SLEEP_DURATION,
  SLEEPY_DURATION,
  SMUG_DURATION,
  SNEEZE_DURATION,
  STRETCH_DURATION,
  THINKING_DURATION,
  TOP_MARGIN,
  WALK_SPEED,
  YAWN_DURATION,
} from "../constants";
import type { PetState } from "../types";
import {
  animationFrameId,
  isContextMenuOpen,
  isDebugPanelOpen,
  isDragging,
  isInSleepSchedule,
  isScheduleModalOpen,
  isStatsModalOpen,
  isVisible,
  mousePosition,
  petDirection,
  petState,
  position,
  scheduleEnabled,
  screenSize,
  stateTimer,
  targetPosition,
} from "./sharedState";

import { getTimeGreeting, showCustomDialogue, showDialogue } from "./dialogue";
import { addFootprint, cleanupFootprints } from "./footprints";
import {
  onSleepEnd,
  onSleepStart,
  startScheduleMonitor,
  stopScheduleMonitor,
} from "./scheduleManager";
import { initWeatherService, cleanupWeatherService } from "./qweatherService";
import {
  recordClick,
  recordDoubleClick,
  recordDrag,
  recordState,
} from "./stats";
import { setPassthrough } from "./passthrough";

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
  "grin",
  "scratch",
  "celebrate",
  "peek",
  "chase",
  "hide",
  "dancing",
  "rolling",
  "yawn",
  "sleepy",
  "stretch",
];

// 根据移动方向更新宠物朝向
function updateDirection(dx: number, dy: number) {
  // 如果水平移动较大
  if (Math.abs(dx) > Math.abs(dy) * 2) {
    petDirection.value = dx > 0 ? "right" : "left";
  } else if (Math.abs(dy) > Math.abs(dx) * 2) {
    // 如果垂直移动较大
    petDirection.value = dy > 0 ? "front" : "back";
  } else {
    // 斜向移动
    if (dx > 0 && dy > 0) {
      petDirection.value = "right";
    } else if (dx > 0 && dy < 0) {
      petDirection.value = "right";
    } else if (dx < 0 && dy > 0) {
      petDirection.value = "left";
    } else {
      petDirection.value = "left";
    }
  }
}

// 随机移动到新位置
export function moveToRandomPosition() {
  if (NON_MOVING_STATES.includes(petState.value)) return;
  const maxX = screenSize.value.width - PET_SIZE;
  const maxY = screenSize.value.height - PET_SIZE - 20;
  targetPosition.value = {
    x: Math.random() * maxX,
    y: Math.random() * (maxY - 100) + 100,
  };
  // 根据移动方向设置朝向
  const dx = targetPosition.value.x - position.value.x;
  const dy = targetPosition.value.y - position.value.y;
  updateDirection(dx, dy);
  petState.value = "walking";
}
// 改变宠物状态
export function changeState(newState: PetState, skipDialogue = false) {
  petState.value = newState;
  // 记录状态触发
  recordState(newState);
  if (!skipDialogue) {
    showDialogue();
  }
  if (stateTimer.value) {
    clearTimeout(stateTimer.value);
  }
  switch (newState) {
    case "idle":
      stateTimer.value = window.setTimeout(() => {
        if (!isDragging.value) {
          if (isInSleepSchedule.value) {
            // 睡眠作息期间，只能进入睡眠状态
            changeState("sleeping");
            return;
          }
          // 闲暇期间的可用状态（排除睡眠相关状态）
          const freeStates: PetState[] = [
            "jumping",
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
            "grin",
            "scratch",
            "celebrate",
            "peek",
          ];
          const random = Math.random();
          if (random < 0.1 && !scheduleEnabled.value) {
            // 只有未启用作息时才允许随机睡眠
            changeState("sleeping");
          } else if (random < 0.85) {
            // 从可用状态中随机选择
            const state =
              freeStates[Math.floor(Math.random() * freeStates.length)];
            changeState(state);
          } else {
            moveToRandomPosition();
          }
        }
      }, IDLE_DURATION);
      break;
    case "sleeping":
      // 通知作息系统开始睡眠
      onSleepStart();
      // 作息模式下的睡眠持续时间由作息结束时间决定
      if (isInSleepSchedule.value) {
        // 睡眠作息期间，不设置固定定时器，等待作息结束
        // 但设置一个检查定时器，每分钟检查是否应该醒来
        stateTimer.value = window.setTimeout(() => {
          if (!isInSleepSchedule.value) {
            changeState("idle");
          } else {
            // 继续睡眠，递归调用
            changeState("sleeping");
          }
        }, 60000); // 每分钟检查一次
      } else {
        stateTimer.value = window.setTimeout(() => {
          onSleepEnd();
          changeState("idle");
        }, SLEEP_DURATION);
      }
      break;
    case "jumping":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        JUMP_DURATION,
      );
      break;
    case "happy":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        HAPPY_DURATION,
      );
      break;
    case "crying":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        CRYING_DURATION,
      );
      break;
    case "angry":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        ANGRY_DURATION,
      );
      break;
    case "fallen":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        FALLEN_DURATION,
      );
      break;
    case "scared":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        SCARED_DURATION,
      );
      break;
    case "thinking":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        THINKING_DURATION,
      );
      break;
    case "smug":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        SMUG_DURATION,
      );
      break;
    case "shy":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        SHY_DURATION,
      );
      break;
    case "confused":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        CONFUSED_DURATION,
      );
      break;
    case "hello":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        HELLO_DURATION,
      );
      break;
    case "sneeze":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        SNEEZE_DURATION,
      );
      break;
    case "grin":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        GRIN_DURATION,
      );
      break;
    case "scratch":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        SCRATCH_DURATION,
      );
      break;
    case "celebrate":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        CELEBRATE_DURATION,
      );
      break;
    case "peek":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        PEEK_DURATION,
      );
      break;
    case "chase":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        CHASE_DURATION,
      );
      break;
    case "hide":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        HIDE_DURATION,
      );
      break;
    case "dancing":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        DANCING_DURATION,
      );
      break;
    case "rolling":
      stateTimer.value = window.setTimeout(
        () => changeState("idle"),
        ROLLING_DURATION,
      );
      break;
    case "yawn":
      // 打哈欠后进入睡眠状态
      stateTimer.value = window.setTimeout(() => {
        changeState("sleeping");
      }, YAWN_DURATION);
      break;
    case "sleepy":
      // 睡眼朦胧后，检查是否仍在睡眠作息
      stateTimer.value = window.setTimeout(() => {
        if (isInSleepSchedule.value) {
          changeState("sleeping");
        } else {
          changeState("idle");
        }
      }, SLEEPY_DURATION);
      break;
    case "stretch":
      // 伸懒腰后进入空闲状态
      stateTimer.value = window.setTimeout(() => {
        onSleepEnd();
        changeState("idle");
      }, STRETCH_DURATION);
      break;
    case "sleepwalking":
      // 睡眠行走状态下不需要定时器，保持该状态直到拖拽结束
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
      const moveX = dx * ratio;
      const moveY = dy * ratio;
      position.value.x += moveX;
      position.value.y += moveY;
      // 根据移动方向设置朝向
      updateDirection(moveX, moveY);
      addFootprint(position.value.x, position.value.y, petDirection.value);
    }
  }

  if (isVisible.value && petState.value !== "chase") {
    const dx = targetPosition.value.x - position.value.x;
    const dy = targetPosition.value.y - position.value.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (
      distance > WALK_SPEED &&
      petState.value === "walking" &&
      !isDragging.value
    ) {
      const ratio = WALK_SPEED / distance;
      const moveX = dx * ratio;
      const moveY = dy * ratio;
      position.value.x += moveX;
      position.value.y += moveY;
      // 根据移动方向设置朝向
      updateDirection(moveX, moveY);
      addFootprint(position.value.x, position.value.y, petDirection.value);
    } else if (
      distance <= WALK_SPEED &&
      petState.value === "walking" &&
      !isDragging.value
    ) {
      position.value.x = targetPosition.value.x;
      position.value.y = targetPosition.value.y;
      // 恢复正面朝向
      petDirection.value = "front";
      changeState("idle");
    }
  }
  animationFrameId.value = requestAnimationFrame(animate);
}
// 点击宠物
export function handlePetClick() {
  if (isDragging.value) return;
  // 记录点击互动
  recordClick();
  // 睡眠作息期间，只响应睡眼朦胧表情
  if (petState.value === "sleeping" || petState.value === "sleepy") {
    // 睡眠或睡眼朦胧期间点击，显示睡眼朦胧状态和专有对话
    changeState("sleepy");
  } else {
    const reactions: PetState[] = [
      "happy",
      "scared",
      "fallen",
      "smug",
      "shy",
      "celebrate",
    ];
    changeState(reactions[Math.floor(Math.random() * reactions.length)]);
  }
}

// 双击宠物 - 触发特殊动作
export function handlePetDoubleClick() {
  if (isDragging.value) return;
  // 记录双击互动
  recordDoubleClick();
  // 睡眠作息期间，只响应睡眼朦胧表情
  if (petState.value === "sleeping" || petState.value === "sleepy") {
    changeState("sleepy");
    return;
  }
  // 双击触发跳舞或翻滚
  const specialActions: PetState[] = ["dancing", "rolling"];
  changeState(
    specialActions[Math.floor(Math.random() * specialActions.length)],
  );
}
// 拖拽相关
let dragOffset = { x: 0, y: 0 };
// 初始化定时器
let initTimer: ReturnType<typeof setTimeout> | null = null;
let initTimer2: ReturnType<typeof setTimeout> | null = null;

export function handleDragStart(e: MouseEvent) {
  isDragging.value = true;
  setPassthrough(false);
  // 记录拖拽互动
  recordDrag();
  dragOffset = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y,
  };
  if (stateTimer.value) clearTimeout(stateTimer.value);
  // 睡眠状态下拖拽时进入睡眠行走状态（手脚会动，眼睛像睡眼朦胧）
  if (petState.value === "sleeping" || petState.value === "sleepy") {
    petState.value = "sleepwalking";
  } else {
    petState.value = "walking";
  }
  window.addEventListener("mousemove", handleDragging);
  window.addEventListener("mouseup", handleDragEnd);
}
function handleDragging(e: MouseEvent) {
  if (!isDragging.value || !isVisible.value) return;
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  // 计算移动方向
  const newX = mouseX - dragOffset.x;
  const newY = mouseY - dragOffset.y;
  const dx = newX - position.value.x;
  const dy = newY - position.value.y;
  // 根据移动方向设置朝向
  updateDirection(dx, dy);
  position.value = { x: newX, y: newY };
  addFootprint(position.value.x, position.value.y, petDirection.value);
  targetPosition.value = { ...position.value };
  const maxX = screenSize.value.width - PET_SIZE;
  const maxY = screenSize.value.height - PET_SIZE - 20;
  if (position.value.x < 0) position.value.x = 0;
  if (position.value.x > maxX) position.value.x = maxX;
  if (position.value.y < TOP_MARGIN) position.value.y = TOP_MARGIN;
  if (position.value.y > maxY) position.value.y = maxY;
}
function handleDragEnd() {
  if (!isDragging.value) return;
  isDragging.value = false;
  targetPosition.value = { ...position.value };
  window.removeEventListener("mousemove", handleDragging);
  window.removeEventListener("mouseup", handleDragEnd);
  // 恢复正面朝向
  petDirection.value = "front";
  // 睡眠行走状态下拖拽结束后恢复睡眠状态
  if (
    petState.value === "sleepwalking" ||
    petState.value === "sleeping" ||
    petState.value === "sleepy"
  ) {
    changeState("sleeping");
  } else {
    changeState("idle");
  }
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
  // 调试面板、作息弹窗、统计弹窗或右键菜单打开时，不自动控制穿透
  if (
    isDebugPanelOpen.value ||
    isScheduleModalOpen.value ||
    isStatsModalOpen.value ||
    isContextMenuOpen.value
  )
    return;
  const onPet = isMouseOnPet(e.clientX, e.clientY);
  setPassthrough(!onPet);
}
// 初始化宠物
export function initPet(checkSystemThemeFn: () => void) {
  checkSystemThemeFn();
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", checkSystemThemeFn);

  // 启动作息监控
  startScheduleMonitor();

  // 启动天气服务
  initWeatherService();

  if (isVisible.value) {
    animate();
    // 每次启动都打招呼
    initTimer = setTimeout(() => {
      // 显示问候语
      const greeting = getTimeGreeting();
      showCustomDialogue(greeting);

      if (isInSleepSchedule.value) {
        // 睡眠作息：打招呼 -> 停顿 -> 打哈欠 -> 睡眠
        changeState("hello", true);
        initTimer2 = setTimeout(() => {
          changeState("yawn", true);
        }, HELLO_DURATION + 1500);
      } else {
        changeState("hello", true);
      }
    }, 500);
  }
  window.addEventListener("resize", handleResize);
  window.addEventListener("mousemove", handleMouseMove);
  (window as any).togglePet = togglePet;
}
// 清理
export function cleanupPet() {
  if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value);
  if (stateTimer.value) clearTimeout(stateTimer.value);
  if (initTimer) clearTimeout(initTimer);
  if (initTimer2) clearTimeout(initTimer2);
  // 停止作息监控
  stopScheduleMonitor();
  // 停止天气服务
  cleanupWeatherService();
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("mousemove", handleMouseMove);
}
