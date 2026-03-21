import type { IpcRenderer } from 'electron';
import { IPC } from '@vibedepot/shared';

export function createShellBridge(ipc: IpcRenderer) {
  return {
    getAppInfo(): Promise<unknown> {
      return ipc.invoke(IPC.SHELL_GET_APP_INFO);
    },

    getVersion(): Promise<string> {
      return ipc.invoke(IPC.SHELL_GET_VERSION);
    },

    openExternal(url: string): Promise<void> {
      return ipc.invoke(IPC.SHELL_OPEN_EXTERNAL, { url });
    },

    notify(title: string, body: string): Promise<void> {
      return ipc.invoke(IPC.SHELL_NOTIFY, { title, body });
    },

    setTitle(title: string): Promise<void> {
      return ipc.invoke(IPC.SHELL_SET_TITLE, { title });
    },

    theme(): Promise<'light' | 'dark'> {
      return ipc.invoke(IPC.SHELL_THEME);
    },
  };
}
