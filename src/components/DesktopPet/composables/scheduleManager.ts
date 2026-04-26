import type { ScheduleConfig, ScheduleState, TimeSlot } from "../types";
import { randomPick } from "../utils/random";
import {
  isInSleepSchedule,
  isInWorkSchedule,
  scheduleEnabled,
  scheduleEndTime,
  dreamTalkTimerId,
  petState,
} from "./sharedState";
import { loadScheduleConfig, saveScheduleConfig } from "./scheduleStorage";
import { changeState } from "./petController";
import { showCustomDialogue, getDreamTalk } from "./dialogue";
import {
  workScheduleEnterMessages,
  workScheduleExitMessages,
} from "../dialogues";
import { DREAM_TALK_INTERVAL, STRETCH_DURATION } from "../constants";

// 当前配置
let currentConfig: ScheduleConfig | null = null;
let scheduleCheckTimerId: ReturnType<typeof setInterval> | null = null;

// 获取当前配置
export function getScheduleConfig(): ScheduleConfig {
  if (!currentConfig) {
    currentConfig = loadScheduleConfig();
  }
  return currentConfig;
}

// 更新配置
export function updateScheduleConfig(config: ScheduleConfig): void {
  currentConfig = config;
  saveScheduleConfig(config);
  scheduleEnabled.value = config.enabled;
  // 立即检查并应用新的作息状态
  updateScheduleState();
  // 如果启用了作息，需要重新启动监控
  if (config.enabled) {
    startScheduleMonitor();
  }
}

// 检查时间段是否包含指定时间
function isTimeInSlot(hour: number, minute: number, slot: TimeSlot): boolean {
  const currentMinutes = hour * 60 + minute;
  const startMinutes = slot.startHour * 60 + slot.startMinute;
  const endMinutes = slot.endHour * 60 + slot.endMinute;

  // 处理跨天的情况（如 22:00 - 07:00）
  if (startMinutes > endMinutes) {
    // 跨天：当前时间 >= 开始时间 或 当前时间 < 结束时间
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // 同一天：开始时间 <= 当前时间 < 结束时间
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
}

// 检查当前时间所属的作息状态
export function getCurrentScheduleState(): ScheduleState {
  const config = getScheduleConfig();
  if (!config.enabled) {
    return "free";
  }

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  for (const slot of config.slots) {
    if (isTimeInSlot(hour, minute, slot)) {
      return slot.state;
    }
  }

  return "free";
}

// 计算当前作息结束时间（毫秒时间戳）
export function getScheduleEndTime(): number | null {
  const config = getScheduleConfig();
  if (!config.enabled) {
    return null;
  }

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentMinutes = hour * 60 + minute;

  for (const slot of config.slots) {
    if (isTimeInSlot(hour, minute, slot)) {
      const endMinutes = slot.endHour * 60 + slot.endMinute;
      const startMinutes = slot.startHour * 60 + slot.startMinute;

      let endDate: Date;
      if (startMinutes > endMinutes) {
        // 跨天情况
        if (currentMinutes >= startMinutes) {
          // 当前在跨天的前半段（如 22:00 之后），结束时间是第二天
          endDate = new Date(now);
          endDate.setDate(endDate.getDate() + 1);
        } else {
          // 当前在跨天的后半段（如 07:00 之前），结束时间是当天
          endDate = new Date(now);
        }
      } else {
        // 同一天
        endDate = new Date(now);
      }

      endDate.setHours(slot.endHour, slot.endMinute, 0, 0);
      return endDate.getTime();
    }
  }

  return null;
}

// 开始梦话定时器
function startDreamTalkTimer(): void {
  stopDreamTalkTimer();
  dreamTalkTimerId.value = setTimeout(() => {
    // 只有在睡眠状态时才显示梦话
    if (petState.value === "sleeping" && isInSleepSchedule.value) {
      showCustomDialogue(getDreamTalk());
    }
    // 继续下一次梦话
    if (isInSleepSchedule.value) {
      startDreamTalkTimer();
    }
  }, DREAM_TALK_INTERVAL);
}

// 停止梦话定时器
function stopDreamTalkTimer(): void {
  if (dreamTalkTimerId.value) {
    clearTimeout(dreamTalkTimerId.value);
    dreamTalkTimerId.value = null;
  }
}

// 进入睡眠作息
export function enterSleepSchedule(): void {
  if (isInSleepSchedule.value) return;

  // 退出工作作息（互斥）
  if (isInWorkSchedule.value) {
    exitWorkSchedule();
  }

  isInSleepSchedule.value = true;
  scheduleEndTime.value = getScheduleEndTime();

  // 触发打哈欠状态
  changeState("yawn");
}

// 退出睡眠作息（唤醒）
export function exitSleepSchedule(): void {
  if (!isInSleepSchedule.value) return;

  stopDreamTalkTimer();

  // 触发伸懒腰状态，然后显示问候语
  changeState("stretch");

  // 在伸懒腰结束后显示问候语
  setTimeout(() => {
    const greeting = getTimeGreetingForSleep();
    showCustomDialogue(greeting);
  }, STRETCH_DURATION);

  isInSleepSchedule.value = false;
  scheduleEndTime.value = null;
}

// 进入工作作息
export function enterWorkSchedule(): void {
  if (isInWorkSchedule.value) return;

  // 退出睡眠作息（互斥）
  if (isInSleepSchedule.value) {
    exitSleepSchedule();
  }

  isInWorkSchedule.value = true;
  scheduleEndTime.value = getScheduleEndTime();

  // 显示开工台词
  showCustomDialogue(randomPick(workScheduleEnterMessages));

  // 切换到 idle，idle 处理中会自动选工作
  changeState("idle");
}

// 退出工作作息
export function exitWorkSchedule(): void {
  if (!isInWorkSchedule.value) return;

  isInWorkSchedule.value = false;
  scheduleEndTime.value = null;

  // 显示下班台词
  showCustomDialogue(randomPick(workScheduleExitMessages));

  // 切换到 idle，恢复正常行为
  changeState("idle");
}

// 根据时间获取睡眠唤醒问候语
function getTimeGreetingForSleep(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) {
    return "早安！新的一天开始啦~";
  } else if (hour >= 11 && hour < 13) {
    return "中午好！睡得好香~";
  } else if (hour >= 13 && hour < 18) {
    return "下午好！精神满满！";
  } else {
    return "晚上好！";
  }
}

