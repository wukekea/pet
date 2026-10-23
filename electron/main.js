import {
  app,
  BrowserWindow,
  screen,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
  session,
  clipboard,
} from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { setupEdgeTTSIPC } from "./edgeTTS-ipc.js";
import { setupWhisperIPC } from "./whisperIPC.js";
import { setupUpdaterIPC, checkForUpdateSilent } from "./updater-ipc.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 启用地理位置 API（使用 Google 服务）
app.commandLine.appendSwitch("enable-features", "Geolocation");

// 启用 Web Speech API
app.commandLine.appendSwitch("enable-speech-dispatcher");

let mainWindow = null;
let tray = null;

// electron:preview 场景：直接 electron . 运行（未打包，isPackaged=false）
// 但应加载 vite build 的 dist 产物而非 dev server。PET_PREVIEW=1 时强制生产模式。
const isPreview = process.env.PET_PREVIEW === "1";
const isDev =
  !isPreview && (process.env.NODE_ENV === "development" || !app.isPackaged);

// 单实例锁（双开存档互写问题）
const gotTheLock = app.requestSingleInstanceLock();
app.on("second-instance", () => {
  // 用户尝试再次启动时，聚焦已有窗口
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

// 更新状态

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
    // 端口与 vite.config.ts 的 PET_PORT 保持一致，默认 5173
    const port = Number(process.env.PET_PORT) || 5173;
    mainWindow.loadURL(`http://localhost:${port}`);
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
  // 单实例锁：双开会打开两只宠物，互相覆盖同一份 localStorage 存档
  if (!gotTheLock) {
    app.quit();
    return;
  }

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

  // 生产环境下静默检查更新（传 getWindow 函数，避免窗口销毁后调用已销毁对象）
  if (!isDev) {
    checkForUpdateSilent(() => mainWindow).catch((err) => {
      console.error("静默检查更新失败:", err);
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

// ===== 网络请求安全工具 =====

// 外部 API 请求 URL 安全校验：仅允许 http(s)，拒绝本机/内网/云元数据地址（防 SSRF）
// 适用于用户可配置 host 的代理请求（LLM / 和风天气）
function isAllowedApiUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    const host = parsed.hostname;
    // 拒绝 localhost / 127.x / 内网段 / [::1] / 云元数据 / 通配地址
    if (
      host === "localhost" ||
      host === "[::1]" ||
      host === "0.0.0.0" ||
      host.startsWith("127.") ||
      host.startsWith("10.") ||
      host.startsWith("169.254.") ||
      host.startsWith("192.168.") ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      host.endsWith(".local") ||
      host.endsWith(".internal")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// fetch 超时包装：主进程 fetch 默认无超时，接口挂起时 IPC promise 永久 pending
const FETCH_TIMEOUT_MS = 15000;

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => {
    clearTimeout(timer);
  });
}

// 校验和风天气 host 并构建 API URL（host 由渲染进程配置，防止拼入内网地址）
function buildQweatherUrl(apiHost, pathAndQuery) {
  const host = String(apiHost || "")
    .trim()
    .replace(/\/$/, "");
  const url = `https://${host}${pathAndQuery}`;
  if (!isAllowedApiUrl(url)) {
    return null;
  }
  return url;
}

// 获取实时天气
ipcMain.handle("fetch-weather", async (event, locationId, apiKey, apiHost) => {
  try {
    const url = buildQweatherUrl(
      apiHost,
      `/v7/weather/now?location=${encodeURIComponent(locationId)}`,
    );
    if (!url) {
      return {
        code: "error",
        message: "不允许的 API 地址（内网/非 http 协议）",
      };
    }

    const response = await fetchWithTimeout(url, {
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
      const url = buildQweatherUrl(
        apiHost,
        `/geo/v2/city/lookup?location=${encodeURIComponent(`${lon},${lat}`)}`,
      );
      if (!url) {
        return {
          code: "error",
          message: "不允许的 API 地址（内网/非 http 协议）",
        };
      }

      const response = await fetchWithTimeout(url, {
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
    if (!isAllowedApiUrl(url)) {
      return {
        success: false,
        message: "不允许的 API 地址（内网/非 http 协议）",
      };
    }
    const response = await fetchWithTimeout(url, {
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

// IP 定位服务（高德地图，host 固定不可配置，仍加超时防挂起）
ipcMain.handle("fetch-ip-location", async (event, amapKey) => {
  try {
    const response = await fetchWithTimeout(
      `https://restapi.amap.com/v3/ip?key=${encodeURIComponent(amapKey)}`,
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

// 注册自动更新 IPC（模块拆分至 updater-ipc.js）
setupUpdaterIPC(() => mainWindow, isDev);

// 写入剪贴板
ipcMain.handle("write-clipboard", (event, text) => {
  try {
    clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    console.error("写入剪贴板失败:", error);
    return { success: false, message: error.message };
  }
});
