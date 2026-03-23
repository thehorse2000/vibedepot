import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { z } from 'zod';

const APP_CATEGORIES = [
  'productivity', 'writing', 'coding', 'files', 'research',
  'data', 'media', 'integrations', 'utilities', 'fun',
] as const;

const PERMISSIONS = [
  'ai', 'storage.kv', 'storage.files', 'storage.db',
  'network', 'clipboard', 'notifications',
] as const;

const AI_PROVIDERS = ['anthropic', 'openai', 'gemini'] as const;

const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const ManifestSchema = z.object({
  id: z.string().min(1).max(100).regex(kebabCaseRegex, 'ID must be kebab-case'),
  name: z.string().min(1).max(50),
  version: z.string().min(1),
  description: z.string().min(1).max(200),
  longDescription: z.string().max(2000).optional(),
  author: z.string().min(1).max(100),
  authorUrl: z.string().url().optional(),
  license: z.string().optional(),
  entry: z.string().min(1),
  thumbnail: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
  category: z.enum(APP_CATEGORIES).optional(),
  keywords: z.array(z.string().max(30)).max(10).optional(),
  models: z.object({
    required: z.boolean(),
    providers: z.array(z.enum(AI_PROVIDERS)).min(1),
    default: z.enum(AI_PROVIDERS).optional(),
    minContextWindow: z.number().positive().optional(),
  }).optional(),
  permissions: z.array(z.enum(PERMISSIONS)).min(1),
  minShellVersion: z.string().optional(),
  maxBundleSize: z.string().optional(),
  changelog: z.string().optional(),
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
});

export interface ValidationResult {
  check: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

// API key patterns to scan for
const KEY_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/,
  /sk-ant-[a-zA-Z0-9-]{20,}/,
  /AIza[a-zA-Z0-9_-]{35}/,
  /key-[a-zA-Z0-9]{20,}/,
];

const SCANNABLE_EXTENSIONS = new Set(['.js', '.ts', '.html', '.jsx', '.tsx', '.mjs', '.cjs']);

/**
 * Scan source files for Bridge API calls to detect required permissions.
 */
