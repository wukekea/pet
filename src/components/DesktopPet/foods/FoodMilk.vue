<script setup lang="ts">
// 牛奶食物组件
</script>

<template>
  <div class="food-milk">
    <div class="milk-bottle">
      <div class="bottle-neck">
        <div class="bottle-cap"></div>
      </div>
      <div class="bottle-body">
        <div class="milk-level"></div>
        <div class="bottle-label"></div>
        <div class="bottle-shine"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.food-milk {
  position: relative;
}

.milk-bottle {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 瓶口 */
.bottle-neck {
  position: relative;
  width: 14px;
  height: 8px;
  background: linear-gradient(90deg, #bfdbfe 0%, #dbeafe 50%, #bfdbfe 100%);
  border-radius: 3px 3px 0 0;
  box-shadow: inset 1px 0 2px rgba(255, 255, 255, 0.5);
}

/* 瓶盖 */
.bottle-cap {
  position: absolute;
  top: -4px;
  left: -2px;
  width: 18px;
  height: 6px;
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 60%, #1d4ed8 100%);
  border-radius: 3px 3px 1px 1px;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    0 1px 2px rgba(37, 99, 235, 0.3);
}

/* 瓶身 */
.bottle-body {
  position: relative;
  width: 30px;
  height: 36px;
  background: linear-gradient(
    90deg,
    #e0f2fe 0%,
    #f0f9ff 30%,
    #ffffff 50%,
    #f0f9ff 70%,
    #e0f2fe 100%
  );
  border-radius: 4px 4px 6px 6px;
  box-shadow:
    inset 3px 0 6px rgba(255, 255, 255, 0.5),
    inset -2px 0 4px rgba(147, 197, 253, 0.2),
    0 4px 10px rgba(59, 130, 246, 0.2);
  overflow: hidden;
}

/* 牛奶液面 */
.milk-level {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70%;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(248, 250, 252, 0.95) 50%,
    rgba(241, 245, 249, 1) 100%
  );
  border-radius: 0 0 5px 5px;
}

/* 标签 */
.bottle-label {
  position: absolute;
  bottom: 6px;
  left: 3px;
  right: 3px;
  height: 10px;
  background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
  border-radius: 2px;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

/* 高光 */
.bottle-shine {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 6px;
  height: 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 3px;
  filter: blur(1px);
}
</style>
