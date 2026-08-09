import { IMAGE_LIMITS } from '../metadata/limits';
import { stringifyDisplayValue, toSafeValue } from '../metadata/safe-value';
import type {
  ExifToolInspection,
  MetadataInspectionMode,
  MetadataReport,
  MetadataReportFact,
  MetadataReportField,
  MetadataReportSection,
} from './types';

const BINARY_LENGTH = /binary data(?: omitted)?:?\s*(\d[\d,]*)\s*bytes?/i;
const TAG_DETAIL_KEYS = new Set(['val', 'id', 'desc', 'num', 'fmt', 'hex']);

interface GroupDefinition {
  id: string;
  title: string;
  test: RegExp;
}

const GROUPS: GroupDefinition[] = [
  { id: 'file', title: 'File', test: /(^|:)(system|file|exiftool)(:|$)/i },
  { id: 'jfif', title: 'JFIF', test: /jfif/i },
  { id: 'jpeg', title: 'JPEG', test: /jpeg/i },
  { id: 'icc', title: 'ICC color profile', test: /icc|profile/i },
  { id: 'gps', title: 'GPS', test: /gps/i },
  { id: 'iptc', title: 'IPTC', test: /iptc/i },
  { id: 'xmp', title: 'XMP', test: /xmp/i },
  { id: 'photoshop', title: 'Photoshop', test: /photoshop|app13/i },
  { id: 'png', title: 'PNG', test: /png/i },
  { id: 'gif', title: 'GIF', test: /gif/i },
  { id: 'heif', title: 'HEIC / HEIF', test: /heic|heif/i },
  { id: 'tiff', title: 'TIFF', test: /tiff/i },
  { id: 'quicktime', title: 'QuickTime', test: /quicktime|itemlist|userdata|(^|:)keys(:|$)/i },
  { id: 'video', title: 'Video container', test: /matroska|ebml|webm|\bavi\b|flash|\bflv\b|3gpp|3g2/i },
  { id: 'riff', title: 'RIFF media', test: /riff/i },
  { id: 'office', title: 'Office document', test: /ooxml|msoffice|docprops|openxml|wordprocessing|spreadsheet/i },
  { id: 'zip', title: 'ZIP package', test: /(^|:)(zip)(:|$)/i },
  { id: 'pdf', title: 'PDF', test: /pdf/i },
  { id: 'id3', title: 'Audio tags & encoding', test: /id3|audio|mpeg|flac|vorbis|ogg|opus|riff|wav|asf|wma|aac/i },
  { id: 'composite', title: 'Composite', test: /composite/i },
  { id: 'exif', title: 'EXIF', test: /exif|ifd|makernote|interop|thumbnail/i },
];

