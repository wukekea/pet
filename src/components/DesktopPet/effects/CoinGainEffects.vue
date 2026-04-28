<script setup lang="ts">
// 金币增长特效组件 - 打工完成后在宠物头顶显示金币收入动画
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps<{
  amount: number; // 获得的金币数量
}>();

const emit = defineEmits<{
  complete: []; // 动画播放完毕时触发
}>();

// 滚动数字显示
const displayNumber = ref(0);

// 数字滚动动画
let rafId: number | null = null;
let startTime: number | null = null;
const ROLL_DURATION = 1200; // 数字滚动持续时间（毫秒）
const TOTAL_DURATION = 2800; // 整体特效持续时间（毫秒）

function animateNumber(timestamp: number) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;

  // 延迟 400ms 后开始滚动（等金币弹出后）
  const rollElapsed = Math.max(0, elapsed - 400);
  const progress = Math.min(1, rollElapsed / ROLL_DURATION);

  // easeOutExpo 缓动 - 快速开始，优雅减速
  const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
  displayNumber.value = Math.round(eased * props.amount);

  if (progress < 1) {
    rafId = requestAnimationFrame(animateNumber);
  }
}

let completeTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  rafId = requestAnimationFrame(animateNumber);
  completeTimer = setTimeout(() => {
    emit("complete");
  }, TOTAL_DURATION);
});

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId);
  if (completeTimer) clearTimeout(completeTimer);
});
</script>

<template>
  <div class="coin-gain-effects">
    <!-- 底部光晕 -->
    <div class="coin-glow"></div>

    <!-- 主金币 - 从宠物头顶弹出 -->
    <div class="coin-main">
      <svg
        viewBox="0 0 40 40"
        class="coin-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- 金币外圈 -->
        <defs>
          <radialGradient id="coinGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stop-color="#ffe566" />
            <stop offset="40%" stop-color="#ffc833" />
            <stop offset="80%" stop-color="#e5a000" />
            <stop offset="100%" stop-color="#cc8800" />
          </radialGradient>
          <radialGradient id="coinInner" cx="45%" cy="40%" r="50%">
            <stop offset="0%" stop-color="#fff0a0" />
            <stop offset="50%" stop-color="#ffcc33" />
            <stop offset="100%" stop-color="#d4960a" />
          </radialGradient>
          <!-- 金币光泽 -->
          <linearGradient id="coinShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="rgba(255,255,255,0.6)" />
            <stop offset="40%" stop-color="rgba(255,255,255,0)" />
            <stop offset="60%" stop-color="rgba(255,255,255,0)" />
            <stop offset="100%" stop-color="rgba(255,255,255,0.2)" />
          </linearGradient>
        </defs>
        <!-- 硬币侧面（厚度） -->
        <ellipse cx="20" cy="22" rx="16" ry="16" fill="#b8860b" />
        <!-- 硬币正面 -->
        <circle cx="20" cy="20" r="16" fill="url(#coinGrad)" />
        <!-- 内圈 -->
        <circle
          cx="20"
          cy="20"
          r="12"
          fill="url(#coinInner)"
          stroke="#d4960a"
          stroke-width="0.8"
        />
        <!-- ¥ 符号 -->
        <text
          x="20"
          y="25"
          text-anchor="middle"
          font-size="14"
          font-weight="bold"
          fill="#9a6e00"
          font-family="serif"
        >
          ¥
        </text>
        <!-- 高光 -->
        <circle cx="20" cy="20" r="16" fill="url(#coinShine)" />
        <!-- 边缘高光弧 -->
        <path
          d="M 10 10 A 16 16 0 0 1 30 10"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </div>

    <!-- 小金币粒子 -->
    <div class="coin-particle cp-1">
      <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="#ffc833"
          stroke="#d4960a"
          stroke-width="0.5"
        />
        <circle cx="8" cy="8" r="5" fill="#ffe066" />
      </svg>
    </div>
    <div class="coin-particle cp-2">
      <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="#ffc833"
          stroke="#d4960a"
          stroke-width="0.5"
        />
        <circle cx="8" cy="8" r="5" fill="#ffe066" />
      </svg>
    </div>
    <div class="coin-particle cp-3">
      <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="8"
          cy="8"
          r="7"
          fill="#ffc833"
          stroke="#d4960a"
          stroke-width="0.5"
        />
        <circle cx="8" cy="8" r="5" fill="#ffe066" />
      </svg>
    </div>

    <!-- 闪光星星 -->
    <div class="sparkle sp-1">✦</div>
    <div class="sparkle sp-2">✧</div>
    <div class="sparkle sp-3">✦</div>
    <div class="sparkle sp-4">✧</div>

    <!-- 金币数量文字 -->
    <div class="coin-amount">
      <span class="coin-plus">+</span>
      <span class="coin-number">{{ displayNumber }}</span>
    </div>
  </div>
</template>

<style scoped>
.coin-gain-effects {
  position: absolute;
  inset: -50px;
  pointer-events: none;
  overflow: visible;
}

