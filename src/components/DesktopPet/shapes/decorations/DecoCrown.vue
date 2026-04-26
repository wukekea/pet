<template>
  <div class="deco deco-crown"></div>
</template>

<style>
/* 皇冠 - 头顶正上方 */
.deco-crown {
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 26px;
  height: 5px;
  background: #fbbf24;
  border-radius: 2px;
}

.deco-crown::before {
  content: "";
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 26px;
  height: 12px;
  background: #fbbf24;
  clip-path: polygon(
    0% 100%,
    10% 0%,
    20% 60%,
    50% 0%,
    80% 60%,
    90% 0%,
    100% 100%
  );
}

.deco-crown::after {
  content: "";
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #ef4444;
  border-radius: 50%;
  box-shadow:
    -7px 3px 0 -0.5px #3b82f6,
    7px 3px 0 -0.5px #10b981;
}
</style>
