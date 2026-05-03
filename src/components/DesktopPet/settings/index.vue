<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { isDark } from "../composables/theme";
import {
  settings,
  updateSetting,
  type PetSettings,
} from "../composables/settings";
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

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

// 是否支持语音
const speechSupported = isSpeechSupported();

// 当前激活的设置分类
const activeCategory = ref<
  "behavior" | "appearance" | "voice" | "interaction" | "about"
>("behavior");

// 同步语音设置到本地设置状态
watch(speechEnabled, () => {
  if (settings.value.voiceEnabled !== speechEnabled.value) {
    settings.value.voiceEnabled = speechEnabled.value;
  }
});

// 版本信息
const version = "1.0.0";
const isCheckingUpdate = ref(false);
const hasUpdate = ref(false);

// 动态颜色主题 - 奶油糖果风格
const themeColors = computed(() => ({
  // 主色调 - 温暖的奶油色系
  primary: "#f5a623",
  primaryLight: "#fbd38d",
  primaryDark: "#d97706",
  secondary: "#f472b6",
  secondaryLight: "#f9a8d4",
  accent: "#60a5fa",
  accentLight: "#93c5fd",
  // 背景色
  bgLight: "rgba(255, 253, 248, 0.98)",
  bgDark: "rgba(40, 35, 30, 0.98)",
  // 卡片背景
  cardLight: "rgba(255, 251, 240, 0.8)",
  cardDark: "rgba(50, 45, 40, 0.8)",
  // 文字颜色
  textLight: "#4a4035",
  textDark: "#f5f0e8",
  textMutedLight: "#8b7e6e",
  textMutedDark: "#a89b8a",
  // 边框
  borderLight: "rgba(245, 166, 35, 0.2)",
  borderDark: "rgba(245, 166, 35, 0.15)",
}));

const modalBg = computed(() =>
  isDark.value ? themeColors.value.bgDark : themeColors.value.bgLight,
);

const modalShadow = computed(() =>
  isDark.value
    ? "0 25px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(245, 166, 35, 0.15)"
    : "0 25px 50px rgba(245, 166, 35, 0.15), 0 0 0 1px rgba(245, 166, 35, 0.1)",
);

const textColor = computed(() =>
  isDark.value ? themeColors.value.textDark : themeColors.value.textLight,
);

const textMuted = computed(() =>
  isDark.value
    ? themeColors.value.textMutedDark
    : themeColors.value.textMutedLight,
);

const cardBg = computed(() =>
  isDark.value ? themeColors.value.cardDark : themeColors.value.cardLight,
);

const borderColor = computed(() =>
  isDark.value ? themeColors.value.borderDark : themeColors.value.borderLight,
);

// 分类配置
const categories = [
  { key: "behavior" as const, icon: "🐾", label: "行为", color: "#f5a623" },
  { key: "appearance" as const, icon: "🎨", label: "外观", color: "#f472b6" },
  { key: "voice" as const, icon: "🔊", label: "语音", color: "#60a5fa" },
  { key: "interaction" as const, icon: "✋", label: "交互", color: "#a78bfa" },
  { key: "about" as const, icon: "💝", label: "关于", color: "#34d399" },
];

// 格式化百分比
const formatPercent = (val: number) => `${val}%`;

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

// 检查更新
const checkUpdate = () => {
  isCheckingUpdate.value = true;
  setTimeout(() => {
    isCheckingUpdate.value = false;
    hasUpdate.value = false;
  }, 1500);
};

// 处理主题切换
const handleThemeChange = (theme: PetSettings["theme"]) => {
  updateSetting("theme", theme);
};

