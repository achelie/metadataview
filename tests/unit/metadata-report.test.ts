import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createMetadataReport } from '../../src/lib/metadata-report/create-report';
import { createSafeReportExport } from '../../src/lib/metadata-report/safe-export';
import { computeFileEvidence } from '../../src/lib/metadata-report/evidence';
import { flattenNativeFields } from '../../src/lib/metadata-report/flatten';
import { buildPdfReportContent, createMetadataReportPdfBytes } from '../../src/lib/metadata-report/pdf-export';
import type { FileEvidence, MetadataReport } from '../../src/lib/metadata-report/types';
import type { ParsedMetadata } from '../../src/lib/metadata/types';
import { sanitizeFilename } from '../../src/lib/metadata/utils';
import { parseFile } from '../../src/lib/metadata/parse-file';
import { tinyPng } from './fixtures';

const evidence: FileEvidence = { sha256: 'a'.repeat(64), md5: 'b'.repeat(32), headerBytes: [0xff, 0xd8], headerHex: '0000  ff d8', headerAscii: '..' };

function parsed(category: ParsedMetadata['category'] = 'image'): ParsedMetadata {
  return {
    file: {
      name: 'camera <test>.jpg', safeName: 'camera-test', size: 2_048, mime: 'image/jpeg', detectedType: 'jpeg', extension: 'jpg',
      ...(category === 'image' ? { width: 640, height: 480, megapixels: .307, actualFormat: 'jpeg' } : {}),
    },
    category,
    sections: [{ id: 'camera', title: 'Camera & lens', items: [{ key: 'Model', label: 'Camera model', path: 'exif.ifd0.Model', source: 'EXIF', value: 'Pocket One', sensitive: false }] }],
    normalized: category === 'pdf' ? { PageCount: 4, PDFVersion: '1.7' } : { Width: 640, Height: 480 },
    raw: { exif: { ifd0: { Model: 'Pocket One', SerialNumber: 'ABC-123' } }, thumbnail: new Uint8Array([1, 2, 3]) },
    warnings: [{ code: 'TEST_NOTE', message: 'Fixture warning' }],
  };
}

describe('native report fields', () => {
  it('flattens native values with exact paths, sources, labels, and sensitivity', () => {
    const sections = flattenNativeFields({ exif: { ifd0: { Model: 'Pocket One', SerialNumber: 'ABC-123' } }, xmp: { creator: ['Ada', 'Lin'] } });
    const fields = sections.flatMap((section) => section.fields);
    expect(fields.find((field) => field.path === 'exif.ifd0.Model')).toMatchObject({ key: 'Model', label: 'Model', source: 'EXIF', displayValue: 'Pocket One' });
    expect(fields.find((field) => field.path === 'exif.ifd0.SerialNumber')?.sensitive).toBe(true);
    expect(fields.map((field) => field.path)).toContain('xmp.creator[1]');
  });

  it('deduplicates identical path/value pairs and respects field limits', () => {
    const fields = flattenNativeFields({ native: { a: 1, b: 2, c: 3 } }, { maxFields: 2 }).flatMap((section) => section.fields);
    expect(fields).toHaveLength(2);
    expect(fields[0]?.id).not.toBe(fields[1]?.id);
  });

  it('summarizes binary values rather than exporting bytes', () => {
    const value = flattenNativeFields({ preview: new Uint8Array(512) }).flatMap((section) => section.fields)[0];
    expect(value?.displayValue).toContain('Binary data omitted');
    expect(value?.displayValue).toContain('512 bytes');
  });
});

describe('file evidence', () => {
  it('matches the standard empty and abc hash vectors', async () => {
    const empty = await computeFileEvidence(new Blob([]));
    const abc = await computeFileEvidence(new Blob(['abc']));
    expect(empty.sha256).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(empty.md5).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(abc.sha256).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(abc.md5).toBe('900150983cd24fb0d6963f7d28e17f72');
  });

  it('handles stream chunk boundaries and keeps exactly 256 header bytes', async () => {
    const bytes = new Uint8Array(70_123).map((_, index) => index % 251);
    const result = await computeFileEvidence(new Blob([bytes]));
    expect(result.sha256).toBe(createHash('sha256').update(bytes).digest('hex'));
    expect(result.md5).toBe(createHash('md5').update(bytes).digest('hex'));
    expect(result.headerBytes).toEqual(Array.from(bytes.slice(0, 256)));
    expect(result.headerHex.split('\n')).toHaveLength(16);
  });
});

describe('canonical metadata report', () => {
  it('builds a finite native report from a real parsed PNG', async () => {
    const bytes = tinyPng();
    const metadata = await parseFile(new File([bytes.buffer as ArrayBuffer], 'tiny.png', { type: 'image/png' }), ['png']);
    const report = createMetadataReport(metadata, evidence);
    expect(report.nativeSections.flatMap((section) => section.fields).length).toBeGreaterThan(0);
  });
  it('adapts readable and native image data without losing path or source', () => {
    const report = createMetadataReport(parsed(), evidence, '2026-08-03T00:00:00.000Z');
    expect(report.facts.map((fact) => fact.value)).toContain('640 × 480 px');
    expect(report.readableSections[0]?.fields[0]).toMatchObject({ path: 'exif.ifd0.Model', source: 'EXIF', value: 'Pocket One' });
    expect(report.nativeSections.flatMap((section) => section.fields).map((field) => field.path)).toContain('exif.ifd0.SerialNumber');
  });

  it('adds category-specific summary facts', () => {
    expect(createMetadataReport(parsed('pdf'), evidence).facts).toContainEqual({ id: 'pages', label: 'Pages', value: '4' });
  });

  it('exports only the safe canonical model, never file/blob/preview state', () => {
    const exported = createSafeReportExport(createMetadataReport(parsed(), evidence));
    const json = JSON.stringify(exported);
    expect(json).toContain('rawMetadata');
    expect(json).not.toContain('blob:');
    expect(json).not.toContain('previewUrl');
    expect(json).not.toContain('worker');
    expect(json).not.toContain('1,2,3');
  });

  it('sanitizes report filenames', () => {
    expect(sanitizeFilename('../../My private <shot>.jpg', '-metadata-report.json')).toBe('My-private-shot-metadata-report.json');
  });
});

describe('PDF report', () => {
  it('creates a PDF signature locally', async () => {
    const report = createMetadataReport(parsed(), evidence);
    const bytes = await createMetadataReportPdfBytes(report);
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-');
  });

  it('marks long and oversized native data as truncated and points to JSON', () => {
    const report = createMetadataReport(parsed(), evidence) as MetadataReport;
    report.readableSections[0]!.fields[0]!.displayValue = 'x'.repeat(1_500);
    report.nativeSections = [{ ...report.nativeSections[0]!, fields: Array.from({ length: 245 }, (_, index) => ({ ...report.nativeSections[0]!.fields[0]!, id: `native-${index}`, path: `native.field${index}` })) }];
    const content = buildPdfReportContent(report);
    expect(content.truncated).toBe(true);
    expect(content.omittedNativeFields).toBe(5);
    expect(content.lines.some((line) => line.text.includes('complete JSON report'))).toBe(true);
  });
});
