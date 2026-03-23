import { ipcMain } from 'electron';
import { IPC, DbRunSchema, DbQuerySchema, DbTransactionSchema } from '@vibedepot/shared';
import { DxError, dbError, invalidParams, storageError } from '@vibedepot/shared';
import { ZodError } from 'zod';
import { getAppIdFromEvent, assertPermission, wrapHandler } from './register';
import { runQuery, queryAll, execTransaction } from '../appDatabase';

export function registerDbIPC(): void {
  ipcMain.handle(
    IPC.DB_RUN,
    wrapHandler(async (_event: unknown, payload: unknown) => {
      const event = _event as Electron.IpcMainInvokeEvent;
      const appId = getAppIdFromEvent(event.sender);
      if (!appId) throw storageError('db.run', 'Database is only available to apps');
      assertPermission(appId, 'storage.db');

      let params;
      try {
        params = DbRunSchema.parse(payload);
      } catch (err) {
        if (err instanceof ZodError) throw invalidParams(err);
        throw err;
      }

      try {
        return runQuery(appId, params.sql, params.params);
      } catch (err) {
        if (err instanceof DxError) throw err;
        throw dbError('run', err instanceof Error ? err.message : 'Unknown error');
      }
    })
  );

  ipcMain.handle(
    IPC.DB_QUERY,
    wrapHandler(async (_event: unknown, payload: unknown) => {
      const event = _event as Electron.IpcMainInvokeEvent;
      const appId = getAppIdFromEvent(event.sender);
      if (!appId) throw storageError('db.query', 'Database is only available to apps');
      assertPermission(appId, 'storage.db');

      let params;
      try {
        params = DbQuerySchema.parse(payload);
      } catch (err) {
        if (err instanceof ZodError) throw invalidParams(err);
        throw err;
      }

      try {
        return queryAll(appId, params.sql, params.params);
      } catch (err) {
        if (err instanceof DxError) throw err;
        throw dbError('query', err instanceof Error ? err.message : 'Unknown error');
      }
    })
  );

  ipcMain.handle(
    IPC.DB_TRANSACTION,
    wrapHandler(async (_event: unknown, payload: unknown) => {
      const event = _event as Electron.IpcMainInvokeEvent;
      const appId = getAppIdFromEvent(event.sender);
      if (!appId) throw storageError('db.transaction', 'Database is only available to apps');
      assertPermission(appId, 'storage.db');

      let params;
      try {
        params = DbTransactionSchema.parse(payload);
      } catch (err) {
        if (err instanceof ZodError) throw invalidParams(err);
        throw err;
      }

      try {
        execTransaction(appId, params.statements);
      } catch (err) {
        if (err instanceof DxError) throw err;
        throw dbError('transaction', err instanceof Error ? err.message : 'Unknown error');
      }
    })
  );
}
