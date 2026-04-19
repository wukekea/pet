<script setup lang="ts">
// 苹果食物组件
</script>

<template>
  <div class="food-apple">
    <div class="apple-body">
      <div class="apple-indent-top"></div>
      <div class="apple-indent-bottom"></div>
    </div>
    <div class="apple-shine"></div>
    <div class="apple-stem"></div>
  </div>
</template>

<style scoped>
.food-apple {
  position: relative;
}

.apple-body {
  position: relative;
  width: 44px;
  height: 40px;
  /* 苹果颜色：青绿底色，自然过渡到红 */
  background: linear-gradient(
    135deg,
    #86efac 0%,
    #a3e635 20%,
    #fde047 35%,
    #fdba74 55%,
    #f87171 75%,
    #dc2626 100%
  );
  /* 苹果形状：顶部略窄，底部圆润，中间微凹 */
  border-radius: 45% 45% 50% 50% / 30% 30% 55% 55%;
  box-shadow:
    inset 5px 5px 15px rgba(255, 255, 255, 0.5),
    inset -3px -3px 10px rgba(0, 0, 0, 0.15),
    0 6px 15px rgba(251, 146, 60, 0.4);
}

/* 顶部凹陷 */
.apple-indent-top {
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 6px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, transparent 100%);
  border-radius: 0 0 50% 50%;
}

/* 底部凹陷 */
.apple-indent-bottom {
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 4px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0%, transparent 100%);
  border-radius: 50% 50% 0 0;
}

.apple-shine {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 12px;
  height: 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  filter: blur(2px);
}

/* 苹果茎 */
.apple-stem {
  position: absolute;
  top: -10px;
  left: 50%;
  width: 3px;
  height: 10px;
  background: linear-gradient(90deg, #78350f 0%, #92400e 50%, #78350f 100%);
  border-radius: 2px 2px 0 0;
  transform: translateX(-50%) rotate(8deg);
  transform-origin: bottom center;
  box-shadow:
    inset 1px 0 2px rgba(255, 255, 255, 0.2),
    inset -1px 0 2px rgba(0, 0, 0, 0.2);
}

/* 茎的小弯曲部分 */
.apple-stem::before {
  content: "";
  position: absolute;
  top: -3px;
  right: -2px;
  width: 4px;
  height: 5px;
  background: linear-gradient(90deg, #78350f 0%, #92400e 100%);
  border-radius: 50% 50% 0 50%;
  transform: rotate(-30deg);
}
</style>
