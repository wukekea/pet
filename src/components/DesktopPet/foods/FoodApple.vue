<script setup lang="ts">
// 苹果食物组件
</script>

<template>
  <div class="food-apple">
    <div class="apple-body"></div>
    <div class="apple-shine"></div>
    <div class="apple-leaf"></div>
    <div class="apple-stem"></div>
  </div>
</template>

<style scoped>
.food-apple {
  position: relative;
}

.apple-body {
  width: 40px;
  height: 42px;
  background: linear-gradient(
    135deg,
    #fca5a5 0%,
    #ef4444 40%,
    #dc2626 70%,
    #b91c1c 100%
  );
  border-radius: 50% 50% 45% 45%;
  box-shadow:
    inset 5px 5px 15px rgba(255, 255, 255, 0.4),
    inset -3px -3px 10px rgba(0, 0, 0, 0.2),
    0 6px 15px rgba(239, 68, 68, 0.5);
}

.apple-shine {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 12px;
  height: 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  filter: blur(2px);
}

.apple-leaf {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(-15deg);
  width: 12px;
  height: 8px;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  border-radius: 0 50% 50% 50%;
  box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);
}

.apple-stem {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 8px;
  background: linear-gradient(180deg, #92400e 0%, #78350f 100%);
  border-radius: 2px;
}
</style>
