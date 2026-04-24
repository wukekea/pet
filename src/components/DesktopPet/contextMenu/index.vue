<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from "vue";
import { isDark } from "../composables/theme";

const props = defineProps<{
  visible: boolean;
  x: number;
  y: number;
}>();

const emit = defineEmits<{
  close: [];
  openSchedule: [];
  openStats: [];
  openAttributes: [];
}>();

// CSS 变量 - 用于主题切换
const cssVars = computed(() => ({
  "--star-color-1": isDark.value ? "#c4b5fd" : "#a78bfa",
  "--star-color-2": isDark.value ? "#f9a8d4" : "#f472b6",
  "--menu-bg": isDark.value
    ? "rgba(35, 30, 55, 0.97)"
    : "rgba(255, 255, 255, 0.97)",
  "--menu-shadow": isDark.value
    ? "0 10px 40px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(167, 139, 250, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
    : "0 10px 40px rgba(139, 92, 246, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
  "--menu-gradient": isDark.value
    ? "rgba(139, 92, 246, 0.08)"
    : "rgba(139, 92, 246, 0.04)",
  "--hover-bg": isDark.value
    ? "rgba(139, 92, 246, 0.15)"
    : "rgba(139, 92, 246, 0.08)",
  "--text-color": isDark.value ? "#e2e8f0" : "#374151",
  "--desc-color": isDark.value
    ? "rgba(167, 139, 250, 0.7)"
    : "rgba(139, 92, 246, 0.7)",
  "--arrow-color": isDark.value
    ? "rgba(167, 139, 250, 0.5)"
    : "rgba(139, 92, 246, 0.4)",
  "--arrow-hover-color": isDark.value ? "#a78bfa" : "#8b5cf6",
  "--divider-color": isDark.value
    ? "rgba(167, 139, 250, 0.2)"
    : "rgba(139, 92, 246, 0.15)",
  "--tail-bg": isDark.value
    ? "rgba(35, 30, 55, 0.97)"
    : "rgba(255, 255, 255, 0.97)",
}));

// 点击其他地方关闭菜单
const handleGlobalClick = () => {
  if (props.visible) {
    emit("close");
  }
};

onMounted(() => {
  document.addEventListener("click", handleGlobalClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleGlobalClick);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="menu-pop">
      <div
        v-if="visible"
        class="pet-context-menu"
        :style="{
          left: `${x}px`,
          top: `${y}px`,
          ...cssVars,
        }"
        @click.stop
      >
        <!-- 装饰星星 -->
        <div class="menu-decor-stars">
          <span class="decor-star-small star-1">✦</span>
          <span class="decor-star-small star-2">✧</span>
          <span class="decor-star-small star-3">✦</span>
        </div>

        <div class="menu-bubble">
          <div class="menu-item" @click="emit('openSchedule')">
            <div class="menu-icon-wrapper moon">
              <span class="menu-icon">🌙</span>
            </div>
            <div class="menu-text-group">
              <span class="menu-text">作息设置</span>
              <span class="menu-desc">设置睡眠时间</span>
            </div>
            <span class="menu-arrow">›</span>
          </div>
          <div class="menu-divider">
            <div class="divider-line"></div>
          </div>
          <div class="menu-item" @click="emit('openAttributes')">
            <div class="menu-icon-wrapper heart">
              <span class="menu-icon">💖</span>
            </div>
            <div class="menu-text-group">
              <span class="menu-text">宠物属性</span>
              <span class="menu-desc">查看成长状态</span>
            </div>
            <span class="menu-arrow">›</span>
          </div>
          <div class="menu-divider">
            <div class="divider-line"></div>
          </div>
          <div class="menu-item" @click="emit('openStats')">
            <div class="menu-icon-wrapper chart">
              <span class="menu-icon">📊</span>
            </div>
            <div class="menu-text-group">
              <span class="menu-text">数据统计</span>
              <span class="menu-desc">查看互动记录</span>
            </div>
            <span class="menu-arrow">›</span>
          </div>
        </div>

        <!-- 小尾巴 -->
        <div class="menu-tail"></div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ========================================
   右键菜单样式 - 梦幻云朵风格
   ======================================== */
.pet-context-menu {
  position: fixed;
  z-index: 10000;
  pointer-events: auto !important;
  transform-origin: top left;
}

.menu-decor-stars {
  position: absolute;
  inset: -15px;
  pointer-events: none;
}

.decor-star-small {
  position: absolute;
  font-size: 12px;
  animation: star-twinkle 2s ease-in-out infinite;
}

.decor-star-small.star-1 {
  top: 5px;
  left: -5px;
  animation-delay: 0s;
  color: var(--star-color-1);
}

.decor-star-small.star-2 {
  top: -8px;
  right: 10px;
  animation-delay: 0.5s;
  color: var(--star-color-2);
}

.decor-star-small.star-3 {
  bottom: 20px;
  right: -8px;
  animation-delay: 1s;
  color: var(--star-color-1);
}

@keyframes star-twinkle {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.menu-bubble {
  min-width: 180px;
  padding: 10px;
  background: var(--menu-bg);
  border-radius: 20px;
  box-shadow: var(--menu-shadow);
  backdrop-filter: blur(20px);
  pointer-events: auto !important;
  position: relative;
  overflow: hidden;
}

.menu-bubble::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(
    180deg,
    var(--menu-gradient) 0%,
    transparent 100%
  );
  pointer-events: none;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.menu-item:hover {
  background: var(--hover-bg);
  transform: translateX(4px) scale(1.02);
}

.menu-item:active {
  transform: translateX(2px) scale(0.98);
}

.menu-icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.menu-icon-wrapper.moon {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.15),
    rgba(168, 85, 247, 0.1)
  );
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.15);
}

