<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, watch, ref } from "vue";
import { getFootprintOpacity } from "./composables/useFootprints";
// 状态变量从 sharedState 导入
import {
  petState,
  petDirection,
  position,
  isVisible,
  isDragging,
  isContextMenuOpen,
  isScheduleModalOpen,
} from "./composables/sharedState";
// 函数从 usePetState 导入
import {
  handleDragStart,
  handlePetClick,
  handlePetDoubleClick,
  togglePet,
  initScreenSize,
  initPet,
  cleanupPet,
} from "./composables/usePetState";
import { footprints } from "./composables/useFootprints";
import { dialogueText, isDialogueVisible } from "./composables/useDialogue";
import { isDark, checkSystemTheme } from "./composables/useTheme";
import {
  getScheduleConfig,
  updateScheduleConfig,
} from "./composables/useSchedule";
import type { ScheduleConfig } from "./types";
import "./styles.css";

// Electron API 类型声明
declare global {
  interface Window {
    electronAPI?: {
      setIgnoreMouseEvents: (ignore: boolean) => void;
      getScreenSize: () => Promise<{ width: number; height: number }>;
    };
  }
}

// 宠物颜色 - 根据主题变化
const petColors = computed(() => {
  const isAngry = petState.value === "angry";
  return {
    body: isAngry ? "#ef4444" : isDark.value ? "#a78bfa" : "#8b5cf6",
    bodyGradient: isAngry ? "#f87171" : isDark.value ? "#c4b5fd" : "#a78bfa",
    face: isDark.value ? "#1f2937" : "#ffffff",
    eyes: isDark.value ? "#fbbf24" : "#1f2937",
    cheeks: isDark.value ? "#f472b6" : "#fda4af",
    shadow: isDark.value
      ? "rgba(167, 139, 250, 0.3)"
      : "rgba(139, 92, 246, 0.2)",
    footprint: isDark.value
      ? "rgba(167, 139, 250, 0.4)"
      : "rgba(139, 92, 246, 0.3)",
    angryFace: "#7f1d1d",
  };
});

// 初始化
onMounted(async () => {
  // 初始化屏幕尺寸
  await initScreenSize();

  // 初始化宠物
  initPet(checkSystemTheme);
});

// 清理
onBeforeUnmount(() => {
  cleanupPet();
});

// 监听可见性变化，保存到存储
watch(isVisible, (value) => {
  localStorage.setItem("pet-visibility", String(value));
});

// 暴露方法供外部调用
defineExpose({
  togglePet,
  isVisible,
});

// 设置鼠标穿透
function setPassthrough(ignore: boolean) {
  if (window.electronAPI) {
    window.electronAPI.setIgnoreMouseEvents(ignore);
  }
}

// 右键菜单状态
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

// 作息配置弹窗状态
const scheduleModalVisible = ref(false);
const scheduleConfig = ref<ScheduleConfig>({
  enabled: false,
  slots: [],
});

// 打开右键菜单
const handleContextMenu = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  // 先禁用穿透
  setPassthrough(false);
  // 设置全局状态
  isContextMenuOpen.value = true;
  contextMenuX.value = e.clientX;
  contextMenuY.value = e.clientY;
  contextMenuVisible.value = true;
};

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false;
  isContextMenuOpen.value = false;
  // 只有没有其他弹窗时才恢复穿透
  if (!scheduleModalVisible.value) {
    setPassthrough(true);
  }
};

// 打开作息配置弹窗
const openScheduleModal = () => {
  // 先禁用穿透（确保穿透被禁用）
  setPassthrough(false);
  // 设置全局状态
  isScheduleModalOpen.value = true;
  // 关闭菜单但不恢复穿透
  contextMenuVisible.value = false;
  isContextMenuOpen.value = false;
  scheduleConfig.value = getScheduleConfig();
  scheduleModalVisible.value = true;
};

// 关闭作息配置弹窗
const closeScheduleModal = () => {
  scheduleModalVisible.value = false;
  isScheduleModalOpen.value = false;
  // 恢复穿透
  setPassthrough(true);
};

// 保存作息配置
const saveSchedule = () => {
  updateScheduleConfig(scheduleConfig.value);
  closeScheduleModal();
};

// 切换作息启用状态
const toggleSchedule = () => {
  scheduleConfig.value.enabled = !scheduleConfig.value.enabled;
};

// 点击其他地方关闭菜单
const handleGlobalClick = () => {
  if (contextMenuVisible.value) {
    closeContextMenu();
  }
};

