<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import { isChatPanelOpen, llmConfig } from "../composables/sharedState";
import { sendMessage } from "../composables/llmService";
import type { ChatMessage } from "../composables/llmService";
import { isDark } from "../composables/theme";
import { speak, speechEnabled } from "../composables/speech";

// 消息历史
const MAX_HISTORY = 50;
function loadHistory(): ChatMessage[] {
  try {
    const saved = localStorage.getItem("pet-chat-history");
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}
const messages = ref<ChatMessage[]>(loadHistory());
function saveHistory() {
  localStorage.setItem(
    "pet-chat-history",
    JSON.stringify(messages.value.slice(-MAX_HISTORY)),
  );
}

// 输入框
const inputText = ref("");
const inputRef = ref<HTMLInputElement | null>(null);
const messagesEnd = ref<HTMLDivElement | null>(null);

// 状态
const isLoading = ref(false);
const error = ref("");

// 设置面板
const showSettings = ref(false);
const editConfig = ref({ ...llmConfig.value });
function toggleSettings() {
  showSettings.value = !showSettings.value;
  if (showSettings.value) {
    editConfig.value = { ...llmConfig.value };
  }
}

function saveConfig() {
  llmConfig.value = { ...editConfig.value };
  localStorage.setItem("llm-config", JSON.stringify(llmConfig.value));
  showSettings.value = false;
}

// 滚动到底部
async function scrollToBottom() {
  await nextTick();
  messagesEnd.value?.scrollIntoView({ behavior: "smooth" });
}

// 发送消息
async function handleSend() {
  const text = inputText.value.trim();
  if (!text || isLoading.value) return;

  error.value = "";
  inputText.value = "";

  messages.value.push({ role: "user", content: text });
  saveHistory();
  await scrollToBottom();

  isLoading.value = true;
  try {
    // 传入最近10条历史（避免 token 过多）
    const historyToSend = messages.value.slice(-11, -1);
    const reply = await sendMessage(historyToSend, text);
    messages.value.push({ role: "assistant", content: reply });
    saveHistory();
    // 播放语音（不显示气泡）
    if (speechEnabled.value) {
      speak(reply);
    }
    await scrollToBottom();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "请求失败，请检查配置";
    messages.value.pop(); // 移除刚加入的用户消息（可选：保留）
    messages.value.push({ role: "user", content: text }); // 重新加回
  } finally {
    isLoading.value = false;
    await nextTick();
    inputRef.value?.focus();
  }
}

function clearHistory() {
  messages.value = [];
  saveHistory();
}

// 面板拖拽
const panelPos = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ mx: 0, my: 0, px: 0, py: 0 });

function initPosition() {
  panelPos.value = {
    x: window.innerWidth - 380 - 24,
    y: window.innerHeight - 520 - 60,
  };
}
initPosition();

function onDragStart(e: MouseEvent) {
  isDragging.value = true;
  dragStart.value = {
    mx: e.clientX,
    my: e.clientY,
    px: panelPos.value.x,
    py: panelPos.value.y,
  };
  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("mouseup", onDragEnd);
}

function onDragMove(e: MouseEvent) {
  if (!isDragging.value) return;
  panelPos.value = {
    x: dragStart.value.px + (e.clientX - dragStart.value.mx),
    y: dragStart.value.py + (e.clientY - dragStart.value.my),
  };
}

function onDragEnd() {
  isDragging.value = false;
  window.removeEventListener("mousemove", onDragMove);
  window.removeEventListener("mouseup", onDragEnd);
}

// 打开时聚焦输入框
watch(isChatPanelOpen, async (v) => {
  if (v) {
    await nextTick();
    inputRef.value?.focus();
    scrollToBottom();
  }
});

