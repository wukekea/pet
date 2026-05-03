<script setup lang="ts">
import { computed } from "vue";
import { isDark } from "../composables/theme";
import {
  speechEnabled,
  speechEngine,
  speechRate,
  speechPitch,
  speechVolume,
  isSpeechSupported,
  isEdgeReady,
  isEdgeLoading,
  edgeStatus,
  toggleSpeech,
  switchEngine,
  type SpeechEngine,
} from "../composables/speech";

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

// 是否支持语音
const speechSupported = isSpeechSupported();

// 动态颜色
const modalBg = computed(() =>
  isDark.value ? "rgba(35, 30, 55, 0.98)" : "rgba(255, 255, 255, 0.98)",
);
const modalShadow = computed(() =>
  isDark.value
    ? "0 25px 50px rgba(139, 92, 246, 0.3), 0 0 0 1px rgba(167, 139, 250, 0.2)"
    : "0 25px 50px rgba(139, 92, 246, 0.2), 0 0 0 1px rgba(139, 92, 246, 0.1)",
);
const textColor = computed(() => (isDark.value ? "#e2e8f0" : "#374151"));
const descColor = computed(() =>
  isDark.value ? "rgba(167, 139, 250, 0.8)" : "rgba(139, 92, 246, 0.7)",
);
const sectionBg = computed(() =>
  isDark.value ? "rgba(139, 92, 246, 0.08)" : "rgba(139, 92, 246, 0.04)",
);
const borderColor = computed(() =>
  isDark.value ? "rgba(167, 139, 250, 0.2)" : "rgba(139, 92, 246, 0.15)",
);

// 格式化百分比
const formatPercent = (val: number) => `${Math.round(val * 100)}%`;

// 关闭弹窗
const closeModal = () => {
  emit("close");
};

// 点击遮罩层关闭
const handleOverlayClick = () => {
  closeModal();
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
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="visible"
        class="settings-overlay"
        @mousedown.stop="handleOverlayClick"
      >
        <Transition name="modal-pop">
          <div
            v-if="visible"
            class="settings-modal"
            :style="{
              background: modalBg,
              boxShadow: modalShadow,
            }"
            @mousedown.stop
          >
            <!-- 头部 -->
            <div class="modal-header">
              <h3 class="modal-title">⚙️ 设置</h3>
              <button class="close-btn" @click="closeModal">✕</button>
            </div>

            <!-- 内容区 -->
            <div class="modal-content">
              <!-- 语音设置 -->
              <div
                v-if="speechSupported"
                class="settings-section"
                :style="{ background: sectionBg }"
              >
                <div class="section-header">
                  <span class="section-icon">🔊</span>
                  <span class="section-title">语音设置</span>
                </div>

                <!-- 语音开关 -->
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label" :style="{ color: textColor }"
                      >启用语音</span
                    >
                    <span class="setting-desc" :style="{ color: descColor }"
                      >宠物说话时播放语音</span
                    >
                  </div>
                  <button
                    class="toggle-btn"
                    :class="{ active: speechEnabled }"
                    @click="toggleSpeech"
                  >
                    <span class="toggle-slider"></span>
                  </button>
                </div>

                <!-- 语音引擎选择 -->
                <div class="setting-row" :class="{ disabled: !speechEnabled }">
                  <div class="setting-info">
                    <span class="setting-label" :style="{ color: textColor }"
                      >语音引擎</span
                    >
                    <span class="setting-desc" :style="{ color: descColor }">{{
                      speechEngine === "browser"
                        ? "浏览器内置（免费）"
                        : "Edge TTS（高质量在线）"
                    }}</span>
                  </div>
                  <div class="engine-select">
                    <button
                      class="engine-btn"
                      :class="{ active: speechEngine === 'browser' }"
                      @click="handleSwitchEngine('browser')"
                      :disabled="!speechEnabled"
                    >
                      浏览器
                    </button>
                    <button
                      class="engine-btn"
                      :class="{ active: speechEngine === 'edge' }"
                      @click="handleSwitchEngine('edge')"
                      :disabled="!speechEnabled || isEdgeLoading"
                    >
                      {{ isEdgeLoading ? "加载中..." : "Edge" }}
                    </button>
                  </div>
                  <div
                    v-if="edgeStatus && speechEngine === 'edge'"
                    class="edge-status"
                    :style="{ color: descColor }"
                  >
                    {{ edgeStatus }}
                  </div>
                  <div
                    v-if="
                      speechEngine === 'edge' && !isEdgeReady && !isEdgeLoading
                    "
                    class="edge-hint"
                    :style="{ color: descColor }"
                  >
                    需要网络连接
                  </div>
                </div>

                <!-- 语速设置 -->
                <div class="setting-row" :class="{ disabled: !speechEnabled }">
                  <div class="setting-info">
                    <span class="setting-label" :style="{ color: textColor }"
                      >语速</span
                    >
                    <span class="setting-value" :style="{ color: descColor }">{{
                      formatPercent(speechRate)
                    }}</span>
                  </div>
                  <input
                    v-model.number="speechRate"
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    :disabled="!speechEnabled"
                  />
                </div>

                <!-- 音调设置 -->
                <div class="setting-row" :class="{ disabled: !speechEnabled }">
                  <div class="setting-info">
                    <span class="setting-label" :style="{ color: textColor }"
                      >音调</span
                    >
                    <span class="setting-value" :style="{ color: descColor }">{{
                      formatPercent(speechPitch)
                    }}</span>
                  </div>
                  <input
                    v-model.number="speechPitch"
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.1"
                    :disabled="!speechEnabled"
                  />
                </div>

                <!-- 音量设置 -->
                <div class="setting-row" :class="{ disabled: !speechEnabled }">
                  <div class="setting-info">
                    <span class="setting-label" :style="{ color: textColor }"
                      >音量</span
                    >
                    <span class="setting-value" :style="{ color: descColor }">{{
                      formatPercent(speechVolume)
                    }}</span>
                  </div>
                  <input
                    v-model.number="speechVolume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    :disabled="!speechEnabled"
                  />
                </div>

                <!-- 测试按钮 -->
                <button
                  class="test-btn"
                  :disabled="!speechEnabled"
                  @click="testSpeech"
                >
                  🎵 测试语音
                </button>
              </div>

              <!-- 提示信息 -->
              <div
                v-if="!speechSupported"
                class="unsupported-tip"
                :style="{ borderColor }"
              >
                <span class="tip-icon">⚠️</span>
                <span class="tip-text" :style="{ color: descColor }"
                  >您的浏览器不支持语音合成功能</span
                >
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  pointer-events: auto !important;
}

