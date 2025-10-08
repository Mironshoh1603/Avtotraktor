const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process'); // NestJS serverini ishga tushirish uchun

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    win.loadURL('http://localhost:3001');  // NestJS serveri ishga tushgandan so'ng ushbu portni ochamiz
}

app.whenReady().then(() => {
    // createWindow();
    
    // Electron bilan birga NestJS serverini ishga tushiramiz
    exec('npm run start', (err, stdout, stderr) => {
        if (err) {
            console.error('Error starting NestJS server:', err);
            return;
        }
        console.log('NestJS server started:', stdout);
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
