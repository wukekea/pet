<template>
  <div class="deco deco-scarf"></div>
</template>

<style>
/* 围巾 - 脖子区域 */
.deco-scarf {
  bottom: 12px;
  left: 5px;
  right: 5px;
  height: 7px;
  background: #ef4444;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.deco-scarf::before {
  content: "";
  position: absolute;
  bottom: -10px;
  right: 8px;
  width: 7px;
  height: 14px;
  background: #ef4444;
  border-radius: 0 0 3px 3px;
}

.deco-scarf::after {
  content: "";
  position: absolute;
  bottom: -8px;
  right: 10px;
  width: 7px;
  height: 12px;
  background: #fca5a5;
  border-radius: 0 0 3px 3px;
  z-index: -1;
}
</style>
