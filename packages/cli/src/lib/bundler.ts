import { readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { createHash } from 'crypto';
import { deflateRawSync } from 'zlib';
import { tmpdir } from 'os';
import { getAllFiles } from './permission-scanner.js';

export interface BundleResult {
  zipPath: string;
  checksum: string;
}

export function createBundle(
  folderPath: string,
  appId: string,
  version: string
): BundleResult {
  const files = getAllFiles(folderPath);
  const entries: Array<{
    path: string;
    content: Buffer;
    compressed: Buffer;
  }> = [];

  for (const filePath of files) {
    const relativePath = relative(folderPath, filePath);
    const content = readFileSync(filePath);
    const compressed = deflateRawSync(content);
    entries.push({ path: relativePath, content, compressed });
  }

  const zipBuffer = buildZip(entries);
  const zipFileName = `${appId}-${version}.zip`;
  const zipPath = join(tmpdir(), zipFileName);
  writeFileSync(zipPath, zipBuffer);

  const checksum = createHash('sha256').update(zipBuffer).digest('hex');

  return { zipPath, checksum };
}

function buildZip(
  entries: Array<{ path: string; content: Buffer; compressed: Buffer }>
): Buffer {
  const parts: Buffer[] = [];
  const centralDir: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.path, 'utf-8');
    const crc = crc32(entry.content);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(entry.compressed.length, 18);
    localHeader.writeUInt32LE(entry.content.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);

    parts.push(localHeader, nameBuffer, entry.compressed);

    const cdEntry = Buffer.alloc(46);
    cdEntry.writeUInt32LE(0x02014b50, 0);
    cdEntry.writeUInt16LE(20, 4);
    cdEntry.writeUInt16LE(20, 6);
    cdEntry.writeUInt16LE(0, 8);
    cdEntry.writeUInt16LE(8, 10);
    cdEntry.writeUInt16LE(0, 12);
    cdEntry.writeUInt16LE(0, 14);
    cdEntry.writeUInt32LE(crc, 16);
    cdEntry.writeUInt32LE(entry.compressed.length, 20);
    cdEntry.writeUInt32LE(entry.content.length, 24);
    cdEntry.writeUInt16LE(nameBuffer.length, 28);
    cdEntry.writeUInt16LE(0, 30);
    cdEntry.writeUInt16LE(0, 32);
    cdEntry.writeUInt16LE(0, 34);
    cdEntry.writeUInt16LE(0, 36);
    cdEntry.writeUInt32LE(0, 38);
    cdEntry.writeUInt32LE(offset, 42);
    centralDir.push(cdEntry, nameBuffer);

    offset += localHeader.length + nameBuffer.length + entry.compressed.length;
  }

  const centralDirBuffer = Buffer.concat(centralDir);
  const centralDirOffset = offset;

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDirBuffer.length, 12);
  eocd.writeUInt32LE(centralDirOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...parts, centralDirBuffer, eocd]);
}

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
