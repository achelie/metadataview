import { describe, expect, it } from 'vitest';
import { createMetadataReport } from '../../src/lib/metadata-report/create-report';
import { audioAdapter } from '../../src/lib/metadata/audio-adapter';
import { parseFile } from '../../src/lib/metadata/parse-file';
import { tools } from '../../src/content/tools';
import type { FileEvidence } from '../../src/lib/metadata-report/types';
import type { SupportedAudioType } from '../../src/lib/metadata/types';
import { aacFixture, flacFixture, m4aFixture, oggFixture, opusFixture, wavFixture, wmaFixture } from '../fixtures/audio';

const audioTypes: SupportedAudioType[] = ['mp3', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wav', 'wma'];
const evidence: FileEvidence = { sha256: 'a'.repeat(64), md5: 'b'.repeat(32), headerBytes: [], headerHex: '', headerAscii: '' };

describe('multi-format audio metadata', () => {
  it('exposes every promised audio type through the shared page and universal viewer', () => {
    expect(audioTypes.every((type) => audioAdapter.supports(type))).toBe(true);
    expect(tools.audio?.allowedTypes).toEqual(audioTypes);
    expect(tools.audio?.formats).toContain('OGA');
    expect(tools.metadata?.allowedTypes).toEqual(expect.arrayContaining(audioTypes));
    expect(tools.metadata?.accept).toContain('.wma');
  });

  it.each([
    ['flac', flacFixture(), 'audio/flac', 'FLAC'],
    ['ogg', oggFixture(), 'audio/ogg', 'Vorbis I'],
    ['opus', opusFixture(), 'audio/opus', 'Opus'],
    ['wav', wavFixture(), 'audio/wav', 'PCM'],
  ] as const)('parses a real %s container locally', async (type, bytes, mime, codec) => {
    const file = new File([bytes.buffer as ArrayBuffer], `fixture.${type}`, { type: mime });
    const parsed = await parseFile(file, [type]);
    expect(parsed.category).toBe('audio');
    expect(String(parsed.normalized.Codec)).toContain(codec);
    const report = createMetadataReport(parsed, evidence);
    expect(report.facts).toContainEqual(expect.objectContaining({ id: 'audio-codec' }));
    expect(JSON.stringify(report)).not.toContain('PRODUCTION-BODY');
  });

  it.each([
    ['m4a', m4aFixture(), 'audio/mp4'],
    ['aac', aacFixture(), 'audio/aac'],
    ['wma', wmaFixture(), 'audio/x-ms-wma'],
  ] as const)('accepts a structurally minimal %s container without falling through to another adapter', async (type, bytes, mime) => {
    const parsed = await parseFile(new File([bytes.buffer as ArrayBuffer], `fixture.${type}`, { type: mime }), [type]);
    expect(parsed.category).toBe('audio');
    expect(parsed.file.detectedType).toBe(type);
  });
});