// 添加时间槽
const addTimeSlot = () => {
  scheduleConfig.value.slots.push({
    startHour: 22,
    startMinute: 0,
    endHour: 7,
    endMinute: 0,
    state: "sleep",
  });
};

// 删除时间槽
const removeTimeSlot = (index: number) => {
  scheduleConfig.value.slots.splice(index, 1);
};

// 生命周期
onMounted(() => {
  document.addEventListener("click", handleGlobalClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleGlobalClick);
});
</script>

<template>
  <div
    v-if="isVisible"
    class="desktop-pet"
    :class="[`pet-${petState}`, `pet-${petDirection}`]"
  >
    <!-- 脚印容器 -->
    <div class="footprints-container">
      <div
        v-for="footprint in footprints"
        :key="footprint.id"
        class="footprint"
        :class="[
          footprint.isLeft ? 'footprint-left' : 'footprint-right',
          `footprint-${footprint.direction}`,
        ]"
        :style="{
          left: `${footprint.x}px`,
          top: `${footprint.y}px`,
          opacity: getFootprintOpacity(footprint),
        }"
      >
        <svg viewBox="0 0 24 24" class="footprint-svg">
          <path
            d="M12 2C9.5 2 7.5 4.5 7.5 7.5C7.5 10.5 9.5 13 12 13C14.5 13 16.5 10.5 16.5 7.5C16.5 4.5 14.5 2 12 2Z"
            fill="currentColor"
          />
          <ellipse cx="7" cy="17" rx="3" ry="2" fill="currentColor" />
          <ellipse cx="12" cy="19" rx="3.5" ry="2.5" fill="currentColor" />
          <ellipse cx="17" cy="17" rx="3" ry="2" fill="currentColor" />
        </svg>
      </div>
    </div>

    <!-- 宠物容器 -->
    <div
      class="pet-container"
      :class="{ 'is-dragging': isDragging }"
      :style="{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }"
      @mousedown="handleDragStart"
      @click="handlePetClick"
      @dblclick="handlePetDoubleClick"
      @contextmenu="handleContextMenu"
      title="拖动：移动位置 | 单击：互动 | 双击：跳舞/翻滚 | 右键：菜单"
    >
      <!-- 阴影 -->
      <div class="pet-shadow"></div>

      <!-- 宠物主体 -->
      <div class="pet-body">
        <!-- 身体渐变 -->
        <div class="pet-body-gradient"></div>

        <!-- 耳朵 -->
        <div class="pet-ear ear-left"></div>
        <div class="pet-ear ear-right"></div>

        <!-- 脸部 -->
        <div class="pet-face">
          <!-- 眉毛（生气时显示） -->
          <div class="pet-brows">
            <div class="brow brow-left"></div>
            <div class="brow brow-right"></div>
          </div>

          <!-- 眼睛 -->
          <div class="pet-eyes">
            <div class="eye eye-left">
              <div class="eye-shine"></div>
            </div>
            <div class="eye eye-right">
              <div class="eye-shine"></div>
            </div>
          </div>

          <!-- 眨眼效果 -->
          <div class="pet-eyes blink">
            <div class="eye eye-left eye-closed"></div>
            <div class="eye eye-right eye-closed"></div>
          </div>

          <!-- 嘴巴 -->
          <div class="pet-mouth">
            <div class="mouth-smile"></div>
            <div class="mouth-o"></div>
            <div class="mouth-sad"></div>
            <div class="mouth-angry"></div>
          </div>

          <!-- 腮红 -->
          <div class="pet-cheek cheek-left"></div>
          <div class="pet-cheek cheek-right"></div>

          <!-- 眼泪（大哭时显示） -->
          <div class="tears" v-if="petState === 'crying'">
            <div class="tear tear-left"></div>
            <div class="tear tear-right"></div>
          </div>
        </div>

        <!-- 手臂 -->
        <div class="pet-arm arm-left"></div>
        <div class="pet-arm arm-right"></div>

        <!-- 腿 -->
        <div class="pet-leg leg-left"></div>
        <div class="pet-leg leg-right"></div>
      </div>

      <!-- 睡眠气泡 -->
      <div class="sleep-bubble" v-if="petState === 'sleeping'">
        <span>Z</span>
        <span class="z2">Z</span>
        <span class="z3">Z</span>
      </div>

      <!-- 开心效果 -->
      <div class="happy-effects" v-if="petState === 'happy'">
        <div class="heart heart-1">❤️</div>
        <div class="heart heart-2">✨</div>
        <div class="heart heart-3">💖</div>
      </div>

      <!-- 晕眩效果（摔倒时显示） -->
      <div class="dizzy-effects" v-if="petState === 'fallen'">
        <span class="dizzy-star">⭐</span>
        <span class="dizzy-star star-2">💫</span>
        <span class="dizzy-star star-3">✴️</span>
      </div>

      <!-- 惊吓效果 -->
      <div class="scared-effects" v-if="petState === 'scared'">
        <span class="exclaim">❗</span>
        <span class="exclaim exclaim-2">❗</span>
      </div>

      <!-- 思考效果 -->
      <div class="thinking-effects" v-if="petState === 'thinking'">
        <span class="think-icon">💭</span>
      </div>

      <!-- 得意效果 -->
      <div class="smug-effects" v-if="petState === 'smug'">
        <span class="thumb-up">👍</span>
      </div>

      <!-- 害羞效果 -->
      <div class="shy-effects" v-if="petState === 'shy'">
        <span class="shy-icon">🫣</span>
      </div>

      <!-- 疑惑效果 -->
      <div class="confused-effects" v-if="petState === 'confused'">
        <span class="confused-icon">🤔</span>
      </div>

      <!-- 打招呼效果 -->
      <div class="hello-effects" v-if="petState === 'hello'">
        <span class="wave">👋</span>
      </div>

      <!-- 打喷嚏效果 -->
      <div class="sneeze-effects" v-if="petState === 'sneeze'">
        <span class="sneeze-cloud">💨</span>
        <span class="sneeze-text">阿嚏!</span>
      </div>

      <!-- 坏笑效果 -->
      <div class="grin-effects" v-if="petState === 'grin'">
        <span class="grin-text">嘿嘿~</span>
      </div>

      <!-- 挠头效果 -->
      <div class="scratch-effects" v-if="petState === 'scratch'">
        <span class="scratch-icon">❓</span>
      </div>

      <!-- 跳跃庆祝效果 -->
      <div class="celebrate-effects" v-if="petState === 'celebrate'">
        <span class="confetti">🎉</span>
        <span class="confetti confetti-2">🎊</span>
        <span class="confetti confetti-3">✨</span>
      </div>

      <!-- 嬉戏庆祝效果 -->
      <div class="celebrate-effects" v-if="petState === 'celebrate'">
        <span class="confetti">🎉</span>
        <span class="confetti confetti-2">🎊</span>
        <span class="confetti confetti-3">✨</span>
      </div>

      <!-- 偷看效果 -->
      <div class="peek-effects" v-if="petState === 'peek'">
        <span class="peek-icon">🤫</span>
      </div>

      <!-- 跳舞效果 -->
      <div class="dancing-effects" v-if="petState === 'dancing'">
        <span class="music-note">🎵</span>
        <span class="music-note note-2">🎶</span>
        <span class="music-note note-3">💃</span>
      </div>

      <!-- 翻滚效果 -->
      <div class="rolling-effects" v-if="petState === 'rolling'">
        <span class="spin-star">⭐</span>
      </div>

      <!-- 打哈欠效果 -->
      <div class="yawn-effects" v-if="petState === 'yawn'">
        <span class="yawn-icon">😴</span>
      </div>

      <!-- 睡眼朦胧效果 -->
      <div class="sleepy-effects" v-if="petState === 'sleepy'">
        <span class="sleepy-icon">💤</span>
      </div>

      <!-- 伸懒腰效果 -->
      <div class="stretch-effects" v-if="petState === 'stretch'">
        <span class="stretch-icon">✨</span>
      </div>
    </div>

    <!-- 对话气泡（放在 pet-container 外部，不受翻滚影响） -->
    <div
      class="dialogue-bubble"
      :class="{
        'dialogue-visible': isDialogueVisible,
        'dialogue-left': petDirection === 'left',
      }"
      :style="{
        left: `${position.x + 40}px`,
        top: `${position.y - 55}px`,
      }"
      v-if="dialogueText"
    >
      <span class="dialogue-text">{{ dialogueText }}</span>
      <div class="dialogue-tail"></div>
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <Transition name="menu-pop">
        <div
          v-if="contextMenuVisible"
          class="pet-context-menu"
          :class="{ 'dark-mode': isDark }"
          :style="{
            left: `${contextMenuX}px`,
            top: `${contextMenuY}px`,
          }"
          @click.stop
        >
          <div class="menu-bubble">
            <div class="menu-item" @click="openScheduleModal">
              <span class="menu-icon">🌙</span>
              <span class="menu-text">作息设置</span>
            </div>
            <div class="menu-divider"></div>
            <div class="menu-item" @click="togglePet(); closeContextMenu()">
              <span class="menu-icon">{{ isVisible ? '💫' : '✨' }}</span>
              <span class="menu-text">{{ isVisible ? '休息一下' : '出来玩' }}</span>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 作息配置弹窗 -->
      <Transition name="modal-pop">
        <div
          v-if="scheduleModalVisible"
          class="schedule-modal-overlay"
          @click="closeScheduleModal"
        >
          <div class="schedule-modal" :class="{ 'dark-mode': isDark }" @click.stop>
            <!-- 装饰元素 -->
            <div class="modal-decor">
              <span class="decor-star star-1">⭐</span>
              <span class="decor-star star-2">✨</span>
              <span class="decor-star star-3">🌙</span>
            </div>

            <div class="modal-header">
              <div class="header-title">
                <span class="title-icon">🌙</span>
                <span class="title-text">作息时间表</span>
              </div>
              <button class="modal-close" @click="closeScheduleModal">
                <span>✕</span>
              </button>
            </div>

            <div class="modal-body">
              <!-- 启用开关 -->
              <div class="toggle-card">
                <div class="toggle-info">
                  <span class="toggle-title">自动作息</span>
                  <span class="toggle-desc">到时间自动睡觉和起床</span>
                </div>
                <button
                  class="toggle-switch"
                  :class="{ active: scheduleConfig.enabled }"
                  @click="toggleSchedule"
                >
                  <span class="toggle-knob"></span>
                </button>
              </div>

              <!-- 时间段列表 -->
              <div class="slots-section">
                <div class="slots-header">
                  <span class="slots-title">时间段设置</span>
                  <button class="add-btn" @click="addTimeSlot">
                    <span>+</span>
                  </button>
                </div>

                <div class="slots-list">
                  <div
                    v-for="(slot, index) in scheduleConfig.slots"
                    :key="index"
                    class="slot-card"
                    :class="{ 'is-sleep': slot.state === 'sleep' }"
                  >
                    <div class="slot-icon">
                      {{ slot.state === 'sleep' ? '😴' : '🎈' }}
                    </div>
                    <div class="slot-time-inputs">
                      <div class="time-group">
                        <input
                          type="number"
                          v-model.number="slot.startHour"
                          min="0"
                          max="23"
                          class="time-input"
                        />
                        <span class="time-colon">:</span>
                        <input
                          type="number"
                          v-model.number="slot.startMinute"
                          min="0"
                          max="59"
                          class="time-input"
                        />
                      </div>
                      <span class="time-arrow">→</span>
                      <div class="time-group">
                        <input
                          type="number"
                          v-model.number="slot.endHour"
                          min="0"
                          max="23"
                          class="time-input"
                        />
                        <span class="time-colon">:</span>
                        <input
                          type="number"
                          v-model.number="slot.endMinute"
                          min="0"
                          max="59"
                          class="time-input"
                        />
                      </div>
                    </div>
                    <select v-model="slot.state" class="state-select">
                      <option value="sleep">睡眠</option>
                      <option value="free">闲暇</option>
                    </select>
                    <button class="remove-btn" @click="removeTimeSlot(index)">
                      <span>×</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-cancel" @click="closeScheduleModal">取消</button>
              <button class="btn btn-save" @click="saveSchedule">
                <span>✓</span> 保存
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* 动态颜色绑定 - 需要使用 v-bind */
.footprint-svg {
  color: v-bind("petColors.footprint");
}

