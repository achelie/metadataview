import { Inflate } from 'pako';
import { MetadataError } from './errors';
import { IMAGE_LIMITS } from './limits';
import type { ParseWarning } from './types';

export interface PngTextChunk {
  type: 'tEXt' | 'iTXt' | 'zTXt';
  keyword: string;
  text: string;
  compressed: boolean;
  languageTag?: string;
  translatedKeyword?: string;
  crc: number;
}

export interface ParsedPngChunks {
  textChunks: PngTextChunk[];
  width: number;
  height: number;
  bitDepth: number;
  colorType: number;
  alpha: boolean;
  chunkCount: number;
  chunkTypes: string[];
  hasIend: boolean;
  hasExif: boolean;
  hasXmp: boolean;
  hasIcc: boolean;
  animated: boolean;
  exifBytes?: number;
  iccProfileName?: string;
  iccProfileBytes?: number;
  warnings: ParseWarning[];
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
export const MAX_PNG_TEXT_CHUNK = IMAGE_LIMITS.chunkBytes;
const MAX_CHUNKS = 100_000;
const latin1 = new TextDecoder('latin1');
const utf8 = new TextDecoder('utf-8', { fatal: false });

function readU32(view: DataView, offset: number): number {
  if (offset < 0 || offset + 4 > view.byteLength) throw new MetadataError('CORRUPTED_FILE', 'PNG data ended unexpectedly.');
  return view.getUint32(offset, false);
}

function nullIndex(bytes: Uint8Array, from = 0): number {
  for (let index = from; index < bytes.length; index += 1) if (bytes[index] === 0) return index;
  return -1;
}

function asciiSafe(bytes: Uint8Array): string {
  let output = '';
  for (const byte of bytes) output += String.fromCharCode(byte);
  return output;
}

function inflateLimited(bytes: Uint8Array): Uint8Array {
  const chunks: Uint8Array[] = [];
  let total = 0;
  const inflater = new Inflate({ chunkSize: 64 * 1024 });
  inflater.onData = (chunk: Uint8Array) => {
    total += chunk.byteLength;
    if (total > IMAGE_LIMITS.inflatedTextBytes) throw new MetadataError('PNG_INFLATED_TEXT_TOO_LARGE', 'Inflated PNG text exceeds the 20 MB safety limit.');
    chunks.push(chunk.slice());
  };
  inflater.push(bytes, true);
  if (inflater.err) throw new Error(inflater.msg || 'Invalid deflate stream.');
  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.byteLength; }
  return output;
}

function decodeTextChunk(type: PngTextChunk['type'], data: Uint8Array, crc: number): PngTextChunk {
  const keywordEnd = nullIndex(data);
  if (keywordEnd <= 0 || keywordEnd > 79) throw new MetadataError('CORRUPTED_FILE', `Invalid ${type} keyword.`);
  const keyword = latin1.decode(data.subarray(0, keywordEnd));
  if (type === 'tEXt') return { type, keyword, text: latin1.decode(data.subarray(keywordEnd + 1)), compressed: false, crc };
  if (type === 'zTXt') {
    if (keywordEnd + 2 > data.length || data[keywordEnd + 1] !== 0) throw new MetadataError('INVALID_COMPRESSED_METADATA', 'Unsupported PNG compression method.');
    return { type, keyword, text: latin1.decode(inflateLimited(data.subarray(keywordEnd + 2))), compressed: true, crc };
  }

  let cursor = keywordEnd + 1;
  if (cursor + 2 > data.length) throw new MetadataError('CORRUPTED_FILE', 'Invalid iTXt control fields.');
  const compressionFlag = data[cursor++] ?? 0;
  const compressionMethod = data[cursor++] ?? 0;
  if (compressionFlag !== 0 && compressionFlag !== 1) throw new MetadataError('INVALID_COMPRESSED_METADATA', 'Invalid iTXt compression flag.');
  const languageEnd = nullIndex(data, cursor);
  if (languageEnd < 0) throw new MetadataError('CORRUPTED_FILE', 'Invalid iTXt language tag.');
  const languageTag = asciiSafe(data.subarray(cursor, languageEnd));
  cursor = languageEnd + 1;
  const translatedEnd = nullIndex(data, cursor);
  if (translatedEnd < 0) throw new MetadataError('CORRUPTED_FILE', 'Invalid iTXt translated keyword.');
  const translatedKeyword = utf8.decode(data.subarray(cursor, translatedEnd));
  cursor = translatedEnd + 1;
  const textBytes = data.subarray(cursor);
  if (compressionFlag === 1 && compressionMethod !== 0) throw new MetadataError('INVALID_COMPRESSED_METADATA', 'Unsupported iTXt compression method.');
  const text = utf8.decode(compressionFlag === 1 ? inflateLimited(textBytes) : textBytes);
  return { type, keyword, text, compressed: compressionFlag === 1, languageTag, translatedKeyword, crc };
}

