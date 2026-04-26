<template>
  <div class="deco deco-magicWand"></div>
</template>

<style>
/* 魔法杖 - 右手旁 */
.deco-magicWand {
  right: -10px;
  top: 5px;
  width: 3px;
  height: 18px;
  background: linear-gradient(to bottom, #92400e, #78350f);
  border-radius: 2px;
  transform: rotate(-25deg);
}

.deco-magicWand::before {
  content: "";
  position: absolute;
  top: -6px;
  left: -4px;
  width: 10px;
  height: 10px;
  background: #fbbf24;
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
}

.deco-magicWand::after {
  content: "";
  position: absolute;
  top: -8px;
  left: -6px;
  width: 14px;
  height: 14px;
  background: radial-gradient(
    circle,
    rgba(251, 191, 36, 0.4) 0%,
    transparent 70%
  );
  border-radius: 50%;
  animation: wand-glow 1.5s ease-in-out infinite alternate;
}

@keyframes wand-glow {
  0% {
    opacity: 0.5;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>
