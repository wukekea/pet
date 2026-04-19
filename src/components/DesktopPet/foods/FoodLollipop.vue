<script setup lang="ts">
// 棒棒糖食物组件
</script>

<template>
  <div class="food-lollipop">
    <!-- 棒棒糖头部 -->
    <div class="lollipop-head">
      <div class="candy-swirl swirl-1"></div>
      <div class="candy-swirl swirl-2"></div>
      <div class="candy-swirl swirl-3"></div>
      <div class="candy-shine"></div>
    </div>
    <!-- 棒棒 -->
    <div class="lollipop-stick"></div>
  </div>
</template>

<style scoped>
.food-lollipop {
  position: relative;
  width: 50px;
  height: 50px;
}

/* ========================================
   棒棒糖头部
   ======================================== */
.lollipop-head {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 36px;
  background: linear-gradient(
    135deg,
    #fda4af 0%,
    #fb7185 30%,
    #f43f5e 60%,
    #e11d48 100%
  );
  border-radius: 50%;
  box-shadow:
    inset 5px 5px 12px rgba(255, 255, 255, 0.5),
    inset -4px -4px 10px rgba(136, 19, 55, 0.3),
    0 4px 12px rgba(244, 63, 94, 0.4);
}

/* 旋涡纹理 */
.candy-swirl {
  position: absolute;
  border-radius: 50%;
  border: 4px solid transparent;
}

.swirl-1 {
  top: 4px;
  left: 4px;
  width: 28px;
  height: 28px;
  border-top-color: rgba(255, 255, 255, 0.7);
  transform: rotate(0deg);
}

.swirl-2 {
  top: 9px;
  left: 9px;
  width: 18px;
  height: 18px;
  border-top-color: rgba(255, 255, 255, 0.5);
  transform: rotate(60deg);
}

.swirl-3 {
  top: 14px;
  left: 14px;
  width: 8px;
  height: 8px;
  border-top-color: rgba(255, 255, 255, 0.4);
  transform: rotate(120deg);
}

/* 高光 */
.candy-shine {
  position: absolute;
  top: 6px;
  left: 8px;
  width: 14px;
  height: 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  filter: blur(1px);
}

/* ========================================
   棒棒
   ======================================== */
.lollipop-stick {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 20px;
  background: linear-gradient(
    90deg,
    #fef3c7 0%,
    #fde68a 30%,
    #fef3c7 50%,
    #fde68a 70%,
    #fef3c7 100%
  );
  border-radius: 0 0 3px 3px;
  box-shadow:
    inset 1px 0 2px rgba(255, 255, 255, 0.6),
    inset -1px 0 2px rgba(180, 83, 9, 0.2),
    0 2px 4px rgba(180, 83, 9, 0.2);
}
</style>
