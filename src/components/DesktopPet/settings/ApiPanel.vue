<script setup lang="ts">
// API 配置面板（从 settings/index.vue 拆出）
// AI 对话区块的表单由 LLMConfigForm 共用组件承载
// （与 ChatPanel 齿轮面板同一份实现）
import { loadApiConfig, type ApiConfig } from "../composables/settings";
import {
  saveApiKey,
  saveApiHost,
  saveAmapKey,
} from "../composables/qweatherStorage";
import { ref, watch } from "vue";
import LLMConfigForm from "./LLMConfigForm.vue";

// API 配置（天气/高德部分；AI 部分由 LLMConfigForm 自持自存）
const apiConfig = ref<ApiConfig>(loadApiConfig());

// 保存天气/高德配置
// 注意不要走 saveApiConfig 整体写入——其 ai 分支会拿本面板打开时的
// 旧快照覆盖 llm-config，回滚用户在 LLMConfigForm 里刚保存的 AI 配置
const saveApi = () => {
  saveApiKey(apiConfig.value.qweather.key);
  saveApiHost(apiConfig.value.qweather.host);
  saveAmapKey(apiConfig.value.amap.key);
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
// reloadKey 同步驱动 LLMConfigForm 内部刷新快照
const reloadKey = ref(0);
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      apiConfig.value = loadApiConfig();
      reloadKey.value++;
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
          <!-- 表单与保存由 LLMConfigForm 承载，直接写入 llm-config 存储 -->
          <LLMConfigForm :reload-key="reloadKey" />
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

      <!-- 保存按钮（主色背景，与设置面板主题一致） -->
      <button class="api-save-btn" @click="saveApi">
        {{ apiSaveSuccess ? "✓ 已保存" : "保存 API 配置" }}
      </button>
    </div>
  </div>
</template>
