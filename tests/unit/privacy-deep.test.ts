import { describe, expect, it } from 'vitest';
import { PRESERVE_ENCODING_CLEANUP_ARGS, buildPrivacyCleanupDiff, createPrivacyCleanupResult, validateCleanupOutput } from '../../src/lib/image/privacy-cleanup';
import { assertCanvasCleanupSafe } from '../../src/lib/image/remove-metadata';
import type { ImageMetadataField, ImageMetadataGroup, ImageMetadataSection, NormalizedImageMetadata } from '../../src/lib/metadata/types';
import { adaptExifToolOutput } from '../../src/lib/metadata-report/exiftool-adapter';
import { createPrivacyDeepInspection, createPrivacyReport, recordPrivacyScanFailure } from '../../src/lib/privacy/create-privacy-report';
import { createSafeCleanupReceipt, createSafePrivacyExport } from '../../src/lib/privacy/safe-report-export';

function metadata(inputs: Array<{ key: string; value: unknown; group?: ImageMetadataGroup }> = []): NormalizedImageMetadata {
  const groups = new Map<ImageMetadataGroup, ImageMetadataField[]>();
  for (const [index, input] of inputs.entries()) {
    const group = input.group ?? 'privacy';
    const displayValue = typeof input.value === 'string' ? input.value : JSON.stringify(input.value);
    groups.set(group, [...(groups.get(group) ?? []), { id: `${group}-${index}`, key: input.key, label: input.key, path: input.key, value: input.value, displayValue, group, source: 'Quick parser', sensitive: false, searchValue: displayValue }]);
  }
  const sections: ImageMetadataSection[] = [...groups].map(([id, fields]) => ({ id, title: id, note: 'fixture', fields }));
  return {
    file: { name: 'private.jpg', safeName: 'private', size: 1024, mime: 'image/jpeg', detectedType: 'jpeg', extension: 'jpg', declaredMime: 'image/jpeg', actualFormat: 'jpeg', width: 80, height: 60, megapixels: 0.005, aspectRatio: '4:3', animated: false, alpha: false, metadataFieldCount: inputs.length, warningCount: 0, hasEmbeddedMetadata: inputs.length > 0 },
    sections,
    location: { valid: false },
    container: { kind: 'jpeg', hasIcc: false, hasExif: true, hasXmp: false, hasAlpha: false, animated: false },
    raw: {}, warnings: [], legacy: {},
  };
}

