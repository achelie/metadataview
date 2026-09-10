import { describe, expect, it } from 'vitest';
import { compareRemovalReports, createRemovalBaseline, isEligibleField, isEnvironmentField, isPreservedField, likelyCleanupEngine } from '../../src/lib/metadata-removal/policy';
import { createCleanupReceipt } from '../../src/lib/metadata-removal/receipt';
import { cleanupScanResult } from '../../src/lib/metadata-removal/verification';
import type { MetadataReport, MetadataReportField } from '../../src/lib/metadata-report/types';

function field(key: string, value: string, overrides: Partial<MetadataReportField> = {}): MetadataReportField {
  return {
    id: key, key, label: key, path: `EXIF.${key}`, source: 'EXIF', value, displayValue: value,
    sensitive: false, searchValue: `${key} ${value}`.toLowerCase(), origin: 'exiftool', ...overrides,
  };
}

function report(fields: MetadataReportField[], type: MetadataReport['file']['detectedType'] = 'jpeg'): MetadataReport {
  return {
    schemaVersion: '1.1', generatedAt: '2026-08-08T00:00:00.000Z', category: type === 'pdf' ? 'pdf' : 'image',
    file: { name: `sample.${type}`, safeName: 'sample', size: 200, mime: 'application/octet-stream', detectedType: type, extension: type },
    facts: [], readableSections: [], nativeSections: [{ id: 'native', title: 'All fields', note: '', fields }], warnings: [],
    evidence: { sha256: 'a'.repeat(64), md5: 'b'.repeat(32), headerBytes: [], headerHex: '', headerAscii: '' },
    engines: [], sourceStats: [], normalized: {}, raw: {},
  };
}

describe('metadata removal policy', () => {
  it('reports private fields even when their names contain structural or runtime words', () => {
    const fields = ['Keywords', 'OriginalFileName', 'CameraOwnerName', 'CustomPageAuthor'].map((key) => field(key, 'private', { path: `XMP.${key}`, groupPath: 'XMP', sensitive: true }));
    for (const item of fields) {
      expect(isEnvironmentField(item)).toBe(false);
      expect(isPreservedField(item)).toBe(false);
      expect(isEligibleField(item)).toBe(true);
    }
    expect(compareRemovalReports(report(fields), report(fields)).residual).toHaveLength(4);
    expect(compareRemovalReports(report(fields), report([])).removed).toHaveLength(4);
    expect(isPreservedField(field('Words', '200'))).toBe(true);
    expect(isPreservedField(field('Orientation', '6', { sensitive: true }))).toBe(true);
    expect(isPreservedField(field('ProfileCopyright', 'Owner', { groupPath: 'ICC_Profile', sensitive: true }))).toBe(true);
    expect(isEnvironmentField(field('FileName', 'private', { groupPath: 'XMP' }))).toBe(false);
  });

  it('never accepts a truncated or partial scan as complete', () => {
    const base = report([]);
    base.engines = [{ id: 'exiftool', label: 'ExifTool', mode: 'embedded', status: 'complete', fieldCount: 20_000, truncated: false }];
    expect(cleanupScanResult(base).complete).toBe(true);
    const truncated = { ...base, engines: [{ ...base.engines[0]!, truncated: true }] };
    expect(cleanupScanResult(truncated)).toMatchObject({ complete: false, warning: expect.any(String) });
    expect(cleanupScanResult({ ...base, warnings: [{ code: 'METADATA_PARTIAL', message: 'Unread EXIF' }] }).complete).toBe(false);
    expect(cleanupScanResult({ ...base, warnings: [{ code: 'EXIFTOOL_FIELD_LIMIT', message: 'Limited' }] }).complete).toBe(false);
    expect(cleanupScanResult({ ...base, warnings: [{ code: 'EXTENSION_SIGNATURE_MISMATCH', message: 'Renamed file' }] }).complete).toBe(true);
    expect(cleanupScanResult(report([])).complete).toBe(false);
  });
  it('excludes host/runtime evidence and keeps technical structure out of cleanup scoring', () => {
    const host = field('FileModifyDate', '2026:08:08 10:30:00', { path: 'System.FileModifyDate', source: 'System', groupPath: 'System' });
    const width = field('ImageWidth', '1920');
    const gps = field('GPSLatitude', '31.2304', { sensitive: true });
    expect(isEnvironmentField(host)).toBe(true);
    expect(isEligibleField(host)).toBe(false);
    expect(isPreservedField(width)).toBe(true);
    expect(isEligibleField(width)).toBe(false);
    expect(isEligibleField(gps)).toBe(true);
  });

  it('routes all supported families to their intended cleanup engine', () => {
    expect(likelyCleanupEngine('heic')).toBe('exiftool');
    expect(likelyCleanupEngine('mkv')).toBe('taglib');
    expect(likelyCleanupEngine('wav')).toBe('taglib');
    expect(likelyCleanupEngine('docx')).toBe('ooxml-zip');
    expect(likelyCleanupEngine('pdf')).toBe('qpdf');
    expect(likelyCleanupEngine('avi')).toBe('riff');
    expect(likelyCleanupEngine('flv')).toBe('flv-amf');
  });

  it('detects signatures before allowing a metadata-changing copy', () => {
    const baseline = createRemovalBaseline(report([field('C2PA Manifest', 'signed assertion')]), 'exiftool');
    expect(baseline.signed).toBe(true);
  });

  it('compares the same semantic fields and masks sensitive receipt evidence', () => {
    const before = report([
      field('Artist', 'Ada Lovelace'),
      field('Email', 'ada@example.test', { sensitive: true }),
      field('ImageWidth', '1920'),
    ]);
    const after = report([field('ImageWidth', '1920')]);
    const diff = compareRemovalReports(before, after);
    expect(diff.removed.map((item) => item.label)).toEqual(expect.arrayContaining(['Artist', 'Email']));
    expect(diff.removed.find((item) => item.label === 'Email')?.displayValue).toBe('a***@example.test');
    expect(diff.preserved.some((item) => item.label === 'ImageWidth')).toBe(true);

    const receipt = createCleanupReceipt({
      blob: new Blob(['clean']), fileName: 'sample-clean.jpg', mime: 'image/jpeg', engine: 'exiftool', status: 'verified',
      beforeSize: 200, afterSize: 120, removed: diff.removed, preserved: diff.preserved, residual: [],
      checks: [{ id: 'signature', label: 'File signature', status: 'passed', message: 'Still JPEG.' }], warnings: [],
    }, { name: 'sample', type: 'jpeg', size: 200 });
    expect(receipt).not.toHaveProperty('blob');
    expect(JSON.stringify(receipt)).not.toContain('Ada Lovelace');
  });
});
