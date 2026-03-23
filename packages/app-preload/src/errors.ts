import type { IpcRenderer } from 'electron';
import { DxError } from '@vibedepot/shared';

/**
 * Wraps ipcRenderer.invoke to reconstruct DxErrors from serialized form.
 * The main process serializes DxErrors as JSON in the error message.
 */
export async function invokeWithDxErrors(
  ipc: IpcRenderer,
  channel: string,
  payload?: unknown
): Promise<unknown> {
  try {
    return await ipc.invoke(channel, payload);
  } catch (err) {
    if (err instanceof Error && err.message) {
      try {
        const parsed = JSON.parse(err.message);
        if (DxError.isSerializedDxError(parsed)) {
          throw DxError.fromSerializable(parsed);
        }
      } catch (parseErr) {
        // Not a serialized DxError — rethrow original
        if (parseErr instanceof DxError) throw parseErr;
      }
    }
    throw err;
  }
}
