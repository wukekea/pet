<script setup lang="ts">
// 交互设置面板（从 settings/index.vue 拆出）
import { settings } from "../composables/settings";
import {
  speechInputEnabled,
  speechInputStatus,
  isSpeechInputReady,
  isCheckingStatus,
  toggleSpeechInput,
  checkSpeechInputDependencies,
} from "../composables/speechInputSettings";

// 主题色
const primary = "#f5a623";

// 语音输入
const handleSpeechInputToggle = async () => {
  const enabled = await toggleSpeechInput();
  if (!enabled && !isSpeechInputReady.value) {
    // 依赖未就绪，展开依赖列表提示用户
    await checkSpeechInputDependencies();
  }
};

defineProps<{
  textColor: string;
  textMuted: string;
  borderColor: string;
  cardBg: string;
}>();
</script>

<template>
  <div class="settings-panel">
    <div class="panel-header">
      <span class="panel-icon">✋</span>
      <span class="panel-title" :style="{ color: textColor }">交互设置</span>
    </div>

    <div class="settings-list">
      <!-- 点击反应 -->
      <div class="setting-item">
        <div class="setting-main">
          <div
            class="setting-icon-wrapper"
            style="--icon-bg: rgba(245, 166, 35, 0.15); --icon-color: #f5a623"
          >
            <span class="setting-icon">👆</span>
          </div>
          <div class="setting-info">
            <span class="setting-label" :style="{ color: textColor }"
              >点击反应</span
            >
            <span class="setting-desc" :style="{ color: textMuted }"
              >点击宠物时触发互动</span
            >
          </div>
        </div>
        <button
          class="toggle-switch"
          :class="{ active: settings.clickReaction }"
          @click="settings.clickReaction = !settings.clickReaction"
        >
          <span class="toggle-thumb" />
        </button>
      </div>

      <!-- 拖拽音效 -->
      <div class="setting-item">
        <div class="setting-main">
          <div
            class="setting-icon-wrapper"
            style="--icon-bg: rgba(244, 114, 182, 0.15); --icon-color: #f472b6"
          >
            <span class="setting-icon">🎶</span>
          </div>
          <div class="setting-info">
            <span class="setting-label" :style="{ color: textColor }"
              >拖拽音效</span
            >
            <span class="setting-desc" :style="{ color: textMuted }"
              >拖拽宠物时播放音效</span
            >
          </div>
        </div>
        <button
          class="toggle-switch pink"
          :class="{ active: settings.dragSound }"
          @click="settings.dragSound = !settings.dragSound"
        >
          <span class="toggle-thumb" />
        </button>
      </div>

      <!-- 分隔线 -->
      <div class="settings-divider" :style="{ borderColor }"></div>

      <!-- 语音输入设置 -->
      <div class="speech-input-section">
        <div class="setting-item">
          <div class="setting-main">
            <div
              class="setting-icon-wrapper"
              style="--icon-bg: rgba(139, 92, 246, 0.15); --icon-color: #8b5cf6"
            >
              <span class="setting-icon">🎙️</span>
            </div>
            <div class="setting-info">
              <span class="setting-label" :style="{ color: textColor }"
                >语音输入</span
              >
              <span class="setting-desc" :style="{ color: textMuted }"
                >在 AI 对话中使用语音输入文字</span
              >
            </div>
          </div>
          <div class="setting-status">
            <span v-if="isSpeechInputReady" class="status-badge ready"
              >已就绪</span
            >
            <span v-else class="status-badge not-ready">未就绪</span>
            <button
              class="toggle-switch purple"
              :class="{ active: speechInputEnabled }"
              :disabled="isCheckingStatus"
              @click="handleSpeechInputToggle"
            >
              <span class="toggle-thumb" />
            </button>
          </div>
        </div>

        <!-- 依赖状态展示 -->
        <div
          v-if="!isSpeechInputReady"
          class="dependencies-panel"
          :style="{ background: cardBg }"
        >
          <div class="panel-title-row">
            <div class="panel-title-left">
              <span class="panel-icon-small">📦</span>
              <span :style="{ color: textColor }">依赖检测</span>
            </div>
            <button
              class="refresh-btn"
              :disabled="isCheckingStatus"
              @click="checkSpeechInputDependencies"
            >
              <span class="refresh-icon" :class="{ spinning: isCheckingStatus }"
                >🔄</span
              >
              <span>刷新</span>
            </button>
          </div>

          <div class="dependency-list">
            <div
              v-for="dep in [
                {
                  key: 'sox',
                  name: 'sox',
                  desc: '音频录制工具',
                  installed: speechInputStatus.soxInstalled,
                },
                {
                  key: 'whisper',
                  name: 'whisper-cpp',
                  desc: '语音识别引擎',
                  installed: speechInputStatus.whisperInstalled,
                },
                {
                  key: 'model',
                  name: 'ggml-base.bin',
                  desc: '语音识别模型 (~150MB)',
                  installed: speechInputStatus.modelExists,
                },
              ]"
              :key="dep.key"
              class="dependency-item"
              :class="{ installed: dep.installed }"
            >
              <div class="dep-status">
                <span class="status-icon">
                  {{ dep.installed ? "✅" : "❌" }}
                </span>
              </div>
              <div class="dep-info">
                <div class="dep-name-row">
                  <span class="dep-name" :style="{ color: textColor }">{{
                    dep.name
                  }}</span>
                  <span class="dep-desc" :style="{ color: textMuted }">{{
                    dep.desc
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="help-text" :style="{ color: textMuted }">
            <p>💡 安装完成后点击刷新按钮检测</p>
            <p>🔒 语音输入使用本地模型，无需联网，保护隐私</p>
          </div>
        </div>

        <!-- 已就绪提示 -->
        <div
          v-else-if="speechInputEnabled"
          class="ready-tip"
          :style="{ color: primary }"
        >
          <span class="ready-icon">✨</span>
          <span class="ready-text"
            >语音输入已启用，在 AI 对话中点击麦克风即可使用</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
