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
import {
  speechInputEnabled,
  speechInputStatus,
  isSpeechInputReady,
  isCheckingStatus,
  toggleSpeechInput,
  checkSpeechInputDependencies,
} from "../composables/speechInputSettings";

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
  "behavior" | "appearance" | "voice" | "interaction" | "api" | "about"
>("behavior");

// 同步语音设置到本地设置状态
watch(speechEnabled, () => {
  if (settings.value.voiceEnabled !== speechEnabled.value) {
    settings.value.voiceEnabled = speechEnabled.value;
  }
});

// 监听分类切换，懒加载版本信息
watch(activeCategory, (category) => {
  if (category === "about") {
    initVersion();
  }
});

// 版本信息
const version = ref("1.0.0");
const isCheckingUpdate = ref(false);
const hasUpdate = ref(false);

// 更新状态
const isDownloading = ref(false);
const downloadProgress = ref(0);
const updateDownloaded = ref(false);
const updateError = ref("");

// 更新信息类型
interface UpdateInfo {
  success: boolean;
  currentVersion: string;
  latestVersion?: string;
  hasUpdate?: boolean;
  releaseUrl?: string;
  releaseNotes?: string;
  publishedAt?: string;
  message?: string;
}

const updateInfo = ref<UpdateInfo | null>(null);

// electronAPI 类型断言
const electronAPI = window.electronAPI as {
  getVersion?: () => Promise<string>;
  checkUpdate?: () => Promise<UpdateInfo>;
  checkForUpdates?: () => Promise<UpdateInfo>;
  downloadUpdate?: () => Promise<{ success: boolean; message?: string }>;
  installUpdate?: () => void;
  onUpdateAvailable?: (callback: (info: any) => void) => () => void;
  onUpdateNotAvailable?: (callback: () => void) => () => void;
  onUpdateDownloadProgress?: (
    callback: (progress: { percent: number }) => void,
  ) => () => void;
  onUpdateDownloaded?: (callback: (info: any) => void) => () => void;
  onUpdateError?: (callback: (message: string) => void) => () => void;
};

// 版本初始化标记
let versionInitialized = false;

// 初始化获取版本号（懒加载，在需要时调用）
const initVersion = async () => {
  if (versionInitialized || !electronAPI.getVersion) return;
  versionInitialized = true;
  version.value = await electronAPI.getVersion();
};

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
  { key: "api" as const, icon: "🔑", label: "API", color: "#f87171" },
  { key: "about" as const, icon: "💝", label: "关于", color: "#34d399" },
];

