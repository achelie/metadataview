import { MetadataError } from '../metadata/errors';
import { sanitizeFilename } from '../metadata/utils';
import type { ParseWarning } from '../metadata/types';

export type C2paAssetType =
  | 'jpeg' | 'png' | 'webp' | 'gif' | 'tiff' | 'heic' | 'heif' | 'avif' | 'jxl' | 'dng' | 'arw' | 'nef' | 'svg'
  | 'mp4' | 'mov' | 'avi'
  | 'mp3' | 'm4a' | 'wav'
  | 'pdf';

export type C2paDetectedType = C2paAssetType | 'unsupported';
export type C2paAssetCategory = 'image' | 'video' | 'audio' | 'document';

export interface C2paFileDetection {
  type: C2paDetectedType;
  category: C2paAssetCategory | 'unsupported';
  inspectedMime?: string;
  supported: boolean;
  warnings: ParseWarning[];
}

export interface C2paFileSummary {
  name: string;
  safeName: string;
  size: number;
  mime: string;
  detectedType: C2paDetectedType;
  extension: string;
  lastModified?: string;
  declaredMime: string;
  inspectedMime?: string;
}

export const C2PA_FORMAT_SUMMARY = 'Images · Video · Audio · PDF';
export const C2PA_ACCEPT = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.tif', '.tiff', '.heic', '.heif', '.avif', '.jxl', '.dng', '.arw', '.nef', '.svg',
  '.mp4', '.mov', '.avi', '.mp3', '.m4a', '.wav', '.pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff', 'image/heic', 'image/heif', 'image/avif', 'image/jxl', 'image/dng', 'image/x-sony-arw', 'image/x-nikon-nef', 'image/svg+xml',
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'application/pdf',
].join(',');

export const C2PA_FORMAT_GROUPS = [
  { label: 'Images', formats: 'JPEG, PNG, WebP, GIF, TIFF, HEIC, HEIF, AVIF, JXL, DNG, ARW, NEF, SVG' },
  { label: 'Video', formats: 'MP4, MOV, AVI' },
  { label: 'Audio', formats: 'MP3, M4A, WAV' },
  { label: 'Document', formats: 'PDF' },
] as const;

export const C2PA_SUPPORTED_TYPES: readonly C2paAssetType[] = [
  'jpeg', 'png', 'webp', 'gif', 'tiff', 'heic', 'heif', 'avif', 'jxl', 'dng', 'arw', 'nef', 'svg',
  'mp4', 'mov', 'avi', 'mp3', 'm4a', 'wav', 'pdf',
];

export const C2PA_MIME_BY_TYPE: Readonly<Record<C2paAssetType, string>> = {
  jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', tiff: 'image/tiff',
  heic: 'image/heic', heif: 'image/heif', avif: 'image/avif', jxl: 'image/jxl', dng: 'image/dng',
  arw: 'image/x-sony-arw', nef: 'image/x-nikon-nef', svg: 'image/svg+xml',
  mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', pdf: 'application/pdf',
};

const EXTENSION_TYPES: Record<string, C2paAssetType> = {
  jpg: 'jpeg', jpeg: 'jpeg', png: 'png', webp: 'webp', gif: 'gif', tif: 'tiff', tiff: 'tiff',
  heic: 'heic', heif: 'heif', avif: 'avif', jxl: 'jxl', dng: 'dng', arw: 'arw', nef: 'nef', svg: 'svg',
  mp4: 'mp4', mov: 'mov', avi: 'avi', mp3: 'mp3', m4a: 'm4a', wav: 'wav', wave: 'wav', pdf: 'pdf',
};

const MIME_TYPES: Record<string, C2paAssetType> = {
  'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/tiff': 'tiff',
  'image/heic': 'heic', 'image/heif': 'heif', 'image/avif': 'avif', 'image/jxl': 'jxl', 'image/dng': 'dng',
  'image/x-adobe-dng': 'dng', 'image/x-sony-arw': 'arw', 'image/x-nikon-nef': 'nef', 'image/svg+xml': 'svg',
  'video/mp4': 'mp4', 'application/mp4': 'mp4', 'video/quicktime': 'mov', 'video/x-msvideo': 'avi',
  'video/avi': 'avi', 'video/msvideo': 'avi', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a',
  'audio/wav': 'wav', 'audio/wave': 'wav', 'audio/x-wav': 'wav', 'application/pdf': 'pdf',
};

