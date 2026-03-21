import { BrowserView, BrowserWindow, nativeTheme } from 'electron';
import { join } from 'path';
import type { AppManifest } from '@vibedepot/shared';
import { getMainWindow } from './index';

interface RunningApp {
  view: BrowserView;
  manifest: AppManifest;
}

const runningApps = new Map<string, RunningApp>();
const SIDEBAR_WIDTH = 240;

export function launchApp(
  manifest: AppManifest,
  appPath: string
): void {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;

  // Don't launch if already running
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

  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: preloadPath,
      additionalArguments: [`--app-id=${manifest.id}`],
    },
  });

  mainWindow.addBrowserView(view);
  const bounds = mainWindow.getContentBounds();
  view.setBounds({
    x: SIDEBAR_WIDTH,
    y: 0,
    width: bounds.width - SIDEBAR_WIDTH,
    height: bounds.height,
  });
  view.setAutoResize({ width: true, height: true });

  const entryPath = join(appPath, manifest.entry);
  view.webContents.loadFile(entryPath);

  runningApps.set(manifest.id, { view, manifest });
}

export function closeApp(appId: string): void {
  const mainWindow = getMainWindow();
  const running = runningApps.get(appId);
  if (!running || !mainWindow) return;

  mainWindow.removeBrowserView(running.view);
  running.view.webContents.close();
  runningApps.delete(appId);
}

export function showApp(appId: string): void {
  const mainWindow = getMainWindow();
  const running = runningApps.get(appId);
  if (!running || !mainWindow) return;

  // Bring to top by removing and re-adding
  mainWindow.removeBrowserView(running.view);
  mainWindow.addBrowserView(running.view);
}

export function getRunningAppIds(): string[] {
  return Array.from(runningApps.keys());
}

export function getAppIdFromWebContentsId(
  webContentsId: number
): string | null {
  for (const [appId, running] of runningApps) {
    if (running.view.webContents.id === webContentsId) {
      return appId;
    }
  }
  return null;
}

export function getSystemTheme(): 'light' | 'dark' {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
}
