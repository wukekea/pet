<script setup lang="ts">
// 关于面板 - 版本信息与自动更新（更新逻辑在 ../useAutoUpdate）
import {
  version,
  isCheckingUpdate,
  hasUpdate,
  isDownloading,
  downloadProgress,
  updateDownloaded,
  updateError,
  updateInfo,
  copySuccess,
  checkUpdate,
  copyError,
  downloadUpdate,
  installUpdate,
} from "./useAutoUpdate";

defineProps<{
  textColor: string;
  textMuted: string;
  cardBg: string;
  borderColor: string;
}>();
</script>

<template>
  <div class="about-content">
    <div class="about-logo">
      <div class="logo-bg">
        <span class="logo-icon">🐾</span>
      </div>
    </div>
    <h3 class="about-title" :style="{ color: textColor }">桌面宠物</h3>
    <p class="about-version" :style="{ color: textMuted }">
      版本 {{ version }}
    </p>
    <p class="about-desc" :style="{ color: textMuted }">
      一个可爱的桌面伴侣，陪伴你度过每一天的工作时光
    </p>

    <div class="about-actions">
      <button
        class="about-btn"
        :class="{ checking: isCheckingUpdate }"
        :disabled="isCheckingUpdate"
        @click="checkUpdate"
      >
        <span class="btn-icon">🔄</span>
        <span class="btn-text">
          {{
            isCheckingUpdate
              ? "检查中..."
              : hasUpdate
                ? "有更新可用"
                : "检查更新"
          }}
        </span>
      </button>
      <a
        href="https://github.com/wukekea/pet"
        target="_blank"
        class="about-btn secondary"
      >
        <span class="btn-icon">📖</span>
        <span class="btn-text">开源地址</span>
      </a>
    </div>

    <!-- 更新信息展示 -->
    <div
      v-if="(updateInfo || updateError) && !isCheckingUpdate"
      class="update-info"
      :class="{
        'has-update': hasUpdate,
        'is-downloading': isDownloading,
        'update-ready': updateDownloaded,
        'has-error': updateError && !hasUpdate,
      }"
    >
      <!-- 下载进度 -->
      <div v-if="isDownloading" class="update-downloading">
        <span class="update-icon">⬇️</span>
        <div class="download-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${downloadProgress}%` }"
            />
          </div>
          <span class="progress-text" :style="{ color: textMuted }">
            下载中... {{ downloadProgress.toFixed(1) }}%
          </span>
        </div>
      </div>

      <!-- 下载完成，等待安装 -->
      <div v-else-if="updateDownloaded" class="update-ready">
        <div class="update-ready-main">
          <span class="update-icon">✅</span>
          <div class="update-details">
            <span class="update-title" :style="{ color: textColor }"
              >更新已就绪</span
            >
            <span class="update-current" :style="{ color: textMuted }"
              >点击下方按钮重启并安装</span
            >
          </div>
          <button class="install-btn" @click="installUpdate">
            <span class="btn-icon">🔄</span>
            <span class="btn-text">重启安装</span>
          </button>
        </div>
        <div v-if="updateError" class="update-error install-error">
          <span class="error-icon">⚠️</span>
          <span class="error-text">{{ updateError }}</span>
          <button class="copy-error-btn" @click="copyError">
            <span v-if="copySuccess" class="copy-icon success">✓</span>
            <span v-else class="copy-icon">📋</span>
          </button>
        </div>
      </div>

      <!-- 发现新版本 -->
      <div v-else-if="hasUpdate && updateInfo" class="update-available">
        <span class="update-icon">🎉</span>
        <div class="update-details">
          <span class="update-title" :style="{ color: textColor }"
            >发现新版本 v{{ updateInfo.latestVersion }}</span
          >
          <span class="update-current" :style="{ color: textMuted }"
            >当前版本 v{{ updateInfo.currentVersion }}</span
          >
        </div>
        <button class="download-btn" @click="downloadUpdate">
          <span class="btn-icon">⬇️</span>
          <span class="btn-text">立即下载</span>
        </button>
      </div>

      <!-- 已是最新版本 -->
      <div v-else-if="updateInfo && !hasUpdate" class="update-latest">
        <span class="update-icon">✅</span>
        <span class="update-message" :style="{ color: textMuted }"
          >已是最新版本 v{{ updateInfo.currentVersion }}</span
        >
      </div>

      <!-- 只有错误，没有更新信息 -->
      <div v-else-if="!updateInfo && updateError" class="update-error-only">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ updateError }}</span>
        <button class="copy-error-btn" @click="copyError">
          <span v-if="copySuccess" class="copy-icon success">✓</span>
          <span v-else class="copy-icon">📋</span>
        </button>
      </div>

      <!-- 错误信息（附加在更新信息后面，但不在更新已就绪时显示） -->
      <div
        v-if="updateError && updateInfo && !updateDownloaded"
        class="update-error"
      >
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ updateError }}</span>
        <button class="copy-error-btn" @click="copyError">
          <span v-if="copySuccess" class="copy-icon success">✓</span>
          <span v-else class="copy-icon">📋</span>
        </button>
      </div>
    </div>

    <div class="about-footer" :style="{ color: textMuted }">
      <span>Made with 💝</span>
    </div>
  </div>