// 处理语音开关
const handleVoiceToggle = () => {
  const newValue = !settings.value.voiceEnabled;
  settings.value.voiceEnabled = newValue;
  if (newValue !== speechEnabled.value) {
    toggleSpeech();
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
            <!-- 装饰元素 -->
            <div class="modal-decor">
              <span class="decor-item decor-1">🌟</span>
              <span class="decor-item decor-2">✨</span>
              <span class="decor-item decor-3">🍬</span>
              <span class="decor-item decor-4">🌸</span>
            </div>

            <!-- 头部 -->
            <div class="modal-header">
              <div class="header-title">
                <span class="title-icon">⚙️</span>
                <span class="title-text" :style="{ color: textColor }"
                  >设置</span
                >
              </div>
              <button class="close-btn" @click="closeModal">
                <span class="close-icon">✕</span>
              </button>
            </div>

            <!-- 分类标签栏 -->
            <div class="category-tabs">
              <button
                v-for="cat in categories"
                :key="cat.key"
                class="tab-btn"
                :class="{ active: activeCategory === cat.key }"
                :style="{
                  '--tab-color': cat.color,
                }"
                @click="activeCategory = cat.key"
              >
                <span class="tab-icon">{{ cat.icon }}</span>
                <span class="tab-label">{{ cat.label }}</span>
                <div v-if="activeCategory === cat.key" class="tab-indicator" />
              </button>
            </div>

            <!-- 内容区 -->
            <div class="modal-content">
              <!-- 宠物行为设置 -->
              <div v-if="activeCategory === 'behavior'" class="settings-panel">
                <div class="panel-header">
                  <span class="panel-icon">🐾</span>
                  <span class="panel-title" :style="{ color: textColor }"
                    >宠物行为</span
                  >
                </div>

                <div class="settings-list">
                  <!-- 开机自启动 -->
                  <div class="setting-item">
                    <div class="setting-main">
                      <div
                        class="setting-icon-wrapper"
                        style="
                          --icon-bg: rgba(245, 166, 35, 0.15);
                          --icon-color: #f5a623;
                        "
                      >
                        <span class="setting-icon">🚀</span>
                      </div>
                      <div class="setting-info">
                        <span
                          class="setting-label"
                          :style="{ color: textColor }"
                          >开机自启动</span
                        >
                        <span class="setting-desc" :style="{ color: textMuted }"
                          >系统启动时自动运行宠物</span
                        >
                      </div>
                    </div>
                    <button
                      class="toggle-switch"
                      :class="{ active: settings.autoStart }"
                      @click="settings.autoStart = !settings.autoStart"
                    >
                      <span class="toggle-thumb" />
                    </button>
                  </div>

                  <!-- 宠物大小 -->
                  <div class="setting-item">
                    <div class="setting-main">
                      <div
                        class="setting-icon-wrapper"
                        style="
                          --icon-bg: rgba(244, 114, 182, 0.15);
                          --icon-color: #f472b6;
                        "
                      >
                        <span class="setting-icon">📐</span>
                      </div>
                      <div class="setting-info">
                        <span
                          class="setting-label"
                          :style="{ color: textColor }"
                          >宠物大小</span
                        >
                        <span
                          class="setting-value"
                          :style="{ color: themeColors.primary }"
                          >{{ formatPercent(settings.petSize) }}</span
                        >
                      </div>
                    </div>
                    <div class="slider-wrapper">
                      <input
                        v-model.number="settings.petSize"
                        type="range"
                        min="50"
                        max="150"
                        class="custom-slider"
                      />
                      <div class="slider-marks">
                        <span>小</span>
                        <span>中</span>
                        <span>大</span>
                      </div>
                    </div>
                  </div>

                  <!-- 移动速度 -->
                  <div class="setting-item">
                    <div class="setting-main">
                      <div
                        class="setting-icon-wrapper"
                        style="
                          --icon-bg: rgba(96, 165, 250, 0.15);
                          --icon-color: #60a5fa;
                        "
                      >
                        <span class="setting-icon">⚡</span>
                      </div>
                      <div class="setting-info">
                        <span
                          class="setting-label"
                          :style="{ color: textColor }"
                          >移动速度</span
                        >
                        <span
                          class="setting-value"
                          :style="{ color: themeColors.accent }"
                          >{{ formatPercent(settings.moveSpeed) }}</span
                        >
                      </div>
                    </div>
                    <div class="slider-wrapper">
                      <input
                        v-model.number="settings.moveSpeed"
                        type="range"
                        min="20"
                        max="100"
                        class="custom-slider accent"
                      />
                      <div class="slider-marks">
                        <span>慢</span>
                        <span>中</span>
                        <span>快</span>
                      </div>
                    </div>
                  </div>

                  <!-- 自动睡眠 -->
                  <div class="setting-item">
                    <div class="setting-main">
                      <div
                        class="setting-icon-wrapper"
                        style="
                          --icon-bg: rgba(167, 139, 250, 0.15);
                          --icon-color: #a78bfa;
                        "
                      >
                        <span class="setting-icon">💤</span>
                      </div>
                      <div class="setting-info">
                        <span
                          class="setting-label"
                          :style="{ color: textColor }"
                          >自动睡眠</span
                        >
                        <span class="setting-desc" :style="{ color: textMuted }"
                          >闲置时自动进入睡眠状态</span
                        >
                      </div>
                    </div>
                    <button
                      class="toggle-switch"
                      :class="{ active: settings.autoSleep }"
                      @click="settings.autoSleep = !settings.autoSleep"
                    >
                      <span class="toggle-thumb" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- 外观设置 -->
              <div
                v-if="activeCategory === 'appearance'"
                class="settings-panel"
              >
                <div class="panel-header">
                  <span class="panel-icon">🎨</span>
                  <span class="panel-title" :style="{ color: textColor }"
                    >外观设置</span
                  >
                </div>

                <div class="settings-list">
                  <!-- 主题选择 -->
                  <div class="setting-item vertical">
                    <div class="setting-main">
                      <div
                        class="setting-icon-wrapper"
                        style="
                          --icon-bg: rgba(245, 166, 35, 0.15);
                          --icon-color: #f5a623;
                        "
                      >
                        <span class="setting-icon">🌈</span>
                      </div>
                      <div class="setting-info">
                        <span
                          class="setting-label"
                          :style="{ color: textColor }"
                          >主题模式</span
                        >
                      </div>
                    </div>
                    <div class="theme-selector">
                      <button
                        class="theme-option"
                        :class="{ active: settings.theme === 'system' }"
                        @click="handleThemeChange('system')"
                      >
                        <span class="theme-icon">💻</span>
                        <span class="theme-label">跟随系统</span>
                      </button>
                      <button
                        class="theme-option"
                        :class="{ active: settings.theme === 'light' }"
                        @click="handleThemeChange('light')"
                      >
                        <span class="theme-icon">☀️</span>
                        <span class="theme-label">浅色</span>
                      </button>
                      <button
                        class="theme-option"
                        :class="{ active: settings.theme === 'dark' }"
                        @click="handleThemeChange('dark')"
                      >
                        <span class="theme-icon">🌙</span>
                        <span class="theme-label">深色</span>
                      </button>
                    </div>
                  </div>

                  <!-- 透明度 -->
                  <div class="setting-item">
                    <div class="setting-main">
                      <div
                        class="setting-icon-wrapper"
                        style="
                          --icon-bg: rgba(96, 165, 250, 0.15);
                          --icon-color: #60a5fa;
                        "
                      >
                        <span class="setting-icon">👻</span>
                      </div>
                      <div class="setting-info">
                        <span
                          class="setting-label"
                          :style="{ color: textColor }"
                          >透明度</span
                        >
                        <span
                          class="setting-value"
                          :style="{ color: themeColors.accent }"
                          >{{ formatPercent(settings.opacity) }}</span
                        >
                      </div>
                    </div>
                    <div class="slider-wrapper">
                      <input
                        v-model.number="settings.opacity"
                        type="range"
                        min="30"
                        max="100"
                        class="custom-slider accent"
                      />
                    </div>
                  </div>

                  <!-- 脚印轨迹 -->
                  <div class="setting-item">
                    <div class="setting-main">
                      <div
                        class="setting-icon-wrapper"
                        style="
                          --icon-bg: rgba(244, 114, 182, 0.15);
                          --icon-color: #f472b6;
                        "
                      >
                        <span class="setting-icon">👣</span>
                      </div>
                      <div class="setting-info">
                        <span
                          class="setting-label"
                          :style="{ color: textColor }"
                          >脚印轨迹</span
                        >
                        <span class="setting-desc" :style="{ color: textMuted }"
                          >移动时显示可爱的脚印</span
                        >
                      </div>
                    </div>
                    <button
                      class="toggle-switch pink"
                      :class="{ active: settings.showFootprints }"
                      @click="
                        settings.showFootprints = !settings.showFootprints
                      "
                    >
                      <span class="toggle-thumb" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- 语音设置 -->
              <div v-if="activeCategory === 'voice'" class="settings-panel">
                <div class="panel-header">
                  <span class="panel-icon">🔊</span>
                  <span class="panel-title" :style="{ color: textColor }"
                    >语音设置</span
                  >
                </div>

                <div v-if="speechSupported" class="settings-list">
                  <!-- 语音开关 -->
                  <div class="setting-item">
                    <div class="setting-main">
                      <div
                        class="setting-icon-wrapper"
                        style="
                          --icon-bg: rgba(96, 165, 250, 0.15);
                          --icon-color: #60a5fa;
                        "
                      >
                        <span class="setting-icon">🎵</span>
                      </div>
                      <div class="setting-info">
                        <span
                          class="setting-label"
                          :style="{ color: textColor }"
                          >启用语音</span
                        >
                        <span class="setting-desc" :style="{ color: textMuted }"
                          >宠物说话时播放语音</span
                        >
                      </div>
                    </div>
                    <button
                      class="toggle-switch blue"
                      :class="{ active: settings.voiceEnabled }"
                      @click="handleVoiceToggle"
                    >
                      <span class="toggle-thumb" />
                    </button>
                  </div>

                  <!-- 语音引擎 -->
                  <div
                    class="setting-item vertical"
                    :class="{ disabled: !settings.voiceEnabled }"
                  >
                    <div class="setting-main">
                      <div
                        class="setting-icon-wrapper"
                        style="
                          --icon-bg: rgba(167, 139, 250, 0.15);
                          --icon-color: #a78bfa;
                        "
                      >
                        <span class="setting-icon">🔧</span>
                      </div>
                      <div class="setting-info">
                        <span
                          class="setting-label"
                          :style="{ color: textColor }"
                          >语音引擎</span
                        >
                      </div>
                    </div>
                    <div class="engine-selector">
                      <button
                        class="engine-option"
                        :class="{ active: speechEngine === 'browser' }"
                        :disabled="!settings.voiceEnabled"
                        @click="handleSwitchEngine('browser')"
                      >
                        <span class="engine-name">浏览器内置</span>
                        <span class="engine-desc">免费，无需网络</span>
                      </button>
                      <button
                        class="engine-option"
                        :class="{ active: speechEngine === 'edge' }"
                        :disabled="!settings.voiceEnabled || isEdgeLoading"
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
                  <div
                    class="setting-item"
                    :class="{ disabled: !settings.voiceEnabled }"
                  >
                    <div class="setting-main">
                      <div
                        class="setting-icon-wrapper"
                        style="
                          --icon-bg: rgba(245, 166, 35, 0.15);
                          --icon-color: #f5a623;
                        "
                      >
                        <span class="setting-icon">🔊</span>
                      </div>
                      <div class="setting-info">
                        <span
                          class="setting-label"
                          :style="{ color: textColor }"
                          >音量</span
                        >
                        <span
                          class="setting-value"
                          :style="{ color: themeColors.primary }"
                          >{{ formatPercent(speechVolume * 100) }}</span
                        >
                      </div>
                    </div>
                    <div class="slider-wrapper">
                      <input
                        v-model.number="speechVolume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        :disabled="!settings.voiceEnabled"
                        class="custom-slider"
                      />
                    </div>
                  </div>

                  <!-- 语速 -->
                  <div
                    class="setting-item"
                    :class="{ disabled: !settings.voiceEnabled }"
                  >
                    <div class="setting-main">
                      <div
                        class="setting-icon-wrapper"
                        style="
                          --icon-bg: rgba(52, 211, 153, 0.15);
                          --icon-color: #34d399;
                        "
                      >
                        <span class="setting-icon">🚀</span>
                      </div>
                      <div class="setting-info">
                        <span
                          class="setting-label"
                          :style="{ color: textColor }"
                          >语速</span
                        >
                        <span
                          class="setting-value"
                          :style="{ color: '#34d399' }"
                          >{{ formatPercent(speechRate * 100) }}</span
                        >
                      </div>
                    </div>
                    <div class="slider-wrapper">
                      <input
                        v-model.number="speechRate"
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        :disabled="!settings.voiceEnabled"
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
                    :disabled="!settings.voiceEnabled"
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

              <!-- 交互设置 -->
              <div
                v-if="activeCategory === 'interaction'"
                class="settings-panel"
              >
                <div class="panel-header">
                  <span class="panel-icon">✋</span>
                  <span class="panel-title" :style="{ color: textColor }"
                    >交互设置</span
                  >
                </div>

                <div class="settings-list">
                  <!-- 点击反应 -->
                  <div class="setting-item">
                    <div class="setting-main">
                      <div
                        class="setting-icon-wrapper"
                        style="
                          --icon-bg: rgba(245, 166, 35, 0.15);
                          --icon-color: #f5a623;
                        "
                      >
                        <span class="setting-icon">👆</span>
                      </div>
                      <div class="setting-info">
                        <span
                          class="setting-label"
                          :style="{ color: textColor }"
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
                        style="
                          --icon-bg: rgba(244, 114, 182, 0.15);
                          --icon-color: #f472b6;
                        "
                      >
                        <span class="setting-icon">🎶</span>
                      </div>
                      <div class="setting-info">
                        <span
                          class="setting-label"
                          :style="{ color: textColor }"
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
                </div>
              </div>

              <!-- 关于 -->
              <div v-if="activeCategory === 'about'" class="settings-panel">
                <div class="about-content">
                  <div class="about-logo">
                    <div class="logo-bg">
                      <span class="logo-icon">🐾</span>
                    </div>
                  </div>
                  <h3 class="about-title" :style="{ color: textColor }">
                    桌面宠物
                  </h3>
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
                      href="https://github.com/your-repo/pet"
                      target="_blank"
                      class="about-btn secondary"
                    >
                      <span class="btn-icon">📖</span>
                      <span class="btn-text">开源地址</span>
                    </a>
                  </div>

                  <div class="about-footer" :style="{ color: textMuted }">
                    <span>Made with 💝</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 遮罩层 */
.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  pointer-events: auto !important;
}

