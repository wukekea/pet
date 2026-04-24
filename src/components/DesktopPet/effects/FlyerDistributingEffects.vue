<script setup lang="ts">
// 发传单效果组件 - 主动推销动画
</script>

<template>
  <div class="flyer-distributing-effects">
    <!-- 飞舞的传单 -->
    <div class="flying-flyer flyer-1">
      <svg viewBox="0 0 40 50" class="flyer-svg">
        <!-- 传单背景 -->
        <rect x="2" y="2" width="36" height="46" rx="2" fill="#FFF5E6" />
        <rect x="4" y="4" width="32" height="42" rx="1" fill="#FFFFFF" />
        <!-- 传单内容模拟 -->
        <rect x="7" y="8" width="26" height="8" rx="1" fill="#FF6B6B" />
        <rect x="7" y="20" width="12" height="3" rx="1" fill="#E0E0E0" />
        <rect x="7" y="26" width="18" height="3" rx="1" fill="#E0E0E0" />
        <rect x="7" y="32" width="14" height="3" rx="1" fill="#E0E0E0" />
        <rect x="7" y="38" width="10" height="4" rx="1" fill="#4ECDC4" />
        <!-- 传单边框 -->
        <rect
          x="2"
          y="2"
          width="36"
          height="46"
          rx="2"
          fill="none"
          stroke="#FF6B6B"
          stroke-width="2"
        />
      </svg>
    </div>
    <div class="flying-flyer flyer-2">
      <svg viewBox="0 0 40 50" class="flyer-svg">
        <rect x="2" y="2" width="36" height="46" rx="2" fill="#E8F5E9" />
        <rect x="4" y="4" width="32" height="42" rx="1" fill="#FFFFFF" />
        <rect x="7" y="8" width="26" height="8" rx="1" fill="#4CAF50" />
        <rect x="7" y="20" width="12" height="3" rx="1" fill="#E0E0E0" />
        <rect x="7" y="26" width="18" height="3" rx="1" fill="#E0E0E0" />
        <rect x="7" y="32" width="14" height="3" rx="1" fill="#E0E0E0" />
        <rect x="7" y="38" width="10" height="4" rx="1" fill="#FF9800" />
        <rect
          x="2"
          y="2"
          width="36"
          height="46"
          rx="2"
          fill="none"
          stroke="#4CAF50"
          stroke-width="2"
        />
      </svg>
    </div>
    <div class="flying-flyer flyer-3">
      <svg viewBox="0 0 40 50" class="flyer-svg">
        <rect x="2" y="2" width="36" height="46" rx="2" fill="#E3F2FD" />
        <rect x="4" y="4" width="32" height="42" rx="1" fill="#FFFFFF" />
        <rect x="7" y="8" width="26" height="8" rx="1" fill="#2196F3" />
        <rect x="7" y="20" width="12" height="3" rx="1" fill="#E0E0E0" />
        <rect x="7" y="26" width="18" height="3" rx="1" fill="#E0E0E0" />
        <rect x="7" y="32" width="14" height="3" rx="1" fill="#E0E0E0" />
        <rect x="7" y="38" width="10" height="4" rx="1" fill="#E91E63" />
        <rect
          x="2"
          y="2"
          width="36"
          height="46"
          rx="2"
          fill="none"
          stroke="#2196F3"
          stroke-width="2"
        />
      </svg>
    </div>

    <!-- 招手手势 -->
    <div class="waving-hand hand-left">
      <svg viewBox="0 0 32 32" class="hand-svg">
        <path
          d="M8 16 L8 8 C8 6 10 4 12 4 C14 4 16 6 16 8 L16 12 M16 12 L16 6 C16 4 18 2 20 2 C22 2 24 4 24 6 L24 14 M24 14 L24 8 C24 6 26 6 28 8 C28 10 28 12 28 14 L28 20 C28 24 24 28 20 28 L12 28 C8 28 4 24 4 20 L4 16"
          fill="#FFDAB9"
          stroke="#DEB887"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="12" cy="6" r="1.5" fill="#FFC0CB" />
        <circle cx="20" cy="4" r="1.5" fill="#FFC0CB" />
        <circle cx="26" cy="10" r="1.5" fill="#FFC0CB" />
      </svg>
    </div>
    <div class="waving-hand hand-right">
      <svg viewBox="0 0 32 32" class="hand-svg">
        <path
          d="M24 16 L24 8 C24 6 22 4 20 4 C18 4 16 6 16 8 L16 12 M16 12 L16 6 C16 4 14 2 12 2 C10 2 8 4 8 6 L8 14 M8 14 L8 8 C8 6 6 6 4 8 C4 10 4 12 4 14 L4 20 C4 24 8 28 12 28 L20 28 C24 28 28 24 28 20 L28 16"
          fill="#FFDAB9"
          stroke="#DEB887"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="20" cy="6" r="1.5" fill="#FFC0CB" />
        <circle cx="12" cy="4" r="1.5" fill="#FFC0CB" />
        <circle cx="6" cy="10" r="1.5" fill="#FFC0CB" />
      </svg>
    </div>

    <!-- 热情星星 -->
    <div class="excitement-star star-1">
      <svg viewBox="0 0 24 24" class="star-svg">
        <path
          d="M12 2 L14.4 8.5 L22 9 L16.5 13.5 L18.5 21 L12 16.5 L5.5 21 L7.5 13.5 L2 9 L9.6 8.5 Z"
          fill="#FFD700"
        />
      </svg>
    </div>
    <div class="excitement-star star-2">
      <svg viewBox="0 0 24 24" class="star-svg">
        <path
          d="M12 2 L14.4 8.5 L22 9 L16.5 13.5 L18.5 21 L12 16.5 L5.5 21 L7.5 13.5 L2 9 L9.6 8.5 Z"
          fill="#FFA500"
        />
      </svg>
    </div>
    <div class="excitement-star star-3">
      <svg viewBox="0 0 24 24" class="star-svg">
        <path
          d="M12 2 L14.4 8.5 L22 9 L16.5 13.5 L18.5 21 L12 16.5 L5.5 21 L7.5 13.5 L2 9 L9.6 8.5 Z"
          fill="#FF6347"
        />
      </svg>
    </div>

    <!-- 宣传喇叭 -->
    <div class="megaphone">
      <svg viewBox="0 0 40 40" class="megaphone-svg">
        <!-- 竖直把手 -->
        <rect x="0" y="12" width="5" height="16" rx="2" fill="#1A1A1A" />
        <rect x="1" y="14" width="3" height="12" rx="1" fill="#2A2A2A" />

        <!-- 喇叭主体 -->
        <path d="M6 14 L12 10 L12 22 L6 18 Z" fill="#2A2A2A" />
        <path d="M12 10 L24 6 L24 26 L12 22 Z" fill="#3A3A3A" />
        <ellipse cx="24" cy="16" rx="3" ry="10" fill="#4A4A4A" />
        <!-- 喇叭口 -->
        <ellipse
          cx="28"
          cy="16"
          rx="5"
          ry="12"
          fill="none"
          stroke="#1A1A1A"
          stroke-width="2"
        />
        <!-- 喇叭口内部渐变感 -->
        <ellipse cx="28" cy="16" rx="4" ry="10" fill="#2A2A2A" />
        <ellipse cx="28" cy="16" rx="2" ry="6" fill="#1A1A1A" />
        <!-- 金属光泽 -->
        <path
          d="M14 12 L22 8"
          stroke="#5A5A5A"
          stroke-width="1"
          opacity="0.5"
        />
        <path
          d="M14 20 L22 24"
          stroke="#5A5A5A"
          stroke-width="1"
          opacity="0.3"
        />
        <!-- 声波（竖着的曲线，依次变长） -->
        <path
          d="M33 13 Q35 16 33 19"
          stroke="#FF6B6B"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
        />
        <path
          d="M36 10 Q39 16 36 22"
          stroke="#FF6B6B"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          opacity="0.7"
        />
        <path
          d="M39 7 Q43 16 39 25"
          stroke="#FF6B6B"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          opacity="0.4"
        />
      </svg>
    </div>

    <!-- 热情表情符号 -->
    <div class="emoji-emotion">
      <svg viewBox="0 0 32 32" class="emoji-svg">
        <circle cx="16" cy="16" r="14" fill="#FFD93D" />
        <circle cx="11" cy="13" r="2.5" fill="#333" />
        <circle cx="21" cy="13" r="2.5" fill="#333" />
        <path
          d="M10 20 Q16 26 22 20"
          stroke="#333"
          stroke-width="2.5"
          fill="none"
          stroke-linecap="round"
        />
        <ellipse cx="8" cy="18" rx="3" ry="2" fill="#FF8A80" opacity="0.7" />
        <ellipse cx="24" cy="18" rx="3" ry="2" fill="#FF8A80" opacity="0.7" />
      </svg>
    </div>

    <!-- 传单堆 -->
    <div class="flyer-stack">
      <svg viewBox="0 0 36 48" class="stack-svg">
        <rect x="2" y="2" width="32" height="44" rx="2" fill="#FFEBEE" />
        <rect x="4" y="4" width="28" height="40" rx="1" fill="#FFFFFF" />
        <rect x="6" y="8" width="24" height="6" rx="1" fill="#EF5350" />
        <rect x="6" y="18" width="10" height="2" rx="1" fill="#E0E0E0" />
        <rect x="6" y="23" width="16" height="2" rx="1" fill="#E0E0E0" />
        <rect x="6" y="28" width="12" height="2" rx="1" fill="#E0E0E0" />
        <rect x="6" y="33" width="8" height="3" rx="1" fill="#66BB6A" />
        <!-- 纸张厚度 -->
        <rect
          x="1"
          y="4"
          width="32"
          height="44"
          rx="2"
          fill="#FFCDD2"
          opacity="0.5"
        />
        <rect
          x="0"
          y="6"
          width="32"
          height="44"
          rx="2"
          fill="#EF9A9A"
          opacity="0.3"
        />
      </svg>
    </div>

    <!-- 效果线条 -->
    <div class="action-lines">
      <div class="line line-1"></div>
      <div class="line line-2"></div>
      <div class="line line-3"></div>
    </div>
  </div>
