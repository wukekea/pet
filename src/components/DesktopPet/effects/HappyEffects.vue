<script setup lang="ts">
// 开心效果组件 - 萌系动漫风格
</script>

<template>
  <div class="happy-effects">
    <!-- 漂浮的爱心和星星 -->
    <div class="float-item heart-1">
      <svg viewBox="0 0 24 24" class="heart-svg">
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
    </div>
    <div class="float-item star-1">
      <svg viewBox="0 0 24 24" class="star-svg">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
    </div>
    <div class="float-item heart-2">
      <svg viewBox="0 0 24 24" class="heart-svg small">
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
    </div>
    <div class="float-item star-2">
      <svg viewBox="0 0 24 24" class="star-svg small">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
    </div>
    <div class="float-item heart-3">
      <svg viewBox="0 0 24 24" class="heart-svg">
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.happy-effects {
  position: absolute;
  inset: -20px;
  pointer-events: none;
  overflow: visible;
}

.float-item {
  position: absolute;
  opacity: 0;
  animation: float-up 1.8s ease-out forwards;
}

.heart-svg,
.star-svg {
  width: 16px;
  height: 16px;
  filter: drop-shadow(0 2px 4px rgba(255, 100, 150, 0.4));
}

.heart-svg {
  fill: #ff6b9d;
}

.heart-svg.small {
  width: 12px;
  height: 12px;
  fill: #ff8fab;
}

.star-svg {
  fill: #ffd700;
  animation: star-twinkle 0.5s ease-in-out infinite alternate;
}

.star-svg.small {
  width: 10px;
  height: 10px;
  fill: #ffe066;
}

@keyframes star-twinkle {
  from {
    filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.6));
  }
  to {
    filter: drop-shadow(0 0 5px rgba(255, 215, 0, 1));
  }
}

/* 位置和延迟 */
.heart-1 {
  top: 0;
  left: -10px;
  animation-delay: 0s;
}

.star-1 {
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0.2s;
}

.heart-2 {
  top: 5px;
  right: -12px;
  animation-delay: 0.35s;
}

.star-2 {
  top: -8px;
  right: 5px;
  animation-delay: 0.5s;
}

.heart-3 {
  top: 15px;
  left: -15px;
  animation-delay: 0.6s;
}

@keyframes float-up {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  30% {
    opacity: 1;
    transform: translateY(-10px) scale(1.1);
  }
  60% {
    opacity: 1;
    transform: translateY(-25px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-40px) scale(0.8);
  }
}
</style>
