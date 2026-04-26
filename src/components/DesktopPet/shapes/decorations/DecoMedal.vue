<template>
  <div class="deco deco-medal"></div>
</template>

<style>
/* 勋章 - 左下方领口位置 */
.deco-medal {
  bottom: 4px;
  left: 2px;
  width: 9px;
  height: 9px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 50%;
  border: 1.5px solid #d97706;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.deco-medal::before {
  content: "";
  position: absolute;
  top: -7px;
  left: 0px;
  width: 5px;
  height: 8px;
  background: #ef4444;
  clip-path: polygon(0 0, 100% 0, 70% 100%, 50% 70%, 30% 100%);
}

.deco-medal::after {
  content: "";
  position: absolute;
  top: -5px;
  right: -1px;
  width: 5px;
  height: 8px;
  background: #3b82f6;
  clip-path: polygon(100% 0, 0 0, 30% 100%, 50% 70%, 70% 100%);
}
</style>