describe('deep privacy inspection', () => {
  it('merges ExifTool evidence with exact paths, groups, tag IDs, and a stable score timeline', () => {
    const parsed = metadata([{ key: 'Model', value: 'Pocket Camera', group: 'camera' }]);
    const quick = createPrivacyReport(parsed);
    const inspection = adaptExifToolOutput([{
      'Copy1:Main:IFD0:Model': { id: 272, val: 'Pocket Camera', desc: 'Camera Model' },
      'Copy1:Main:MakerNotes:SerialNumber': { id: 12, val: 'AB123456', desc: 'Body Serial Number' },
      'Copy1:Main:GPS:GPSLatitude': { id: 2, val: 40.7128, num: 40.7128 },
      'Copy1:Main:GPS:GPSLongitude': { id: 4, val: -74.006, num: -74.006 },
    }], 'standard');
    const deep = createPrivacyDeepInspection(parsed, inspection, quick);
    expect(deep.report.version).toBe('1.2');
    expect(deep.report.completeness).toBe('standard');
    expect(deep.report.scoreTimeline.map((item) => item.stage)).toEqual(['quick', 'standard']);
    expect(deep.report.risks.find((risk) => risk.id === 'device-model')).toBeDefined();
    expect(deep.report.risks.find((risk) => risk.id === 'device-identifier')?.fields[0]).toMatchObject({ origin: 'exiftool', groupPath: 'Copy1:Main:MakerNotes', tagId: 12, scanStage: 'standard' });
    expect(deep.report.risks.filter((risk) => risk.id === 'precise-location')).toHaveLength(1);
    expect(JSON.stringify(deep)).not.toContain('rawValue');
  });

  it('recognizes native camera groups and non-ambiguous AI settings without confusing camera Model', () => {
    const parsed = metadata();
    const inspection = adaptExifToolOutput([{
      'Copy1:Main:IFD0:Model': { val: 'Nikon Z8' },
      'Copy1:Main:XMP:Seed': { val: 42, num: 42 },
      'Copy1:Main:XMP:Sampler': { val: 'Euler' },
    }], 'standard');
    const report = createPrivacyDeepInspection(parsed, inspection, createPrivacyReport(parsed)).report;
    expect(report.risks.find((risk) => risk.id === 'device-model')).toBeDefined();
    expect(report.risks.find((risk) => risk.id === 'ai-settings')?.fields.map((field) => field.key)).toEqual(expect.arrayContaining(['Seed', 'Sampler']));
    expect(report.risks.find((risk) => risk.id === 'ai-settings')?.fields.map((field) => field.displayValue)).not.toContain('Nikon Z8');
  });

  it('finds IPTC contact details, XMP people, original filenames, previews, and unknown text tags', () => {
    const parsed = metadata();
    const inspection = adaptExifToolOutput([{
      'Copy1:Main:IPTC:CiEmailWork': { id: 1, val: 'private@example.test' },
      'Copy1:Main:XMP-mwg-rs:RegionPersonDisplayName': { id: 2, val: 'Morgan Lee' },
      'Copy1:Main:XMP:OriginalFileName': { id: 3, val: 'client-launch-secret.jpg' },
      'Copy1:Main:IFD1:ThumbnailImage': { id: 513, val: '(Binary data 8412 bytes, use -b option to extract)' },
      'Copy1:Main:PNG:UncataloguedNote': { id: 5, val: 'Call +1 (212) 555-0100 or use private@example.test' },
    }], 'standard');
    const report = createPrivacyDeepInspection(parsed, inspection, createPrivacyReport(parsed)).report;
    expect(report.risks.map((risk) => risk.id)).toEqual(expect.arrayContaining(['contact-details', 'named-people', 'original-file-reference', 'embedded-thumbnail']));
    const text = JSON.stringify(createSafePrivacyExport(report));
    expect(text).not.toContain('private@example.test');
    expect(text).toContain('pr***@example.test');
  });

  it('deduplicates the same semantic value across parser, EXIF, XMP, and IPTC sources', () => {
    const parsed = metadata([{ key: 'Artist', value: 'Ada', group: 'author' }]);
    const inspection = adaptExifToolOutput([{
      'Copy1:Main:IFD0:Artist': { val: 'Ada' },
      'Copy1:Main:XMP:Creator': { val: 'Ada' },
      'Copy1:Main:IPTC:By-line': { val: 'Ada' },
    }], 'standard');
    const report = createPrivacyDeepInspection(parsed, inspection, createPrivacyReport(parsed)).report;
    expect(report.risks.find((risk) => risk.id === 'creator-identity')?.fields).toHaveLength(1);
  });

  it('stops unknown-text scanning at the two-million-character report budget', () => {
    const parsed = metadata();
    const huge: Record<string, string> = {};
    for (let index = 0; index < 12; index += 1) huge[`Copy1:Main:XMP:Unknown${index}`] = 'x'.repeat(200_000);
    const inspection = adaptExifToolOutput([huge], 'standard');
    const report = createPrivacyDeepInspection(parsed, inspection, createPrivacyReport(parsed)).report;
    expect(report.scanWarnings.join(' ')).toMatch(/2,000,000-character safety budget/);
  });

  it('reads host/runtime fields but excludes them from privacy evidence and scoring', () => {
    const parsed = metadata();
    const inspection = adaptExifToolOutput([{
      'Copy1:Main:System:FileDeviceID': { val: '2052' },
      'Copy1:Main:System:FileModifyDate': { val: '2026:08:05 09:17:42+08:00' },
      'Copy1:Main:ExifTool:NewGUID': { val: '9b26d69b-32c5-a6f2-1f50-748f5227bc77' },
    }], 'standard');
    const deep = createPrivacyDeepInspection(parsed, inspection, createPrivacyReport(parsed));
    expect(deep.report.score).toBe(0);
    expect(deep.report.risks).toEqual([]);
    expect(deep.report.fieldStats).toEqual({ read: 3, eligible: 0, excludedEnvironment: 3 });
  });

  it('does not mistake timestamps, GUIDs, hashes, versions, or dimensions for phone numbers', () => {
    const parsed = metadata();
    const inspection = adaptExifToolOutput([{
      'Copy1:Main:XMP:UnknownTimestamp': { val: '2026:08:05 09:17:42+08:00' },
      'Copy1:Main:XMP:UnknownGuid': { val: '9b26d69b-32c5-a6f2-1f50-748f5227bc77' },
      'Copy1:Main:XMP:UnknownHash': { val: '9b26d69b32c5a6f21f50748f5227bc77' },
      'Copy1:Main:XMP:UnknownVersion': { val: '4.12.2026' },
      'Copy1:Main:XMP:UnknownDimensions': { val: '4096x2160' },
      'Copy1:Main:XMP:UnknownMatrix': { val: '0.9642 1 0.82491' },
    }], 'standard');
    expect(createPrivacyDeepInspection(parsed, inspection, createPrivacyReport(parsed)).report.risks.find((risk) => risk.id === 'contact-details')).toBeUndefined();
  });

  it('scores ICC rights text without treating color math or profile creators as people', () => {
    const parsed = metadata([{ key: 'Profile Creator', value: '\0\0\0\0', group: 'author' }]);
    parsed.sections[0]!.fields[0]!.path = 'icc.Profile Creator';
    parsed.sections[0]!.fields[0]!.source = 'ICC';
    const inspection = adaptExifToolOutput([{
      'Copy1:Main:ICC-header:ConnectionSpaceIlluminant': { id: 68, val: '0.9642 1 0.82491' },
      'Copy1:Main:ICC_Profile:ProfileCopyright': { id: 'cprt', val: 'Google Inc. 2016' },
    }], 'standard');
    const report = createPrivacyDeepInspection(parsed, inspection, createPrivacyReport(parsed)).report;
    expect(report.score).toBe(8);
    expect(report.risks.map((risk) => risk.id)).toEqual(['rights-information']);
    expect(report.fieldStats.excludedEnvironment).toBe(0);
  });

  it('preserves a usable report when a deep scan fails', () => {
    const quick = createPrivacyReport(metadata([{ key: 'Artist', value: 'Ada', group: 'author' }]));
    const failed = recordPrivacyScanFailure(quick, 'standard', 'Engine timeout');
    expect(failed.completeness).toBe('quick');
    expect(failed.engines.find((engine) => engine.id === 'exiftool')).toMatchObject({ status: 'failed', message: 'Engine timeout' });
    expect(failed.scanWarnings[0]).toContain('Engine timeout');
  });
});

