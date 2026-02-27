const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, nativeImage, screen } = require('electron');
const path = require('path');

let mainWindow;
let tray;
let isExpanded = false;

const BUBBLE_W = 450;
const BUBBLE_H = 120;
const PANEL_W = 380;
const PANEL_H = 560;

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { width: sw, height: sh } = display.workAreaSize;

  mainWindow = new BrowserWindow({
    width: BUBBLE_W,
    height: BUBBLE_H,
    x: sw - BUBBLE_W - 16,
    y: sh - BUBBLE_H - 16,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'client', 'index.html'));

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

function expandPanel() {
  if (!mainWindow || isExpanded) return;
  isExpanded = true;
  const bounds = mainWindow.getBounds();
  const newX = bounds.x + bounds.width - PANEL_W;
  const newY = bounds.y + bounds.height - PANEL_H;
  mainWindow.setBounds({ x: newX, y: newY, width: PANEL_W, height: PANEL_H }, true);
  mainWindow.webContents.send('panel-toggled', true);
}

function collapsePanel() {
  if (!mainWindow || !isExpanded) return;
  isExpanded = false;
  const bounds = mainWindow.getBounds();
  const newX = bounds.x + bounds.width - BUBBLE_W;
  const newY = bounds.y + bounds.height - BUBBLE_H;
  mainWindow.setBounds({ x: newX, y: newY, width: BUBBLE_W, height: BUBBLE_H }, true);
  mainWindow.webContents.send('panel-toggled', false);
}

function togglePanel() {
  if (isExpanded) collapsePanel();
  else expandPanel();
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.on('expand-panel', expandPanel);
  ipcMain.on('collapse-panel', collapsePanel);

  ipcMain.handle('get-window-position', () => {
    if (!mainWindow) return [0, 0];
    return mainWindow.getPosition();
  });

  ipcMain.on('set-window-position', (_e, x, y) => {
    if (mainWindow) mainWindow.setPosition(Math.round(x), Math.round(y));
  });

  ipcMain.on('set-ignore-mouse-events', (_e, ignore, opts) => {
    if (mainWindow) mainWindow.setIgnoreMouseEvents(ignore, opts || {});
  });

  ipcMain.on('set-always-on-top', (_e, val) => {
    if (mainWindow) mainWindow.setAlwaysOnTop(val);
  });

  globalShortcut.register('CommandOrControl+Shift+L', togglePanel);

  // Tray
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('GotLunchBuddy');
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Always on Top', type: 'checkbox', checked: true,
      click: (item) => { if (mainWindow) mainWindow.setAlwaysOnTop(item.checked); },
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]));
  tray.on('click', togglePanel);
});

app.on('will-quit', () => { globalShortcut.unregisterAll(); });
app.on('window-all-closed', () => { app.quit(); });
