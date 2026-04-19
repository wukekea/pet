<script setup lang="ts">
// 肉食物组件
</script>

<template>
  <div class="food-meat">
    <div class="meat-bone"></div>
    <div class="meat-body"></div>
    <div class="meat-fat mf-1"></div>
    <div class="meat-fat mf-2"></div>
    <div class="meat-shine"></div>
  </div>
</template>

<style scoped>
.food-meat {
  position: relative;
  width: 50px;
  height: 30px;
}

.meat-bone {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 10px;
  background: linear-gradient(180deg, #fef3c7 0%, #fcd34d 30%, #f59e0b 100%);
  border-radius: 5px;
  box-shadow:
    inset 2px 2px 4px rgba(255, 255, 255, 0.6),
    0 2px 6px rgba(245, 158, 11, 0.3);
}

.meat-body {
  position: absolute;
  right: 0;
  top: 0;
  width: 35px;
  height: 30px;
  background: linear-gradient(
    135deg,
    #fca5a5 0%,
    #ef4444 30%,
    #dc2626 60%,
    #b91c1c 100%
  );
  border-radius: 10px 15px 15px 10px;
  box-shadow:
    inset 3px 3px 10px rgba(255, 255, 255, 0.3),
    inset -2px -2px 8px rgba(0, 0, 0, 0.2),
    0 4px 12px rgba(239, 68, 68, 0.5);
}

.meat-fat {
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
}

.mf-1 {
  width: 8px;
  height: 6px;
  right: 8px;
  top: 8px;
}

.mf-2 {
  width: 6px;
  height: 5px;
  right: 18px;
  bottom: 8px;
}

.meat-shine {
  position: absolute;
  right: 5px;
  top: 5px;
  width: 10px;
  height: 6px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  filter: blur(1px);
}
</style>