const IMAGE_TYPES = new Set<C2paAssetType>(['jpeg', 'png', 'webp', 'gif', 'tiff', 'heic', 'heif', 'avif', 'jxl', 'dng', 'arw', 'nef', 'svg']);
const VIDEO_TYPES = new Set<C2paAssetType>(['mp4', 'mov', 'avi']);
const AUDIO_TYPES = new Set<C2paAssetType>(['mp3', 'm4a', 'wav']);
const TIFF_FAMILY = new Set<C2paAssetType>(['tiff', 'dng', 'arw', 'nef']);

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function extensionFrom(name: string): string {
  return name.split('.').pop()?.trim().toLowerCase() ?? '';
}

function categoryFor(type: C2paAssetType): C2paAssetCategory {
  if (IMAGE_TYPES.has(type)) return 'image';
  if (VIDEO_TYPES.has(type)) return 'video';
  if (AUDIO_TYPES.has(type)) return 'audio';
  return 'document';
}

function isTiff(bytes: Uint8Array): boolean {
  return bytes.length >= 4 && (
    (ascii(bytes, 0, 2) === 'II' && (bytes[2] === 0x2a || bytes[2] === 0x2b) && bytes[3] === 0x00)
    || (ascii(bytes, 0, 2) === 'MM' && bytes[2] === 0x00 && (bytes[3] === 0x2a || bytes[3] === 0x2b))
  );
}

function bmffType(bytes: Uint8Array, extensionType?: C2paAssetType): C2paAssetType | undefined {
  if (bytes.length < 12 || ascii(bytes, 4, 4) !== 'ftyp') return undefined;
  const boxSize = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, false);
  const end = Math.min(bytes.length, boxSize >= 16 ? boxSize : 64, 128);
  const brands = [ascii(bytes, 8, 4).toLowerCase()];
  for (let offset = 16; offset + 4 <= end; offset += 4) brands.push(ascii(bytes, offset, 4).toLowerCase());
  if (brands.some((brand) => brand === 'avif' || brand === 'avis')) return 'avif';
  if (brands.some((brand) => ['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis'].includes(brand))) return extensionType === 'heif' ? 'heif' : 'heic';
  if (brands.some((brand) => ['mif1', 'msf1'].includes(brand))) return extensionType === 'heic' ? 'heic' : 'heif';
  if (brands.some((brand) => ['m4a ', 'm4b ', 'm4p ', 'm4r '].includes(brand))) return 'm4a';
  if (brands.some((brand) => brand === 'qt  ')) return 'mov';
  if (brands.some((brand) => brand.startsWith('3gp') || brand.startsWith('3g2'))) return undefined;
  return 'mp4';
}

function isSvg(bytes: Uint8Array): boolean {
  const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes).replace(/^\uFEFF/, '');
  const withoutPreamble = text
    .replace(/^\s*<\?xml[\s\S]*?\?>/i, '')
    .replace(/^\s*<!doctype\s+svg[\s\S]*?>/i, '')
    .replace(/^(?:\s*<!--[\s\S]*?-->)+/, '');
  return /^\s*<svg(?:\s|>)/i.test(withoutPreamble);
}

function signatureType(bytes: Uint8Array, extensionType?: C2paAssetType): C2paAssetType | undefined {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(bytes, 1, 3) === 'PNG' && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'png';
  if (bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(ascii(bytes, 0, 6))) return 'gif';
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF') {
    const form = ascii(bytes, 8, 4);
    if (form === 'WEBP') return 'webp';
    if (form === 'WAVE') return 'wav';
    if (form === 'AVI ') return 'avi';
  }
  if (bytes.length >= 5 && ascii(bytes, 0, 5) === '%PDF-') return 'pdf';
  if (bytes.length >= 3 && ascii(bytes, 0, 3) === 'ID3') return 'mp3';
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1]! & 0xf6) === 0xf0) return undefined;
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1]! & 0xe0) === 0xe0 && (bytes[1]! & 0x18) !== 0x08 && (bytes[1]! & 0x06) !== 0) return 'mp3';
  if (bytes.length >= 12 && bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x00 && bytes[3] === 0x0c && ascii(bytes, 4, 4) === 'JXL ' && bytes[8] === 0x0d && bytes[9] === 0x0a && bytes[10] === 0x87 && bytes[11] === 0x0a) return 'jxl';
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0x0a) return 'jxl';
  if (isTiff(bytes)) return extensionType && TIFF_FAMILY.has(extensionType) ? extensionType : 'tiff';
  const bmff = bmffType(bytes, extensionType);
  if (bmff) return bmff;
  if (isSvg(bytes)) return 'svg';
  return undefined;
}

