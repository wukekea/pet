import { ref, watch } from "vue";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { createLocalStorage } from "../utils/storage";
import { playLocalAudio, stopLocalAudio } from "./localAudio";

// 语音设置存储
interface SpeechSettings {
  enabled: boolean;
  rate: number;
  pitch: number;
  volume: number;
}

const speechStorage = createLocalStorage<SpeechSettings>(STORAGE_KEYS.speech, {
  enabled: true,
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
});

const savedSettings = speechStorage.load();

export const speechEnabled = ref(savedSettings.enabled);
export const speechRate = ref(savedSettings.rate);
export const speechPitch = ref(savedSettings.pitch);
export const speechVolume = ref(savedSettings.volume);

// 监听设置变化并持久化
watch(
  [speechEnabled, speechRate, speechPitch, speechVolume],
  ([enabled, rate, pitch, volume]) => {
    speechStorage.save({ enabled, rate, pitch, volume });
  },
  { deep: true },
);

// ========== 浏览器 TTS（唯一的回退路径） ==========
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

// ========== 统一接口 ==========
/**
 * 播放代次：每次停止或开始新台词都会自增。
 * 本地音频在加载阶段被新台词/停止操作打断时会以失败返回，
 * 用代次把这种"被取消"与"真实加载失败"区分开——被取消的播放不得回退 TTS，
 * 否则旧句会以浏览器 TTS 与新句的本地音频同时发声（US1 验收场景 2）。
 */
let speakSeq = 0;

/**
 * 播放一句台词：优先本地预录音频，失败或无音频时回退浏览器 TTS。
 * 返回值表示是否使用了本地音频（供气泡计时判断）。
 */
export async function speak(text: string): Promise<boolean> {
  if (!speechEnabled.value) return false;

  stopSpeaking();
  const seq = speakSeq;

  const played = await playLocalAudio(text, speechVolume.value);

  // 等待期间被新的 speak / stopSpeaking 取代：静默丢弃，不回退 TTS
  if (seq !== speakSeq) return false;

  if (!played) {
    speakWithBrowser(text);
  }
  return played;
}

export function stopSpeaking(): void {
  // 使所有进行中的 speak 失效（含其尚未返回的本地音频加载）
  speakSeq++;
  stopLocalAudio();
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
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
}
