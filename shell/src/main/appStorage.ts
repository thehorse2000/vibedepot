import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';

function getStoreDir(appId: string): string {
  const dir = join(app.getPath('userData'), 'app-data', appId);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getStorePath(appId: string): string {
  return join(getStoreDir(appId), 'store.json');
}

function readStore(appId: string): Record<string, unknown> {
  const path = getStorePath(appId);
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return {};
  }
}

function writeStore(appId: string, data: Record<string, unknown>): void {
  writeFileSync(getStorePath(appId), JSON.stringify(data, null, 2));
}

export const appStorage = {
  set(appId: string, key: string, value: unknown): void {
    const store = readStore(appId);
    store[key] = value;
    writeStore(appId, store);
  },

  get(appId: string, key: string): unknown {
    const store = readStore(appId);
    return store[key] ?? null;
  },

  delete(appId: string, key: string): boolean {
    const store = readStore(appId);
    if (key in store) {
      delete store[key];
      writeStore(appId, store);
      return true;
    }
    return false;
  },

  keys(appId: string): string[] {
    return Object.keys(readStore(appId));
  },

  clear(appId: string): void {
    writeStore(appId, {});
  },
};
