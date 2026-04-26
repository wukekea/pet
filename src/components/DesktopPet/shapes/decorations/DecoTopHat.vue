<template>
  <div class="deco deco-topHat"></div>
</template>

<style>
/* 礼帽 - 头顶正上方 */
.deco-topHat {
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 16px;
  background: #1f2937;
  border-radius: 3px 3px 0 0;
}

.deco-topHat::before {
  content: "";
  position: absolute;
  bottom: -3px;
  left: -5px;
  width: 30px;
  height: 5px;
  background: #1f2937;
  border-radius: 3px;
}

.deco-topHat::after {
  content: "";
  position: absolute;
  bottom: 1px;
  left: 0;
  right: 0;
  height: 3px;
  background: #fbbf24;
}
</style>