function warningFor(type: string, error: unknown): ParseWarning {
  const code = error instanceof MetadataError ? error.code : 'INVALID_COMPRESSED_METADATA';
  const detail = error instanceof Error ? error.message : 'The value could not be decoded.';
  return { code, message: `${type} metadata was skipped: ${detail}` };
}

export function parsePngChunks(input: ArrayBuffer | Uint8Array, maxTextChunk = MAX_PNG_TEXT_CHUNK): ParsedPngChunks {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length < 8 || PNG_SIGNATURE.some((byte, index) => bytes[index] !== byte)) throw new MetadataError('INVALID_FILE_SIGNATURE', 'This is not a valid PNG file.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const textChunks: PngTextChunk[] = [];
  const chunkTypes: string[] = [];
  const warnings: ParseWarning[] = [];
  let cursor = 8;
  let chunkCount = 0;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let hasIend = false;
  let hasExif = false;
  let hasXmp = false;
  let hasIcc = false;
  let animated = false;
  let exifBytes: number | undefined;
  let iccProfileName: string | undefined;
  let iccProfileBytes: number | undefined;

  while (cursor < bytes.length) {
    if (++chunkCount > MAX_CHUNKS) throw new MetadataError('CORRUPTED_FILE', 'PNG contains an unreasonable number of chunks.');
    if (cursor + 12 > bytes.length) throw new MetadataError('CORRUPTED_FILE', 'PNG chunk header is truncated.');
    const length = readU32(view, cursor);
    const dataStart = cursor + 8;
    const dataEnd = dataStart + length;
    const next = dataEnd + 4;
    if (!Number.isSafeInteger(next) || dataEnd < dataStart || next > bytes.length) throw new MetadataError('CORRUPTED_FILE', 'PNG chunk length exceeds the file boundary.');
    const type = asciiSafe(bytes.subarray(cursor + 4, cursor + 8));
    chunkTypes.push(type);
    const data = bytes.subarray(dataStart, dataEnd);

    if (type === 'IHDR') {
      if (length !== 13) throw new MetadataError('CORRUPTED_FILE', 'PNG IHDR is incomplete.');
      width = readU32(view, dataStart); height = readU32(view, dataStart + 4);
      bitDepth = data[8] ?? 0; colorType = data[9] ?? 0;
    }
    if (type === 'eXIf') { hasExif = true; exifBytes = length; }
    if (type === 'acTL' || type === 'fcTL' || type === 'fdAT') animated = true;
    if (type === 'iCCP') {
      hasIcc = true;
      const nameEnd = nullIndex(data);
      if (nameEnd > 0) {
        iccProfileName = latin1.decode(data.subarray(0, nameEnd));
        if (data[nameEnd + 1] === 0) {
          try { iccProfileBytes = inflateLimited(data.subarray(nameEnd + 2)).byteLength; }
          catch (error) { warnings.push(warningFor(type, error)); }
        }
      }
    }
    if (type === 'tEXt' || type === 'iTXt' || type === 'zTXt') {
      if (length > maxTextChunk) warnings.push({ code: 'PNG_CHUNK_TOO_LARGE', message: `${type} metadata was skipped because it exceeds the 10 MB chunk limit.` });
      else {
        try {
          const decoded = decodeTextChunk(type, data, readU32(view, dataEnd));
          if (/^xml:com\.adobe\.xmp$/i.test(decoded.keyword)) hasXmp = true;
          textChunks.push(decoded);
        } catch (error) { warnings.push(warningFor(type, error)); }
      }
    }
    cursor = next;
    if (type === 'IEND') { hasIend = true; break; }
  }
  if (!hasIend) throw new MetadataError('CORRUPTED_FILE', 'PNG is missing its IEND marker.');
  return {
    textChunks, width, height, bitDepth, colorType, alpha: colorType === 4 || colorType === 6 || chunkTypes.includes('tRNS'),
    chunkCount, chunkTypes, hasIend, hasExif, hasXmp, hasIcc, animated, exifBytes, iccProfileName, iccProfileBytes, warnings,
  };
}