const READABLE_GROUPS = [
  {
    id: 'color-profile', title: 'Color profile',
    note: 'How color is described and should be rendered on another screen or device.',
    tags: /^(ProfileDescription|ProfileCMMType|ProfileVersion|ProfileClass|ColorSpaceData|ProfileConnectionSpace|RenderingIntent|MediaWhitePoint|ProfileCopyright|ProfileCreator|ProfileID|ChromaticAdaptation|RedMatrixColumn|GreenMatrixColumn|BlueMatrixColumn|RedTRC|GreenTRC|BlueTRC)$/i,
  },
  {
    id: 'image-encoding', title: 'Image encoding',
    note: 'Dimensions, sampling, bit depth, density, and compression details stored in the file.',
    tags: /^(JFIFVersion|ResolutionUnit|XResolution|YResolution|ImageWidth|ImageHeight|ImageSize|Megapixels|EncodingProcess|BitsPerSample|ColorComponents|YCbCrSubSampling|ColorType|BitDepth|Compression)$/i,
  },
  {
    id: 'camera', title: 'Camera & lens',
    note: 'Hardware and software identifiers recorded by the capture or editing device.',
    tags: /^(Make|Model|CameraModelName|Lens|LensModel|LensID|LensSerialNumber|SerialNumber|InternalSerialNumber|Software|FirmwareVersion)$/i,
  },
  {
    id: 'location', title: 'Location',
    note: 'Coordinates, altitude, direction, and place labels can reveal where a file was created.',
    tags: /^(GPS|GPSPosition|GPSLatitude|GPSLongitude|GPSAltitude|GPSImgDirection|Location|City|State|Country|Sublocation)/i,
  },
  {
    id: 'authorship', title: 'Authorship & rights',
    note: 'Names, ownership, contact details, and rights statements attached to the file.',
    tags: /^(Artist|Author|Creator|By-line|Copyright|Rights|Owner|Credit|Contact|Email|Writer|Publisher)/i,
  },
  {
    id: 'dates', title: 'Dates & timeline',
    note: 'Capture, edit, digitize, and filesystem timestamps reported by the metadata engine.',
    tags: /(date|time|timestamp)/i,
  },
  {
    id: 'embedded-content', title: 'Embedded content',
    note: 'Thumbnails, previews, depth maps, gain maps, and other payloads referenced by the container.',
    tags: /(Thumbnail|Preview|Embedded|Depth|GainMap|MPImage|JUMBF)/i,
  },
  {
    id: 'document-properties', title: 'Document properties',
    note: 'Editable title, author, subject, revision, company, and application labels stored by document software.',
    tags: /^(Title|Subject|Author|Creator|Keywords|Description|LastModifiedBy|Revision|Category|ContentStatus|Company|Manager|Application|AppVersion)$/i,
  },
  {
    id: 'document-statistics', title: 'Document statistics',
    note: 'Stored page, word, slide, note, and worksheet counts. These values may be stale if an editor did not refresh them.',
    tags: /^(PageCount|Pages|Words|Characters|CharactersWithSpaces|Lines|Paragraphs|Slides|Notes|HiddenSlides|WorksheetCount)$/i,
  },
  {
    id: 'video-encoding', title: 'Video encoding & tracks',
    note: 'Container, duration, frame size, rate, codecs, rotation, bitrate, and track labels stored around the media streams.',
    tags: /^(FileType|MIMEType|MajorBrand|CompatibleBrands|Duration|MediaDuration|TrackDuration|ImageWidth|ImageHeight|VideoFrameRate|FrameRate|VideoCodec|CodecID|CompressorID|VideoFormat|VideoScanType|VideoBitrate|AvgBitrate|TrackCount|TrackID|TrackType|HandlerType|HandlerDescription|Rotation|MatrixStructure|Encoder|MuxingApp|WritingApp)$/i,
  },
  {
    id: 'audio-identity', title: 'Track & release',
    note: 'Names, album labels, dates, identifiers, comments, and rights stored in the audio file.',
    tags: /^(Title|Track|TrackNumber|DiscNumber|Album|Artist|AlbumArtist|Composer|Conductor|Genre|Date|Year|Label|Publisher|ISRC|Barcode|Comment|Copyright)$/i,
  },
  {
    id: 'audio-encoding', title: 'Audio encoding',
    note: 'Container, codec, duration, bitrate, sample rate, channel, bit-depth, and lossless flags reported by the file.',
    tags: /^(AudioFormat|FileType|MIMEType|CompressorID|Codec|Encoding|Duration|AudioBitrate|Bitrate|SampleRate|AudioSampleRate|NumChannels|Channels|BitsPerSample|AvgBytesPerSec|Lossless)$/i,
  },
] as const;

export const EXIFTOOL_STANDARD_ARGS = Object.freeze([
  '-json', '-G4:3:1', '-D', '-l', '-struct', '-U',
  '-api', 'RequestAll=3', '-api', 'LargeFileSupport=1', '-api', 'SaveFormat=1',
  '-m', '-q', '-q',
]);

export function buildExifToolArgs(mode: MetadataInspectionMode): string[] {
  const args = [...EXIFTOOL_STANDARD_ARGS];
  if (mode === 'embedded') args.splice(1, 0, '-ee3');
  return args;
}

export function createExifToolVirtualName(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'bin';
  const base = filename.replace(/\.[^.]+$/, '').normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/[-_.]{2,}/g, '-').replace(/^[-_.]+|[-_.]+$/g, '').slice(0, 72) || 'metadata-file';
  return `${base}.${extension}`;
}

function humanize(value: string): string {
  return value.replace(/[_-]+/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (letter) => letter.toUpperCase());
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'field';
}

function safeDetail(value: unknown): { value: unknown; displayValue: string; label?: string; tagId?: string | number; format?: string; numericValue?: unknown } {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    if (Object.keys(record).some((key) => TAG_DETAIL_KEYS.has(key))) {
      const safe = toSafeValue(record.val !== undefined ? record.val : record.num);
      return {
        value: safe,
        displayValue: stringifyDisplayValue(safe),
        label: typeof record.desc === 'string' ? record.desc : undefined,
        tagId: typeof record.id === 'string' || typeof record.id === 'number' ? record.id : undefined,
        format: typeof record.fmt === 'string' ? record.fmt : undefined,
        numericValue: record.num === undefined ? undefined : toSafeValue(record.num),
      };
    }
  }
  const safe = toSafeValue(value);
  return { value: safe, displayValue: stringifyDisplayValue(safe) };
}

function binarySummary(displayValue: string): MetadataReportField['binarySummary'] {
  const match = displayValue.match(BINARY_LENGTH);
  if (match) return { bytes: Number(match[1]?.replace(/,/g, '')), note: 'Binary payload summarized by ExifTool; bytes are not included in this report.' };
  if (/binary data|use -b option/i.test(displayValue)) return { note: 'Binary payload summarized by ExifTool; bytes are not included in this report.' };
  return undefined;
}

