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
        <!-- 左边伞绳 - 从扇面尖端连接 -->
        <line
          x1="10"
          y1="85"
          x2="100"
          y2="180"
          stroke="url(#ropeGradient)"
          stroke-width="1"
        />
        <line
          x1="40"
          y1="90"
          x2="100"
          y2="180"
          stroke="url(#ropeGradient)"
          stroke-width="1"
        />
        <line
          x1="75"
          y1="93"
          x2="100"
          y2="180"
          stroke="url(#ropeGradient)"
          stroke-width="1"
        />
        <line
          x1="125"
          y1="93"
          x2="100"
          y2="180"
          stroke="url(#ropeGradient)"
          stroke-width="1"
        />
        <line
          x1="160"
          y1="90"
          x2="100"
          y2="180"
          stroke="url(#ropeGradient)"
          stroke-width="1"
        />
        <line
          x1="190"
          y1="85"
          x2="100"
          y2="180"
          stroke="url(#ropeGradient)"
          stroke-width="1"
        />
      </g>

      <!-- 伞面 -->
      <g class="canopy">
        <!-- 主伞面 - 6扇面拼接的圆顶降落伞 -->
        <!-- 顶部用一个大弧，底部用轻微下凹小弧形成波浪状扇面边缘 -->
        <!-- 扇面尖端略高于凹槽，整体边缘中间低两边高 -->
        <path
          d="M 10 85
             A 90 90 0 0 1 190 85
             Q 175 91, 160 90
             Q 145 94, 125 93
             Q 100 97, 75 93
             Q 55 91, 40 90
             Q 25 90, 10 85
             Z"
          fill="url(#canopyGradient)"
          stroke="#333"
          stroke-width="1.5"
        />

        <!-- 伞面分区线 - 放射状扇面分割 -->
        <path
          d="M 10 85 
          C 35 10, 85 5 100 5"
          stroke="rgba(0,0,0,0.15)"
          stroke-width="1.5"
          fill="none"
        />
        <path
          d="M 40 90 
          C 55 20, 100 5 120 -5"
          stroke="rgba(0,0,0,0.15)"
          stroke-width="1.5"
          fill="none"
        />
        <path
          d="M 75 93 
          C 80 25, 100 5 105 -5"
          stroke="rgba(0,0,0,0.15)"
          stroke-width="1.5"
          fill="none"
        />
        <path
          d="M 125 93 
          C 120 25, 100 5 95 -5"
          stroke="rgba(0,0,0,0.15)"
          stroke-width="1.5"
          fill="none"
        />
        <path
          d="M 160 90 
          C 145 20, 100 5, 80 -5"
          stroke="rgba(0,0,0,0.15)"
          stroke-width="1.5"
          fill="none"
        />
        <path
          d="M 190 85 
          C 165 10, 115 5 100 5"
          stroke="rgba(0,0,0,0.15)"
          stroke-width="1.5"
          fill="none"
        />

        <!-- 顶部透气孔 -->
        <ellipse
          cx="100"
          cy="5"
          rx="8"
          ry="5"
          fill="rgba(135,206,235,0.5)"
          stroke="#333"
          stroke-width="1"
        />

        <!-- 伞面高光 -->
        <ellipse
          cx="70"
          cy="35"
          rx="18"
          ry="12"
          fill="rgba(255,255,255,0.3)"
          transform="rotate(-30, 70, 35)"
        />
        <ellipse
          cx="125"
          cy="40"
          rx="14"
          ry="10"
          fill="rgba(255,255,255,0.2)"
          transform="rotate(25, 125, 40)"
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