.pet-shadow {
  background: v-bind("petColors.shadow");
}

.pet-body {
  background: v-bind("petColors.body");
}

.pet-body-gradient {
  background: radial-gradient(
    circle at 30% 30%,
    v-bind("petColors.bodyGradient"),
    transparent 60%
  );
}

.pet-ear {
  background: v-bind("petColors.body");
}

.pet-ear::after {
  background: v-bind("petColors.bodyGradient");
}

.brow {
  background: v-bind("petColors.eyes");
}

.eye {
  background: v-bind("petColors.eyes");
}

.eye-closed {
  background: v-bind("petColors.eyes");
}

.mouth-smile {
  border-bottom: 3px solid v-bind("petColors.eyes");
}

.mouth-o {
  border: 3px solid v-bind("petColors.eyes");
}

.mouth-sad {
  border-top: 3px solid v-bind("petColors.eyes");
}

.mouth-angry {
  border: 3px solid v-bind("petColors.eyes");
}

.pet-cheek {
  background: v-bind("petColors.cheeks");
}

.pet-arm {
  background: v-bind("petColors.body");
}

.pet-leg {
  background: v-bind("petColors.body");
}

.pet-scared .brow-left {
  transform: translateY(-2px) rotate(-10deg);
}

.pet-scared .brow-right {
  transform: translateY(-2px) rotate(10deg);
}