</template>

<style scoped>
/* 关于页面 */
.about-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 40px;
  position: relative;
}

.about-logo {
  margin-bottom: 12px;
}

.logo-bg {
  width: 64px;
  height: 64px;
  border-radius: 22px;
  background: linear-gradient(135deg, #f5a623, #f76b1c);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8px 24px rgba(245, 166, 35, 0.35),
    inset 0 -2px 6px rgba(0, 0, 0, 0.1);
  animation: logo-pulse 3s ease-in-out infinite;
}

@keyframes logo-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.logo-icon {
  font-size: 32px;
}

.about-title {
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 4px;
  letter-spacing: 0.5px;
}

.about-version {
  font-size: 13px;
  margin: 0 0 8px;
  font-weight: 600;
}

.about-desc {
  font-size: 12px;
  margin: 0 0 20px;
  text-align: center;
  line-height: 1.5;
}

.about-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  width: 100%;
  justify-content: center;
}

.about-btn {
  flex: 1;
  max-width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #f5a623, #f76b1c);
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.about-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 166, 35, 0.3);
}

.about-btn.checking {
  opacity: 0.7;
  cursor: wait;
}

.about-btn.secondary {
  background: v-bind(cardBg);
  color: v-bind(textColor);
  border: 1px solid v-bind(borderColor);
}

.about-btn .btn-icon {
  font-size: 14px;
}

.about-footer {
  font-size: 11px;
  opacity: 0.6;
  margin-top: auto;
  padding-top: 20px;
}

/* 更新信息样式 */
.update-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(150, 150, 150, 0.08);
  border: 1.5px solid rgba(150, 150, 150, 0.15);
}

.update-info.has-update {
  border-color: rgba(52, 211, 153, 0.35);
  background: rgba(52, 211, 153, 0.08);
}

.update-info.is-downloading {
  border-color: rgba(96, 165, 250, 0.35);
  background: rgba(96, 165, 250, 0.08);
}

.update-info.update-ready {
  border-color: rgba(52, 211, 153, 0.4);
  background: rgba(52, 211, 153, 0.1);
}

.update-available,
.update-latest,
.update-downloading,
.update-ready-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.update-icon {
  font-size: 20px;
}

.update-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.update-title {
  font-size: 13px;
  font-weight: 700;
}

.update-current {
  font-size: 11px;
  opacity: 0.7;
}

.download-btn,
.install-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #34d399, #10b981);
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.download-btn:hover,
.install-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
}

.download-btn .btn-icon,
.install-btn .btn-icon {
  font-size: 12px;
}

.update-latest {
  justify-content: center;
}

.update-message {
  font-size: 12px;
  text-align: center;
}

/* 下载进度样式 */
.update-downloading {
  width: 100%;
}

.download-progress {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(150, 150, 150, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  text-align: center;
}

/* 更新就绪样式 */
.update-ready {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.update-ready-main {
  width: 100%;
}

.install-error {
  margin-top: 0;
}

/* 错误信息样式 */
.update-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
}

.error-icon {
  font-size: 14px;
}

.error-text {
  font-size: 12px;
  color: #ef4444;
}

/* 只有错误的样式 */
.update-error-only {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 复制错误按钮 */
.copy-error-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.copy-error-btn:hover {
  background: rgba(239, 68, 68, 0.15);
}

.copy-error-btn .copy-icon {
  font-size: 12px;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.copy-error-btn:hover .copy-icon {
  opacity: 1;
}

.copy-error-btn .copy-icon.success {
  color: #34d399;
  opacity: 1;
}

.update-info.has-error {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}
</style>
