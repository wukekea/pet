/**
 * 语音输入统一模块（设置开关 + 录音识别 + 依赖检测）
 *
 * 此前 speechInputSettings.ts 与 nativeSpeechRecognition.ts 两套并行实现：
 * 都调 electronAPI.speechCheckStatus、各持一份 sox/whisper/model 状态、
 * 都在模块顶层 setTimeout 发副作用。现合并为一个模块，单一状态源。
 */
import { ref, computed } from "vue";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { createLocalStorage } from "../utils/storage";

// ========== 依赖检测状态（单一源） ==========

// 依赖安装状态
export const speechInputStatus = ref({
  soxInstalled: false,
  whisperInstalled: false,
  modelExists: false,
  ready: false,
});

// 是否正在检测中（设置面板的刷新按钮/开关共用）
export const isCheckingStatus = ref(false);

// 是否所有依赖都已安装
export const isSpeechInputReady = computed(() => speechInputStatus.value.ready);

/**
 * 检查依赖状态（ChatPanel 的支持检测与设置面板的刷新共用）
 * 返回是否就绪；结果同时写入 speechInputStatus
 */
export async function checkSpeechInputDependencies(): Promise<boolean> {
  const api = (window as any).electronAPI;
  if (!api?.speechCheckStatus) {
    return false;
  }

  isCheckingStatus.value = true;
  try {
    const status = await api.speechCheckStatus();
    speechInputStatus.value = status;
    return status.ready;
  } finally {
    isCheckingStatus.value = false;
  }
}

// ========== 设置开关 ==========

// 语音输入设置存储
interface SpeechInputSettings {
  enabled: boolean;
}

const storage = createLocalStorage<SpeechInputSettings>(
  STORAGE_KEYS.speechInput,
  {
    enabled: false, // 默认关闭，需要用户手动开启
  },
);

const saved = storage.load();

export const speechInputEnabled = ref(saved.enabled);

// 保存设置
function saveSpeechInputSettings() {
  storage.save({
    enabled: speechInputEnabled.value,
  });
}

// 切换语音输入开关（开启前先检查依赖）
export async function toggleSpeechInput(): Promise<boolean> {
  // 如果要开启，先检查依赖
  if (!speechInputEnabled.value) {
    const ready = await checkSpeechInputDependencies();
    if (!ready) {
      // 依赖未就绪，不开启
      return false;
    }
  }

  speechInputEnabled.value = !speechInputEnabled.value;
  saveSpeechInputSettings();
  return speechInputEnabled.value;
}

// ========== 录音识别 ==========

// 录音状态
export const isRecording = ref(false);
export const isSupported = computed(() => isSpeechInputReady.value);
export const recordingError = ref("");

// 开始录音
export async function startNativeRecording(): Promise<void> {
  const api = (window as any).electronAPI;
  if (!api?.speechStart) {
    throw new Error("语音识别未初始化");
  }

  recordingError.value = "";
  const result = await api.speechStart();

  if (!result.success) {
    throw new Error(result.error || "录音启动失败");
  }

  isRecording.value = true;
}

// 停止录音并识别
export async function stopNativeRecording(): Promise<string> {
  const api = (window as any).electronAPI;
  if (!api?.speechStop) {
    throw new Error("语音识别未初始化");
  }

  const result = await api.speechStop();
  isRecording.value = false;

  if (!result.success) {
    throw new Error(result.error || "识别失败");
  }

  return result.text || "";
}

// 切换录音状态
export async function toggleNativeRecording(
  onResult?: (text: string, isFinal: boolean) => void,
): Promise<boolean> {
  if (isRecording.value) {
    try {
      const text = await stopNativeRecording();
      onResult?.(text, true);
      return false;
    } catch (err) {
      recordingError.value = err instanceof Error ? err.message : "识别失败";
      throw err;
    }
  } else {
    await startNativeRecording();
    onResult?.("", false);
    return true;
  }
}

// 清理资源
export function cleanupNativeRecorder(): void {
  if (isRecording.value) {
    stopNativeRecording().catch(console.error);
  }
}

// ========== 初始化 ==========

// 延迟检查依赖状态（等待 Electron IPC 就绪；不自动开启语音输入）
if (typeof window !== "undefined") {
  setTimeout(() => {
    checkSpeechInputDependencies();
  }, 1000);
}
