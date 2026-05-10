<script setup lang="ts">
// 竹子食物组件
</script>

<template>
  <div class="food-bamboo">
    <!-- 主竹竿 -->
    <div class="bamboo-stalk stalk-main">
      <div class="bamboo-node node-1"></div>
      <div class="bamboo-node node-2"></div>
      <div class="bamboo-node node-3"></div>
    </div>
    <!-- 副竹竿 -->
    <div class="bamboo-stalk stalk-side">
      <div class="bamboo-node node-1"></div>
      <div class="bamboo-node node-2"></div>
    </div>
    <!-- 竹叶 -->
    <div class="bamboo-leaf leaf-1"></div>
    <div class="bamboo-leaf leaf-2"></div>
    <div class="bamboo-leaf leaf-3"></div>
  </div>
</template>

<style scoped>
.food-bamboo {
  position: relative;
  width: 40px;
  height: 45px;
}

/* 竹竿基础样式 */
.bamboo-stalk {
  position: absolute;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    #166534 0%,
    #22c55e 25%,
    #4ade80 50%,
    #22c55e 75%,
    #166534 100%
  );
  box-shadow:
    inset 2px 0 4px rgba(255, 255, 255, 0.35),
    inset -2px 0 4px rgba(0, 0, 0, 0.15),
    2px 3px 6px rgba(0, 0, 0, 0.2);
}

/* 主竹竿 */
.stalk-main {
  left: 10px;
  bottom: 0;
  width: 12px;
  height: 42px;
}

/* 副竹竿 */
.stalk-side {
  right: 6px;
  bottom: 0;
  width: 10px;
  height: 32px;
  transform: rotate(12deg);
  transform-origin: bottom center;
}

/* 竹节 */
.bamboo-node {
  position: absolute;
  left: -1px;
  right: -1px;
  height: 3px;
  background: linear-gradient(180deg, #14532d 0%, #166534 50%, #14532d 100%);
  border-radius: 1px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
}

.stalk-main .node-1 {
  top: 25%;
}

.stalk-main .node-2 {
  top: 50%;
}

.stalk-main .node-3 {
  top: 75%;
}

.stalk-side .node-1 {
  top: 30%;
}

.stalk-side .node-2 {
  top: 60%;
}

/* 竹叶 */
.bamboo-leaf {
  position: absolute;
  width: 18px;
  height: 7px;
  background: linear-gradient(
    90deg,
    #166534 0%,
    #22c55e 35%,
    #4ade80 50%,
    #22c55e 65%,
    #166534 100%
  );
  border-radius: 2px 50% 50% 2px;
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.3),
    1px 1px 2px rgba(0, 0, 0, 0.1);
}

/* 叶脉 */
.bamboo-leaf::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 3px;
  right: 4px;
  height: 1px;
  background: rgba(0, 0, 0, 0.12);
  transform: translateY(-50%);
}

.leaf-1 {
  top: 0;
  left: 0;
  transform: rotate(-35deg);
}

.leaf-2 {
  top: 5px;
  right: 0;
  transform: rotate(30deg) scaleX(-1);
}

.leaf-3 {
  top: 12px;
  left: -3px;
  transform: rotate(-20deg);
}
</style>
