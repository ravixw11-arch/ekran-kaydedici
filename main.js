const { app, BrowserWindow, desktopCapturer, session, ipcMain, shell, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

let selectedWindowId = null;
let recoveryFilePath = null;
let recoveryWriteChain = Promise.resolve();
let mainWindow = null;

function getRecoveryDir() {
    return path.join(app.getPath('videos'), 'Ravix_w1 Kayıt Kurtarma');
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        icon: path.join(__dirname, 'build', 'icon.ico'),
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    app.setAppUserModelId('com.ravixw1.ekrankaydedici');

    ipcMain.handle('get-windows', async () => {
        const sources = await desktopCapturer.getSources({
            types: ['window'],
            thumbnailSize: { width: 150, height: 150 }
        });

        return sources.map(source => ({
            id: source.id,
            name: source.name,
            thumbnail: source.thumbnail.toDataURL()
        }));
    });

    ipcMain.handle('select-window', (event, id) => {
        selectedWindowId = id;
        return true;
    });

    ipcMain.handle('select-monitor', () => {
        selectedWindowId = null;
        return true;
    });

    ipcMain.handle('recovery-start', async (event, ext) => {
        try {
            const dir = getRecoveryDir();
            await fs.promises.mkdir(dir, { recursive: true });

            const safeExt = String(ext || 'webm').toLowerCase() === 'mp4' ? 'mp4' : 'webm';
            const now = new Date();
            const stamp =
                now.getFullYear() + '-' +
                String(now.getMonth() + 1).padStart(2, '0') + '-' +
                String(now.getDate()).padStart(2, '0') + '_' +
                String(now.getHours()).padStart(2, '0') + '-' +
                String(now.getMinutes()).padStart(2, '0') + '-' +
                String(now.getSeconds()).padStart(2, '0');

            recoveryFilePath = path.join(dir, `kurtarma_${stamp}.${safeExt}`);
            recoveryWriteChain = Promise.resolve();
            await fs.promises.writeFile(recoveryFilePath, Buffer.alloc(0));

            return { ok: true, path: recoveryFilePath };
        } catch (error) {
            console.error('Kurtarma dosyası başlatılamadı:', error);
            recoveryFilePath = null;
            return { ok: false };
        }
    });

    ipcMain.on('recovery-chunk', (event, arrayBuffer) => {
        if (!recoveryFilePath || !arrayBuffer) return;

        const chunk = Buffer.from(arrayBuffer);
        const targetPath = recoveryFilePath;

        recoveryWriteChain = recoveryWriteChain
            .then(() => fs.promises.appendFile(targetPath, chunk))
            .catch(error => {
                console.error('Kurtarma parçası yazılamadı:', error);
            });
    });

    ipcMain.handle('recovery-finish', async () => {
        try {
            await recoveryWriteChain;
            const targetPath = recoveryFilePath;
            recoveryFilePath = null;

            if (targetPath) {
                await fs.promises.unlink(targetPath).catch(() => {});
            }
            return true;
        } catch (error) {
            console.error('Kurtarma dosyası temizlenemedi:', error);
            return false;
        }
    });

    ipcMain.handle('recovery-status', async () => {
        try {
            const dir = getRecoveryDir();
            await fs.promises.mkdir(dir, { recursive: true });

            const entries = await fs.promises.readdir(dir, { withFileTypes: true });
            const files = [];

            for (const entry of entries) {
                if (!entry.isFile()) continue;
                if (!/^kurtarma_.*\.(webm|mp4)$/i.test(entry.name)) continue;

                const fullPath = path.join(dir, entry.name);
                const stat = await fs.promises.stat(fullPath);
                if (stat.size > 0) {
                    files.push({
                        path: fullPath,
                        name: entry.name,
                        mtime: stat.mtimeMs
                    });
                }
            }

            files.sort((a, b) => b.mtime - a.mtime);

            return {
                hasRecovery: files.length > 0,
                latest: files[0] || null,
                directory: dir
            };
        } catch (error) {
            console.error('Kurtarma klasörü kontrol edilemedi:', error);
            return { hasRecovery: false };
        }
    });

    ipcMain.handle('open-recovery-folder', async () => {
        const dir = getRecoveryDir();
        await fs.promises.mkdir(dir, { recursive: true });
        return shell.openPath(dir);
    });

    ipcMain.handle('register-shortcuts', (event, shortcuts) => {
        globalShortcut.unregisterAll(); 
        let success = true;
        try {
            if (shortcuts.startStop) {
                if (!globalShortcut.register(shortcuts.startStop, () => {
                    if (mainWindow) mainWindow.webContents.send('shortcut-action', 'startStop');
                })) success = false;
            }
            if (shortcuts.pauseResume) {
                if (!globalShortcut.register(shortcuts.pauseResume, () => {
                    if (mainWindow) mainWindow.webContents.send('shortcut-action', 'pauseResume');
                })) success = false;
            }
        } catch (err) {
            console.error('Kısayol kaydedilemedi:', err);
            success = false;
        }
        return success;
    });

    session.defaultSession.setDisplayMediaRequestHandler(async (request, callback) => {
        try {
            const sources = await desktopCapturer.getSources({
                types: ['screen', 'window']
            });

            if (!sources.length) {
                callback({});
                return;
            }

            let selectedSource;

            if (selectedWindowId) {
                selectedSource = sources.find(s => s.id === selectedWindowId);
            } else {
                selectedSource = sources.find(s => s.id.startsWith('screen:'));
            }

            if (!selectedSource) {
                callback({});
                return;
            }

            const response = { video: selectedSource };
            if (request.audioRequested) {
                response.audio = 'loopback';
            }
            callback(response);
        } catch (error) {
            console.error('Ekran/ses kaynağı alınamadı:', error);
            callback({});
        }
    });

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});