// 更新作息状态
export function updateScheduleState(): void {
  if (!scheduleEnabled.value) return;

  const currentState = getCurrentScheduleState();
  const wasInSleep = isInSleepSchedule.value;
  const wasInWork = isInWorkSchedule.value;

  if (currentState === "sleep" && !wasInSleep) {
    // 进入睡眠作息
    enterSleepSchedule();
  } else if (currentState === "work" && !wasInWork) {
    // 进入工作作息
    enterWorkSchedule();
  } else if (currentState === "free") {
    // 退出睡眠或工作作息
    if (wasInSleep) exitSleepSchedule();
    if (wasInWork) exitWorkSchedule();
  } else if (currentState === "sleep" && wasInWork) {
    // 从工作切换到睡眠
    exitWorkSchedule();
    enterSleepSchedule();
  } else if (currentState === "work" && wasInSleep) {
    // 从睡眠切换到工作
    exitSleepSchedule();
    enterWorkSchedule();
  }

  // 更新结束时间
  if (isInSleepSchedule.value || isInWorkSchedule.value) {
    scheduleEndTime.value = getScheduleEndTime();
  }
}

// 睡眠状态开始时调用
export function onSleepStart(): void {
  if (isInSleepSchedule.value) {
    startDreamTalkTimer();
  }
}

// 睡眠状态结束时调用
export function onSleepEnd(): void {
  stopDreamTalkTimer();
}

// 启动作息监控
export function startScheduleMonitor(): void {
  const config = getScheduleConfig();
  scheduleEnabled.value = config.enabled;

  if (!config.enabled) return;

  // 初始检查
  updateScheduleState();

  // 每分钟检查一次
  scheduleCheckTimerId = setInterval(() => {
    updateScheduleState();
  }, 60000);
}

// 停止作息监控
export function stopScheduleMonitor(): void {
  if (scheduleCheckTimerId) {
    clearInterval(scheduleCheckTimerId);
    scheduleCheckTimerId = null;
  }
  stopDreamTalkTimer();
}
