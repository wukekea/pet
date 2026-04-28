<script setup lang="ts">
import { ref, computed } from "vue";
import { isDark } from "../composables/theme";
import {
  useStatsRef,
  resetStats as resetStatsData,
} from "../composables/stats";
import { formatDuration, getStatsDays } from "../composables/statsStorage";
import { STATE_NAMES } from "../constants";

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

// CSS 变量 - 用于主题切换
const cssVars = computed(() => ({
  "--overlay-bg": isDark.value
    ? "rgba(0, 0, 0, 0.6)"
    : "rgba(16, 185, 129, 0.1)",
  "--modal-bg": isDark.value
    ? "rgba(30, 35, 40, 0.98)"
    : "rgba(255, 255, 255, 0.98)",
  "--modal-shadow": isDark.value
    ? "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.2)"
    : "0 20px 60px rgba(16, 185, 129, 0.2), 0 0 0 1px rgba(16, 185, 129, 0.1)",
  "--modal-close-bg": isDark.value
    ? "rgba(255, 255, 255, 0.05)"
    : "rgba(0, 0, 0, 0.03)",
  "--modal-close-color": "#9ca3af",
  "--stats-info-bg": isDark.value
    ? "rgba(16, 185, 129, 0.1)"
    : "rgba(16, 185, 129, 0.05)",
  "--stats-date-color": isDark.value ? "#9ca3af" : "#6b7280",
  "--stat-value-color": isDark.value ? "#f1f5f9" : "#1f2937",
  "--stat-label-color": isDark.value ? "#9ca3af" : "#6b7280",
  "--section-title-color": isDark.value ? "#e2e8f0" : "#374151",
  "--interaction-item-bg": isDark.value
    ? "rgba(55, 65, 81, 0.4)"
    : "rgba(243, 244, 246, 0.8)",
  "--interaction-item-hover-bg": isDark.value
    ? "rgba(55, 65, 81, 0.6)"
    : "rgba(229, 231, 235, 0.9)",
  "--interaction-label-color": isDark.value ? "#9ca3af" : "#6b7280",
  "--interaction-value-color": isDark.value ? "#f1f5f9" : "#1f2937",
  "--interactions-total-color": isDark.value ? "#9ca3af" : "#6b7280",
  "--state-item-bg": isDark.value
    ? "rgba(55, 65, 81, 0.3)"
    : "rgba(243, 244, 246, 0.6)",
  "--state-item-hover-bg": isDark.value
    ? "rgba(55, 65, 81, 0.5)"
    : "rgba(229, 231, 235, 0.8)",
  "--state-name-color": isDark.value ? "#e2e8f0" : "#374151",
  "--state-bar-bg": isDark.value
    ? "rgba(75, 85, 99, 0.5)"
    : "rgba(209, 213, 219, 0.5)",
  "--state-count-color": isDark.value ? "#a78bfa" : "#8b5cf6",
  "--btn-reset-bg": isDark.value
    ? "rgba(239, 68, 68, 0.2)"
    : "rgba(239, 68, 68, 0.1)",
  "--scrollbar-thumb-bg": isDark.value
    ? "rgba(167, 139, 250, 0.3)"
    : "rgba(139, 92, 246, 0.2)",
  "--scrollbar-thumb-hover-bg": isDark.value
    ? "rgba(167, 139, 250, 0.5)"
    : "rgba(139, 92, 246, 0.4)",
  "--confirm-overlay-bg": isDark.value
    ? "rgba(0, 0, 0, 0.7)"
    : "rgba(0, 0, 0, 0.5)",
  "--confirm-dialog-bg": isDark.value
    ? "rgba(35, 30, 55, 0.98)"
    : "rgba(255, 255, 255, 0.98)",
  "--confirm-dialog-border": isDark.value
    ? "rgba(239, 68, 68, 0.2)"
    : "rgba(239, 68, 68, 0.1)",
  "--confirm-dialog-gradient": isDark.value
    ? "rgba(239, 68, 68, 0.1)"
    : "rgba(239, 68, 68, 0.05)",
  "--confirm-title-color": isDark.value ? "#f1f5f9" : "#1f2937",
  "--confirm-message-color": isDark.value ? "#9ca3af" : "#6b7280",
  "--confirm-cancel-bg": isDark.value
    ? "rgba(107, 114, 128, 0.2)"
    : "rgba(156, 163, 175, 0.15)",
  "--confirm-cancel-color": isDark.value ? "#9ca3af" : "#6b7280",
  "--confirm-cancel-hover-bg": isDark.value
    ? "rgba(107, 114, 128, 0.3)"
    : "rgba(156, 163, 175, 0.25)",
}));

