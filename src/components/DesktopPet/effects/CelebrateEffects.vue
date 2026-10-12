<script setup lang="ts">
// 跳跃庆祝效果组件
// 彩带轨迹用数据配置 + CSS 变量注入，替代 6 组手写 --x/--y 块

// 彩带：颜色渐变 + 五段轨迹点 + delay
const ribbons = [
  {
    gradient: "linear-gradient(180deg, #f472b6 0%, #ec4899 100%)",
    delay: "0s",
    points: [
      [-25, -35],
      [-40, -25],
      [-50, 0],
      [-55, 25],
      [-60, 50],
    ],
  },
  {
    gradient: "linear-gradient(180deg, #a78bfa 0%, #8b5cf6 100%)",
    delay: "0.1s",
    points: [
      [25, -40],
      [40, -30],
      [50, -5],
      [55, 20],
      [60, 50],
    ],
  },
  {
    gradient: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)",
    delay: "0.2s",
    points: [
      [-20, -25],
      [-35, -15],
      [-45, 10],
      [-50, 35],
      [-55, 60],
    ],
  },
  {
    gradient: "linear-gradient(180deg, #34d399 0%, #10b981 100%)",
    delay: "0.3s",
    points: [
      [20, -30],
      [35, -20],
      [48, 5],
      [55, 30],
      [60, 55],
    ],
  },
  {
    gradient: "linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)",
    delay: "0.15s",
    points: [
      [-30, -45],
      [-50, -35],
      [-60, -10],
      [-65, 15],
      [-70, 45],
    ],
  },
  {
    gradient: "linear-gradient(180deg, #f87171 0%, #ef4444 100%)",
    delay: "0.25s",
    points: [
      [30, -35],
      [48, -25],
      [58, 0],
      [65, 25],
      [70, 50],
    ],
  },
];

// 把轨迹点转成 --x1..--x5/--y1..--y5 CSS 变量
const ribbonStyle = (r: (typeof ribbons)[number]) => {
  const style: Record<string, string> = {
    background: r.gradient,
    "--fx-delay": r.delay,
  };
  r.points.forEach(([x, y], i) => {
    style[`--x${i + 1}`] = `${x}px`;
    style[`--y${i + 1}`] = `${y}px`;
  });
  return style;
};

// 星星与圆点：位置/颜色/delay 差异
const stars = [
  { top: "-35px", left: "-25px", color: "#fbbf24", delay: "0s", icon: "✦" },
  { top: "-40px", right: "-20px", color: "#a78bfa", delay: "0.3s", icon: "✧" },
  { top: "10px", left: "-30px", color: "#f472b6", delay: "0.5s", icon: "⭐" },
  { top: "5px", right: "-25px", color: "#34d399", delay: "0.7s", icon: "✨" },
];

const dots = [
  {
    top: "-20px",
    left: "0",
    gradient: "radial-gradient(circle, #fbbf24 0%, #f59e0b 100%)",
    delay: "0s",
  },
  {
    top: "-15px",
    right: "5px",
    gradient: "radial-gradient(circle, #f472b6 0%, #ec4899 100%)",
    delay: "0.4s",
  },
  {
    top: "5px",
    left: "-10px",
    gradient: "radial-gradient(circle, #60a5fa 0%, #3b82f6 100%)",
    delay: "0.8s",
  },
  {
    top: "10px",
    right: "-5px",
    gradient: "radial-gradient(circle, #34d399 0%, #10b981 100%)",
    delay: "1.2s",
  },
];
</script>

<template>
  <div class="celebrate-effects">
    <!-- 彩带 -->
    <div
      v-for="(ribbon, i) in ribbons"
      :key="`cr-${i}`"
      class="confetti-ribbon"
      :style="ribbonStyle(ribbon)"
    ></div>
    <!-- 星星 -->
    <div
      v-for="(star, i) in stars"
      :key="`cs-${i}`"
      class="celebrate-star"
      :style="{
        top: star.top,
        left: star.left,
        right: star.right,
        color: star.color,
        '--fx-delay': star.delay,
      }"
    >
      {{ star.icon }}
    </div>
    <!-- 彩色圆点 -->
    <div
      v-for="(dot, i) in dots"
      :key="`cd-${i}`"
      class="celebrate-dot"
      :style="{
        top: dot.top,
        left: dot.left,
        right: dot.right,
        background: dot.gradient,
        '--fx-delay': dot.delay,
      }"
    ></div>
    <!-- 光环 -->
    <div class="celebrate-glow"></div>
  </div>
</template>

<style scoped>
.celebrate-effects {
  position: absolute;
  inset: -40px;
  pointer-events: none;
  overflow: visible;
}

/* 彩带：颜色/轨迹/delay 由 :style 注入 */
.confetti-ribbon {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 6px;
  height: 18px;
  border-radius: 3px;
  animation: confetti-burst 1.5s ease-out infinite;
  animation-delay: var(--fx-delay, 0s);
  opacity: 0;
}

@keyframes confetti-burst {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
  }
  20% {
    opacity: 1;
    transform: translate(var(--x1), var(--y1)) rotate(180deg) scale(1.1);
  }
  40% {
    opacity: 1;
    transform: translate(var(--x2), var(--y2)) rotate(360deg) scale(1);
  }
  60% {
    opacity: 0.8;
    transform: translate(var(--x3), var(--y3)) rotate(540deg) scale(0.9);
  }
  80% {
    opacity: 0.5;
    transform: translate(var(--x4), var(--y4)) rotate(660deg) scale(0.7);
  }
  100% {
    opacity: 0;
    transform: translate(var(--x5), var(--y5)) rotate(720deg) scale(0.5);
  }
}

/* 庆祝星星：位置/颜色/delay 由 :style 注入 */
.celebrate-star {
  position: absolute;
  font-size: 14px;
  animation: star-celebrate 1s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
  opacity: 0;
  filter: drop-shadow(0 0 4px currentColor);
}

@keyframes star-celebrate {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.5) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.3) rotate(15deg);
  }
}

/* 彩色圆点：位置/渐变/delay 由 :style 注入 */
.celebrate-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: dot-float 2s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
  opacity: 0;
}

@keyframes dot-float {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-5px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) scale(0.5);
  }
}

/* 光环效果 */
.celebrate-glow {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(
    circle,
    rgba(167, 139, 250, 0.3) 0%,
    rgba(167, 139, 250, 0.1) 40%,
    transparent 70%
  );
  border-radius: 50%;
  animation: glow-pulse 1.5s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.3);
  }
}
</style>
