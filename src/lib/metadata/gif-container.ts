import { MetadataError } from './errors';

export interface ParsedGifContainer {
  version: 'GIF87a' | 'GIF89a';
  width: number;
  height: number;
  frameCount: number;
  animated: boolean;
  hasAlpha: boolean;
  hasXmp: boolean;
  hasIcc: boolean;
  loopCount?: number;
  comments: string[];
  extensions: string[];
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return new TextDecoder('latin1').decode(bytes.subarray(start, start + length));
}

function skipSubBlocks(bytes: Uint8Array, offset: number, collect = false): { next: number; data?: Uint8Array } {
  const chunks: Uint8Array[] = [];
  let total = 0;
  let cursor = offset;
  while (cursor < bytes.length) {
    const size = bytes[cursor++]!;
    if (size === 0) {
      if (!collect) return { next: cursor };
      const data = new Uint8Array(total);
      let target = 0;
      for (const chunk of chunks) { data.set(chunk, target); target += chunk.length; }
      return { next: cursor, data };
    }
    if (cursor + size > bytes.length) throw new MetadataError('CORRUPTED_FILE', 'A GIF data block extends beyond the file boundary.');
    if (collect && total < 2 * 1024 * 1024) {
      const chunk = bytes.slice(cursor, Math.min(cursor + size, cursor + 2 * 1024 * 1024 - total));
      chunks.push(chunk);
      total += chunk.length;
    }
    cursor += size;
  }
  throw new MetadataError('CORRUPTED_FILE', 'A GIF data block is missing its terminator.');
}

export function parseGifContainer(input: ArrayBuffer | Uint8Array): ParsedGifContainer {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const version = ascii(bytes, 0, 6);
  if ((version !== 'GIF87a' && version !== 'GIF89a') || bytes.length < 13) throw new MetadataError('INVALID_FILE_SIGNATURE', 'This is not a valid GIF file.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint16(6, true);
  const height = view.getUint16(8, true);
  const packed = bytes[10]!;
  const globalTableBytes = packed & 0x80 ? 3 * (2 ** ((packed & 0x07) + 1)) : 0;
  let cursor = 13 + globalTableBytes;
  if (cursor > bytes.length) throw new MetadataError('CORRUPTED_FILE', 'The GIF global color table is incomplete.');
  let frameCount = 0;
  let hasAlpha = false;
  let hasXmp = false;
  let hasIcc = false;
  let loopCount: number | undefined;
  const comments: string[] = [];
  const extensions: string[] = [];

  while (cursor < bytes.length) {
    const marker = bytes[cursor++]!;
    if (marker === 0x3b) break;
    if (marker === 0x2c) {
      if (cursor + 9 > bytes.length) throw new MetadataError('CORRUPTED_FILE', 'A GIF image descriptor is incomplete.');
      const imagePacked = bytes[cursor + 8]!;
      cursor += 9;
      if (imagePacked & 0x80) cursor += 3 * (2 ** ((imagePacked & 0x07) + 1));
      if (cursor >= bytes.length) throw new MetadataError('CORRUPTED_FILE', 'GIF image data is incomplete.');
      cursor += 1;
      cursor = skipSubBlocks(bytes, cursor).next;
      frameCount += 1;
      continue;
    }
    if (marker !== 0x21 || cursor >= bytes.length) throw new MetadataError('CORRUPTED_FILE', 'The GIF block stream contains an invalid marker.');
    const label = bytes[cursor++]!;
    if (label === 0xf9) {
      const size = bytes[cursor++] ?? 0;
      if (size !== 4 || cursor + 5 > bytes.length) throw new MetadataError('CORRUPTED_FILE', 'The GIF graphic control extension is incomplete.');
      hasAlpha ||= Boolean(bytes[cursor]! & 0x01);
      cursor += 4;
      if (bytes[cursor++] !== 0) throw new MetadataError('CORRUPTED_FILE', 'The GIF graphic control extension is not terminated.');
      extensions.push('Graphic control');
      continue;
    }
    if (label === 0xfe) {
      const result = skipSubBlocks(bytes, cursor, true);
      cursor = result.next;
      const comment = result.data ? new TextDecoder('latin1').decode(result.data).slice(0, 2 * 1024 * 1024) : '';
      if (comment) comments.push(comment);
      extensions.push('Comment');
      continue;
    }
    if (label === 0xff) {
      const size = bytes[cursor++] ?? 0;
      if (cursor + size > bytes.length) throw new MetadataError('CORRUPTED_FILE', 'The GIF application extension is incomplete.');
      const identifier = ascii(bytes, cursor, size);
      cursor += size;
      const result = skipSubBlocks(bytes, cursor, true);
      cursor = result.next;
      extensions.push(`Application: ${identifier}`);
      hasXmp ||= /^XMP DataXMP/i.test(identifier);
      hasIcc ||= /^ICCRGBG1012/i.test(identifier);
      if (/^NETSCAPE2\.0$/i.test(identifier) && result.data && result.data.length >= 3 && result.data[0] === 1) loopCount = result.data[1]! | (result.data[2]! << 8);
      continue;
    }
    const result = skipSubBlocks(bytes, cursor);
    cursor = result.next;
    extensions.push(label === 0x01 ? 'Plain text' : `Extension 0x${label.toString(16).padStart(2, '0')}`);
  }
  if (!frameCount) throw new MetadataError('IMAGE_DECODE_FAILED', 'GIF contains no image frames.');
  return { version, width, height, frameCount, animated: frameCount > 1, hasAlpha, hasXmp, hasIcc, loopCount, comments, extensions };
}
