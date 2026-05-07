<script setup lang="ts">
/**
 * 降落伞效果组件
 * 背负式降落伞，背在宠物背上
 * 只显示伞面和伞绳（背包被宠物遮挡）
 */
</script>

<template>
  <div class="parachute-effect">
    <svg
      class="parachute-svg"
      viewBox="0 0 200 180"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <!-- 伞面渐变 -->
        <linearGradient id="canopyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FF6B6B" />
          <stop offset="30%" stop-color="#FF8E8E" />
          <stop offset="50%" stop-color="#FFE66D" />
          <stop offset="70%" stop-color="#4ECDC4" />
          <stop offset="100%" stop-color="#45B7D1" />
        </linearGradient>

        <!-- 绳索渐变 -->
        <linearGradient id="ropeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#DDD" />
          <stop offset="100%" stop-color="#999" />
        </linearGradient>
      </defs>

      <!-- 伞绳组 -->
      <g class="ropes">
        <!-- 左边三根 -->
        <line
          x1="25"
          y1="45"
          x2="90"
          y2="180"
          stroke="url(#ropeGradient)"
          stroke-width="1.5"
        />
        <line
          x1="40"
          y1="45"
          x2="90"
          y2="180"
          stroke="url(#ropeGradient)"
          stroke-width="1"
        />
        <line
          x1="60"
          y1="45"
          x2="90"
          y2="180"
          stroke="url(#ropeGradient)"
          stroke-width="1"
        />
        <!-- 右边三根 -->
        <line
          x1="140"
          y1="45"
          x2="105"
          y2="180"
          stroke="url(#ropeGradient)"
          stroke-width="1"
        />
        <line
          x1="160"
          y1="45"
          x2="105"
          y2="180"
          stroke="url(#ropeGradient)"
          stroke-width="1.5"
        />
        <line
          x1="175"
          y1="45"
          x2="105"
          y2="180"
          stroke="url(#ropeGradient)"
          stroke-width="1.5"
        />
      </g>

      <!-- 伞面 -->
      <g class="canopy">
        <!-- 主伞面 -->
        <path
          d="M 20 50
             Q 40 5, 100 0
             Q 160 5, 180 50
             Q 140 42, 100 45
             Q 60 42, 20 50 Z"
          fill="url(#canopyGradient)"
          stroke="#333"
          stroke-width="1.5"
        />

        <!-- 伞面分区线 -->
        <path
          d="M 50 12 Q 60 30, 70 43"
          stroke="rgba(0,0,0,0.15)"
          stroke-width="1.5"
          fill="none"
        />
        <path
          d="M 100 5 Q 100 25, 100 45"
          stroke="rgba(0,0,0,0.15)"
          stroke-width="1.5"
          fill="none"
        />
        <path
          d="M 150 12 Q 140 30, 130 43"
          stroke="rgba(0,0,0,0.15)"
          stroke-width="1.5"
          fill="none"
        />

        <!-- 顶部透气孔 -->
        <ellipse
          cx="100"
          cy="22"
          rx="12"
          ry="7"
          fill="rgba(135,206,235,0.5)"
          stroke="#333"
          stroke-width="1"
        />

        <!-- 伞面高光 -->
        <ellipse
          cx="70"
          cy="20"
          rx="15"
          ry="7"
          fill="rgba(255,255,255,0.35)"
          transform="rotate(-20, 70, 20)"
        />
        <ellipse
          cx="135"
          cy="22"
          rx="12"
          ry="6"
          fill="rgba(255,255,255,0.25)"
          transform="rotate(15, 135, 22)"
        />
      </g>

    </svg>
  </div>
</template>

<style scoped>
.parachute-effect {
  position: absolute;
  top: -280px;
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  height: 360px;
  pointer-events: none;
  z-index: -1;
}

.parachute-svg {
  width: 100%;
  height: 100%;
  animation: parachute-float 4s ease-in-out infinite;
  transform-origin: center 320px;
}

/* 整体悬浮动画 */
@keyframes parachute-float {
  0%,
  100% {
    transform: translateY(0) rotate(-1deg);
  }
  50% {
    transform: translateY(-10px) rotate(1deg);
  }
}

/* 伞面轻微摆动 */
.canopy {
  animation: sway 3s ease-in-out infinite;
  transform-origin: center 50px;
}

@keyframes sway {
  0%,
  100% {
    transform: rotate(-2deg);
  }
  50% {
    transform: rotate(2deg);
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .parachute-svg,
  .canopy {
    animation: none;
  }
}
</style>
