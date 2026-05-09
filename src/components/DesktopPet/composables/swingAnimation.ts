import { ref, computed } from "vue";
import { showSwing } from "./sharedState";

// 秋千动画配置
export const swingConfig = ref({
  // 默认摆动幅度（像素）
  defaultAmplitude: 12,
  // 当前摆动幅度（像素）- 会随推力变化
  amplitude: 12,
  // 最大摆动幅度（像素）
  maxAmplitude: 40,
  // 摆动周期（毫秒）
  period: 3000,
  // 缩放幅度（相对于幅度的比例）
  scaleRatio: 0.005,
  // 幅度衰减速度（每秒衰减的幅度）
  decayRate: 8,
});

// 当前秋千动画帧 ID
let swingAnimationId: number | null = null;
// 上一次更新时间（用于计算衰减）
let lastUpdateTime: number = 0;
// 当前相位角（弧度，0 表示最高点后方，π 表示最高点前方）
let currentPhase = 0;
// 角速度（弧度/毫秒）
const angularVelocity = computed(
  () => (2 * Math.PI) / swingConfig.value.period,
);

// 当前动画状态（用于组件绑定）
export const swingTransform = computed(() => {
  if (!showSwing.value) {
    return "translateY(0) scale(1)";
  }
  return swingCurrentTransform.value;
});

// 当前变换值
const swingCurrentTransform = ref("translateY(0) scale(1)");

// 缓动函数 - ease-in-out
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// 秋千动画循环
function swingAnimationLoop(timestamp: number) {
  if (!showSwing.value) {
    swingAnimationId = null;
    return;
  }

  // 计算时间增量
  const deltaTime = lastUpdateTime > 0 ? timestamp - lastUpdateTime : 16;
  lastUpdateTime = timestamp;

  // 计算衰减
  if (swingConfig.value.amplitude > swingConfig.value.defaultAmplitude) {
    const decayDelta = (swingConfig.value.decayRate * deltaTime) / 1000;
    swingConfig.value.amplitude = Math.max(
      swingConfig.value.amplitude - decayDelta,
      swingConfig.value.defaultAmplitude,
    );
  }

  // 更新相位角
  currentPhase += angularVelocity.value * deltaTime;
  // 保持相位在 0-2π 范围内
  if (currentPhase >= 2 * Math.PI) {
    currentPhase -= 2 * Math.PI;
  }

  // 计算位置：
  // phase = 0 或 2π: 最后方位置（y 最小，秋千向后）
  // phase = π/2: 中间位置，向前运动中
  // phase = π: 最前方位置（y 最大，秋千向前）
  // phase = 3π/2: 中间位置，向后运动中
  const sineValue = -Math.sin(currentPhase); // 负号：phase=0 时秋千在最后方（y 最小）

  // 计算垂直偏移
  const yOffset = sineValue * swingConfig.value.amplitude;

  // 计算缩放（模拟前后透视，随幅度变化）
  // sineValue > 0: 秋千在前方，应该变大
  // sineValue < 0: 秋千在后方，应该变小
  const scaleOffset =
    sineValue * swingConfig.value.amplitude * swingConfig.value.scaleRatio;
  const scale = 1 + scaleOffset;

  // 更新变换
  swingCurrentTransform.value = `translateY(${yOffset}px) scale(${scale})`;

  // 继续动画
  swingAnimationId = requestAnimationFrame(swingAnimationLoop);
}

// 启动秋千动画
export function startSwingAnimation() {
  if (swingAnimationId !== null) return;

  // 重置幅度为默认值
  swingConfig.value.amplitude = swingConfig.value.defaultAmplitude;
  lastUpdateTime = 0;
  // 从最后方开始摆动
  currentPhase = 0;
  swingAnimationId = requestAnimationFrame(swingAnimationLoop);
}

// 停止秋千动画
export function stopSwingAnimation() {
  if (swingAnimationId !== null) {
    cancelAnimationFrame(swingAnimationId);
    swingAnimationId = null;
  }
  // 重置变换
  swingCurrentTransform.value = "translateY(0) scale(1)";
  lastUpdateTime = 0;
}

// 推动秋千 - 点击宠物时调用
// 推力始终向后（向屏幕后方/上方）
export function pushSwing() {
  if (!showSwing.value) return;

  const pushAmount = 15;

  // 计算当前运动方向：
  // cos(currentPhase) > 0: 向前运动（从前方向后方移动，即向上）
  // cos(currentPhase) < 0: 向后运动（从后方向前方移动，即向下）
  // cos(currentPhase) = 0: 在最高点，速度为 0
  const velocityDirection = Math.cos(currentPhase);

  if (velocityDirection > 0) {
    // 正在向后运动（从最前方 -> 最后方），顺势增加幅度
    swingConfig.value.amplitude = Math.min(
      swingConfig.value.amplitude + pushAmount,
      swingConfig.value.maxAmplitude,
    );
  } else if (velocityDirection < 0) {
    // 正在向前运动（从最后方 -> 最前方），逆势推动
    // 先增加幅度，然后调整相位使其开始向后运动
    swingConfig.value.amplitude = Math.min(
      swingConfig.value.amplitude + pushAmount,
      swingConfig.value.maxAmplitude,
    );
    // 将相位调整到对应位置，使秋千立即开始向后运动
    // 当前在 sin 波的某个位置，需要"弹"到更靠后的位置
    // 简单做法：反转相位方向
    currentPhase = Math.PI - currentPhase;
    if (currentPhase < 0) currentPhase += 2 * Math.PI;
    if (currentPhase >= 2 * Math.PI) currentPhase -= 2 * Math.PI;
  } else {
    // 在最高点，直接增加幅度
    swingConfig.value.amplitude = Math.min(
      swingConfig.value.amplitude + pushAmount,
      swingConfig.value.maxAmplitude,
    );
  }
}

// 更新秋千配置
export function updateSwingConfig(config: Partial<typeof swingConfig.value>) {
  Object.assign(swingConfig.value, config);
}
