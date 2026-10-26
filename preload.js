const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getWindows: () => ipcRenderer.invoke('get-windows'),
    selectWindow: (id) => ipcRenderer.invoke('select-window', id),
    selectMonitor: () => ipcRenderer.invoke('select-monitor'),

    startRecovery: (ext) => ipcRenderer.invoke('recovery-start', ext),
    appendRecoveryChunk: (arrayBuffer) => ipcRenderer.send('recovery-chunk', arrayBuffer),
    finishRecovery: () => ipcRenderer.invoke('recovery-finish'),
    getRecoveryStatus: () => ipcRenderer.invoke('recovery-status'),
    openRecoveryFolder: () => ipcRenderer.invoke('open-recovery-folder'),

    // YENİ KISAYOL FONKSİYONLARI
    registerShortcuts: (shortcuts) => ipcRenderer.invoke('register-shortcuts', shortcuts),
    onShortcutAction: (callback) => ipcRenderer.on('shortcut-action', (event, action) => callback(action))
});