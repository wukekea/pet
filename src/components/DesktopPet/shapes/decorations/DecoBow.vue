<template>
  <div class="deco deco-bow"></div>
</template>

<style>
/* 蝴蝶结 - 右耳底部居中 */
.deco-bow {
  bottom: 4px;
  left: 50%;
  margin-left: -2px;
  z-index: 1;
  width: 4px;
  height: 4px;
  background: #b91c1c;
  border-radius: 50%;
  box-shadow: 0 0 3px rgba(185, 28, 28, 0.5);
}

.deco-bow::before {
  content: "";
  position: absolute;
  top: -4px;
  left: -7px;
  width: 8px;
  height: 6px;
  background: #b91c1c;
  border-radius: 50%;
  transform: rotate(-15deg);
}

.deco-bow::after {
  content: "";
  position: absolute;
  top: -4px;
  right: -7px;
  width: 8px;
  height: 6px;
  background: #b91c1c;
  border-radius: 50%;
  transform: rotate(15deg);
}
</style>
