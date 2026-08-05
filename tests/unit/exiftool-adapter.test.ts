import { describe, expect, it } from 'vitest';
import {
  adaptExifToolOutput,
  buildExifToolArgs,
  createExifToolVirtualName,
  mergeExifToolInspection,
  recordExifToolFailure,
} from '../../src/lib/metadata-report/exiftool-adapter';
import { createMetadataReport } from '../../src/lib/metadata-report/create-report';
import type { FileEvidence } from '../../src/lib/metadata-report/types';
import type { ParsedMetadata } from '../../src/lib/metadata/types';

const evidence: FileEvidence = { sha256: 'a'.repeat(64), md5: 'b'.repeat(32), headerBytes: [0xff, 0xd8], headerHex: '0000  ff d8', headerAscii: '..' };

function coreReport() {
  const parsed: ParsedMetadata = {
    file: { name: 'camera.jpg', safeName: 'camera', size: 10, mime: 'image/jpeg', detectedType: 'jpeg', extension: 'jpg' },
    category: 'image',
    sections: [{ id: 'camera', title: 'Camera & lens', items: [{ key: 'Model', value: 'Pocket One', path: 'exif.ifd0.Model', source: 'EXIF' }] }],
    normalized: { Width: 1279, Height: 1704 },
    raw: { exif: { ifd0: { Model: 'Pocket One', Artist: 'Parser author' } }, jpeg: { markerCount: 8 } },
    warnings: [],
  };
  return createMetadataReport(parsed, evidence, '2026-08-03T00:00:00.000Z');
}

const exifToolJson = [{
  'Copy1:Main:ExifTool:ExifToolVersion': { id: 1, val: 13.5, desc: 'ExifTool Version Number', num: 13.5 },
  'Copy1:Main:JFIF:JFIFVersion': { id: 0, val: '1.01', desc: 'JFIF Version', num: 1.01 },
  'Copy1:Main:ICC_Profile:ProfileDescription': { id: 'desc', val: 'Display P3', desc: 'Profile Description' },
  'Copy1:Main:ICC_Profile:RedTRC': { id: 'rTRC', val: '(Binary data 32 bytes, use -b option to extract)', desc: 'Red Tone Reproduction Curve' },
  'Copy1:Main:IFD0:Model': { id: 272, val: 'Pocket Two', desc: 'Camera Model Name' },
  'Copy1:Main:IFD0:Artist': { id: 315, val: 'ExifTool author', desc: 'Artist' },
  'Copy1:Main:JPEG:ImageWidth': { id: 1, val: 1279, desc: 'Image Width', num: 1279, fmt: 'int16u' },
  'Copy1:Main:JPEG:ImageHeight': { id: 3, val: 1704, desc: 'Image Height', num: 1704, fmt: 'int16u' },
}];

describe('ExifTool command and adapter', () => {
  it('builds the fixed standard command and adds the expensive embedded flag only on demand', () => {
    const standard = buildExifToolArgs('standard');
    expect(standard).toContain('-G4:3:1');
    expect(standard).toContain('RequestAll=3');
    expect(standard).not.toContain('-ee3');
    expect(buildExifToolArgs('embedded')[1]).toBe('-ee3');
  });

  it('creates a safe virtual filename while retaining the detected extension', () => {
    expect(createExifToolVirtualName('../../private <shot>.JPG')).toBe('private-shot.jpg');
  });

  it('retains descriptions, IDs, raw numbers, formats, groups, and binary summaries', () => {
    const inspection = adaptExifToolOutput(exifToolJson, 'standard');
    expect(inspection.version).toBe('13.5');
    expect(inspection.fields.find((field) => field.key === 'JFIFVersion')).toMatchObject({
      label: 'JFIF Version', tagId: 0, numericValue: 1.01, groupPath: 'Copy1:Main:JFIF', origin: 'exiftool',
    });
    expect(inspection.fields.find((field) => field.key === 'RedTRC')?.binarySummary?.bytes).toBe(32);
    expect(inspection.fields.find((field) => field.key === 'ImageWidth')?.format).toBe('int16u');
  });
});

describe('ExifTool report merge', () => {
  it('makes ExifTool authoritative, keeps conflicts as alternates, and adds readable ICC/encoding sections', () => {
    const merged = mergeExifToolInspection(coreReport(), adaptExifToolOutput(exifToolJson, 'standard'));
    expect(merged.schemaVersion).toBe('1.1');
    expect(merged.engines.find((engine) => engine.id === 'exiftool')).toMatchObject({ status: 'complete', mode: 'standard', fieldCount: 8 });
    expect(merged.nativeSections[0]?.title).toBe('File');
    expect(merged.nativeSections.some((section) => section.title === 'JFIF')).toBe(true);
    expect(merged.nativeSections.some((section) => section.title === 'ICC color profile')).toBe(true);
    const model = merged.nativeSections.flatMap((section) => section.fields).find((field) => field.key === 'Model' && field.origin === 'exiftool');
    expect(model?.alternates?.[0]).toMatchObject({ origin: 'parser', displayValue: 'Pocket One' });
    expect(merged.readableSections.some((section) => section.title === 'Color profile')).toBe(true);
    expect(merged.readableSections.some((section) => section.title === 'Image encoding')).toBe(true);
    expect(merged.facts).toContainEqual({ id: 'color-profile', label: 'Color profile', value: 'Display P3' });
    expect(JSON.stringify(merged.raw)).not.toContain('ArrayBuffer');
  });

  it('records a non-destructive failure and preserves a completed standard scan when embedded scanning fails', () => {
    const standard = mergeExifToolInspection(coreReport(), adaptExifToolOutput(exifToolJson, 'standard'));
    const failed = recordExifToolFailure(standard, 'Embedded scan stopped', 'embedded');
    expect(failed.engines.find((engine) => engine.id === 'exiftool')?.status).toBe('complete');
    expect(failed.nativeSections).toEqual(standard.nativeSections);
    expect(failed.warnings.at(-1)).toMatchObject({ code: 'EXIFTOOL_EMBEDDED_SCAN_FAILED' });
  });
});
