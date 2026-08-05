import { MetadataError } from './errors';
import type { DetectedFileType } from './types';

export interface ImageDimensions { width: number; height: number }

function jpegDimensions(bytes: Uint8Array): ImageDimensions {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) { offset += 1; continue; }
    const marker = bytes[offset + 1] ?? 0;
    if (marker === 0xda || marker === 0xd9) break;
    if (marker >= 0xd0 && marker <= 0xd7) { offset += 2; continue; }
    const length = view.getUint16(offset + 2, false);
    if (length < 2 || offset + 2 + length > bytes.length) break;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: view.getUint16(offset + 5, false), width: view.getUint16(offset + 7, false) };
    }
    offset += 2 + length;
  }
  throw new MetadataError('IMAGE_DECODE_FAILED', 'JPEG dimensions could not be read.');
}

function webpDimensions(bytes: Uint8Array): ImageDimensions {
  if (bytes.length < 30) throw new MetadataError('IMAGE_DECODE_FAILED', 'WebP header is incomplete.');
  const type = String.fromCharCode(...bytes.subarray(12, 16));
  if (type === 'VP8X') {
    return {
      width: 1 + (bytes[24]! | (bytes[25]! << 8) | (bytes[26]! << 16)),
      height: 1 + (bytes[27]! | (bytes[28]! << 8) | (bytes[29]! << 16)),
    };
  }
  if (type === 'VP8L') {
    const b1 = bytes[21]!, b2 = bytes[22]!, b3 = bytes[23]!, b4 = bytes[24]!;
    return { width: 1 + (((b2 & 0x3f) << 8) | b1), height: 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6)) };
  }
  if (type === 'VP8 ' && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
    return { width: (bytes[26]! | (bytes[27]! << 8)) & 0x3fff, height: (bytes[28]! | (bytes[29]! << 8)) & 0x3fff };
  }
  throw new MetadataError('IMAGE_DECODE_FAILED', 'WebP dimensions could not be read.');
}

export function readImageDimensions(bytes: Uint8Array, type: DetectedFileType): ImageDimensions {
  if (type === 'png') {
    if (bytes.length < 24) throw new MetadataError('IMAGE_DECODE_FAILED', 'PNG header is incomplete.');
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: view.getUint32(16, false), height: view.getUint32(20, false) };
  }
  if (type === 'jpeg') return jpegDimensions(bytes);
  if (type === 'webp') return webpDimensions(bytes);
  throw new MetadataError('IMAGE_DECODE_FAILED', 'Unsupported image format.');
}
