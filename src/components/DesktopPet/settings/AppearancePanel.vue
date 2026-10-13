<script setup lang="ts">
// 外观设置面板（从 settings/index.vue 拆出）
import {
  settings,
  updateSetting,
  type PetSettings,
} from "../composables/settings";

// 格式化百分比
const formatPercent = (val: number) => `${val}%`;

// 主题色
const accent = "#60a5fa";

// 处理主题切换
const handleThemeChange = (theme: PetSettings["theme"]) => {
  updateSetting("theme", theme);
};

defineProps<{
  textColor: string;
  textMuted: string;
}>();
</script>

<template>
  <div class="settings-panel">
    <div class="panel-header">
      <span class="panel-icon">🎨</span>
      <span class="panel-title" :style="{ color: textColor }">外观设置</span>
    </div>

    <div class="settings-list">
      <!-- 主题选择 -->
      <div class="setting-item vertical">
        <div class="setting-main">
          <div
            class="setting-icon-wrapper"
            style="--icon-bg: rgba(245, 166, 35, 0.15); --icon-color: #f5a623"
          >
            <span class="setting-icon">🌈</span>
          </div>
          <div class="setting-info">
            <span class="setting-label" :style="{ color: textColor }"
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
            style="--icon-bg: rgba(96, 165, 250, 0.15); --icon-color: #60a5fa"
          >
            <span class="setting-icon">👻</span>
          </div>
          <div class="setting-info">
            <span class="setting-label" :style="{ color: textColor }"
              >透明度</span
            >
            <span class="setting-value" :style="{ color: accent }">{{
              formatPercent(settings.opacity)
            }}</span>
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
            style="--icon-bg: rgba(244, 114, 182, 0.15); --icon-color: #f472b6"
          >
            <span class="setting-icon">👣</span>
          </div>
          <div class="setting-info">
            <span class="setting-label" :style="{ color: textColor }"
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
          @click="settings.showFootprints = !settings.showFootprints"
        >
          <span class="toggle-thumb" />
        </button>
      </div>
    </div>
  </div>
</template>
