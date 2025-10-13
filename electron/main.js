const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Optional: add an icon
    show: false // Don't show until ready
  });

  // Load the login page
  mainWindow.loadFile('login.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
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

// Handle login authentication
ipcMain.handle('login', async (event, credentials) => {
  const { username, password } = credentials;
  
  // Hardcoded credentials matching the web app
  const validCredentials = [
    { username: 'admin', password: 'password123' },
    { username: 'GhulamMohayudin', password: 'gm1234' },
    { username: 'Ali', password: 'ali123' },
    { username: 'Zuhaib', password: 'zuhaib123' },
    { username: 'GhulamMohayudin', password: 'user123' },
    { username: 'AliSami', password: 'user123' },
    { username: 'ZuhaibIqbal', password: 'user123' }
  ];
  
  const isValid = validCredentials.some(cred => 
    cred.username === username && cred.password === password
  );
  
  if (isValid) {
    return { success: true, message: 'Login successful' };
  } else {
    return { success: false, message: 'Invalid credentials' };
  }
});

// Handle navigation to dashboard
ipcMain.handle('navigate-to-dashboard', async () => {
  if (mainWindow) {
    mainWindow.loadFile('dashboard.html');
  }
});

// Handle logout
ipcMain.handle('logout', async () => {
  if (mainWindow) {
    mainWindow.loadFile('login.html');
  }
});
