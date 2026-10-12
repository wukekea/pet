<script setup lang="ts">
/**
 * 通用物品卡片网格
 * 替代 shop/warehouse 各自复制的 items-grid / item-card 模板与 CSS。
 * 卡片内容通过 #info 插槽自定义（商店显示价格、仓库显示数量），
 * 分类配色通过 CSS 变量在调用方注入。
 */
import type { StyleValue } from "vue";
import DecoIcon from "../shapes/decorations/DecoIcon.vue";
import type { DecorationType, BathType } from "../composables/sharedState";

export interface ItemGridItem {
  type: string;
  name: string;
  icon: string;
  /** 装饰类型（有值时用 DecoIcon 渲染） */
  decoType?: DecorationType;
  /** 卡片分类（决定配色类名） */
  category: "food" | "bath" | "decoration" | "shape";
  /** 是否禁用（买不起/数量为 0） */
  disabled?: boolean;
  /** 是否已拥有（显示徽章而非价格） */
  owned?: boolean;
}

defineProps<{
  items: ItemGridItem[];
  /** 网格列数（默认 4） */
  columns?: number;
}>();

const emit = defineEmits<{
  /** 点击卡片（透传原始 item，调用方可收窄为自己的扩展类型） */
  click: [item: ItemGridItem];
}>();
</script>

<template>
  <div
    class="items-grid"
    :style="
      columns && columns !== 4
        ? ({ '--grid-columns': columns } as StyleValue)
        : undefined
    "
  >
    <button
      v-for="item in items"
      :key="item.type"
      class="item-card"
      :class="{
        disabled: item.disabled,
        owned: item.owned,
        'bath-card': item.category === 'bath',
        'deco-card': item.category === 'decoration',
        'shape-card': item.category === 'shape',
      }"
      :disabled="item.disabled"
      @click="emit('click', item)"
    >
      <span class="item-icon">
        <DecoIcon
          v-if="item.decoType || item.category === 'bath'"
          :type="(item.decoType || item.type) as DecorationType | BathType"
        />
        <template v-else>{{ item.icon }}</template>
      </span>
      <span class="item-name">{{ item.name }}</span>
      <!-- 卡片信息区：商店显示价格/效果，仓库显示数量/效果，由插槽决定 -->
      <slot name="info" :item="item" />
    </button>
  </div>
</template>

<style scoped>
.items-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns, 4), 1fr);
  gap: 6px;
}

.item-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px 8px;
  border: 1px solid var(--card-border);
  border-radius: 12px;
  background: var(--card-bg);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.item-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(
    180deg,
    rgba(251, 191, 36, 0.04) 0%,
    transparent 100%
  );
  pointer-events: none;
  border-radius: 16px 16px 0 0;
}

/* 分类配色卡片（颜色变量由调用方注入，未注入时回退默认卡片样式） */
.item-card.bath-card {
  border-color: var(--bath-card-border, var(--card-border));
  background: var(--bath-card-bg, var(--card-bg));
}

.item-card.deco-card {
  border-color: var(--deco-card-border, var(--card-border));
  background: var(--deco-card-bg, var(--card-bg));
}

.item-card.shape-card {
  border-color: var(--shape-card-border, var(--card-border));
  background: var(--shape-card-bg, var(--card-bg));
}

.item-card:hover:not(.disabled):not(.owned) {
  background: var(--card-hover-bg);
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.15);
  border-color: rgba(251, 191, 36, 0.3);
}

/* 分类配色 hover 变体（变量未注入时回退通用 hover 色） */
.item-card.deco-card:hover:not(.disabled):not(.owned) {
  background: var(--deco-card-hover-bg, var(--card-hover-bg));
  box-shadow: 0 6px 16px rgba(168, 85, 247, 0.18);
  border-color: rgba(168, 85, 247, 0.35);
}

.item-card.shape-card:hover:not(.disabled):not(.owned) {
  background: var(--shape-card-hover-bg, var(--card-hover-bg));
  box-shadow: 0 6px 16px rgba(52, 211, 153, 0.18);
  border-color: rgba(52, 211, 153, 0.35);
}

.item-card.bath-card:hover:not(.disabled):not(.owned) {
  background: var(--bath-card-hover-bg, var(--card-hover-bg));
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.18);
  border-color: rgba(59, 130, 246, 0.35);
}

.item-card:active:not(.disabled):not(.owned) {
  transform: translateY(0) scale(0.97);
}

.item-card.disabled {
  background: var(--card-disabled-bg);
  border-color: var(--card-disabled-border);
  cursor: not-allowed;
  opacity: 0.55;
}

.item-card.owned {
  opacity: 0.7;
  cursor: default;
}

.item-card.owned:hover {
  transform: none;
  box-shadow: none;
}

.item-icon {
  font-size: 20px;
  line-height: 1;
  position: relative;
}

.item-card:hover:not(.disabled):not(.owned) .item-icon {
  transform: scale(1.15);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.item-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--value-color);
  line-height: 1;
}

.item-card.disabled .item-name {
  color: var(--disabled-color);
}
</style>
