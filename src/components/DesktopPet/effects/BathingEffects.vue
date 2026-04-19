<script setup lang="ts">
// 洗澡效果组件
</script>

<template>
  <div class="bathing-effects">
    <!-- 莲蓬头淋浴器 -->
    <div class="shower-head-unit">
      <!-- 固定支架 -->
      <div class="shower-bracket">
        <div class="bracket-pipe"></div>
        <div class="bracket-arm"></div>
      </div>
      <!-- 莲蓬头主体 -->
      <div class="shower-head">
        <div class="head-top"></div>
        <div class="head-dome">
          <div class="head-rim"></div>
        </div>
        <div class="head-plate">
          <!-- 出水孔阵列 -->
          <div class="nozzle-row">
            <span class="nozzle"></span>
            <span class="nozzle"></span>
            <span class="nozzle"></span>
            <span class="nozzle"></span>
            <span class="nozzle"></span>
          </div>
          <div class="nozzle-row">
            <span class="nozzle"></span>
            <span class="nozzle"></span>
            <span class="nozzle"></span>
            <span class="nozzle"></span>
          </div>
          <div class="nozzle-row">
            <span class="nozzle"></span>
            <span class="nozzle"></span>
            <span class="nozzle"></span>
          </div>
        </div>
      </div>
      <!-- 水流 -->
      <div class="water-streams">
        <span class="stream s-1"></span>
        <span class="stream s-2"></span>
        <span class="stream s-3"></span>
        <span class="stream s-4"></span>
        <span class="stream s-5"></span>
        <span class="stream s-6"></span>
        <span class="stream s-7"></span>
        <span class="stream s-8"></span>
        <span class="stream s-9"></span>
      </div>
    </div>

    <!-- 水雾效果 -->
    <div class="water-mist"></div>

    <!-- 泡泡群 -->
    <div class="bubble-cluster">
      <span class="bubble b-1"></span>
      <span class="bubble b-2"></span>
      <span class="bubble b-3"></span>
      <span class="bubble b-4"></span>
      <span class="bubble b-5"></span>
      <span class="bubble b-6"></span>
    </div>

    <!-- 水花溅起 -->
    <div class="splash-effect">
      <span class="water-splash ws-1"></span>
      <span class="water-splash ws-2"></span>
      <span class="water-splash ws-3"></span>
    </div>

    <!-- 干净闪光星星 -->
    <div class="clean-stars">
      <span class="star star-1">✦</span>
      <span class="star star-2">✧</span>
      <span class="star star-3">✦</span>
      <span class="star star-4">✧</span>
      <span class="star star-5">✦</span>
      <span class="star star-6">✧</span>
    </div>

    <!-- 彩虹光环 -->
    <div class="rainbow-aura"></div>

    <!-- 快乐音符 -->
    <div class="happy-notes">
      <span class="note nt-1">♪</span>
      <span class="note nt-2">♫</span>
    </div>
  </div>
</template>

<style scoped>
.bathing-effects {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 150px;
  top: -70px;
  pointer-events: none;
}

/* 莲蓬头淋浴器 - 可爱工业风 */
.shower-head-unit {
  position: absolute;
  top: -50px;
  left: -20px;
  transform: rotate(-45deg);
  z-index: 10;
}

/* 固定支架 */
.shower-bracket {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
}

.bracket-pipe {
  width: 6px;
  height: 25px;
  margin: 0 auto;
  background: linear-gradient(
    90deg,
    #9ca3af 0%,
    #e5e7eb 30%,
    #f3f4f6 50%,
    #e5e7eb 70%,
    #9ca3af 100%
  );
  border-radius: 3px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.15);
}

.bracket-arm {
  width: 20px;
  height: 5px;
  margin: 0 auto;
  background: linear-gradient(180deg, #d1d5db 0%, #f3f4f6 50%, #9ca3af 100%);
  border-radius: 2px;
  box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.1);
}

/* 莲蓬头主体 */
.shower-head {
  position: relative;
  animation: shower-gentle-swing 3s ease-in-out infinite;
}

.head-top {
  width: 8px;
  height: 8px;
  margin: 0 auto;
  background: linear-gradient(180deg, #d1d5db 0%, #f3f4f6 50%, #9ca3af 100%);
  border-radius: 2px 2px 0 0;
}

.head-dome {
  width: 36px;
  height: 18px;
  margin: 0 auto;
  background: linear-gradient(
    180deg,
    #c4b5fd 0%,
    #a78bfa 30%,
    #8b5cf6 70%,
    #7c3aed 100%
  );
  border-radius: 18px 18px 0 0;
  position: relative;
  box-shadow:
    inset 0 4px 8px rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(139, 92, 246, 0.3);
}

.head-dome::before {
  content: "";
  position: absolute;
  top: 3px;
  left: 8px;
  width: 12px;
  height: 6px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  filter: blur(1px);
}

.head-rim {
  position: absolute;
  bottom: 0;
  left: -2px;
  right: -2px;
  height: 4px;
  background: linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%);
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* 出水面板 */
.head-plate {
  width: 40px;
  height: 8px;
  margin: 0 auto;
  background: linear-gradient(180deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%);
  border-radius: 0 0 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: 2px 0;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.5),
    0 3px 6px rgba(0, 0, 0, 0.1);
}

