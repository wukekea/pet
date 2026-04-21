<script setup lang="ts">
// 思考效果组件
</script>

<template>
  <div class="thinking-effects">
    <!-- 大的思考气泡 -->
    <div class="thought-bubble bubble-large">
      <svg viewBox="0 0 24 24" class="bubble-svg">
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="white"
          stroke="#8b5cf6"
          stroke-width="2"
        />
        <circle cx="12" cy="12" r="3" fill="#a78bfa" />
      </svg>
    </div>

    <!-- 中等思考气泡 -->
    <div class="thought-bubble bubble-medium">
      <svg viewBox="0 0 20 20" class="bubble-svg">
        <circle
          cx="10"
          cy="10"
          r="8"
          fill="white"
          stroke="#a78bfa"
          stroke-width="1.5"
        />
        <circle cx="10" cy="10" r="2.5" fill="#c4b5fd" />
      </svg>
    </div>

    <!-- 小思考气泡 -->
    <div class="thought-bubble bubble-small">
      <svg viewBox="0 0 16 16" class="bubble-svg">
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="white"
          stroke="#c4b5fd"
          stroke-width="1.5"
        />
        <circle cx="8" cy="8" r="2" fill="#ddd6fe" />
      </svg>
    </div>

    <!-- 三个点点的省略号 -->
    <div class="dots">
      <div class="dot dot-1"></div>
      <div class="dot dot-2"></div>
      <div class="dot dot-3"></div>
    </div>

    <!-- 问号 -->
    <div class="question-mark">
      <svg viewBox="0 0 24 24" class="question-svg">
        <!-- 问号主体 -->
        <text
          x="12"
          y="20"
          text-anchor="middle"
          font-size="20"
          font-weight="bold"
          fill="#a78bfa"
        >
          ?
        </text>
      </svg>
    </div>

    <!-- 灯泡 -->
    <div class="lightbulb">
      <svg viewBox="0 0 32 40" class="bulb-svg">
        <!-- 灯泡玻璃部分 -->
        <ellipse cx="16" cy="14" rx="12" ry="14" fill="#fef3c7" />
        <ellipse cx="16" cy="14" rx="10" ry="12" fill="#fef08a" />
        <ellipse cx="16" cy="14" rx="7" ry="9" fill="#fde047" />
        <!-- 灯泡内的灯丝 -->
        <path
          d="M12 12 Q14 8 16 12 Q18 8 20 12"
          stroke="#f59e0b"
          stroke-width="1.5"
          fill="none"
        />
        <!-- 灯泡底座 -->
        <rect x="11" y="26" width="10" height="3" fill="#94a3b8" rx="1" />
        <rect x="11" y="29" width="10" height="2" fill="#64748b" rx="1" />
        <rect x="11" y="31" width="10" height="2" fill="#475569" rx="1" />
        <rect x="12" y="33" width="8" height="3" fill="#334155" rx="1" />
        <!-- 发光效果 -->
        <ellipse
          cx="16"
          cy="14"
          rx="14"
          ry="16"
          fill="none"
          stroke="#fbbf24"
          stroke-width="2"
          opacity="0.6"
        />
      </svg>
    </div>

    <!-- 闪烁的星星点缀 -->
    <div class="sparkle sparkle-1">
      <svg viewBox="0 0 24 24" class="sparkle-svg">
        <path
          d="M12 2L14.09 8.26L22 8.27L16.54 12.97L18.09 20.5L12 16.27L5.91 20.5L7.46 12.97L2 8.27L9.91 8.26L12 2Z"
          fill="#c4b5fd"
        />
      </svg>
    </div>
    <div class="sparkle sparkle-2">
      <svg viewBox="0 0 24 24" class="sparkle-svg small">
        <path
          d="M12 2L14.09 8.26L22 8.27L16.54 12.97L18.09 20.5L12 16.27L5.91 20.5L7.46 12.97L2 8.27L9.91 8.26L12 2Z"
          fill="#ddd6fe"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.thinking-effects {
  position: absolute;
  inset: -50px;
  pointer-events: none;
  overflow: visible;
}

