// Electron – main.js (Desktop Wrapper)
// Vite tarafından oluşturulan frontend'i Electron penceresi içinde çalıştırır.

const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset', // macOS için native başlık çubuğu (Windows'ta standart)
    title: 'AuraTask – Akıllı Görev Yönetimi',
    icon: path.join(__dirname, '../public/icon.png'),
  });

  if (isDev) {
    // Geliştirme ortamında Vite dev server'ını yükle
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Üretim ortamında build çıktısını yükle
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Pencere hazır olduğunda görünür yap (beyaz flaşı önler)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

// Uygulama Menüsü (Native OS Menüsü)
const buildMenu = () => {
  const template = [
    {
      label: 'AuraTask',
      submenu: [
        { label: 'Hakkında AuraTask', role: 'about' },
        { type: 'separator' },
        { label: 'Çıkış', role: 'quit' }
      ]
    },
    {
      label: 'Düzenle',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }
      ]
    },
    {
      label: 'Görünüm',
      submenu: [
        { role: 'reload' }, { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

app.whenReady().then(() => {
  buildMenu();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
