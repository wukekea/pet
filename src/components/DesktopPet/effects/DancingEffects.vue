<script setup lang="ts">
// 跳舞效果组件 - 霓虹迪斯科风格
</script>

<template>
  <div class="dancing-effects">
    <!-- 霓虹音符 -->
    <div class="neon-note nn-1">♪</div>
    <div class="neon-note nn-2">♫</div>
    <div class="neon-note nn-3">♬</div>
    <div class="neon-note nn-4">♩</div>
    <div class="neon-note nn-5">♪</div>
    <div class="neon-note nn-6">♫</div>
    <!-- 脉冲光环 -->
    <div class="pulse-ring ring-1"></div>
    <div class="pulse-ring ring-2"></div>
    <div class="pulse-ring ring-3"></div>
    <!-- 迪斯科光点 -->
    <div class="disco-dot dd-1"></div>
    <div class="disco-dot dd-2"></div>
    <div class="disco-dot dd-3"></div>
    <div class="disco-dot dd-4"></div>
    <div class="disco-dot dd-5"></div>
    <div class="disco-dot dd-6"></div>
    <div class="disco-dot dd-7"></div>
    <div class="disco-dot dd-8"></div>
    <!-- 节拍闪光 -->
    <div class="beat-flash"></div>
  </div>
</template>

<style scoped>
.dancing-effects {
  position: absolute;
  inset: -40px;
  pointer-events: none;
  overflow: visible;
}

/* 霓虹音符 */
.neon-note {
  position: absolute;
  font-size: 22px;
  font-weight: bold;
  opacity: 0;
  animation: neon-float 1.8s ease-in-out infinite;
  text-shadow:
    0 0 8px currentColor,
    0 0 15px currentColor,
    0 0 25px currentColor;
}

.nn-1 {
  color: #ff6b9d;
  left: -25px;
  top: 50%;
  animation-delay: 0s;
}

.nn-2 {
  color: #00f5ff;
  right: -25px;
  top: 40%;
  animation-delay: 0.3s;
}

.nn-3 {
  color: #ffde59;
  left: 10%;
  top: -20px;
  animation-delay: 0.6s;
}

.nn-4 {
  color: #b967ff;
  right: 10%;
  top: -25px;
  animation-delay: 0.9s;
}

.nn-5 {
  color: #7fff7f;
  left: -15px;
  bottom: 20%;
  animation-delay: 0.2s;
}

.nn-6 {
  color: #ff9f43;
  right: -15px;
  bottom: 15%;
  animation-delay: 0.5s;
}

@keyframes neon-float {
  0% {
    opacity: 0;
    transform: translateY(20px) rotate(-10deg) scale(0.5);
  }
  20% {
    opacity: 1;
    transform: translateY(0) rotate(0deg) scale(1);
  }
  80% {
    opacity: 1;
    transform: translateY(-30px) rotate(15deg) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translateY(-50px) rotate(20deg) scale(0.8);
  }
}

/* 脉冲光环 */
.pulse-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 50%;
  opacity: 0;
  animation: pulse-expand 1.2s ease-out infinite;
}

.ring-1 {
  width: 60px;
  height: 60px;
  border: 3px solid #ff6b9d;
  box-shadow:
    0 0 15px #ff6b9d,
    inset 0 0 15px rgba(255, 107, 157, 0.3);
  animation-delay: 0s;
}

.ring-2 {
  width: 80px;
  height: 80px;
  border: 2px solid #00f5ff;
  box-shadow:
    0 0 12px #00f5ff,
    inset 0 0 12px rgba(0, 245, 255, 0.3);
  animation-delay: 0.4s;
}

.ring-3 {
  width: 100px;
  height: 100px;
  border: 2px solid #b967ff;
  box-shadow:
    0 0 10px #b967ff,
    inset 0 0 10px rgba(185, 103, 255, 0.3);
  animation-delay: 0.8s;
}

@keyframes pulse-expand {
  0% {
    transform: translate(-50%, -50%) scale(0.3);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

/* 迪斯科光点 */
.disco-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  opacity: 0;
  animation: disco-flash 0.8s ease-in-out infinite;
}

.dd-1 {
  background: radial-gradient(circle, #ff6b9d 0%, transparent 70%);
  top: -30px;
  left: 20%;
  animation-delay: 0s;
}

.dd-2 {
  background: radial-gradient(circle, #00f5ff 0%, transparent 70%);
  top: -25px;
  right: 25%;
  animation-delay: 0.1s;
}

.dd-3 {
  background: radial-gradient(circle, #ffde59 0%, transparent 70%);
  top: 30%;
  left: -20px;
  animation-delay: 0.2s;
}

.dd-4 {
  background: radial-gradient(circle, #b967ff 0%, transparent 70%);
  top: 40%;
  right: -20px;
  animation-delay: 0.3s;
}

.dd-5 {
  background: radial-gradient(circle, #7fff7f 0%, transparent 70%);
  bottom: -15px;
  left: 30%;
  animation-delay: 0.4s;
}

.dd-6 {
  background: radial-gradient(circle, #ff9f43 0%, transparent 70%);
  bottom: -10px;
  right: 30%;
  animation-delay: 0.5s;
}

.dd-7 {
  background: radial-gradient(circle, #ff6b9d 0%, transparent 70%);
  top: 10%;
  left: -15px;
  animation-delay: 0.6s;
}

.dd-8 {
  background: radial-gradient(circle, #00f5ff 0%, transparent 70%);
  top: 15%;
  right: -15px;
  animation-delay: 0.7s;
}

@keyframes disco-flash {
  0%,
  100% {
    opacity: 0;
    transform: scale(0.5);
    box-shadow: none;
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
    box-shadow: 0 0 20px currentColor;
  }
}

/* 节拍闪光 */
.beat-flash {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100px;
  height: 100px;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.3) 0%,
    transparent 70%
  );
  border-radius: 50%;
  opacity: 0;
  animation: beat-glow 0.4s ease-in-out infinite;
}

@keyframes beat-glow {
  0%,
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.2);
  }
}
</style>
