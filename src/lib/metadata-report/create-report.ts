import { IMAGE_LIMITS } from '../metadata/limits';
import { stringifyDisplayValue, toSafeValue } from '../metadata/safe-value';
import type { MetadataItem, ParsedMetadata } from '../metadata/types';
import { flattenNativeFields } from './flatten';
import type { FileEvidence, MetadataReport, MetadataReportFact, MetadataReportField } from './types';

function humanize(key: string): string {
  return key.replace(/[_-]+/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (letter) => letter.toUpperCase());
}

function fieldFromItem(item: MetadataItem, sectionId: string, index: number): MetadataReportField {
  const value = toSafeValue(item.value);
  const displayValue = item.displayValue ?? stringifyDisplayValue(value);
  const path = item.path ?? `${sectionId}.${item.key}`;
  const source = item.source ?? humanize(sectionId);
  return {
    id: `readable-${sectionId}-${index}`,
    key: item.key,
    label: item.label ?? humanize(item.key),
    path,
    source,
    value,
    displayValue,
    sensitive: item.sensitive ?? /gps|location|serial|owner|author|email|date|thumbnail/i.test(path),
    searchValue: item.searchValue ?? `${item.label ?? item.key} ${path} ${source} ${displayValue}`.slice(0, IMAGE_LIMITS.searchPreviewChars),
    origin: 'parser',
    groupPath: source,
  };
}

function numberValue(value: unknown): number | undefined {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function duration(value: unknown): string | undefined {
  const seconds = numberValue(value);
  if (seconds === undefined) return undefined;
  const minutes = Math.floor(seconds / 60);
  return `${minutes ? `${minutes}m ` : ''}${(seconds % 60).toFixed(seconds < 10 ? 2 : 1)}s`;
}

function size(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

function makeFacts(parsed: ParsedMetadata): MetadataReportFact[] {
  const file = parsed.file as ParsedMetadata['file'] & Record<string, unknown>;
  const normalized = parsed.normalized;
  const facts: Array<[string, string, unknown]> = [
    ['format', 'Format', (file.actualFormat ?? file.detectedType)?.toString().toUpperCase()],
    ['size', 'File size', size(file.size)],
    ['mime', 'MIME type', file.mime],
  ];
  const width = numberValue(file.width ?? normalized.Width);
  const height = numberValue(file.height ?? normalized.Height);
  if (width && height) facts.push(['dimensions', 'Dimensions', `${width.toLocaleString('en-US')} × ${height.toLocaleString('en-US')} px`]);
  if (parsed.category === 'image' && file.megapixels) facts.push(['megapixels', 'Megapixels', `${Number(file.megapixels).toFixed(2)} MP`]);
  if (parsed.category === 'pdf') facts.push(['pages', 'Pages', normalized.PageCount]);
  if (parsed.category === 'document') {
    if (file.detectedType === 'docx') {
      facts.push(['stored-pages', 'Stored pages', normalized.Pages ?? normalized.StoredPageCount]);
      facts.push(['stored-words', 'Stored words', normalized.Words]);
    }
    if (file.detectedType === 'pptx') {
      facts.push(['slides', 'Slides', normalized.SlideCount ?? normalized.Slides]);
      facts.push(['notes', 'Notes pages', normalized.NotesPageCount ?? normalized.Notes]);
    }
    if (file.detectedType === 'xlsx') facts.push(['worksheets', 'Worksheets', normalized.WorksheetCount]);
    facts.push(['application', 'Authoring app', normalized.Application]);
  }
  if (parsed.category === 'video' || parsed.category === 'audio') facts.push(['duration', 'Duration', duration(normalized.Duration)]);
  if (parsed.category === 'video') facts.push(['codec', 'Video codec', normalized.Codec]);
  if (parsed.category === 'audio') {
    if (normalized.Codec) facts.push(['audio-codec', 'Audio codec', normalized.Codec]);
    const bitrate = numberValue(normalized.Bitrate);
    if (bitrate) facts.push(['bitrate', 'Bitrate', `${Math.round(bitrate / 1000)} kbps`]);
    const sampleRate = numberValue(normalized.SampleRate);
    if (sampleRate) facts.push(['sample-rate', 'Sample rate', `${sampleRate.toLocaleString('en-US')} Hz`]);
    const channels = numberValue(normalized.Channels);
    if (channels) facts.push(['channels', 'Channels', channels]);
    const bits = numberValue(normalized.BitsPerSample);
    if (bits) facts.push(['bits-per-sample', 'Bit depth', `${bits}-bit`]);
    if (typeof normalized.Lossless === 'boolean') facts.push(['lossless', 'Compression', normalized.Lossless ? 'Lossless' : 'Lossy']);
  }
  return facts.filter((entry) => entry[2] !== undefined && entry[2] !== '').map(([id, label, value]) => ({ id, label, value: String(value) }));
}

export function createMetadataReport(parsed: ParsedMetadata, evidence: FileEvidence, generatedAt = new Date().toISOString()): MetadataReport {
  const safeRaw = toSafeValue(parsed.raw) as Record<string, unknown>;
  const safeNormalized = toSafeValue(parsed.normalized) as Record<string, unknown>;
  return {
    schemaVersion: '1.1',
    generatedAt,
    category: parsed.category,
    file: toSafeValue(parsed.file) as MetadataReport['file'],
    facts: makeFacts(parsed),
    readableSections: parsed.sections.map((section) => ({
      id: `readable-${section.id}`,
      title: section.title,
      note: `A practical summary from ${section.title.toLowerCase()}. Switch to native fields for exact paths.`,
      fields: section.items.map((item, index) => fieldFromItem(item, section.id, index)),
    })).filter((section) => section.fields.length > 0),
    nativeSections: flattenNativeFields(safeRaw),
    warnings: parsed.warnings,
    evidence,
    engines: [{
      id: 'core',
      label: 'Fast browser parser',
      status: 'complete',
      mode: 'core',
      fieldCount: parsed.sections.reduce((count, section) => count + section.items.length, 0),
      truncated: false,
    }],
    sourceStats: [{
      origin: 'parser',
      fieldCount: parsed.sections.reduce((count, section) => count + section.items.length, 0)
        + flattenNativeFields(safeRaw).reduce((count, section) => count + section.fields.length, 0),
    }],
    normalized: safeNormalized,
    raw: safeRaw,
  };
}