/* 弹窗主体 */
.settings-modal {
  width: 400px;
  max-width: 90vw;
  height: 520px;
  max-height: 85vh;
  border-radius: 28px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  pointer-events: auto !important;
}

/* 装饰元素 */
.modal-decor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.decor-item {
  position: absolute;
  font-size: 20px;
  opacity: 0.3;
  animation: float 3s ease-in-out infinite;
}

.decor-1 {
  top: 30px;
  right: 80px;
  animation-delay: 0s;
}

.decor-2 {
  top: 60px;
  right: 40px;
  animation-delay: 0.5s;
}

.decor-3 {
  top: 100px;
  right: 70px;
  animation-delay: 1s;
}

.decor-4 {
  top: 50px;
  right: 100px;
  animation-delay: 1.5s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.2;
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
    opacity: 0.4;
  }
}

/* 头部 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 12px;
  flex-shrink: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 22px;
}

.title-text {
  font-size: 20px;
  font-weight: 700;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: v-bind(borderColor);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-icon {
  font-size: 14px;
  color: v-bind(textMuted);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  transform: rotate(90deg);
}

.close-btn:hover .close-icon {
  color: #ef4444;
}

/* 分类标签栏 */
.category-tabs {
  display: flex;
  gap: 6px;
  padding: 0 20px 12px;
  overflow-x: auto;
  scrollbar-width: none;
  flex-shrink: 0;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  border: none;
  border-radius: 16px;
  background: v-bind(cardBg);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  min-width: 56px;
}

