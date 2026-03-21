import { ipcMain } from 'electron';
import { IPC, KeysSetSchema, KeysGetSchema, KeysDeleteSchema } from '@vibedepot/shared';
import {
  setApiKey,
  getApiKey,
  deleteApiKey,
  listConfiguredProviders,
  hasApiKey,
} from '../keychain';

export function registerKeysIPC(): void {
  ipcMain.handle(IPC.KEYS_SET, async (_event, payload) => {
    const { provider, key } = KeysSetSchema.parse(payload);
    await setApiKey(provider, key);
    return { success: true };
  });

  ipcMain.handle(IPC.KEYS_GET, async (_event, payload) => {
    const { provider } = KeysGetSchema.parse(payload);
    const key = await getApiKey(provider);
    // Return masked key for display, never the full key
    if (key) {
      return {
        exists: true,
        masked: key.slice(0, 8) + '...' + key.slice(-4),
      };
    }
    return { exists: false, masked: null };
  });

  ipcMain.handle(IPC.KEYS_DELETE, async (_event, payload) => {
    const { provider } = KeysDeleteSchema.parse(payload);
    const deleted = await deleteApiKey(provider);
    return { deleted };
  });

  ipcMain.handle(IPC.KEYS_LIST, async () => {
    const providers = await listConfiguredProviders();
    return { providers };
  });

  ipcMain.handle(IPC.KEYS_HAS, async (_event, payload) => {
    const { provider } = KeysGetSchema.parse(payload);
    const exists = await hasApiKey(provider);
    return { exists };
  });
}
