<script setup lang="ts">
// 宠物行为面板（从 settings/index.vue 拆出）
import { settings } from "../composables/settings";

// 格式化百分比
const formatPercent = (val: number) => `${val}%`;

// 主题色（奶油糖果色系，与设置面板一致）
const primary = "#f5a623";
const accent = "#60a5fa";

defineProps<{
  textColor: string;
  textMuted: string;
}>();
</script>

<template>
  <div class="settings-panel">
    <div class="panel-header">
      <span class="panel-icon">🐾</span>
      <span class="panel-title" :style="{ color: textColor }">宠物行为</span>
    </div>

    <div class="settings-list">
      <!-- 开机自启动 -->
      <div class="setting-item">
        <div class="setting-main">
          <div
            class="setting-icon-wrapper"
            style="--icon-bg: rgba(245, 166, 35, 0.15); --icon-color: #f5a623"
          >
            <span class="setting-icon">🚀</span>
          </div>
          <div class="setting-info">
            <span class="setting-label" :style="{ color: textColor }"
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
            style="--icon-bg: rgba(244, 114, 182, 0.15); --icon-color: #f472b6"
          >
            <span class="setting-icon">📐</span>
          </div>
          <div class="setting-info">
            <span class="setting-label" :style="{ color: textColor }"
              >宠物大小</span
            >
            <span class="setting-value" :style="{ color: primary }">{{
              formatPercent(settings.petSize)
            }}</span>
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
            style="--icon-bg: rgba(96, 165, 250, 0.15); --icon-color: #60a5fa"
          >
            <span class="setting-icon">⚡</span>
          </div>
          <div class="setting-info">
            <span class="setting-label" :style="{ color: textColor }"
              >移动速度</span
            >
            <span class="setting-value" :style="{ color: accent }">{{
              formatPercent(settings.moveSpeed)
            }}</span>
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
            style="--icon-bg: rgba(167, 139, 250, 0.15); --icon-color: #a78bfa"
          >
            <span class="setting-icon">💤</span>
          </div>
          <div class="setting-info">
            <span class="setting-label" :style="{ color: textColor }"
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
</template>
