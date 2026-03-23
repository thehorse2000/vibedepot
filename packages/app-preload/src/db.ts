import type { IpcRenderer } from 'electron';
import { IPC } from '@vibedepot/shared';
import { invokeWithDxErrors } from './errors';

export function createDbBridge(ipc: IpcRenderer) {
  return {
    run(
      sql: string,
      params?: unknown[]
    ): Promise<{ changes: number; lastInsertRowid: number }> {
      return invokeWithDxErrors(ipc, IPC.DB_RUN, { sql, params }) as Promise<{
        changes: number;
        lastInsertRowid: number;
      }>;
    },

    query(sql: string, params?: unknown[]): Promise<unknown[]> {
      return invokeWithDxErrors(ipc, IPC.DB_QUERY, { sql, params }) as Promise<unknown[]>;
    },

    transaction(
      statements: Array<{ sql: string; params?: unknown[] }>
    ): Promise<void> {
      return invokeWithDxErrors(ipc, IPC.DB_TRANSACTION, { statements }) as Promise<void>;
    },
  };
}
