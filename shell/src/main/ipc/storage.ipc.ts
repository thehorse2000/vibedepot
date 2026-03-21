import { ipcMain } from 'electron';
import {
  IPC,
  StorageSetSchema,
  StorageGetSchema,
  StorageDeleteSchema,
} from '@vibedepot/shared';
import { appStorage } from '../appStorage';
import { getAppIdFromEvent, assertPermission } from './register';

export function registerStorageIPC(): void {
  ipcMain.handle(IPC.STORAGE_SET, async (event, payload) => {
    const appId = getAppIdFromEvent(event.sender);
    if (!appId) throw new Error('Storage is only available to apps');
    assertPermission(appId, 'storage.kv');

    const { key, value } = StorageSetSchema.parse(payload);
    appStorage.set(appId, key, value);
  });

  ipcMain.handle(IPC.STORAGE_GET, async (event, payload) => {
    const appId = getAppIdFromEvent(event.sender);
    if (!appId) throw new Error('Storage is only available to apps');
    assertPermission(appId, 'storage.kv');

    const { key } = StorageGetSchema.parse(payload);
    return appStorage.get(appId, key);
  });

  ipcMain.handle(IPC.STORAGE_DELETE, async (event, payload) => {
    const appId = getAppIdFromEvent(event.sender);
    if (!appId) throw new Error('Storage is only available to apps');
    assertPermission(appId, 'storage.kv');

    const { key } = StorageDeleteSchema.parse(payload);
    return appStorage.delete(appId, key);
  });

  ipcMain.handle(IPC.STORAGE_KEYS, async (event) => {
    const appId = getAppIdFromEvent(event.sender);
    if (!appId) throw new Error('Storage is only available to apps');
    assertPermission(appId, 'storage.kv');

    return appStorage.keys(appId);
  });

  ipcMain.handle(IPC.STORAGE_CLEAR, async (event) => {
    const appId = getAppIdFromEvent(event.sender);
    if (!appId) throw new Error('Storage is only available to apps');
    assertPermission(appId, 'storage.kv');

    appStorage.clear(appId);
  });
}