// AI 请求格式选项
const aiFormats = [
  { key: "openai" as const, label: "OpenAI", desc: "GPT 系列 / 兼容格式" },
  { key: "anthropic" as const, label: "Anthropic", desc: "Claude 系列" },
  { key: "gemini" as const, label: "Gemini", desc: "Google Gemini" },
  { key: "custom" as const, label: "自定义", desc: "其他格式" },
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
const checkUpdate = async () => {
  // 重置状态
  isCheckingUpdate.value = true;
  updateInfo.value = null;
  updateError.value = "";
  hasUpdate.value = false;
  updateDownloaded.value = false;

  // 优先使用 electron-updater
  if (electronAPI.checkForUpdates) {
    try {
      const result = await electronAPI.checkForUpdates();
      if (result.success) {
        hasUpdate.value = result.hasUpdate ?? false;
        updateInfo.value = result;
      } else {
        // 检查失败，显示错误信息
        let errorMsg = result.message || "检查更新失败";
        // 友好化错误信息
        if (
          errorMsg.includes("cannot find latest") ||
          errorMsg.includes("404") ||
          errorMsg.includes("cannot parse release feed")
        ) {
          errorMsg = "暂无可用更新";
        } else if (
          errorMsg.includes("network") ||
          errorMsg.includes("ENOTFOUND")
        ) {
          errorMsg = "网络连接失败，请检查网络";
        }
        updateError.value = errorMsg;
        // 设置一个空的 updateInfo 显示当前版本
        if (result.currentVersion) {
          updateInfo.value = {
            success: false,
            currentVersion: result.currentVersion,
            hasUpdate: false,
          };
        }
      }
    } catch (error: any) {
      console.error("检查更新出错:", error);
      let errorMsg = error.message || "检查更新出错";
      // 友好化错误信息
      if (
        errorMsg.includes("cannot find latest") ||
        errorMsg.includes("404") ||
        errorMsg.includes("cannot parse release feed")
      ) {
        errorMsg = "暂无可用更新";
      } else if (
        errorMsg.includes("network") ||
        errorMsg.includes("ENOTFOUND")
      ) {
        errorMsg = "网络连接失败，请检查网络";
      }
      updateError.value = errorMsg;
    } finally {
      isCheckingUpdate.value = false;
    }
    return;
  }

  // 备用方案：使用 GitHub API
  if (!electronAPI.checkUpdate) {
    isCheckingUpdate.value = false;
    updateError.value = "检查更新功能仅在打包后的应用中可用";
    return;
  }

  try {
    const result = await electronAPI.checkUpdate();
    if (result.success) {
      hasUpdate.value = result.hasUpdate ?? false;
      updateInfo.value = result;
    } else {
      console.error("检查更新失败:", result.message);
      updateError.value = result.message || "检查更新失败";
    }
  } catch (error: any) {
    console.error("检查更新出错:", error);
    updateError.value = error.message || "检查更新出错";
  } finally {
    isCheckingUpdate.value = false;
  }
};

// 下载更新
const downloadUpdate = async () => {
  if (!electronAPI.downloadUpdate) return;

  isDownloading.value = true;
  downloadProgress.value = 0;
  updateError.value = "";

  try {
    const result = await electronAPI.downloadUpdate();
    if (!result.success) {
      updateError.value = result.message || "下载失败";
    }
  } catch (error: any) {
    console.error("下载更新出错:", error);
    updateError.value = error.message || "下载出错";
  } finally {
    isDownloading.value = false;
  }
};

// 安装更新
const installUpdate = () => {
  if (electronAPI.installUpdate) {
    electronAPI.installUpdate();
  }
};

// 监听下载进度
if (electronAPI.onUpdateDownloadProgress) {
  electronAPI.onUpdateDownloadProgress((progress) => {
    downloadProgress.value = progress.percent;
  });
}

// 监听下载完成
if (electronAPI.onUpdateDownloaded) {
  electronAPI.onUpdateDownloaded(() => {
    updateDownloaded.value = true;
    isDownloading.value = false;
  });
}

// 监听更新错误
if (electronAPI.onUpdateError) {
  electronAPI.onUpdateError((message) => {
    updateError.value = message;
    isDownloading.value = false;
  });
}

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

// 语音输入
const handleSpeechInputToggle = async () => {
  const enabled = await toggleSpeechInput();
  if (!enabled && !isSpeechInputReady.value) {
    // 依赖未就绪，展开依赖列表提示用户
    await checkSpeechInputDependencies();
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

                  <!-- 分隔线 -->
                  <div class="settings-divider" :style="{ borderColor }"></div>

                  <!-- 语音输入设置 -->
                  <div class="speech-input-section">
                    <div class="setting-item">
                      <div class="setting-main">
                        <div
                          class="setting-icon-wrapper"
                          style="
                            --icon-bg: rgba(139, 92, 246, 0.15);
                            --icon-color: #8b5cf6;
                          "
                        >
                          <span class="setting-icon">🎙️</span>
                        </div>
                        <div class="setting-info">
                          <span
                            class="setting-label"
                            :style="{ color: textColor }"
                            >语音输入</span
                          >
                          <span
                            class="setting-desc"
                            :style="{ color: textMuted }"
                            >在 AI 对话中使用语音输入文字</span
                          >
                        </div>
                      </div>
                      <div class="setting-status">
                        <span
                          v-if="isSpeechInputReady"
                          class="status-badge ready"
                          >已就绪</span
                        >
                        <span v-else class="status-badge not-ready"
                          >未就绪</span
                        >
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
                          <span
                            class="refresh-icon"
                            :class="{ spinning: isCheckingStatus }"
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
                              <span
                                class="dep-name"
                                :style="{ color: textColor }"
                                >{{ dep.name }}</span
                              >
                              <span
                                class="dep-desc"
                                :style="{ color: textMuted }"
                                >{{ dep.desc }}</span
                              >
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
                      :style="{ color: themeColors.primary }"
                    >
                      <span class="ready-icon">✨</span>
                      <span class="ready-text"
                        >语音输入已启用，在 AI 对话中点击麦克风即可使用</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- API 配置 -->
              <div v-if="activeCategory === 'api'" class="settings-panel">
                <div class="panel-header">
                  <span class="panel-icon">🔑</span>
                  <span class="panel-title" :style="{ color: textColor }"
                    >API 配置</span
                  >
                </div>

                <div class="settings-list">
                  <!-- 和风天气配置 -->
                  <div class="api-section">
                    <div class="api-section-header">
                      <div
                        class="setting-icon-wrapper"
                        style="
                          --icon-bg: rgba(96, 165, 250, 0.15);
                          --icon-color: #60a5fa;
                        "
                      >
                        <span class="setting-icon">🌤️</span>
                      </div>
                      <div class="api-section-title">
                        <span
                          class="setting-label"
                          :style="{ color: textColor }"
                          >和风天气</span
                        >
                        <span class="setting-desc" :style="{ color: textMuted }"
                          >用于获取实时天气信息</span
                        >
                      </div>
                    </div>
                    <div class="api-input-group">
                      <div class="input-row">
                        <label :style="{ color: textMuted }">API Key</label>
                        <input
                          v-model="settings.apiConfig.qweather.key"
                          type="password"
                          placeholder="请输入 API Key"
                          class="api-key-input"
                        />
                      </div>
                      <div class="input-row">
                        <label :style="{ color: textMuted }">API Host</label>
                        <input
                          v-model="settings.apiConfig.qweather.host"
                          type="text"
                          placeholder="https://devapi.qweather.com"
                          class="api-key-input"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- 高德地图配置 -->
                  <div class="api-section">
                    <div class="api-section-header">
                      <div
                        class="setting-icon-wrapper"
                        style="
                          --icon-bg: rgba(52, 211, 153, 0.15);
                          --icon-color: #34d399;
                        "
                      >
                        <span class="setting-icon">📍</span>
                      </div>
                      <div class="api-section-title">
                        <span
                          class="setting-label"
                          :style="{ color: textColor }"
                          >高德地图</span
                        >
                        <span class="setting-desc" :style="{ color: textMuted }"
                          >用于获取位置信息</span
                        >
                      </div>
                    </div>
                    <div class="api-input-group">
                      <div class="input-row">
                        <label :style="{ color: textMuted }">API Key</label>
                        <input
                          v-model="settings.apiConfig.amap.key"
                          type="password"
                          placeholder="请输入 API Key"
                          class="api-key-input"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- AI 对话配置 -->
                  <div class="api-section">
                    <div class="api-section-header">
                      <div
                        class="setting-icon-wrapper"
                        style="
                          --icon-bg: rgba(167, 139, 250, 0.15);
                          --icon-color: #a78bfa;
                        "
                      >
                        <span class="setting-icon">🤖</span>
                      </div>
                      <div class="api-section-title">
                        <span
                          class="setting-label"
                          :style="{ color: textColor }"
                          >AI 对话</span
                        >
                        <span class="setting-desc" :style="{ color: textMuted }"
                          >用于 AI 聊天功能</span
                        >
                      </div>
                    </div>
                    <div class="api-input-group">
                      <div class="input-row">
                        <label :style="{ color: textMuted }">请求格式</label>
                        <div class="format-selector">
                          <button
                            v-for="fmt in aiFormats"
                            :key="fmt.key"
                            class="format-option"
                            :class="{
                              active: settings.apiConfig.ai.format === fmt.key,
                            }"
                            @click="settings.apiConfig.ai.format = fmt.key"
                          >
                            <span class="format-name">{{ fmt.label }}</span>
                            <span class="format-desc">{{ fmt.desc }}</span>
                          </button>
                        </div>
                      </div>
                      <div class="input-row">
                        <label :style="{ color: textMuted }">API URL</label>
                        <input
                          v-model="settings.apiConfig.ai.url"
                          type="text"
                          placeholder="https://api.example.com/v1/chat/completions"
                          class="api-key-input"
                        />
                      </div>
                      <div class="input-row">
                        <label :style="{ color: textMuted }">API Key</label>
                        <input
                          v-model="settings.apiConfig.ai.key"
                          type="password"
                          placeholder="请输入 API Key"
                          class="api-key-input"
                        />
                      </div>
                      <div class="input-row">
                        <label :style="{ color: textMuted }">模型名称</label>
                        <input
                          v-model="settings.apiConfig.ai.model"
                          type="text"
                          placeholder="如: gpt-3.5-turbo, claude-3-sonnet"
                          class="api-key-input"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- 提示信息 -->
                  <div class="api-tip" :style="{ borderColor }">
                    <span class="tip-icon">💡</span>
                    <span class="tip-text" :style="{ color: textMuted }"
                      >API 配置仅存储在本地，不会上传到服务器</span
                    >
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
                        <span
                          class="progress-text"
                          :style="{ color: textMuted }"
                        >
                          下载中... {{ downloadProgress.toFixed(1) }}%
                        </span>
                      </div>
                    </div>

                    <!-- 下载完成，等待安装 -->
                    <div v-else-if="updateDownloaded" class="update-ready">
                      <span class="update-icon">✅</span>
                      <div class="update-details">
                        <span class="update-title" :style="{ color: textColor }"
                          >更新已就绪</span
                        >
                        <span
                          class="update-current"
                          :style="{ color: textMuted }"
                          >点击下方按钮重启并安装</span
                        >
                      </div>
                      <button class="install-btn" @click="installUpdate">
                        <span class="btn-icon">🔄</span>
                        <span class="btn-text">重启安装</span>
                      </button>
                    </div>

                    <!-- 发现新版本 -->
                    <div
                      v-else-if="hasUpdate && updateInfo"
                      class="update-available"
                    >
                      <span class="update-icon">🎉</span>
                      <div class="update-details">
                        <span class="update-title" :style="{ color: textColor }"
                          >发现新版本 v{{ updateInfo.latestVersion }}</span
                        >
                        <span
                          class="update-current"
                          :style="{ color: textMuted }"
                          >当前版本 v{{ updateInfo.currentVersion }}</span
                        >
                      </div>
                      <button class="download-btn" @click="downloadUpdate">
                        <span class="btn-icon">⬇️</span>
                        <span class="btn-text">立即下载</span>
                      </button>
                    </div>

                    <!-- 已是最新版本 -->
                    <div
                      v-else-if="updateInfo && !hasUpdate"
                      class="update-latest"
                    >
                      <span class="update-icon">✅</span>
                      <span class="update-message" :style="{ color: textMuted }"
                        >已是最新版本 v{{ updateInfo.currentVersion }}</span
                      >
                    </div>

                    <!-- 只有错误，没有更新信息 -->
                    <div
                      v-else-if="!updateInfo && updateError"
                      class="update-error-only"
                    >
                      <span class="error-icon">⚠️</span>
                      <span class="error-text">{{ updateError }}</span>
                    </div>

                    <!-- 错误信息（附加在更新信息后面） -->
                    <div v-if="updateError && updateInfo" class="update-error">
                      <span class="error-icon">⚠️</span>
                      <span class="error-text">{{ updateError }}</span>
                    </div>
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
  height: 4px;
  border-radius: 2px;
  background: rgba(245, 166, 35, 0.3);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  margin: 8px 0;
  cursor: pointer;
}

.custom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5a623, #fbd38d);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(245, 166, 35, 0.3);
  transition: transform 0.2s ease;
  border: 2px solid white;
  margin-top: -8px;
}

