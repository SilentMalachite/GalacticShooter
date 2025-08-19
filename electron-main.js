import { app, BrowserWindow, Menu, shell } from 'electron';
import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Check if required files exist
  const requiredFiles = ['galaga-game.html', 'game.js', 'game.css'];
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(__dirname, file)));
  
  if (missingFiles.length > 0) {
    console.error('Missing required files:', missingFiles);
    app.quit();
    return;
  }

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // Allow local file access
      allowRunningInsecureContent: false
    },
    icon: fs.existsSync(path.join(__dirname, 'generated-icon.png')) 
      ? path.join(__dirname, 'generated-icon.png') 
      : undefined,
    title: 'ギャラガ風シューティングゲーム',
    resizable: true,
    minimizable: true,
    maximizable: true,
    show: false, // Don't show until ready
    backgroundColor: '#0c0c2e' // Match game background
  });

  // Load the game HTML file
  const htmlPath = path.join(__dirname, 'galaga-game.html');
  mainWindow.loadFile(htmlPath);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Handle loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Enable audio autoplay
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      // Enable audio context for Electron
      if (typeof audioManager !== 'undefined' && audioManager.audioContext) {
        audioManager.audioContext.resume();
      }
    `).catch(err => console.log('Audio initialization error:', err));
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Prevent external navigation
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      event.preventDefault();
    }
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Set up application menu
  const template = [
    {
      label: 'ゲーム',
      submenu: [
        {
          label: 'リスタート',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'フルスクリーン',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        },
        { type: 'separator' },
        {
          label: '終了',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '表示',
      submenu: [
        { role: 'reload', label: '再読み込み' },
        { role: 'forceReload', label: '強制再読み込み' },
        { role: 'toggleDevTools', label: '開発者ツール' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'ズームリセット' },
        { role: 'zoomIn', label: 'ズームイン' },
        { role: 'zoomOut', label: 'ズームアウト' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'フルスクリーン切り替え' }
      ]
    },
    {
      label: 'ウィンドウ',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'close', label: '閉じる' }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: 'このアプリについて' },
        { type: 'separator' },
        { role: 'services', label: 'サービス', submenu: [] },
        { type: 'separator' },
        { role: 'hide', label: 'ギャラガを隠す' },
        { role: 'hideothers', label: '他を隠す' },
        { role: 'unhide', label: 'すべて表示' },
        { type: 'separator' },
        { role: 'quit', label: 'ギャラガを終了' }
      ]
    });

    // Window menu
    template[3].submenu = [
      { role: 'close', label: '閉じる' },
      { role: 'minimize', label: '最小化' },
      { role: 'zoom', label: 'ズーム' },
      { type: 'separator' },
      { role: 'front', label: '最前面に移動' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Handle app certificate errors (for development)
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('disable-web-security');

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  
  // Set up global error handling
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS it is common for applications to stay active until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, re-create window when dock icon is clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, _navigationUrl) => {
    event.preventDefault();
  });
  
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});
