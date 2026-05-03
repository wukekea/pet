/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// Web Speech API 类型声明
declare global {
  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onerror:
      | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
      | null;
    onnomatch: ((this: SpeechRecognition, ev: Event) => void) | null;
    onresult:
      | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
      | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
  }

  interface SpeechRecognitionConstructor {
    new (): SpeechRecognition;
  }

  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
    electronAPI?: {
      setIgnoreMouseEvents: (ignore: boolean) => void;
      getScreenSize: () => Promise<{ width: number; height: number }>;
      fetchIpLocation: (amapKey: string) => Promise<any>;
      fetchCityByLocation: (
        lat: number,
        lon: number,
        apiKey: string,
        apiHost: string,
      ) => Promise<any>;
      fetchWeather: (
        locationId: string,
        apiKey: string,
        apiHost: string,
      ) => Promise<any>;
      fetchLLM: (url: string, options: any) => Promise<any>;
      initEdgeTTS: (
        callback: (status: string, message: string) => void,
      ) => Promise<boolean>;
      speakWithEdgeTTS: (text: string) => Promise<void>;
      stopEdgeTTS: () => void;
      // 本地语音识别
      speechCheckStatus: () => Promise<{
        soxInstalled: boolean;
        whisperInstalled: boolean;
        modelExists: boolean;
        ready: boolean;
      }>;
      speechStart: () => Promise<{ success: boolean; error?: string }>;
      speechStop: () => Promise<{
        success: boolean;
        text?: string;
        error?: string;
      }>;
    };
  }
}

export {};
