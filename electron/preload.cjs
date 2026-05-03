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
});
