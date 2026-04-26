// 防抖保存工具 - 延迟保存，期间有新变化会重置定时器

export function createDebouncedSave(
  saveFn: () => void,
  delay = 2000,
): {
  /** 标记有数据待保存并启动防抖定时器 */
  save: () => void;
  /** 立即保存（跳过防抖延迟） */
  flush: () => void;
  /** 当前是否有待保存的数据 */
  readonly hasPending: boolean;
} {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let hasPendingSave = false;

  const save = () => {
    hasPendingSave = true;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      if (hasPendingSave) {
        saveFn();
        hasPendingSave = false;
      }
    }, delay);
  };

  const flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (hasPendingSave) {
      saveFn();
      hasPendingSave = false;
    }
  };

  return {
    save,
    flush,
    get hasPending() {
      return hasPendingSave;
    },
  };
}
