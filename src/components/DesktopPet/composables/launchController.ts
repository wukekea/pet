/**
 * 蓄力发射控制器
 * 处理长按蓄力、发射上升、降落伞下落的完整流程
 */
import {
  CHARGE_MIN_DURATION,
  CHARGE_MAX_DURATION,
  CHARGE_MAX_HEIGHT,
  CHARGE_MIN_HEIGHT,
  CHARGE_RISE_SPEED_BASE,
  CHARGE_RISE_SPEED_MAX,
  PARACHUTE_FALL_SPEED,
  PARACHUTE_SWAY_AMPLITUDE,
  PARACHUTE_SWAY_SPEED,
} from "../constants";
import {
  petState,
  petDirection,
  position,
  isCharging,
  chargeStartTime,
  chargeProgress,
  launchStartPos,
  launchTargetHeight,
  launchRiseSpeed,
  currentLaunchHeight,
  parachuteSwayOffset,
  showParachute,
} from "./sharedState";

// 蓄力更新定时器
let chargeUpdateTimer: number | null = null;

// 飞行动画定时器
let flyingAnimationFrame: number | null = null;

// 摆动角度
let swayAngle = 0;

// 当前飞行阶段：'rising' | 'falling' | 'idle'
let flyingPhase: "rising" | "falling" | "idle" = "idle";

/**
 * 开始蓄力
 */
export function startCharging(): void {
  if (flyingPhase !== "idle") return;
  if (petState.value === "sleeping") return;

  isCharging.value = true;
  chargeStartTime.value = Date.now();
  chargeProgress.value = 0;

  // 记录起始位置
  launchStartPos.value = { ...position.value };

  // 开始更新蓄力进度（不立即改变状态）
  updateChargeProgress();
}

/**
 * 更新蓄力进度
 */
function updateChargeProgress(): void {
  if (!isCharging.value || chargeStartTime.value === null) return;

  const elapsed = Date.now() - chargeStartTime.value;
  chargeProgress.value = Math.min(elapsed / CHARGE_MAX_DURATION, 1);

  // 继续更新
  chargeUpdateTimer = requestAnimationFrame(updateChargeProgress);
}

/**
 * 结束蓄力，判断是否发射
 */
export function endCharging(): void {
  if (!isCharging.value) return;

  // 停止更新蓄力进度
  if (chargeUpdateTimer !== null) {
    cancelAnimationFrame(chargeUpdateTimer);
    chargeUpdateTimer = null;
  }

  const chargeDuration =
    chargeStartTime.value !== null ? Date.now() - chargeStartTime.value : 0;

  // 重置蓄力状态
  isCharging.value = false;
  chargeStartTime.value = null;

  // 蓄力时间不足，不发射，重置进度
  if (chargeDuration < CHARGE_MIN_DURATION) {
    chargeProgress.value = 0;
    return;
  }

  // 进入发射状态
  petState.value = "launching";

  // 计算发射参数
  const progress = chargeProgress.value;
  launchTargetHeight.value =
    CHARGE_MIN_HEIGHT + (CHARGE_MAX_HEIGHT - CHARGE_MIN_HEIGHT) * progress;
  launchRiseSpeed.value =
    CHARGE_RISE_SPEED_BASE +
    (CHARGE_RISE_SPEED_MAX - CHARGE_RISE_SPEED_BASE) * progress;

  // 重置飞行高度
  currentLaunchHeight.value = 0;
  parachuteSwayOffset.value = 0;

  // 开始发射
  startLaunch();
}

/**
 * 开始发射上升
 */
function startLaunch(): void {
  flyingPhase = "rising";
  petDirection.value = "front"; // 面向用户

  // 启动上升动画
  flyingAnimationFrame = requestAnimationFrame(animateRise);
}

/**
 * 发射上升动画（减速运动）
 * 使用抛物线原理：速度随高度增加而减小
 */
function animateRise(): void {
  // 只有在上升阶段才继续
  if (flyingPhase !== "rising") return;

  // 计算当前进度（0 到 1）
  const progress = currentLaunchHeight.value / launchTargetHeight.value;

  // 速度随高度增加而减小：初始速度 * (1 - progress^2)
  // 使用平方让减速更明显，接近顶部时速度趋近于0
  const currentSpeed =
    launchRiseSpeed.value * Math.max(0.1, 1 - progress * progress);

  // 更新高度
  currentLaunchHeight.value += currentSpeed;

  // 更新位置（向上移动）
  position.value = {
    x: launchStartPos.value.x,
    y: launchStartPos.value.y - currentLaunchHeight.value,
  };

  // 检查是否到达目标高度（或速度已经很小）
  if (
    currentLaunchHeight.value >= launchTargetHeight.value ||
    currentSpeed < 0.5
  ) {
    // 到达最高点，切换到降落伞状态
    currentLaunchHeight.value = launchTargetHeight.value;
    startParachuting();
    return;
  }

  // 继续动画
  flyingAnimationFrame = requestAnimationFrame(animateRise);
}

/**
 * 开始降落伞下落
 */
function startParachuting(): void {
  flyingPhase = "falling";
  petState.value = "parachuting";
  showParachute.value = true;
  swayAngle = 0;

  // 启动下落动画
  flyingAnimationFrame = requestAnimationFrame(animateFall);
}

/**
 * 降落伞下落动画
 */
function animateFall(): void {
  // 只有在下落阶段才继续
  if (flyingPhase !== "falling") return;

  // 更新摆动角度
  swayAngle += PARACHUTE_SWAY_SPEED;
  parachuteSwayOffset.value = Math.sin(swayAngle) * PARACHUTE_SWAY_AMPLITUDE;

  // 更新高度（下落）
  currentLaunchHeight.value -= PARACHUTE_FALL_SPEED;

  // 检查是否落地
  if (currentLaunchHeight.value <= 0) {
    // 精确落地到起始位置
    currentLaunchHeight.value = 0;
    position.value = {
      x: launchStartPos.value.x,
      y: launchStartPos.value.y,
    };

    // 结束降落伞状态
    endParachuting();
    return;
  }

  // 更新位置（带摆动）
  position.value = {
    x: launchStartPos.value.x + parachuteSwayOffset.value,
    y: launchStartPos.value.y - currentLaunchHeight.value,
  };

  // 继续动画
  flyingAnimationFrame = requestAnimationFrame(animateFall);
}

/**
 * 结束降落伞状态
 */
function endParachuting(): void {
  // 重置所有状态
  flyingPhase = "idle";
  showParachute.value = false;
  chargeProgress.value = 0;
  parachuteSwayOffset.value = 0;
  currentLaunchHeight.value = 0;
  petDirection.value = "front";

  // 停止动画
  if (flyingAnimationFrame !== null) {
    cancelAnimationFrame(flyingAnimationFrame);
    flyingAnimationFrame = null;
  }

  // 恢复空闲状态
  petState.value = "idle";
}

/**
 * 取消蓄力（用于被打断的情况）
 */
export function cancelCharging(): void {
  if (chargeUpdateTimer !== null) {
    cancelAnimationFrame(chargeUpdateTimer);
    chargeUpdateTimer = null;
  }

  isCharging.value = false;
  chargeStartTime.value = null;
  chargeProgress.value = 0;

  // 只有在蓄力阶段（还没开始飞行）才重置状态
  if (flyingPhase === "idle" && petState.value === "launching") {
    petState.value = "idle";
  }
}

/**
 * 检查是否处于飞行状态
 */
export function isFlyingState(): boolean {
  return flyingPhase !== "idle";
}
