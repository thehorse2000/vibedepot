import { ipcMain } from 'electron';
import {
  IPC,
  StorageSetSchema,
  StorageGetSchema,
  StorageDeleteSchema,
} from '@vibedepot/shared';
import { DxError, storageError, invalidParams } from '@vibedepot/shared';
import { ZodError } from 'zod';
import { appStorage } from '../appStorage';
import { getAppIdFromEvent, assertPermission, wrapHandler } from './register';

export function registerStorageIPC(): void {
  ipcMain.handle(
    IPC.STORAGE_SET,
    wrapHandler(async (_event: unknown, payload: unknown) => {
      const event = _event as Electron.IpcMainInvokeEvent;
      const appId = getAppIdFromEvent(event.sender);
      if (!appId) throw storageError('set', 'Storage is only available to apps');
      assertPermission(appId, 'storage.kv');

      let params;
      try {
        params = StorageSetSchema.parse(payload);
      } catch (err) {
        if (err instanceof ZodError) throw invalidParams(err);
        throw err;
      }
      appStorage.set(appId, params.key, params.value);
    })
  );

  ipcMain.handle(
    IPC.STORAGE_GET,
    wrapHandler(async (_event: unknown, payload: unknown) => {
      const event = _event as Electron.IpcMainInvokeEvent;
      const appId = getAppIdFromEvent(event.sender);
      if (!appId) throw storageError('get', 'Storage is only available to apps');
      assertPermission(appId, 'storage.kv');

      let params;
      try {
        params = StorageGetSchema.parse(payload);
      } catch (err) {
        if (err instanceof ZodError) throw invalidParams(err);
        throw err;
      }
      return appStorage.get(appId, params.key);
    })
  );

  ipcMain.handle(
    IPC.STORAGE_DELETE,
    wrapHandler(async (_event: unknown, payload: unknown) => {
      const event = _event as Electron.IpcMainInvokeEvent;
      const appId = getAppIdFromEvent(event.sender);
      if (!appId) throw storageError('delete', 'Storage is only available to apps');
      assertPermission(appId, 'storage.kv');

      let params;
      try {
        params = StorageDeleteSchema.parse(payload);
      } catch (err) {
        if (err instanceof ZodError) throw invalidParams(err);
        throw err;
      }
      return appStorage.delete(appId, params.key);
    })
  );

  ipcMain.handle(
    IPC.STORAGE_KEYS,
    wrapHandler(async (_event: unknown) => {
      const event = _event as Electron.IpcMainInvokeEvent;
      const appId = getAppIdFromEvent(event.sender);
      if (!appId) throw storageError('keys', 'Storage is only available to apps');
      assertPermission(appId, 'storage.kv');

      return appStorage.keys(appId);
    })
  );

  ipcMain.handle(
    IPC.STORAGE_CLEAR,
    wrapHandler(async (_event: unknown) => {
      const event = _event as Electron.IpcMainInvokeEvent;
      const appId = getAppIdFromEvent(event.sender);
      if (!appId) throw storageError('clear', 'Storage is only available to apps');
      assertPermission(appId, 'storage.kv');

      appStorage.clear(appId);
    })
  );
}
