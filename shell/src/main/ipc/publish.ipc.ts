import { ipcMain, dialog, shell as electronShell } from 'electron';
import { readFileSync, writeFileSync, readdirSync, existsSync, createReadStream } from 'fs';
import { join, basename } from 'path';
import { createHash } from 'crypto';
import { tmpdir } from 'os';
import {
  IPC,
  PublishReadFolderSchema,
  PublishValidateSchema,
  PublishCreateBundleSchema,
  PublishOpenPRSchema,
} from '@vibedepot/shared';
import {
  validateApp,
  autoGenerateManifest,
} from '../publishValidator';

export function registerPublishIPC(): void {
  ipcMain.handle(IPC.PUBLISH_SELECT_FOLDER, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select your app folder',
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle(IPC.PUBLISH_READ_FOLDER, async (_event, payload) => {
    const { folderPath } = PublishReadFolderSchema.parse(payload);
    const folderName = basename(folderPath);

    // List files (non-recursive top-level listing for display)
    const files: string[] = [];
    try {
      const entries = readdirSync(folderPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        files.push(entry.isDirectory() ? entry.name + '/' : entry.name);
      }
    } catch {
      // ignore
    }

    // Read or auto-generate manifest
    const manifestPath = join(folderPath, 'manifest.json');
    let manifest: Record<string, unknown>;
    let manifestExists = false;

    if (existsSync(manifestPath)) {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      manifestExists = true;
    } else {
      manifest = autoGenerateManifest(folderPath, folderName);
    }

    return { files, manifest, manifestExists };
  });

  ipcMain.handle(IPC.PUBLISH_VALIDATE, async (_event, payload) => {
    const { folderPath, manifest } = PublishValidateSchema.parse(payload);
    const results = validateApp(folderPath, manifest as Record<string, unknown>);
    return { results };
  });

  ipcMain.handle(IPC.PUBLISH_CREATE_BUNDLE, async (_event, payload) => {
    const { folderPath, manifest } = PublishCreateBundleSchema.parse(payload);
    const manifestObj = manifest as Record<string, unknown>;

    // Write/update manifest.json in the folder
    writeFileSync(
      join(folderPath, 'manifest.json'),
      JSON.stringify(manifestObj, null, 2)
    );

    // Create ZIP using Node's built-in archiver
    const { createZipBuffer } = await import('../zipCreator');
    const zipBuffer = await createZipBuffer(folderPath);

    // Write to temp dir
    const id = manifestObj.id as string;
    const version = manifestObj.version as string;
    const zipFileName = `${id}-${version}.zip`;
    const zipPath = join(tmpdir(), zipFileName);
    writeFileSync(zipPath, zipBuffer);

    // Generate checksum
    const checksum = createHash('sha256').update(zipBuffer).digest('hex');

    return { zipPath, checksum };
  });

  ipcMain.handle(IPC.PUBLISH_OPEN_PR, async (_event, payload) => {
    const { manifest, checksum } = PublishOpenPRSchema.parse(payload);
    const manifestObj = manifest as Record<string, unknown>;
    const name = manifestObj.name as string;
    const version = manifestObj.version as string;
    const id = manifestObj.id as string;
    const description = manifestObj.description as string || '';
    const permissions = (manifestObj.permissions as string[]) || [];

    const title = encodeURIComponent(`Add ${name} v${version}`);
    const body = encodeURIComponent(
      `## New App: ${name}\n\n` +
      `**ID:** ${id}\n` +
      `**Version:** ${version}\n` +
      `**Description:** ${description}\n` +
      `**Permissions:** ${permissions.join(', ')}\n` +
      `**Checksum:** \`${checksum}\`\n\n` +
      `---\n\n` +
      `Please review and merge to make this app available in the VibeDepot store.`
    );

    const prUrl = `https://github.com/thehorse2000/vibedepot-registry/compare/main...main?expand=1&title=${title}&body=${body}`;

    await electronShell.openExternal(prUrl);
    return { prUrl };
  });
}
