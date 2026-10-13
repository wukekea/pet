/**
 * 自动更新 IPC 模块（从 main.js 拆出）
 * 覆盖：静默检查更新、手动检查、下载（带进度）、三平台安装。
 * 接口与 edgeTTS-ipc.js 保持一致的 setup 模式。
 */
import { app, ipcMain } from "electron";
import path from "path";
import { execFileSync, spawn } from "child_process";
import fs from "fs";

// 下载的安装包路径（模块内状态）
let updateDownloadPath = null;

/**
 * 注册更新相关 IPC handlers
 * @param {Electron.BrowserWindow | null} getWindow 获取主窗口的函数
 * @param {boolean} isDev 是否开发模式
 */
export function setupUpdaterIPC(getWindow, isDev) {
  // 根据平台获取对应的资源下载 URL
  function getPlatformAssetUrl(assets) {
    const platform = process.platform;

    for (const asset of assets) {
      const name = asset.name.toLowerCase();
      if (
        platform === "darwin" &&
        name.endsWith(".zip") &&
        name.includes("arm64")
      ) {
        return asset.browser_download_url;
      }
      if (
        platform === "win32" &&
        name.endsWith(".exe") &&
        name.includes("x64")
      ) {
        return asset.browser_download_url;
      }
      if (platform === "linux" && name.endsWith(".appimage")) {
        return asset.browser_download_url;
      }
    }
    return null;
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
        getWindow()?.webContents.send("update-download-progress", {
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
      getWindow()?.webContents.send("update-downloaded", { version: "" });

      return { success: true };
    } catch (error) {
      console.error("下载更新失败:", error);
      getWindow()?.webContents.send("update-error", error.message);
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
      getWindow()?.webContents.send("update-error", error.message);
    }
  });

  // ===== 三平台安装实现 =====

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
    // 路径来自安装目录（应用自身），非用户输入
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
}

/**
 * 静默检查更新（启动时调用）
 * @param {Electron.BrowserWindow | null} mainWindow
 */
export async function checkForUpdateSilent(mainWindow) {
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

    const compare = (v1, v2) => {
      const parts1 = v1.split(".").map(Number);
      const parts2 = v2.split(".").map(Number);
      for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
      }
      return 0;
    };

    if (compare(latestVersion, currentVersion) > 0) {
      // 平台资源匹配
      const platform = process.platform;
      let downloadUrl = null;
      for (const asset of release.assets || []) {
        const name = asset.name.toLowerCase();
        if (
          platform === "darwin" &&
          name.endsWith(".zip") &&
          name.includes("arm64")
        ) {
          downloadUrl = asset.browser_download_url;
        } else if (
          platform === "win32" &&
          name.endsWith(".exe") &&
          name.includes("x64")
        ) {
          downloadUrl = asset.browser_download_url;
        } else if (platform === "linux" && name.endsWith(".appimage")) {
          downloadUrl = asset.browser_download_url;
        }
      }
      mainWindow?.webContents.send("update-available", {
        version: latestVersion,
        downloadUrl,
      });
    }
  } catch (err) {
    console.error("静默检查更新失败:", err);
  }
}
