import { ipcMain, shell, Notification, app, dialog } from 'electron';
import {
  IPC,
  ShellOpenExternalSchema,
  ShellNotifySchema,
  ShellSetTitleSchema,
  AppLaunchSchema,
  AppCloseSchema,
  StoreInstallSchema,
  StoreUninstallSchema,
  SideloadAppSchema,
  UnsideloadAppSchema,
} from '@vibedepot/shared';
import { getAppIdFromEvent, assertPermission, wrapHandler } from './register';
import {
  getInstalledApp,
  getInstalledApps,
  loadInstalledApps,
  installApp,
  uninstallApp,
  sideloadApp,
  unsideloadApp,
  isSideloaded,
} from '../appManager';
import { launchApp, closeApp, getSystemTheme } from '../windowManager';
import { fetchRegistry } from '../registryClient';

export function registerShellIPC(): void {
  // Load installed apps from disk
  loadInstalledApps();

  ipcMain.handle(IPC.SHELL_GET_APP_INFO, async (event) => {
    const appId = getAppIdFromEvent(event.sender);
    if (!appId) return null;
    const installed = getInstalledApp(appId);
    return installed?.manifest ?? null;
  });

  ipcMain.handle(IPC.SHELL_GET_VERSION, async () => {
    return app.getVersion();
  });

  ipcMain.handle(IPC.SHELL_OPEN_EXTERNAL, async (_event, payload) => {
    const { url } = ShellOpenExternalSchema.parse(payload);
    await shell.openExternal(url);
  });

  ipcMain.handle(
    IPC.SHELL_NOTIFY,
    wrapHandler(async (_event: unknown, payload: unknown) => {
      const event = _event as Electron.IpcMainInvokeEvent;
      const appId = getAppIdFromEvent(event.sender);
      assertPermission(appId, 'notifications');
      const { title, body } = ShellNotifySchema.parse(payload);
      new Notification({ title, body }).show();
    })
  );

  ipcMain.handle(IPC.SHELL_SET_TITLE, async (event, payload) => {
    const { title } = ShellSetTitleSchema.parse(payload);
    const win = event.sender;
    win.send('shell:titleChanged', title);
  });

  ipcMain.handle(IPC.SHELL_THEME, async () => {
    return getSystemTheme();
  });

  // App management (for shell renderer)
  ipcMain.handle(IPC.APP_LIST, async () => {
    return getInstalledApps().map((a) => ({
      ...a.manifest,
      _sideloaded: isSideloaded(a.manifest.id),
    }));
  });

  ipcMain.handle(IPC.APP_LAUNCH, async (_event, payload) => {
    const { appId } = AppLaunchSchema.parse(payload);
    const installed = getInstalledApp(appId);
    if (!installed) {
      throw new Error(`App not found: ${appId}`);
    }
    launchApp(installed.manifest, installed.localPath);
  });

  ipcMain.handle(IPC.APP_CLOSE, async (_event, payload) => {
    const { appId } = AppCloseSchema.parse(payload);
    closeApp(appId);
  });

  // Store operations
  ipcMain.handle(IPC.STORE_FETCH_REGISTRY, async () => {
    return await fetchRegistry();
  });

  ipcMain.handle(IPC.STORE_INSTALL_APP, async (_event, payload) => {
    const { appId, bundleUrl, expectedChecksum, version } =
      StoreInstallSchema.parse(payload);
    const manifest = await installApp(appId, bundleUrl, expectedChecksum, version);
    return manifest;
  });

  ipcMain.handle(IPC.STORE_UNINSTALL_APP, async (_event, payload) => {
    const { appId, deleteData } = StoreUninstallSchema.parse(payload);
    uninstallApp(appId, deleteData);
  });

  // Sideloading
  ipcMain.handle(IPC.SHELL_SELECT_FOLDER, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select app folder to sideload',
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle(IPC.STORE_SIDELOAD_APP, async (_event, payload) => {
    const { folderPath } = SideloadAppSchema.parse(payload);
    return sideloadApp(folderPath);
  });

  ipcMain.handle(IPC.STORE_UNSIDELOAD_APP, async (_event, payload) => {
    const { appId } = UnsideloadAppSchema.parse(payload);
    unsideloadApp(appId);
  });
}