function isSensitive(path: string): boolean {
  return /gps|location|latitude|longitude|serial|owner|artist|author|creator|copyright|contact|email|datetime|datecreated|thumbnail|preview/i.test(path);
}

function sectionFor(groupPath: string, key: string): GroupDefinition {
  const haystack = `${groupPath}:${key}`;
  return GROUPS.find((group) => group.test.test(haystack)) ?? { id: 'other', title: 'Other metadata', test: /$^/ };
}

function parseTagPath(path: string): { groupPath: string; key: string } {
  const pieces = path.split(':');
  if (pieces.length === 1) return { groupPath: 'File', key: path };
  return { groupPath: pieces.slice(0, -1).join(':'), key: pieces.at(-1) || path };
}

export function adaptExifToolOutput(output: unknown, mode: MetadataInspectionMode): ExifToolInspection {
  const records = Array.isArray(output) ? output : [output];
  const record = records.find((item) => item && typeof item === 'object') as Record<string, unknown> | undefined;
  if (!record) throw new Error('ExifTool returned an empty or invalid JSON result.');
  const fields: MetadataReportField[] = [];
  let truncated = false;
  for (const [path, rawValue] of Object.entries(record)) {
    if (fields.length >= IMAGE_LIMITS.jsonKeys) { truncated = true; break; }
    const { groupPath, key } = parseTagPath(path);
    const detail = safeDetail(rawValue);
    const section = sectionFor(groupPath, key);
    const source = `ExifTool · ${section.title}`;
    fields.push({
      id: `exiftool-${slug(path)}-${fields.length + 1}`,
      key,
      label: detail.label || humanize(key),
      path,
      source,
      value: detail.value,
      displayValue: detail.displayValue,
      sensitive: isSensitive(`${path} ${detail.label || ''}`),
      searchValue: `${detail.label || key} ${key} ${path} ${groupPath} ${source} ${detail.displayValue}`.slice(0, IMAGE_LIMITS.searchPreviewChars),
      origin: 'exiftool',
      groupPath,
      tagId: detail.tagId,
      format: detail.format,
      numericValue: detail.numericValue,
      binarySummary: binarySummary(detail.displayValue),
    });
  }
  const version = fields.find((field) => field.key.toLowerCase() === 'exiftoolversion')?.displayValue;
  return {
    schemaVersion: '1.0',
    mode,
    version,
    fields,
    raw: toSafeValue(record) as Record<string, unknown>,
    warnings: truncated ? [{ code: 'EXIFTOOL_FIELD_LIMIT', message: `ExifTool found more than ${IMAGE_LIMITS.jsonKeys.toLocaleString('en-US')} fields. The safe report keeps the first ${IMAGE_LIMITS.jsonKeys.toLocaleString('en-US')}.` }] : [],
    truncated,
  };
}

function categoryForField(field: MetadataReportField): string {
  const path = `${field.groupPath || ''}:${field.path}:${field.source}`;
  return sectionFor(path, field.key).id;
}

