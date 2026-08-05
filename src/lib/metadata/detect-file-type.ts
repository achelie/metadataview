import { MetadataError } from './errors';
import type { DetectedFileType, DetectionResult, ParseWarning } from './types';

const EXTENSIONS: Record<string, DetectedFileType> = {
  jpg: 'jpeg', jpeg: 'jpeg', png: 'png', webp: 'webp', pdf: 'pdf', mp4: 'mp4', m4v: 'mp4', mp3: 'mp3',
};

const MIME_TYPES: Record<string, DetectedFileType> = {
  'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf',
  'video/mp4': 'mp4', 'audio/mp4': 'mp4', 'audio/mpeg': 'mp3', 'audio/mp3': 'mp3',
};

export const MAX_FILE_SIZE = 100 * 1024 * 1024;
export const MAX_IMAGE_SIZE = 50 * 1024 * 1024;

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

export function detectSignature(bytes: Uint8Array): DetectedFileType {
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(bytes, 1, 3) === 'PNG' && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'png';
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'webp';
  if (bytes.length >= 5 && ascii(bytes, 0, 5) === '%PDF-') return 'pdf';
  if (bytes.length >= 12 && ascii(bytes, 4, 4) === 'ftyp') return 'mp4';
  if (bytes.length >= 3 && ascii(bytes, 0, 3) === 'ID3') return 'mp3';
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1]! & 0xe0) === 0xe0 && (bytes[1]! & 0x18) !== 0x08) return 'mp3';
  return 'unknown';
}

export function typeFromFilename(name: string): DetectedFileType {
  const extension = name.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSIONS[extension] ?? 'unknown';
}

export function typeFromMime(mime: string): DetectedFileType {
  return MIME_TYPES[mime.toLowerCase()] ?? 'unknown';
}

export function detectFromBytes(bytes: Uint8Array, name = '', mime = ''): DetectionResult {
  const signatureType = detectSignature(bytes);
  const extensionType = typeFromFilename(name);
  const mimeType = typeFromMime(mime);
  const warnings: ParseWarning[] = [];

  if (signatureType === 'unknown') {
    throw new MetadataError('INVALID_FILE_SIGNATURE', 'The file signature is not one of the supported formats.');
  }
  if (extensionType !== 'unknown' && extensionType !== signatureType) {
    warnings.push({ code: 'EXTENSION_SIGNATURE_MISMATCH', message: `The filename suggests ${extensionType.toUpperCase()}, but the file bytes identify ${signatureType.toUpperCase()}.` });
  }
  if (mimeType !== 'unknown' && mimeType !== signatureType) {
    warnings.push({ code: 'MIME_SIGNATURE_MISMATCH', message: `The browser reported ${mime || 'an unknown MIME type'}, but the file bytes identify ${signatureType.toUpperCase()}.` });
  }
  return { type: signatureType, signatureType, extensionType, mimeType: mime, warnings };
}

export async function detectFileType(file: File): Promise<DetectionResult> {
  if (file.size > MAX_FILE_SIZE) throw new MetadataError('FILE_TOO_LARGE', 'This file is larger than the 100 MB inspection limit.');
  const header = new Uint8Array(await file.slice(0, 64).arrayBuffer());
  const result = detectFromBytes(header, file.name, file.type);
  if (['jpeg', 'png', 'webp'].includes(result.type) && file.size > MAX_IMAGE_SIZE) {
    throw new MetadataError('FILE_TOO_LARGE', 'Images are limited to 50 MB.');
  }
  return result;
}