.settings-modal {
  width: 320px;
  border-radius: 20px;
  overflow: hidden;
  animation: modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: auto !important;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid v-bind(borderColor);
}

.modal-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: v-bind(textColor);
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: v-bind(descColor);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: v-bind(borderColor);
  color: v-bind(textColor);
}

.modal-content {
  padding: 16px;
}

.settings-section {
  border-radius: 16px;
  padding: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-icon {
  font-size: 18px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: v-bind(textColor);
}

.setting-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.setting-row:last-child {
  margin-bottom: 0;
}

.setting-row.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.setting-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-label {
  font-size: 13px;
  font-weight: 500;
}

.setting-desc {
  font-size: 11px;
}

.setting-value {
  font-size: 12px;
  font-weight: 500;
}

/* 开关按钮 */
.toggle-btn {
  width: 48px;
  height: 26px;
  border-radius: 13px;
  border: none;
  background: #e5e7eb;
  cursor: pointer;
  position: relative;
  transition: background 0.3s ease;
  padding: 0;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toggle-btn.active .toggle-slider {
  transform: translateX(22px);
}

/* 滑块 */
input[type="range"] {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: v-bind(borderColor);
  outline: none;
  -webkit-appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
  transition: transform 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

input[type="range"]:disabled {
  opacity: 0.5;
}

/* 引擎选择 */
.engine-select {
  display: flex;
  gap: 8px;
}

.engine-btn {
  flex: 1;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid v-bind(borderColor);
  background: transparent;
  color: v-bind(textColor);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.engine-btn:hover:not(:disabled) {
  background: v-bind(borderColor);
}

.engine-btn.active {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: white;
  border-color: transparent;
}

.engine-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edge-status,
.edge-hint {
  font-size: 11px;
  text-align: center;
  margin-top: 4px;
}

/* 测试按钮 */
.test-btn {
  width: 100%;
  padding: 10px;
  margin-top: 12px;
  border-radius: 12px;
  border: 1px solid v-bind(borderColor);
  background: transparent;
  color: v-bind(textColor);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.test-btn:hover:not(:disabled) {
  background: v-bind(borderColor);
}

.test-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 不支持提示 */
.unsupported-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  border: 1px dashed;
}

.tip-icon {
  font-size: 16px;
}

.tip-text {
  font-size: 12px;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-pop-enter-active {
  animation: modal-pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-pop-leave-active {
  animation: modal-pop-out 0.15s ease-in;
}

@keyframes modal-pop-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modal-pop-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
</style>
