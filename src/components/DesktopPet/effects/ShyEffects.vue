<script setup lang="ts">
// 害羞效果组件
import HeartSvg from "./icons/HeartSvg.vue";
</script>

<template>
  <div class="shy-effects">
    <!-- 粉红色腮红 -->
    <div class="blush blush-left">
      <svg viewBox="0 0 20 12" class="blush-svg">
        <ellipse cx="10" cy="6" rx="9" ry="5" fill="#fecdd3" />
        <ellipse cx="10" cy="6" rx="6" ry="3" fill="#fda4af" />
      </svg>
    </div>
    <div class="blush blush-right">
      <svg viewBox="0 0 20 12" class="blush-svg">
        <ellipse cx="10" cy="6" rx="9" ry="5" fill="#fecdd3" />
        <ellipse cx="10" cy="6" rx="6" ry="3" fill="#fda4af" />
      </svg>
    </div>

    <!-- 小爱心 -->
    <div class="heart heart-1">
      <HeartSvg color="#ff6b9d" class="heart-svg" />
    </div>
    <div class="heart heart-2">
      <HeartSvg color="#fda4af" class="heart-svg small" />
    </div>
    <div class="heart heart-3">
      <HeartSvg color="#fecdd3" class="heart-svg tiny" />
    </div>

    <!-- 小花 -->
    <div class="flower flower-1">
      <svg viewBox="0 0 24 24" class="flower-svg">
        <circle cx="12" cy="8" r="4" fill="#f9a8d4" />
        <circle cx="8" cy="12" r="4" fill="#f9a8d4" />
        <circle cx="16" cy="12" r="4" fill="#f9a8d4" />
        <circle cx="10" cy="16" r="4" fill="#f9a8d4" />
        <circle cx="14" cy="16" r="4" fill="#f9a8d4" />
        <circle cx="12" cy="12" r="3" fill="#fcd34d" />
      </svg>
    </div>
    <div class="flower flower-2">
      <svg viewBox="0 0 24 24" class="flower-svg small">
        <circle cx="12" cy="8" r="4" fill="#fbcfe8" />
        <circle cx="8" cy="12" r="4" fill="#fbcfe8" />
        <circle cx="16" cy="12" r="4" fill="#fbcfe8" />
        <circle cx="10" cy="16" r="4" fill="#fbcfe8" />
        <circle cx="14" cy="16" r="4" fill="#fbcfe8" />
        <circle cx="12" cy="12" r="3" fill="#fef08a" />
      </svg>
    </div>

    <!-- 波浪线 -->
    <div class="wave wave-1"></div>
    <div class="wave wave-2"></div>
    <div class="wave wave-3"></div>

    <!-- 闪烁小点 -->
    <div class="twinkle twinkle-1">
      <svg viewBox="0 0 24 24" class="twinkle-svg">
        <path
          d="M12 2L14 10H22L16 15L18 23L12 18L6 23L8 15L2 10H10L12 2Z"
          fill="#fecdd3"
        />
      </svg>
    </div>
    <div class="twinkle twinkle-2">
      <svg viewBox="0 0 24 24" class="twinkle-svg small">
        <path
          d="M12 2L14 10H22L16 15L18 23L12 18L6 23L8 15L2 10H10L12 2Z"
          fill="#fda4af"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.shy-effects {
  position: absolute;
  inset: -40px;
  pointer-events: none;
  overflow: visible;
}

/* 粉红色腮红 */
.blush {
  position: absolute;
  opacity: 0;
  animation: blush-appear 2s ease-in-out infinite;
}

.blush-left {
  top: 42px;
  left: 8px;
  animation-delay: 0s;
}

.blush-right {
  top: 42px;
  right: 8px;
  animation-delay: 0.3s;
}

.blush-svg {
  width: 16px;
  height: 10px;
  filter: blur(1px);
}

@keyframes blush-appear {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.2);
  }
}

/* 小爱心 */
.heart {
  position: absolute;
  opacity: 0;
  animation: heart-float 2.5s ease-in-out infinite;
}

.heart-1 {
  top: -25px;
  left: -15px;
  animation-delay: 0s;
}

.heart-2 {
  top: -35px;
  right: -10px;
  animation-delay: 0.8s;
}

.heart-3 {
  top: -15px;
  right: -25px;
  animation-delay: 1.6s;
}

.heart-svg {
  width: 14px;
  height: 14px;
  filter: drop-shadow(0 0 3px rgba(255, 107, 157, 0.6));
}

.heart-svg.small {
  width: 10px;
  height: 10px;
}

.heart-svg.tiny {
  width: 8px;
  height: 8px;
}

@keyframes heart-float {
  0% {
    opacity: 0;
    transform: translateY(5px) scale(0.5);
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(1);
  }
}

/* 小花 */
.flower {
  position: absolute;
  opacity: 0;
  animation: flower-bloom 3s ease-in-out infinite;
}

.flower-1 {
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0.5s;
}

.flower-2 {
  top: -20px;
  left: -30px;
  animation-delay: 1.8s;
}

.flower-svg {
  width: 16px;
  height: 16px;
}

.flower-svg.small {
  width: 12px;
  height: 12px;
}

@keyframes flower-bloom {
  0%,
  60% {
    opacity: 0;
    transform: translateY(5px) scale(0.5) rotate(0deg);
  }
  70%,
  90% {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(20deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-5px) scale(0.8) rotate(40deg);
  }
}

/* 波浪线 */
.wave {
  position: absolute;
  width: 25px;
  height: 6px;
  opacity: 0;
  animation: wave-flow 2s ease-in-out infinite;
}

.wave-1 {
  top: -30px;
  left: -25px;
  border-radius: 3px;
  background: linear-gradient(90deg, transparent, #fda4af 30%, transparent 60%);
  animation-delay: 0s;
}

.wave-2 {
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 3px;
  background: linear-gradient(90deg, transparent, #fecdd3 30%, transparent 60%);
  animation-delay: 0.5s;
}

.wave-3 {
  top: -25px;
  right: -25px;
  border-radius: 3px;
  background: linear-gradient(90deg, transparent, #fda4af 30%, transparent 60%);
  animation-delay: 1s;
}

@keyframes wave-flow {
  0%,
  80% {
    opacity: 0;
    transform: translateX(-5px);
  }
  85%,
  95% {
    opacity: 0.8;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(5px);
  }
}

/* 闪烁小点 */
.twinkle {
  position: absolute;
  opacity: 0;
  animation: twinkle-shine 2s ease-in-out infinite;
}

.twinkle-1 {
  top: -45px;
  left: 5px;
  animation-delay: 0.3s;
}

.twinkle-2 {
  top: -38px;
  right: 0;
  animation-delay: 1.2s;
}

.twinkle-svg {
  width: 10px;
  height: 10px;
}

.twinkle-svg.small {
  width: 6px;
  height: 6px;
}

@keyframes twinkle-shine {
  0%,
  70% {
    opacity: 0;
    transform: scale(0.5) rotate(0deg);
  }
  80%,
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