const cssVars = computed(() => ({
  "--panel-bg": isDark.value
    ? "rgba(20, 16, 36, 0.96)"
    : "rgba(255, 252, 255, 0.97)",
  "--panel-shadow": isDark.value
    ? "0 20px 60px rgba(139, 92, 246, 0.3), 0 0 0 1px rgba(167, 139, 250, 0.2)"
    : "0 20px 60px rgba(139, 92, 246, 0.18), 0 0 0 1px rgba(196, 181, 253, 0.4)",
  "--header-bg": isDark.value
    ? "linear-gradient(135deg, rgba(109, 40, 217, 0.6), rgba(147, 51, 234, 0.4))"
    : "linear-gradient(135deg, rgba(196, 181, 253, 0.8), rgba(221, 214, 254, 0.6))",
  "--user-bubble-bg": isDark.value
    ? "linear-gradient(135deg, #7c3aed, #9333ea)"
    : "linear-gradient(135deg, #8b5cf6, #a78bfa)",
  "--ai-bubble-bg": isDark.value
    ? "rgba(45, 38, 70, 0.95)"
    : "rgba(245, 243, 255, 0.95)",
  "--ai-bubble-border": isDark.value
    ? "rgba(139, 92, 246, 0.2)"
    : "rgba(196, 181, 253, 0.5)",
  "--text-main": isDark.value ? "#ede9fe" : "#3b0764",
  "--text-sub": isDark.value
    ? "rgba(196, 181, 253, 0.7)"
    : "rgba(109, 40, 217, 0.6)",
  "--input-bg": isDark.value
    ? "rgba(45, 38, 70, 0.8)"
    : "rgba(237, 233, 254, 0.7)",
  "--input-border": isDark.value
    ? "rgba(139, 92, 246, 0.3)"
    : "rgba(167, 139, 250, 0.4)",
  "--divider": isDark.value
    ? "rgba(139, 92, 246, 0.15)"
    : "rgba(196, 181, 253, 0.3)",
  "--settings-bg": isDark.value
    ? "rgba(30, 22, 55, 0.98)"
    : "rgba(250, 248, 255, 0.98)",
  "--label-color": isDark.value
    ? "rgba(196, 181, 253, 0.8)"
    : "rgba(109, 40, 217, 0.7)",
}));
</script>

<template>
  <Teleport to="body">
    <Transition name="panel-appear">
      <div
        v-if="isChatPanelOpen"
        class="chat-panel"
        :style="{
          left: `${panelPos.x}px`,
          top: `${panelPos.y}px`,
          ...cssVars,
        }"
        @mousedown.stop
      >
        <!-- 装饰星星 -->
        <div class="deco-stars" aria-hidden="true">
          <span class="deco-star s1">✦</span>
          <span class="deco-star s2">✧</span>
          <span class="deco-star s3">✦</span>
        </div>

        <!-- 标题栏（可拖拽） -->
        <div class="chat-header" @mousedown="onDragStart">
          <div class="header-left">
            <span class="header-icon">🐾</span>
            <span class="header-title">和宠物聊天</span>
            <span class="online-dot" title="在线"></span>
          </div>
          <div class="header-actions" @mousedown.stop>
            <button
              class="icon-btn"
              :class="{ active: showSettings }"
              @click="toggleSettings"
              title="设置"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M12 15.5A3.5 3.5 0 018.5 12 3.5 3.5 0 0112 8.5a3.5 3.5 0 013.5 3.5 3.5 3.5 0 01-3.5 3.5m7.43-2.92c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-1l2.14-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.98l-2.14 1.65c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.14-1.65z"
                />
              </svg>
            </button>
            <button
              class="icon-btn clear-btn"
              @click="clearHistory"
              title="清空记录"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                />
              </svg>
            </button>
            <button
              class="icon-btn close-btn"
              @click="isChatPanelOpen = false"
              title="关闭"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- 设置面板 -->
        <Transition name="settings-slide">
          <div v-if="showSettings" class="settings-panel" @mousedown.stop>
            <div class="settings-title">API 配置</div>
            <div class="setting-group">
              <label>API 地址</label>
              <input
                v-model="editConfig.baseURL"
                placeholder="https://api.openai.com/v1/chat/completions"
                spellcheck="false"
              />
            </div>
            <div class="setting-group">
              <label>API Key</label>
              <input
                v-model="editConfig.apiKey"
                type="password"
                placeholder="sk-..."
                spellcheck="false"
              />
            </div>
            <div class="setting-group">
              <label>模型</label>
              <input
                v-model="editConfig.model"
                placeholder="gpt-4o-mini"
                spellcheck="false"
              />
            </div>
            <div class="setting-group">
              <label>请求格式</label>
              <select v-model="editConfig.requestFormat" class="setting-select">
                <option value="openai">标准 OpenAI（支持工具调用）</option>
                <option value="weibo">微博 aigc 代理</option>
              </select>
            </div>
            <button class="save-btn" @click="saveConfig">保存</button>
          </div>
        </Transition>

        <!-- 分割线 -->
        <div class="divider"></div>

        <!-- 消息区域 -->
        <div class="messages-area">
          <!-- 空状态 -->
          <Transition name="fade">
            <div v-if="messages.length === 0 && !isLoading" class="empty-state">
              <div class="empty-icon">💬</div>
              <p class="empty-title">和你的小宠物说说话吧</p>
              <p class="empty-sub">宠物会根据你的对话展示不同表情～</p>
            </div>
          </Transition>

          <!-- 消息列表 -->
          <TransitionGroup name="msg" tag="div" class="messages-list">
            <div
              v-for="(msg, i) in messages"
              :key="i"
              class="message-row"
              :class="msg.role"
            >
              <div v-if="msg.role === 'assistant'" class="avatar">🐾</div>
              <div class="bubble" :class="msg.role">{{ msg.content }}</div>
            </div>
          </TransitionGroup>

          <!-- 加载动画 -->
          <Transition name="fade">
            <div v-if="isLoading" class="message-row assistant thinking-row">
              <div class="avatar">🐾</div>
              <div class="bubble assistant thinking-bubble">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          </Transition>

          <div ref="messagesEnd"></div>
        </div>

        <!-- 错误提示 -->
        <Transition name="fade">
          <div v-if="error" class="error-bar" @click="error = ''">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              />
            </svg>
            {{ error }}
          </div>
        </Transition>

        <!-- 输入区域 -->
        <div class="input-area">
          <input
            ref="inputRef"
            v-model="inputText"
            class="chat-input"
            placeholder="说点什么…"
            :disabled="isLoading"
            @keydown.enter.prevent="handleSend"
            @mousedown.stop
          />
          <button
            class="send-btn"
            :disabled="isLoading || !inputText.trim()"
            @click="handleSend"
            @mousedown.stop
          >
            <svg
              v-if="!isLoading"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
            <span v-else class="sending-dot"></span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap");

