<script setup lang="ts">
// AI 配置表单（共用组件）
// ChatPanel 齿轮面板与 settings/ApiPanel 此前各自维护一份
// 字段完全重叠的表单实现，抽此组件共用。数据仍走 saveLLMConfig
// 单一写入口，本组件只管编辑态的展示与回传。
import { ref, watch } from "vue";
import {
  llmConfig,
  saveLLMConfig,
  type LLMConfig,
} from "../composables/sharedState";

const props = defineProps<{
  /** 外层控制重新加载（如设置弹窗每次打开时刷新快照） */
  reloadKey?: number;
}>();

const emit = defineEmits<{
  saved: [config: LLMConfig];
}>();

// 编辑态（从 llmConfig 取快照，保存时整体写回）
const editConfig = ref<LLMConfig>({ ...llmConfig.value });

watch(
  () => props.reloadKey,
  () => {
    editConfig.value = { ...llmConfig.value };
  },
);

// 请求格式选项
const aiFormats = [
  { key: "openai" as const, label: "OpenAI", desc: "GPT 系列 / 兼容格式" },
  { key: "weibo" as const, label: "微博代理", desc: "微博 aigc 代理格式" },
];

function saveConfig() {
  saveLLMConfig({ ...editConfig.value });
  emit("saved", { ...editConfig.value });
}
</script>

<template>
  <div class="llm-config-form">
    <div class="form-row">
      <label class="form-label">请求格式</label>
      <div class="format-selector">
        <button
          v-for="fmt in aiFormats"
          :key="fmt.key"
          type="button"
          class="format-option"
          :class="{ active: editConfig.requestFormat === fmt.key }"
          @click="editConfig.requestFormat = fmt.key"
        >
          <span class="format-name">{{ fmt.label }}</span>
          <span class="format-desc">{{ fmt.desc }}</span>
        </button>
      </div>
    </div>
    <div class="form-row">
      <label class="form-label">API URL</label>
      <input
        v-model="editConfig.baseURL"
        placeholder="https://api.openai.com/v1/chat/completions"
        spellcheck="false"
        class="form-input"
      />
    </div>
    <div class="form-row">
      <label class="form-label">API Key</label>
      <input
        v-model="editConfig.apiKey"
        type="password"
        placeholder="请输入 API Key"
        spellcheck="false"
        class="form-input"
      />
    </div>
    <div class="form-row">
      <label class="form-label">模型名称</label>
      <input
        v-model="editConfig.model"
        placeholder="如: gpt-4o-mini, glm-4"
        spellcheck="false"
        class="form-input"
      />
    </div>
    <button type="button" class="form-save-btn" @click="saveConfig">
      保存
    </button>
  </div>
</template>

<style scoped>
.llm-config-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  opacity: 0.8;
}

.form-input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  background: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #8b5cf6;
}

/* 请求格式选择器 */
.format-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.format-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(139, 92, 246, 0.25);
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.format-option.active {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}

.format-name {
  font-size: 13px;
  font-weight: 700;
}

.format-desc {
  font-size: 11px;
  opacity: 0.7;
}

.form-save-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  align-self: flex-end;
}

.form-save-btn:hover {
  opacity: 0.9;
}
</style>