/* Firefox 滑块 */
.custom-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5a623, #fbd38d);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(245, 166, 35, 0.3);
  transition: transform 0.2s ease;
  border: 2px solid white;
}

/* 默认颜色轨道 - 必须放在 accent 和 green 之前 */
.custom-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(245, 166, 35, 0.3);
}

.custom-slider::-moz-range-track {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: rgba(245, 166, 35, 0.3);
  border: none;
}

.custom-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

/* accent 颜色滑块和轨道 */
.custom-slider.accent::-webkit-slider-thumb {
  background: linear-gradient(135deg, #60a5fa, #93c5fd);
  box-shadow: 0 2px 6px rgba(96, 165, 250, 0.3);
}

.custom-slider.accent::-webkit-slider-runnable-track {
  background: rgba(96, 165, 250, 0.3);
}

.custom-slider.accent::-moz-range-track {
  background: rgba(96, 165, 250, 0.3);
}

/* green 颜色滑块和轨道 */
.custom-slider.green::-webkit-slider-thumb {
  background: linear-gradient(135deg, #34d399, #6ee7b7);
  box-shadow: 0 2px 6px rgba(52, 211, 153, 0.3);
}

.custom-slider.green::-webkit-slider-runnable-track {
  background: rgba(52, 211, 153, 0.3);
}

.custom-slider.green::-moz-range-track {
  background: rgba(52, 211, 153, 0.3);
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

/* 更新信息样式 */
.update-info {
  width: 100%;
  max-width: 280px;
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 14px;
  background: v-bind(cardBg);
  border: 2px solid v-bind(borderColor);
  animation: update-in 0.3s ease;
}

@keyframes update-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.update-info.has-update {
  border-color: rgba(52, 211, 153, 0.5);
  background: linear-gradient(
    135deg,
    rgba(52, 211, 153, 0.1),
    rgba(52, 211, 153, 0.05)
  );
}

.update-available {
  display: flex;
  align-items: center;
  gap: 12px;
}

.update-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.update-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  text-align: left;
}

.update-title {
  font-size: 14px;
  font-weight: 600;
}

.update-current {
  font-size: 11px;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, #34d399, #6ee7b7);
  color: white;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
}

.download-btn .btn-icon {
  font-size: 12px;
}

.update-latest {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.update-message {
  font-size: 13px;
}

/* 下载进度样式 */
.update-downloading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.download-progress {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(52, 211, 153, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #34d399, #6ee7b7);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  text-align: center;
}

/* 更新就绪样式 */
.update-ready {
  display: flex;
  align-items: center;
  gap: 12px;
}

.install-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f5a623, #fbd38d);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.install-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 166, 35, 0.3);
}

.install-btn .btn-icon {
  font-size: 12px;
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

.update-info.has-error {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

/* API Key 输入框 */
.input-wrapper {
  width: 100%;
  padding: 0 4px;
}

.api-key-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(150, 150, 150, 0.4);
  border-radius: 12px;
  background: v-bind(isDark ? "rgba(0, 0, 0, 0.2)": "rgba(255, 255, 255, 0.9)");
  color: v-bind(textColor);
  font-size: 13px;
  font-family: monospace;
  transition: all 0.2s ease;
  outline: none;
}

.api-key-input::placeholder {
  color: v-bind(textMuted);
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

.api-key-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
  background: v-bind(modalBg);
}

/* 不同卡片区域的输入框边框颜色 */
.api-section:nth-child(1) .api-key-input {
  border-color: rgba(96, 165, 250, 0.4);
}

.api-section:nth-child(1) .api-key-input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.api-section:nth-child(2) .api-key-input {
  border-color: rgba(52, 211, 153, 0.4);
}

.api-section:nth-child(2) .api-key-input:focus {
  border-color: #34d399;
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.2);
}

.api-section:nth-child(3) .api-key-input {
  border-color: rgba(167, 139, 250, 0.4);
}

.api-section:nth-child(3) .api-key-input:focus {
  border-color: #a78bfa;
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.2);
}

/* API 配置区域 */
.api-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: v-bind(cardBg);
  border-radius: 18px;
  border: 2px solid;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

/* 和风天气区块 - 蓝色边框 */
.api-section:nth-child(1) {
  border-color: rgba(96, 165, 250, 0.5);
}

.api-section:nth-child(1):hover {
  border-color: rgba(96, 165, 250, 0.8);
  box-shadow: 0 4px 12px rgba(96, 165, 250, 0.15);
}

/* 高德地图区块 - 绿色边框 */
.api-section:nth-child(2) {
  border-color: rgba(52, 211, 153, 0.5);
}

.api-section:nth-child(2):hover {
  border-color: rgba(52, 211, 153, 0.8);
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.15);
}

/* AI 对话区块 - 紫色边框 */
.api-section:nth-child(3) {
  border-color: rgba(167, 139, 250, 0.5);
}

.api-section:nth-child(3):hover {
  border-color: rgba(167, 139, 250, 0.8);
  box-shadow: 0 4px 12px rgba(167, 139, 250, 0.15);
}

.api-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.api-section-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.api-input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-row label {
  font-size: 12px;
  font-weight: 500;
  margin-left: 4px;
}

/* 请求格式选择器 */
.format-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.format-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border: 2px solid v-bind(borderColor);
  border-radius: 12px;
  background: v-bind(cardBg);
  cursor: pointer;
  transition: all 0.25s ease;
}

