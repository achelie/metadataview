import { MetadataError } from './errors';

export interface ParsedHeicContainer {
  majorBrand: string;
  compatibleBrands: string[];
  width: number;
  height: number;
  topLevelBoxes: string[];
  spatialProperties: number;
  hasExif: boolean;
  hasXmp: boolean;
  hasIcc: boolean;
  animated: boolean;
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function hasAscii(bytes: Uint8Array, value: string): boolean {
  const target = [...value].map((character) => character.charCodeAt(0));
  for (let offset = 0; offset + target.length <= bytes.length; offset += 1) {
    if (target.every((byte, index) => bytes[offset + index] === byte)) return true;
  }
  return false;
}

export function parseHeicContainer(input: ArrayBuffer | Uint8Array): ParsedHeicContainer {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length < 16 || ascii(bytes, 4, 4) !== 'ftyp') throw new MetadataError('INVALID_FILE_SIGNATURE', 'This is not a valid HEIC/HEIF file.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ftypSize = view.getUint32(0, false);
  if (ftypSize < 16 || ftypSize > bytes.length) throw new MetadataError('CORRUPTED_FILE', 'The HEIC file-type box is incomplete.');
  const majorBrand = ascii(bytes, 8, 4);
  const compatibleBrands: string[] = [];
  for (let offset = 16; offset + 4 <= ftypSize; offset += 4) compatibleBrands.push(ascii(bytes, offset, 4));
  const brands = [majorBrand, ...compatibleBrands].map((brand) => brand.toLowerCase());
  if (!brands.some((brand) => ['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'mif1', 'msf1'].includes(brand))) throw new MetadataError('INVALID_FILE_SIGNATURE', 'The ISO BMFF file does not advertise a supported HEIC/HEIF brand.');

  const topLevelBoxes: string[] = [];
  let cursor = 0;
  while (cursor + 8 <= bytes.length && topLevelBoxes.length < 10_000) {
    let size = view.getUint32(cursor, false);
    const type = ascii(bytes, cursor + 4, 4);
    let header = 8;
    if (size === 1) {
      if (cursor + 16 > bytes.length) throw new MetadataError('CORRUPTED_FILE', 'A HEIC extended-size box is incomplete.');
      const extended = Number(view.getBigUint64(cursor + 8, false));
      if (!Number.isSafeInteger(extended)) throw new MetadataError('CORRUPTED_FILE', 'A HEIC box is too large for this browser.');
      size = extended;
      header = 16;
    } else if (size === 0) size = bytes.length - cursor;
    if (size < header || cursor + size > bytes.length) throw new MetadataError('CORRUPTED_FILE', `The HEIC ${type || 'unknown'} box extends beyond the file boundary.`);
    topLevelBoxes.push(`${type} (${size} bytes)`);
    cursor += size;
  }

  let width = 0;
  let height = 0;
  let spatialProperties = 0;
  let hasIcc = false;
  for (let offset = 4; offset + 16 <= bytes.length; offset += 1) {
    const type = ascii(bytes, offset, 4);
    if (type === 'ispe') {
      const boxStart = offset - 4;
      const size = view.getUint32(boxStart, false);
      if (size < 20 || boxStart + size > bytes.length) continue;
      const candidateWidth = view.getUint32(offset + 8, false);
      const candidateHeight = view.getUint32(offset + 12, false);
      if (candidateWidth > 0 && candidateHeight > 0 && candidateWidth * candidateHeight > width * height) { width = candidateWidth; height = candidateHeight; }
      spatialProperties += 1;
    }
    if (type === 'colr' && offset + 8 <= bytes.length) {
      const method = ascii(bytes, offset + 4, 4);
      hasIcc ||= method === 'prof' || method === 'rICC';
    }
  }
  if (!width || !height) throw new MetadataError('IMAGE_DECODE_FAILED', 'HEIC dimensions could not be read from its spatial properties.');
  return {
    majorBrand, compatibleBrands, width, height, topLevelBoxes, spatialProperties,
    hasExif: hasAscii(bytes, 'Exif'),
    hasXmp: hasAscii(bytes, 'application/rdf+xml') || hasAscii(bytes, '<x:xmpmeta'),
    hasIcc,
    animated: brands.some((brand) => ['msf1', 'hevs', 'hevx'].includes(brand)),
  };
}