</template>

<style scoped>
.flyer-distributing-effects {
  position: absolute;
  inset: -50px;
  pointer-events: none;
  overflow: visible;
}

/* 飞舞的传单 */
.flying-flyer {
  position: absolute;
  opacity: 0;
  animation: flyer-fly 3s ease-in-out infinite;
}

.flyer-1 {
  top: -30px;
  left: -25px;
  animation-delay: 0s;
}

.flyer-2 {
  top: -20px;
  right: -20px;
  animation-delay: 1s;
}

.flyer-3 {
  top: 10px;
  left: -30px;
  animation-delay: 2s;
}

.flyer-svg {
  width: 28px;
  height: 35px;
  filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.2));
}

@keyframes flyer-fly {
  0% {
    opacity: 0;
    transform: translate(0, 0) rotate(0deg) scale(0.5);
  }
  20% {
    opacity: 1;
    transform: translate(10px, -20px) rotate(45deg) scale(1);
  }
  60% {
    opacity: 0.8;
    transform: translate(30px, -40px) rotate(180deg) scale(0.9);
  }
  100% {
    opacity: 0;
    transform: translate(50px, -60px) rotate(360deg) scale(0.5);
  }
}

/* 招手手势 */
.waving-hand {
  position: absolute;
  opacity: 0;
}