function compatible(expected: C2paAssetType, actual: C2paAssetType): boolean {
  if (expected === actual) return true;
  if ((expected === 'heic' || expected === 'heif') && (actual === 'heic' || actual === 'heif')) return true;
  return TIFF_FAMILY.has(expected) && TIFF_FAMILY.has(actual);
}

function isKnownUnsupported(bytes: Uint8Array): boolean {
  if (bytes.length >= 4 && (
    (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3)
    || ascii(bytes, 0, 4) === 'FLV\u0001'
    || ascii(bytes, 0, 4) === 'fLaC'
    || ascii(bytes, 0, 4) === 'OggS'
    || (bytes[0] === 0x50 && bytes[1] === 0x4b && ((bytes[2] === 0x03 && bytes[3] === 0x04) || (bytes[2] === 0x05 && bytes[3] === 0x06) || (bytes[2] === 0x07 && bytes[3] === 0x08)))
  )) return true;
  if (bytes.length >= 12 && ascii(bytes, 4, 4) === 'ftyp') return true;
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1]! & 0xf6) === 0xf0) return true;
  const asf = [0x30, 0x26, 0xb2, 0x75, 0x8e, 0x66, 0xcf, 0x11, 0xa6, 0xd9, 0x00, 0xaa, 0x00, 0x62, 0xce, 0x6c];
  return bytes.length >= asf.length && asf.every((byte, index) => bytes[index] === byte);
}

export async function detectC2paAsset(file: File): Promise<C2paFileDetection> {
  if (file.size > 100 * 1024 * 1024) throw new MetadataError('FILE_TOO_LARGE', 'This file is larger than the 100 MB C2PA verification limit.');
  const extension = extensionFrom(file.name);
  const extensionType = EXTENSION_TYPES[extension];
  const declaredMime = file.type.split(';', 1)[0]!.trim().toLowerCase();
  const mimeType = MIME_TYPES[declaredMime];
  const bytes = new Uint8Array(await file.slice(0, 64 * 1024).arrayBuffer());
  const actual = signatureType(bytes, extensionType ?? mimeType);
  if (!actual) {
    if (isKnownUnsupported(bytes)) return { type: 'unsupported', category: 'unsupported', supported: false, warnings: [] };
    throw new MetadataError('INVALID_FILE_SIGNATURE', 'The file signature is not one of the C2PA asset formats supported on this page.');
  }
  if (IMAGE_TYPES.has(actual) && file.size > 50 * 1024 * 1024) throw new MetadataError('FILE_TOO_LARGE', 'Images and camera RAW files are limited to 50 MB.');
  const warnings: ParseWarning[] = [];
  if (extensionType && !compatible(extensionType, actual)) warnings.push({
    code: 'EXTENSION_SIGNATURE_MISMATCH',
    message: `The filename suggests ${extensionType.toUpperCase()}, but the file bytes identify ${actual.toUpperCase()}.`,
  });
  if (mimeType && !compatible(mimeType, actual)) warnings.push({
    code: 'MIME_SIGNATURE_MISMATCH',
    message: `The browser reported ${file.type}, but the file bytes identify ${actual.toUpperCase()}.`,
  });
  return { type: actual, category: categoryFor(actual), inspectedMime: C2PA_MIME_BY_TYPE[actual], supported: true, warnings };
}

export function makeC2paFileSummary(file: File, detection: C2paFileDetection): C2paFileSummary {
  return {
    name: file.name.replace(/[<>"'&]/g, ''),
    safeName: sanitizeFilename(file.name),
    size: file.size,
    mime: file.type || 'application/octet-stream',
    declaredMime: file.type || 'application/octet-stream',
    inspectedMime: detection.inspectedMime,
    detectedType: detection.type,
    extension: extensionFrom(file.name),
    lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : undefined,
  };
}

export function c2paTypeFromExtension(name: string): C2paAssetType | undefined {
  return EXTENSION_TYPES[extensionFrom(name)];
}

export function c2paTypeFromMime(mime: string): C2paAssetType | undefined {
  return MIME_TYPES[mime.split(';', 1)[0]!.trim().toLowerCase()];
}
