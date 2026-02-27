const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  expandPanel: () => ipcRenderer.send('expand-panel'),
  collapsePanel: () => ipcRenderer.send('collapse-panel'),
  getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
  setWindowPosition: (x, y) => ipcRenderer.send('set-window-position', x, y),
  setIgnoreMouseEvents: (ignore, opts) => ipcRenderer.send('set-ignore-mouse-events', ignore, opts),
  setAlwaysOnTop: (val) => ipcRenderer.send('set-always-on-top', val),
  onPanelToggled: (callback) => {
    ipcRenderer.on('panel-toggled', (_event, expanded) => callback(expanded));
  },
});
