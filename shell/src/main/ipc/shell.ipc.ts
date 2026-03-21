import { ipcMain, shell, Notification, app } from 'electron';
import {
  IPC,
  ShellOpenExternalSchema,
  ShellNotifySchema,
  ShellSetTitleSchema,
  AppLaunchSchema,
  AppCloseSchema,
} from '@vibedepot/shared';
import { getAppIdFromEvent } from './register';
import { getInstalledApp, getInstalledApps, loadHardcodedApps } from '../appManager';
import { launchApp, closeApp, getSystemTheme } from '../windowManager';

export function registerShellIPC(): void {
  // Load hardcoded apps on registration
  loadHardcodedApps();

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

  ipcMain.handle(IPC.SHELL_NOTIFY, async (_event, payload) => {
    const { title, body } = ShellNotifySchema.parse(payload);
    new Notification({ title, body }).show();
  });

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
    return getInstalledApps().map((a) => a.manifest);
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
}