.nozzle-row {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.nozzle {
  width: 3px;
  height: 3px;
  background: radial-gradient(circle, #4c1d95 0%, #5b21b6 50%, #6d28d9 100%);
  border-radius: 50%;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

@keyframes shower-gentle-swing {
  0%,
  100% {
    transform: rotate(-1deg);
  }
  50% {
    transform: rotate(1deg);
  }
}

/* 水流 */
.water-streams {
  position: absolute;
  top: 30px;
  left: 0;
  width: 70px;
  height: 70px;
  transform: rotate(45deg);
  transform-origin: top left;
}

.stream {
  position: absolute;
  width: 2px;
  background: linear-gradient(
    180deg,
    rgba(167, 139, 250, 0.95) 0%,
    rgba(139, 92, 246, 0.8) 40%,
    rgba(96, 165, 250, 0.5) 70%,
    transparent 100%
  );
  border-radius: 2px;
  animation: stream-fall 0.3s linear infinite;
  opacity: 0;
  box-shadow: 0 0 4px rgba(139, 92, 246, 0.5);
}

.stream::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2px;
}

/* 水流位置 */
.s-1 {
  left: 2px;
  top: 0px;
  height: 32px;
  animation-delay: 0s;
}
.s-2 {
  left: 7px;
  top: -3px;
  height: 38px;
  animation-delay: 0.12s;
}
.s-3 {
  left: 12px;
  top: -5px;
  height: 34px;
  animation-delay: 0.05s;
}
.s-8 {
  left: 15px;
  top: -7px;
  height: 35px;
  animation-delay: 0.03s;
}
.s-4 {
  left: 17px;
  top: -12px;
  height: 40px;
  animation-delay: 0.18s;
}
.s-5 {
  left: 22px;
  top: -14px;
  height: 36px;
  animation-delay: 0.08s;
}
.s-9 {
  left: 25px;
  top: -18px;
  height: 33px;
  animation-delay: 0.2s;
}
.s-6 {
  left: 27px;
  top: -25px;
  height: 38px;
  animation-delay: 0.15s;
}
.s-7 {
  left: 32px;
  top: -27px;
  height: 30px;
  animation-delay: 0.22s;
}

@keyframes stream-fall {
  0% {
    opacity: 0;
    transform: rotate(-25deg) translate(0, -3px) scaleY(0.4);
  }
  15% {
    opacity: 0.9;
  }
  100% {
    opacity: 0.3;
    transform: rotate(0deg) translate(25px, 55px) scaleY(1.05);
  }
}

/* 水雾效果 */
.water-mist {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(
    ellipse at center,
    rgba(167, 139, 250, 0.15) 0%,
    rgba(139, 92, 246, 0.08) 40%,
    transparent 70%
  );
  border-radius: 50%;
  animation: mist-pulse 2s ease-in-out infinite;
}

@keyframes mist-pulse {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateX(-50%) scale(1.15);
    opacity: 0.8;
  }
}

/* 泡泡群 */
.bubble-cluster {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 50px;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(224, 231, 255, 0.6) 40%,
    rgba(199, 210, 254, 0.3) 100%
  );
  border: 1px solid rgba(167, 139, 250, 0.3);
  box-shadow:
    inset 0 0 8px rgba(255, 255, 255, 0.8),
    0 2px 8px rgba(139, 92, 246, 0.2);
  animation: bubble-drift 3s ease-in-out infinite;
  opacity: 0;
}

.bubble::before {
  content: "";
  position: absolute;
  top: 20%;
  left: 25%;
  width: 30%;
  height: 30%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

.b-1 {
  width: 14px;
  height: 14px;
  left: 5px;
  top: 20px;
  animation-delay: 0s;
}
.b-2 {
  width: 18px;
  height: 18px;
  left: 22px;
  top: 8px;
  animation-delay: 0.5s;
}
.b-3 {
  width: 12px;
  height: 12px;
  left: 42px;
  top: 25px;
  animation-delay: 1s;
}
.b-4 {
  width: 16px;
  height: 16px;
  left: 55px;
  top: 12px;
  animation-delay: 1.5s;
}
.b-5 {
  width: 10px;
  height: 10px;
  left: 35px;
  top: 32px;
  animation-delay: 0.8s;
}
.b-6 {
  width: 20px;
  height: 20px;
  left: 10px;
  top: 35px;
  animation-delay: 2s;
}

@keyframes bubble-drift {
  0% {
    opacity: 0;
    transform: translateY(15px) scale(0.4) rotate(0deg);
  }
  20% {
    opacity: 0.9;
  }
  80% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(1.1) rotate(15deg);
  }
}

