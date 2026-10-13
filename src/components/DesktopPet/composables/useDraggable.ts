/**
 * 面板拖拽 composable
 * 统一 ChatPanel / DebugPanel 的"标题栏拖动面板"实现。
 * 宠物本体的拖拽不走这里——它与状态机深度耦合
 * （打工计时恢复/睡眠行走等），是业务逻辑而非纯 UI 拖拽。
 */
import { ref, onBeforeUnmount } from "vue";

/**
 * 可拖拽面板位置
 * 用法：
 *   const { pos, isDragging, onDragStart } = useDraggable({ x: 20, y: 80 })
 *   <div :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
 *        @mousedown="onDragStart">标题栏</div>
 */
export function useDraggable(initial: { x: number; y: number }) {
  const pos = ref({ ...initial });
  const isDragging = ref(false);
  const dragStart = { mx: 0, my: 0, px: 0, py: 0 };

  function onDragStart(e: MouseEvent) {
    if (e.button !== 0) return;
    isDragging.value = true;
    dragStart.mx = e.clientX;
    dragStart.my = e.clientY;
    dragStart.px = pos.value.x;
    dragStart.py = pos.value.y;
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd);
  }

  function onDragMove(e: MouseEvent) {
    if (!isDragging.value) return;
    pos.value = {
      x: dragStart.px + (e.clientX - dragStart.mx),
      y: dragStart.py + (e.clientY - dragStart.my),
    };
  }

  function onDragEnd() {
    isDragging.value = false;
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("mouseup", onDragEnd);
  }

  onBeforeUnmount(() => {
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("mouseup", onDragEnd);
  });

  return { pos, isDragging, onDragStart };
}
