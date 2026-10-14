<script setup lang="ts">
// 得意效果组件
// 爱心/闪光星复用 icons 通用组件，音符用 NoteSvg 替代重复 SVG
import HeartSvg from "./icons/HeartSvg.vue";
import SparkleSvg from "./icons/SparkleSvg.vue";
import NoteSvg from "./icons/NoteSvg.vue";

// 光芒线条：旋转角度均分 + delay 步进
const rays = Array.from({ length: 6 }, (_, i) => ({
  angle: `${-60 + i * 30}deg`,
  delay: `${i * 0.1}s`,
}));

// 小音符：两个颜色/位置差异
const notes = [
  { color: "#a78bfa", top: "-15px", left: "-30px", delay: "0s", size: "" },
  {
    color: "#c4b5fd",
    top: "-25px",
    right: "-35px",
    delay: "1.2s",
    size: "small",
  },
];

// 闪光星星：三个颜色/位置/delay 差异
const sparkles = [
  { color: "#fef08a", top: "-35px", left: "-20px", delay: "0s", size: "" },
  {
    color: "#fde047",
    top: "-45px",
    right: "-15px",
    delay: "0.7s",
    size: "small",
  },
  {
    color: "#fef3c7",
    top: "-20px",
    right: "-25px",
    delay: "1.4s",
    size: "tiny",
  },
];
</script>

<template>
  <div class="smug-effects effect-layer">
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
    <div
      v-for="(sp, i) in sparkles"
      :key="`sp-${i}`"
      class="sparkle"
      :style="{
        top: sp.top,
        left: sp.left,
        right: sp.right,
        '--fx-delay': sp.delay,
      }"
    >
      <SparkleSvg :color="sp.color" class="sparkle-svg" :class="sp.size" />
    </div>

    <!-- 光芒线条 -->
    <div
      v-for="(ray, i) in rays"
      :key="`ray-${i}`"
      class="ray"
      :style="{
        transform: `translateX(-50%) rotate(${ray.angle})`,
        '--fx-delay': ray.delay,
      }"
    ></div>

    <!-- 小音符 -->
    <div
      v-for="(note, i) in notes"
      :key="`note-${i}`"
      class="note"
      :style="{
        top: note.top,
        left: note.left,
        right: note.right,
        '--fx-delay': note.delay,
      }"
    >
      <NoteSvg :color="note.color" class="note-svg" :class="note.size" />
    </div>

    <!-- 小爱心 -->
    <div class="heart heart-1">
      <HeartSvg color="#ff6b9d" class="heart-svg" />
    </div>
  </div>
</template>

<style scoped>
@import "./shared.css";

.smug-effects {
  inset: -50px;
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
  animation: fx-twinkle 2s ease-in-out infinite;
  animation-delay: var(--fx-delay, 0s);
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
  animation-delay: var(--fx-delay, 0s);
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
  animation-delay: var(--fx-delay, 0s);
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