.hand-left {
  top: 5px;
  left: -25px;
  animation: wave-left 1.2s ease-in-out infinite;
}

.hand-right {
  top: 5px;
  right: -25px;
  animation: wave-right 1.2s ease-in-out infinite;
  animation-delay: 0.6s;
}

.hand-svg {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
}

@keyframes wave-left {
  0%,
  100% {
    opacity: 0.8;
    transform: rotate(-20deg) translateY(0);
  }
  50% {
    opacity: 1;
    transform: rotate(20deg) translateY(-8px);
  }
}

@keyframes wave-right {
  0%,
  100% {
    opacity: 0.8;
    transform: rotate(20deg) translateY(0);
  }
  50% {
    opacity: 1;
    transform: rotate(-20deg) translateY(-8px);
  }
}

/* 热情星星 */
.excitement-star {
  position: absolute;
  opacity: 0;
  animation: star-pop 1.5s ease-in-out infinite;
}

.star-1 {
  top: -25px;
  left: -10px;
  animation-delay: 0s;
}

.star-2 {
  top: -35px;
  right: 5px;
  animation-delay: 0.5s;
}

.star-3 {
  top: -15px;
  right: -15px;
  animation-delay: 1s;
}

.star-svg {
  width: 14px;
  height: 14px;
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.8));
}

@keyframes star-pop {
  0%,
  70% {
    opacity: 0;
    transform: scale(0.5) rotate(0deg);
  }
  75%,
  90% {
    opacity: 1;
    transform: scale(1.3) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.8) rotate(360deg);
  }
}

/* 宣传喇叭 */
.megaphone {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  animation: megaphone-shake 2s ease-in-out infinite;
}

.megaphone-svg {
  width: 30px;
  height: 30px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

@keyframes megaphone-shake {
  0%,
  100% {
    transform: translateX(-50%) rotate(-5deg);
  }
  50% {
    transform: translateX(-50%) rotate(5deg);
  }
}

/* 热情表情 */
.emoji-emotion {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  animation: emoji-bounce 2s ease-in-out infinite;
}

.emoji-svg {
  width: 26px;
  height: 26px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

@keyframes emoji-bounce {
  0%,
  70% {
    opacity: 0;
    transform: translateX(-50%) translateY(10px) scale(0.8);
  }
  75%,
  90% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px) scale(0.9);
  }
}

/* 传单堆 */
.flyer-stack {
  position: absolute;
  bottom: -25px;
  right: -20px;
  animation: stack-wobble 2s ease-in-out infinite;
}

.stack-svg {
  width: 24px;
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

@keyframes stack-wobble {
  0%,
  100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}

/* 效果线条 */
.action-lines {
  position: absolute;
  inset: 0;
}

.line {
  position: absolute;
  width: 2px;
  height: 15px;
  background: linear-gradient(to top, #ff6b6b, transparent);
  border-radius: 1px;
  opacity: 0;
  animation: line-pulse 1s ease-in-out infinite;
}

.line-1 {
  top: -10px;
  left: -5px;
  animation-delay: 0s;
}

.line-2 {
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0.3s;
}

.line-3 {
  top: -10px;
  right: -5px;
  animation-delay: 0.6s;
}

@keyframes line-pulse {
  0%,
  100% {
    opacity: 0;
    transform: scaleY(0.5);
  }
  50% {
    opacity: 1;
    transform: scaleY(1);
  }
}
</style>
