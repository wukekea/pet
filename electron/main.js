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
import { execFileSync, spawn } from "child_process";
import fs from "fs";
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

// 更新状态
let updateDownloadPath = null; // 下载的安装包路径

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

  // 生产环境下静默检查更新
  if (!isDev) {
    checkForUpdateSilent().catch((err) => {
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

// 根据平台获取对应的资源下载 URL
function getPlatformAssetUrl(assets) {
  const platform = process.platform;
  const arch = process.arch;

  for (const asset of assets) {
    const name = asset.name.toLowerCase();
    if (
      platform === "darwin" &&
      name.endsWith(".zip") &&
      name.includes("arm64")
    ) {
      return asset.browser_download_url;
    }
    if (platform === "win32" && name.endsWith(".exe") && name.includes("x64")) {
      return asset.browser_download_url;
    }
    if (platform === "linux" && name.endsWith(".appimage")) {
      return asset.browser_download_url;
    }
  }
  return null;
}

// 静默检查更新（启动时调用）
async function checkForUpdateSilent() {
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
    if (!response.ok) return;

    const release = await response.json();
    const latestVersion = release.tag_name?.replace(/^v/, "") || "0.0.0";
    const currentVersion = app.getVersion();

    if (compareVersions(latestVersion, currentVersion) > 0) {
      const downloadUrl = getPlatformAssetUrl(release.assets || []);
      mainWindow?.webContents.send("update-available", {
        version: latestVersion,
        downloadUrl,
      });
    }
  } catch (err) {
    console.error("静默检查更新失败:", err);
  }
}

// 检查更新 - 从 GitHub API 获取最新 release
ipcMain.handle("check-update", async () => {
  if (isDev) {
    return {
      success: false,
      message: "开发模式不支持自动更新",
      currentVersion: app.getVersion(),
    };
  }

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
    const downloadUrl = getPlatformAssetUrl(release.assets || []);

    return {
      success: true,
      currentVersion,
      latestVersion,
      hasUpdate,
      downloadUrl,
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

// 下载更新 - 手动下载安装包
ipcMain.handle("download-update", async (event, downloadUrl) => {
  if (isDev) {
    return { success: false, message: "开发模式不支持自动更新" };
  }

  if (!downloadUrl) {
    return { success: false, message: "未提供下载地址" };
  }

  try {
    const tempDir = app.getPath("temp");
    const urlFileName = downloadUrl.split("/").pop() || "update";
    const savePath = path.join(tempDir, urlFileName);

    // 清除旧的下载文件
    if (fs.existsSync(savePath)) {
      fs.unlinkSync(savePath);
    }

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`下载失败: HTTP ${response.status}`);
    }

    const contentLength = parseInt(
      response.headers.get("content-length") || "0",
      10,
    );
    let downloadedBytes = 0;

    const fileStream = fs.createWriteStream(savePath);
    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      fileStream.write(Buffer.from(value));
      downloadedBytes += value.length;

      const percent =
        contentLength > 0 ? (downloadedBytes / contentLength) * 100 : 0;
      mainWindow?.webContents.send("update-download-progress", {
        percent,
        transferred: downloadedBytes,
        total: contentLength,
        bytesPerSecond: 0,
      });
    }

    fileStream.end();

    // 等待文件写入完成
    await new Promise((resolve, reject) => {
      fileStream.on("finish", resolve);
      fileStream.on("error", reject);
    });

    updateDownloadPath = savePath;
    mainWindow?.webContents.send("update-downloaded", { version: "" });

    return { success: true };
  } catch (error) {
    console.error("下载更新失败:", error);
    mainWindow?.webContents.send("update-error", error.message);
    return { success: false, message: error.message };
  }
});

// 安装更新 - 根据平台执行不同安装逻辑
ipcMain.handle("install-update", () => {
  if (isDev || !updateDownloadPath) return;

  const platform = process.platform;

  try {
    if (platform === "darwin") {
      // macOS: 解压 zip → 替换 .app → xattr -cr → 重启
      installOnMacOS(updateDownloadPath);
    } else if (platform === "win32") {
      // Windows: NSIS 静默安装
      installOnWindows(updateDownloadPath);
    } else if (platform === "linux") {
      // Linux: 替换 AppImage
      installOnLinux(updateDownloadPath);
    }
  } catch (error) {
    console.error("安装更新失败:", error);
    mainWindow?.webContents.send("update-error", error.message);
  }
});

// macOS 安装逻辑
function installOnMacOS(zipPath) {
  const tempDir = path.join(app.getPath("temp"), "pet-update");
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });

  // 解压 zip
  execFileSync("unzip", ["-o", zipPath, "-d", tempDir], { encoding: "utf8" });

  // 查找解压后的 .app
  const extractedItems = fs.readdirSync(tempDir);
  const appName = extractedItems.find((item) => item.endsWith(".app"));
  if (!appName) {
    throw new Error("未找到应用包");
  }

  const extractedAppPath = path.join(tempDir, appName);

  // 获取当前应用的安装路径
  // process.execPath 在 macOS 上是 桌面宠物.app/Contents/MacOS/桌面宠物
  const currentAppPath = path.dirname(path.dirname(process.execPath));
  const installDir = path.dirname(currentAppPath);

  // 创建延迟执行脚本，先退出应用再替换
  const scriptPath = path.join(app.getPath("temp"), "pet-update.sh");
  const scriptContent = `#!/bin/bash
sleep 1
rm -rf "${currentAppPath}"
mv "${extractedAppPath}" "${installDir}/${appName}"
xattr -cr "${installDir}/${appName}"
open "${installDir}/${appName}"
rm -f "${scriptPath}"
rm -rf "${tempDir}"
rm -f "${zipPath}"
`;
  fs.writeFileSync(scriptPath, scriptContent);
  execFileSync("chmod", ["+x", scriptPath]);

  // 后台执行替换脚本，然后退出应用
  spawn("bash", [scriptPath], {
    detached: true,
    stdio: "ignore",
  }).unref();

  app.quit();
}

// Windows 安装逻辑
function installOnWindows(exePath) {
  // 获取当前安装目录
  const installDir = path.dirname(path.dirname(process.execPath));

  spawn(exePath, ["/S", "--updated", `/D=${installDir}`], {
    detached: true,
    stdio: "ignore",
  }).unref();

  app.quit();
}

// Linux 安装逻辑
function installOnLinux(appImagePath) {
  const currentAppImage = process.env.APPIMAGE;
  if (!currentAppImage) {
    throw new Error("无法确定当前 AppImage 路径");
  }

  // 设置可执行权限
  fs.chmodSync(appImagePath, 0o755);

  // 创建延迟执行脚本
  const scriptPath = path.join(app.getPath("temp"), "pet-update.sh");
  const scriptContent = `#!/bin/bash
sleep 1
rm -f "${currentAppImage}"
mv "${appImagePath}" "${currentAppImage}"
chmod +x "${currentAppImage}"
nohup "${currentAppImage}" &
rm -f "${scriptPath}"
`;
  fs.writeFileSync(scriptPath, scriptContent);
  execFileSync("chmod", ["+x", scriptPath]);

  spawn("bash", [scriptPath], {
    detached: true,
    stdio: "ignore",
  }).unref();

  app.quit();
}

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
