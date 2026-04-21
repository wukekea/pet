<script setup lang="ts">
// 惊吓效果组件
</script>

<template>
  <div class="scared-effects">
    <!-- 惊叹号 -->
    <div class="exclaim exclaim-1">
      <svg viewBox="0 0 24 24" class="exclaim-svg">
        <path d="M12 2L14 14H10L12 2Z" fill="#ef4444" />
        <circle cx="12" cy="20" r="2" fill="#ef4444" />
      </svg>
    </div>
    <div class="exclaim exclaim-2">
      <svg viewBox="0 0 24 24" class="exclaim-svg">
        <path d="M12 2L14 14H10L12 2Z" fill="#dc2626" />
        <circle cx="12" cy="20" r="2" fill="#dc2626" />
      </svg>
    </div>

    <!-- 震动线条 -->
    <div class="shake-line line-1"></div>
    <div class="shake-line line-2"></div>
    <div class="shake-line line-3"></div>
    <div class="shake-line line-4"></div>

    <!-- 汗滴 -->
    <div class="sweat-drop sweat-1">
      <svg viewBox="0 0 24 24" class="sweat-svg">
        <path
          d="M12 2C12 2 6 10 6 15C6 18.3 8.7 21 12 21C15.3 21 18 18.3 18 15C18 10 12 2 12 2Z"
          fill="#60a5fa"
        />
      </svg>
    </div>
    <div class="sweat-drop sweat-2">
      <svg viewBox="0 0 24 24" class="sweat-svg small">
        <path
          d="M12 2C12 2 6 10 6 15C6 18.3 8.7 21 12 21C15.3 21 18 18.3 18 15C18 10 12 2 12 2Z"
          fill="#93c5fd"
        />
      </svg>
    </div>

    <!-- 闪电 -->
    <div class="lightning lightning-1">
      <svg viewBox="0 0 24 24" class="lightning-svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#fbbf24" />
      </svg>
    </div>
    <div class="lightning lightning-2">
      <svg viewBox="0 0 24 24" class="lightning-svg small">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#fcd34d" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.scared-effects {
  position: absolute;
  inset: -50px;
  pointer-events: none;
  overflow: visible;
}

/* 惊叹号 */
.exclaim {
  position: absolute;
  top: -25px;
  animation: exclaim-pop 0.4s ease-in-out infinite;
}

.exclaim-1 {
  left: -15px;
  animation-delay: 0s;
}

.exclaim-2 {
  right: -15px;
  animation-delay: 0.2s;
}

.exclaim-svg {
  width: 18px;
  height: 28px;
  filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.8));
}

@keyframes exclaim-pop {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  30% {
    transform: translateY(-12px) scale(1.2);
  }
  60% {
    transform: translateY(-6px) scale(1.1);
  }
}

/* 震动线条 */
.shake-line {
  position: absolute;
  width: 3px;
  height: 12px;
  background: linear-gradient(180deg, #ef4444, transparent);
  border-radius: 2px;
  animation: line-shake 0.2s ease-in-out infinite;
}

.line-1 {
  top: -20px;
  left: 5px;
  transform: rotate(-20deg);
  animation-delay: 0s;
}

.line-2 {
  top: -25px;
  left: 20px;
  height: 16px;
  transform: rotate(15deg);
  animation-delay: 0.1s;
}

.line-3 {
  top: -18px;
  right: 5px;
  transform: rotate(20deg);
  animation-delay: 0.05s;
}

.line-4 {
  top: -22px;
  right: 20px;
  height: 14px;
  transform: rotate(-15deg);
  animation-delay: 0.15s;
}

@keyframes line-shake {
  0%,
  100% {
    opacity: 0.6;
    transform: rotate(var(--rotation, 0deg)) scaleY(1);
  }
  50% {
    opacity: 1;
    transform: rotate(calc(var(--rotation, 0deg) + 10deg)) scaleY(1.3);
  }
}

.line-1 {
  --rotation: -20deg;
}
.line-2 {
  --rotation: 15deg;
}
.line-3 {
  --rotation: 20deg;
}
.line-4 {
  --rotation: -15deg;
}

/* 汗滴 */
.sweat-drop {
  position: absolute;
  animation: sweat-drip 1s ease-in-out infinite;
}

.sweat-1 {
  top: -5px;
  right: -20px;
  animation-delay: 0s;
}

.sweat-2 {
  top: 5px;
  right: -28px;
  animation-delay: 0.4s;
}

.sweat-svg {
  width: 12px;
  height: 16px;
  filter: drop-shadow(0 1px 2px rgba(96, 165, 250, 0.4));
}

.sweat-svg.small {
  width: 8px;
  height: 12px;
}

@keyframes sweat-drip {
  0% {
    opacity: 0;
    transform: translateY(-5px) scale(0.5);
  }
  30% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(15px) scale(0.8);
  }
}

/* 闪电 */
.lightning {
  position: absolute;
  animation: lightning-flash 0.8s ease-in-out infinite;
}

.lightning-1 {
  top: -30px;
  left: -25px;
  animation-delay: 0s;
}

.lightning-2 {
  top: -35px;
  right: -22px;
  animation-delay: 0.4s;
}

.lightning-svg {
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.8));
}

.lightning-svg.small {
  width: 12px;
  height: 12px;
}

@keyframes lightning-flash {
  0%,
  40%,
  60%,
  100% {
    opacity: 0;
    transform: scale(0.5);
  }
  45%,
  55% {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>
