import { ref } from "vue";
import { dialogueMessages } from "../dialogues";
import { petState } from "./sharedState";
import { isDragging } from "./sharedState";

// 对话气泡状态
export const dialogueText = ref<string | null>(null);
export const dialogueTimer = ref<number | null>(null);
export const isDialogueVisible = ref(false);

// 显示对话气泡
export function showDialogue() {
  // 如果已经在显示或者正在拖动，不显示
  if (isDialogueVisible.value || isDragging.value) return;

  // 随机决定是否显示对话（30%概率）
  if (Math.random() > 0.3) return;

  const messages = dialogueMessages[petState.value] || dialogueMessages.idle;
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
