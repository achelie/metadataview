import type { PDFFont } from 'pdf-lib';
import type { MetadataReport } from './types';

export interface PdfReportContent {
  lines: Array<{ text: string; bold?: boolean; size?: number }>;
  truncated: boolean;
  omittedNativeFields: number;
}

const MAX_NATIVE_FIELDS = 240;
const MAX_FIELD_CHARS = 1_200;

function oneLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function buildPdfReportContent(report: MetadataReport): PdfReportContent {
  const lines: PdfReportContent['lines'] = [
    { text: `${report.file.name} metadata report`, bold: true, size: 18 },
    { text: `Generated locally ${report.generatedAt}` },
    { text: 'No file bytes, previews, or browser state are included in this report.' },
    { text: '' },
    { text: 'FILE SUMMARY', bold: true, size: 12 },
    ...report.facts.map((fact) => ({ text: `${fact.label}: ${fact.value}` })),
    { text: `SHA-256: ${report.evidence.sha256}` },
    { text: `MD5 (compatibility only): ${report.evidence.md5}` },
    { text: '' },
    { text: 'INSPECTION ENGINES', bold: true, size: 12 },
    ...report.engines.map((engine) => ({ text: `${engine.label}${engine.version ? ` ${engine.version}` : ''}: ${engine.status}, ${engine.mode}, ${engine.fieldCount.toLocaleString('en-US')} fields${engine.truncated ? ' [safe field limit reached]' : ''}${engine.message ? ` - ${oneLine(engine.message)}` : ''}` })),
  ];
  if (report.warnings.length) {
    lines.push({ text: '' }, { text: 'WARNINGS', bold: true, size: 12 });
    report.warnings.forEach((warning) => lines.push({ text: `${warning.code}: ${oneLine(warning.message)}` }));
  }
  lines.push({ text: '' }, { text: 'READABLE METADATA', bold: true, size: 12 });
  let truncated = false;
  for (const section of report.readableSections) {
    lines.push({ text: section.title, bold: true });
    for (const field of section.fields) {
      let value = oneLine(field.displayValue);
      if (value.length > MAX_FIELD_CHARS) { value = `${value.slice(0, MAX_FIELD_CHARS)} [value truncated]`; truncated = true; }
      lines.push({ text: `${field.label}: ${value}` });
    }
  }
  const native = report.nativeSections.flatMap((section) => section.fields.map((field) => ({ section: section.title, field })));
  const shown = native.slice(0, MAX_NATIVE_FIELDS);
  const omittedNativeFields = Math.max(0, native.length - shown.length);
  lines.push({ text: '' }, { text: 'NATIVE FIELD SAMPLE', bold: true, size: 12 });
  let previous = '';
  for (const entry of shown) {
    if (entry.section !== previous) { lines.push({ text: entry.section, bold: true }); previous = entry.section; }
    let value = oneLine(entry.field.displayValue);
    if (value.length > MAX_FIELD_CHARS) { value = `${value.slice(0, MAX_FIELD_CHARS)} [value truncated]`; truncated = true; }
    lines.push({ text: `${entry.field.path}: ${value}` });
  }
  if (omittedNativeFields) truncated = true;
  if (truncated) {
    lines.push(
      { text: '' },
      { text: 'REPORT TRUNCATION NOTE', bold: true, size: 12 },
      { text: `This readable PDF shortens long values and omits ${omittedNativeFields.toLocaleString('en-US')} native fields. Download the complete JSON report for the canonical safe record.` },
    );
  }
  return { lines, truncated, omittedNativeFields };
}

let fontDownload: Promise<Uint8Array> | undefined;
async function loadReportFont(): Promise<Uint8Array> {
  fontDownload ??= fetch('/fonts/NotoSansSC-Regular.ttf', { signal: AbortSignal.timeout(60_000) })
    .then(async (response) => { if (!response.ok) throw new Error('The PDF font could not be loaded. Please retry.'); return new Uint8Array(await response.arrayBuffer()); })
    .catch((error) => { fontDownload = undefined; throw error; });
  return fontDownload;
}

export function wrapPdfText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  if (!text) return [''];
  const lines: string[] = [];
  let line = '';
  for (const character of text) {
    if (line && font.widthOfTextAtSize(line + character, size) > maxWidth) { lines.push(line); line = ''; }
    line += character;
  }
  if (line) lines.push(line);
  return lines;
}

export async function createMetadataReportPdfBytes(report: MetadataReport, fontBytes?: Uint8Array): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const document = await PDFDocument.create();
  let regular = await document.embedFont(StandardFonts.Helvetica);
  let bold = await document.embedFont(StandardFonts.HelveticaBold);
  const content = buildPdfReportContent(report);
  const allText = content.lines.map((line) => line.text).join('');
  const standardCharacters = new Set(regular.getCharacterSet());
  if (Array.from(allText).some((character) => !standardCharacters.has(character.codePointAt(0)!))) {
    const { default: fontkit } = await import('@pdf-lib/fontkit');
    document.registerFontkit(fontkit);
    // fontkit's CJK subsets can extract correctly while rendering missing glyphs.
    // Embed the reviewed static font intact; only non-WinAnsi exports load it.
    regular = await document.embedFont(fontBytes ?? await loadReportFont(), { subset: false });
    bold = regular;
    const supported = new Set(regular.getCharacterSet());
    const missing = Array.from(allText).find((character) => !supported.has(character.codePointAt(0)!));
    if (missing) throw new Error('The PDF font cannot display U+' + missing.codePointAt(0)!.toString(16).toUpperCase() + '. Export JSON to preserve this value.');
  }
  const pageSize: [number, number] = [612, 792];
  const margin = 48;
  let page = document.addPage(pageSize);
  let y = pageSize[1] - margin;
  const newPage = () => { page = document.addPage(pageSize); y = pageSize[1] - margin; };
  for (const line of content.lines) {
    const size = line.size ?? 9;
    const font = line.bold ? bold : regular;
    for (const part of wrapPdfText(line.text, font, size, pageSize[0] - 2 * margin)) {
      if (y < margin + 24) newPage();
      page.drawText(part, { x: margin, y, size, font, color: rgb(.08, .09, .08) });
      y -= size + 4;
    }
    if (!line.text) y -= 4;
  }
  const pages = document.getPages();
  pages.forEach((pdfPage, index) => pdfPage.drawText(`${index + 1} / ${pages.length}`, { x: 540, y: 24, size: 8, font: regular, color: rgb(.38, .38, .34) }));
  document.setTitle(`${report.file.name} metadata report`);
  document.setSubject('Local metadata inspection report');
  document.setCreator('ViewExif');
  return document.save();
}

export async function downloadMetadataReportPdf(report: MetadataReport, filename: string): Promise<void> {
  const bytes = await createMetadataReportPdfBytes(report);
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
