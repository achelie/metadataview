import { MetadataError } from './errors';

export interface ParsedTiffContainer {
  byteOrder: 'little-endian' | 'big-endian';
  bigTiff: boolean;
  width: number;
  height: number;
  ifdCount: number;
  tags: number[];
  hasExif: boolean;
  hasXmp: boolean;
  hasIcc: boolean;
  hasAlpha: boolean;
}

function safeNumber(value: bigint): number {
  const number = Number(value);
  if (!Number.isSafeInteger(number)) throw new MetadataError('CORRUPTED_FILE', 'A TIFF offset is too large for this browser.');
  return number;
}

export function parseTiffContainer(input: ArrayBuffer | Uint8Array): ParsedTiffContainer {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length < 8) throw new MetadataError('INVALID_FILE_SIGNATURE', 'This is not a valid TIFF file.');
  const marker = String.fromCharCode(bytes[0]!, bytes[1]!);
  if (marker !== 'II' && marker !== 'MM') throw new MetadataError('INVALID_FILE_SIGNATURE', 'This is not a valid TIFF file.');
  const little = marker === 'II';
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const magic = view.getUint16(2, little);
  if (magic !== 42 && magic !== 43) throw new MetadataError('INVALID_FILE_SIGNATURE', 'The TIFF byte-order marker is valid, but its format marker is not.');
  const bigTiff = magic === 43;
  if (bigTiff && (bytes.length < 16 || view.getUint16(4, little) !== 8 || view.getUint16(6, little) !== 0)) throw new MetadataError('CORRUPTED_FILE', 'The BigTIFF header uses an unsupported offset size.');
  const firstIfd = bigTiff ? safeNumber(view.getBigUint64(8, little)) : view.getUint32(4, little);
  let width = 0;
  let height = 0;
  let ifdCount = 0;
  let hasXmp = false;
  let hasIcc = false;
  let hasAlpha = false;
  const tags = new Set<number>();
  const visited = new Set<number>();
  let offset = firstIfd;

  const integerValue = (entry: number, type: number, count: number): number | undefined => {
    if (count < 1) return undefined;
    const valueBytes = type === 3 ? 2 : type === 4 ? 4 : type === 16 ? 8 : 0;
    if (!valueBytes) return undefined;
    const inlineBytes = bigTiff ? 8 : 4;
    const valueOffsetPosition = entry + (bigTiff ? 12 : 8);
    let dataOffset = valueOffsetPosition;
    if (valueBytes * count > inlineBytes) dataOffset = bigTiff ? safeNumber(view.getBigUint64(valueOffsetPosition, little)) : view.getUint32(valueOffsetPosition, little);
    if (dataOffset < 0 || dataOffset + valueBytes > bytes.length) return undefined;
    if (type === 3) return view.getUint16(dataOffset, little);
    if (type === 4) return view.getUint32(dataOffset, little);
    return safeNumber(view.getBigUint64(dataOffset, little));
  };

  while (offset && ifdCount < 64 && !visited.has(offset)) {
    visited.add(offset);
    const countBytes = bigTiff ? 8 : 2;
    const entryBytes = bigTiff ? 20 : 12;
    if (offset < 0 || offset + countBytes > bytes.length) throw new MetadataError('CORRUPTED_FILE', 'A TIFF IFD offset points outside the file.');
    const count = bigTiff ? safeNumber(view.getBigUint64(offset, little)) : view.getUint16(offset, little);
    if (count > 100_000) throw new MetadataError('CORRUPTED_FILE', 'A TIFF IFD contains an unreasonable number of entries.');
    const tableEnd = offset + countBytes + count * entryBytes;
    const nextBytes = bigTiff ? 8 : 4;
    if (!Number.isSafeInteger(tableEnd) || tableEnd + nextBytes > bytes.length) throw new MetadataError('CORRUPTED_FILE', 'A TIFF IFD extends beyond the file boundary.');
    for (let index = 0; index < count; index += 1) {
      const entry = offset + countBytes + index * entryBytes;
      const tag = view.getUint16(entry, little);
      const type = view.getUint16(entry + 2, little);
      const valueCount = bigTiff ? safeNumber(view.getBigUint64(entry + 4, little)) : view.getUint32(entry + 4, little);
      tags.add(tag);
      const value = integerValue(entry, type, valueCount);
      if (tag === 256 && value) width ||= value;
      if (tag === 257 && value) height ||= value;
      if (tag === 700) hasXmp = true;
      if (tag === 34675) hasIcc = true;
      if (tag === 338 && value) hasAlpha = true;
    }
    ifdCount += 1;
    offset = bigTiff ? safeNumber(view.getBigUint64(tableEnd, little)) : view.getUint32(tableEnd, little);
  }
  if (!width || !height) throw new MetadataError('IMAGE_DECODE_FAILED', 'TIFF width and height could not be read from its image directory.');
  return { byteOrder: little ? 'little-endian' : 'big-endian', bigTiff, width, height, ifdCount, tags: [...tags], hasExif: true, hasXmp, hasIcc, hasAlpha };
}