/* ============================================================
   面板容器
   ============================================================ */
.chat-panel {
  position: fixed;
  z-index: 9998;
  width: 360px;
  height: 500px;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  background: var(--panel-bg);
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(24px) saturate(1.8);
  -webkit-backdrop-filter: blur(24px) saturate(1.8);
  font-family:
    "Nunito",
    -apple-system,
    "PingFang SC",
    sans-serif;
  overflow: hidden;
  pointer-events: auto !important;
  user-select: none;
}

/* ============================================================
   装饰星星
   ============================================================ */
.deco-stars {
  position: absolute;
  inset: -12px;
  pointer-events: none;
  z-index: 1;
}

.deco-star {
  position: absolute;
  font-size: 11px;
  color: rgba(167, 139, 250, 0.6);
  animation: star-twinkle 2.5s ease-in-out infinite;
}

.s1 {
  top: 8px;
  left: -2px;
  animation-delay: 0s;
}
.s2 {
  top: -4px;
  right: 15px;
  animation-delay: 0.8s;
  color: rgba(244, 114, 182, 0.5);
}
.s3 {
  bottom: 40px;
  right: -4px;
  animation-delay: 1.6s;
}

@keyframes star-twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}

/* ============================================================
   标题栏
   ============================================================ */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  background: var(--header-bg);
  cursor: grab;
  flex-shrink: 0;
}

.chat-header:active {
  cursor: grabbing;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 18px;
  animation: icon-float 3s ease-in-out infinite;
}

@keyframes icon-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.header-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: 0.3px;
}

.online-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.3);
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    box-shadow: 0 0 0 2px rgba(52, 211, 153, 0.3);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.15);
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-sub);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.icon-btn:hover {
  background: rgba(139, 92, 246, 0.12);
  color: var(--text-main);
  transform: scale(1.1);
}

.icon-btn.active {
  background: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
}

.close-btn:hover {
  background: rgba(244, 63, 94, 0.12);
  color: #f43f5e;
}

.clear-btn:hover {
  background: rgba(251, 146, 60, 0.12);
  color: #fb923c;
}

/* ============================================================
   设置面板
   ============================================================ */
.settings-panel {
  background: var(--settings-bg);
  border-bottom: 1px solid var(--divider);
  padding: 14px 16px;
  flex-shrink: 0;
}

