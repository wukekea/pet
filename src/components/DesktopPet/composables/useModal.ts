import { ref } from "vue";
import { setPassthrough } from "./passthrough";
import {
  isScheduleModalOpen,
  isStatsModalOpen,
  isAttributeModalOpen,
  isShopModalOpen,
  isWarehouseModalOpen,
  isChatPanelOpen,
  isContextMenuOpen,
  isAnyUiOpen,
} from "./sharedState";

// 弹窗类型到 sharedState 中对应的 ref
const MODAL_STATE_MAP = {
  schedule: isScheduleModalOpen,
  stats: isStatsModalOpen,
  attribute: isAttributeModalOpen,
  shop: isShopModalOpen,
  warehouse: isWarehouseModalOpen,
  chat: isChatPanelOpen,
} as const;

type ModalKey = keyof typeof MODAL_STATE_MAP;

// 为每个弹窗创建本地可见性 ref 和 open/close 方法
const modals: Record<
  ModalKey,
  {
    visible: import("vue").Ref<boolean>;
    open: () => void;
    close: () => void;
  }
> = {} as any;

for (const key of Object.keys(MODAL_STATE_MAP) as ModalKey[]) {
  const visible = ref(false);
  const sharedRef = MODAL_STATE_MAP[key];

  modals[key] = {
    visible,
    open: () => {
      setPassthrough(false);
      sharedRef.value = true;
      // 关闭右键菜单
      isContextMenuOpen.value = false;
      contextMenuVisible.value = false;
      visible.value = true;
    },
    close: () => {
      visible.value = false;
      sharedRef.value = false;
      // 所有 UI 都关闭时恢复穿透
      if (!isAnyUiOpen.value) {
        setPassthrough(true);
      }
    },
  };
}

// 关闭右键菜单，并根据 UI 状态恢复穿透
export function closeContextMenu() {
  isContextMenuOpen.value = false;
  contextMenuVisible.value = false;
  if (!isAnyUiOpen.value) {
    setPassthrough(true);
  }
}

// 右键菜单本地可见性（由 index.vue 管理）
export const contextMenuVisible = ref(false);
export const contextMenuX = ref(0);
export const contextMenuY = ref(0);

// 打开右键菜单
export function openContextMenu(x: number, y: number) {
  setPassthrough(false);
  isContextMenuOpen.value = true;
  contextMenuX.value = x;
  contextMenuY.value = y;
  contextMenuVisible.value = true;
}

export const {
  schedule: scheduleModal,
  stats: statsModal,
  attribute: attributeModal,
  shop: shopModal,
  warehouse: warehouseModal,
  chat: chatModal,
} = modals;
