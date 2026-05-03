import { ref, watch } from "vue";
import { createLocalStorage } from "../utils/storage";

// 语音引擎类型
export type SpeechEngine = "browser" | "edge";

// 语音设置存储
interface SpeechSettings {
  enabled: boolean;
  engine: SpeechEngine;
  rate: number;
  pitch: number;
  volume: number;
}

const speechStorage = createLocalStorage<SpeechSettings>(
  "pet-speech-settings",
  {
    enabled: true,
    engine: "browser", // 默认使用浏览器 TTS
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  },
);

const savedSettings = speechStorage.load();

export const speechEnabled = ref(savedSettings.enabled);
export const speechEngine = ref<SpeechEngine>(savedSettings.engine);
export const speechRate = ref(savedSettings.rate);
export const speechPitch = ref(savedSettings.pitch);
export const speechVolume = ref(savedSettings.volume);
export const isEdgeReady = ref(false);
export const isEdgeLoading = ref(false);
export const edgeStatus = ref("");

// 监听设置变化并持久化
watch(
  [speechEnabled, speechEngine, speechRate, speechPitch, speechVolume],
  ([enabled, engine, rate, pitch, volume]) => {
    speechStorage.save({ enabled, engine, rate, pitch, volume });
  },
  { deep: true },
);

// ========== 浏览器 TTS ==========
let cachedVoices: SpeechSynthesisVoice[] = [];

export function isSpeechSupported(): boolean {
  return "speechSynthesis" in window;
}

function updateVoiceCache(): void {
  if (!isSpeechSupported()) return;
  cachedVoices = window.speechSynthesis.getVoices();
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (cachedVoices.length === 0) {
    updateVoiceCache();
  }
  return cachedVoices;
}

export function getChineseVoice(): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();

  const chineseVoice =
    voices.find((v) => v.lang.startsWith("zh") && v.name.includes("Ting")) ||
    voices.find((v) => v.lang.startsWith("zh") && v.name.includes("Mei")) ||
    voices.find(
      (v) => v.lang.startsWith("zh") && v.name.toLowerCase().includes("female"),
    ) ||
    voices.find((v) => v.lang.startsWith("zh"));

  return chineseVoice || voices[0] || null;
}

function speakWithBrowser(text: string): void {
  if (!isSpeechSupported()) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = speechRate.value;
  utterance.pitch = speechPitch.value;
  utterance.volume = speechVolume.value;

  const voice = getChineseVoice();
  if (voice) {
    utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
}

// ========== Edge TTS ==========
async function initEdgeTTS(): Promise<boolean> {
  if (isEdgeReady.value) return true;
  if (isEdgeLoading.value) return false;

  isEdgeLoading.value = true;
  edgeStatus.value = "正在初始化...";

  try {
    // 通过 IPC 调用主进程初始化 Edge TTS
    if (window.electronAPI?.initEdgeTTS) {
      const result = await window.electronAPI.initEdgeTTS(
        (_status: string, message: string) => {
          edgeStatus.value = message;
        },
      );
      isEdgeReady.value = result;
      return result;
    }
    edgeStatus.value = "不支持 Edge TTS";
    return false;
  } catch (error) {
    console.error("Edge TTS 初始化失败:", error);
    edgeStatus.value = "初始化失败";
    return false;
  } finally {
    isEdgeLoading.value = false;
  }
}

async function speakWithEdge(text: string): Promise<void> {
  if (!isEdgeReady.value) {
    const ready = await initEdgeTTS();
    if (!ready) {
      console.warn("Edge TTS 未就绪，回退到浏览器语音");
      speakWithBrowser(text);
      return;
    }
  }

  if (window.electronAPI?.speakWithEdgeTTS) {
    await window.electronAPI.speakWithEdgeTTS(text);
  }
}

// ========== 统一接口 ==========
export async function speak(text: string): Promise<void> {
  if (!speechEnabled.value) return;

  stopSpeaking();

  if (speechEngine.value === "edge") {
    await speakWithEdge(text);
  } else {
    speakWithBrowser(text);
  }
}

export function stopSpeaking(): void {
  if (speechEngine.value === "browser" && isSpeechSupported()) {
    window.speechSynthesis.cancel();
  } else if (speechEngine.value === "edge" && window.electronAPI?.stopEdgeTTS) {
    window.electronAPI.stopEdgeTTS();
  }
}

export async function switchEngine(engine: SpeechEngine): Promise<boolean> {
  if (engine === "edge") {
    const ready = await initEdgeTTS();
    if (ready) {
      speechEngine.value = engine;
      return true;
    }
    return false;
  }
  speechEngine.value = engine;
  return true;
}

export function toggleSpeech(): boolean {
  speechEnabled.value = !speechEnabled.value;

  if (!speechEnabled.value) {
    stopSpeaking();
  }

  return speechEnabled.value;
}

// 清理函数引用
let speechCleanupFn: (() => void) | null = null;

// 清理语音监听
export function cleanupSpeech(): void {
  if (speechCleanupFn) {
    speechCleanupFn();
    speechCleanupFn = null;
  }
}

export function initSpeech(): void {
  if (!isSpeechSupported()) return;

  // 清理之前的监听
  cleanupSpeech();

  updateVoiceCache();

  window.speechSynthesis.addEventListener("voiceschanged", updateVoiceCache);

  // 保存清理函数
  speechCleanupFn = () => {
    window.speechSynthesis.removeEventListener(
      "voiceschanged",
      updateVoiceCache,
    );
  };

  // 如果设置是 Edge，尝试初始化
  if (speechEngine.value === "edge") {
    initEdgeTTS();
  }
}
