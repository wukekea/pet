<script setup lang="ts">
// 得意效果组件
</script>

<template>
  <div class="smug-effects">
    <!-- 皇冠 -->
    <div class="crown">
      <svg viewBox="0 0 32 24" class="crown-svg">
        <!-- 皇冠主体 -->
        <path
          d="M2 20 L6 8 L12 14 L16 4 L20 14 L26 8 L30 20 Z"
          fill="#fbbf24"
          stroke="#f59e0b"
          stroke-width="1.5"
        />
        <!-- 皇冠底部 -->
        <rect x="2" y="18" width="28" height="4" fill="#f59e0b" rx="1" />
        <!-- 宝石 -->
        <circle cx="6" cy="10" r="2.5" fill="#ef4444" />
        <circle cx="16" cy="6" r="3" fill="#ec4899" />
        <circle cx="26" cy="10" r="2.5" fill="#3b82f6" />
        <!-- 宝石高光 -->
        <circle cx="5.5" cy="9.5" r="1" fill="white" opacity="0.6" />
        <circle cx="15.5" cy="5.5" r="1.2" fill="white" opacity="0.6" />
        <circle cx="25.5" cy="9.5" r="1" fill="white" opacity="0.6" />
      </svg>
    </div>

    <!-- 闪光星星 -->
    <div class="sparkle sparkle-1">
      <svg viewBox="0 0 24 24" class="sparkle-svg">
        <path
          d="M12 2L14.09 8.26L22 8.27L16.54 12.97L18.09 20.5L12 16.27L5.91 20.5L7.46 12.97L2 8.27L9.91 8.26L12 2Z"
          fill="#fef08a"
        />
      </svg>
    </div>
    <div class="sparkle sparkle-2">
      <svg viewBox="0 0 24 24" class="sparkle-svg small">
        <path
          d="M12 2L14.09 8.26L22 8.27L16.54 12.97L18.09 20.5L12 16.27L5.91 20.5L7.46 12.97L2 8.27L9.91 8.26L12 2Z"
          fill="#fde047"
        />
      </svg>
    </div>
    <div class="sparkle sparkle-3">
      <svg viewBox="0 0 24 24" class="sparkle-svg tiny">
        <path
          d="M12 2L14.09 8.26L22 8.27L16.54 12.97L18.09 20.5L12 16.27L5.91 20.5L7.46 12.97L2 8.27L9.91 8.26L12 2Z"
          fill="#fef3c7"
        />
      </svg>
    </div>

    <!-- 光芒线条 -->
    <div class="ray ray-1"></div>
    <div class="ray ray-2"></div>
    <div class="ray ray-3"></div>
    <div class="ray ray-4"></div>
    <div class="ray ray-5"></div>
    <div class="ray ray-6"></div>

    <!-- 小音符 -->
    <div class="note note-1">
      <svg viewBox="0 0 24 24" class="note-svg">
        <path
          d="M12 3V13.55C11.06 13.22 10.04 13.29 9.12 13.8C7.88 14.5 7.29 15.95 7.71 17.25C8.13 18.55 9.39 19.39 10.75 19.39C12.55 19.39 14 17.94 14 16.14V6H18V3H12Z"
          fill="#a78bfa"
        />
      </svg>
    </div>
    <div class="note note-2">
      <svg viewBox="0 0 24 24" class="note-svg small">
        <path
          d="M12 3V13.55C11.06 13.22 10.04 13.29 9.12 13.8C7.88 14.5 7.29 15.95 7.71 17.25C8.13 18.55 9.39 19.39 10.75 19.39C12.55 19.39 14 17.94 14 16.14V6H18V3H12Z"
          fill="#c4b5fd"
        />
      </svg>
    </div>

    <!-- 小爱心 -->
    <div class="heart heart-1">
      <svg viewBox="0 0 24 24" class="heart-svg">
        <path
          d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
          fill="#ff6b9d"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.smug-effects {
  position: absolute;
  inset: -50px;
  pointer-events: none;
  overflow: visible;
}

/* 皇冠 */
.crown {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  animation: crown-float 1.5s ease-in-out infinite;
}

.crown-svg {
  width: 32px;
  height: 24px;
  filter: drop-shadow(0 2px 4px rgba(251, 191, 36, 0.6));
}

@keyframes crown-float {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-5px);
  }
}

/* 闪光星星 */
.sparkle {
  position: absolute;
  opacity: 0;
  animation: sparkle-shine 2s ease-in-out infinite;
}

.sparkle-1 {
  top: -35px;
  left: -20px;
  animation-delay: 0s;
}

.sparkle-2 {
  top: -45px;
  right: -15px;
  animation-delay: 0.7s;
}

.sparkle-3 {
  top: -20px;
  right: -25px;
  animation-delay: 1.4s;
}

.sparkle-svg {
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 0 4px rgba(254, 240, 138, 0.8));
}

.sparkle-svg.small {
  width: 12px;
  height: 12px;
}

.sparkle-svg.tiny {
  width: 8px;
  height: 8px;
}

@keyframes sparkle-shine {
  0%,
  60% {
    opacity: 0;
    transform: scale(0.5) rotate(0deg);
  }
  70%,
  90% {
    opacity: 1;
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.8) rotate(360deg);
  }
}

/* 光芒线条 */
.ray {
  position: absolute;
  top: -25px;
  left: 50%;
  width: 2px;
  height: 12px;
  background: linear-gradient(180deg, #fbbf24, transparent);
  border-radius: 1px;
  transform-origin: center bottom;
  animation: ray-pulse 1.5s ease-in-out infinite;
}

.ray-1 {
  transform: translateX(-50%) rotate(-60deg);
  animation-delay: 0s;
}

.ray-2 {
  transform: translateX(-50%) rotate(-30deg);
  animation-delay: 0.1s;
}

.ray-3 {
  transform: translateX(-50%) rotate(0deg);
  animation-delay: 0.2s;
}

.ray-4 {
  transform: translateX(-50%) rotate(30deg);
  animation-delay: 0.3s;
}

.ray-5 {
  transform: translateX(-50%) rotate(60deg);
  animation-delay: 0.4s;
}

.ray-6 {
  transform: translateX(-50%) rotate(90deg);
  animation-delay: 0.5s;
}

@keyframes ray-pulse {
  0%,
  100% {
    opacity: 0.3;
    height: 12px;
  }
  50% {
    opacity: 1;
    height: 18px;
  }
}

/* 小音符 */
.note {
  position: absolute;
  opacity: 0;
  animation: note-float 2.5s ease-in-out infinite;
}

.note-1 {
  top: -15px;
  left: -30px;
  animation-delay: 0s;
}

.note-2 {
  top: -25px;
  right: -35px;
  animation-delay: 1.2s;
}

.note-svg {
  width: 14px;
  height: 14px;
}

.note-svg.small {
  width: 10px;
  height: 10px;
}

@keyframes note-float {
  0% {
    opacity: 0;
    transform: translateY(0) rotate(-15deg);
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-25px) rotate(15deg);
  }
}

/* 小爱心 */
.heart-1 {
  position: absolute;
  top: -50px;
  left: 15px;
  opacity: 0;
  animation: heart-pop 3s ease-in-out infinite;
}

.heart-svg {
  width: 14px;
  height: 14px;
  filter: drop-shadow(0 0 3px rgba(255, 107, 157, 0.8));
}

@keyframes heart-pop {
  0%,
  70% {
    opacity: 0;
    transform: scale(0.5);
  }
  75%,
  90% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}
</style>
