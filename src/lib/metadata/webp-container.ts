import { MetadataError } from './errors';

export interface WebpChunkInfo { type: string; size: number }
export interface ParsedWebpContainer {
  chunks: WebpChunkInfo[];
  width: number;
  height: number;
  hasExif: boolean;
  hasXmp: boolean;
  hasIcc: boolean;
  hasAlpha: boolean;
  animated: boolean;
  xmp?: string;
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  let output = '';
  for (let index = start; index < start + length; index += 1) output += String.fromCharCode(bytes[index] ?? 0);
  return output;
}

function u24(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8) | ((bytes[offset + 2] ?? 0) << 16);
}

export function parseWebpContainer(input: ArrayBuffer | Uint8Array): ParsedWebpContainer {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length < 12 || ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WEBP') throw new MetadataError('INVALID_FILE_SIGNATURE', 'This is not a valid WebP file.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const chunks: WebpChunkInfo[] = [];
  let cursor = 12;
  let width = 0;
  let height = 0;
  let hasExif = false;
  let hasXmp = false;
  let hasIcc = false;
  let hasAlpha = false;
  let animated = false;
  let xmp: string | undefined;
  while (cursor + 8 <= bytes.length) {
    const type = ascii(bytes, cursor, 4);
    const size = view.getUint32(cursor + 4, true);
    const dataStart = cursor + 8;
    const dataEnd = dataStart + size;
    if (!Number.isSafeInteger(dataEnd) || dataEnd < dataStart || dataEnd > bytes.length) throw new MetadataError('CORRUPTED_FILE', 'A WebP chunk extends beyond the file boundary.');
    chunks.push({ type, size });
    if (type === 'VP8X') {
      if (size < 10) throw new MetadataError('CORRUPTED_FILE', 'The WebP VP8X header is incomplete.');
      const flags = bytes[dataStart] ?? 0;
      hasIcc ||= Boolean(flags & 0x20); hasAlpha ||= Boolean(flags & 0x10);
      hasExif ||= Boolean(flags & 0x08); hasXmp ||= Boolean(flags & 0x04); animated ||= Boolean(flags & 0x02);
      width = u24(bytes, dataStart + 4) + 1; height = u24(bytes, dataStart + 7) + 1;
    } else if (type === 'EXIF') hasExif = true;
    else if (type === 'XMP ') {
      hasXmp = true;
      xmp = new TextDecoder('utf-8', { fatal: false }).decode(bytes.subarray(dataStart, dataEnd));
    } else if (type === 'ICCP') hasIcc = true;
    else if (type === 'ALPH') hasAlpha = true;
    else if (type === 'ANIM' || type === 'ANMF') animated = true;
    cursor = dataEnd + (size % 2);
  }
  return { chunks, width, height, hasExif, hasXmp, hasIcc, hasAlpha, animated, xmp };
}
