<script setup lang="ts">
// 鱼食物组件
</script>

<template>
  <div class="food-fish">
    <div class="fish-body"></div>
    <div class="fish-tail"></div>
    <div class="fish-fin"></div>
    <div class="fish-eye"></div>
    <div class="fish-shine"></div>
  </div>
</template>

<style scoped>
.food-fish {
  position: relative;
  width: 50px;
  height: 30px;
}

.fish-body {
  position: absolute;
  width: 35px;
  height: 25px;
  left: 0;
  top: 3px;
  background: linear-gradient(
    180deg,
    #93c5fd 0%,
    #60a5fa 30%,
    #3b82f6 70%,
    #2563eb 100%
  );
  border-radius: 50% 30% 30% 50%;
  box-shadow:
    inset 3px 3px 10px rgba(255, 255, 255, 0.5),
    inset -2px -2px 8px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(59, 130, 246, 0.5);
}

.fish-tail {
  position: absolute;
  right: 0;
  top: 5px;
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-left: 15px solid #3b82f6;
  filter: drop-shadow(2px 0 4px rgba(59, 130, 246, 0.3));
}

.fish-fin {
  position: absolute;
  top: -5px;
  left: 12px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 10px solid #60a5fa;
}

.fish-eye {
  position: absolute;
  left: 6px;
  top: 8px;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.fish-eye::after {
  content: "";
  position: absolute;
  left: 2px;
  top: 2px;
  width: 4px;
  height: 4px;
  background: #1f2937;
  border-radius: 50%;
}

.fish-shine {
  position: absolute;
  left: 8px;
  top: 6px;
  width: 6px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  filter: blur(1px);
}
</style>
