const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printReceipt: (htmlContent) => ipcRenderer.invoke('print-receipt', htmlContent),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  setPrinter: (printerName) => ipcRenderer.invoke('set-printer', printerName),
  getPrinter: () => ipcRenderer.invoke('get-printer'),
  getImages: () => ipcRenderer.invoke('get-images'),

  // ── Update API ──
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkUpdate: () => ipcRenderer.invoke('check-update'),
  downloadUpdate: (updateInfo) => ipcRenderer.invoke('download-update', updateInfo),
  applyUpdate: (zipPath, newVersion) => ipcRenderer.invoke('apply-update', zipPath, newVersion),
  restartApp: () => ipcRenderer.invoke('restart-app'),
  onUpdateProgress: (callback) => {
    ipcRenderer.removeAllListeners('update-progress');
    ipcRenderer.on('update-progress', (_event, percent) => callback(percent));
  },
});