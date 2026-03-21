import type { WebContents } from 'electron';
import type { Permission } from '@vibedepot/shared';
import { getInstalledApp } from '../appManager';
import { getAppIdFromWebContentsId } from '../windowManager';
import { registerKeysIPC } from './keys.ipc';
import { registerAIIPC } from './ai.ipc';
import { registerStorageIPC } from './storage.ipc';
import { registerShellIPC } from './shell.ipc';

export function getAppIdFromEvent(sender: WebContents): string | null {
  return getAppIdFromWebContentsId(sender.id);
}

export function assertPermission(
  appId: string | null,
  permission: Permission
): void {
  // Shell renderer (null appId) has full access
  if (appId === null) return;

  // storage.kv is auto-granted
  if (permission === 'storage.kv') return;

  const app = getInstalledApp(appId);
  if (!app) {
    throw new Error(`Unknown app: ${appId}`);
  }

  if (!app.manifest.permissions.includes(permission)) {
    throw new Error(
      `App "${appId}" does not have "${permission}" permission`
    );
  }
}

export function registerAllIPC(): void {
  registerKeysIPC();
  registerAIIPC();
  registerStorageIPC();
  registerShellIPC();
  console.log('[IPC] All handlers registered');
}
