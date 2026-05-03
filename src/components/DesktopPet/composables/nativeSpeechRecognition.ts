import { ref } from "vue";

// 语音识别状态
export const isRecording = ref(false);
export const isSupported = ref(false);
export const recordingError = ref("");
export const statusMessage = ref("");

// 检查支持状态
export async function checkNativeSpeechSupport(): Promise<boolean> {
  const api = (window as any).electronAPI;
  if (!api?.speechCheckStatus) {
    console.log("[NativeSpeech] IPC 未注册");
    isSupported.value = false;
    return false;
  }

  try {
    const status = await api.speechCheckStatus();
    console.log("[NativeSpeech] 状态:", status);
    isSupported.value = status.ready;

    if (!status.ready) {
      const errors = [];
      if (!status.soxInstalled) errors.push("sox 未安装");
      if (!status.whisperInstalled) errors.push("whisper-cpp 未安装");
      if (!status.modelExists) errors.push("模型未下载");
      statusMessage.value = errors.join(", ");
    } else {
      statusMessage.value = "就绪";
    }

    return status.ready;
  } catch (err) {
    console.error("[NativeSpeech] 检查失败:", err);
    isSupported.value = false;
    return false;
  }
}

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

// 延迟检查支持状态（等待 Electron IPC 就绪）
if (typeof window !== "undefined") {
  setTimeout(() => {
    checkNativeSpeechSupport();
  }, 1000);
}
