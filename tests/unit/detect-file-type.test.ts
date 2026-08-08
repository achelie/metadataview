import { describe, expect, it } from 'vitest';
import { detectFileType, detectFromBytes, detectSignature, typeFromFilename, typeFromMime } from '../../src/lib/metadata/detect-file-type';
import { aacFixture, flacFixture, m4aFixture, oggFixture, opusFixture, wavFixture, wmaFixture } from '../fixtures/audio';
import { videoFixture, videoMime, type VideoFixtureType } from '../fixtures/video';

describe('file signature detection', () => {
  it('detects PNG', () => expect(detectSignature(Uint8Array.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))).toBe('png'));
  it('detects JPEG', () => expect(detectSignature(Uint8Array.from([0xff,0xd8,0xff,0xe0]))).toBe('jpeg'));
  it('detects WebP', () => expect(detectSignature(Uint8Array.from([82,73,70,70,0,0,0,0,87,69,66,80]))).toBe('webp'));
  it('detects PDF', () => expect(detectSignature(new TextEncoder().encode('%PDF-1.7'))).toBe('pdf'));
  it('recognizes the ZIP container before OOXML package inspection', () => expect(detectSignature(Uint8Array.from([0x50, 0x4b, 0x03, 0x04]))).toBe('zip'));
  it('detects MP4', () => expect(detectSignature(Uint8Array.from([0,0,0,24,102,116,121,112,105,115,111,109]))).toBe('mp4'));
  it.each(['mp4', 'mov', 'mkv', 'webm', 'avi', 'flv', '3gp', '3g2'] as VideoFixtureType[])('detects a real %s video container signature', (type) => {
    expect(detectSignature(videoFixture(type))).toBe(type);
    expect(detectFromBytes(videoFixture(type), `fixture.${type}`, videoMime(type))).toMatchObject({ type, warnings: [] });
  });
  it('treats M4V as the MP4 family while preserving its filename extension', () => {
    expect(typeFromFilename('camera.m4v')).toBe('mp4');
    expect(detectFromBytes(videoFixture('m4v'), 'camera.m4v', videoMime('m4v'))).toMatchObject({ type: 'mp4', warnings: [] });
  });
  it('detects MP3 from ID3 and MPEG headers', () => {
    expect(detectSignature(new TextEncoder().encode('ID3\u0004\u0000'))).toBe('mp3');
    expect(detectSignature(Uint8Array.from([0xff, 0xfb, 0x90, 0x64]))).toBe('mp3');
  });
  it('detects each supported audio container and keeps AAC separate from MP3', () => {
    expect(detectSignature(flacFixture())).toBe('flac');
    expect(detectSignature(oggFixture())).toBe('ogg');
    expect(detectSignature(opusFixture())).toBe('opus');
    expect(detectSignature(m4aFixture())).toBe('m4a');
    expect(detectSignature(aacFixture())).toBe('aac');
    expect(detectSignature(wavFixture())).toBe('wav');
    expect(detectSignature(wmaFixture())).toBe('wma');
    expect(detectSignature(Uint8Array.from([0xff, 0xf1, 0x50, 0x80]))).not.toBe('mp3');
  });
  it('maps audio extensions and parameterized MIME labels', () => {
    expect(typeFromFilename('recording.oga')).toBe('ogg');
    expect(typeFromFilename('recording.opus')).toBe('opus');
    expect(typeFromFilename('recording.wma')).toBe('wma');
    expect(typeFromMime('audio/ogg; codecs=opus')).toBe('ogg');
    expect(typeFromMime('audio/x-m4a')).toBe('m4a');
  });
  it('maps video extensions and MIME labels', () => {
    expect(typeFromFilename('clip.mov')).toBe('mov');
    expect(typeFromFilename('clip.webm')).toBe('webm');
    expect(typeFromFilename('clip.3g2')).toBe('3g2');
    expect(typeFromMime('video/quicktime')).toBe('mov');
    expect(typeFromMime('video/x-matroska')).toBe('mkv');
    expect(typeFromMime('video/3gpp')).toBe('3gp');
  });
  it('recognizes generic ISO BMFF audio as M4A when the filename identifies the audio profile', () => {
    const genericFtyp = Uint8Array.from([0, 0, 0, 24, 102, 116, 121, 112, 105, 115, 111, 109, 0, 0, 0, 0]);
    const result = detectFromBytes(genericFtyp, 'recording.m4a', 'audio/mp4');
    expect(result).toMatchObject({ type: 'm4a', signatureType: 'mp4' });
    expect(result.warnings).toEqual([]);
  });
  it('looks beyond a bounded ID3 prefix to distinguish an AAC frame from MP3', async () => {
    const id3 = Uint8Array.from([0x49, 0x44, 0x33, 4, 0, 0, 0, 0, 0, 4, 1, 2, 3, 4]);
    const file = new File([id3, aacFixture()], 'tagged.aac', { type: 'audio/aac' });
    await expect(detectFileType(file)).resolves.toMatchObject({ type: 'aac' });
  });
  it('treats the generic OGA extension and audio/ogg MIME as compatible with Opus', () => {
    const result = detectFromBytes(opusFixture(), 'voice.oga', 'audio/ogg');
    expect(result.type).toBe('opus');
    expect(result.warnings).toEqual([]);
  });
  it('warns when MIME, extension, and signature disagree', () => {
    const result = detectFromBytes(Uint8Array.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]), 'photo.jpg', 'image/jpeg');
    expect(result.type).toBe('png');
    expect(result.warnings.map((warning) => warning.code)).toEqual(['EXTENSION_SIGNATURE_MISMATCH', 'MIME_SIGNATURE_MISMATCH']);
  });
});
