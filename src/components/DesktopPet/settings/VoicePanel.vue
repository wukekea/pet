<script setup lang="ts">
// 语音设置面板（从 settings/index.vue 拆出）
// 语音状态单一真相在 speech.ts（speechEnabled 及各参数），
// 本面板直接读写 speech.ts 的 ref，不再经过 pet-settings.voiceEnabled 中转
import {
  speechEnabled,
  speechEngine,
  speechRate,
  speechVolume,
  isSpeechSupported,
  isEdgeLoading,
  edgeStatus,
  toggleSpeech,
  switchEngine,
  type SpeechEngine,
} from "../composables/speech";
import { formatPercent } from "./shared";

// 是否支持语音
const speechSupported = isSpeechSupported();

// 主题色
const primary = "#f5a623";

// 处理语音开关
const handleVoiceToggle = () => {
  toggleSpeech();
};

// 测试语音
const testSpeech = () => {
  if (!speechEnabled.value) return;
  import("../composables/speech").then(({ speak }) => {
    speak("你好，我是你的桌面宠物！");
  });
};

// 切换语音引擎
const handleSwitchEngine = async (engine: SpeechEngine) => {
  if (engine === speechEngine.value) return;
  const success = await switchEngine(engine);
  if (!success && engine === "edge") {
    alert(
      "Edge TTS 初始化失败，请检查网络连接或安装 edge-tts: pip3 install edge-tts",
    );
  }
};

defineProps<{
  textColor: string;
  textMuted: string;
  borderColor: string;
}>();
</script>

<template>
  <div class="settings-panel">
    <div class="panel-header">
      <span class="panel-icon">🔊</span>
      <span class="panel-title" :style="{ color: textColor }">语音设置</span>
    </div>

    <div v-if="speechSupported" class="settings-list">
      <!-- 语音开关 -->
      <div class="setting-item">
        <div class="setting-main">
          <div
            class="setting-icon-wrapper"
            style="--icon-bg: rgba(96, 165, 250, 0.15); --icon-color: #60a5fa"
          >
            <span class="setting-icon">🎵</span>
          </div>
          <div class="setting-info">
            <span class="setting-label" :style="{ color: textColor }"
              >启用语音</span
            >
            <span class="setting-desc" :style="{ color: textMuted }"
              >宠物说话时播放语音</span
            >
          </div>
        </div>
        <button
          class="toggle-switch blue"
          :class="{ active: speechEnabled }"
          @click="handleVoiceToggle"
        >
          <span class="toggle-thumb" />
        </button>
      </div>

      <!-- 语音引擎 -->
      <div class="setting-item vertical" :class="{ disabled: !speechEnabled }">
        <div class="setting-main">
          <div
            class="setting-icon-wrapper"
            style="--icon-bg: rgba(167, 139, 250, 0.15); --icon-color: #a78bfa"
          >
            <span class="setting-icon">🔧</span>
          </div>
          <div class="setting-info">
            <span class="setting-label" :style="{ color: textColor }"
              >语音引擎</span
            >
          </div>
        </div>
        <div class="engine-selector">
          <button
            class="engine-option"
            :class="{ active: speechEngine === 'browser' }"
            :disabled="!speechEnabled"
            @click="handleSwitchEngine('browser')"
          >
            <span class="engine-name">浏览器内置</span>
            <span class="engine-desc">免费，无需网络</span>
          </button>
          <button
            class="engine-option"
            :class="{ active: speechEngine === 'edge' }"
            :disabled="!speechEnabled || isEdgeLoading"
            @click="handleSwitchEngine('edge')"
          >
            <span class="engine-name">Edge TTS</span>
            <span class="engine-desc">高质量，需网络</span>
          </button>
        </div>
        <div
          v-if="edgeStatus && speechEngine === 'edge'"
          class="engine-status"
          :style="{ color: textMuted }"
        >
          {{ edgeStatus }}
        </div>
      </div>

      <!-- 音量 -->
      <div class="setting-item" :class="{ disabled: !speechEnabled }">
        <div class="setting-main">
          <div
            class="setting-icon-wrapper"
            style="--icon-bg: rgba(245, 166, 35, 0.15); --icon-color: #f5a623"
          >
            <span class="setting-icon">🔊</span>
          </div>
          <div class="setting-info">
            <span class="setting-label" :style="{ color: textColor }"
              >音量</span
            >
            <span class="setting-value" :style="{ color: primary }">{{
              formatPercent(speechVolume * 100)
            }}</span>
          </div>
        </div>
        <div class="slider-wrapper">
          <input
            v-model.number="speechVolume"
            type="range"
            min="0"
            max="1"
            step="0.1"
            :disabled="!speechEnabled"
            class="custom-slider"
          />
        </div>
      </div>

      <!-- 语速 -->
      <div class="setting-item" :class="{ disabled: !speechEnabled }">
        <div class="setting-main">
          <div
            class="setting-icon-wrapper"
            style="--icon-bg: rgba(52, 211, 153, 0.15); --icon-color: #34d399"
          >
            <span class="setting-icon">🚀</span>
          </div>
          <div class="setting-info">
            <span class="setting-label" :style="{ color: textColor }"
              >语速</span
            >
            <span class="setting-value" :style="{ color: '#34d399' }">{{
              formatPercent(speechRate * 100)
            }}</span>
          </div>
        </div>
        <div class="slider-wrapper">
          <input
            v-model.number="speechRate"
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            :disabled="!speechEnabled"
            class="custom-slider green"
          />
          <div class="slider-marks">
            <span>慢</span>
            <span>中</span>
            <span>快</span>
          </div>
        </div>
      </div>

      <!-- 测试按钮 -->
      <button
        class="test-voice-btn"
        :disabled="!speechEnabled"
        @click="testSpeech"
      >
        <span class="btn-icon">🎤</span>
        <span class="btn-text">测试语音</span>
      </button>
    </div>

    <div v-else class="unsupported-tip" :style="{ borderColor }">
      <span class="tip-icon">⚠️</span>
      <span class="tip-text" :style="{ color: textMuted }"
        >您的浏览器不支持语音合成功能</span
      >
    </div>
  </div>
</template>