.format-option:hover {
  border-color: rgba(167, 139, 250, 0.4);
  transform: translateY(-1px);
}

.format-option.active {
  border-color: #a78bfa;
  background: rgba(167, 139, 250, 0.1);
}

.format-name {
  font-size: 13px;
  font-weight: 600;
  color: v-bind(textColor);
}

.format-desc {
  font-size: 10px;
  color: v-bind(textMuted);
}

/* API 提示信息 */
.api-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-radius: 16px;
  border: 2px dashed;
  margin-top: 8px;
}

.api-tip .tip-icon {
  font-size: 16px;
}

.api-tip .tip-text {
  font-size: 12px;
}

/* 语音输入设置 */
.settings-divider {
  height: 1px;
  margin: 16px 0;
  border: none;
  background: v-bind(borderColor);
}

.setting-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge.ready {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
}

.status-badge.not-ready {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
}

.toggle-switch.purple.active {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

/* 语音输入设置样式 */
.speech-input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: v-bind(cardBg);
  border-radius: 20px;
  border: 2px solid v-bind(borderColor);
  transition: all 0.3s ease;
}

.speech-input-section:hover {
  border-color: rgba(139, 92, 246, 0.3);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.08);
}

.speech-input-section .setting-item {
  background: transparent;
  border: none;
  padding: 0;
}

