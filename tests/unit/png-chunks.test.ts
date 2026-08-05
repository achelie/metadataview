import { describe, expect, it } from 'vitest';
import { parsePngChunks } from '../../src/lib/metadata/png-chunks';
import { chunk, pngWithText, tinyPng } from './fixtures';

describe('PNG chunk parser', () => {
  it.each(['tEXt', 'iTXt', 'zTXt'] as const)('reads %s metadata', (type) => {
    const result = parsePngChunks(pngWithText(type, 'parameters', 'Steps: 20'));
    expect(result.textChunks[0]).toMatchObject({ type, keyword: 'parameters', text: 'Steps: 20' });
  });
  it('rejects a chunk that runs beyond the file boundary', () => {
    const bytes = tinyPng();
    const broken = new Uint8Array(bytes);
    new DataView(broken.buffer).setUint32(8, 0xfffffff0, false);
    expect(() => parsePngChunks(broken)).toThrow(/boundary/i);
  });
  it('skips an oversized text chunk and keeps the structurally valid image', () => {
    const text = chunk('tEXt', new TextEncoder().encode('key\0value'));
    const png = pngWithText('tEXt', 'ok', 'ok');
    const start = 8 + 12 + 13;
    const mutated = new Uint8Array(png.length - (png.length - start) + text.length + 12);
    mutated.set(png.subarray(0, start)); mutated.set(text, start); mutated.set(chunk('IEND'), start + text.length);
    const result = parsePngChunks(mutated, 3);
    expect(result.textChunks).toHaveLength(0);
    expect(result.warnings[0]).toMatchObject({ code: 'PNG_CHUNK_TOO_LARGE' });
  });
});
