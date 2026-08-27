// Electron – preload.js
// contextBridge kullanarak güvenli bir şekilde Node.js API'lerini
// renderer process'e (web sayfasına) açar.

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Uygulama versiyonu
  getVersion: () => process.env.npm_package_version || '1.0.0',

  // Platform bilgisi (win32, darwin, linux)
  platform: process.platform,

  // Uygulama penceresini minimize et
  minimize: () => ipcRenderer.send('window:minimize'),

  // Uygulama penceresini maximize et / restore et
  maximize: () => ipcRenderer.send('window:maximize'),

  // Uygulamayı kapat
  close: () => ipcRenderer.send('window:close'),
});
