import type { CallAIParams, CallAIResponse } from './providers.types';
import type { AppManifest } from './manifest.types';

export interface VibeDepotBridge {
  ai: {
    callAI(params: CallAIParams): Promise<CallAIResponse>;
    streamAI(
      params: CallAIParams,
      onChunk: (chunk: string) => void
    ): Promise<void>;
    getProvider(): Promise<string>;
    getModel(): Promise<string>;
    listProviders(): Promise<string[]>;
  };
  storage: {
    set(key: string, value: unknown): Promise<void>;
    get(key: string): Promise<unknown>;
    delete(key: string): Promise<boolean>;
    keys(): Promise<string[]>;
    clear(): Promise<void>;
  };
  shell: {
    getAppInfo(): Promise<AppManifest>;
    getVersion(): Promise<string>;
    openExternal(url: string): Promise<void>;
    notify(title: string, body: string): Promise<void>;
    setTitle(title: string): Promise<void>;
    theme(): Promise<'light' | 'dark'>;
  };
}

declare global {
  interface Window {
    vibeDepot: VibeDepotBridge;
  }
}
