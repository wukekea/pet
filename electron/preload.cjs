const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  setIgnoreMouseEvents: (ignore) => {
    ipcRenderer.send("set-ignore-mouse-events", ignore);
  },
  getScreenSize: () => ipcRenderer.invoke("get-screen-size"),
  fetchIpLocation: (amapKey) =>
    ipcRenderer.invoke("fetch-ip-location", amapKey),
  fetchCityByLocation: (lat, lon, apiKey, apiHost) =>
    ipcRenderer.invoke("fetch-city-by-location", lat, lon, apiKey, apiHost),
  fetchWeather: (locationId, apiKey, apiHost) =>
    ipcRenderer.invoke("fetch-weather", locationId, apiKey, apiHost),
  fetchLLM: (url, options) => ipcRenderer.invoke("fetch-llm", url, options),
  // Edge TTS
  initEdgeTTS: (callback) => {
    // 监听进度回调
    const progressHandler = (_, status, message) => callback(status, message);
    ipcRenderer.on("edge-tts-progress", progressHandler);
    return ipcRenderer.invoke("init-edge-tts").finally(() => {
      ipcRenderer.removeListener("edge-tts-progress", progressHandler);
    });
  },
  speakWithEdgeTTS: (text) => ipcRenderer.invoke("speak-with-edge-tts", text),
  stopEdgeTTS: () => ipcRenderer.send("stop-edge-tts"),
  // 本地语音识别 (Whisper)
  speechCheckStatus: () => ipcRenderer.invoke("speech:check-status"),
  speechStart: () => ipcRenderer.invoke("speech:start"),
  speechStop: () => ipcRenderer.invoke("speech:stop"),
  // 应用更新
  getVersion: () => ipcRenderer.invoke("get-version"),
  checkUpdate: () => ipcRenderer.invoke("check-update"),
  // 自动更新
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  downloadUpdate: () => ipcRenderer.invoke("download-update"),
  installUpdate: () => ipcRenderer.invoke("install-update"),
  onUpdateAvailable: (callback) => {
    const handler = (_, info) => callback(info);
    ipcRenderer.on("update-available", handler);
    return () => ipcRenderer.removeListener("update-available", handler);
  },
  onUpdateNotAvailable: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("update-not-available", handler);
    return () => ipcRenderer.removeListener("update-not-available", handler);
  },
  onUpdateDownloadProgress: (callback) => {
    const handler = (_, progress) => callback(progress);
    ipcRenderer.on("update-download-progress", handler);
    return () =>
      ipcRenderer.removeListener("update-download-progress", handler);
  },
  onUpdateDownloaded: (callback) => {
    const handler = (_, info) => callback(info);
    ipcRenderer.on("update-downloaded", handler);
    return () => ipcRenderer.removeListener("update-downloaded", handler);
  },
  onUpdateError: (callback) => {
    const handler = (_, message) => callback(message);
    ipcRenderer.on("update-error", handler);
    return () => ipcRenderer.removeListener("update-error", handler);
  },
  // 剪贴板
  writeClipboard: (text) => ipcRenderer.invoke("write-clipboard", text),
});