// 统计数据
const statsData = useStatsRef();

// 重置确认弹窗状态
const resetConfirmVisible = ref(false);

// 过滤掉"发呆"状态的状态统计，并按次数降序排列
const filteredStateCounts = computed(() => {
  const entries = Object.entries(statsData.value.stateCounts)
    .filter(([state]) => state !== "idle")
    .sort((a, b) => b[1] - a[1]);
  return Object.fromEntries(entries);
});

// 关闭弹窗（passthrough 由父组件 useModal 管理）
const close = () => {
  emit("close");
};

// 重置统计数据
const resetStats = () => {
  resetConfirmVisible.value = true;
};

// 确认重置统计数据
const confirmResetStats = () => {
  resetStatsData();
  resetConfirmVisible.value = false;
};

// 取消重置
const cancelResetStats = () => {
  resetConfirmVisible.value = false;
};

// 计算状态条宽度
const getStateBarWidth = (count: number) => {
  const maxCount = Math.max(...Object.values(filteredStateCounts.value));
  return `${Math.min(100, (count / maxCount) * 100)}%`;
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-pop">
      <div
        v-if="visible"
        class="stats-modal-overlay"
        :style="cssVars"
        @click="close"
      >
        <div class="stats-modal" :class="{ 'dark-mode': isDark }" @click.stop>
          <!-- 装饰元素 -->
          <div class="modal-decor">
            <span class="decor-star star-1">📊</span>
            <span class="decor-star star-2">✨</span>
            <span class="decor-star star-3">🎉</span>
          </div>

          <div class="modal-header">
            <div class="header-title">
              <span class="title-icon">📊</span>
              <span class="title-text stats-title">数据统计</span>
            </div>
            <button class="modal-close" @click="close">
              <span>✕</span>
            </button>
          </div>

          <div class="modal-body">
            <!-- 统计日期信息 -->
            <div class="stats-info-bar">
              <span class="stats-date">
                📅 统计开始：{{
                  new Date(statsData.startDate).toLocaleDateString()
                }}
              </span>
              <span class="stats-days">
                已陪伴 {{ getStatsDays(statsData.startDate) }} 天
              </span>
            </div>

            <!-- 核心数据卡片 -->
            <div class="stats-cards">
              <!-- 连续使用 -->
              <div class="stat-card streak-card">
                <div class="stat-icon">🔥</div>
                <div class="stat-content">
                  <div class="stat-value">{{ statsData.streakDays }}</div>
                  <div class="stat-label">连续使用</div>
                </div>
              </div>

              <!-- 总陪伴时长 -->
              <div class="stat-card duration-card">
                <div class="stat-icon">⏱️</div>
                <div class="stat-content">
                  <div class="stat-value">
                    {{ formatDuration(statsData.totalDuration) }}
                  </div>
                  <div class="stat-label">总陪伴时长</div>
                </div>
              </div>

              <!-- 今日时长 -->
              <div class="stat-card today-card">
                <div class="stat-icon">🌟</div>
                <div class="stat-content">
                  <div class="stat-value">
                    {{ formatDuration(statsData.todayDuration) }}
                  </div>
                  <div class="stat-label">今日陪伴</div>
                </div>
              </div>

              <!-- 启动次数 -->
              <div class="stat-card launch-card">
                <div class="stat-icon">🚀</div>
                <div class="stat-content">
                  <div class="stat-value">{{ statsData.launchCount }}</div>
                  <div class="stat-label">启动次数</div>
                </div>
              </div>
            </div>

            <!-- 互动统计 -->
            <div class="stats-section">
              <div class="section-title">
                <span class="section-icon">🎮</span>
                互动统计
              </div>
              <div class="interactions-grid">
                <div class="interaction-item">
                  <span class="interaction-icon">👆</span>
                  <span class="interaction-label">点击</span>
                  <span class="interaction-value">{{
                    statsData.interactions.click
                  }}</span>
                </div>
                <div class="interaction-item">
                  <span class="interaction-icon">✋</span>
                  <span class="interaction-label">拖拽</span>
                  <span class="interaction-value">{{
                    statsData.interactions.drag
                  }}</span>
                </div>
              </div>
              <div class="interactions-total">
                总互动次数：<span class="total-value">{{
                  statsData.interactions.click + statsData.interactions.drag
                }}</span>
              </div>
            </div>

            <!-- 状态触发统计 -->
            <div
              class="stats-section"
              v-if="Object.keys(filteredStateCounts).length > 0"
            >
              <div class="section-title">
                <span class="section-icon">🎭</span>
                状态触发
              </div>
              <div class="state-list">
                <div
                  v-for="(count, state) in filteredStateCounts"
                  :key="state"
                  class="state-item"
                >
                  <span class="state-name">{{
                    STATE_NAMES[state] || state
                  }}</span>
                  <div class="state-bar-bg">
                    <div
                      class="state-bar"
                      :style="{ width: getStateBarWidth(count as number) }"
                    ></div>
                  </div>
                  <span class="state-count">{{ count }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-reset" @click="resetStats">
              <span>🔄</span> 重置数据
            </button>
            <button class="btn btn-save" @click="close">
              <span>✓</span> 关闭
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 重置确认弹窗 -->
    <Transition name="confirm-pop">
      <div
        v-if="resetConfirmVisible"
        class="confirm-overlay"
        :style="cssVars"
        @click="cancelResetStats"
      >
        <div
          class="confirm-dialog"
          :class="{ 'dark-mode': isDark }"
          @click.stop
        >
          <!-- 警告图标区域 -->
          <div class="confirm-icon-wrapper">
            <div class="confirm-icon-circle">
              <span class="confirm-icon">⚠️</span>
            </div>
            <div class="icon-pulse"></div>
          </div>

          <!-- 文字内容 -->
          <div class="confirm-content">
            <h3 class="confirm-title">确认重置</h3>
            <p class="confirm-message">
              确定要重置所有统计数据吗？
              <br />
              <span class="confirm-warning">此操作不可撤销</span>
            </p>
          </div>

          <!-- 按钮区域 -->
          <div class="confirm-buttons">
            <button
              class="confirm-btn confirm-cancel"
              @click="cancelResetStats"
            >
              取消
            </button>
            <button class="confirm-btn confirm-ok" @click="confirmResetStats">
              确认重置
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.stats-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--overlay-bg);
  backdrop-filter: blur(8px);
  pointer-events: auto !important;
}

