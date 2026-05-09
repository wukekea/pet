import {
  app,
  BrowserWindow,
  screen,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
  session,
} from "electron";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "electron-updater";
const { autoUpdater } = pkg;
import { setupEdgeTTSIPC } from "./edgeTTS-ipc.js";
import { setupWhisperIPC } from "./whisperIPC.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 启用地理位置 API（使用 Google 服务）
app.commandLine.appendSwitch("enable-features", "Geolocation");

// 启用 Web Speech API
app.commandLine.appendSwitch("enable-speech-dispatcher");

let mainWindow = null;
let tray = null;

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

// 配置自动更新
autoUpdater.autoDownload = false; // 不自动下载，由用户触发
autoUpdater.autoInstallOnAppQuit = true; // 退出时自动安装

// 自动更新事件处理
autoUpdater.on("update-available", (info) => {
  console.log("发现新版本:", info.version);
  mainWindow?.webContents.send("update-available", info);
});

autoUpdater.on("update-not-available", () => {
  console.log("当前已是最新版本");
  mainWindow?.webContents.send("update-not-available");
});

autoUpdater.on("download-progress", (progress) => {
  console.log(`下载进度: ${progress.percent.toFixed(1)}%`);
  mainWindow?.webContents.send("update-download-progress", {
    percent: progress.percent,
    transferred: progress.transferred,
    total: progress.total,
    bytesPerSecond: progress.bytesPerSecond,
  });
});

autoUpdater.on("update-downloaded", (info) => {
  console.log("更新下载完成:", info.version);
  mainWindow?.webContents.send("update-downloaded", info);
});

autoUpdater.on("error", (error) => {
  console.error("自动更新错误:", error);
  mainWindow?.webContents.send("update-error", error.message);
});

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  // 默认穿透，转发鼠标移动事件
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTray() {
  // 加载 PNG 图标文件
  const iconPath = path.join(__dirname, "icon.png");
  const icon = nativeImage.createFromPath(iconPath);

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: "显示宠物", click: () => mainWindow?.show() },
    { label: "隐藏宠物", click: () => mainWindow?.hide() },
    { type: "separator" },
    { label: "退出", click: () => app.quit() },
  ]);

  tray.setToolTip("桌面宠物");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  setupEdgeTTSIPC(); // 设置 Edge TTS IPC
  setupWhisperIPC(); // 设置 Whisper 语音识别 IPC

  // 自动授权定位权限
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      if (permission === "geolocation") {
        callback(true); // 自动允许定位
      } else if (permission === "media" || permission === "microphone") {
        callback(true); // 自动允许麦克风
      } else {
        callback(false);
      }
    },
  );

  // 生产环境下检查更新
  if (!isDev) {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error("检查更新失败:", err);
    });
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// 设置鼠标穿透
ipcMain.on("set-ignore-mouse-events", (event, ignore) => {
  if (mainWindow) {
    if (ignore) {
      mainWindow.setIgnoreMouseEvents(true, { forward: true });
    } else {
      mainWindow.setIgnoreMouseEvents(false);
    }
  }
});

ipcMain.handle(
  "get-screen-size",
  () => screen.getPrimaryDisplay().workAreaSize,
);

// 获取实时天气
ipcMain.handle("fetch-weather", async (event, locationId, apiKey, apiHost) => {
  try {
    const url = `https://${apiHost}/v7/weather/now?location=${locationId}`;

    const response = await fetch(url, {
      headers: {
        "X-QW-Api-Key": apiKey,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("天气请求失败:", error);
    return { code: "error", message: error.message };
  }
});

// 通过坐标获取城市信息
ipcMain.handle(
  "fetch-city-by-location",
  async (event, lat, lon, apiKey, apiHost) => {
    try {
      const url = `https://${apiHost}/geo/v2/city/lookup?location=${lon},${lat}`;

      const response = await fetch(url, {
        headers: {
          "X-QW-Api-Key": apiKey,
        },
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("城市查询请求失败:", error);
      return { code: "error", message: error.message };
    }
  },
);

// LLM API 代理（支持任意 OpenAI 兼容接口）
ipcMain.handle("fetch-llm", async (event, url, options) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: options.headers,
      body: JSON.stringify(options.body),
    });
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("LLM 请求失败:", error);
    return { success: false, message: error.message };
  }
});

// IP 定位服务（高德地图）
ipcMain.handle("fetch-ip-location", async (event, amapKey) => {
  try {
    const response = await fetch(
      `https://restapi.amap.com/v3/ip?key=${amapKey}`,
    );
    const data = await response.json();

    if (data.status === "1" && data.rectangle) {
      // rectangle 格式: "经度1,纬度1;经度2,纬度2"
      const [bottomLeft, topRight] = data.rectangle.split(";");
      const [lon1, lat1] = bottomLeft.split(",").map(Number);
      const [lon2, lat2] = topRight.split(",").map(Number);

      // 计算中心点
      const centerLon = (lon1 + lon2) / 2;
      const centerLat = (lat1 + lat2) / 2;

      return {
        success: true,
        lat: centerLat,
        lon: centerLon,
        city: data.city || data.province,
      };
    }
    return { success: false, message: data.info || "定位失败" };
  } catch (error) {
    console.error("IP 定位请求失败:", error);
    return { success: false, message: error.message };
  }
});

// 获取当前版本号
ipcMain.handle("get-version", () => {
  return app.getVersion();
});

// 检查更新（使用 electron-updater）
ipcMain.handle("check-for-updates", async () => {
  if (isDev) {
    return { success: false, message: "开发模式不支持自动更新" };
  }

  try {
    const result = await autoUpdater.checkForUpdates();
    return {
      success: true,
      currentVersion: app.getVersion(),
      latestVersion: result.updateInfo.version,
      hasUpdate: result.updateInfo.version !== app.getVersion(),
      releaseDate: result.updateInfo.releaseDate,
      releaseNotes: result.updateInfo.releaseNotes,
    };
  } catch (error) {
    console.error("检查更新失败:", error);
    return { success: false, message: error.message };
  }
});

// 下载更新
ipcMain.handle("download-update", async () => {
  if (isDev) {
    return { success: false, message: "开发模式不支持自动更新" };
  }

  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    console.error("下载更新失败:", error);
    return { success: false, message: error.message };
  }
});

// 安装更新（安装后重启）
ipcMain.handle("install-update", () => {
  if (!isDev) {
    autoUpdater.quitAndInstall();
  }
});

// 检查更新 - 从 GitHub API 获取最新 release（备用方案）
ipcMain.handle("check-update", async () => {
  const currentVersion = app.getVersion();

  try {
    const response = await fetch(
      "https://api.github.com/repos/wukekea/pet/releases/latest",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Desktop-Pet-App",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const release = await response.json();
    const latestVersion = release.tag_name?.replace(/^v/, "") || "0.0.0";
    const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

    return {
      success: true,
      currentVersion,
      latestVersion,
      hasUpdate,
      releaseUrl: release.html_url,
      releaseNotes: release.body || "",
      publishedAt: release.published_at,
    };
  } catch (error) {
    console.error("检查更新失败:", error);
    return {
      success: false,
      message: error.message,
      currentVersion,
    };
  }
});

// 版本号比较函数
function compareVersions(v1, v2) {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}
