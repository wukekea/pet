<script setup lang="ts">
// 尴尬效果组件
</script>

<template>
  <div class="embarrassed-effects">
    <!-- 额头汗珠群 -->
    <div class="forehead-sweat">
      <div class="sweat-bead sweat-1">
        <svg viewBox="0 0 24 32" class="sweat-svg">
          <path
            d="M12 2C12 2 4 12 4 20C4 24.4 7.6 28 12 28C16.4 28 20 24.4 20 20C20 12 12 2 12 2Z"
            fill="url(#sweat-gradient-1)"
          />
          <defs>
            <linearGradient
              id="sweat-gradient-1"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stop-color="#bfdbfe" />
              <stop offset="50%" stop-color="#60a5fa" />
              <stop offset="100%" stop-color="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div class="sweat-bead sweat-2">
        <svg viewBox="0 0 24 32" class="sweat-svg small">
          <path
            d="M12 2C12 2 4 12 4 20C4 24.4 7.6 28 12 28C16.4 28 20 24.4 20 20C20 12 12 2 12 2Z"
            fill="#93c5fd"
          />
        </svg>
      </div>
      <div class="sweat-bead sweat-3">
        <svg viewBox="0 0 24 32" class="sweat-svg tiny">
          <path
            d="M12 2C12 2 4 12 4 20C4 24.4 7.6 28 12 28C16.4 28 20 24.4 20 20C20 12 12 2 12 2Z"
            fill="#bfdbfe"
          />
        </svg>
      </div>
    </div>

    <!-- 脸侧大汗珠 -->
    <div class="side-sweat side-left">
      <svg viewBox="0 0 32 48" class="big-sweat-svg">
        <path
          d="M16 4C16 4 4 18 4 32C4 40.8 9.2 46 16 46C22.8 46 28 40.8 28 32C28 18 16 4 16 4Z"
          fill="url(#big-sweat-gradient)"
        />
        <ellipse cx="10" cy="24" rx="3" ry="5" fill="rgba(255,255,255,0.6)" />
        <defs>
          <linearGradient
            id="big-sweat-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stop-color="#e0f2fe" />
            <stop offset="50%" stop-color="#7dd3fc" />
            <stop offset="100%" stop-color="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div class="side-sweat side-right">
      <svg viewBox="0 0 32 48" class="big-sweat-svg small">
        <path
          d="M16 4C16 4 4 18 4 32C4 40.8 9.2 46 16 46C22.8 46 28 40.8 28 32C28 18 16 4 16 4Z"
          fill="#7dd3fc"
        />
        <ellipse cx="10" cy="24" rx="2" ry="4" fill="rgba(255,255,255,0.5)" />
      </svg>
    </div>

    <!-- 飘落的汗滴 -->
    <div class="falling-drops">
      <div class="drop drop-1">
        <svg viewBox="0 0 12 16" class="drop-svg">
          <path
            d="M6 0C6 0 2 6 2 10C2 12.2 3.8 14 6 14C8.2 14 10 12.2 10 10C10 6 6 0 6 0Z"
            fill="#93c5fd"
          />
        </svg>
      </div>
      <div class="drop drop-2">
        <svg viewBox="0 0 12 16" class="drop-svg small">
          <path
            d="M6 0C6 0 2 6 2 10C2 12.2 3.8 14 6 14C8.2 14 10 12.2 10 10C10 6 6 0 6 0Z"
            fill="#bfdbfe"
          />
        </svg>
      </div>
      <div class="drop drop-3">
        <svg viewBox="0 0 12 16" class="drop-svg tiny">
          <path
            d="M6 0C6 0 2 6 2 10C2 12.2 3.8 14 6 14C8.2 14 10 12.2 10 10C10 6 6 0 6 0Z"
            fill="#60a5fa"
          />
        </svg>
      </div>
    </div>

    <!-- 焦虑线条 -->
    <div class="anxiety-lines">
      <div class="anxiety-line line-1"></div>
      <div class="anxiety-line line-2"></div>
      <div class="anxiety-line line-3"></div>
    </div>

    <!-- 晕眩波纹 -->
    <div class="dizzy-waves">
      <div class="wave-ring ring-1"></div>
      <div class="wave-ring ring-2"></div>
    </div>

    <!-- 尴尬符号 -->
    <div class="awkward-symbol">
      <svg viewBox="0 0 24 24" class="symbol-svg">
        <!-- 波浪线表示尴尬 -->
        <path
          d="M2 12 Q6 8 10 12 T18 12 T26 12"
          stroke="#94a3b8"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.embarrassed-effects {
  position: absolute;
  inset: -50px;
  pointer-events: none;
  overflow: visible;
}

