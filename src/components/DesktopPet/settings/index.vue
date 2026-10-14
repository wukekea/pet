<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { isDark } from "../composables/theme";
import BaseModal from "../ui/BaseModal.vue";
import AboutPanel from "./AboutPanel.vue";
import BehaviorPanel from "./BehaviorPanel.vue";
import AppearancePanel from "./AppearancePanel.vue";
import VoicePanel from "./VoicePanel.vue";
import InteractionPanel from "./InteractionPanel.vue";
import ApiPanel from "./ApiPanel.vue";
import { initVersion } from "./useAutoUpdate";

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

// 当前激活的设置分类
const activeCategory = ref<
  "behavior" | "appearance" | "voice" | "interaction" | "api" | "about"
>("behavior");

// 监听分类切换，懒加载版本信息
watch(activeCategory, (category) => {
  if (category === "about") {
    initVersion();
  }
});

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

// BaseModal 的主题 CSS 变量（overlay/modal/close 底盘 + 面板共享样式变量）
const settingsCssVars = computed(() => ({
  "--overlay-bg": "rgba(0, 0, 0, 0.4)",
  "--modal-bg": modalBg.value,
  "--modal-shadow": modalShadow.value,
  "--modal-close-bg": borderColor.value,
  "--modal-close-color": textMuted.value,
  // shared.css 的主题变量（原 style 区 v-bind 值）
  "--settings-card-bg": cardBg.value,
  "--settings-modal-bg": modalBg.value,
  "--settings-border-color": borderColor.value,
  "--settings-text-color": textColor.value,
  "--settings-text-muted": textMuted.value,
  "--settings-input-bg": isDark.value
    ? "rgba(0, 0, 0, 0.2)"
    : "rgba(255, 255, 255, 0.9)",
}));

// 分类配置
const categories = [
  { key: "behavior" as const, icon: "🐾", label: "行为", color: "#f5a623" },
  { key: "appearance" as const, icon: "🎨", label: "外观", color: "#f472b6" },
  { key: "voice" as const, icon: "🔊", label: "语音", color: "#60a5fa" },
  { key: "interaction" as const, icon: "✋", label: "交互", color: "#a78bfa" },
  { key: "api" as const, icon: "🔑", label: "API", color: "#f87171" },
  { key: "about" as const, icon: "💝", label: "关于", color: "#34d399" },
];

// 关闭弹窗
const closeModal = () => {
  emit("close");
};
</script>

<template>
  <BaseModal
    :visible="visible"
    title="设置"
    icon="⚙️"
    :decor-emojis="['🌟', '✨', '🍬', '🌸']"
    :width="400"
    :height="520"
    :border-radius="28"
    :css-vars="settingsCssVars"
    @close="closeModal"
  >
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
      <BehaviorPanel
        v-if="activeCategory === 'behavior'"
        :text-color="textColor"
        :text-muted="textMuted"
      />

      <!-- 外观设置 -->
      <AppearancePanel
        v-if="activeCategory === 'appearance'"
        :text-color="textColor"
        :text-muted="textMuted"
      />

      <!-- 语音设置 -->
      <VoicePanel
        v-if="activeCategory === 'voice'"
        :text-color="textColor"
        :text-muted="textMuted"
        :border-color="borderColor"
      />

      <!-- 交互设置 -->
      <InteractionPanel
        v-if="activeCategory === 'interaction'"
        :text-color="textColor"
        :text-muted="textMuted"
        :border-color="borderColor"
        :card-bg="cardBg"
      />

      <!-- API 配置 -->
      <ApiPanel
        v-if="activeCategory === 'api'"
        :visible="visible"
        :text-color="textColor"
        :text-muted="textMuted"
        :border-color="borderColor"
      />

      <!-- 关于 -->
      <AboutPanel
        v-if="activeCategory === 'about'"
        class="settings-panel"
        :text-color="textColor"
        :text-muted="textMuted"
        :card-bg="cardBg"
        :border-color="borderColor"
      />
    </div>
  </BaseModal>
</template>

<style>
/* 设置面板共享样式（全局引入一次，各分类面板组件直接复用类名） */
@import "./shared.css";
</style>
