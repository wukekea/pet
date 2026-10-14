// 防抖保存工具 - 限频 + 尾随保存
//
// 实现要点：首次调用时排定"不可重置"的定时器（节流），
// 期间的新调用只标记 pending、顺延一个尾随定时器。
// 纯防抖（每次调用重置定时器）在高频调用方（如每秒一次的属性
// tick）下定时器永远被重置，存档在应用运行期间永远不会落盘，
// 崩溃/强退时丢失全部进度——本工具的调用方恰恰都是高频场景。

export function createDebouncedSave(
  saveFn: () => void,
  delay = 2000,
): {
  /** 标记有数据待保存并启动定时器 */
  save: () => void;
  /** 立即保存（跳过延迟） */
  flush: () => void;
  /** 当前是否有待保存的数据 */
  readonly hasPending: boolean;
} {
  let throttleTimer: ReturnType<typeof setTimeout> | null = null;
  let trailingTimer: ReturnType<typeof setTimeout> | null = null;
  let hasPendingSave = false;

  const doSave = () => {
    if (hasPendingSave) {
      saveFn();
      hasPendingSave = false;
    }
  };

  const save = () => {
    hasPendingSave = true;

    // 节流窗口内：只保证窗口结束时保存一次（尾随）
    if (throttleTimer !== null) {
      if (trailingTimer === null) {
        trailingTimer = setTimeout(() => {
          trailingTimer = null;
          doSave();
        }, delay);
      }
      return;
    }

    // 首次调用：排定不可重置的定时器
    throttleTimer = setTimeout(() => {
      throttleTimer = null;
      doSave();
    }, delay);
  };

  const flush = () => {
    if (throttleTimer) {
      clearTimeout(throttleTimer);
      throttleTimer = null;
    }
    if (trailingTimer) {
      clearTimeout(trailingTimer);
      trailingTimer = null;
    }
    doSave();
  };

  return {
    save,
    flush,
    get hasPending() {
      return hasPendingSave;
    },
  };
}
