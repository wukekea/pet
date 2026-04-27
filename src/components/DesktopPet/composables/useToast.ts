import { ref } from "vue";

/**
 * 通用 Toast 提示 composable
 * @param duration 显示时长（毫秒），默认 2000
 */
export function useToast(duration = 2000) {
  const toastMessage = ref("");
  const toastVisible = ref(false);
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  function showToast(msg: string) {
    toastMessage.value = msg;
    toastVisible.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastVisible.value = false;
    }, duration);
  }

  return { toastMessage, toastVisible, showToast };
}
