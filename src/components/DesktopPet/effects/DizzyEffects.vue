<script setup lang="ts">
// 晕眩效果组件（摔倒时显示）
</script>

<template>
  <div class="dizzy-effects">
    <!-- 旋转的星星 -->
    <div class="spinning-star star-1">
      <svg viewBox="0 0 24 24" class="star-svg">
        <path
          d="M12 2L14.09 9.26L22 9.27L16.54 13.97L18.09 21.5L12 17.27L5.91 21.5L7.46 13.97L2 9.27L9.91 9.26L12 2Z"
          fill="#fbbf24"
        />
      </svg>
    </div>
    <div class="spinning-star star-2">
      <svg viewBox="0 0 24 24" class="star-svg">
        <path
          d="M12 2L14.09 9.26L22 9.27L16.54 13.97L18.09 21.5L12 17.27L5.91 21.5L7.46 13.97L2 9.27L9.91 9.26L12 2Z"
          fill="#fcd34d"
        />
      </svg>
    </div>
    <div class="spinning-star star-3">
      <svg viewBox="0 0 24 24" class="star-svg small">
        <path
          d="M12 2L14.09 9.26L22 9.27L16.54 13.97L18.09 21.5L12 17.27L5.91 21.5L7.46 13.97L2 9.27L9.91 9.26L12 2Z"
          fill="#fef3c7"
        />
      </svg>
    </div>

    <!-- 螺旋圈 -->
    <div class="spiral spiral-1"></div>
    <div class="spiral spiral-2"></div>

    <!-- 小点点 -->
    <div class="dot dot-1"></div>
    <div class="dot dot-2"></div>
    <div class="dot dot-3"></div>

    <!-- 十字眼特效 -->
    <div class="cross-eye cross-left">
      <svg viewBox="0 0 20 20" class="cross-svg">
        <line
          x1="2"
          y1="2"
          x2="18"
          y2="18"
          stroke="#1f2937"
          stroke-width="3"
          stroke-linecap="round"
        />
        <line
          x1="18"
          y1="2"
          x2="2"
          y2="18"
          stroke="#1f2937"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <div class="cross-eye cross-right">
      <svg viewBox="0 0 20 20" class="cross-svg">
        <line
          x1="2"
          y1="2"
          x2="18"
          y2="18"
          stroke="#1f2937"
          stroke-width="3"
          stroke-linecap="round"
        />
        <line
          x1="18"
          y1="2"
          x2="2"
          y2="18"
          stroke="#1f2937"
          stroke-width="3"
          stroke-linecap="round"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.dizzy-effects {
  position: absolute;
  inset: -50px;
  pointer-events: none;
  overflow: visible;
}

/* 旋转的星星 */
.spinning-star {
  position: absolute;
  opacity: 0;
  animation: star-spin 1.5s ease-in-out infinite;
}

.star-1 {
  top: -20px;
  left: -30px;
  animation-delay: 0s;
}

.star-2 {
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0.5s;
}

.star-3 {
  top: -15px;
  right: -25px;
  animation-delay: 1s;
}

.star-svg {
  width: 22px;
  height: 22px;
  filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.6));
  animation: star-twinkle 0.8s ease-in-out infinite alternate;
}

.star-svg.small {
  width: 14px;
  height: 14px;
}

@keyframes star-spin {
  0% {
    opacity: 0;
    transform: rotate(0deg) scale(0.5);
  }
  30% {
    opacity: 1;
    transform: rotate(180deg) scale(1.1);
  }
  60% {
    opacity: 0.8;
    transform: rotate(360deg) scale(0.9);
  }
  100% {
    opacity: 0;
    transform: rotate(540deg) scale(0.5);
  }
}

@keyframes star-twinkle {
  from {
    filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.6));
  }
  to {
    filter: drop-shadow(0 0 10px rgba(251, 191, 36, 1));
  }
}

/* 螺旋圈 */
.spiral {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: rgba(251, 191, 36, 0.6);
  border-right-color: rgba(252, 211, 77, 0.4);
  animation: spiral-spin 2s linear infinite;
}

.spiral-1 {
  width: 35px;
  height: 35px;
  top: -25px;
  left: -20px;
  animation-delay: 0s;
}

.spiral-2 {
  width: 28px;
  height: 28px;
  top: -18px;
  right: -15px;
  animation-delay: 0.5s;
  animation-direction: reverse;
}

@keyframes spiral-spin {
  from {
    transform: rotate(0deg);
    opacity: 0.7;
  }
  to {
    transform: rotate(360deg);
    opacity: 0.3;
  }
}

/* 小点点 */
.dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fcd34d;
  animation: dot-float 1.2s ease-in-out infinite;
}

.dot-1 {
  top: -10px;
  left: -5px;
  animation-delay: 0s;
}

.dot-2 {
  top: -8px;
  right: -8px;
  animation-delay: 0.4s;
  background: #fbbf24;
}

.dot-3 {
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0.8s;
  width: 4px;
  height: 4px;
  background: #fef3c7;
}

@keyframes dot-float {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  30% {
    opacity: 1;
    transform: translateY(-8px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.8);
  }
}

/* 十字眼特效 */
.cross-eye {
  position: absolute;
  opacity: 0;
  animation: cross-pop 2s ease-in-out infinite;
}

.cross-left {
  top: 8px;
  left: 22px;
  animation-delay: 0s;
}

.cross-right {
  top: 8px;
  right: 22px;
  animation-delay: 0.3s;
}

.cross-svg {
  width: 16px;
  height: 16px;
}

@keyframes cross-pop {
  0%,
  80% {
    opacity: 0;
    transform: scale(0.5);
  }
  85%,
  95% {
    opacity: 0.9;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.5);
  }
}
</style>