/* 额头汗珠群 */
.forehead-sweat {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.sweat-bead {
  opacity: 0;
  animation: bead-appear 1.5s ease-in-out infinite;
}

.sweat-1 {
  animation-delay: 0s;
}

.sweat-2 {
  animation-delay: 0.3s;
}

.sweat-3 {
  animation-delay: 0.6s;
}

.sweat-svg {
  width: 10px;
  height: 14px;
  filter: drop-shadow(0 2px 3px rgba(59, 130, 246, 0.4));
}

.sweat-svg.small {
  width: 8px;
  height: 11px;
}

.sweat-svg.tiny {
  width: 6px;
  height: 8px;
}

@keyframes bead-appear {
  0% {
    opacity: 0;
    transform: translateY(-3px) scale(0.5);
  }
  30% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  70% {
    opacity: 0.8;
    transform: translateY(2px) scale(0.95);
  }
  100% {
    opacity: 0;
    transform: translateY(5px) scale(0.8);
  }
}

/* 脸侧大汗珠 */
.side-sweat {
  position: absolute;
  opacity: 0;
  animation: big-sweat-drip 2.5s ease-in-out infinite;
}

.side-left {
  top: 5px;
  left: -25px;
  animation-delay: 0.2s;
}

.side-right {
  top: 10px;
  right: -22px;
  animation-delay: 0.8s;
}

.big-sweat-svg {
  width: 18px;
  height: 28px;
  filter: drop-shadow(0 3px 6px rgba(56, 189, 248, 0.5));
}

.big-sweat-svg.small {
  width: 14px;
  height: 22px;
}

@keyframes big-sweat-drip {
  0% {
    opacity: 0;
    transform: translateY(-8px) scale(0.6);
  }
  20% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  80% {
    opacity: 0.7;
    transform: translateY(12px) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
}

/* 飘落的汗滴 */
.falling-drops {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
}

.drop {
  position: absolute;
  opacity: 0;
  animation: drop-fall 2s ease-in infinite;
}

.drop-1 {
  left: -10px;
  top: -20px;
  animation-delay: 0.5s;
}

.drop-2 {
  right: -5px;
  top: -15px;
  animation-delay: 1s;
}

.drop-3 {
  left: 10px;
  top: -25px;
  animation-delay: 1.5s;
}

.drop-svg {
  width: 8px;
  height: 10px;
}

.drop-svg.small {
  width: 6px;
  height: 8px;
}

.drop-svg.tiny {
  width: 5px;
  height: 6px;
}

@keyframes drop-fall {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  10% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(50px) scale(0.8);
  }
}

/* 焦虑线条 */
.anxiety-lines {
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.anxiety-line {
  width: 2px;
  height: 12px;
  background: linear-gradient(180deg, #94a3b8, transparent);
  border-radius: 1px;
  opacity: 0;
  animation: line-pulse 1s ease-in-out infinite;
}

.line-1 {
  animation-delay: 0s;
  height: 14px;
}

.line-2 {
  animation-delay: 0.15s;
  height: 10px;
}

.line-3 {
  animation-delay: 0.3s;
  height: 12px;
}

@keyframes line-pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scaleY(0.8);
  }
  50% {
    opacity: 0.8;
    transform: scaleY(1.2);
  }
}

/* 晕眩波纹 */
.dizzy-waves {
  position: absolute;
  top: -30px;
  right: -15px;
}

.wave-ring {
  position: absolute;
  border: 2px solid transparent;
  border-top-color: #cbd5e1;
  border-radius: 50%;
  animation: ring-expand 1.5s ease-out infinite;
}

.ring-1 {
  width: 16px;
  height: 16px;
  animation-delay: 0s;
}

.ring-2 {
  width: 12px;
  height: 12px;
  top: 2px;
  left: 2px;
  animation-delay: 0.3s;
  border-top-color: #94a3b8;
}

@keyframes ring-expand {
  0% {
    opacity: 0.8;
    transform: scale(0.8) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: scale(1.5) rotate(180deg);
  }
}

/* 尴尬符号 */
.awkward-symbol {
  position: absolute;
  top: -45px;
  left: -20px;
  opacity: 0;
  animation: symbol-appear 3s ease-in-out infinite;
}

.symbol-svg {
  width: 20px;
  height: 12px;
}

@keyframes symbol-appear {
  0%,
  30% {
    opacity: 0;
    transform: translateX(-5px);
  }
  40%,
  70% {
    opacity: 0.7;
    transform: translateX(0);
  }
  100% {
    opacity: 0;
    transform: translateX(5px);
  }
}
</style>
