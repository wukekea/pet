<script setup lang="ts">
// 通用金币余额徽章 - 展示当前金币数量
defineProps<{
  amount: number;
}>();
</script>

<template>
  <div class="money-section">
    <div class="money-badge">
      <span class="money-icon">💰</span>
      <span class="money-amount">{{ amount }}</span>
    </div>
  </div>
</template>

<style scoped>
.money-section {
  margin-bottom: 16px;
}

.money-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--money-bg);
  border-radius: 20px;
  border: 1px solid rgba(251, 191, 36, 0.2);
}

.money-icon {
  font-size: 18px;
}

.money-amount {
  font-size: 20px;
  font-weight: 800;
  color: var(--money-color);
}
</style>