describe('privacy cleanup contract', () => {
  it('uses ExifTool removal arguments that restore only orientation, ICC, and required color tags', () => {
    expect(PRESERVE_ENCODING_CLEANUP_ARGS).toEqual(['-all=', '--ICC_Profile:All', '-tagsFromFile', '@', '-ColorSpaceTags', '-Orientation', '-m', '-q', '-q']);
  });

  it('blocks unsafe canvas dimensions before decoding', () => {
    expect(() => assertCanvasCleanupSafe({ width: 20_000, height: 100 })).toThrow(/16,384/);
    expect(() => assertCanvasCleanupSafe({ width: 10_000, height: 5_000 })).toThrow(/40 megapixel/);
    expect(() => assertCanvasCleanupSafe({ width: 8_000, height: 5_000 })).not.toThrow();
  });

  it('blocks download when cleanup changes dimensions or drops animation', () => {
    const source = metadata();
    source.file.animated = true;
    source.container.animated = true;
    source.legacy.Orientation = 6;
    const changed = metadata();
    changed.file.width = 79;
    changed.file.animated = false;
    changed.container.animated = false;
    changed.legacy.Orientation = 1;
    const checks = validateCleanupOutput(source, changed, 'preserve-encoding');
    expect(checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'dimensions', status: 'failed' }),
      expect.objectContaining({ id: 'orientation', status: 'failed' }),
      expect.objectContaining({ id: 'animation', status: 'failed' }),
    ]));
  });

  it('reports removed, remaining, and added risks without claiming an incomplete copy is safe', () => {
    const before = createPrivacyReport(metadata([{ key: 'Artist', value: 'Ada', group: 'author' }, { key: 'Software', value: 'Editor', group: 'software' }]));
    const after = createPrivacyReport(metadata([{ key: 'Software', value: 'Editor', group: 'software' }]));
    const diff = buildPrivacyCleanupDiff(before, after);
    expect(diff.removedRiskIds).toContain('creator-identity');
    expect(diff.remainingRiskIds).toContain('software-information');
    const result = createPrivacyCleanupResult({ mode: 'privacy-first', blob: new Blob(['clean'], { type: 'image/jpeg' }), sourceName: 'private.jpg', sourceSize: 1024, mime: 'image/jpeg', beforeReport: before, afterReport: after, expectedCompleteness: 'standard' });
    expect(result.verificationStatus).toBe('incomplete');
    expect(result.fileName).toBe('private-clean.jpg');
    expect(JSON.stringify(createSafeCleanupReceipt(result))).not.toMatch(/blob|rawValue|ArrayBuffer/i);
  });
});
