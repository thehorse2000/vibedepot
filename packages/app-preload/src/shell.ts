import type { IpcRenderer } from 'electron';
import { IPC } from '@vibedepot/shared';
import { invokeWithDxErrors } from './errors';

export function createShellBridge(ipc: IpcRenderer) {
  return {
    getAppInfo(): Promise<unknown> {
      return invokeWithDxErrors(ipc, IPC.SHELL_GET_APP_INFO);
    },

    getVersion(): Promise<string> {
      return invokeWithDxErrors(ipc, IPC.SHELL_GET_VERSION) as Promise<string>;
    },

    openExternal(url: string): Promise<void> {
      return invokeWithDxErrors(ipc, IPC.SHELL_OPEN_EXTERNAL, { url }) as Promise<void>;
    },

    notify(title: string, body: string): Promise<void> {
      return invokeWithDxErrors(ipc, IPC.SHELL_NOTIFY, { title, body }) as Promise<void>;
    },

    setTitle(title: string): Promise<void> {
      return invokeWithDxErrors(ipc, IPC.SHELL_SET_TITLE, { title }) as Promise<void>;
    },

    theme(): Promise<'light' | 'dark'> {
      return invokeWithDxErrors(ipc, IPC.SHELL_THEME) as Promise<'light' | 'dark'>;
    },
  };
}
