import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import and start our Express/WebSocket server
import('./server/server.js').catch(err => {
  console.error('Failed to start OmicronSSH server:', err);
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: 'OmicronSSH',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Remove the default window menu bar for a premium standalone feel
  mainWindow.setMenuBarVisibility(false);

  // Wait briefly for Express server to start up and bind to port 3000
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000').catch(err => {
      console.error('Failed to load local server URL, retrying...', err);
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:3000').catch(retryErr => {
          console.error('Failed to load local server URL on retry:', retryErr);
        });
      }, 1500);
    });
  }, 1200);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Gracefully terminate the Express server process when the window is closed
  app.quit();
});
