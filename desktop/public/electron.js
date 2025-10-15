const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.ELECTRON_IS_DEV === 'true';

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Optional: add an icon
    show: false, // Don't show until ready
    minWidth: 1200,
    minHeight: 800
  });

  // Load the React app
  const startUrl = 'http://localhost:3001';
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Comprehensive focus fix for Electron
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      // Global focus fix for Electron input issues
      function fixElectronFocus() {
        // Force document focus
        document.body.focus();
        
        // Add click handlers to all inputs
        document.addEventListener('click', function(e) {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            setTimeout(() => {
              e.target.focus();
            }, 10);
          }
        });
        
        // Add mousedown handlers for better focus
        document.addEventListener('mousedown', function(e) {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            e.target.focus();
          }
        });
      }
      
      // Run immediately
      fixElectronFocus();
      
      // Run after DOM changes
      const observer = new MutationObserver(fixElectronFocus);
      observer.observe(document.body, { childList: true, subtree: true });
    `);
  });

  // Additional focus handling for window events
  mainWindow.on('focus', () => {
    mainWindow.webContents.executeJavaScript(`
      document.body.focus();
    `);
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
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

// IPC handlers removed - using React-only authentication