.tab-btn:hover {
  transform: translateY(-2px);
  background: v-bind(borderColor);
}

.tab-btn.active {
  background: var(--tab-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tab-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.tab-btn.active .tab-icon {
  transform: scale(1.1);
}

.tab-label {
  font-size: 11px;
  font-weight: 600;
  color: v-bind(textMuted);
  transition: color 0.3s ease;
}

.tab-btn.active .tab-label {
  color: white;
}

.tab-indicator {
  position: absolute;
  bottom: 6px;
  width: 12px;
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.5);
}

/* 内容区 */
.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
}

.modal-content::-webkit-scrollbar {
  width: 4px;
}

.modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content::-webkit-scrollbar-thumb {
  background: v-bind(borderColor);
  border-radius: 2px;
}

/* 设置面板 */
.settings-panel {
  animation: panel-in 0.3s ease;
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid v-bind(borderColor);
}

.panel-icon {
  font-size: 18px;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
}

/* 设置列表 */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: v-bind(cardBg);
  border-radius: 18px;
  border: 1px solid v-bind(borderColor);
  transition: all 0.2s ease;
}

.setting-item:hover {
  border-color: rgba(245, 166, 35, 0.3);
  box-shadow: 0 2px 8px rgba(245, 166, 35, 0.08);
}

