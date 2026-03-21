import { createHash } from 'crypto';
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
} from 'fs';
import { join } from 'path';
import { app, net } from 'electron';
import type { AppManifest } from '@vibedepot/shared';

export interface InstalledApp {
  manifest: AppManifest;
  localPath: string;
}

const installedApps = new Map<string, InstalledApp>();

function getAppsDir(): string {
  const dir = join(app.getPath('userData'), 'apps');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function getInstallDbPath(): string {
  return join(app.getPath('userData'), 'installed-apps.json');
}

function saveInstallDb(): void {
  const entries: Record<string, { version: string; installedAt: string }> = {};
  for (const [id, installed] of installedApps) {
    entries[id] = {
      version: installed.manifest.version,
      installedAt: new Date().toISOString(),
    };
  }
  writeFileSync(getInstallDbPath(), JSON.stringify(entries, null, 2));
}

// Load apps already installed to the user data directory
export function loadInstalledApps(): void {
  const appsDir = getAppsDir();
  try {
    const dirs = readdirSync(appsDir, { withFileTypes: true }).filter((d) =>
      d.isDirectory()
    );
    for (const dir of dirs) {
      const appPath = join(appsDir, dir.name);
      const manifestPath = join(appPath, 'manifest.json');
      if (existsSync(manifestPath)) {
        try {
          const manifest: AppManifest = JSON.parse(
            readFileSync(manifestPath, 'utf-8')
          );
          installedApps.set(manifest.id, { manifest, localPath: appPath });
          console.log(`[AppManager] Loaded installed app: ${manifest.name}`);
        } catch (err) {
          console.error(`[AppManager] Bad manifest in ${dir.name}:`, err);
        }
      }
    }
  } catch {
    // apps dir may not exist yet
  }
}


export function getInstalledApps(): InstalledApp[] {
  return Array.from(installedApps.values());
}

export function getInstalledApp(appId: string): InstalledApp | undefined {
  return installedApps.get(appId);
}

export function isAppInstalled(appId: string): boolean {
  return installedApps.has(appId);
}

// Download a file using Electron's net module (works in main process)
function downloadBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const request = net.request(url);
    const chunks: Buffer[] = [];

    request.on('response', (response) => {
      // Follow redirects (GitHub releases use 302)
      if (
        (response.statusCode === 301 || response.statusCode === 302) &&
        response.headers.location
      ) {
        const redirectUrl = Array.isArray(response.headers.location)
          ? response.headers.location[0]
          : response.headers.location;
        downloadBuffer(redirectUrl).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Download failed: HTTP ${response.statusCode}`));
        return;
      }

      response.on('data', (chunk) => {
        chunks.push(chunk as Buffer);
      });
      response.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    request.on('error', reject);
    request.end();
  });
}

function verifyChecksum(data: Buffer, expected: string): boolean {
  if (!expected) return true; // No checksum to verify
  const actual = createHash('sha256').update(data).digest('hex');
  return actual === expected;
}

export async function installApp(
  appId: string,
  bundleUrl: string,
  expectedChecksum: string,
  version: string
): Promise<AppManifest> {
  console.log(`[AppManager] Installing ${appId}@${version}...`);

  // Download the zip
  const zipBuffer = await downloadBuffer(bundleUrl);

  // Verify checksum
  if (expectedChecksum && !verifyChecksum(zipBuffer, expectedChecksum)) {
    throw new Error(
      `Checksum mismatch for ${appId}. Bundle may be tampered with.`
    );
  }

  // Extract zip to apps/{id}/
  const appDir = join(getAppsDir(), appId);
  if (existsSync(appDir)) {
    rmSync(appDir, { recursive: true, force: true });
  }
  mkdirSync(appDir, { recursive: true });

  // Use Node's built-in zip extraction (available in Node 22+, fall back to manual)
  const { extractZip } = await import('./zipExtractor');
  await extractZip(zipBuffer, appDir);

  // Read manifest from extracted bundle
  const manifestPath = join(appDir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    rmSync(appDir, { recursive: true, force: true });
    throw new Error(`Invalid bundle: no manifest.json found in ${appId}`);
  }

  const manifest: AppManifest = JSON.parse(
    readFileSync(manifestPath, 'utf-8')
  );

  // Register as installed
  installedApps.set(manifest.id, { manifest, localPath: appDir });
  saveInstallDb();

  console.log(`[AppManager] Installed ${manifest.name} v${manifest.version}`);
  return manifest;
}

export function uninstallApp(appId: string, deleteData: boolean): void {
  const installed = installedApps.get(appId);
  if (!installed) {
    throw new Error(`App not installed: ${appId}`);
  }

  // Remove app bundle
  const appDir = join(getAppsDir(), appId);
  if (existsSync(appDir)) {
    rmSync(appDir, { recursive: true, force: true });
  }

  // Optionally remove app data
  if (deleteData) {
    const dataDir = join(app.getPath('userData'), 'app-data', appId);
    if (existsSync(dataDir)) {
      rmSync(dataDir, { recursive: true, force: true });
    }
  }

  installedApps.delete(appId);
  saveInstallDb();

  console.log(`[AppManager] Uninstalled ${appId}`);
}