/* ===== 底部光晕 ===== */
.coin-glow {
  position: absolute;
  left: 50%;
  top: 30%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  background: radial-gradient(
    circle,
    rgba(255, 200, 51, 0.4) 0%,
    rgba(255, 200, 51, 0.15) 40%,
    transparent 70%
  );
  border-radius: 50%;
  animation: glow-burst 2.8s ease-out forwards;
}

@keyframes glow-burst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3);
  }
  15% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
  40% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.5);
  }
}

/* ===== 主金币 ===== */
.coin-main {
  position: absolute;
  left: 50%;
  top: 30%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  animation: coin-bounce-up 2.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  filter: drop-shadow(0 2px 6px rgba(255, 180, 0, 0.5));
}

.coin-svg {
  width: 100%;
  height: 100%;
  animation: coin-spin 1s ease-out 0.1s both;
}

@keyframes coin-bounce-up {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0) translateY(20px);
  }
  8% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.3) translateY(-15px);
  }
  15% {
    transform: translate(-50%, -50%) scale(0.95) translateY(-8px);
  }
  22% {
    transform: translate(-50%, -50%) scale(1.05) translateY(-12px);
  }
  30% {
    transform: translate(-50%, -50%) scale(1) translateY(-10px);
  }
  75% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) translateY(-10px);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8) translateY(-35px);
  }
}

@keyframes coin-spin {
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(720deg);
  }
}

/* ===== 小金币粒子 ===== */
.coin-particle {
  position: absolute;
  width: 12px;
  height: 12px;
  opacity: 0;
  filter: drop-shadow(0 1px 3px rgba(255, 180, 0, 0.4));
}

.cp-1 {
  left: 50%;
  top: 30%;
  animation: particle-burst-1 1.6s ease-out 0.15s forwards;
}

.cp-2 {
  left: 50%;
  top: 30%;
  animation: particle-burst-2 1.4s ease-out 0.25s forwards;
}

.cp-3 {
  left: 50%;
  top: 30%;
  animation: particle-burst-3 1.5s ease-out 0.1s forwards;
}

@keyframes particle-burst-1 {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  15% {
    opacity: 1;
    transform: translate(calc(-50% - 22px), calc(-50% - 18px)) scale(1.1)
      rotate(30deg);
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% - 35px), calc(-50% - 40px)) scale(0.4)
      rotate(180deg);
  }
}

@keyframes particle-burst-2 {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  15% {
    opacity: 1;
    transform: translate(calc(-50% + 20px), calc(-50% - 22px)) scale(1)
      rotate(-20deg);
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + 38px), calc(-50% - 45px)) scale(0.3)
      rotate(-160deg);
  }
}

@keyframes particle-burst-3 {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  12% {
    opacity: 1;
    transform: translate(calc(-50% + 5px), calc(-50% - 28px)) scale(0.9)
      rotate(15deg);
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + 8px), calc(-50% - 55px)) scale(0.3)
      rotate(120deg);
  }
}

/* ===== 闪光星星 ===== */
.sparkle {
  position: absolute;
  font-size: 10px;
  color: #ffd700;
  opacity: 0;
  filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.8));
}

.sp-1 {
  left: 30%;
  top: 15%;
  animation: sparkle-pop 0.8s ease-out 0.3s forwards;
}

.sp-2 {
  right: 28%;
  top: 18%;
  animation: sparkle-pop 0.8s ease-out 0.5s forwards;
}

.sp-3 {
  left: 22%;
  top: 35%;
  font-size: 8px;
  animation: sparkle-pop 0.7s ease-out 0.7s forwards;
}

.sp-4 {
  right: 20%;
  top: 32%;
  font-size: 8px;
  animation: sparkle-pop 0.7s ease-out 0.9s forwards;
}

@keyframes sparkle-pop {
  0% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  40% {
    opacity: 1;
    transform: scale(1.4) rotate(20deg);
  }
  70% {
    opacity: 0.8;
    transform: scale(1) rotate(10deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.5) rotate(-10deg);
  }
}

/* ===== 金币数量文字 ===== */
.coin-amount {
  position: absolute;
  left: 50%;
  top: 5%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-family: "SF Mono", "Consolas", "Monaco", monospace;
  font-weight: 800;
  font-size: 16px;
  color: #ffc833;
  text-shadow:
    0 1px 0 #b8860b,
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 0 10px rgba(255, 200, 51, 0.4);
  animation: amount-entrance 2.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  display: flex;
  align-items: baseline;
  gap: 1px;
  letter-spacing: -0.5px;
}

.coin-plus {
  font-size: 13px;
  color: #ffe066;
}

.coin-number {
  font-variant-numeric: tabular-nums;
}

@keyframes amount-entrance {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0.3) translateY(15px);
  }
  10% {
    opacity: 1;
    transform: translateX(-50%) scale(1.25) translateY(-5px);
  }
  18% {
    transform: translateX(-50%) scale(0.92) translateY(-2px);
  }
  25% {
    transform: translateX(-50%) scale(1.05) translateY(-4px);
  }
  32% {
    transform: translateX(-50%) scale(1) translateY(-3px);
  }
  75% {
    opacity: 1;
    transform: translateX(-50%) scale(1) translateY(-3px);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) scale(0.9) translateY(-25px);
  }
}
</style>
