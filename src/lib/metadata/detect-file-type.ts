import { MetadataError } from './errors';
import { inspectOoxmlPackage } from './ooxml-package';
import type { ContainerSignatureType, DetectedFileType, DetectionResult, ParseWarning } from './types';

const EXTENSIONS: Record<string, DetectedFileType> = {
  jpg: 'jpeg', jpeg: 'jpeg', png: 'png', webp: 'webp', heic: 'heic', heif: 'heic', tif: 'tiff', tiff: 'tiff', gif: 'gif', pdf: 'pdf', docx: 'docx', pptx: 'pptx', xlsx: 'xlsx', mp4: 'mp4', m4v: 'mp4',
  mov: 'mov', mkv: 'mkv', webm: 'webm', avi: 'avi', flv: 'flv', '3gp': '3gp', '3g2': '3g2',
  mp3: 'mp3', flac: 'flac', ogg: 'ogg', oga: 'ogg', opus: 'opus', m4a: 'm4a', aac: 'aac', wav: 'wav', wave: 'wav', wma: 'wma',
};

const MIME_TYPES: Record<string, DetectedFileType> = {
  'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heic', 'image/tiff': 'tiff', 'image/gif': 'gif', 'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'video/mp4': 'mp4', 'video/x-m4v': 'mp4', 'video/quicktime': 'mov',
  'video/x-matroska': 'mkv', 'video/webm': 'webm',
  'video/x-msvideo': 'avi', 'video/avi': 'avi', 'video/msvideo': 'avi',
  'video/x-flv': 'flv', 'video/3gpp': '3gp', 'video/3gpp2': '3g2',
  'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a',
  'audio/mpeg': 'mp3', 'audio/mp3': 'mp3',
  'audio/flac': 'flac', 'audio/x-flac': 'flac',
  'audio/ogg': 'ogg', 'application/ogg': 'ogg', 'audio/opus': 'opus',
  'audio/aac': 'aac', 'audio/aacp': 'aac', 'audio/x-aac': 'aac',
  'audio/wav': 'wav', 'audio/wave': 'wav', 'audio/x-wav': 'wav',
  'audio/x-ms-wma': 'wma', 'audio/wma': 'wma', 'video/x-ms-asf': 'wma',
};

export const MAX_FILE_SIZE = 100 * 1024 * 1024;
export const MAX_IMAGE_SIZE = 50 * 1024 * 1024;

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function isOleCompoundFile(bytes: Uint8Array): boolean {
  const signature = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  return bytes.length >= signature.length && signature.every((byte, index) => bytes[index] === byte);
}

function isAsf(bytes: Uint8Array): boolean {
  const signature = [0x30, 0x26, 0xb2, 0x75, 0x8e, 0x66, 0xcf, 0x11, 0xa6, 0xd9, 0x00, 0xaa, 0x00, 0x62, 0xce, 0x6c];
  return bytes.length >= signature.length && signature.every((byte, index) => bytes[index] === byte);
}

