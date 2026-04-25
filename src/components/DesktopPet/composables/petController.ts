import {
  IDLE_DURATION,
  PET_SIZE,
  SLEEP_DURATION,
  STATE_DURATIONS,
  TOP_MARGIN,
  WALK_SPEED,
  YAWN_DURATION,
  NON_MOVING_STATES,
  HELLO_DURATION,
  WORK_STATES,
  WORK_REST_DURATION,
} from "../constants";
import { workBusyMessages } from "../dialogues";
import type { PetState } from "../types";
import {
  animationFrameId,
  isDragging,
  isInSleepSchedule,
  isAnyUiOpen,
  isVisible,
  mousePosition,
  petDirection,
  petState,
  position,
  scheduleEnabled,
  screenSize,
  stateTimer,
  targetPosition,
  workEndTime,
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
import {
  initAttributes,
  cleanupAttributes,
  registerAttributeCallbacks,
  onWorkComplete,
  addInteractionExperience,
  getHealthStatus,
} from "./attributes";

// 是否刚从工作状态退出（用于增加休息间隔）
let justFinishedWork = false;

// 判断是否是打工状态
export function isWorkState(state: PetState): boolean {
  return WORK_STATES.includes(state);
}

// 停止工作状态（供强制终止调用）
export function stopWork(): void {
  justFinishedWork = true;
  changeState("idle");
}

// 显示打工忙碌台词
function showWorkBusyDialogue() {
  const message =
    workBusyMessages[Math.floor(Math.random() * workBusyMessages.length)];
  showCustomDialogue(message);
}

function isMouseOnPet(x: number, y: number): boolean {
  const petX = position.value.x;
  const petY = position.value.y;
  const petCenterX = petX + PET_SIZE / 2;
  const petCenterY = petY + PET_SIZE / 2;
  const distance = Math.sqrt((x - petCenterX) ** 2 + (y - petCenterY) ** 2);
  return distance < PET_SIZE / 2 + 15;
}

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
// 平滑结束跳跃类动画（如庆祝、跳跃等）
// 等待动画回到地面位置后再切换状态
function smoothExitJumpAnimation(): Promise<void> {
  return new Promise((resolve) => {
    const petBody = document.querySelector(".pet-body") as HTMLElement;
    if (!petBody) {
      resolve();
      return;
    }

    // 获取动画当前时间（0-1 表示进度）
    const animations = petBody.getAnimations();
    const animation = animations.find((a) => {
      // CSSAnimation 是 Animation 的子类，有 animationName 属性
      if ("animationName" in a) {
        const name = (a as CSSAnimation).animationName;
        return (
          name.includes("celebrate-jump") ||
          name.includes("jump") ||
          name.includes("dance-body")
        );
      }
      return false;
    });

    if (animation) {
      // 获取当前进度
      const progress = animation.currentTime as number;
      const duration = (animation.effect as KeyframeEffect).getTiming()
        .duration as number;

      if (duration > 0) {
        // 计算当前是上升还是下降阶段
        // celebrate-jump: 0% 在地面，50% 在最高点，100% 在地面
        const normalizedProgress = (progress % duration) / duration;

        // 如果在 0-0.5（上升阶段）或 0.5-1（下降阶段但未到地面）
        // 需要等待回到地面
        if (normalizedProgress > 0.1 && normalizedProgress < 0.9) {
          // 计算等待时间：等待动画回到地面
          // 如果在上升阶段（0-0.5），需要等待到 1.0
          // 如果在下降阶段（0.5-1），需要等待到 1.0
          const waitTime = duration * (1 - normalizedProgress);
          setTimeout(resolve, waitTime);
          return;
        }
      }
    }

    resolve();
  });
}

// 改变宠物状态
export async function changeState(newState: PetState, skipDialogue = false) {
  // 对于从跳跃类状态切换到其他状态，先平滑过渡
  const jumpStates: PetState[] = ["celebrate", "jumping", "dancing"];
  const isExitingJumpState =
    jumpStates.includes(petState.value) && !jumpStates.includes(newState);

  if (isExitingJumpState) {
    await smoothExitJumpAnimation();
  }

  // 记录状态触发（状态变化时才记录）
  if (petState.value !== newState) {
    recordState(newState);
  }
  petState.value = newState;
  if (!skipDialogue) {
    showDialogue();
  }
  if (stateTimer.value) {
    clearTimeout(stateTimer.value);
  }

  // 获取状态持续时间
  const duration = STATE_DURATIONS[newState];

  switch (newState) {
    case "idle": {
      // 如果刚从工作状态退出，使用更长的休息间隔
      const idleDuration = justFinishedWork
        ? WORK_REST_DURATION
        : IDLE_DURATION;
      justFinishedWork = false; // 重置标记

      stateTimer.value = window.setTimeout(() => {
        if (!isDragging.value) {
          if (isInSleepSchedule.value) {
            // 睡眠作息期间，只能进入睡眠状态
            changeState("sleeping");
            return;
          }
          // 闲暇期间的可用状态（排除打工和睡眠相关状态）
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

          // 健康状态影响 idle 行为
          const healthStatus = getHealthStatus();
          const random = Math.random();

          if (random < 0.1 && !scheduleEnabled.value) {
            // 只有未启用作息时才允许随机睡眠
            changeState("sleeping");
          } else if (healthStatus === "happy" && random < 0.3) {
            // 高健康时倾向开心表情
            const happyStates: PetState[] = [
              "happy",
              "celebrate",
              "hello",
              "dancing",
            ];
            changeState(
              happyStates[Math.floor(Math.random() * happyStates.length)],
            );
          } else if (healthStatus === "sick" && random < 0.4) {
            // 低健康时频繁打喷嚏
            changeState("sneeze");
          } else if (random < 0.85) {
            // 从可用状态中随机选择
            const state =
              freeStates[Math.floor(Math.random() * freeStates.length)];
            changeState(state);
          } else {
            moveToRandomPosition();
          }
        }
      }, idleDuration);
      break;
    }

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
      }, duration);
      break;

    case "stretch":
      // 伸懒腰后进入空闲状态
      stateTimer.value = window.setTimeout(() => {
        onSleepEnd();
        changeState("idle");
      }, duration);
      break;

    case "sleepwalking":
      // 睡眠行走状态下不需要定时器，保持该状态直到拖拽结束
      break;

    default:
      // 大多数状态完成后回到 idle
      if (duration) {
        // 打工状态特殊处理：记录结束时间，支持拖拽后恢复计时
        if (isWorkState(newState)) {
          workEndTime.value = Date.now() + duration;
        }
        stateTimer.value = window.setTimeout(() => {
          // 打工状态结束时清除结束时间，设置休息间隔标记，发放工资
          if (isWorkState(petState.value)) {
            workEndTime.value = null;
            justFinishedWork = true;
            onWorkComplete(petState.value);
          }
          changeState("idle");
        }, duration);
      }
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
  // 互动经验
  addInteractionExperience();
  // 睡眠作息期间，只响应睡眼朦胧表情
  if (petState.value === "sleeping" || petState.value === "sleepy") {
    // 睡眠或睡眼朦胧期间点击，显示睡眼朦胧状态和专有对话
    changeState("sleepy");
  } else if (isWorkState(petState.value)) {
    // 打工状态下，显示忙碌台词，不改变状态
    showWorkBusyDialogue();
  } else {
    // 点击反应（移除工作状态，工作需通过属性面板触发）
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
  // 互动经验
  addInteractionExperience();
  // 睡眠作息期间，只响应睡眼朦胧表情
  if (petState.value === "sleeping" || petState.value === "sleepy") {
    changeState("sleepy");
    return;
  }
  // 打工状态下，显示忙碌台词，不改变状态
  if (isWorkState(petState.value)) {
    showWorkBusyDialogue();
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
// 拖拽前的状态（用于打工状态拖拽后恢复）
let stateBeforeDrag: PetState | null = null;
// 拖拽开始时的打工剩余时间
let workRemainingBeforeDrag: number | null = null;
// 初始化定时器
let initTimer: ReturnType<typeof setTimeout> | null = null;
let initTimer2: ReturnType<typeof setTimeout> | null = null;

export function handleDragStart(e: MouseEvent) {
  // 只响应左键，右键点击不触发拖拽
  if (e.button !== 0) return;
  isDragging.value = true;
  setPassthrough(false);
  // 记录拖拽互动
  recordDrag();
  dragOffset = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y,
  };
  if (stateTimer.value) clearTimeout(stateTimer.value);
  // 保存当前状态
  stateBeforeDrag = petState.value;
  // 打工状态下，保存剩余时间用于拖拽结束后恢复
  if (isWorkState(petState.value) && workEndTime.value) {
    workRemainingBeforeDrag = workEndTime.value - Date.now();
  }
  // 睡眠状态下拖拽时进入睡眠行走状态（手脚会动，眼睛像睡眼朦胧）
  if (petState.value === "sleeping" || petState.value === "sleepy") {
    petState.value = "sleepwalking";
  }
  // 打工状态下拖拽时保持当前状态，不改变
  // 其他状态下拖拽时进入行走状态
  if (!isWorkState(petState.value) && petState.value !== "sleepwalking") {
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

  // 判断拖拽前是否是打工状态
  const wasWorking = stateBeforeDrag && isWorkState(stateBeforeDrag);

  // 睡眠行走状态下拖拽结束后恢复睡眠状态
  if (
    petState.value === "sleepwalking" ||
    petState.value === "sleeping" ||
    petState.value === "sleepy"
  ) {
    changeState("sleeping");
  } else if (wasWorking && stateBeforeDrag) {
    // 打工状态下拖拽结束后恢复原来的打工状态
    // 使用拖拽前保存的剩余时间，确保进度条同步
    petState.value = stateBeforeDrag;
    const remainingTime = workRemainingBeforeDrag;
    workRemainingBeforeDrag = null;
    if (remainingTime !== null && remainingTime > 0) {
      // 更新 workEndTime，使进度条正确同步
      workEndTime.value = Date.now() + remainingTime;
      stateTimer.value = window.setTimeout(() => {
        workEndTime.value = null;
        changeState("idle");
      }, remainingTime);
    } else {
      workEndTime.value = null;
      changeState("idle");
    }
  } else {
    changeState("idle");
  }

  stateBeforeDrag = null;
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
  // 任意 UI 弹窗打开时，不自动控制穿透
  if (isAnyUiOpen.value) return;
  // 检查是否在进度条区域内（进度条在宠物下方）
  const progressElement = document.querySelector(
    ".work-progress-bar",
  ) as HTMLElement;
  if (progressElement) {
    const rect = progressElement.getBoundingClientRect();
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      // 在进度条区域内，禁用穿透以允许交互
      setPassthrough(false);
      return;
    }
  }
  const onPet = isMouseOnPet(e.clientX, e.clientY);
  setPassthrough(!onPet);
}
// 初始化宠物
export function initPet() {
  // 初始化属性系统
  initAttributes();
  // 注册属性系统回调
  registerAttributeCallbacks({
    requestStateChange: (state) => changeState(state),
    requestStopWork: () => stopWork(),
  });

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
  // 停止属性系统
  cleanupAttributes();
  // 停止作息监控
  stopScheduleMonitor();
  // 停止天气服务
  cleanupWeatherService();
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("mousemove", handleMouseMove);
}