.stats-modal {
  width: 480px;
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 24px;
  background: var(--modal-bg);
  box-shadow: var(--modal-shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  pointer-events: auto !important;
}

.modal-decor {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.decor-star {
  position: absolute;
  font-size: 16px;
  opacity: 0.4;
  animation: twinkle 2s ease-in-out infinite;
}

.star-1 {
  top: 20px;
  right: 60px;
  animation-delay: 0s;
}

.star-2 {
  top: 40px;
  right: 20px;
  animation-delay: 0.5s;
}

.star-3 {
  top: 60px;
  right: 80px;
  animation-delay: 1s;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  position: relative;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 24px;
}

.title-text {
  font-size: 18px;
  font-weight: 700;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--modal-close-bg);
  color: var(--modal-close-color);
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  transform: rotate(90deg);
}

.modal-body {
  padding: 0 24px 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-save {
  background: linear-gradient(135deg, #10b981, #06b6d4);
  color: white;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
}

.stats-title {
  background: linear-gradient(135deg, #10b981, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--stats-info-bg);
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 13px;
}

.stats-date {
  color: var(--stats-date-color);
}

.stats-days {
  font-weight: 600;
  color: #10b981;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.streak-card {
  background: linear-gradient(
    135deg,
    rgba(251, 146, 60, 0.15),
    rgba(249, 115, 22, 0.1)
  );
  border: 1px solid rgba(251, 146, 60, 0.2);
}

.duration-card {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.15),
    rgba(168, 85, 247, 0.1)
  );
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.today-card {
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.15),
    rgba(6, 182, 212, 0.1)
  );
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.launch-card {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.15),
    rgba(99, 102, 241, 0.1)
  );
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.stat-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--stat-value-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-label {
  font-size: 12px;
  color: var(--stat-label-color);
  margin-top: 2px;
}

.stats-section {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--section-title-color);
  margin-bottom: 12px;
}

