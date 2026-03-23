/// <reference types="vite/client" />

/** Bridge API injected by the VibeDepot shell */
interface VibeDepot {
  ai: {
    callAI(params: {
      messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
      maxTokens?: number;
      temperature?: number;
      provider?: string;
      model?: string;
    }): Promise<{ content: string }>;
    streamAI(
      params: {
        messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
        maxTokens?: number;
        temperature?: number;
      },
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
    getAppInfo(): Promise<unknown>;
    getVersion(): Promise<string>;
    openExternal(url: string): Promise<void>;
    notify(title: string, body: string): Promise<void>;
    setTitle(title: string): Promise<void>;
    theme(): Promise<'light' | 'dark'>;
  };
  db: {
    run(sql: string, params?: unknown[]): Promise<{ changes: number; lastInsertRowid: number }>;
    query(sql: string, params?: unknown[]): Promise<unknown[]>;
    transaction(statements: Array<{ sql: string; params?: unknown[] }>): Promise<void>;
  };
}

declare global {
  interface Window {
    vibeDepot: VibeDepot;
  }
}
