import type { WebContents } from 'electron';
import type { Permission } from '@vibedepot/shared';
import { DxError, permissionDenied } from '@vibedepot/shared';
import { getInstalledApp, isSideloaded } from '../appManager';
import { getAppIdFromWebContentsId, getWebContentsForApp } from '../windowManager';
import { registerKeysIPC } from './keys.ipc';
import { registerAIIPC } from './ai.ipc';
import { registerStorageIPC } from './storage.ipc';
import { registerShellIPC } from './shell.ipc';
import { registerDbIPC } from './db.ipc';
import { registerPublishIPC } from './publish.ipc';

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
    throw new DxError(
      'PERMISSION_DENIED',
      `Unknown app: ${appId}`,
      'Ensure the app is properly installed or sideloaded'
    );
  }

  if (!app.manifest.permissions.includes(permission)) {
    // If sideloaded, send a dev warning banner before throwing
    if (isSideloaded(appId)) {
      const webContents = getWebContentsForApp(appId);
      if (webContents) {
        webContents.send('dev:warning', {
          type: 'permission',
          permission,
          message: `Missing permission: "${permission}". Add it to your manifest.json to avoid this error in production.`,
        });
      }
    }
    // Always throw — PRD: the call fails regardless
    throw permissionDenied(appId, permission);
  }
}

/**
 * Wraps an IPC handler to serialize DxErrors for transport to the renderer.
 * Electron serializes errors as { message: string }, so we encode the full
 * DxError in the message field as JSON.
 */
export function wrapHandler<T>(
  handler: (...args: unknown[]) => Promise<T>
): (...args: unknown[]) => Promise<T> {
  return async (...args: unknown[]): Promise<T> => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof DxError) {
        throw new Error(JSON.stringify(err.toSerializable()));
      }
      throw err;
    }
  };
}

export function registerAllIPC(): void {
  registerKeysIPC();
  registerAIIPC();
  registerStorageIPC();
  registerShellIPC();
  registerDbIPC();
  registerPublishIPC();
  console.log('[IPC] All handlers registered');
}
