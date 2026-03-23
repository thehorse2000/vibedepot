import { contextBridge, ipcRenderer } from 'electron';
import { createAIBridge } from './ai';
import { createStorageBridge } from './storage';
import { createShellBridge } from './shell';
import { createDbBridge } from './db';
import { setupDevWarnings } from './devWarnings';

// Detect sideloaded mode from additionalArguments
const isSideloaded = process.argv.includes('--sideloaded');

if (isSideloaded) {
  setupDevWarnings(ipcRenderer);
}

contextBridge.exposeInMainWorld('vibeDepot', {
  ai: createAIBridge(ipcRenderer),
  storage: createStorageBridge(ipcRenderer),
  shell: createShellBridge(ipcRenderer),
  db: createDbBridge(ipcRenderer),
});
