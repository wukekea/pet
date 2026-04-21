<script setup lang="ts">
// 疑惑效果组件
</script>

<template>
  <div class="confused-effects">
    <!-- 问号 -->
    <div class="question question-1">
      <svg viewBox="0 0 24 24" class="question-svg">
        <text
          x="12"
          y="20"
          text-anchor="middle"
          font-size="18"
          font-weight="bold"
          fill="#60a5fa"
        >
          ?
        </text>
      </svg>
    </div>
    <div class="question question-2">
      <svg viewBox="0 0 24 24" class="question-svg small">
        <text
          x="12"
          y="20"
          text-anchor="middle"
          font-size="18"
          font-weight="bold"
          fill="#93c5fd"
        >
          ?
        </text>
      </svg>
    </div>
    <div class="question question-3">
      <svg viewBox="0 0 24 24" class="question-svg tiny">
        <text
          x="12"
          y="20"
          text-anchor="middle"
          font-size="18"
          font-weight="bold"
          fill="#bfdbfe"
        >
          ?
        </text>
      </svg>
    </div>

    <!-- 旋转的螺旋 -->
    <div class="spiral spiral-1"></div>
    <div class="spiral spiral-2"></div>

    <!-- 感叹号和问号组合 -->
    <div class="combo">
      <svg viewBox="0 0 24 32" class="combo-svg">
        <!-- 问号 -->
        <text
          x="6"
          y="18"
          text-anchor="middle"
          font-size="14"
          font-weight="bold"
          fill="#60a5fa"
        >
          ?
        </text>
        <!-- 感叹号 -->
        <text
          x="18"
          y="18"
          text-anchor="middle"
          font-size="14"
          font-weight="bold"
          fill="#f59e0b"
        >
          !
        </text>
      </svg>
    </div>

    <!-- 曲线箭头 -->
    <div class="curved-arrow">
      <svg viewBox="0 0 32 24" class="arrow-svg">
        <path
          d="M2 12 Q16 2 24 12"
          stroke="#94a3b8"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
        />
        <path
          d="M20 8 L24 12 L20 16"
          stroke="#94a3b8"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <!-- 小星星 -->
    <div class="star star-1">
      <svg viewBox="0 0 24 24" class="star-svg">
        <path
          d="M12 2L14 10H22L16 15L18 23L12 18L6 23L8 15L2 10H10L12 2Z"
          fill="#cbd5e1"
        />
      </svg>
    </div>
    <div class="star star-2">
      <svg viewBox="0 0 24 24" class="star-svg small">
        <path
          d="M12 2L14 10H22L16 15L18 23L12 18L6 23L8 15L2 10H10L12 2Z"
          fill="#e2e8f0"
        />
      </svg>
    </div>

    <!-- 波浪线 -->
    <div class="wiggle wiggle-1"></div>
    <div class="wiggle wiggle-2"></div>
  </div>
</template>

<style scoped>
.confused-effects {
  position: absolute;
  inset: -45px;
  pointer-events: none;
  overflow: visible;
}

/* 问号 */
.question {
  position: absolute;
  opacity: 0;
  animation: question-float 2.5s ease-in-out infinite;
}

.question-1 {
  top: -30px;
  left: -10px;
  animation-delay: 0s;
}

.question-2 {
  top: -40px;
  left: 15px;
  animation-delay: 0.5s;
}

.question-3 {
  top: -25px;
  right: -15px;
  animation-delay: 1s;
}

.question-svg {
  width: 20px;
  height: 24px;
  filter: drop-shadow(0 0 4px rgba(96, 165, 250, 0.5));
}

.question-svg.small {
  width: 16px;
  height: 20px;
}

.question-svg.tiny {
  width: 12px;
  height: 16px;
}

@keyframes question-float {
  0% {
    opacity: 0;
    transform: translateY(5px) rotate(-10deg);
  }
  30% {
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-15px) rotate(10deg);
  }
}

/* 旋转的螺旋 */
.spiral {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #93c5fd;
  border-right-color: #bfdbfe;
  animation: spiral-spin 1.5s linear infinite;
}

.spiral-1 {
  width: 24px;
  height: 24px;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
}

.spiral-2 {
  width: 16px;
  height: 16px;
  top: -20px;
  right: -20px;
  animation-direction: reverse;
  animation-delay: 0.5s;
}

@keyframes spiral-spin {
  from {
    transform: translateX(-50%) rotate(0deg);
    opacity: 0.6;
  }
  to {
    transform: translateX(-50%) rotate(360deg);
    opacity: 0.3;
  }
}

.spiral-2 {
  animation-name: spiral-spin-2;
}

@keyframes spiral-spin-2 {
  from {
    transform: rotate(0deg);
    opacity: 0.6;
  }
  to {
    transform: rotate(-360deg);
    opacity: 0.3;
  }
}

/* 感叹号和问号组合 */
.combo {
  position: absolute;
  top: -45px;
  left: -30px;
  opacity: 0;
  animation: combo-pop 3s ease-in-out infinite;
}

.combo-svg {
  width: 24px;
  height: 32px;
  filter: drop-shadow(0 0 3px rgba(96, 165, 250, 0.4));
}

@keyframes combo-pop {
  0%,
  40% {
    opacity: 0;
    transform: scale(0.8);
  }
  50%,
  85% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}

/* 曲线箭头 */
.curved-arrow {
  position: absolute;
  top: -30px;
  right: -25px;
  opacity: 0;
  animation: arrow-appear 2.5s ease-in-out infinite;
}

.arrow-svg {
  width: 28px;
  height: 20px;
}

@keyframes arrow-appear {
  0%,
  60% {
    opacity: 0;
    transform: translateX(5px);
  }
  70%,
  90% {
    opacity: 0.8;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-5px);
  }
}

/* 小星星 */
.star {
  position: absolute;
  opacity: 0;
  animation: star-twinkle 2s ease-in-out infinite;
}

.star-1 {
  top: -25px;
  left: 5px;
  animation-delay: 0.3s;
}

.star-2 {
  top: -18px;
  right: 5px;
  animation-delay: 1s;
}

.star-svg {
  width: 12px;
  height: 12px;
}

.star-svg.small {
  width: 8px;
  height: 8px;
}

@keyframes star-twinkle {
  0%,
  70% {
    opacity: 0;
    transform: scale(0.5) rotate(0deg);
  }
  80%,
  90% {
    opacity: 0.7;
    transform: scale(1) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.8) rotate(360deg);
  }
}

/* 波浪线 */
.wiggle {
  position: absolute;
  width: 15px;
  height: 3px;
  border-radius: 2px;
  opacity: 0;
  animation: wiggle-wave 1.5s ease-in-out infinite;
}

.wiggle-1 {
  top: -15px;
  left: -20px;
  background: linear-gradient(90deg, transparent, #93c5fd 40%, transparent 70%);
  animation-delay: 0s;
}

.wiggle-2 {
  top: -10px;
  right: -18px;
  background: linear-gradient(90deg, transparent, #bfdbfe 40%, transparent 70%);
  animation-delay: 0.7s;
}

@keyframes wiggle-wave {
  0%,
  80% {
    opacity: 0;
    transform: scaleX(0.5);
  }
  90%,
  95% {
    opacity: 0.6;
    transform: scaleX(1);
  }
  100% {
    opacity: 0;
    transform: scaleX(0.8);
  }
}
</style>