function canonicalKey(field: MetadataReportField): string {
  const pathParts = field.path.replace(/\[\d+\]$/g, '').split('.');
  const leaf = pathParts.at(-1)?.toLowerCase();
  const key = leaf && ['description', 'value', 'id'].includes(leaf) ? pathParts.at(-2) || field.key : field.key;
  return `${categoryForField(field)}:${key.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
}

function canonicalValue(field: MetadataReportField): string {
  return field.displayValue.trim().replace(/\s+/g, ' ').toLowerCase();
}

function sectionsFromExifTool(fields: MetadataReportField[]): MetadataReportSection[] {
  const sections = new Map<string, MetadataReportSection>();
  for (const definition of [...GROUPS, { id: 'other', title: 'Other metadata', test: /$^/ }]) {
    const matching = fields.filter((field) => categoryForField(field) === definition.id);
    if (!matching.length) continue;
    sections.set(`exiftool-${definition.id}`, {
      id: `exiftool-${definition.id}`,
      title: definition.title,
      note: `Exact local ExifTool fields from ${definition.title}. Group paths and tag IDs keep duplicate instances unambiguous.`,
      fields: matching,
    });
  }
  return [...sections.values()];
}

function addReadableSections(report: MetadataReport, inspection: ExifToolInspection): MetadataReportSection[] {
  const output = report.readableSections.map((section) => ({ ...section, fields: [...section.fields] }));
  const existing = new Set(output.flatMap((section) => section.fields.map((field) => `${field.key.toLowerCase()}:${canonicalValue(field)}`)));
  for (const definition of READABLE_GROUPS) {
    const fields = inspection.fields.filter((field) => definition.tags.test(field.key) && !existing.has(`${field.key.toLowerCase()}:${canonicalValue(field)}`));
    if (!fields.length) continue;
    const section = output.find((item) => item.id === `readable-${definition.id}`);
    const readableFields = fields.map((field) => ({ ...field, id: `readable-${field.id}` }));
    if (section) section.fields.push(...readableFields);
    else output.push({ id: `readable-${definition.id}`, title: definition.title, note: definition.note, fields: readableFields });
    readableFields.forEach((field) => existing.add(`${field.key.toLowerCase()}:${canonicalValue(field)}`));
  }
  return output;
}

function addFacts(facts: MetadataReportFact[], fields: MetadataReportField[]): MetadataReportFact[] {
  const output = [...facts];
  const candidates: Array<[string, string, string[]]> = [
    ['color-profile', 'Color profile', ['ProfileDescription']],
    ['color-space', 'Color space', ['ColorSpace', 'ColorSpaceData']],
    ['bit-depth', 'Bit depth', ['BitsPerSample', 'BitDepth']],
    ['encoding', 'Encoding', ['EncodingProcess', 'Compression']],
  ];
  for (const [id, label, keys] of candidates) {
    if (output.some((fact) => fact.id === id)) continue;
    const field = fields.find((item) => keys.some((key) => key.toLowerCase() === item.key.toLowerCase()));
    if (field?.displayValue) output.push({ id, label, value: field.displayValue });
  }
  return output;
}

function sourceStats(sections: MetadataReportSection[]): MetadataReport['sourceStats'] {
  const counts = new Map<MetadataReportField['origin'], number>();
  for (const field of sections.flatMap((section) => section.fields)) counts.set(field.origin, (counts.get(field.origin) || 0) + 1);
  return [...counts].map(([origin, fieldCount]) => ({ origin, fieldCount }));
}

export function mergeExifToolInspection(report: MetadataReport, inspection: ExifToolInspection): MetadataReport {
  const exifFields = inspection.fields.map((field) => ({ ...field, alternates: field.alternates ? [...field.alternates] : undefined }));
  const candidates = new Map<string, MetadataReportField[]>();
  for (const field of exifFields) {
    const key = canonicalKey(field);
    const values = candidates.get(key) || [];
    values.push(field);
    candidates.set(key, values);
  }
  const parserOnly: MetadataReportField[] = [];
  for (const parserField of report.nativeSections.flatMap((section) => section.fields).filter((field) => field.origin !== 'exiftool')) {
    const matches = candidates.get(canonicalKey(parserField)) || [];
    if (!matches.length) { parserOnly.push(parserField); continue; }
    const same = matches.some((field) => canonicalValue(field) === canonicalValue(parserField));
    if (same) continue;
    const target = matches[0];
    if (target) {
      target.alternates = [...(target.alternates || []), {
        origin: 'parser', source: parserField.source, path: parserField.path,
        value: parserField.value, displayValue: parserField.displayValue,
      }];
    } else parserOnly.push(parserField);
  }
  const nativeSections = sectionsFromExifTool(exifFields);
  if (parserOnly.length) nativeSections.push({
    id: 'parser-diagnostics',
    title: 'Parser diagnostics',
    note: 'Safe container and parser fields that do not have an equivalent ExifTool tag.',
    fields: parserOnly,
  });
  const existingWarnings = report.warnings.filter((warning) => !warning.code.startsWith('EXIFTOOL_'));
  const engines = report.engines.filter((engine) => engine.id !== 'exiftool');
  engines.push({
    id: 'exiftool', label: 'ExifTool WebAssembly', version: inspection.version,
    status: 'complete', mode: inspection.mode, fieldCount: inspection.fields.length,
    truncated: inspection.truncated,
  });
  return {
    ...report,
    facts: addFacts(report.facts, inspection.fields),
    readableSections: addReadableSections(report, inspection),
    nativeSections,
    warnings: [...existingWarnings, ...inspection.warnings],
    engines,
    sourceStats: sourceStats(nativeSections),
    raw: { ...report.raw, exiftool: inspection.raw },
  };
}

export function recordExifToolFailure(report: MetadataReport, message: string, mode: MetadataInspectionMode): MetadataReport {
  const hasCompletedEngine = report.engines.some((engine) => engine.id === 'exiftool' && engine.status === 'complete');
  const engines = hasCompletedEngine ? report.engines : [
    ...report.engines.filter((engine) => engine.id !== 'exiftool'),
    { id: 'exiftool' as const, label: 'ExifTool WebAssembly', status: 'failed' as const, mode, fieldCount: 0, truncated: false, message },
  ];
  const code = mode === 'embedded' ? 'EXIFTOOL_EMBEDDED_SCAN_FAILED' : 'EXIFTOOL_SCAN_FAILED';
  return {
    ...report,
    engines,
    warnings: [...report.warnings.filter((warning) => warning.code !== code), { code, message }],
  };
}
