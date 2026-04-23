<script setup lang="ts">
// 搬砖效果组件 - 体力劳动动画
</script>

<template>
  <div class="brick-carrying-effects">
    <!-- 搬运的砖头堆 -->
    <div class="brick-stack">
      <!-- 砖头 1 -->
      <div class="brick brick-1">
        <svg viewBox="0 0 40 20" class="brick-svg">
          <rect x="2" y="2" width="36" height="16" rx="2" fill="#8B4513" />
          <rect x="4" y="4" width="32" height="12" rx="1" fill="#A0522D" />
          <rect
            x="6"
            y="6"
            width="8"
            height="8"
            rx="1"
            fill="#CD853F"
            opacity="0.5"
          />
          <rect
            x="16"
            y="6"
            width="8"
            height="8"
            rx="1"
            fill="#CD853F"
            opacity="0.5"
          />
          <rect
            x="26"
            y="6"
            width="8"
            height="8"
            rx="1"
            fill="#CD853F"
            opacity="0.5"
          />
        </svg>
      </div>
      <!-- 砖头 2 -->
      <div class="brick brick-2">
        <svg viewBox="0 0 40 20" class="brick-svg">
          <rect x="2" y="2" width="36" height="16" rx="2" fill="#8B4513" />
          <rect x="4" y="4" width="32" height="12" rx="1" fill="#A0522D" />
          <rect
            x="6"
            y="6"
            width="8"
            height="8"
            rx="1"
            fill="#CD853F"
            opacity="0.5"
          />
          <rect
            x="16"
            y="6"
            width="8"
            height="8"
            rx="1"
            fill="#CD853F"
            opacity="0.5"
          />
          <rect
            x="26"
            y="6"
            width="8"
            height="8"
            rx="1"
            fill="#CD853F"
            opacity="0.5"
          />
        </svg>
      </div>
      <!-- 砖头 3 -->
      <div class="brick brick-3">
        <svg viewBox="0 0 40 20" class="brick-svg">
          <rect x="2" y="2" width="36" height="16" rx="2" fill="#8B4513" />
          <rect x="4" y="4" width="32" height="12" rx="1" fill="#A0522D" />
          <rect
            x="6"
            y="6"
            width="8"
            height="8"
            rx="1"
            fill="#CD853F"
            opacity="0.5"
          />
          <rect
            x="16"
            y="6"
            width="8"
            height="8"
            rx="1"
            fill="#CD853F"
            opacity="0.5"
          />
          <rect
            x="26"
            y="6"
            width="8"
            height="8"
            rx="1"
            fill="#CD853F"
            opacity="0.5"
          />
        </svg>
      </div>
    </div>

    <!-- 汗珠效果 -->
    <div class="sweat-drop sweat-1">
      <svg viewBox="0 0 16 24" class="sweat-svg">
        <path
          d="M8 2 C8 2 2 8 2 14 C2 18.4 4.7 22 8 22 C11.3 22 14 18.4 14 14 C14 8 8 2 8 2Z"
          fill="#87CEEB"
        />
        <ellipse cx="6" cy="10" rx="2" ry="3" fill="white" opacity="0.6" />
      </svg>
    </div>
    <div class="sweat-drop sweat-2">
      <svg viewBox="0 0 12 18" class="sweat-svg small">
        <path
          d="M6 2 C6 2 1.5 6 1.5 10.5 C1.5 13.8 3.5 16.5 6 16.5 C8.5 16.5 10.5 13.8 10.5 10.5 C10.5 6 6 2 6 2Z"
          fill="#87CEEB"
        />
      </svg>
    </div>
    <div class="sweat-drop sweat-3">
      <svg viewBox="0 0 10 15" class="sweat-svg small">
        <path
          d="M5 1.5 C5 1.5 1.5 4.5 1.5 8 C1.5 10.5 3 12.5 5 12.5 C7 12.5 8.5 10.5 8.5 8 C8.5 4.5 5 1.5 5 1.5Z"
          fill="#87CEEB"
        />
      </svg>
    </div>

    <!-- 力量符号 -->
    <div class="power-symbol">
      <svg viewBox="0 0 32 32" class="power-svg">
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke="#FF6B35"
          stroke-width="3"
        />
        <path
          d="M16 4 L16 14 M16 18 L16 28 M10 10 L13 13 M19 13 L22 10 M10 22 L13 19 M19 19 L22 22"
          stroke="#FF6B35"
          stroke-width="3"
          stroke-linecap="round"
        />
        <circle cx="16" cy="16" r="4" fill="#FF6B35" />
      </svg>
    </div>

    <!-- 劳动工具图标 -->
    <div class="tool-icon hammer">
      <svg viewBox="0 0 32 32" class="tool-svg">
        <!-- 锤头 -->
        <rect x="4" y="8" width="18" height="10" rx="2" fill="#4A4A4A" />
        <rect x="6" y="10" width="14" height="6" rx="1" fill="#6A6A6A" />
        <!-- 锤柄 -->
        <rect x="12" y="16" width="4" height="14" rx="1" fill="#DEB887" />
        <rect
          x="13"
          y="17"
          width="2"
          height="12"
          fill="#D2B48C"
          opacity="0.5"
        />
      </svg>
    </div>

    <!-- 体力条 -->
    <div class="stamina-bar">
      <div class="stamina-background">
        <div class="stamina-fill"></div>
      </div>
      <div class="stamina-sparkles">
        <span class="sparkle">⚡</span>
        <span class="sparkle">⚡</span>
        <span class="sparkle">⚡</span>
      </div>
    </div>

    <!-- 努力音符 -->
    <div class="effort-note note-1">
      <svg viewBox="0 0 24 24" class="note-svg">
        <path
          d="M12 4 L12 16 M8 14 L8 18 L16 16 L16 12 L8 14Z"
          stroke="#FF6B6B"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="6" cy="18" r="3" fill="#FF6B6B" />
        <circle cx="14" cy="16" r="3" fill="#FF6B6B" />
      </svg>
    </div>
    <div class="effort-note note-2">
      <svg viewBox="0 0 24 24" class="note-svg">
        <path
          d="M12 4 L12 16 M8 14 L8 18 L16 16 L16 12 L8 14Z"
          stroke="#FF8E8E"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="6" cy="18" r="3" fill="#FF8E8E" />
        <circle cx="14" cy="16" r="3" fill="#FF8E8E" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.brick-carrying-effects {
  position: absolute;
  inset: -40px;
  pointer-events: none;
  overflow: visible;
}

