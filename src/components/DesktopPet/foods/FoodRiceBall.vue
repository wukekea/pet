<script setup lang="ts">
// 饭团食物组件
</script>

<template>
  <div class="food-rice-ball">
    <div class="rice-body">
      <div class="nori-strip"></div>
      <div class="rice-shine"></div>
      <div class="rice-grain grain-1"></div>
      <div class="rice-grain grain-2"></div>
      <div class="rice-grain grain-3"></div>
    </div>
  </div>
</template>

<style scoped>
.food-rice-ball {
  position: relative;
}

.rice-body {
  position: relative;
  width: 38px;
  height: 38px;
  /* 白色饭团体 */
  background: linear-gradient(180deg, #fefefe 0%, #f5f5f4 40%, #e7e5e4 100%);
  /* 三角形饭团 */
  clip-path: polygon(50% 0%, 95% 85%, 5% 85%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

/* 海苔条 */
.nori-strip {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 20px;
  background: linear-gradient(180deg, #1c1917 0%, #292524 60%, #1c1917 100%);
  clip-path: polygon(0% 40%, 50% 0%, 100% 40%, 85% 100%, 15% 100%);
}

/* 高光 */
.rice-shine {
  position: absolute;
  top: 6px;
  left: 14px;
  width: 10px;
  height: 6px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  filter: blur(1px);
}

/* 米粒纹理 */
.rice-grain {
  position: absolute;
  width: 4px;
  height: 2px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
}

.grain-1 {
  top: 14px;
  left: 10px;
  transform: rotate(-20deg);
}

.grain-2 {
  top: 18px;
  right: 10px;
  transform: rotate(15deg);
}

.grain-3 {
  top: 10px;
  right: 14px;
  transform: rotate(-10deg);
}
</style>
