const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
    title: 'ギャラガ風シューティングゲーム',
    backgroundColor: '#0c0c2e',
    show: false
  });

  // Load the game
  mainWindow.loadFile('galaga-game.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Enable audio context
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      // Force audio context resume for Electron
      document.addEventListener('click', () => {
        if (typeof audioManager !== 'undefined' && audioManager.audioContext) {
          audioManager.audioContext.resume();
        }
      }, { once: true });
    `);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});