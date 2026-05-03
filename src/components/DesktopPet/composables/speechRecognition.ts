import { ref } from "vue";

// 语音识别状态
export const isRecording = ref(false);
export const recognitionText = ref("");
export const recognitionError = ref("");
export const isSupported = ref(false);

// 检查浏览器支持
function checkSupport(): boolean {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const supported = !!SpeechRecognition;
  console.log("[SpeechRecognition] 支持状态:", supported);
  return supported;
}

// 初始化支持状态
isSupported.value = checkSupport();

// 当前识别实例
let recognitionInstance: SpeechRecognition | null = null;

// 创建识别实例
function createRecognition(): SpeechRecognition | null {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "zh-CN";

  return recognition;
}

// 开始录音
export function startRecording(
  onResult?: (text: string, isFinal: boolean) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isSupported.value) {
      reject(new Error("浏览器不支持语音识别"));
      return;
    }

    if (isRecording.value) {
      resolve();
      return;
    }

    recognitionError.value = "";
    recognitionText.value = "";

    try {
      recognitionInstance = createRecognition();
      if (!recognitionInstance) {
        reject(new Error("创建语音识别实例失败"));
        return;
      }

      recognitionInstance.onstart = () => {
        isRecording.value = true;
        resolve();
      };

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const currentText = finalTranscript || interimTranscript;
        recognitionText.value = currentText;
        console.log(
          "[SpeechRecognition] 识别结果:",
          currentText,
          "是否最终:",
          !!finalTranscript,
        );
        onResult?.(currentText, !!finalTranscript);
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMessages: Record<string, string> = {
          "no-speech": "未检测到语音，请重试",
          "audio-capture": "无法访问麦克风",
          "not-allowed": "麦克风权限被拒绝",
          network: "网络错误，请检查连接",
          aborted: "识别已取消",
        };
        recognitionError.value =
          errorMessages[event.error] || `识别错误: ${event.error}`;
        console.error("[SpeechRecognition] 错误:", event.error, event.message);
        isRecording.value = false;
        recognitionInstance = null;
      };

      recognitionInstance.onend = () => {
        isRecording.value = false;
        recognitionInstance = null;
      };

      recognitionInstance.start();
    } catch (err) {
      reject(err);
    }
  });
}

// 停止录音
export function stopRecording(): void {
  if (recognitionInstance) {
    recognitionInstance.stop();
    recognitionInstance = null;
  }
  isRecording.value = false;
}

// 切换录音状态
export async function toggleRecording(
  onResult?: (text: string, isFinal: boolean) => void,
): Promise<boolean> {
  if (isRecording.value) {
    stopRecording();
    return false;
  } else {
    await startRecording(onResult);
    return true;
  }
}

// 清理资源
export function cleanupRecognition(): void {
  stopRecording();
}
