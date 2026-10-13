import { ref } from "vue";
import { setPassthrough } from "./passthrough";
import {
  isScheduleModalOpen,
  isStatsModalOpen,
  isAttributeModalOpen,
  isShopModalOpen,
  isWarehouseModalOpen,
  isChatPanelOpen,
  isSettingsModalOpen,
  isContextMenuOpen,
  isAnyUiOpen,
} from "./sharedState";

/**
 * 弹窗开关统一管理
 * 单一真相：每个弹窗的可见性只存在于 sharedState 的 isXxxOpen ref，
 * open/close 方法操作同一份 ref（此前本地 ref + sharedRef 双源同步，
 * open 要写两处、极易失同步，已移除本地副本）。
 */

// 弹窗类型到 sharedState 中对应的 ref
const MODAL_STATE_MAP = {
  schedule: isScheduleModalOpen,
  stats: isStatsModalOpen,
  attribute: isAttributeModalOpen,
  shop: isShopModalOpen,
  warehouse: isWarehouseModalOpen,
  chat: isChatPanelOpen,
  settings: isSettingsModalOpen,
} as const;

type ModalKey = keyof typeof MODAL_STATE_MAP;

export type ModalController = {
  /** 弹窗可见性（sharedState 单源，可直接绑定） */
  visible: import("vue").Ref<boolean>;
  open: () => void;
  close: () => void;
};

const modals = {} as Record<ModalKey, ModalController>;

for (const key of Object.keys(MODAL_STATE_MAP) as ModalKey[]) {
  modals[key] = {
    visible: MODAL_STATE_MAP[key],
    open: () => {
      setPassthrough(false);
      MODAL_STATE_MAP[key].value = true;
      // 关闭右键菜单
      isContextMenuOpen.value = false;
      contextMenuVisible.value = false;
    },
    close: () => {
      MODAL_STATE_MAP[key].value = false;
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
  settings: settingsModal,
} = modals;
