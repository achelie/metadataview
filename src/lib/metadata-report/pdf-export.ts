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

function ascii(value: string): string {
  return value.normalize('NFKD').replace(/[^\x20-\x7E]/g, '?');
}

function wrap(text: string, length = 94): string[] {
  if (!text) return [''];
  const output: string[] = [];
  let remaining = ascii(text);
  while (remaining.length > length) {
    let cut = remaining.lastIndexOf(' ', length);
    if (cut < length * .45) cut = length;
    output.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut).trimStart();
  }
  output.push(remaining);
  return output;
}

export async function createMetadataReportPdfBytes(report: MetadataReport): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  const content = buildPdfReportContent(report);
  const pageSize: [number, number] = [612, 792];
  const margin = 48;
  let page = document.addPage(pageSize);
  let y = pageSize[1] - margin;
  const newPage = () => { page = document.addPage(pageSize); y = pageSize[1] - margin; };
  for (const line of content.lines) {
    const size = line.size ?? 9;
    for (const part of wrap(line.text, size >= 16 ? 58 : size >= 12 ? 78 : 96)) {
      if (y < margin + 24) newPage();
      page.drawText(part, { x: margin, y, size, font: line.bold ? bold : regular, color: rgb(.08, .09, .08) });
      y -= size + 4;
    }
    if (!line.text) y -= 4;
  }
  const pages = document.getPages();
  pages.forEach((pdfPage, index) => pdfPage.drawText(`${index + 1} / ${pages.length}`, { x: 540, y: 24, size: 8, font: regular, color: rgb(.38, .38, .34) }));
  document.setTitle(`${ascii(report.file.name)} metadata report`);
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
