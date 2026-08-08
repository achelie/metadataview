import { READER_SUPPORTED_FORMATS } from '@contentauth/c2pa-web';
import { describe, expect, it } from 'vitest';
import {
  C2PA_ACCEPT,
  C2PA_FORMAT_GROUPS,
  C2PA_MIME_BY_TYPE,
  C2PA_SUPPORTED_TYPES,
  detectC2paAsset,
  type C2paAssetType,
} from '../../src/lib/c2pa/formats';

const text = (value: string) => new TextEncoder().encode(value);

function concat(...parts: Uint8Array[]): Uint8Array {
  const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  parts.forEach((part) => { result.set(part, offset); offset += part.length; });
  return result;
}

function uint32be(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, false);
  return bytes;
}

function uint32le(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, true);
  return bytes;
}

function bmff(brand: string, compatible = brand): Uint8Array {
  const payload = concat(text(brand), new Uint8Array(4), text(compatible));
  return concat(uint32be(payload.length + 8), text('ftyp'), payload);
}

function riff(form: string): Uint8Array {
  return concat(text('RIFF'), uint32le(4), text(form));
}

function fixture(type: C2paAssetType): { name: string; mime: string; bytes: Uint8Array } {
  const data: Record<C2paAssetType, Uint8Array> = {
    jpeg: Uint8Array.from([0xff, 0xd8, 0xff, 0xd9]),
    png: Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    webp: riff('WEBP'), gif: text('GIF89a'),
    tiff: Uint8Array.from([0x49, 0x49, 0x2a, 0x00]), heic: bmff('heic'), heif: bmff('mif1'), avif: bmff('avif'),
    jxl: Uint8Array.from([0xff, 0x0a]), dng: Uint8Array.from([0x49, 0x49, 0x2a, 0x00]),
    arw: Uint8Array.from([0x49, 0x49, 0x2a, 0x00]), nef: Uint8Array.from([0x4d, 0x4d, 0x00, 0x2a]), svg: text('<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"/>'),
    mp4: bmff('isom'), mov: bmff('qt  '), avi: riff('AVI '), mp3: text('ID3\u0004\u0000\u0000\u0000\u0000\u0000\u0000'),
    m4a: bmff('M4A '), wav: riff('WAVE'), pdf: text('%PDF-1.7\n%%EOF'),
  };
  const extensions: Record<C2paAssetType, string> = { jpeg: 'jpg', png: 'png', webp: 'webp', gif: 'gif', tiff: 'tiff', heic: 'heic', heif: 'heif', avif: 'avif', jxl: 'jxl', dng: 'dng', arw: 'arw', nef: 'nef', svg: 'svg', mp4: 'mp4', mov: 'mov', avi: 'avi', mp3: 'mp3', m4a: 'm4a', wav: 'wav', pdf: 'pdf' };
  return { name: `fixture.${extensions[type]}`, mime: C2PA_MIME_BY_TYPE[type], bytes: data[type] };
}

describe('C2PA asset format detection', () => {
  it('publishes the exact 20 consumer asset formats and only SDK-supported MIME values', () => {
    expect(C2PA_SUPPORTED_TYPES).toHaveLength(20);
    expect(C2PA_FORMAT_GROUPS.flatMap((group) => group.formats.split(', '))).toHaveLength(20);
    expect(C2PA_SUPPORTED_TYPES.every((type) => READER_SUPPORTED_FORMATS.includes(C2PA_MIME_BY_TYPE[type]))).toBe(true);
    expect(C2PA_ACCEPT).not.toContain('.c2pa');
    expect(C2PA_ACCEPT).not.toContain('.xml');
  });

  it.each(C2PA_SUPPORTED_TYPES)('detects %s from file bytes and supplies the canonical SDK MIME', async (type) => {
    const sample = fixture(type);
    const file = new File([sample.bytes.slice().buffer as ArrayBuffer], sample.name, { type: sample.mime });
    await expect(detectC2paAsset(file)).resolves.toMatchObject({ type, supported: true, inspectedMime: C2PA_MIME_BY_TYPE[type], warnings: [] });
  });

  it('accepts both JPEG XL signatures and SVG preambles', async () => {
    const containerJxl = Uint8Array.from([0, 0, 0, 12, 0x4a, 0x58, 0x4c, 0x20, 0x0d, 0x0a, 0x87, 0x0a]);
    const svg = text('\uFEFF<?xml version="1.0"?><!DOCTYPE svg><svg viewBox="0 0 1 1"></svg>');
    await expect(detectC2paAsset(new File([containerJxl], 'asset.jxl', { type: 'image/jxl' }))).resolves.toMatchObject({ type: 'jxl' });
    await expect(detectC2paAsset(new File([svg], 'asset.svg', { type: 'image/svg+xml' }))).resolves.toMatchObject({ type: 'svg' });
  });

  it('uses a TIFF-family signature before accepting RAW extensions', async () => {
    const raw = new File([Uint8Array.from([0x49, 0x49, 0x2a, 0x00])], 'capture.nef', { type: 'image/x-nikon-nef' });
    const fake = new File([fixture('png').bytes.slice().buffer as ArrayBuffer], 'capture.nef', { type: 'image/x-nikon-nef' });
    await expect(detectC2paAsset(raw)).resolves.toMatchObject({ type: 'nef', warnings: [] });
    const detected = await detectC2paAsset(fake);
    expect(detected.type).toBe('png');
    expect(detected.warnings).toContainEqual(expect.objectContaining({ code: 'EXTENSION_SIGNATURE_MISMATCH' }));
  });

  it('reports a known but unavailable container as unsupported and rejects unknown bytes', async () => {
    const mkv = new File([Uint8Array.from([0x1a, 0x45, 0xdf, 0xa3])], 'movie.mkv', { type: 'video/x-matroska' });
    const aac = new File([Uint8Array.from([0xff, 0xf1, 0x50, 0x80])], 'audio.aac', { type: 'audio/aac' });
    await expect(detectC2paAsset(mkv)).resolves.toMatchObject({ type: 'unsupported', supported: false, category: 'unsupported' });
    await expect(detectC2paAsset(aac)).resolves.toMatchObject({ type: 'unsupported', supported: false, category: 'unsupported' });
    await expect(detectC2paAsset(new File([text('not an asset')], 'fake.jpg', { type: 'image/jpeg' }))).rejects.toMatchObject({ code: 'INVALID_FILE_SIGNATURE' });
  });

  it('enforces the smaller image limit before the SDK is loaded', async () => {
    const oversized = {
      name: 'huge.dng', type: 'image/dng', size: 50 * 1024 * 1024 + 1, lastModified: 0,
      slice: () => new Blob([Uint8Array.from([0x49, 0x49, 0x2a, 0x00])]),
    } as File;
    await expect(detectC2paAsset(oversized)).rejects.toMatchObject({ code: 'FILE_TOO_LARGE' });
  });
});