function isoBmffType(bytes: Uint8Array): 'mp4' | 'm4a' | 'mov' | '3gp' | '3g2' | 'heic' | 'unknown' {
  if (bytes.length < 12 || ascii(bytes, 4, 4) !== 'ftyp') return 'mp4';
  const declaredSize = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, false);
  const end = Math.min(bytes.length, declaredSize >= 16 ? declaredSize : 64, 64);
  const brands: string[] = [];
  for (let offset = 8; offset + 4 <= end; offset += 4) {
    if (offset === 12) continue;
    brands.push(ascii(bytes, offset, 4).toLowerCase());
  }
  if (brands.some((brand) => brand === 'avif' || brand === 'avis')) return 'unknown';
  if (brands.some((brand) => ['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'mif1', 'msf1'].includes(brand))) return 'heic';
  if (brands.some((brand) => ['m4a ', 'm4b ', 'm4p ', 'm4r '].includes(brand))) return 'm4a';
  if (brands.some((brand) => brand === 'qt  ')) return 'mov';
  if (brands.some((brand) => brand.startsWith('3g2'))) return '3g2';
  if (brands.some((brand) => brand.startsWith('3gp'))) return '3gp';
  return 'mp4';
}

function ebmlDocType(bytes: Uint8Array): 'mkv' | 'webm' {
  const end = Math.min(bytes.length, 4_096);
  for (let offset = 4; offset + 4 <= end; offset += 1) {
    if (bytes[offset] !== 0x42 || bytes[offset + 1] !== 0x82) continue;
    const first = bytes[offset + 2]!;
    let length = 1;
    let mask = 0x80;
    while (length <= 8 && (first & mask) === 0) { length += 1; mask >>= 1; }
    if (length > 8 || offset + 2 + length > end) continue;
    let size = first & (mask - 1);
    for (let index = 1; index < length; index += 1) size = size * 256 + bytes[offset + 2 + index]!;
    const start = offset + 2 + length;
    const docType = ascii(bytes, start, Math.min(size, end - start)).toLowerCase();
    if (docType === 'webm') return 'webm';
    if (docType === 'matroska') return 'mkv';
  }
  return 'mkv';
}

function oggCodec(bytes: Uint8Array): 'ogg' | 'opus' {
  if (bytes.length < 28) return 'ogg';
  const segmentCount = bytes[26] ?? 0;
  const payloadOffset = 27 + segmentCount;
  if (payloadOffset + 8 <= bytes.length && ascii(bytes, payloadOffset, 8) === 'OpusHead') return 'opus';
  return 'ogg';
}

function compatibleTypes(left: DetectedFileType, right: DetectedFileType): boolean {
  if (left === right) return true;
  return (left === 'ogg' && right === 'opus') || (left === 'opus' && right === 'ogg');
}

function id3PayloadOffset(bytes: Uint8Array): number | undefined {
  if (bytes.length < 10 || ascii(bytes, 0, 3) !== 'ID3') return undefined;
  const sizeBytes = bytes.subarray(6, 10);
  if ([...sizeBytes].some((byte) => byte > 0x7f)) return undefined;
  const size = ((sizeBytes[0]! << 21) | (sizeBytes[1]! << 14) | (sizeBytes[2]! << 7) | sizeBytes[3]!) >>> 0;
  return 10 + size + ((bytes[5]! & 0x10) !== 0 ? 10 : 0);
}

export function detectSignature(bytes: Uint8Array): ContainerSignatureType {
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(bytes, 1, 3) === 'PNG' && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'png';
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (bytes.length >= 6 && (ascii(bytes, 0, 6) === 'GIF87a' || ascii(bytes, 0, 6) === 'GIF89a')) return 'gif';
  if (bytes.length >= 8 && ((ascii(bytes, 0, 2) === 'II' && (bytes[2] === 0x2a || bytes[2] === 0x2b) && bytes[3] === 0x00) || (ascii(bytes, 0, 2) === 'MM' && bytes[2] === 0x00 && (bytes[3] === 0x2a || bytes[3] === 0x2b)))) return 'tiff';
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'webp';
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WAVE') return 'wav';
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'AVI ') return 'avi';
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return ebmlDocType(bytes);
  if (bytes.length >= 4 && ascii(bytes, 0, 3) === 'FLV' && bytes[3] === 0x01) return 'flv';
  if (bytes.length >= 4 && ascii(bytes, 0, 4) === 'fLaC') return 'flac';
  if (bytes.length >= 4 && ascii(bytes, 0, 4) === 'OggS') return oggCodec(bytes);
  if (isAsf(bytes)) return 'wma';
  if (bytes.length >= 5 && ascii(bytes, 0, 5) === '%PDF-') return 'pdf';
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && ((bytes[2] === 0x03 && bytes[3] === 0x04) || (bytes[2] === 0x05 && bytes[3] === 0x06) || (bytes[2] === 0x07 && bytes[3] === 0x08))) return 'zip';
  if (bytes.length >= 12 && ascii(bytes, 4, 4) === 'ftyp') return isoBmffType(bytes);
  if (bytes.length >= 3 && ascii(bytes, 0, 3) === 'ID3') return 'mp3';
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1]! & 0xf6) === 0xf0) return 'aac';
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1]! & 0xe0) === 0xe0 && (bytes[1]! & 0x18) !== 0x08 && (bytes[1]! & 0x06) !== 0) return 'mp3';
  return 'unknown';
}

