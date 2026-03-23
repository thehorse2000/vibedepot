import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import open from 'open';
import { runValidation } from './validate.js';
import { createBundle } from '../lib/bundler.js';
import { buildPRUrl } from '../lib/pr-url.js';
import { detectPermissions } from '../lib/permission-scanner.js';

export async function publishCommand(path?: string): Promise<void> {
  const appDir = resolve(path || '.');
  const manifestPath = join(appDir, 'manifest.json');

  if (!existsSync(manifestPath)) {
    console.error('Error: No manifest.json found in ' + appDir);
    process.exit(1);
  }

  let manifest: Record<string, unknown>;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  } catch {
    console.error('Error: Could not parse manifest.json');
    process.exit(1);
  }

  // Auto-update permissions from source scan
  const detected = detectPermissions(appDir);
  const declared = (manifest.permissions as string[]) || [];
  const missing = detected.filter((p) => !declared.includes(p));
  if (missing.length > 0) {
    console.log(`Auto-adding detected permissions: ${missing.join(', ')}`);
    manifest.permissions = [...declared, ...missing];
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  }

  // 1. Validate
  console.log('Validating...\n');
  const results = runValidation(appDir, manifest);

  const hasFailures = results.some((r) => r.status === 'fail');
  for (const result of results) {
    const icon =
      result.status === 'pass' ? '✓' :
      result.status === 'warn' ? '⚠' : '✗';
    const color =
      result.status === 'pass' ? '\x1b[32m' :
      result.status === 'warn' ? '\x1b[33m' : '\x1b[31m';
    console.log(`  ${color}${icon}\x1b[0m ${result.check}: ${result.message}`);
  }

  if (hasFailures) {
    console.error('\nValidation failed. Fix the issues above and try again.');
    process.exit(1);
  }

  // 2. Create bundle
  console.log('\nCreating bundle...');
  const id = manifest.id as string;
  const version = manifest.version as string;
  const { zipPath, checksum } = createBundle(appDir, id, version);
  console.log(`  Bundle: ${zipPath}`);
  console.log(`  Checksum: ${checksum}`);

  // 3. Open PR
  const prUrl = buildPRUrl(manifest, checksum);
  console.log('\nOpening GitHub...');
  await open(prUrl);

  console.log(`\n✓ Done! Follow the instructions in your browser to create the pull request.`);
  console.log(`  Bundle location: ${zipPath}`);
}
