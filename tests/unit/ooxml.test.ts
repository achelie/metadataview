import { describe, expect, it } from 'vitest';
import { detectFileType } from '../../src/lib/metadata/detect-file-type';
import { MetadataError } from '../../src/lib/metadata/errors';
import { parseFile } from '../../src/lib/metadata/parse-file';
import { createMetadataReport } from '../../src/lib/metadata-report/create-report';
import { adaptExifToolOutput, mergeExifToolInspection } from '../../src/lib/metadata-report/exiftool-adapter';
import type { FileEvidence } from '../../src/lib/metadata-report/types';
import { ooxmlFixture, ooxmlMime, plainZipFixture, type OoxmlFixtureType } from '../fixtures/ooxml';

const evidence: FileEvidence = { sha256: 'a'.repeat(64), md5: 'b'.repeat(32), headerBytes: [0x50, 0x4b, 0x03, 0x04], headerHex: '50 4B 03 04', headerAscii: 'PK..' };

function officeFile(bytes: Uint8Array<ArrayBuffer>, name: string, type: OoxmlFixtureType): File {
  return new File([bytes], name, { type: ooxmlMime(type) });
}

describe('Office Open XML metadata', () => {
  it.each(['docx', 'pptx', 'xlsx'] as const)('identifies %s from package content instead of the ZIP signature', async (type) => {
    const file = officeFile(await ooxmlFixture(type), `fixture.${type}`, type);
    const detection = await detectFileType(file);
    expect(detection.type).toBe(type);
    expect(detection.signatureType).toBe('zip');
  });

  it('reads DOCX core, application, custom, and stored document statistics', async () => {
    const bytes = await ooxmlFixture('docx', { title: 'Quarterly notes', author: 'Ada & Grace', customName: 'Client code', customValue: 'NORTH-42' });
    const parsed = await parseFile(officeFile(bytes, 'notes.docx', 'docx'), ['docx']);
    expect(parsed.category).toBe('document');
    expect(parsed.normalized).toMatchObject({ Title: 'Quarterly notes', Author: 'Ada & Grace', Pages: '4', Words: '321', CustomPropertyCount: 1 });
    expect(parsed.sections.map((section) => section.title)).toEqual(['Document properties', 'Application statistics', 'Custom properties', 'Package details']);
    expect(JSON.stringify(parsed.raw)).not.toContain('BODY-CONTENT-MUST-NOT-LEAK');
    expect(parsed.raw.custom).toEqual([{ name: 'Client code', type: 'lpwstr', value: 'NORTH-42', propertyId: '2' }]);
  });

  it('counts PowerPoint slides and notes and Excel worksheets without extracting their text', async () => {
    const pptx = await parseFile(officeFile(await ooxmlFixture('pptx', { slides: 3, notes: 2 }), 'deck.pptx', 'pptx'), ['pptx']);
    const xlsx = await parseFile(officeFile(await ooxmlFixture('xlsx', { worksheets: 4 }), 'book.xlsx', 'xlsx'), ['xlsx']);
    expect(pptx.normalized).toMatchObject({ SlideCount: 3, NotesPageCount: 2 });
    expect(xlsx.normalized).toMatchObject({ WorksheetCount: 4 });
    expect(JSON.stringify([pptx.raw, xlsx.raw])).not.toContain('BODY-CONTENT-MUST-NOT-LEAK');
  });

  it('warns about a misleading extension while keeping the package type authoritative', async () => {
    const bytes = await ooxmlFixture('pptx');
    const file = new File([bytes], 'renamed.docx', { type: ooxmlMime('docx') });
    const detection = await detectFileType(file);
    expect(detection.type).toBe('pptx');
    expect(detection.warnings.map((warning) => warning.code)).toEqual(['EXTENSION_SIGNATURE_MISMATCH', 'MIME_SIGNATURE_MISMATCH']);
  });

  it('rejects plain ZIP files, macro-enabled packages, DTD manifests, oversized property XML, and encrypted/legacy containers', async () => {
    await expect(detectFileType(new File([await plainZipFixture()], 'notes.docx', { type: ooxmlMime('docx') }))).rejects.toMatchObject({ code: 'UNSUPPORTED_OFFICE_FORMAT' });
    await expect(detectFileType(officeFile(await ooxmlFixture('docx', { macroEnabled: true }), 'macro.docx', 'docx'))).rejects.toMatchObject({ code: 'UNSUPPORTED_OFFICE_FORMAT' });
    const dtd = '<!DOCTYPE Types [<!ENTITY x "bad">]><Types></Types>';
    await expect(detectFileType(officeFile(await ooxmlFixture('docx', { contentTypesXml: dtd }), 'entity.docx', 'docx'))).rejects.toMatchObject({ code: 'CORRUPTED_FILE' });
    const hugeApp = `<Properties><Application>${'x'.repeat(2 * 1024 * 1024)}</Application></Properties>`;
    await expect(detectFileType(officeFile(await ooxmlFixture('docx', { appXml: hugeApp }), 'huge.docx', 'docx'))).rejects.toMatchObject({ code: 'OOXML_PACKAGE_LIMIT' });
    const ole = Uint8Array.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0]);
    await expect(detectFileType(new File([ole], 'locked.docx', { type: ooxmlMime('docx') }))).rejects.toMatchObject({ code: 'ENCRYPTED_OFFICE' });
  });

  it('keeps malformed optional property XML out of the report and records a warning', async () => {
    const bytes = await ooxmlFixture('docx', { customXml: '<Properties><property>' });
    const parsed = await parseFile(officeFile(bytes, 'broken-custom.docx', 'docx'), ['docx']);
    expect(parsed.normalized.CustomPropertyCount).toBe(0);
    expect(parsed.warnings.map((warning) => warning.code)).toContain('OOXML_PROPERTY_XML_INVALID');
  });

  it('adds document facts and groups ExifTool OOXML and ZIP fields separately', async () => {
    const parsed = await parseFile(officeFile(await ooxmlFixture('pptx', { slides: 2 }), 'deck.pptx', 'pptx'), ['pptx']);
    const base = createMetadataReport(parsed, evidence, '2026-08-07T00:00:00.000Z');
    expect(base.facts).toEqual(expect.arrayContaining([{ id: 'slides', label: 'Slides', value: '2' }]));
    const inspection = adaptExifToolOutput([{
      'OOXML:Document:Title': { val: 'Deck title', desc: 'Title' },
      'ZIP:Archive:ZipRequiredVersion': { val: 20, desc: 'ZIP Required Version' },
    }], 'standard');
    const merged = mergeExifToolInspection(base, inspection);
    expect(merged.nativeSections.map((section) => section.title)).toEqual(expect.arrayContaining(['Office document', 'ZIP package']));
  });

  it('uses typed metadata errors for unsupported allowed types', async () => {
    const file = officeFile(await ooxmlFixture('xlsx'), 'book.xlsx', 'xlsx');
    await expect(parseFile(file, ['pdf'])).rejects.toBeInstanceOf(MetadataError);
  });
});
