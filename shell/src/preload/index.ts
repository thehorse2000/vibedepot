import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '@vibedepot/shared';

// Shell preload — exposes internal API for the shell renderer (settings, app management)
// This is NOT the app preload (which is @vibedepot/app-preload)

const shellAPI = {
  keys: {
    set: (provider: string, key: string) =>
      ipcRenderer.invoke(IPC.KEYS_SET, { provider, key }),
    get: (provider: string) =>
      ipcRenderer.invoke(IPC.KEYS_GET, { provider }),
    delete: (provider: string) =>
      ipcRenderer.invoke(IPC.KEYS_DELETE, { provider }),
    list: () => ipcRenderer.invoke(IPC.KEYS_LIST),
    has: (provider: string) =>
      ipcRenderer.invoke(IPC.KEYS_HAS, { provider }),
  },
  apps: {
    list: () => ipcRenderer.invoke(IPC.APP_LIST),
    launch: (appId: string) =>
      ipcRenderer.invoke(IPC.APP_LAUNCH, { appId }),
    close: (appId: string) =>
      ipcRenderer.invoke(IPC.APP_CLOSE, { appId }),
  },
  shell: {
    getVersion: () => ipcRenderer.invoke(IPC.SHELL_GET_VERSION),
    theme: () => ipcRenderer.invoke(IPC.SHELL_THEME),
  },
};

contextBridge.exposeInMainWorld('shellAPI', shellAPI);

export type ShellAPI = typeof shellAPI;
