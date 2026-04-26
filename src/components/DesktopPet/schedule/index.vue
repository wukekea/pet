<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { isDark } from "../composables/theme";
import {
  getScheduleConfig,
  updateScheduleConfig,
} from "../composables/scheduleManager";
import { setPassthrough } from "../composables/passthrough";
import { isScheduleModalOpen, isAnyUiOpen } from "../composables/sharedState";
import type { ScheduleConfig, TimeSlot } from "../types";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

// CSS 变量 - 用于主题切换
const cssVars = computed(() => ({
  "--overlay-bg": isDark.value
    ? "rgba(0, 0, 0, 0.6)"
    : "rgba(139, 92, 246, 0.15)",
  "--modal-bg": isDark.value
    ? "rgba(35, 30, 55, 0.98)"
    : "rgba(255, 255, 255, 0.98)",
  "--modal-shadow": isDark.value
    ? "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(167, 139, 250, 0.2)"
    : "0 20px 60px rgba(139, 92, 246, 0.25), 0 0 0 1px rgba(139, 92, 246, 0.1)",
  "--toggle-card-bg": isDark.value
    ? "rgba(139, 92, 246, 0.1)"
    : "rgba(139, 92, 246, 0.05)",
  "--toggle-card-border": isDark.value
    ? "rgba(167, 139, 250, 0.15)"
    : "rgba(139, 92, 246, 0.1)",
  "--toggle-title-color": isDark.value ? "#e2e8f0" : "#374151",
  "--toggle-desc-color": "#9ca3af",
  "--toggle-switch-bg": isDark.value
    ? "rgba(107, 114, 128, 0.3)"
    : "rgba(156, 163, 175, 0.3)",
  "--slots-title-color": isDark.value ? "#9ca3af" : "#6b7280",
  "--add-btn-border": isDark.value
    ? "rgba(167, 139, 250, 0.4)"
    : "rgba(139, 92, 246, 0.4)",
  "--add-btn-color": isDark.value ? "#a78bfa" : "#8b5cf6",
  "--add-btn-hover-bg": isDark.value
    ? "rgba(167, 139, 250, 0.15)"
    : "rgba(139, 92, 246, 0.1)",
  "--slot-card-bg": isDark.value
    ? "rgba(55, 48, 85, 0.4)"
    : "rgba(250, 245, 255, 0.7)",
  "--slot-card-border": isDark.value
    ? "rgba(167, 139, 250, 0.15)"
    : "rgba(139, 92, 246, 0.1)",
  "--slot-card-hover-border": isDark.value
    ? "rgba(167, 139, 250, 0.3)"
    : "rgba(139, 92, 246, 0.25)",
  "--sleep-slot-bg": isDark.value
    ? "rgba(99, 102, 241, 0.15)"
    : "rgba(165, 180, 252, 0.2)",
  "--work-slot-bg": isDark.value
    ? "rgba(251, 146, 60, 0.15)"
    : "rgba(254, 215, 170, 0.2)",
  "--time-input-bg": isDark.value
    ? "rgba(30, 27, 45, 0.8)"
    : "rgba(255, 255, 255, 0.9)",
  "--time-input-color": isDark.value ? "#e2e8f0" : "#374151",
  "--time-input-border": isDark.value
    ? "rgba(167, 139, 250, 0.2)"
    : "rgba(139, 92, 246, 0.15)",
  "--time-btn-color": isDark.value ? "#a78bfa" : "#8b5cf6",
  "--time-btn-hover-bg": isDark.value
    ? "rgba(167, 139, 250, 0.15)"
    : "rgba(139, 92, 246, 0.1)",
  "--time-colon-color": "#9ca3af",
  "--time-arrow-color": isDark.value ? "#a78bfa" : "#8b5cf6",
  "--state-select-bg": isDark.value
    ? "rgba(30, 27, 45, 0.8)"
    : "rgba(255, 255, 255, 0.9)",
  "--state-select-color": isDark.value ? "#e2e8f0" : "#374151",
  "--state-select-border": isDark.value
    ? "rgba(167, 139, 250, 0.2)"
    : "rgba(139, 92, 246, 0.15)",
  "--remove-btn-border": isDark.value
    ? "rgba(239, 68, 68, 0.3)"
    : "rgba(239, 68, 68, 0.2)",
  "--cancel-btn-bg": isDark.value
    ? "rgba(107, 114, 128, 0.2)"
    : "rgba(156, 163, 175, 0.15)",
  "--cancel-btn-color": isDark.value ? "#9ca3af" : "#6b7280",
  "--cancel-btn-hover-bg": isDark.value
    ? "rgba(107, 114, 128, 0.3)"
    : "rgba(156, 163, 175, 0.25)",
  "--modal-close-bg": isDark.value
    ? "rgba(255, 255, 255, 0.05)"
    : "rgba(0, 0, 0, 0.03)",
  "--modal-close-color": "#9ca3af",
}));