export function typeFromFilename(name: string): DetectedFileType {
  const extension = name.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSIONS[extension] ?? 'unknown';
}

export function typeFromMime(mime: string): DetectedFileType {
  return MIME_TYPES[mime.split(';', 1)[0]!.trim().toLowerCase()] ?? 'unknown';
}

export function detectFromBytes(bytes: Uint8Array, name = '', mime = ''): DetectionResult {
  const signatureType = detectSignature(bytes);
  const extensionType = typeFromFilename(name);
  const mimeType = typeFromMime(mime);
  const warnings: ParseWarning[] = [];

  if (signatureType === 'unknown') {
    throw new MetadataError('INVALID_FILE_SIGNATURE', 'The file signature is not one of the supported formats.');
  }
  if (signatureType === 'zip') return { type: 'unknown', signatureType, extensionType, mimeType: mime, warnings };
  const detectedType = signatureType === 'mp4' && (extensionType === 'm4a' || (extensionType === 'unknown' && mimeType === 'm4a')) ? 'm4a' : signatureType;
  if (extensionType !== 'unknown' && !compatibleTypes(extensionType, detectedType)) {
    warnings.push({ code: 'EXTENSION_SIGNATURE_MISMATCH', message: `The filename suggests ${extensionType.toUpperCase()}, but the file bytes identify ${detectedType.toUpperCase()}.` });
  }
  if (mimeType !== 'unknown' && !compatibleTypes(mimeType, detectedType)) {
    warnings.push({ code: 'MIME_SIGNATURE_MISMATCH', message: `The browser reported ${mime || 'an unknown MIME type'}, but the file bytes identify ${detectedType.toUpperCase()}.` });
  }
  return { type: detectedType, signatureType, extensionType, mimeType: mime, warnings };
}

export async function detectFileType(file: File): Promise<DetectionResult> {
  if (file.size > MAX_FILE_SIZE) throw new MetadataError('FILE_TOO_LARGE', 'This file is larger than the 100 MB inspection limit.');
  let header = new Uint8Array(await file.slice(0, 4_096).arrayBuffer());
  const audioOffset = id3PayloadOffset(header);
  if (audioOffset !== undefined && audioOffset < file.size) {
    const frameHeader = new Uint8Array(await file.slice(audioOffset, Math.min(file.size, audioOffset + 16)).arrayBuffer());
    if (detectSignature(frameHeader) === 'aac') header = frameHeader;
  }
  if (isOleCompoundFile(header) && ['docx', 'pptx', 'xlsx'].includes(typeFromFilename(file.name))) {
    throw new MetadataError('ENCRYPTED_OFFICE', 'This is an encrypted or legacy binary Office container. The viewer supports unencrypted DOCX, PPTX, and XLSX packages and will not bypass passwords.');
  }
  const result = detectFromBytes(header, file.name, file.type);
  if (result.signatureType === 'zip') {
    const inspection = await inspectOoxmlPackage(file);
    const warnings: ParseWarning[] = [];
    if (result.extensionType !== 'unknown' && result.extensionType !== inspection.type) {
      warnings.push({ code: 'EXTENSION_SIGNATURE_MISMATCH', message: `The filename suggests ${result.extensionType.toUpperCase()}, but the Office package identifies ${inspection.type.toUpperCase()}.` });
    }
    const mimeType = typeFromMime(file.type);
    if (mimeType !== 'unknown' && mimeType !== inspection.type) {
      warnings.push({ code: 'MIME_SIGNATURE_MISMATCH', message: `The browser reported ${file.type || 'an unknown MIME type'}, but the Office package identifies ${inspection.type.toUpperCase()}.` });
    }
    return { type: inspection.type, signatureType: 'zip', extensionType: result.extensionType, mimeType: file.type, warnings };
  }
  if (['jpeg', 'png', 'webp', 'heic', 'tiff', 'gif'].includes(result.type) && file.size > MAX_IMAGE_SIZE) {
    throw new MetadataError('FILE_TOO_LARGE', 'Images are limited to 50 MB.');
  }
  return result;
}
