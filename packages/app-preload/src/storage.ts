import type { IpcRenderer } from 'electron';
import { IPC } from '@vibedepot/shared';
import { invokeWithDxErrors } from './errors';

export function createStorageBridge(ipc: IpcRenderer) {
  return {
    set(key: string, value: unknown): Promise<void> {
      return invokeWithDxErrors(ipc, IPC.STORAGE_SET, { key, value }) as Promise<void>;
    },

    get(key: string): Promise<unknown> {
      return invokeWithDxErrors(ipc, IPC.STORAGE_GET, { key });
    },

    delete(key: string): Promise<boolean> {
      return invokeWithDxErrors(ipc, IPC.STORAGE_DELETE, { key }) as Promise<boolean>;
    },

    keys(): Promise<string[]> {
      return invokeWithDxErrors(ipc, IPC.STORAGE_KEYS) as Promise<string[]>;
    },

    clear(): Promise<void> {
      return invokeWithDxErrors(ipc, IPC.STORAGE_CLEAR) as Promise<void>;
    },
  };
}
