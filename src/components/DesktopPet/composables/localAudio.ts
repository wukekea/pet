/**
 * 本地预录音频清单与播放器
 *
 * - 运行时靠静态清单（audioManifest.json）O(1) 判断某句台词是否有本地音频，
 *   不做网络请求，也不做文件存在性探测（FR-015）。
 * - 清单由 scripts/generate-voice-audio.mjs 随音频一起产出并提交进仓库。
 * - 播放失败（文件损坏 / 0 字节）时返回 false，由调用方回退到 TTS。
 */
import manifest from "@/data/audioManifest.json";

interface ManifestLine {
  id: string;
  durationMs: number;
}

interface AudioManifest {
  engine: string;
  voice: string;
  dir: string;
  lines: Record<string, ManifestLine>;
}

const audioManifest = manifest as AudioManifest;

/** 气泡最短展示时长（与旧行为保持一致） */
export const MIN_DIALOGUE_MS = 3000;

let currentAudio: HTMLAudioElement | null = null;

/** 查询台词是否有可播放的本地音频（纯查表，O(1)） */
export function hasLocalAudio(text: string): boolean {
  return Object.prototype.hasOwnProperty.call(audioManifest.lines, text);
}

/** 查询本地音频估算时长（毫秒）；无音频返回 0 */
export function getLocalAudioDurationMs(text: string): number {
  return audioManifest.lines[text]?.durationMs ?? 0;
}

/** 气泡显示时长：取固定下限与音频实际时长的较大者（FR-010） */
export function getDialogueDisplayMs(text: string): number {
  return Math.max(MIN_DIALOGUE_MS, getLocalAudioDurationMs(text));
}

/** 解析本地音频的相对地址（适配 vite dev / file:// 打包两种加载模式） */
export function resolveLocalAudioUrl(text: string): string | null {
  const line = audioManifest.lines[text];
  if (!line) return null;
  const base = import.meta.env.BASE_URL || "./";
  return `${base}${audioManifest.dir}/${line.id}.mp3`.replace(
    /([^:])\/{2,}/g,
    "$1/",
  );
}

/**
 * 播放台词对应的本地音频。
 * - 无清单条目直接返回 false（调用方回退 TTS）。
 * - 旧音频先停，避免两路叠加（验收场景 2）。
 * - 解码 / 加载失败返回 false（损坏或 0 字节文件回退 TTS）。
 * 返回是否成功开始播放。
 */
export async function playLocalAudio(
  text: string,
  volume: number,
): Promise<boolean> {
  const url = resolveLocalAudioUrl(text);
  if (!url) return false;

  stopLocalAudio();

  const audio = new Audio(url);
  audio.volume = volume;
  currentAudio = audio;

  // 已从缓存解码完成时 readyState 已达 HAVE_FUTURE_DATA，直接播放；
  // 否则等 canplay。同时监听 error：文件损坏 / 0 字节时立即回退 TTS。
  try {
    if (audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      await new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          audio.removeEventListener("canplay", onCanPlay);
          audio.removeEventListener("error", onError);
        };
        const onCanPlay = () => {
          cleanup();
          resolve();
        };
        const onError = () => {
          cleanup();
          reject(new Error("本地音频加载失败"));
        };
        audio.addEventListener("canplay", onCanPlay);
        audio.addEventListener("error", onError);
        audio.load();
      });
    }
    await audio.play();
    return true;
  } catch {
    if (currentAudio === audio) currentAudio = null;
    return false;
  }
}

/** 停止当前本地音频播放 */
export function stopLocalAudio(): void {
  if (!currentAudio) return;
  try {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.src = "";
  } catch {
    // 元素已被回收等情况无需处理
  }
  currentAudio = null;
}
