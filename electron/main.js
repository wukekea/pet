import { app, BrowserWindow, screen, ipcMain, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let tray = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

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
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // 默认穿透，转发鼠标移动事件
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const icon = nativeImage.createFromDataURL(
    'data:image/svg+xml;base64,' + Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="#8b5cf6"/>
        <circle cx="24" cy="28" r="4" fill="white"/>
        <circle cx="40" cy="28" r="4" fill="white"/>
        <path d="M 24 40 Q 32 48 40 40" stroke="white" stroke-width="3" fill="none"/>
      </svg>
    `).toString('base64')
  );

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示宠物', click: () => mainWindow?.show() },
    { label: '隐藏宠物', click: () => mainWindow?.hide() },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() }
  ]);

  tray.setToolTip('桌面宠物');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 设置鼠标穿透
ipcMain.on('set-ignore-mouse-events', (event, ignore) => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
  }
});

ipcMain.handle('get-screen-size', () => screen.getPrimaryDisplay().workAreaSize);
