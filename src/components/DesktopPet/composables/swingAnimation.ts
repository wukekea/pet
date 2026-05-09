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
  scaleRatio: 0.0025,
  // 幅度衰减速度（每秒衰减的幅度）
  decayRate: 8,
});

// 当前秋千动画帧 ID
let swingAnimationId: number | null = null;
// 动画开始时间
let swingStartTime: number = 0;
// 上一次更新时间（用于计算衰减）
let lastUpdateTime: number = 0;

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

  // 计算衰减
  if (lastUpdateTime > 0) {
    const deltaTime = (timestamp - lastUpdateTime) / 1000; // 转换为秒
    // 如果幅度大于默认值，逐渐衰减
    if (swingConfig.value.amplitude > swingConfig.value.defaultAmplitude) {
      swingConfig.value.amplitude -= swingConfig.value.decayRate * deltaTime;
      // 确保不低于默认值
      if (swingConfig.value.amplitude < swingConfig.value.defaultAmplitude) {
        swingConfig.value.amplitude = swingConfig.value.defaultAmplitude;
      }
    }
  }
  lastUpdateTime = timestamp;

  // 计算动画进度（0-1）
  const elapsed = timestamp - swingStartTime;
  const progress =
    (elapsed % swingConfig.value.period) / swingConfig.value.period;

  // 使用正弦波计算位置，配合 ease-in-out 缓动
  // 0 -> 0.5: 向后摆动（向上）
  // 0.5 -> 1: 向前摆动（向下）
  const sineValue = Math.sin(progress * Math.PI * 2);

  // 应用缓动让摆动更自然
  const easedProgress = easeInOut(Math.abs(sineValue));

  // 计算垂直偏移
  const yOffset = sineValue * swingConfig.value.amplitude;

  // 计算缩放（模拟前后透视，随幅度变化）
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
  swingStartTime = performance.now();
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
export function pushSwing() {
  if (!showSwing.value) return;

  // 增加摆动幅度，不超过最大值
  const pushAmount = 15; // 每次推动增加的幅度
  swingConfig.value.amplitude = Math.min(
    swingConfig.value.amplitude + pushAmount,
    swingConfig.value.maxAmplitude,
  );
}

// 更新秋千配置
export function updateSwingConfig(config: Partial<typeof swingConfig.value>) {
  Object.assign(swingConfig.value, config);
}
