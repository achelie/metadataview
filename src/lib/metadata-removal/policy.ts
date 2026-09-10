import type { MetadataReport, MetadataReportField } from '../metadata-report/types';
import type { MetadataRemovalField, MetadataRemovalReport } from './types';

// Match canonical tag keys, never substrings of labels or arbitrary paths.
const ENVIRONMENT_KEYS = /^(?:filename|directory|filesize|filepermissions|filedevice|fileinode|filemodifydate|fileaccessdate|filecreatedate|exiftoolversion|newguid)$/i;
const STRUCTURAL = /^(?:(?:image|video|audio|source|exif)?(?:width|height|dimensions|size|duration|codec|bitrate|samplerate|channels|bitdepth|compression)|mime(?:type)?|filetype(?:extension)?|extension|format|megapixels?|aspectratio|orientation|orientationmeaning|colorspace|colorprofile|bitsper(?:sample|pixel)|encodingprocess|framerate|framecount|trackcount|streamcount|animation|animated|loopcount|pagecount|pages|storedpagecount|wordcount|words|slidecount|slides|worksheetcount|sheetcount|entrycount|relationshipcount|mediaentries|objectcount|offset|headersize|container|majorbrand|compatiblebrands?|handler(?:type|description)?|timescale)$/i;
const PRESERVED_CONTENT = /^(?:coverart|pictures?|artwork|chapters?|chaptercount|subtitles?|attachments?|attachmentcount|annotations?|revisions?|commentthreads?|noteslides?|notespagecount|embeddedobjects?|embeddedobjectcount)$/i;

function canonicalKey(field: MetadataReportField): string {
  return field.key.replace(/[ _-]/g, '');
}
const ELIGIBLE = /(?:gps|latitude|longitude|location|author|artist|creator|owner|company|manager|email|phone|serial|device|camera|lens|software|producer|application|encoder|encodedby|create(?:d|date|time)|modify(?:date|time)|timestamp|title|subject|keyword|description|comment|copyright|rights|license|rating|genre|album|xmp|iptc|exif|makernote|photoshop|history|documentid|instanceid|originalfilename|filepath|directory|template|custom)/i;

function signature(field: MetadataReportField): string {
  return `${field.key}|${field.displayValue}`.toLocaleLowerCase('en-US');
}

export function reportFields(report: MetadataReport): MetadataReportField[] {
  const seen = new Set<string>();
  return [...report.readableSections, ...report.nativeSections].flatMap((section) => section.fields).filter((field) => {
    const id = `${field.path}|${signature(field)}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function isEnvironmentField(field: MetadataReportField): boolean {
  const group = field.groupPath || field.path.split(/[.:/]/).slice(0, -1).join(':');
  const runtime = /^(?:System|File|ExifTool)(?:$|[.:/])/i.test(group);
  return runtime && ENVIRONMENT_KEYS.test(canonicalKey(field));
}

export function isPreservedField(field: MetadataReportField): boolean {
  const key = canonicalKey(field);
  // ICC is an explicit rendering-data exception, scoped to its actual source group.
  const icc = /^(?:ICC_Profile|ICC-header|ICC)(?:$|[.:/])/i.test(field.groupPath ?? '');
  return !isEnvironmentField(field) && (STRUCTURAL.test(key) || PRESERVED_CONTENT.test(key) || icc);
}

export function isEligibleField(field: MetadataReportField): boolean {
  if (isEnvironmentField(field) || isPreservedField(field)) return false;
  return field.sensitive || ELIGIBLE.test(`${field.label} ${field.key} ${field.path} ${field.source}`);
}

function safePreview(value: string): string {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return value.replace(/^(.).+(@.+)$/, '$1***$2');
  if (/[-+]?\d{1,3}\.\d{3,}\s*[,/]\s*[-+]?\d{1,3}\.\d{3,}/.test(value)) return '[coordinate removed]';
  return value.length > 180 ? `${value.slice(0, 177)}...` : value;
}

function output(field: MetadataReportField, disposition: MetadataRemovalField['disposition'], reason: string): MetadataRemovalField {
  return { id: field.id, label: field.label, path: field.path, source: field.source, displayValue: safePreview(field.displayValue), disposition, reason };
}

export function createRemovalBaseline(report: MetadataReport, engine: MetadataRemovalReport['engine']): MetadataRemovalReport {
  const fields = reportFields(report);
  const eligible = fields.filter(isEligibleField);
  const preserved = fields.filter(isPreservedField);
  const excludedEnvironment = fields.filter(isEnvironmentField);
  const signed = fields.some((field) => /c2pa|content credential|digitalsignature|signaturevalue|sigflags|_xmlsignatures/i.test(`${field.label} ${field.path} ${field.displayValue}`));
  return {
    schemaVersion: '1.0', type: report.file.detectedType, category: report.category, engine,
    read: fields.length, eligible: eligible.length, preserved: preserved.length,
    excludedEnvironment: excludedEnvironment.length, signed, warnings: [],
  };
}

export function compareRemovalReports(before: MetadataReport, after: MetadataReport) {
  const beforeEligible = reportFields(before).filter(isEligibleField);
  const afterFields = reportFields(after);
  const afterEligible = afterFields.filter(isEligibleField);
  const afterSignatures = new Set(afterEligible.map(signature));
  const removed = beforeEligible.filter((field) => !afterSignatures.has(signature(field))).map((field) => output(field, 'removed', 'The same metadata value was not found in the verified output.'));
  const beforeSignatures = new Set(beforeEligible.map(signature));
  const residual = afterEligible.map((field) => output(field, 'residual', beforeSignatures.has(signature(field)) ? 'This writable-looking field remains after cleanup.' : 'This metadata field appeared in the verified output.'));
  const preserved = afterFields.filter(isPreservedField).slice(0, 250).map((field) => output(field, 'preserved', 'Required technical data or user-visible content was intentionally retained.'));
  return { removed, residual, preserved };
}

export function likelyCleanupEngine(type: MetadataReport['file']['detectedType']): MetadataRemovalReport['engine'] {
  if (['jpeg', 'png', 'webp', 'heic', 'tiff', 'gif', 'mp4', 'mov', '3gp', '3g2'].includes(type)) return 'exiftool';
  if (['mp3', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wav', 'wma', 'mkv', 'webm'].includes(type)) return 'taglib';
  if (['docx', 'pptx', 'xlsx'].includes(type)) return 'ooxml-zip';
  if (type === 'pdf') return 'qpdf';
  if (type === 'avi') return 'riff';
  return 'flv-amf';
}