/* 砖头堆 */
.brick-stack {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: -5px;
  animation: carry-bounce 1s ease-in-out infinite;
}

.brick {
  position: relative;
  animation: brick-wobble 0.8s ease-in-out infinite alternate;
}

.brick-1 {
  animation-delay: 0s;
}

.brick-2 {
  animation-delay: 0.2s;
}

.brick-3 {
  animation-delay: 0.4s;
}

.brick-svg {
  width: 32px;
  height: 16px;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
}

@keyframes carry-bounce {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-5px);
  }
}

@keyframes brick-wobble {
  0% {
    transform: rotate(-2deg);
  }
  100% {
    transform: rotate(2deg);
  }
}

/* 汗珠 */
.sweat-drop {
  position: absolute;
  opacity: 0;
  animation: sweat-fall 2s ease-in-out infinite;
}

.sweat-1 {
  top: -15px;
  left: -8px;
  animation-delay: 0s;
}

.sweat-2 {
  top: -10px;
  right: -5px;
  animation-delay: 0.7s;
}

.sweat-3 {
  top: 20px;
  left: 5px;
  animation-delay: 1.4s;
}

.sweat-svg {
  width: 14px;
  height: 20px;
  filter: drop-shadow(0 2px 2px rgba(135, 206, 235, 0.5));
}

.sweat-svg.small {
  width: 10px;
  height: 14px;
}

@keyframes sweat-fall {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translateY(-3px) scale(1);
  }
  80% {
    opacity: 1;
    transform: translateY(15px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(25px) scale(0.7);
  }
}

/* 力量符号 */
.power-symbol {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  animation: power-pulse 2s ease-in-out infinite;
}

.power-svg {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 0 6px rgba(255, 107, 53, 0.6));
}

@keyframes power-pulse {
  0%,
  70% {
    opacity: 0;
    transform: translateX(-50%) scale(0.5);
  }
  75%,
  90% {
    opacity: 1;
    transform: translateX(-50%) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) scale(0.8);
  }
}

/* 劳动工具 */
.tool-icon {
  position: absolute;
  opacity: 0;
  animation: tool-float 2.5s ease-in-out infinite;
}

.hammer {
  top: 10px;
  right: -20px;
  animation-delay: 1s;
}

.tool-svg {
  width: 20px;
  height: 20px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

@keyframes tool-float {
  0%,
  60% {
    opacity: 0;
    transform: translateY(0) rotate(0deg);
  }
  65%,
  85% {
    opacity: 0.8;
    transform: translateY(-8px) rotate(15deg);
  }
  100% {
    opacity: 0;
    transform: translateY(-15px) rotate(30deg);
  }
}

/* 体力条 */
.stamina-bar {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stamina-background {
  width: 50px;
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stamina-fill {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #ff6b35, #ff8e53);
  border-radius: 4px;
  animation: stamina-drain 1.5s ease-in-out infinite;
}

@keyframes stamina-drain {
  0% {
    width: 100%;
    background: linear-gradient(90deg, #ff6b35, #ff8e53);
  }
  50% {
    width: 60%;
    background: linear-gradient(90deg, #ff8e53, #ffaa77);
  }
  100% {
    width: 100%;
    background: linear-gradient(90deg, #ff6b35, #ff8e53);
  }
}

.stamina-sparkles {
  display: flex;
  gap: 3px;
  animation: sparkle-flicker 0.8s ease-in-out infinite alternate;
}

.sparkle {
  font-size: 8px;
  animation: sparkle-pop 1s ease-in-out infinite;
}

.sparkle:nth-child(2) {
  animation-delay: 0.2s;
}

.sparkle:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes sparkle-flicker {
  0% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

@keyframes sparkle-pop {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
}

/* 努力音符 */
.effort-note {
  position: absolute;
  opacity: 0;
  animation: note-float 2s ease-in-out infinite;
}

.note-1 {
  top: -20px;
  right: -15px;
  animation-delay: 0.3s;
}

.note-2 {
  top: 5px;
  left: -12px;
  animation-delay: 0.9s;
}

.note-svg {
  width: 14px;
  height: 14px;
  filter: drop-shadow(0 0 4px rgba(255, 107, 107, 0.5));
}

@keyframes note-float {
  0%,
  60% {
    opacity: 0;
    transform: translateY(0) rotate(-10deg) scale(0.8);
  }
  65%,
  85% {
    opacity: 1;
    transform: translateY(-10px) rotate(5deg) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) rotate(15deg) scale(0.9);
  }
}
</style>
