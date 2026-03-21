import type { IpcRenderer } from 'electron';
import { IPC } from '@vibedepot/shared';
import type { CallAIParams, CallAIResponse } from '@vibedepot/shared';

export function createAIBridge(ipc: IpcRenderer) {
  return {
    callAI(params: CallAIParams): Promise<CallAIResponse> {
      return ipc.invoke(IPC.AI_CALL, params);
    },

    streamAI(
      params: CallAIParams,
      onChunk: (chunk: string) => void
    ): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        const chunkHandler = (_event: unknown, text: string): void => {
          onChunk(text);
        };

        const endHandler = (): void => {
          cleanup();
          resolve();
        };

        const errorHandler = (_event: unknown, err: string): void => {
          cleanup();
          reject(new Error(err));
        };

        const cleanup = (): void => {
          ipc.removeListener(IPC.AI_STREAM_CHUNK, chunkHandler);
          ipc.removeListener(IPC.AI_STREAM_END, endHandler);
          ipc.removeListener(IPC.AI_STREAM_ERROR, errorHandler);
        };

        ipc.on(IPC.AI_STREAM_CHUNK, chunkHandler);
        ipc.on(IPC.AI_STREAM_END, endHandler);
        ipc.on(IPC.AI_STREAM_ERROR, errorHandler);

        ipc.invoke(IPC.AI_STREAM, params).catch((err: Error) => {
          cleanup();
          reject(err);
        });
      });
    },

    getProvider(): Promise<string> {
      return ipc.invoke(IPC.AI_GET_PROVIDER);
    },

    getModel(): Promise<string> {
      return ipc.invoke(IPC.AI_GET_MODEL);
    },

    listProviders(): Promise<string[]> {
      return ipc.invoke(IPC.AI_LIST_PROVIDERS);
    },
  };
}