.section-icon {
  font-size: 16px;
}

.interactions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.interaction-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  background: var(--interaction-item-bg);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.interaction-item:hover {
  background: var(--interaction-item-hover-bg);
}

.interaction-icon {
  font-size: 18px;
}

.interaction-label {
  font-size: 11px;
  color: var(--interaction-label-color);
}

.interaction-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--interaction-value-color);
}

.interactions-total {
  text-align: center;
  font-size: 13px;
  color: var(--interactions-total-color);
}

.total-value {
  font-weight: 700;
  color: #10b981;
  font-size: 15px;
}

.state-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;
}

.state-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--state-item-bg);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.state-item:hover {
  background: var(--state-item-hover-bg);
}

.state-name {
  width: 60px;
  font-size: 13px;
  font-weight: 500;
  color: var(--state-name-color);
  flex-shrink: 0;
}

.state-bar-bg {
  flex: 1;
  height: 8px;
  background: var(--state-bar-bg);
  border-radius: 4px;
  overflow: hidden;
}

.state-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #06b6d4);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.state-count {
  width: 40px;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: var(--state-count-color);
  flex-shrink: 0;
}

.btn-reset {
  background: var(--btn-reset-bg);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-reset:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
}

/* 滚动条样式 */
.state-list::-webkit-scrollbar {
  width: 4px;
}

.state-list::-webkit-scrollbar-track {
  background: transparent;
}

.state-list::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb-bg);
  border-radius: 2px;
}

.state-list::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover-bg);
}

/* ========================================
   重置确认弹窗样式
   ======================================== */
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 10002;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--confirm-overlay-bg);
  backdrop-filter: blur(4px);
  pointer-events: auto !important;
}

.confirm-dialog {
  width: 320px;
  padding: 28px 24px 24px;
  border-radius: 24px;
  background: var(--confirm-dialog-bg);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px var(--confirm-dialog-border);
  text-align: center;
  pointer-events: auto !important;
  position: relative;
  overflow: hidden;
}

.confirm-dialog::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: radial-gradient(
    ellipse at center top,
    var(--confirm-dialog-gradient) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.confirm-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.confirm-icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(251, 191, 36, 0.15),
    rgba(245, 158, 11, 0.1)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  animation: icon-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-icon {
  font-size: 32px;
}

.icon-pulse {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid rgba(251, 191, 36, 0.3);
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes icon-bounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.confirm-content {
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.confirm-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--confirm-title-color);
  margin: 0 0 8px;
  letter-spacing: 0.3px;
}

.confirm-message {
  font-size: 14px;
  color: var(--confirm-message-color);
  margin: 0;
  line-height: 1.6;
}

.confirm-warning {
  color: #ef4444;
  font-weight: 500;
}

.confirm-buttons {
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.confirm-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-cancel {
  background: var(--confirm-cancel-bg);
  color: var(--confirm-cancel-color);
}

.confirm-cancel:hover {
  background: var(--confirm-cancel-hover-bg);
  transform: translateY(-2px);
}

.confirm-ok {
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
}

.confirm-ok:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45);
}

.confirm-ok:active {
  transform: translateY(0);
}

/* 确认弹窗动画 */
.confirm-pop-enter-active {
  animation: confirm-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.confirm-pop-leave-active {
  animation: confirm-out 0.2s ease-in;
}

@keyframes confirm-in {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes confirm-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* 动画 */
.modal-pop-enter-active {
  animation: modal-pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-pop-leave-active {
  animation: modal-pop-out 0.2s ease-in;
}

@keyframes modal-pop-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes modal-pop-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
