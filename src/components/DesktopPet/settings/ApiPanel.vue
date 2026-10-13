<script setup lang="ts">
// API 配置面板（从 settings/index.vue 拆出）
import {
  loadApiConfig,
  saveApiConfig,
  type ApiConfig,
} from "../composables/settings";
import { ref, watch } from "vue";

// AI 请求格式选项
const aiFormats = [
  { key: "openai" as const, label: "OpenAI", desc: "GPT 系列 / 兼容格式" },
  { key: "weibo" as const, label: "微博代理", desc: "微博 aigc 代理格式" },
];

// API 配置（从真实存储加载，保存时写回真实存储）
const apiConfig = ref<ApiConfig>(loadApiConfig());

// 保存 API 配置
const saveApi = () => {
  saveApiConfig(apiConfig.value);
  apiSaveSuccess.value = true;
  setTimeout(() => (apiSaveSuccess.value = false), 2000);
};

// 保存成功提示
const apiSaveSuccess = ref(false);

const props = defineProps<{
  visible: boolean;
  textColor: string;
  textMuted: string;
  borderColor: string;
}>();

// 每次打开设置弹窗时重新加载，避免显示过期快照
// （用户可能在 ChatPanel 齿轮面板改过 AI 配置）
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      apiConfig.value = loadApiConfig();
    }
  },
);
</script>

<template>
  <div class="settings-panel">
    <div class="panel-header">
      <span class="panel-icon">🔑</span>
      <span class="panel-title" :style="{ color: textColor }">API 配置</span>
    </div>

    <div class="settings-list">
      <!-- 和风天气配置 -->
      <div class="api-section">
        <div class="api-section-header">
          <div
            class="setting-icon-wrapper"
            style="--icon-bg: rgba(96, 165, 250, 0.15); --icon-color: #60a5fa"
          >
            <span class="setting-icon">🌤️</span>
          </div>
          <div class="api-section-title">
            <span class="setting-label" :style="{ color: textColor }"
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
              v-model="apiConfig.qweather.key"
              type="password"
              placeholder="请输入 API Key"
              class="api-key-input"
            />
          </div>
          <div class="input-row">
            <label :style="{ color: textMuted }">API Host</label>
            <input
              v-model="apiConfig.qweather.host"
              type="text"
              placeholder="devapi.qweather.com"
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
            style="--icon-bg: rgba(52, 211, 153, 0.15); --icon-color: #34d399"
          >
            <span class="setting-icon">📍</span>
          </div>
          <div class="api-section-title">
            <span class="setting-label" :style="{ color: textColor }"
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
              v-model="apiConfig.amap.key"
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
            style="--icon-bg: rgba(167, 139, 250, 0.15); --icon-color: #a78bfa"
          >
            <span class="setting-icon">🤖</span>
          </div>
          <div class="api-section-title">
            <span class="setting-label" :style="{ color: textColor }"
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
                  active: apiConfig.ai.format === fmt.key,
                }"
                @click="apiConfig.ai.format = fmt.key"
              >
                <span class="format-name">{{ fmt.label }}</span>
                <span class="format-desc">{{ fmt.desc }}</span>
              </button>
            </div>
          </div>
          <div class="input-row">
            <label :style="{ color: textMuted }">API URL</label>
            <input
              v-model="apiConfig.ai.url"
              type="text"
              placeholder="https://api.openai.com/v1/chat/completions"
              class="api-key-input"
            />
          </div>
          <div class="input-row">
            <label :style="{ color: textMuted }">API Key</label>
            <input
              v-model="apiConfig.ai.key"
              type="password"
              placeholder="请输入 API Key"
              class="api-key-input"
            />
          </div>
          <div class="input-row">
            <label :style="{ color: textMuted }">模型名称</label>
            <input
              v-model="apiConfig.ai.model"
              type="text"
              placeholder="如: gpt-4o-mini, glm-4"
              class="api-key-input"
            />
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="api-tip" :style="{ borderColor }">
        <span class="tip-icon">💡</span>
        <span class="tip-text" :style="{ color: textMuted }">
          API 配置仅存储在本地，不会上传到服务器。天气与定位配置保存后
          重启应用生效
        </span>
      </div>

      <!-- 保存按钮 -->
      <button
        class="api-save-btn"
        :style="{
          background: borderColor,
          color: '#fff',
        }"
        @click="saveApi"
      >
        {{ apiSaveSuccess ? "✓ 已保存" : "保存 API 配置" }}
      </button>
    </div>
  </div>
</template>
