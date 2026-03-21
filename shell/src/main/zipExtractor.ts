import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { inflateRawSync } from 'zlib';

// Minimal ZIP extractor using Node built-ins — no external dependencies
// Supports standard ZIP files with Stored (0) and Deflated (8) compression

export async function extractZip(
  zipBuffer: Buffer,
  destDir: string
): Promise<void> {
  let offset = 0;

  while (offset < zipBuffer.length - 4) {
    const sig = zipBuffer.readUInt32LE(offset);

    // Local file header signature
    if (sig !== 0x04034b50) break;

    const compressionMethod = zipBuffer.readUInt16LE(offset + 8);
    const compressedSize = zipBuffer.readUInt32LE(offset + 18);
    const uncompressedSize = zipBuffer.readUInt32LE(offset + 22);
    const fileNameLen = zipBuffer.readUInt16LE(offset + 26);
    const extraLen = zipBuffer.readUInt16LE(offset + 28);

    const fileName = zipBuffer
      .subarray(offset + 30, offset + 30 + fileNameLen)
      .toString('utf-8');

    const dataStart = offset + 30 + fileNameLen + extraLen;
    const rawData = zipBuffer.subarray(dataStart, dataStart + compressedSize);

    offset = dataStart + compressedSize;

    // Skip directories
    if (fileName.endsWith('/')) {
      mkdirSync(join(destDir, fileName), { recursive: true });
      continue;
    }

    // Security: prevent path traversal
    if (fileName.includes('..')) {
      console.warn(`[Zip] Skipping suspicious path: ${fileName}`);
      continue;
    }

    const destPath = join(destDir, fileName);
    mkdirSync(dirname(destPath), { recursive: true });

    let fileData: Buffer;
    if (compressionMethod === 0) {
      // Stored (no compression)
      fileData = rawData;
    } else if (compressionMethod === 8) {
      // Deflated
      fileData = inflateRawSync(rawData);
      if (fileData.length !== uncompressedSize) {
        throw new Error(`Size mismatch for ${fileName}`);
      }
    } else {
      throw new Error(
        `Unsupported compression method ${compressionMethod} for ${fileName}`
      );
    }

    writeFileSync(destPath, fileData);
  }
}