/* 思考气泡 */
.thought-bubble {
  position: absolute;
  opacity: 0;
  animation: bubble-appear 2.5s ease-in-out infinite;
}

.bubble-large {
  top: -40px;
  right: -30px;
  animation-delay: 0s;
}

.bubble-medium {
  top: -25px;
  right: -15px;
  animation-delay: 0.5s;
}

.bubble-small {
  top: -12px;
  right: -5px;
  animation-delay: 1s;
}

.bubble-svg {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3));
}

.bubble-medium .bubble-svg {
  width: 20px;
  height: 20px;
}

.bubble-small .bubble-svg {
  width: 16px;
  height: 16px;
}

@keyframes bubble-appear {
  0%,
  40% {
    opacity: 0;
    transform: translateY(10px) scale(0.8);
  }
  50%,
  80% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-5px) scale(0.9);
  }
}

/* 省略号点点 */
.dots {
  position: absolute;
  top: -30px;
  left: -25px;
  display: flex;
  gap: 4px;
  animation: dots-float 2s ease-in-out infinite;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #a78bfa;
}

.dot-1 {
  animation: dot-pulse 1.5s ease-in-out infinite;
  animation-delay: 0s;
}

.dot-2 {
  animation: dot-pulse 1.5s ease-in-out infinite;
  animation-delay: 0.2s;
}

.dot-3 {
  animation: dot-pulse 1.5s ease-in-out infinite;
  animation-delay: 0.4s;
}

@keyframes dots-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes dot-pulse {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 问号 */
.question-mark {
  position: absolute;
  top: -50px;
  left: 5px;
  opacity: 0;
  animation: question-pop 3s ease-in-out infinite;
}

.question-svg {
  width: 20px;
  height: 20px;
  filter: drop-shadow(0 0 6px rgba(167, 139, 250, 0.6));
}

@keyframes question-pop {
  0%,
  50% {
    opacity: 0;
    transform: translateY(5px) scale(0.5) rotate(-10deg);
  }
  55%,
  85% {
    opacity: 1;
    transform: translateY(0) scale(1.1) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-8px) scale(0.9) rotate(10deg);
  }
}

/* 灯泡 */
.lightbulb {
  position: absolute;
  top: -45px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  animation: bulb-flash 4s ease-in-out infinite;
}

.bulb-svg {
  width: 26px;
  height: 32px;
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.8));
  animation: bulb-glow 2s ease-in-out infinite alternate;
}

@keyframes bulb-flash {
  0%,
  60% {
    opacity: 0;
    transform: translateX(-50%) translateY(10px) scale(0.8);
  }
  65%,
  85% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px) scale(0.9);
  }
}

@keyframes bulb-glow {
  from {
    filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.8));
  }
  to {
    filter: drop-shadow(0 0 15px rgba(251, 191, 36, 1));
  }
}

/* 闪烁星星 */
.sparkle {
  position: absolute;
  opacity: 0;
  animation: sparkle-twinkle 2.5s ease-in-out infinite;
}

.sparkle-1 {
  top: -20px;
  left: 5px;
  animation-delay: 0s;
}

.sparkle-2 {
  top: -35px;
  left: -15px;
  animation-delay: 1.2s;
}

.sparkle-svg {
  width: 14px;
  height: 14px;
  filter: drop-shadow(0 0 4px rgba(196, 181, 253, 0.8));
}

.sparkle-svg.small {
  width: 10px;
  height: 10px;
}

@keyframes sparkle-twinkle {
  0%,
  70% {
    opacity: 0;
    transform: scale(0.5) rotate(0deg);
  }
  75%,
  90% {
    opacity: 1;
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.8) rotate(360deg);
  }
}
</style>