// 作息配置
const scheduleConfig = ref<ScheduleConfig>({
  enabled: false,
  slots: [],
});

// 监听 visible 变化，初始化配置
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      const config = getScheduleConfig();
      scheduleConfig.value = {
        enabled: config.enabled,
        slots: config.slots.map((slot) => ({ ...slot })),
      };
    }
  },
);

// 关闭弹窗
const close = () => {
  emit("close");
  isScheduleModalOpen.value = false;
  if (!isAnyUiOpen.value) setPassthrough(true);
};

// 切换作息启用状态
const toggleSchedule = () => {
  scheduleConfig.value.enabled = !scheduleConfig.value.enabled;
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

// 处理时间输入（循环）
const handleTimeChange = (type: "hour" | "minute", e: Event): number => {
  const target = e.target as HTMLInputElement;
  const max = type === "hour" ? 23 : 59;
  let newValue = parseInt(target.value);

  if (isNaN(newValue)) {
    newValue = 0;
  }

  if (newValue > max) {
    newValue = 0;
  } else if (newValue < 0) {
    newValue = max;
  }

  target.value = newValue.toString().padStart(2, "0");
  return newValue;
};

// 格式化时间显示为两位数字
const formatTime = (value: number) => {
  return value.toString().padStart(2, "0");
};

// 增减时间值
const adjustTime = (
  slot: TimeSlot,
  field: "startHour" | "startMinute" | "endHour" | "endMinute",
  delta: number,
) => {
  const max = field.includes("Hour") ? 23 : 59;
  let newValue = slot[field] + delta;

  if (newValue > max) {
    newValue = 0;
  } else if (newValue < 0) {
    newValue = max;
  }

  slot[field] = newValue;
};

// 保存配置
const saveSchedule = () => {
  updateScheduleConfig(scheduleConfig.value);
  close();
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-pop">
      <div
        v-if="visible"
        class="schedule-modal-overlay"
        :style="cssVars"
        @click="close"
      >
        <div
          class="schedule-modal"
          :class="{ 'dark-mode': isDark }"
          @click.stop
        >
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
            <button class="modal-close" @click="close">
              <span>✕</span>
            </button>
          </div>

          <div class="modal-body">
            <!-- 启用开关 -->
            <div class="toggle-card">
              <div class="toggle-info">
                <span class="toggle-title">自动作息</span>
                <span class="toggle-desc">到时间自动睡觉、起床和工作</span>
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
                  :class="{
                    'is-sleep': slot.state === 'sleep',
                    'is-work': slot.state === 'work',
                  }"
                >
                  <div class="slot-icon">
                    {{
                      slot.state === "sleep"
                        ? "😴"
                        : slot.state === "work"
                          ? "💼"
                          : "🎈"
                    }}
                  </div>
                  <div class="slot-time-inputs">
                    <div class="time-group">
                      <div class="time-input-wrapper">
                        <input
                          type="text"
                          inputmode="numeric"
                          :value="formatTime(slot.startHour)"
                          @input="
                            (e) =>
                              (slot.startHour = handleTimeChange('hour', e))
                          "
                          class="time-input"
                        />
                        <div class="time-controls">
                          <button
                            class="time-btn time-btn-up"
                            @click.stop="adjustTime(slot, 'startHour', 1)"
                          >
                            ▲
                          </button>
                          <button
                            class="time-btn time-btn-down"
                            @click.stop="adjustTime(slot, 'startHour', -1)"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                      <span class="time-colon">:</span>
                      <div class="time-input-wrapper">
                        <input
                          type="text"
                          inputmode="numeric"
                          :value="formatTime(slot.startMinute)"
                          @input="
                            (e) =>
                              (slot.startMinute = handleTimeChange('minute', e))
                          "
                          class="time-input"
                        />
                        <div class="time-controls">
                          <button
                            class="time-btn time-btn-up"
                            @click.stop="adjustTime(slot, 'startMinute', 1)"
                          >
                            ▲
                          </button>
                          <button
                            class="time-btn time-btn-down"
                            @click.stop="adjustTime(slot, 'startMinute', -1)"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>
                    <span class="time-arrow">→</span>
                    <div class="time-group">
                      <div class="time-input-wrapper">
                        <input
                          type="text"
                          inputmode="numeric"
                          :value="formatTime(slot.endHour)"
                          @input="
                            (e) => (slot.endHour = handleTimeChange('hour', e))
                          "
                          class="time-input"
                        />
                        <div class="time-controls">
                          <button
                            class="time-btn time-btn-up"
                            @click.stop="adjustTime(slot, 'endHour', 1)"
                          >
                            ▲
                          </button>
                          <button
                            class="time-btn time-btn-down"
                            @click.stop="adjustTime(slot, 'endHour', -1)"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                      <span class="time-colon">:</span>
                      <div class="time-input-wrapper">
                        <input
                          type="text"
                          inputmode="numeric"
                          :value="formatTime(slot.endMinute)"
                          @input="
                            (e) =>
                              (slot.endMinute = handleTimeChange('minute', e))
                          "
                          class="time-input"
                        />
                        <div class="time-controls">
                          <button
                            class="time-btn time-btn-up"
                            @click.stop="adjustTime(slot, 'endMinute', 1)"
                          >
                            ▲
                          </button>
                          <button
                            class="time-btn time-btn-down"
                            @click.stop="adjustTime(slot, 'endMinute', -1)"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <select v-model="slot.state" class="state-select">
                    <option value="sleep">睡眠</option>
                    <option value="work">工作</option>
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
            <button class="btn btn-cancel" @click="close">取消</button>
            <button class="btn btn-save" @click="saveSchedule">
              <span>✓</span> 保存
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.schedule-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--overlay-bg);
  backdrop-filter: blur(8px);
  pointer-events: auto !important;
}

