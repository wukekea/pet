/**
 * 自动更新逻辑
 * 从 settings/index.vue 抽出（原 320 行 script + 更新区块模板状态），
 * 封装版本获取、检查更新、下载、安装与事件监听。
 */
import { ref } from "vue";

// 更新信息类型
export interface UpdateInfo {
  success: boolean;
  currentVersion: string;
  latestVersion?: string;
  hasUpdate?: boolean;
  downloadUrl?: string;
  releaseUrl?: string;
  releaseNotes?: string;
  publishedAt?: string;
  message?: string;
}

// electronAPI 类型断言
const electronAPI = window.electronAPI as {
  getVersion?: () => Promise<string>;
  checkUpdate?: () => Promise<UpdateInfo>;
  downloadUpdate?: (
    downloadUrl: string,
  ) => Promise<{ success: boolean; message?: string }>;
  installUpdate?: () => void;
  onUpdateAvailable?: (callback: (info: any) => void) => () => void;
  onUpdateDownloadProgress?: (
    callback: (progress: { percent: number }) => void,
  ) => () => void;
  onUpdateDownloaded?: (callback: (info: any) => void) => () => void;
  onUpdateError?: (callback: (message: string) => void) => () => void;
  writeClipboard?: (
    text: string,
  ) => Promise<{ success: boolean; message?: string }>;
};

// 版本与更新状态
export const version = ref("1.0.0");
export const isCheckingUpdate = ref(false);
export const hasUpdate = ref(false);
export const isDownloading = ref(false);
export const downloadProgress = ref(0);
export const updateDownloaded = ref(false);
export const updateError = ref("");
export const rawError = ref(""); // 原始错误信息，用于复制
export const copySuccess = ref(false);
export const updateInfo = ref<UpdateInfo | null>(null);

// 版本初始化标记
let versionInitialized = false;

/** 初始化获取版本号（懒加载，在需要时调用） */
export async function initVersion(): Promise<void> {
  if (versionInitialized || !electronAPI.getVersion) return;
  versionInitialized = true;
  version.value = await electronAPI.getVersion();
}

/** 友好化更新错误信息 */
function friendlyUpdateError(errorMsg: string): string {
  if (
    errorMsg.includes("cannot find latest") ||
    errorMsg.includes("404") ||
    errorMsg.includes("cannot parse release feed")
  ) {
    return "暂无可用更新";
  }
  if (errorMsg.includes("network") || errorMsg.includes("ENOTFOUND")) {
    return "网络连接失败，请检查网络";
  }
  return "未知错误";
}

/** 检查更新 */
export async function checkUpdate(): Promise<void> {
  // 重置状态
  isCheckingUpdate.value = true;
  updateInfo.value = null;
  updateError.value = "";
  rawError.value = "";
  hasUpdate.value = false;
  updateDownloaded.value = false;

  if (!electronAPI.checkUpdate) {
    isCheckingUpdate.value = false;
    updateError.value = "检查更新功能仅在打包后的应用中可用";
    rawError.value = updateError.value;
    return;
  }

  try {
    const result = await electronAPI.checkUpdate();
    if (result.success) {
      hasUpdate.value = result.hasUpdate ?? false;
      updateInfo.value = result;
    } else {
      console.error("检查更新失败:", result.message);
      rawError.value = result.message || "检查更新失败";
      updateError.value = friendlyUpdateError(result.message || "");
      // 保留当前版本信息
      if (result.currentVersion) {
        updateInfo.value = {
          success: false,
          currentVersion: result.currentVersion,
          hasUpdate: false,
        };
      }
    }
  } catch (error: any) {
    console.error("检查更新出错:", error);
    rawError.value = error.message || "检查更新出错";
    updateError.value = friendlyUpdateError(error.message || "");
  } finally {
    isCheckingUpdate.value = false;
  }
}

/** 复制原始错误信息到剪贴板 */
export async function copyError(): Promise<void> {
  if (!rawError.value) return;
  try {
    // 优先使用 Electron API
    if (electronAPI.writeClipboard) {
      const result = await electronAPI.writeClipboard(rawError.value);
      if (result.success) {
        copySuccess.value = true;
        setTimeout(() => {
          copySuccess.value = false;
        }, 2000);
      } else {
        console.error("复制失败:", result.message);
      }
    } else {
      // 备用方案：使用 Web API
      await navigator.clipboard.writeText(rawError.value);
      copySuccess.value = true;
      setTimeout(() => {
        copySuccess.value = false;
      }, 2000);
    }
  } catch (err) {
    console.error("复制失败:", err);
  }
}

/** 下载更新 */
export async function downloadUpdate(): Promise<void> {
  if (!electronAPI.downloadUpdate) return;

  const downloadUrl = updateInfo.value?.downloadUrl;
  if (!downloadUrl) {
    updateError.value = "未获取到下载地址";
    rawError.value = "缺少 downloadUrl";
    return;
  }

  isDownloading.value = true;
  downloadProgress.value = 0;
  updateError.value = "";
  rawError.value = "";

  try {
    const result = await electronAPI.downloadUpdate(downloadUrl);
    if (!result.success) {
      rawError.value = result.message || "下载失败";
      updateError.value = "下载失败";
    }
  } catch (error: any) {
    console.error("下载更新出错:", error);
    rawError.value = error.message || "下载出错";
    updateError.value = "下载失败";
  } finally {
    isDownloading.value = false;
  }
}

/** 安装更新 */
export function installUpdate(): void {
  if (electronAPI.installUpdate) {
    electronAPI.installUpdate();
  }
}

// ===== 事件监听（模块加载时注册一次，替代原组件内多次注册）=====

if (electronAPI.onUpdateDownloadProgress) {
  electronAPI.onUpdateDownloadProgress((progress) => {
    downloadProgress.value = progress.percent;
  });
}

if (electronAPI.onUpdateDownloaded) {
  electronAPI.onUpdateDownloaded(() => {
    updateDownloaded.value = true;
    isDownloading.value = false;
  });
}

if (electronAPI.onUpdateError) {
  electronAPI.onUpdateError((message) => {
    rawError.value = message;
    updateError.value = "未知错误";
    isDownloading.value = false;
  });
}
