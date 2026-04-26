<template>
  <div class="deco deco-wreath"></div>
</template>

<style>
/* 花环 - 中世纪花冠（环形正视视角）*/
.deco-wreath {
  top: 1px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 16px;
  /* 椭圆环 = 花环平放头顶的正面视角 */
  border: 5px solid #4a7c23;
  border-radius: 50%;
  background: transparent;
  /* 顶部=正面可见，两侧=绕到脑后半透明，底部=脑后不可见 */
  border-bottom-color: rgba(74, 124, 35, 0.06);
  border-left-color: rgba(74, 124, 35, 0.35);
  border-right-color: rgba(74, 124, 35, 0.35);
  box-shadow:
    /* 外藤深绿轮廓 */
    0 0 0 1px #2d5016,
    /* 棕色编织高光 */ inset 0 2px 0 0 rgba(107, 70, 35, 0.5),
    inset 0 -1px 0 0 rgba(107, 70, 35, 0.3),
    /* 编织交叉纹理 */ 5px -3px 0 -4px rgba(107, 70, 35, 0.25),
    -5px -3px 0 -4px rgba(107, 70, 35, 0.25),
    10px -4px 0 -4px rgba(107, 70, 35, 0.2),
    -10px -4px 0 -4px rgba(107, 70, 35, 0.2);
}

/* 花朵层 - 花瓣造型花朵 */
.deco-wreath::before {
  content: "";
  position: absolute;
  z-index: 2;
  /* 花瓣造型 - 水滴形（圆头尖尾） */
  width: 5px;
  height: 7px;
  border-radius: 50% 50% 50% 0;
  background: linear-gradient(135deg, #fca5a5 20%, #ef4444 80%);
  transform: rotate(-40deg);
  left: 21px;
  top: -7px;
  box-shadow:
    /* === 中心红玫瑰 - 层叠花瓣 === */
    2px 1px 0 0.5px #dc2626,
    -1px 2px 0 0.5px #b91c1b,
    1px -1px 0 0.5px #f87171,
    -1px -1px 0 0.5px #fca5a5,
    /* 花蕊中心 */ 1px 1px 2px 1px #fde68a,
    /* === 左侧白花 === */ -10px 4px 0 1px #fff1f2,
    -10px 4px 0 2px rgba(253, 164, 175, 0.35),
    /* === 右侧白花 === */ 10px 4px 0 1px #fff1f2,
    10px 4px 0 2px rgba(253, 164, 175, 0.35),
    /* === 红色花苞 === */ -16px 7px 0 1px #f87171,
    -16px 7px 0 2px #dc2626,
    16px 7px 0 1px #f87171,
    16px 7px 0 2px #dc2626,
    /* === 紫色小花 === */ -5px 2px 0 0.5px #c4b5fd,
    -5px 2px 0 1.5px #8b5cf6,
    5px 2px 0 0.5px #c4b5fd,
    5px 2px 0 1.5px #8b5cf6,
    /* === 蓝色花苞 === */ -13px 6px 0 -0.5px #93c5fd,
    13px 6px 0 -0.5px #93c5fd,
    /* === 薰衣草花苞 === */ -18px 8px 0 -0.5px #a78bfa,
    18px 8px 0 -0.5px #a78bfa;
}

/* 叶片层 - 叶形装饰 */
.deco-wreath::after {
  content: "";
  position: absolute;
  z-index: 1;
  /* 叶形 - 两端尖的菱形叶片 */
  width: 3px;
  height: 6px;
  border-radius: 50% 0 50% 0;
  background: linear-gradient(135deg, #86efac, #4ade80);
  transform: rotate(25deg);
  left: 4px;
  top: -2px;
  box-shadow:
    6px -3px 0 0 #22c55e,
    11px -4px 0 0.5px #4ade80,
    17px -5px 0 0 #16a34a,
    22px -5px 0 0.5px #4ade80,
    27px -4px 0 0 #22c55e,
    32px -3px 0 0.5px #4ade80,
    38px -1px 0 0 #16a34a;
}
</style>