.schedule-modal {
  width: 480px;
  max-width: 90vw;
  height: 70vh;
  border-radius: 24px;
  background: var(--modal-bg);
  box-shadow: var(--modal-shadow);
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

.star-1 {
  top: 20px;
  right: 60px;
  animation-delay: 0s;
}

.star-2 {
  top: 40px;
  right: 20px;
  animation-delay: 0.5s;
}

.star-3 {
  top: 60px;
  right: 80px;
  animation-delay: 1s;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
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
  background: var(--modal-close-bg);
  color: var(--modal-close-color);
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
  background: var(--toggle-card-bg);
  border-radius: 16px;
  border: 1px solid var(--toggle-card-border);
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
  color: var(--toggle-title-color);
}

.toggle-desc {
  font-size: 12px;
  color: var(--toggle-desc-color);
}

.toggle-switch {
  width: 52px;
  height: 28px;
  border: none;
  border-radius: 14px;
  background: var(--toggle-switch-bg);
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
  color: var(--slots-title-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--add-btn-border);
  background: transparent;
  border-radius: 8px;
  color: var(--add-btn-color);
  font-size: 18px;
  font-weight: 300;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: var(--add-btn-hover-bg);
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
  background: var(--slot-card-bg);
  border-radius: 14px;
  border: 1px solid var(--slot-card-border);
  transition: all 0.2s ease;
}

.slot-card:hover {
  border-color: var(--slot-card-hover-border);
}

.slot-card.is-sleep {
  background: var(--sleep-slot-bg);
}

.slot-card.is-work {
  background: var(--work-slot-bg);
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

.time-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.time-input {
  width: 50px;
  padding: 6px 18px 6px 4px;
  border: 1px solid var(--time-input-border);
  border-radius: 8px;
  background: var(--time-input-bg);
  color: var(--time-input-color);
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

.time-controls {
  position: absolute;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.time-btn {
  width: 14px;
  height: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--time-btn-color);
  font-size: 8px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.15s ease;
  padding: 0;
}

.time-btn:hover {
  opacity: 1;
  background: var(--time-btn-hover-bg);
  border-radius: 2px;
}

.time-btn:active {
  transform: scale(0.9);
}

.time-colon {
  color: var(--time-colon-color);
  font-weight: 600;
}

.time-arrow {
  color: var(--time-arrow-color);
  font-size: 12px;
  margin: 0 4px;
}

.state-select {
  padding: 8px 12px;
  border: 1px solid var(--state-select-border);
  border-radius: 10px;
  background: var(--state-select-bg);
  color: var(--state-select-color);
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
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--remove-btn-border);
  background: transparent;
  color: #ef4444;
  border-radius: 8px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 500;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  opacity: 1;
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  transform: scale(1.05);
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
  background: var(--cancel-btn-bg);
  color: var(--cancel-btn-color);
}

.btn-cancel:hover {
  background: var(--cancel-btn-hover-bg);
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

/* 动画 */
.modal-pop-enter-active {
  animation: modal-pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-pop-leave-active {
  animation: modal-pop-out 0.2s ease-in;
}

@keyframes modal-pop-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes modal-pop-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
