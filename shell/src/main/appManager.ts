import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import type { AppManifest } from '@vibedepot/shared';

export interface InstalledApp {
  manifest: AppManifest;
  localPath: string;
}

const installedApps = new Map<string, InstalledApp>();

export function loadHardcodedApps(): void {
  // In dev mode, load apps from the monorepo apps/ directory
  const appsRoot = resolve(__dirname, '../../../apps');
  const emailWriterPath = join(appsRoot, 'email-writer');
  const manifestPath = join(emailWriterPath, 'manifest.json');

  if (existsSync(manifestPath)) {
    try {
      const manifest: AppManifest = JSON.parse(
        readFileSync(manifestPath, 'utf-8')
      );
      installedApps.set(manifest.id, {
        manifest,
        localPath: emailWriterPath,
      });
      console.log(`[AppManager] Loaded hardcoded app: ${manifest.name}`);
    } catch (err) {
      console.error('[AppManager] Failed to load email-writer:', err);
    }
  }
}

export function getInstalledApps(): InstalledApp[] {
  return Array.from(installedApps.values());
}

export function getInstalledApp(appId: string): InstalledApp | undefined {
  return installedApps.get(appId);
}