.setting-item.vertical {
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
}

.setting-item.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.setting-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.setting-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--icon-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.setting-icon {
  font-size: 18px;
  color: var(--icon-color);
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-label {
  font-size: 14px;
  font-weight: 600;
}

.setting-desc {
  font-size: 11px;
}

.setting-value {
  font-size: 13px;
  font-weight: 700;
  margin-left: auto;
  margin-right: 12px;
}

/* 开关 */
.toggle-switch {
  width: 52px;
  height: 28px;
  border-radius: 14px;
  border: none;
  background: #e5e7eb;
  cursor: pointer;
  position: relative;
  transition: background 0.3s ease;
  padding: 0;
  flex-shrink: 0;
}

.toggle-switch.active {
  background: linear-gradient(135deg, #f5a623, #fbd38d);
}

.toggle-switch.pink.active {
  background: linear-gradient(135deg, #f472b6, #f9a8d4);
}

.toggle-switch.blue.active {
  background: linear-gradient(135deg, #60a5fa, #93c5fd);
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toggle-switch.active .toggle-thumb {
  transform: translateX(24px);
}

/* 滑块 */
.slider-wrapper {
  width: 100%;
  padding: 0 4px;
}

.custom-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: v-bind(borderColor);
  outline: none;
  -webkit-appearance: none;
  margin: 8px 0;
}

.custom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5a623, #fbd38d);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(245, 166, 35, 0.3);
  transition: transform 0.2s ease;
  border: 2px solid white;
}

.custom-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.custom-slider.accent::-webkit-slider-thumb {
  background: linear-gradient(135deg, #60a5fa, #93c5fd);
  box-shadow: 0 2px 6px rgba(96, 165, 250, 0.3);
}

.custom-slider.green::-webkit-slider-thumb {
  background: linear-gradient(135deg, #34d399, #6ee7b7);
  box-shadow: 0 2px 6px rgba(52, 211, 153, 0.3);
}

.custom-slider:disabled {
  opacity: 0.5;
}

.slider-marks {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: v-bind(textMuted);
  padding: 0 4px;
  margin-top: 2px;
}

/* 主题选择器 */
.theme-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 2px solid v-bind(borderColor);
  border-radius: 14px;
  background: transparent;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.theme-option:hover {
  border-color: rgba(245, 166, 35, 0.4);
  transform: translateY(-2px);
}

.theme-option.active {
  border-color: #f5a623;
  background: rgba(245, 166, 35, 0.08);
}

.theme-icon {
  font-size: 22px;
}

.theme-label {
  font-size: 11px;
  font-weight: 600;
  color: v-bind(textColor);
}

/* 引擎选择器 */
.engine-selector {
  display: flex;
  gap: 10px;
}

.engine-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border: 2px solid v-bind(borderColor);
  border-radius: 14px;
  background: transparent;
  cursor: pointer;
  transition: all 0.25s ease;
}

.engine-option:hover:not(:disabled) {
  border-color: rgba(167, 139, 250, 0.4);
}

.engine-option.active {
  border-color: #a78bfa;
  background: rgba(167, 139, 250, 0.08);
}

.engine-option:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.engine-name {
  font-size: 13px;
  font-weight: 600;
  color: v-bind(textColor);
}

.engine-desc {
  font-size: 10px;
  color: v-bind(textMuted);
}

.engine-status {
  font-size: 11px;
  text-align: center;
  margin-top: 4px;
}

/* 测试语音按钮 */
.test-voice-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  margin-top: 8px;
  border: 2px dashed v-bind(borderColor);
  border-radius: 16px;
  background: transparent;
  cursor: pointer;
  transition: all 0.25s ease;
}

.test-voice-btn:hover:not(:disabled) {
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.05);
}

.test-voice-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.test-voice-btn .btn-icon {
  font-size: 18px;
}

.test-voice-btn .btn-text {
  font-size: 14px;
  font-weight: 600;
  color: v-bind(textColor);
}

/* 不支持提示 */
.unsupported-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  border-radius: 16px;
  border: 2px dashed;
}

.tip-icon {
  font-size: 18px;
}

.tip-text {
  font-size: 13px;
}

/* 关于页面 */
.about-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  text-align: center;
}

