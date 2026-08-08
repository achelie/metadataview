import { describe, expect, it } from 'vitest';
import { tools } from '../../src/content/tools';
import { createMetadataReport } from '../../src/lib/metadata-report/create-report';
import type { FileEvidence } from '../../src/lib/metadata-report/types';
import { parseGifContainer } from '../../src/lib/metadata/gif-container';
import { parseHeicContainer } from '../../src/lib/metadata/heic-container';
import { imageAdapter } from '../../src/lib/metadata/image-adapter';
import { parseFile } from '../../src/lib/metadata/parse-file';
import { parseTiffContainer } from '../../src/lib/metadata/tiff-container';
import type { SupportedImageType } from '../../src/lib/metadata/types';
import { additionalImageFixture, additionalImageMime, gifFixture, heicFixture, tiffFixture, type AdditionalImageFixtureType } from '../fixtures/images';

const imageTypes: SupportedImageType[] = ['png', 'jpeg', 'webp', 'heic', 'tiff', 'gif'];
const evidence: FileEvidence = { sha256: 'a'.repeat(64), md5: 'b'.repeat(32), headerBytes: [], headerHex: '', headerAscii: '' };

describe('expanded image metadata support', () => {
  it('exposes all six image families through the image page and universal viewer', () => {
    expect(imageTypes.every((type) => imageAdapter.supports(type))).toBe(true);
    expect(tools.image?.allowedTypes).toEqual(imageTypes);
    expect(tools.image?.formats).toBe('PNG · JPG / JPEG · WebP · HEIC · TIFF · GIF');
    expect(tools.metadata?.allowedTypes).toEqual(expect.arrayContaining(imageTypes));
    expect(tools.metadata?.accept).toContain('.heic');
    expect(tools.metadata?.accept).toContain('.tiff');
    expect(tools.metadata?.accept).toContain('.gif');
  });

  it('reads bounded HEIC spatial properties and brands', () => {
    expect(parseHeicContainer(heicFixture(4032, 3024))).toMatchObject({ majorBrand: 'heic', width: 4032, height: 3024, spatialProperties: 1 });
  });

  it('reads TIFF byte order, IFDs, and dimensions', () => {
    expect(parseTiffContainer(tiffFixture(600, 400))).toMatchObject({ byteOrder: 'little-endian', width: 600, height: 400, ifdCount: 1, hasExif: true });
  });

  it('reads GIF comments, frames, looping, and animation', () => {
    const parsed = parseGifContainer(gifFixture({ comment: 'Contact sheet', animated: true }));
    expect(parsed).toMatchObject({ width: 1, height: 1, frameCount: 2, animated: true, loopCount: 0, comments: ['Contact sheet'] });
  });

  it.each(['heic', 'tiff', 'gif'] as AdditionalImageFixtureType[])('builds an immediate %s image report before ExifTool completes', async (type) => {
    const bytes = additionalImageFixture(type);
    const parsed = await parseFile(new File([bytes.buffer as ArrayBuffer], `fixture.${type}`, { type: additionalImageMime(type) }), [type]);
    expect(parsed.category).toBe('image');
    expect(parsed.file.detectedType).toBe(type);
    const report = createMetadataReport(parsed, evidence);
    expect(report.facts).toContainEqual(expect.objectContaining({ id: 'format', value: type.toUpperCase() }));
    expect(report.facts).toContainEqual(expect.objectContaining({ id: 'dimensions' }));
    expect(JSON.stringify(report)).not.toContain('Blob');
  });
});
