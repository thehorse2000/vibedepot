import { BrowserWindow, nativeTheme } from 'electron';
import { join } from 'path';
import { watch, readFileSync } from 'fs';
import type { FSWatcher } from 'fs';
import type { AppManifest } from '@vibedepot/shared';
import { getMainWindow } from './index';
import { closeDb } from './appDatabase';
import { isSideloaded, updateSideloadedManifest } from './appManager';

interface RunningApp {
  window: BrowserWindow;
  manifest: AppManifest;
  watcher?: FSWatcher;
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

  const sideloaded = isSideloaded(manifest.id);

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
      additionalArguments: [
        `--app-id=${manifest.id}`,
        ...(sideloaded ? ['--sideloaded'] : []),
      ],
    },
  });

  const entryPath = join(appPath, manifest.entry);
  appWindow.loadFile(entryPath);

  // File watcher for sideloaded apps — hot reload on save
  let fileWatcher: FSWatcher | undefined;
  if (sideloaded) {
    let debounceTimer: NodeJS.Timeout | null = null;
    fileWatcher = watch(appPath, { recursive: true }, (_eventType, filename) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (appWindow.isDestroyed()) return;

        // Re-read manifest if it changed
        if (filename === 'manifest.json') {
          updateSideloadedManifest(manifest.id);
        }

        // Reload the app window
        appWindow.webContents.reloadIgnoringCache();

        // Notify shell renderer that sideloaded app changed
        const main = getMainWindow();
        if (main && !main.isDestroyed()) {
          main.webContents.send('sideload:changed', manifest.id);
        }
      }, 300);
    });
  }

  // Clean up and notify shell renderer when the app window closes
  appWindow.on('closed', () => {
    const entry = runningApps.get(manifest.id);
    if (entry?.watcher) {
      entry.watcher.close();
    }
    runningApps.delete(manifest.id);
    closeDb(manifest.id);
    const main = getMainWindow();
    if (main && !main.isDestroyed()) {
      main.webContents.send('app:closed', manifest.id);
    }
  });

  runningApps.set(manifest.id, { window: appWindow, manifest, watcher: fileWatcher });
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

export function getWebContentsForApp(
  appId: string
): Electron.WebContents | null {
  const running = runningApps.get(appId);
  if (!running) return null;
  return running.window.webContents;
}

export function getSystemTheme(): 'light' | 'dark' {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
}
