const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let mainWindow;
let tray;
let isMiniMode = false;

const BOARD_SIZE = { width: 420, height: 620 };
const MINI_SIZE = { width: 240, height: 90 };

function createWindow() {
  mainWindow = new BrowserWindow({
    ...BOARD_SIZE,
    alwaysOnTop: true,
    frame: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'client', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function toggleWidgetMode() {
  if (!mainWindow) return;
  isMiniMode = !isMiniMode;
  const size = isMiniMode ? MINI_SIZE : BOARD_SIZE;
  mainWindow.setSize(size.width, size.height);
  mainWindow.webContents.send('mode-changed', isMiniMode ? 'mini' : 'board');
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register('CommandOrControl+Shift+L', toggleWidgetMode);

  // Tray
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Toggle Mini/Board', click: toggleWidgetMode },
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: true,
      click: (item) => {
        if (mainWindow) mainWindow.setAlwaysOnTop(item.checked);
      },
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);
  tray.setToolTip('GotLunchBuddy');
  tray.setContextMenu(contextMenu);
  tray.on('click', toggleWidgetMode);

  ipcMain.on('toggle-mode', toggleWidgetMode);
  ipcMain.on('set-always-on-top', (_e, val) => {
    if (mainWindow) mainWindow.setAlwaysOnTop(val);
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  app.quit();
});
