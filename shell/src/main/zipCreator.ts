import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { deflateRawSync } from 'zlib';

/**
 * Creates a ZIP buffer from a folder, using Node.js built-in modules only.
 * Excludes hidden files and node_modules.
 */
export async function createZipBuffer(folderPath: string): Promise<Buffer> {
  const files = getAllFiles(folderPath);
  const entries: ZipEntry[] = [];

  for (const filePath of files) {
    const relativePath = relative(folderPath, filePath);
    const content = readFileSync(filePath);
    const compressed = deflateRawSync(content);
    entries.push({
      path: relativePath,
      content,
      compressed,
    });
  }

  return buildZip(entries);
}

interface ZipEntry {
  path: string;
  content: Buffer;
  compressed: Buffer;
}

function getAllFiles(dir: string): string[] {
  const files: string[] = [];
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
  return files;
}

function buildZip(entries: ZipEntry[]): Buffer {
  const parts: Buffer[] = [];
  const centralDir: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.path, 'utf-8');
    const crc = crc32(entry.content);

    // Local file header
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4); // version needed
    localHeader.writeUInt16LE(0, 6); // flags
    localHeader.writeUInt16LE(8, 8); // compression method (deflate)
    localHeader.writeUInt16LE(0, 10); // mod time
    localHeader.writeUInt16LE(0, 12); // mod date
    localHeader.writeUInt32LE(crc, 14); // crc-32
    localHeader.writeUInt32LE(entry.compressed.length, 18); // compressed size
    localHeader.writeUInt32LE(entry.content.length, 22); // uncompressed size
    localHeader.writeUInt16LE(nameBuffer.length, 26); // filename length
    localHeader.writeUInt16LE(0, 28); // extra field length

    parts.push(localHeader, nameBuffer, entry.compressed);

    // Central directory entry
    const cdEntry = Buffer.alloc(46);
    cdEntry.writeUInt32LE(0x02014b50, 0); // signature
    cdEntry.writeUInt16LE(20, 4); // version made by
    cdEntry.writeUInt16LE(20, 6); // version needed
    cdEntry.writeUInt16LE(0, 8); // flags
    cdEntry.writeUInt16LE(8, 10); // compression method
    cdEntry.writeUInt16LE(0, 12); // mod time
    cdEntry.writeUInt16LE(0, 14); // mod date
    cdEntry.writeUInt32LE(crc, 16); // crc-32
    cdEntry.writeUInt32LE(entry.compressed.length, 20); // compressed size
    cdEntry.writeUInt32LE(entry.content.length, 24); // uncompressed size
    cdEntry.writeUInt16LE(nameBuffer.length, 28); // filename length
    cdEntry.writeUInt16LE(0, 30); // extra field length
    cdEntry.writeUInt16LE(0, 32); // comment length
    cdEntry.writeUInt16LE(0, 34); // disk number
    cdEntry.writeUInt16LE(0, 36); // internal attrs
    cdEntry.writeUInt32LE(0, 38); // external attrs
    cdEntry.writeUInt32LE(offset, 42); // local header offset
    centralDir.push(cdEntry, nameBuffer);

    offset += localHeader.length + nameBuffer.length + entry.compressed.length;
  }

  const centralDirBuffer = Buffer.concat(centralDir);
  const centralDirOffset = offset;

  // End of central directory
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // signature
  eocd.writeUInt16LE(0, 4); // disk number
  eocd.writeUInt16LE(0, 6); // central dir disk
  eocd.writeUInt16LE(entries.length, 8); // entries on disk
  eocd.writeUInt16LE(entries.length, 10); // total entries
  eocd.writeUInt32LE(centralDirBuffer.length, 12); // central dir size
  eocd.writeUInt32LE(centralDirOffset, 16); // central dir offset
  eocd.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...parts, centralDirBuffer, eocd]);
}

// CRC-32 implementation
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