export function detectPermissions(folderPath: string): string[] {
  const detected = new Set<string>();
  const files = getAllFiles(folderPath);

  for (const file of files) {
    const ext = extname(file);
    if (!SCANNABLE_EXTENSIONS.has(ext)) continue;

    const content = readFileSync(file, 'utf-8');

    if (/vibeDepot\.ai\b/.test(content) || /window\.vibeDepot\.ai\b/.test(content)) {
      detected.add('ai');
    }
    if (/vibeDepot\.storage\b/.test(content) || /window\.vibeDepot\.storage\b/.test(content)) {
      detected.add('storage.kv');
    }
    if (/vibeDepot\.db\b/.test(content) || /window\.vibeDepot\.db\b/.test(content)) {
      detected.add('storage.db');
    }
    if (/vibeDepot\.shell\.notify\b/.test(content)) {
      detected.add('notifications');
    }
    if (/\bfetch\s*\(/.test(content) || /vibeDepot\.shell\.openExternal\b/.test(content)) {
      detected.add('network');
    }
    if (/vibeDepot\.shell\.clipboard\b/.test(content) || /navigator\.clipboard\b/.test(content)) {
      detected.add('clipboard');
    }
  }

  return Array.from(detected);
}

/**
 * Run the full validation suite on a folder + manifest.
 */
export function validateApp(
  folderPath: string,
  manifest: Record<string, unknown>
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // 1. Manifest schema validation
  const parseResult = ManifestSchema.safeParse(manifest);
  if (parseResult.success) {
    results.push({ check: 'Manifest schema', status: 'pass', message: 'Valid manifest.json' });
  } else {
    const issues = parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    results.push({ check: 'Manifest schema', status: 'fail', message: `Invalid manifest: ${issues}` });
  }

  // 2. Entry file exists
  const entry = manifest.entry as string | undefined;
  if (entry) {
    const entryPath = join(folderPath, entry);
    if (existsSync(entryPath)) {
      results.push({ check: 'Entry file', status: 'pass', message: `Found ${entry}` });
    } else {
      results.push({ check: 'Entry file', status: 'fail', message: `Entry file "${entry}" not found` });
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
    results.push({ check: 'Bundle size', status: 'fail', message: `${sizeMB.toFixed(2)} MB exceeds 5 MB limit` });
  }

  // 4. Hardcoded API key scan
  const keyFindings = scanForApiKeys(folderPath);
  if (keyFindings.length === 0) {
    results.push({ check: 'API key scan', status: 'pass', message: 'No hardcoded API keys found' });
  } else {
    results.push({
      check: 'API key scan',
      status: 'fail',
      message: `Possible API keys found in: ${keyFindings.join(', ')}. Remove them before publishing.`,
    });
  }

  // 5. Permission detection
  const detected = detectPermissions(folderPath);
  const declared = (manifest.permissions as string[]) || [];
  const undeclared = detected.filter((p) => !declared.includes(p));
  const unused = declared.filter((p) => !detected.includes(p) && p !== 'storage.kv');
  if (undeclared.length === 0 && unused.length === 0) {
    results.push({ check: 'Permissions', status: 'pass', message: 'Declared permissions match detected usage' });
  } else {
    const msgs: string[] = [];
    if (undeclared.length > 0) msgs.push(`Undeclared: ${undeclared.join(', ')}`);
    if (unused.length > 0) msgs.push(`Unused: ${unused.join(', ')}`);
    results.push({ check: 'Permissions', status: 'warn', message: msgs.join('. ') });
  }

  // 6. Semver version
  const version = manifest.version as string;
  if (version && /^\d+\.\d+\.\d+/.test(version)) {
    results.push({ check: 'Version format', status: 'pass', message: `v${version}` });
  } else {
    results.push({ check: 'Version format', status: 'fail', message: `"${version}" is not valid semver` });
  }

  // 7. Thumbnail
  const thumbnail = manifest.thumbnail as string | undefined;
  if (thumbnail && existsSync(join(folderPath, thumbnail))) {
    results.push({ check: 'Thumbnail', status: 'pass', message: `Found ${thumbnail}` });
  } else {
    results.push({ check: 'Thumbnail', status: 'warn', message: 'No thumbnail — your app will use a default icon' });
  }

  return results;
}

/**
 * Auto-generate a manifest from a folder scan.
 */
export function autoGenerateManifest(folderPath: string, folderName: string): Record<string, unknown> {
  const id = folderName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const name = folderName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  // Detect entry file
  let entry = 'index.html';
  if (!existsSync(join(folderPath, 'index.html'))) {
    const htmlFiles = getAllFiles(folderPath).filter((f) => f.endsWith('.html'));
    if (htmlFiles.length > 0) {
      entry = htmlFiles[0].replace(folderPath + '/', '');
    }
  }

  // Detect permissions
  const permissions = detectPermissions(folderPath);
  if (permissions.length === 0) {
    permissions.push('storage.kv');
  }

  // Detect AI providers
  const hasAI = permissions.includes('ai');

  const manifest: Record<string, unknown> = {
    id,
    name,
    version: '0.1.0',
    description: '',
    author: '',
    entry,
    permissions,
  };

  if (hasAI) {
    manifest.models = {
      required: true,
      providers: ['anthropic', 'openai', 'gemini'],
    };
  }

  return manifest;
}

// --- Helpers ---

function getAllFiles(dir: string, base?: string): string[] {
  const files: string[] = [];
  const root = base || dir;
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...getAllFiles(full, root));
      } else {
        files.push(full);
      }
    }
  } catch {
    // ignore read errors
  }
  return files;
}

function getFolderSize(dir: string): number {
  let size = 0;
  const files = getAllFiles(dir);
  for (const file of files) {
    try {
      size += statSync(file).size;
    } catch {
      // ignore
    }
  }
  return size;
}

function scanForApiKeys(folderPath: string): string[] {
  const findings: string[] = [];
  const files = getAllFiles(folderPath);
  for (const file of files) {
    const ext = extname(file);
    if (!SCANNABLE_EXTENSIONS.has(ext)) continue;
    const content = readFileSync(file, 'utf-8');
    for (const pattern of KEY_PATTERNS) {
      if (pattern.test(content)) {
        findings.push(file.replace(folderPath + '/', ''));
        break;
      }
    }
  }
  return findings;
}
