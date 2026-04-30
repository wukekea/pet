import { ref, watch } from "vue";
import { randomPick } from "../utils/random";
import {
  dialogueMessages,
  dreamTalkMessages,
  weatherDialogues,
  moodDialogues,
} from "../dialogues";
import { petState } from "./sharedState";
import { isDragging, moodLevel } from "./sharedState";
import { currentWeather, isWeatherChanging } from "./weatherState";
import {
  getTimePeriod,
  TIME_PERIOD_MORNING,
  TIME_PERIOD_NOON,
  TIME_PERIOD_AFTERNOON,
  TIME_PERIOD_DAWN,
} from "@/constants/time";

// 对话气泡状态
export const dialogueText = ref<string | null>(null);
export const dialogueTimer = ref<ReturnType<typeof setTimeout> | null>(null);
export const isDialogueVisible = ref(false);

// 根据时间获取问候语
export function getTimeGreeting(): string {
  const period = getTimePeriod();

  switch (period) {
    case TIME_PERIOD_MORNING:
      return "早上好！";
    case TIME_PERIOD_NOON:
      return "中午好！";
    case TIME_PERIOD_AFTERNOON:
      return "下午好！";
    case TIME_PERIOD_DAWN:
      return "这么晚了还不睡吗？";
    default:
      // 黄昏和夜晚合并为晚上好
      return "晚上好！";
  }
}

// 显示自定义对话（用于打招呼等场景）
export function showCustomDialogue(text: string) {
  dialogueText.value = text;
  isDialogueVisible.value = true;

  if (dialogueTimer.value) {
    clearTimeout(dialogueTimer.value);
  }

  // 3秒后隐藏
  dialogueTimer.value = setTimeout(() => {
    hideDialogue();
  }, 3000);
}

// 显示对话气泡
export function showDialogue() {
  // 如果已经在显示或者正在拖动，不显示
  if (isDialogueVisible.value || isDragging.value) return;

  const currentState = petState.value;

  // 翻滚、跳舞、睡眼朦胧、洗澡和吃东西状态必定显示专属台词
  const isSpecialState =
    currentState === "dancing" ||
    currentState === "rolling" ||
    currentState === "sleepy" ||
    currentState === "bathing" ||
    currentState === "eating";

  // 其他状态只有30%概率显示对话
  if (!isSpecialState && Math.random() > 0.3) return;

  // 有 20% 概率显示天气相关台词（非默认天气时）
  const weather = currentWeather.value;
  if (weather !== "default" && Math.random() < 0.2) {
    const weatherMessage = getWeatherDialogue();
    if (weatherMessage) {
      showCustomDialogue(weatherMessage);
      return;
    }
  }

  // 有 15% 概率显示心情相关台词（心情好或心情差时）
  const currentMood = moodLevel.value;
  if (currentMood !== "normal" && Math.random() < 0.15) {
    const moodMessages = moodDialogues[currentMood];
    if (moodMessages && moodMessages.length > 0) {
      showCustomDialogue(randomPick(moodMessages));
      return;
    }
  }

  const messages = dialogueMessages[currentState] || dialogueMessages.idle;
  const randomMessage = randomPick(messages);

  dialogueText.value = randomMessage;
  isDialogueVisible.value = true;

  // 清除之前的定时器
  if (dialogueTimer.value) {
    clearTimeout(dialogueTimer.value);
  }

  // 3秒后隐藏
  dialogueTimer.value = setTimeout(() => {
    hideDialogue();
  }, 3000);
}

// 隐藏对话气泡
export function hideDialogue() {
  isDialogueVisible.value = false;
  // 等待动画结束后清除文字
  setTimeout(() => {
    if (!isDialogueVisible.value) {
      dialogueText.value = null;
    }
  }, 300);
}

// 随机获取梦话（仅在睡眠期间使用）
export function getDreamTalk(): string {
  const messages = dreamTalkMessages;
  return randomPick(messages);
}

// 随机获取天气台词
export function getWeatherDialogue(): string | null {
  const weather = currentWeather.value;
  const messages = weatherDialogues[weather] || weatherDialogues.default;
  return randomPick(messages);
}

// 显示天气对话
export function showWeatherDialogue() {
  if (isDialogueVisible.value || isDragging.value) return;

  const message = getWeatherDialogue();
  if (message) {
    showCustomDialogue(message);
  }
}

// 待触发的天气对话（用于退场动画结束后触发）
let pendingWeatherDialogue = false;

// 判断是否是有退场动画的天气
const hasExitAnimation = (weather: string): boolean => {
  return (
    weather === "cloudy" ||
    weather === "lightRain" ||
    weather === "heavyRain" ||
    weather === "thunderstorm"
  );
};

// 监听天气变化
watch(currentWeather, (newWeather, oldWeather) => {
  // 天气变化时，判断是否需要等待退场动画
  if (newWeather !== oldWeather && newWeather !== "default") {
    // 从有退场动画的天气切换走时，需要等待退场动画结束
    if (oldWeather && hasExitAnimation(oldWeather)) {
      pendingWeatherDialogue = true;
    } else {
      // 其他天气切换，直接触发
      showWeatherDialogue();
    }
  }
});

// 监听天气切换状态，退场动画结束后触发天气对话
watch(isWeatherChanging, (isChanging, wasChanging) => {
  // 从 true 变为 false 时，退场动画结束
  if (wasChanging && !isChanging && pendingWeatherDialogue) {
    pendingWeatherDialogue = false;
    showWeatherDialogue();
  }
});
