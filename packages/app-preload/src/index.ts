import { contextBridge, ipcRenderer } from 'electron';
import { createAIBridge } from './ai';
import { createStorageBridge } from './storage';
import { createShellBridge } from './shell';

contextBridge.exposeInMainWorld('vibeDepot', {
  ai: createAIBridge(ipcRenderer),
  storage: createStorageBridge(ipcRenderer),
  shell: createShellBridge(ipcRenderer),
});
