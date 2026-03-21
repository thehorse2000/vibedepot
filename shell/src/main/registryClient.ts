import { app, net } from 'electron';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { RegistryEntry } from '@vibedepot/shared';

const REGISTRY_URL =
  'https://raw.githubusercontent.com/thehorse2000/vibedepot-registry/main/registry.json';
const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

interface RegistryCache {
  entries: RegistryEntry[];
  fetchedAt: number;
}

let memoryCache: RegistryCache | null = null;

function getCachePath(): string {
  const dir = app.getPath('userData');
  return join(dir, 'registry-cache.json');
}

function loadDiskCache(): RegistryCache | null {
  try {
    const cachePath = getCachePath();
    if (!existsSync(cachePath)) return null;
    const raw = JSON.parse(readFileSync(cachePath, 'utf-8'));
    if (raw && Array.isArray(raw.entries) && typeof raw.fetchedAt === 'number') {
      return raw as RegistryCache;
    }
  } catch {
    // Corrupt cache — ignore
  }
  return null;
}

function saveDiskCache(cache: RegistryCache): void {
  try {
    const cachePath = getCachePath();
    const dir = join(cachePath, '..');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(cachePath, JSON.stringify(cache));
  } catch (err) {
    console.error('[Registry] Failed to write cache:', err);
  }
}

function isCacheFresh(cache: RegistryCache): boolean {
  return Date.now() - cache.fetchedAt < CACHE_MAX_AGE_MS;
}

async function fetchFromGitHub(): Promise<RegistryEntry[]> {
  return new Promise((resolve, reject) => {
    const request = net.request(REGISTRY_URL);
    let body = '';

    request.on('response', (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Registry fetch failed: HTTP ${response.statusCode}`));
        return;
      }
      response.on('data', (chunk) => {
        body += chunk.toString();
      });
      response.on('end', () => {
        try {
          const entries = JSON.parse(body) as RegistryEntry[];
          resolve(entries);
        } catch (err) {
          reject(new Error(`Failed to parse registry JSON: ${err}`));
        }
      });
    });

    request.on('error', (err) => {
      reject(err);
    });

    request.end();
  });
}

export async function fetchRegistry(
  options: { forceRefresh?: boolean } = {}
): Promise<RegistryEntry[]> {
  // Try memory cache first
  if (!options.forceRefresh && memoryCache && isCacheFresh(memoryCache)) {
    return memoryCache.entries;
  }

  // Try disk cache
  if (!options.forceRefresh && !memoryCache) {
    const disk = loadDiskCache();
    if (disk) {
      memoryCache = disk;
      if (isCacheFresh(disk)) {
        // Fresh disk cache — also kick off a background refresh
        refreshInBackground();
        return disk.entries;
      }
    }
  }

  // Fetch from network
  try {
    const entries = await fetchFromGitHub();
    const cache: RegistryCache = { entries, fetchedAt: Date.now() };
    memoryCache = cache;
    saveDiskCache(cache);
    return entries;
  } catch (err) {
    console.error('[Registry] Network fetch failed:', err);
    // Fall back to stale cache if available
    if (memoryCache) {
      return memoryCache.entries;
    }
    const disk = loadDiskCache();
    if (disk) {
      memoryCache = disk;
      return disk.entries;
    }
    throw new Error('No registry data available (network unavailable and no cache)');
  }
}

function refreshInBackground(): void {
  fetchFromGitHub()
    .then((entries) => {
      const cache: RegistryCache = { entries, fetchedAt: Date.now() };
      memoryCache = cache;
      saveDiskCache(cache);
      console.log('[Registry] Background refresh complete');
    })
    .catch((err) => {
      console.warn('[Registry] Background refresh failed:', err);
    });
}
