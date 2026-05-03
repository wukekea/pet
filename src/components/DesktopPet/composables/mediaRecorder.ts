import { ref } from "vue";

// 录音状态
export const isRecording = ref(false);
export const isSupported = ref(false);
export const recordingError = ref("");

// 检查浏览器支持
export function checkMediaRecorderSupport(): boolean {
  const supported = !!(navigator.mediaDevices && window.MediaRecorder);
  console.log("[MediaRecorder] 支持状态:", supported);
  isSupported.value = supported;
  return supported;
}

// 初始化时检查支持
if (typeof window !== "undefined") {
  checkMediaRecorderSupport();
}

// 当前录音实例
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let microphone: MediaStreamAudioSourceNode | null = null;

// 获取音频流
async function getAudioStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 16000,
    },
  });
}

// 开始录音
export async function startRecording(
  onDataAvailable?: (text: string) => void,
): Promise<void> {
  if (isRecording.value) return;

  recordingError.value = "";
  audioChunks = [];

  try {
    const stream = await getAudioStream();

    // 创建音频上下文用于检测音量
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    analyser.fftSize = 256;

    // 检测是否有声音输入
    const checkAudioLevel = () => {
      if (!isRecording.value || !analyser) return;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      console.log("[MediaRecorder] 音频音量:", average);

      if (isRecording.value) {
        requestAnimationFrame(checkAudioLevel);
      }
    };

    // 创建 MediaRecorder
    const mimeType = getSupportedMimeType();
    mediaRecorder = new MediaRecorder(stream, { mimeType });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
        console.log("[MediaRecorder] 收到音频数据:", event.data.size, "bytes");
      }
    };

    mediaRecorder.onstart = () => {
      isRecording.value = true;
      console.log("[MediaRecorder] 录音开始");
      checkAudioLevel();
    };

    mediaRecorder.onstop = () => {
      isRecording.value = false;
      console.log("[MediaRecorder] 录音停止, 数据块数:", audioChunks.length);

      // 停止所有轨道
      stream.getTracks().forEach((track) => track.stop());

      // 清理音频上下文
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }

      // 合并音频数据
      if (audioChunks.length > 0) {
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        console.log("[MediaRecorder] 音频总大小:", audioBlob.size, "bytes");

        // 这里可以发送到语音识别服务
        // 暂时返回提示
        onDataAvailable?.("[录音完成，音频大小: " + audioBlob.size + " 字节]");
      }
    };

    mediaRecorder.onerror = (event) => {
      console.error("[MediaRecorder] 错误:", event);
      recordingError.value = "录音出错";
      isRecording.value = false;
    };

    // 开始录音，每 100ms 收集一次数据
    mediaRecorder.start(100);
  } catch (err) {
    console.error("[MediaRecorder] 启动失败:", err);
    recordingError.value =
      err instanceof Error ? err.message : "无法访问麦克风";
    throw err;
  }
}

// 停止录音
export function stopRecording(): void {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
}

// 切换录音状态
export async function toggleRecording(
  onDataAvailable?: (text: string) => void,
): Promise<boolean> {
  if (isRecording.value) {
    stopRecording();
    return false;
  } else {
    await startRecording(onDataAvailable);
    return true;
  }
}

// 获取支持的 MIME 类型
function getSupportedMimeType(): string {
  const types = [
    "audio/webm",
    "audio/webm;codecs=opus",
    "audio/ogg",
    "audio/ogg;codecs=opus",
    "audio/mp4",
    "audio/wav",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      console.log("[MediaRecorder] 使用 MIME 类型:", type);
      return type;
    }
  }

  return "audio/webm";
}

// 清理资源
export function cleanupRecorder(): void {
  stopRecording();
  audioChunks = [];
}
