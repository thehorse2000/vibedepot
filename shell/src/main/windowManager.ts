import { BrowserWindow, nativeTheme } from 'electron';
import { join } from 'path';
import type { AppManifest } from '@vibedepot/shared';
import { getMainWindow } from './index';

interface RunningApp {
  window: BrowserWindow;
  manifest: AppManifest;
}

const runningApps = new Map<string, RunningApp>();

export function launchApp(
  manifest: AppManifest,
  appPath: string
): void {
  // Don't launch if already running — focus instead
  if (runningApps.has(manifest.id)) {
    showApp(manifest.id);
    return;
  }

  // Resolve the app-preload path
  let preloadPath: string;
  try {
    preloadPath = require.resolve('@vibedepot/app-preload/dist/index.js');
  } catch {
    // Fallback for dev mode
    preloadPath = join(
      __dirname,
      '../../../packages/app-preload/dist/index.js'
    );
  }

  const appWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 480,
    minHeight: 400,
    title: manifest.name,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: preloadPath,
      additionalArguments: [`--app-id=${manifest.id}`],
    },
  });

  const entryPath = join(appPath, manifest.entry);
  appWindow.loadFile(entryPath);

  // Clean up and notify shell renderer when the app window closes
  appWindow.on('closed', () => {
    runningApps.delete(manifest.id);
    const main = getMainWindow();
    if (main && !main.isDestroyed()) {
      main.webContents.send('app:closed', manifest.id);
    }
  });

  runningApps.set(manifest.id, { window: appWindow, manifest });
}

export function closeApp(appId: string): void {
  const running = runningApps.get(appId);
  if (!running) return;

  running.window.close();
  // 'closed' handler above removes from map
}

export function showApp(appId: string): void {
  const running = runningApps.get(appId);
  if (!running) return;

  if (running.window.isMinimized()) {
    running.window.restore();
  }
  running.window.focus();
}

export function getRunningAppIds(): string[] {
  return Array.from(runningApps.keys());
}

export function getAppIdFromWebContentsId(
  webContentsId: number
): string | null {
  for (const [appId, running] of runningApps) {
    if (running.window.webContents.id === webContentsId) {
      return appId;
    }
  }
  return null;
}

export function getSystemTheme(): 'light' | 'dark' {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
}
