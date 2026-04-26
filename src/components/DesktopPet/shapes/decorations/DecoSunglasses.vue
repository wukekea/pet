<template>
  <div class="deco deco-sunglasses"></div>
</template>

<style>
/* 墨镜 - 眼睛位置 */
.deco-sunglasses {
  top: 26px;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 2px;
  background: #1f2937;
}

.deco-sunglasses::before {
  content: "";
  position: absolute;
  top: -4px;
  left: 0;
  width: 11px;
  height: 9px;
  background: linear-gradient(
    135deg,
    rgba(30, 30, 30, 0.85),
    rgba(60, 60, 60, 0.7)
  );
  border: 1.5px solid #1f2937;
  border-radius: 3px;
}

.deco-sunglasses::after {
  content: "";
  position: absolute;
  top: -4px;
  right: 0;
  width: 11px;
  height: 9px;
  background: linear-gradient(
    135deg,
    rgba(30, 30, 30, 0.85),
    rgba(60, 60, 60, 0.7)
  );
  border: 1.5px solid #1f2937;
  border-radius: 3px;
}
</style>