.pet-scared .mouth-smile {
  border: 3px solid v-bind("petColors.eyes");
}

.pet-sneeze .mouth-smile {
  border: 3px solid v-bind("petColors.eyes");
}

.dialogue-bubble {
  background: v-bind(
    "isDark ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'"
  );
  box-shadow:
    0 4px 15px
      v-bind("isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(139, 92, 246, 0.15)'"),
    0 0 0 1px
      v-bind("isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(139, 92, 246, 0.1)'");
}

.dialogue-bubble::before {
  background: linear-gradient(
    135deg,
    v-bind("isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.2)'"),
    v-bind("isDark ? 'rgba(244, 114, 182, 0.3)' : 'rgba(253, 164, 175, 0.2)'")
  );
}

.dialogue-text {
  color: v-bind("isDark ? '#e2e8f0' : '#374151'");
  text-shadow: 0 1px 2px
    v-bind("isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.5)'");
}

.dialogue-tail {
  background: v-bind(
    "isDark ? 'rgba(30, 30, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)'"
  );
}

/* ========================================
   右键菜单样式
   ======================================== */
.pet-context-menu {
  position: fixed;
  z-index: 10000;
  pointer-events: auto !important;
}

.menu-bubble {
  min-width: 140px;
  padding: 8px;
  background: v-bind("isDark ? 'rgba(40, 35, 60, 0.95)' : 'rgba(255, 255, 255, 0.95)'");
  border-radius: 16px;
  box-shadow:
    0 8px 32px v-bind("isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(139, 92, 246, 0.2)'"),
    0 0 0 2px v-bind("isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.15)'");
  backdrop-filter: blur(12px);
  pointer-events: auto !important;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.menu-item:hover {
  background: v-bind("isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'");
  transform: scale(1.02);
}

.menu-icon {
  font-size: 18px;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
  color: v-bind("isDark ? '#e2e8f0' : '#4b5563'");
}

.menu-divider {
  height: 1px;
  margin: 6px 8px;
  background: v-bind("isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(139, 92, 246, 0.1)'");
}

/* ========================================
   作息配置弹窗样式
   ======================================== */
.schedule-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  background: v-bind("isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(139, 92, 246, 0.15)'");
  backdrop-filter: blur(8px);
  pointer-events: auto !important;
}

