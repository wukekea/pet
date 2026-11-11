<script setup lang="ts">
// 语音设置面板（从 settings/index.vue 拆出）
// 语音状态单一真相在 speech.ts（speechEnabled 及各参数），
// 本面板直接读写 speech.ts 的 ref，不再经过 pet-settings.voiceEnabled 中转
import {
  speechEnabled,
  speechRate,
  speechVolume,
  isSpeechSupported,
  toggleSpeech,
} from "../composables/speech";
import { formatPercent } from "./shared";
import { testVoiceMessage } from "@/data/dialogues";

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
    speak(testVoiceMessage);
  });
};

// 语速/音调只作用于浏览器 TTS 回退路径，预录语音不受影响

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

      <!-- 语音来源说明 -->
      <div class="setting-item voice-source-item">
        <div class="setting-main">
          <div
            class="setting-icon-wrapper"
            style="--icon-bg: rgba(167, 139, 250, 0.15); --icon-color: #a78bfa"
          >
            <span class="setting-icon">💾</span>
          </div>
          <div class="setting-info">
            <span class="setting-label" :style="{ color: textColor }"
              >预录语音优先</span
            >
            <span class="setting-desc" :style="{ color: textMuted }"
              >优先播放本地预录音频，无网络也清晰；未收录的台词回退浏览器语音</span
            >
          </div>
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
            <span class="setting-desc" :style="{ color: textMuted }"
              >仅对 TTS 回退语音生效，预录语音不受影响</span
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
