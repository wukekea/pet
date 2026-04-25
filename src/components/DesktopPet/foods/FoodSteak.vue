<script setup lang="ts">
// 牛排食物组件
</script>

<template>
  <div class="food-steak">
    <div class="steak-body">
      <div class="steak-grill grill-1"></div>
      <div class="steak-grill grill-2"></div>
      <div class="steak-fat fat-1"></div>
      <div class="steak-fat fat-2"></div>
      <div class="steak-shine"></div>
      <div class="steak-steam steam-1"></div>
      <div class="steak-steam steam-2"></div>
    </div>
    <div class="plate"></div>
  </div>
</template>

<style scoped>
.food-steak {
  position: relative;
}

.steak-body {
  position: relative;
  width: 44px;
  height: 30px;
  background: linear-gradient(
    135deg,
    #92400e 0%,
    #78350f 25%,
    #713f12 50%,
    #78350f 75%,
    #6b3a10 100%
  );
  border-radius: 40% 45% 42% 38% / 50% 48% 52% 50%;
  box-shadow:
    inset 4px 3px 10px rgba(180, 83, 9, 0.4),
    inset -2px -2px 6px rgba(0, 0, 0, 0.3),
    0 3px 8px rgba(120, 53, 15, 0.4);
  overflow: hidden;
}

/* 烤痕 */
.steak-grill {
  position: absolute;
  left: 4px;
  right: 4px;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 0, 0, 0.25) 20%,
    rgba(0, 0, 0, 0.25) 80%,
    transparent 100%
  );
  border-radius: 2px;
}

.grill-1 {
  top: 8px;
}

.grill-2 {
  top: 18px;
}

/* 脂肪纹理 */
.steak-fat {
  position: absolute;
  background: rgba(253, 230, 138, 0.5);
  border-radius: 50%;
}

.fat-1 {
  top: 5px;
  right: 6px;
  width: 8px;
  height: 4px;
  transform: rotate(-15deg);
}

.fat-2 {
  bottom: 6px;
  left: 8px;
  width: 6px;
  height: 3px;
  transform: rotate(10deg);
}

/* 高光 */
.steak-shine {
  position: absolute;
  top: 3px;
  left: 6px;
  width: 12px;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  filter: blur(2px);
}

/* 蒸汽 */
.steak-steam {
  position: absolute;
  top: -8px;
  width: 4px;
  height: 8px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  border-radius: 2px;
  animation: steam-rise 1.5s ease-in-out infinite;
}

.steam-1 {
  left: 12px;
  animation-delay: 0s;
}

.steam-2 {
  left: 24px;
  animation-delay: 0.5s;
}

@keyframes steam-rise {
  0%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  50% {
    opacity: 0.7;
    transform: translateY(-4px);
  }
}

/* 盘子 */
.plate {
  position: relative;
  width: 48px;
  height: 6px;
  margin-top: 2px;
  background: linear-gradient(180deg, #e5e7eb 0%, #d1d5db 60%, #9ca3af 100%);
  border-radius: 0 0 50% 50% / 0 0 100% 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}
</style>
