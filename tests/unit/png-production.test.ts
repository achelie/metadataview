import { deflate } from 'pako';
import { describe, expect, it } from 'vitest';
import { parsePngChunks } from '../../src/lib/metadata/png-chunks';
import { baseChunks, chunk, concat } from './fixtures';

const encoder = new TextEncoder();

describe('production PNG metadata behavior', () => {
  it('reports alpha from color type 6', () => expect(parsePngChunks(baseChunks([], 6)).alpha).toBe(true));
  it('reports no alpha from color type 2', () => expect(parsePngChunks(baseChunks([], 2)).alpha).toBe(false));
  it('reports transparency from tRNS', () => expect(parsePngChunks(baseChunks([chunk('tRNS', Uint8Array.of(0))], 2)).alpha).toBe(true));
  it('detects PNG eXIf chunks', () => expect(parsePngChunks(baseChunks([chunk('eXIf', Uint8Array.of(1, 2, 3))])).hasExif).toBe(true));
  it('detects APNG animation control and frame chunks', () => expect(parsePngChunks(baseChunks([chunk('acTL', new Uint8Array(8)), chunk('fcTL', new Uint8Array(26))])).animated).toBe(true));
  it('detects Adobe XMP in iTXt', () => { const data = concat(encoder.encode('XML:com.adobe.xmp'), Uint8Array.of(0,0,0,0,0), encoder.encode('<xmp/>')); expect(parsePngChunks(baseChunks([chunk('iTXt', data)])).hasXmp).toBe(true); });
  it('reads an ICC profile name and inflated byte count', () => { const data = concat(encoder.encode('Display P3'), Uint8Array.of(0,0), deflate(encoder.encode('profile'))); expect(parsePngChunks(baseChunks([chunk('iCCP', data)]))).toMatchObject({ hasIcc: true, iccProfileName: 'Display P3', iccProfileBytes: 7 }); });
  it('skips one malformed zTXt chunk but reads a later tEXt chunk', () => {
    const bad = chunk('zTXt', concat(encoder.encode('bad'), Uint8Array.of(0,0,1,2,3)));
    const good = chunk('tEXt', concat(encoder.encode('Artist'), Uint8Array.of(0), encoder.encode('Ada')));
    const result = parsePngChunks(baseChunks([bad, good]));
    expect(result.textChunks).toHaveLength(1); expect(result.textChunks[0]?.text).toBe('Ada'); expect(result.warnings).toHaveLength(1);
  });
  it('rejects a missing IEND marker', () => { const full = baseChunks([]); expect(() => parsePngChunks(full.subarray(0, full.length - 12))).toThrow(/IEND/i); });
  it('rejects an invalid PNG signature', () => expect(() => parsePngChunks(new Uint8Array(20))).toThrow(/valid PNG/i));
});