.settings-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-sub);
  margin-bottom: 10px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.setting-group label {
  font-size: 11px;
  font-weight: 600;
  color: var(--label-color);
}

.setting-group input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-main);
  font-size: 12px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.setting-select {
  width: 100%;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-main);
  font-size: 12px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
  cursor: pointer;
}

.setting-group input:focus,
.setting-select:focus {
  border-color: rgba(139, 92, 246, 0.6);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.save-btn {
  margin-top: 4px;
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.save-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.save-btn:active {
  transform: scale(0.98);
}

/* ============================================================
   分割线
   ============================================================ */
.divider {
  height: 1px;
  background: var(--divider);
  flex-shrink: 0;
}

/* ============================================================
   消息区域
   ============================================================ */
.messages-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 14px;
  position: relative;
  scroll-behavior: smooth;
}

.messages-area::-webkit-scrollbar {
  width: 4px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.2);
  border-radius: 2px;
}

/* ============================================================
   空状态
   ============================================================ */
.empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  pointer-events: none;
}

.empty-icon {
  font-size: 36px;
  animation: icon-float 3s ease-in-out infinite;
}

.empty-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.empty-sub {
  font-size: 12px;
  color: var(--text-sub);
  margin: 0;
  text-align: center;
  line-height: 1.5;
}

/* ============================================================
   消息气泡
   ============================================================ */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 100%;
}

.message-row.user {
  flex-direction: row-reverse;
}

.avatar {
  font-size: 20px;
  flex-shrink: 0;
  animation: avatar-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes avatar-bounce {
  0% {
    transform: scale(0.5) translateY(10px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.bubble {
  max-width: 220px;
  padding: 9px 13px;
  border-radius: 16px;
  font-size: 13px;
  line-height: 1.55;
  word-break: break-word;
  animation: bubble-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes bubble-in {
  0% {
    transform: scale(0.8) translateY(8px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.bubble.user {
  background: var(--user-bubble-bg);
  color: white;
  border-radius: 16px 4px 16px 16px;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.bubble.assistant {
  background: var(--ai-bubble-bg);
  color: var(--text-main);
  border: 1px solid var(--ai-bubble-border);
  border-radius: 4px 16px 16px 16px;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.08);
}

/* ============================================================
   加载动画（三点）
   ============================================================ */
.thinking-bubble {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 16px;
  min-width: 56px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.5);
  animation: dot-bounce 1.2s ease-in-out infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}
.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dot-bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

/* ============================================================
   错误提示
   ============================================================ */
.error-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(244, 63, 94, 0.1);
  border-top: 1px solid rgba(244, 63, 94, 0.2);
  color: #f43f5e;
  font-size: 12px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}

.error-bar:hover {
  background: rgba(244, 63, 94, 0.15);
}

/* ============================================================
   输入区域
   ============================================================ */
.input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-top: 1px solid var(--divider);
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  padding: 9px 13px;
  border-radius: 12px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-main);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: all 0.2s;
}

.chat-input::placeholder {
  color: var(--text-sub);
}

.chat-input:focus {
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.chat-input:disabled {
  opacity: 0.6;
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 3px 10px rgba(139, 92, 246, 0.35);
}

.send-btn:not(:disabled):hover {
  transform: scale(1.1) rotate(-5deg);
  box-shadow: 0 5px 15px rgba(139, 92, 246, 0.5);
}

.send-btn:not(:disabled):active {
  transform: scale(0.95);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.sending-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ============================================================
   Transitions
   ============================================================ */
.panel-appear-enter-active {
  animation: panel-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.panel-appear-leave-active {
  animation: panel-out 0.2s ease-in;
}

@keyframes panel-in {
  0% {
    opacity: 0;
    transform: scale(0.85) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
@keyframes panel-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
}

.settings-slide-enter-active,
.settings-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.settings-slide-enter-from,
.settings-slide-leave-to {
  max-height: 0;
  opacity: 0;
}
.settings-slide-enter-to,
.settings-slide-leave-from {
  max-height: 300px;
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.msg-enter-active {
  animation: bubble-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.msg-leave-active {
  transition:
    opacity 0.15s,
    transform 0.15s;
}
.msg-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.msg-move {
  transition: transform 0.3s;
}
</style>
