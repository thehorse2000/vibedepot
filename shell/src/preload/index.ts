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
    onAppClosed: (callback: (appId: string) => void) => {
      const handler = (_event: unknown, appId: string) => callback(appId);
      ipcRenderer.on('app:closed', handler);
      return () => ipcRenderer.removeListener('app:closed', handler);
    },
  },
  store: {
    fetchRegistry: () => ipcRenderer.invoke(IPC.STORE_FETCH_REGISTRY),
    installApp: (
      appId: string,
      bundleUrl: string,
      expectedChecksum: string,
      version: string
    ) =>
      ipcRenderer.invoke(IPC.STORE_INSTALL_APP, {
        appId,
        bundleUrl,
        expectedChecksum,
        version,
      }),
    uninstallApp: (appId: string, deleteData?: boolean) =>
      ipcRenderer.invoke(IPC.STORE_UNINSTALL_APP, { appId, deleteData }),
  },
  shell: {
    getVersion: () => ipcRenderer.invoke(IPC.SHELL_GET_VERSION),
    theme: () => ipcRenderer.invoke(IPC.SHELL_THEME),
  },
  sideload: {
    selectFolder: () =>
      ipcRenderer.invoke(IPC.SHELL_SELECT_FOLDER) as Promise<string | null>,
    loadApp: (folderPath: string) =>
      ipcRenderer.invoke(IPC.STORE_SIDELOAD_APP, { folderPath }),
    unloadApp: (appId: string) =>
      ipcRenderer.invoke(IPC.STORE_UNSIDELOAD_APP, { appId }),
    onChanged: (callback: (appId: string) => void) => {
      const handler = (_event: unknown, appId: string) => callback(appId);
      ipcRenderer.on('sideload:changed', handler);
      return () => ipcRenderer.removeListener('sideload:changed', handler);
    },
  },
  publish: {
    selectFolder: () =>
      ipcRenderer.invoke(IPC.PUBLISH_SELECT_FOLDER) as Promise<string | null>,
    readFolder: (folderPath: string) =>
      ipcRenderer.invoke(IPC.PUBLISH_READ_FOLDER, { folderPath }),
    validate: (folderPath: string, manifest: Record<string, unknown>) =>
      ipcRenderer.invoke(IPC.PUBLISH_VALIDATE, { folderPath, manifest }),
    createBundle: (folderPath: string, manifest: Record<string, unknown>) =>
      ipcRenderer.invoke(IPC.PUBLISH_CREATE_BUNDLE, { folderPath, manifest }),
    openPR: (manifest: Record<string, unknown>, checksum: string) =>
      ipcRenderer.invoke(IPC.PUBLISH_OPEN_PR, { manifest, checksum }),
  },
};

contextBridge.exposeInMainWorld('shellAPI', shellAPI);

export type ShellAPI = typeof shellAPI;
