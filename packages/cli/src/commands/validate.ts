import { existsSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import { ManifestSchema } from '../lib/manifest.js';
import {
  detectPermissions,
  getFolderSize,
  scanForApiKeys,
} from '../lib/permission-scanner.js';

interface CheckResult {
  check: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

export async function validateCommand(path?: string): Promise<void> {
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

  const results = runValidation(appDir, manifest);
  printResults(results);

  const hasFailures = results.some((r) => r.status === 'fail');
  process.exit(hasFailures ? 1 : 0);
}

export function runValidation(
  folderPath: string,
  manifest: Record<string, unknown>
): CheckResult[] {
  const results: CheckResult[] = [];

  // 1. Manifest schema
  const parseResult = ManifestSchema.safeParse(manifest);
  if (parseResult.success) {
    results.push({ check: 'Manifest schema', status: 'pass', message: 'Valid manifest.json' });
  } else {
    const issues = parseResult.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    results.push({ check: 'Manifest schema', status: 'fail', message: issues });
  }

  // 2. Entry file
  const entry = manifest.entry as string | undefined;
  if (entry) {
    if (existsSync(join(folderPath, entry))) {
      results.push({ check: 'Entry file', status: 'pass', message: `Found ${entry}` });
    } else {
      results.push({ check: 'Entry file', status: 'fail', message: `"${entry}" not found` });
    }
  } else {
    results.push({ check: 'Entry file', status: 'fail', message: 'No entry field in manifest' });
  }

  // 3. Bundle size
  const totalSize = getFolderSize(folderPath);
  const sizeMB = totalSize / (1024 * 1024);
  if (sizeMB <= 5) {
    results.push({ check: 'Bundle size', status: 'pass', message: `${sizeMB.toFixed(2)} MB` });
  } else {
    results.push({
      check: 'Bundle size',
      status: 'fail',
      message: `${sizeMB.toFixed(2)} MB exceeds 5 MB limit`,
    });
  }

  // 4. API key scan
  const keyFindings = scanForApiKeys(folderPath);
  if (keyFindings.length === 0) {
    results.push({ check: 'API key scan', status: 'pass', message: 'No hardcoded keys found' });
  } else {
    results.push({
      check: 'API key scan',
      status: 'fail',
      message: `Found in: ${keyFindings.join(', ')}`,
    });
  }

  // 5. Permission match
  const detected = detectPermissions(folderPath);
  const declared = (manifest.permissions as string[]) || [];
  const undeclared = detected.filter((p) => !declared.includes(p));
  const unused = declared.filter((p) => !detected.includes(p) && p !== 'storage.kv');
  if (undeclared.length === 0 && unused.length === 0) {
    results.push({ check: 'Permissions', status: 'pass', message: 'Match' });
  } else {
    const msgs: string[] = [];
    if (undeclared.length > 0) msgs.push(`Undeclared: ${undeclared.join(', ')}`);
    if (unused.length > 0) msgs.push(`Unused: ${unused.join(', ')}`);
    results.push({ check: 'Permissions', status: 'warn', message: msgs.join('. ') });
  }

  // 6. Semver
  const version = manifest.version as string;
  if (version && /^\d+\.\d+\.\d+/.test(version)) {
    results.push({ check: 'Version', status: 'pass', message: `v${version}` });
  } else {
    results.push({ check: 'Version', status: 'fail', message: `"${version}" is not valid semver` });
  }

  // 7. Kebab-case ID
  const id = manifest.id as string;
  if (id && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    results.push({ check: 'App ID', status: 'pass', message: id });
  } else {
    results.push({ check: 'App ID', status: 'fail', message: `"${id}" must be kebab-case` });
  }

  // 8. Thumbnail (warning only)
  const thumbnail = manifest.thumbnail as string | undefined;
  if (thumbnail && existsSync(join(folderPath, thumbnail))) {
    results.push({ check: 'Thumbnail', status: 'pass', message: `Found ${thumbnail}` });
  } else {
    results.push({ check: 'Thumbnail', status: 'warn', message: 'No thumbnail (optional)' });
  }

  return results;
}

function printResults(results: CheckResult[]): void {
  console.log('\nValidation Results:\n');
  for (const result of results) {
    const icon =
      result.status === 'pass' ? '✓' :
      result.status === 'warn' ? '⚠' : '✗';
    const color =
      result.status === 'pass' ? '\x1b[32m' :
      result.status === 'warn' ? '\x1b[33m' : '\x1b[31m';
    console.log(`  ${color}${icon}\x1b[0m ${result.check}: ${result.message}`);
  }
  console.log('');
}
