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
});
