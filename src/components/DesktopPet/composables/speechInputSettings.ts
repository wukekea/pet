import { ref, computed } from "vue";
import { createLocalStorage } from "../utils/storage";

// 语音输入设置存储
interface SpeechInputSettings {
  enabled: boolean;
}

const storage = createLocalStorage<SpeechInputSettings>(
  "pet-speech-input-settings",
  {
    enabled: false, // 默认关闭，需要用户手动开启
  },
);

const saved = storage.load();

export const speechInputEnabled = ref(saved.enabled);

// 语音输入依赖状态
export const speechInputStatus = ref({
  soxInstalled: false,
  whisperInstalled: false,
  modelExists: false,
  ready: false,
});

export const isCheckingStatus = ref(false);

// 保存设置
export function saveSpeechInputSettings() {
  storage.save({
    enabled: speechInputEnabled.value,
  });
}

// 检查依赖状态
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

// 获取未安装的依赖列表
export const missingDependencies = computed(() => {
  const missing = [];
  if (!speechInputStatus.value.soxInstalled) {
    missing.push({
      name: "sox",
      desc: "音频录制工具",
      installCmd: "brew install sox",
    });
  }
  if (!speechInputStatus.value.whisperInstalled) {
    missing.push({
      name: "whisper-cpp",
      desc: "语音识别引擎",
      installCmd: "brew install whisper-cpp",
    });
  }
  if (!speechInputStatus.value.modelExists) {
    missing.push({
      name: "ggml-base.bin",
      desc: "语音识别模型（约150MB）",
      installCmd:
        'mkdir -p ~/.whisper-models && curl -L "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin" -o ~/.whisper-models/ggml-base.bin',
    });
  }
  return missing;
});

// 是否所有依赖都已安装
export const isSpeechInputReady = computed(() => speechInputStatus.value.ready);

// 切换语音输入开关
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

// 初始化时检查状态（但不自动开启）
if (typeof window !== "undefined") {
  // 延迟检查，等待 Electron 就绪
  setTimeout(() => {
    checkSpeechInputDependencies();
  }, 2000);
}
