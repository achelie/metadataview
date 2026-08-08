import { describe, expect, it } from 'vitest';
import { tools } from '../../src/content/tools';
import { createMetadataReport } from '../../src/lib/metadata-report/create-report';
import type { FileEvidence } from '../../src/lib/metadata-report/types';
import { parseFile } from '../../src/lib/metadata/parse-file';
import type { SupportedVideoType } from '../../src/lib/metadata/types';
import { videoAdapter } from '../../src/lib/metadata/video-adapter';
import { videoFixture, videoMime } from '../fixtures/video';

const videoTypes: SupportedVideoType[] = ['mp4', 'mov', 'mkv', 'webm', 'avi', 'flv', '3gp', '3g2'];
const evidence: FileEvidence = { sha256: 'a'.repeat(64), md5: 'b'.repeat(32), headerBytes: [], headerHex: '', headerAscii: '' };

describe('multi-format video metadata', () => {
  it('exposes every promised video type through the shared page and universal viewer', () => {
    expect(videoTypes.every((type) => videoAdapter.supports(type))).toBe(true);
    expect(tools.video?.allowedTypes).toEqual(videoTypes);
    expect(tools.video?.formats).toContain('M4V');
    expect(tools.video?.formats).toContain('3G2');
    expect(tools.metadata?.allowedTypes).toEqual(expect.arrayContaining(videoTypes));
    expect(tools.metadata?.accept).toContain('.webm');
  });

  it.each(videoTypes)('parses a real %s container locally', async (type) => {
    const bytes = videoFixture(type);
    const file = new File([bytes.buffer as ArrayBuffer], `fixture.${type}`, { type: videoMime(type) });
    const parsed = await parseFile(file, [type]);
    expect(parsed.category).toBe('video');
    expect(parsed.file.detectedType).toBe(type);
    expect(parsed.normalized.Container).toBeTruthy();
    const report = createMetadataReport(parsed, evidence);
    expect(report.facts).toContainEqual(expect.objectContaining({ id: 'format', value: type.toUpperCase() }));
    expect(JSON.stringify(report)).not.toContain('video bytes');
  });

  it('maps M4V to its MP4 container parser without rejecting the extension', async () => {
    const bytes = videoFixture('m4v');
    const parsed = await parseFile(new File([bytes.buffer as ArrayBuffer], 'fixture.m4v', { type: videoMime('m4v') }), ['mp4']);
    expect(parsed.category).toBe('video');
    expect(parsed.file.detectedType).toBe('mp4');
    expect(parsed.file.extension).toBe('m4v');
  });

  it('extracts useful bounded facts before the ExifTool deep scan', async () => {
    const avi = await parseFile(new File([videoFixture('avi').buffer as ArrayBuffer], 'fixture.avi', { type: videoMime('avi') }), ['avi']);
    expect(avi.normalized).toMatchObject({ Width: 640, Height: 360, Codec: 'H264', TrackCount: 1 });
    expect(Number(avi.normalized.Duration)).toBeCloseTo(10);

    const webm = await parseFile(new File([videoFixture('webm').buffer as ArrayBuffer], 'fixture.webm', { type: videoMime('webm') }), ['webm']);
    expect(webm.normalized).toMatchObject({ Width: 1280, Height: 720, Codec: 'V_VP9', TrackCount: 1 });

    const flv = await parseFile(new File([videoFixture('flv').buffer as ArrayBuffer], 'fixture.flv', { type: videoMime('flv') }), ['flv']);
    expect(flv.normalized).toMatchObject({ Width: 1280, Height: 720, Duration: 12.5, Encoder: 'Fixture Encoder' });
  });
});
