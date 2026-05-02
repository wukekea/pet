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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 启用地理位置 API（使用 Google 服务）
app.commandLine.appendSwitch("enable-features", "Geolocation");

let mainWindow = null;
let tray = null;

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

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

  // 自动授权定位权限
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      if (permission === "geolocation") {
        callback(true); // 自动允许定位
      } else {
        callback(false);
      }
    },
  );
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
