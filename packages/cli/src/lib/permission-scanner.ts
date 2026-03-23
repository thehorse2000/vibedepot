import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const SCANNABLE_EXTENSIONS = new Set(['.js', '.ts', '.html', '.jsx', '.tsx', '.mjs', '.cjs']);

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
    if (/navigator\.clipboard\b/.test(content)) {
      detected.add('clipboard');
    }
  }

  return Array.from(detected);
}

export function getAllFiles(dir: string): string[] {
  const files: string[] = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...getAllFiles(full));
      } else {
        files.push(full);
      }
    }
  } catch {
    // ignore
  }
  return files;
}

export function getFolderSize(dir: string): number {
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

const KEY_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/,
  /sk-ant-[a-zA-Z0-9-]{20,}/,
  /AIza[a-zA-Z0-9_-]{35}/,
  /key-[a-zA-Z0-9]{20,}/,
];

export function scanForApiKeys(folderPath: string): string[] {
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
