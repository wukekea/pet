<script setup lang="ts">
// 蛋糕食物组件 - 日式草莓奶油蛋糕
</script>

<template>
  <div class="food-cake">
    <!-- 底层蛋糕 -->
    <div class="cake-layer cake-bottom">
      <div class="cake-surface"></div>
    </div>

    <!-- 中层蛋糕 -->
    <div class="cake-layer cake-middle">
      <div class="cake-surface"></div>
    </div>

    <!-- 奶油装饰 -->
    <div class="cream-drip cream-drip-1"></div>
    <div class="cream-drip cream-drip-2"></div>
    <div class="cream-drip cream-drip-3"></div>

    <!-- 顶部奶油 -->
    <div class="cream-top"></div>

    <!-- 草莓 -->
    <div class="strawberry">
      <div class="strawberry-body"></div>
      <div class="strawberry-seed ss-1"></div>
      <div class="strawberry-seed ss-2"></div>
      <div class="strawberry-seed ss-3"></div>
      <div class="strawberry-leaf"></div>
      <div class="strawberry-shine"></div>
    </div>

    <!-- 糖粉效果 -->
    <div class="sugar-powder">
      <span class="powder p1"></span>
      <span class="powder p2"></span>
      <span class="powder p3"></span>
      <span class="powder p4"></span>
      <span class="powder p5"></span>
    </div>
  </div>
</template>

<style scoped>
.food-cake {
  position: relative;
  width: 50px;
  height: 45px;
}

/* ========================================
   蛋糕层
   ======================================== */
.cake-layer {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 4px;
}

.cake-bottom {
  bottom: 0;
  width: 46px;
  height: 16px;
  background: linear-gradient(
    180deg,
    #fef3c7 0%,
    #fde68a 30%,
    #fcd34d 70%,
    #f59e0b 100%
  );
  box-shadow:
    inset 0 3px 6px rgba(255, 255, 255, 0.6),
    inset 0 -2px 4px rgba(180, 83, 9, 0.2),
    0 3px 8px rgba(245, 158, 11, 0.3);
}

.cake-middle {
  bottom: 14px;
  width: 40px;
  height: 14px;
  background: linear-gradient(180deg, #fff1f2 0%, #fecdd3 40%, #fda4af 100%);
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.8),
    inset 0 -2px 4px rgba(244, 63, 94, 0.15),
    0 2px 6px rgba(244, 63, 94, 0.2);
}

/* 蛋糕表面纹理 */
.cake-surface {
  position: absolute;
  top: 2px;
  left: 4px;
  right: 4px;
  height: 3px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
}

.cake-middle .cake-surface {
  background: rgba(255, 255, 255, 0.6);
}

/* ========================================
   奶油滴落效果
   ======================================== */
.cream-drip {
  position: absolute;
  background: linear-gradient(180deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%);
  border-radius: 0 0 50% 50%;
  box-shadow:
    inset 1px 0 3px rgba(255, 255, 255, 0.8),
    inset -1px 0 3px rgba(0, 0, 0, 0.05);
}

.cream-drip-1 {
  left: 6px;
  bottom: 14px;
  width: 6px;
  height: 12px;
}

.cream-drip-2 {
  left: 20px;
  bottom: 14px;
  width: 5px;
  height: 8px;
}

.cream-drip-3 {
  right: 8px;
  bottom: 14px;
  width: 6px;
  height: 10px;
}

/* 顶部奶油 */
.cream-top {
  position: absolute;
  bottom: 26px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 10px;
  background: linear-gradient(180deg, #fff7ed 0%, #ffedd5 60%, #fdba74 100%);
  border-radius: 50% 50% 40% 40%;
  box-shadow:
    inset 2px 2px 4px rgba(255, 255, 255, 0.9),
    inset -1px -1px 3px rgba(251, 146, 60, 0.2),
    0 2px 4px rgba(251, 146, 60, 0.2);
}

/* ========================================
   草莓
   ======================================== */
.strawberry {
  position: absolute;
  bottom: 34px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 18px;
}

.strawberry-body {
  width: 16px;
  height: 16px;
  background: linear-gradient(
    135deg,
    #fca5a5 0%,
    #ef4444 40%,
    #dc2626 70%,
    #b91c1c 100%
  );
  border-radius: 45% 45% 50% 50%;
  box-shadow:
    inset 3px 3px 6px rgba(255, 255, 255, 0.4),
    inset -2px -2px 4px rgba(0, 0, 0, 0.15),
    0 2px 6px rgba(239, 68, 68, 0.4);
}

/* 草莓籽 */
.strawberry-seed {
  position: absolute;
  width: 2px;
  height: 3px;
  background: #fef3c7;
  border-radius: 50%;
  opacity: 0.8;
}

.ss-1 {
  top: 5px;
  left: 4px;
}

.ss-2 {
  top: 7px;
  right: 4px;
}

.ss-3 {
  top: 10px;
  left: 7px;
}

/* 草莓叶子 */
.strawberry-leaf {
  position: absolute;
  top: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 6px;
  background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
  border-radius: 50% 50% 20% 20%;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

/* 草莓高光 */
.strawberry-shine {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 5px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  filter: blur(1px);
}

/* ========================================
   糖粉效果
   ======================================== */
.sugar-powder {
  position: absolute;
  top: -5px;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.powder {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  opacity: 0.7;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
}

.p1 {
  top: 8px;
  left: 5px;
}
.p2 {
  top: 12px;
  left: 15px;
}
.p3 {
  top: 6px;
  right: 8px;
}
.p4 {
  top: 15px;
  right: 12px;
}
.p5 {
  top: 20px;
  left: 8px;
}
</style>