.menu-icon-wrapper.chart {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.15),
    rgba(6, 182, 212, 0.1)
  );
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
}

.menu-icon-wrapper.heart {
  background: linear-gradient(
    135deg,
    rgba(244, 114, 182, 0.15),
    rgba(251, 146, 60, 0.1)
  );
  box-shadow: 0 2px 8px rgba(244, 114, 182, 0.15);
}

.menu-item:hover .menu-icon-wrapper {
  transform: scale(1.1) rotate(-5deg);
}

.menu-item:hover .menu-icon-wrapper.moon {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.25),
    rgba(168, 85, 247, 0.2)
  );
}

.menu-item:hover .menu-icon-wrapper.chart {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.25),
    rgba(6, 182, 212, 0.2)
  );
}

.menu-item:hover .menu-icon-wrapper.heart {
  background: linear-gradient(
    135deg,
    rgba(244, 114, 182, 0.25),
    rgba(251, 146, 60, 0.2)
  );
}

.menu-icon {
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-text-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.menu-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  letter-spacing: 0.2px;
}

.menu-desc {
  font-size: 11px;
  color: var(--desc-color);
  font-weight: 400;
}

.menu-arrow {
  font-size: 18px;
  color: var(--arrow-color);
  transition: all 0.25s ease;
  opacity: 0;
  transform: translateX(-5px);
}

.menu-item:hover .menu-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--arrow-hover-color);
}

.menu-divider {
  padding: 4px 8px;
  position: relative;
}

.divider-line {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--divider-color) 20%,
    var(--divider-color) 80%,
    transparent 100%
  );
}

.menu-tail {
  position: absolute;
  bottom: -8px;
  left: 24px;
  width: 20px;
  height: 12px;
  background: var(--tail-bg);
  clip-path: polygon(30% 0%, 70% 0%, 50% 100%);
  filter: drop-shadow(0 2px 4px rgba(139, 92, 246, 0.1));
}

/* ========================================
   动画过渡
   ======================================== */
.menu-pop-enter-active {
  animation: menu-pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.menu-pop-leave-active {
  animation: menu-pop-out 0.15s ease-in;
}

@keyframes menu-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes menu-pop-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}
</style>