.about-logo {
  margin-bottom: 16px;
}

.logo-bg {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, #f5a623, #f472b6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(245, 166, 35, 0.3);
  animation: logo-pulse 2s ease-in-out infinite;
}

@keyframes logo-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 8px 24px rgba(245, 166, 35, 0.3);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 12px 32px rgba(245, 166, 35, 0.4);
  }
}

.logo-icon {
  font-size: 40px;
}

.about-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.about-version {
  font-size: 13px;
  margin-bottom: 12px;
}

.about-desc {
  font-size: 12px;
  line-height: 1.6;
  max-width: 260px;
  margin-bottom: 24px;
}

.about-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.about-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #f5a623, #fbd38d);
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  text-decoration: none;
}

.about-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 166, 35, 0.3);
}

.about-btn.secondary {
  background: v-bind(cardBg);
  color: v-bind(textColor);
  border: 1px solid v-bind(borderColor);
}

.about-btn.secondary:hover {
  background: v-bind(borderColor);
  box-shadow: none;
}

.about-btn.checking {
  opacity: 0.7;
  cursor: wait;
}

.about-btn .btn-icon {
  font-size: 14px;
}

.about-footer {
  font-size: 12px;
  opacity: 0.7;
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
  animation: modal-pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-pop-leave-active {
  animation: modal-pop-out 0.2s ease-in;
}

@keyframes modal-pop-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
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
