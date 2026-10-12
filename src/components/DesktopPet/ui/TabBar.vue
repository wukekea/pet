<script setup lang="ts">
/**
 * 通用分类切换 Tab 栏
 * 替代 shop/warehouse 各自复制的 tab-bar 模板与 CSS。
 * Tab 定义由使用方传入，指示器颜色通过 CSS 变量 --indicator-bg 注入。
 */
defineProps<{
  /** Tab 配置列表 */
  tabs: {
    key: string;
    icon: string;
    label: string;
    /** 指示器颜色（CSS background 值），不传则使用主题默认色 */
    indicator?: string;
  }[];
  /** 当前激活的 Tab key */
  active: string;
}>();

const emit = defineEmits<{
  select: [key: string];
}>();
</script>

<template>
  <div class="tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="tab-btn"
      :class="{ active: active === tab.key }"
      @click="emit('select', tab.key)"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-text">{{ tab.label }}</span>
      <div
        v-if="active === tab.key"
        class="tab-indicator"
        :class="`${tab.key}-indicator`"
        :style="tab.indicator ? { background: tab.indicator } : undefined"
      ></div>
    </button>
  </div>
</template>

<style scoped>
.tab-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  background: var(--tab-inactive-bg);
  padding: 4px;
  border-radius: 14px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 6px;
  border: none;
  border-radius: 11px;
  background: transparent;
  color: var(--tab-inactive-color);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  font-weight: 500;
  font-size: 13px;
}

.tab-btn.active {
  background: var(--modal-bg);
  color: var(--text-color);
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tab-btn:not(.active):hover {
  color: var(--text-color);
  background: rgba(251, 191, 36, 0.06);
}

.tab-icon {
  font-size: 14px;
}

.tab-text {
  font-size: 13px;
}

/* Tab 下划线指示器（颜色由使用方注入） */
.tab-indicator {
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  border-radius: 2px;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.25);
}

/* 各分类指示器配色（与原 shop/warehouse 的指示器一致） */
.food-indicator {
  background: linear-gradient(90deg, #f97316, #fb923c);
  box-shadow: 0 0 6px rgba(249, 115, 22, 0.4);
}

.bath-indicator {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.4);
}

.deco-indicator,
.decoration-indicator {
  background: linear-gradient(90deg, #a855f7, #ec4899);
  box-shadow: 0 0 6px rgba(168, 85, 247, 0.4);
}

.shape-indicator {
  background: linear-gradient(90deg, #10b981, #34d399);
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
}
</style>