.schedule-modal {
  width: 380px;
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 24px;
  background: v-bind("isDark ? 'rgba(35, 30, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)'");
  box-shadow:
    0 20px 60px v-bind("isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(139, 92, 246, 0.25)'"),
    0 0 0 1px v-bind("isDark ? 'rgba(167, 139, 250, 0.2)' : 'rgba(139, 92, 246, 0.1)'");
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  pointer-events: auto !important;
}

.modal-decor {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.decor-star {
  position: absolute;
  font-size: 16px;
  opacity: 0.4;
  animation: twinkle 2s ease-in-out infinite;
}

.star-1 { top: 20px; right: 60px; animation-delay: 0s; }
.star-2 { top: 40px; right: 20px; animation-delay: 0.5s; }
.star-3 { top: 60px; right: 80px; animation-delay: 1s; }

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  position: relative;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 24px;
}

.title-text {
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: v-bind("isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'");
  color: v-bind("isDark ? '#9ca3af' : '#9ca3af'");
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  transform: rotate(90deg);
}

.modal-body {
  padding: 0 24px 20px;
  overflow-y: auto;
  flex: 1;
}

.toggle-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: v-bind("isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)'");
  border-radius: 16px;
  border: 1px solid v-bind("isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(139, 92, 246, 0.1)'");
  margin-bottom: 20px;
}

