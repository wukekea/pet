import { ref, watch } from "vue";
import { createLocalStorage } from "../utils/storage";

// 语音设置存储
interface SpeechSettings {
  enabled: boolean;
  rate: number;
  pitch: number;
  volume: number;
}

const speechStorage = createLocalStorage<SpeechSettings>(
  "pet-speech-settings",
  {
    enabled: true,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
  },
);

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

// 缓存的语音列表
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

export function speak(text: string): void {
  if (!isSpeechSupported() || !speechEnabled.value) return;

  stopSpeaking();

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

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

export function toggleSpeech(): boolean {
  speechEnabled.value = !speechEnabled.value;

  if (!speechEnabled.value) {
    stopSpeaking();
  }

  return speechEnabled.value;
}

export function initSpeech(): void {
  if (!isSpeechSupported()) return;

  updateVoiceCache();

  window.speechSynthesis.addEventListener("voiceschanged", updateVoiceCache);
}