/* 水花溅起 */
.splash-effect {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 70px;
  height: 25px;
}

.water-splash {
  position: absolute;
  width: 6px;
  height: 6px;
  background: linear-gradient(135deg, #c7d2fe 0%, #a78bfa 100%);
  border-radius: 50%;
  animation: splash-burst 0.8s ease-out infinite;
  opacity: 0;
  box-shadow: 0 0 4px rgba(139, 92, 246, 0.5);
}

.ws-1 {
  left: 10px;
  animation-delay: 0s;
}
.ws-2 {
  left: 30px;
  animation-delay: 0.15s;
}
.ws-3 {
  left: 50px;
  animation-delay: 0.05s;
}

@keyframes splash-burst {
  0% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  30% {
    opacity: 1;
    transform: translateY(-12px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(3px) scale(0.3);
  }
}

/* 干净闪光星星 */
.clean-stars {
  position: absolute;
  inset: -10px;
  opacity: 0;
  animation: stars-appear 5s ease-in-out forwards;
  animation-delay: 1s;
}

@keyframes stars-appear {
  0%,
  80% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.star {
  position: absolute;
  color: #fff;
  font-size: 16px;
  animation: star-sparkle 0.6s ease-in-out infinite;
  text-shadow:
    0 0 8px rgba(255, 255, 255, 0.9),
    0 0 16px rgba(139, 92, 246, 0.6),
    0 0 24px rgba(167, 139, 250, 0.4);
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
}

.star-1 {
  top: -5px;
  left: 5px;
  animation-delay: 0s;
  font-size: 14px;
}
.star-2 {
  top: 5px;
  right: -2px;
  animation-delay: 0.15s;
  font-size: 18px;
}
.star-3 {
  bottom: 0;
  left: -5px;
  animation-delay: 0.3s;
  font-size: 12px;
}
.star-4 {
  bottom: 10px;
  right: 0;
  animation-delay: 0.45s;
  font-size: 16px;
}
.star-5 {
  top: 25px;
  left: -8px;
  animation-delay: 0.2s;
  font-size: 10px;
}
.star-6 {
  top: 20px;
  right: -8px;
  animation-delay: 0.35s;
  font-size: 14px;
}

@keyframes star-sparkle {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(0.7) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.3) rotate(20deg);
  }
}

/* 彩虹光环 */
.rainbow-aura {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    rgba(236, 72, 153, 0.15),
    rgba(249, 115, 22, 0.15),
    rgba(250, 204, 21, 0.15),
    rgba(74, 222, 128, 0.15),
    rgba(56, 189, 248, 0.15),
    rgba(139, 92, 246, 0.15),
    rgba(236, 72, 153, 0.15)
  );
  opacity: 0;
  animation: rainbow-fade-in 5s ease-out forwards;
  animation-delay: 2s;
}

@keyframes rainbow-fade-in {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* 快乐音符 */
.happy-notes {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 30px;
}

.note {
  position: absolute;
  font-size: 14px;
  animation: note-dance 1.5s ease-in-out infinite;
  opacity: 0;
  text-shadow: 0 0 6px currentColor;
}

.nt-1 {
  left: 5px;
  top: 5px;
  animation-delay: 0s;
  animation-name: note-dance-1;
}

.nt-2 {
  left: 30px;
  top: 8px;
  animation-delay: 0.5s;
  font-size: 16px;
  animation-name: note-dance-2;
}

@keyframes note-dance-1 {
  0% {
    opacity: 0;
    transform: translateY(5px) rotate(-10deg);
    color: #f472b6;
  }
  30% {
    opacity: 1;
    transform: translateY(-5px) rotate(5deg);
    color: #fb923c;
  }
  60% {
    opacity: 0.7;
    transform: translateY(-10px) rotate(8deg);
    color: #a3e635;
  }
  100% {
    opacity: 0;
    transform: translateY(-12px) rotate(12deg);
    color: #38bdf8;
  }
}

@keyframes note-dance-2 {
  0% {
    opacity: 0;
    transform: translateY(5px) rotate(10deg);
    color: #c084fc;
  }
  30% {
    opacity: 1;
    transform: translateY(-5px) rotate(-5deg);
    color: #facc15;
  }
  60% {
    opacity: 0.7;
    transform: translateY(-10px) rotate(-8deg);
    color: #2dd4bf;
  }
  100% {
    opacity: 0;
    transform: translateY(-12px) rotate(-12deg);
    color: #f472b6;
  }
}
</style>
