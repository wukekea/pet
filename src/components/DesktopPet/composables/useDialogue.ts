import { ref } from "vue";
import { dialogueMessages } from "../dialogues";
import { petState } from "./sharedState";
import { isDragging } from "./sharedState";

// 对话气泡状态
export const dialogueText = ref<string | null>(null);
export const dialogueTimer = ref<number | null>(null);
export const isDialogueVisible = ref(false);

// 根据时间获取问候语
export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) {
    return "早上好！";
  } else if (hour >= 11 && hour < 13) {
    return "中午好！";
  } else if (hour >= 13 && hour < 18) {
    return "下午好！";
  } else {
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
  dialogueTimer.value = window.setTimeout(() => {
    hideDialogue();
  }, 3000);
}

// 显示对话气泡
export function showDialogue() {
  // 如果已经在显示或者正在拖动，不显示
  if (isDialogueVisible.value || isDragging.value) return;

  const currentState = petState.value;

  // 翻滚和跳舞状态必定显示专属台词
  const isSpecialState =
    currentState === "dancing" || currentState === "rolling";

  // 其他状态只有30%概率显示对话
  if (!isSpecialState && Math.random() > 0.3) return;

  const messages = dialogueMessages[currentState] || dialogueMessages.idle;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  dialogueText.value = randomMessage;
  isDialogueVisible.value = true;

  // 清除之前的定时器
  if (dialogueTimer.value) {
    clearTimeout(dialogueTimer.value);
  }

  // 3秒后隐藏
  dialogueTimer.value = window.setTimeout(() => {
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