.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toggle-title {
  font-size: 15px;
  font-weight: 600;
  color: v-bind("isDark ? '#e2e8f0' : '#374151'");
}

.toggle-desc {
  font-size: 12px;
  color: v-bind("isDark ? '#9ca3af' : '#9ca3af'");
}

.toggle-switch {
  width: 52px;
  height: 28px;
  border: none;
  border-radius: 14px;
  background: v-bind("isDark ? 'rgba(107, 114, 128, 0.3)' : 'rgba(156, 163, 175, 0.3)'");
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toggle-switch.active {
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toggle-switch.active .toggle-knob {
  transform: translateX(24px);
}

.slots-section {
  margin-top: 4px;
}

.slots-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.slots-title {
  font-size: 13px;
  font-weight: 600;
  color: v-bind("isDark ? '#9ca3af' : '#6b7280'");
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed v-bind("isDark ? 'rgba(167, 139, 250, 0.4)' : 'rgba(139, 92, 246, 0.4)'");
  background: transparent;
  border-radius: 8px;
  color: v-bind("isDark ? '#a78bfa' : '#8b5cf6'");
  font-size: 18px;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: v-bind("isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(139, 92, 246, 0.1)'");
  border-style: solid;
  transform: scale(1.1);
}

.slots-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slot-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: v-bind("isDark ? 'rgba(55, 48, 85, 0.4)' : 'rgba(250, 245, 255, 0.7)'");
  border-radius: 14px;
  border: 1px solid v-bind("isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(139, 92, 246, 0.1)'");
  transition: all 0.2s ease;
}

.slot-card:hover {
  border-color: v-bind("isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.25)'");
}

.slot-card.is-sleep {
  background: v-bind("isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(165, 180, 252, 0.2)'");
}

.slot-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.slot-time-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.time-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.time-input {
  width: 36px;
  padding: 6px 4px;
  border: 1px solid v-bind("isDark ? 'rgba(167, 139, 250, 0.2)' : 'rgba(139, 92, 246, 0.15)'");
  border-radius: 8px;
  background: v-bind("isDark ? 'rgba(30, 27, 45, 0.8)' : 'rgba(255, 255, 255, 0.9)'");
  color: v-bind("isDark ? '#e2e8f0' : '#374151'");
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s ease;
}

.time-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}

.time-colon {
  color: v-bind("isDark ? '#9ca3af' : '#9ca3af'");
  font-weight: 600;
}

.time-arrow {
  color: v-bind("isDark ? '#a78bfa' : '#8b5cf6'");
  font-size: 12px;
  margin: 0 4px;
}

.state-select {
  padding: 8px 12px;
  border: 1px solid v-bind("isDark ? 'rgba(167, 139, 250, 0.2)' : 'rgba(139, 92, 246, 0.15)'");
  border-radius: 10px;
  background: v-bind("isDark ? 'rgba(30, 27, 45, 0.8)' : 'rgba(255, 255, 255, 0.9)'");
  color: v-bind("isDark ? '#e2e8f0' : '#374151'");
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.state-select:focus {
  outline: none;
  border-color: #8b5cf6;
}

.remove-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #f87171;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.5;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  opacity: 1;
  background: rgba(248, 113, 113, 0.15);
  transform: scale(1.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-cancel {
  background: v-bind("isDark ? 'rgba(107, 114, 128, 0.2)' : 'rgba(156, 163, 175, 0.15)'");
  color: v-bind("isDark ? '#9ca3af' : '#6b7280'");
}

.btn-cancel:hover {
  background: v-bind("isDark ? 'rgba(107, 114, 128, 0.3)' : 'rgba(156, 163, 175, 0.25)'");
}

.btn-save {
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
  color: white;
  box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.45);
}

.btn-save:active {
  transform: translateY(0);
}

/* ========================================
   动画过渡
   ======================================== */
.menu-pop-enter-active {
  animation: menu-pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.menu-pop-leave-active {
  animation: menu-pop-out 0.15s ease-in;
}

@keyframes menu-pop-in {
  0% { opacity: 0; transform: scale(0.8) translateY(-10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes menu-pop-out {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.9); }
}

.modal-pop-enter-active {
  animation: modal-pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-pop-leave-active {
  animation: modal-pop-out 0.2s ease-in;
}

@keyframes modal-pop-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes modal-pop-in .schedule-modal {
  0% { transform: scale(0.9) translateY(20px); }
  100% { transform: scale(1) translateY(0); }
}

@keyframes modal-pop-out {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
