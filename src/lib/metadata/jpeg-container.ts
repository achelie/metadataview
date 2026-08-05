import { MetadataError } from './errors';

export interface ParsedJpegContainer {
  segments: { marker: string; size: number; kind?: string }[];
  hasExif: boolean;
  hasXmp: boolean;
  hasIcc: boolean;
  hasIptc: boolean;
  hasJfif: boolean;
  hasComment: boolean;
}

const markerNames: Record<number, string> = { 0xe0: 'APP0', 0xe1: 'APP1', 0xe2: 'APP2', 0xed: 'APP13', 0xfe: 'COM' };

function starts(bytes: Uint8Array, offset: number, value: string): boolean {
  if (offset + value.length > bytes.length) return false;
  for (let index = 0; index < value.length; index += 1) if (bytes[offset + index] !== value.charCodeAt(index)) return false;
  return true;
}

export function parseJpegContainer(input: ArrayBuffer | Uint8Array): ParsedJpegContainer {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length < 3 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) throw new MetadataError('INVALID_FILE_SIGNATURE', 'This is not a valid JPEG file.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const segments: ParsedJpegContainer['segments'] = [];
  let hasExif = false, hasXmp = false, hasIcc = false, hasIptc = false, hasJfif = false, hasComment = false;
  let cursor = 2;
  while (cursor + 4 <= bytes.length) {
    if (bytes[cursor] !== 0xff) { cursor += 1; continue; }
    while (bytes[cursor] === 0xff) cursor += 1;
    const marker = bytes[cursor++] ?? 0;
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker >= 0xd0 && marker <= 0xd7) continue;
    if (cursor + 2 > bytes.length) break;
    const segmentLength = view.getUint16(cursor, false);
    if (segmentLength < 2 || cursor + segmentLength > bytes.length) throw new MetadataError('CORRUPTED_FILE', 'A JPEG segment extends beyond the file boundary.');
    const dataStart = cursor + 2;
    let kind: string | undefined;
    if (marker === 0xe0 && starts(bytes, dataStart, 'JFIF')) { hasJfif = true; kind = 'JFIF'; }
    if (marker === 0xe1 && starts(bytes, dataStart, 'Exif')) { hasExif = true; kind = 'EXIF'; }
    if (marker === 0xe1 && starts(bytes, dataStart, 'http://ns.adobe.com/xap/1.0/')) { hasXmp = true; kind = 'XMP'; }
    if (marker === 0xe2 && starts(bytes, dataStart, 'ICC_PROFILE')) { hasIcc = true; kind = 'ICC'; }
    if (marker === 0xed && starts(bytes, dataStart, 'Photoshop 3.0')) { hasIptc = true; kind = 'IPTC'; }
    if (marker === 0xfe) { hasComment = true; kind = 'Comment'; }
    segments.push({ marker: markerNames[marker] ?? `0x${marker.toString(16).toUpperCase()}`, size: segmentLength - 2, kind });
    cursor += segmentLength;
  }
  return { segments, hasExif, hasXmp, hasIcc, hasIptc, hasJfif, hasComment };
}
