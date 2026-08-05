import { describe, expect, it } from 'vitest';
import { parseWebpContainer } from '../../src/lib/metadata/webp-container';

function riffChunk(type: string, data: Uint8Array): Uint8Array {
  const output = new Uint8Array(8 + data.length + (data.length % 2));
  output.set(new TextEncoder().encode(type), 0); new DataView(output.buffer).setUint32(4, data.length, true); output.set(data, 8); return output;
}
function webp(...chunks: Uint8Array[]): Uint8Array {
  const size = 12 + chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(size); output.set(new TextEncoder().encode('RIFF'), 0); new DataView(output.buffer).setUint32(4, size - 8, true); output.set(new TextEncoder().encode('WEBP'), 8);
  let offset = 12; for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.length; } return output;
}
function vp8x(flags = 0): Uint8Array { const data = new Uint8Array(10); data[0] = flags; data.set([0x63, 0, 0, 0x31, 0, 0], 4); return riffChunk('VP8X', data); }

describe('WebP RIFF container parser', () => {
  it('reads VP8X canvas dimensions', () => expect(parseWebpContainer(webp(vp8x()))).toMatchObject({ width: 100, height: 50 }));
  it('reads EXIF, XMP, ICC, alpha, and animation flags', () => expect(parseWebpContainer(webp(vp8x(0x3e)))).toMatchObject({ hasExif: true, hasXmp: true, hasIcc: true, hasAlpha: true, animated: true }));
  it('detects flags from actual chunks without VP8X declarations', () => expect(parseWebpContainer(webp(riffChunk('EXIF', new Uint8Array()), riffChunk('ICCP', new Uint8Array()), riffChunk('ALPH', new Uint8Array()), riffChunk('ANIM', new Uint8Array())))).toMatchObject({ hasExif: true, hasIcc: true, hasAlpha: true, animated: true }));
  it('decodes a readable XMP packet', () => expect(parseWebpContainer(webp(riffChunk('XMP ', new TextEncoder().encode('<x:xmpmeta/>')))).xmp).toBe('<x:xmpmeta/>'));
  it('honors odd-byte RIFF padding', () => expect(parseWebpContainer(webp(riffChunk('JUNK', Uint8Array.of(1)), riffChunk('EXIF', new Uint8Array()))).chunks).toHaveLength(2));
  it('rejects a fake WebP signature', () => expect(() => parseWebpContainer(new TextEncoder().encode('not a webp'))).toThrow(/valid WebP/i));
  it('rejects chunks beyond the file boundary', () => { const bytes = webp(riffChunk('EXIF', new Uint8Array())); new DataView(bytes.buffer).setUint32(16, 999, true); expect(() => parseWebpContainer(bytes)).toThrow(/boundary/i); });
});