.dependencies-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
  border: 1px dashed v-bind(borderColor);
  background: v-bind(modalBg);
}

.panel-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
}

.panel-icon-small {
  font-size: 16px;
}

.dependency-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dependency-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: v-bind(cardBg);
  border: 1px solid v-bind(borderColor);
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dependency-item:hover {
  transform: translateX(4px);
  border-color: rgba(139, 92, 246, 0.3);
}

.dependency-item.installed {
  opacity: 0.6;
  background: rgba(52, 211, 153, 0.08);
  border-color: rgba(52, 211, 153, 0.2);
}

.dep-status {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  transition: all 0.3s ease;
}

.dependency-item.installed .dep-status {
  background: rgba(52, 211, 153, 0.15);
}

.status-icon {
  font-size: 13px;
}

.dep-info {
  flex: 1;
}

.dep-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dep-name {
  font-size: 13px;
  font-weight: 600;
}

.dep-desc {
  font-size: 11px;
}

.ready-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 14px;
  background: linear-gradient(
    135deg,
    rgba(52, 211, 153, 0.1),
    rgba(52, 211, 153, 0.05)
  );
  border: 1px solid rgba(52, 211, 153, 0.2);
  font-size: 13px;
  font-weight: 500;
}

.ready-icon {
  font-size: 16px;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.help-text {
  font-size: 11px;
  line-height: 1.6;
  text-align: center;
}

.help-text p {
  margin: 4px 0;
}

.ready-tip {
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(52, 211, 153, 0.1);
  font-size: 12px;
  text-align: center;
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
