import type { IpcRenderer } from 'electron';
import { IPC } from '@vibedepot/shared';

export function createStorageBridge(ipc: IpcRenderer) {
  return {
    set(key: string, value: unknown): Promise<void> {
      return ipc.invoke(IPC.STORAGE_SET, { key, value });
    },

    get(key: string): Promise<unknown> {
      return ipc.invoke(IPC.STORAGE_GET, { key });
    },

    delete(key: string): Promise<boolean> {
      return ipc.invoke(IPC.STORAGE_DELETE, { key });
    },

    keys(): Promise<string[]> {
      return ipc.invoke(IPC.STORAGE_KEYS);
    },

    clear(): Promise<void> {
      return ipc.invoke(IPC.STORAGE_CLEAR);
    },
  };
}
