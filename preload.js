const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  toggleMode: () => ipcRenderer.send('toggle-mode'),
  setAlwaysOnTop: (val) => ipcRenderer.send('set-always-on-top', val),
  onModeChanged: (callback) => {
    ipcRenderer.on('mode-changed', (_event, mode) => callback(mode));
  },
});
