import { describe, expect, it } from 'vitest';
import { detectFromBytes, detectSignature } from '../../src/lib/metadata/detect-file-type';

describe('file signature detection', () => {
  it('detects PNG', () => expect(detectSignature(Uint8Array.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))).toBe('png'));
  it('detects JPEG', () => expect(detectSignature(Uint8Array.from([0xff,0xd8,0xff,0xe0]))).toBe('jpeg'));
  it('detects WebP', () => expect(detectSignature(Uint8Array.from([82,73,70,70,0,0,0,0,87,69,66,80]))).toBe('webp'));
  it('detects PDF', () => expect(detectSignature(new TextEncoder().encode('%PDF-1.7'))).toBe('pdf'));
  it('recognizes the ZIP container before OOXML package inspection', () => expect(detectSignature(Uint8Array.from([0x50, 0x4b, 0x03, 0x04]))).toBe('zip'));
  it('detects MP4', () => expect(detectSignature(Uint8Array.from([0,0,0,24,102,116,121,112,105,115,111,109]))).toBe('mp4'));
  it('detects MP3 from ID3 and MPEG headers', () => {
    expect(detectSignature(new TextEncoder().encode('ID3\u0004\u0000'))).toBe('mp3');
    expect(detectSignature(Uint8Array.from([0xff, 0xfb, 0x90, 0x64]))).toBe('mp3');
  });
  it('warns when MIME, extension, and signature disagree', () => {
    const result = detectFromBytes(Uint8Array.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]), 'photo.jpg', 'image/jpeg');
    expect(result.type).toBe('png');
    expect(result.warnings.map((warning) => warning.code)).toEqual(['EXTENSION_SIGNATURE_MISMATCH', 'MIME_SIGNATURE_MISMATCH']);
  });
});
