import { detectAndParseGenerator } from '../generators/detect-generator';
import type { ExifFieldEntry } from './exif-reader';
import { coordinatesText, extractGps } from './gps';
import { IMAGE_LIMITS } from './limits';
import { ORIENTATION_LABELS, orientationNumber } from './orientation';
import { stringifyDisplayValue, toSafeValue } from './safe-value';
import type { ImageContainerDetails, ImageMetadataField, ImageMetadataGroup, ImageMetadataSection, ImageLocation } from './types';

interface Candidate { key: string; path: string; value: unknown; source: string; forceGroup?: ImageMetadataGroup }
interface NormalizeInput { exifFields: ExifFieldEntry[]; textMetadata: Record<string, unknown>; container: ImageContainerDetails }

const LABELS: Record<string, string> = {
  make: 'Camera make', model: 'Camera model', lensmodel: 'Lens model', lensmake: 'Lens make', bodyserialnumber: 'Camera serial number',
  serialnumber: 'Serial number', lensserialnumber: 'Lens serial number', datetimeoriginal: 'Date taken (raw)', createdate: 'Created date (raw)',
  modifydate: 'Modified date (raw)', offsettimeoriginal: 'Capture time offset', gpslatitude: 'GPS latitude', gpslongitude: 'GPS longitude',
  gpsaltitude: 'GPS altitude', gpsimgdirection: 'Camera direction', artist: 'Artist', author: 'Author', copyright: 'Copyright',
  software: 'Software', orientation: 'Orientation', exposuretime: 'Exposure time', fnumber: 'Aperture', isospeedratings: 'ISO speed',
  photographicSensitivity: 'ISO speed', focallength: 'Focal length', colorspace: 'Color space', pixelxdimension: 'EXIF width',
  pixelydimension: 'EXIF height', parameters: 'Generation parameters', prompt: 'Prompt', workflow: 'ComfyUI workflow',
};

const SECTION_COPY: Record<ImageMetadataGroup, { title: string; note: string }> = {
  privacy: { title: 'Privacy signals', note: 'Device IDs and embedded previews deserve a second look before sharing.' },
  location: { title: 'Location', note: 'Coordinates are shown only when both values are valid. Opening a map always needs your click.' },
  camera: { title: 'Camera & lens', note: 'Labels written by the camera or editing app—not independent proof.' },
  capture: { title: 'Capture settings', note: 'Exposure, orientation, focal length, and other settings stored at capture time.' },
  dates: { title: 'Dates', note: 'Original strings stay untouched. No timezone guessing, no quiet UTC conversion.' },
  author: { title: 'Author & rights', note: 'Names, credits, contact fields, and copyright labels saved inside the file.' },
  software: { title: 'Software & editing', note: 'Apps, persistent document IDs, and editing-history breadcrumbs.' },
  ai: { title: 'AI generation data', note: 'Stored prompts and workflows only. This page does not infer a prompt from pixels.' },
  technical: { title: 'Technical details', note: 'Container flags, color data, profiles, and remaining readable fields.' },
};

const ORDER: ImageMetadataGroup[] = ['privacy', 'location', 'camera', 'capture', 'dates', 'author', 'software', 'ai', 'technical'];

function normalizedKey(key: string): string { return key.toLowerCase().replace(/[^a-z0-9]/g, ''); }
function labelFor(key: string): string {
  const direct = LABELS[normalizedKey(key)];
  if (direct) return direct;
  return key.replace(/^.*\./, '').replace(/[_-]+/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (letter) => letter.toUpperCase());
}

function groupFor(key: string): ImageMetadataGroup {
  const value = normalizedKey(key);
  if (/serial|thumbnail|previewimage/.test(value)) return 'privacy';
  if (/gps|location|latitude|longitude|altitude|city|state|country/.test(value)) return 'location';
  if (/datetime|createdate|modifydate|timestamp|timeoffset|datecreated|gpsdate/.test(value)) return 'dates';
  if (/artist|author|creator|copyright|credit|contact|byline|email|owner/.test(value)) return 'author';
  if (/prompt|workflow|parameters|seed|sampler|scheduler|cfg|denois|lora|checkpoint|modelhash|clip.?skip|steps/.test(value)) return 'ai';
  if (/software|creatortool|history|documentid|instanceid|derivedfrom|editing/.test(value)) return 'software';
  if (/exposure|fnumber|aperture|iso|focal|flash|whitebalance|metering|orientation|shutter|brightness|digitalzoom/.test(value)) return 'capture';
  if (/camera|lens|make|model/.test(value)) return 'camera';
  return 'technical';
}

function sensitive(key: string): boolean {
  return /gps|location|latitude|longitude|serial|owner|artist|author|creator|copyright|contact|email|datetime|datecreated|thumbnail|previewimage|prompt|workflow|parameters/i.test(key);
}

function usable(value: unknown): boolean { return value !== undefined && value !== null && value !== ''; }

function add(candidates: Candidate[], key: string, value: unknown, source: string, forceGroup?: ImageMetadataGroup, path = key): void {
  if (usable(value)) candidates.push({ key, path, value: toSafeValue(value), source, forceGroup });
}

function findValue(fields: ExifFieldEntry[], names: string[]): unknown {
  const targets = names.map(normalizedKey);
  return fields.find((field) => targets.includes(normalizedKey(field.key)))?.value;
}

function makeField(candidate: Candidate, index: number): ImageMetadataField {
  const displayValue = stringifyDisplayValue(candidate.value);
  const group = candidate.forceGroup ?? groupFor(candidate.key);
  return {
    id: `${group}-${index}-${normalizedKey(candidate.key).slice(0, 60)}`,
    key: candidate.key,
    label: labelFor(candidate.key),
    path: candidate.path,
    value: candidate.value,
    displayValue,
    group,
    source: candidate.source,
    sensitive: sensitive(candidate.key),
    searchValue: displayValue.slice(0, IMAGE_LIMITS.searchPreviewChars),
  };
}

function aiCandidates(textMetadata: Record<string, unknown>, fields: ExifFieldEntry[]): Candidate[] {
  const input: Record<string, unknown> = { ...textMetadata };
  for (const field of fields) if (input[field.key] === undefined) input[field.key] = field.value;
  const parsed = detectAndParseGenerator(input);
  const output: Candidate[] = [];
  const values: Record<string, unknown> = {
    Generator: parsed.source !== 'unknown' ? parsed.source : undefined,
    'Positive prompt': parsed.positivePrompt, 'Negative prompt': parsed.negativePrompt, Model: parsed.model, 'Model hash': parsed.modelHash,
    Sampler: parsed.sampler, Scheduler: parsed.scheduler, Seed: parsed.seed, Steps: parsed.steps, 'CFG scale': parsed.cfgScale,
    'Generated width': parsed.width, 'Generated height': parsed.height, 'Denoising strength': parsed.denoisingStrength,
    'Clip skip': parsed.clipSkip, Version: parsed.version, LoRAs: parsed.loras.length ? parsed.loras : undefined, Workflow: parsed.workflow,
  };
  for (const [key, value] of Object.entries(values)) add(output, key, value, 'AI metadata', 'ai');
  return output;
}

export function normalizeImageMetadataDetailed(input: NormalizeInput): { sections: ImageMetadataSection[]; location: ImageLocation; legacy: Record<string, unknown> } {
  const candidates: Candidate[] = [];
  const seen = new Set<string>();
  const authoritativeText = new Set(Object.entries(input.textMetadata).map(([key, value]) => `${normalizedKey(key)}|${stringifyDisplayValue(value)}`));
  for (const field of input.exifFields) {
    const plainIdentity = `${normalizedKey(field.key)}|${stringifyDisplayValue(field.value)}`;
    if (authoritativeText.has(plainIdentity)) continue;
    const identity = `${field.source}|${plainIdentity}`;
    if (!seen.has(identity)) { add(candidates, field.key, field.value, field.source, undefined, field.path); seen.add(identity); }
  }
  for (const [key, value] of Object.entries(input.textMetadata)) add(candidates, key, value, 'PNG text', undefined, `png.text.${key}`);
  candidates.push(...aiCandidates(input.textMetadata, input.exifFields));

  const location = extractGps(input.exifFields);
  const coordinates = coordinatesText(location);
  if (coordinates) add(candidates, 'Decimal coordinates', coordinates, 'Calculated from EXIF GPS', 'location');
  if (location.altitude !== undefined) add(candidates, 'Calculated altitude', `${location.altitude.toFixed(2)} m`, 'Calculated from EXIF GPS', 'location');

  const orientation = orientationNumber(findValue(input.exifFields, ['Orientation']));
  if (orientation) add(candidates, 'Orientation meaning', ORIENTATION_LABELS[orientation], 'Normalized EXIF', 'capture');
  add(candidates, 'Container format', input.container.kind.toUpperCase(), 'File signature', 'technical');
  add(candidates, 'Embedded EXIF', input.container.hasExif, 'Container', 'technical');
  add(candidates, 'Embedded XMP', input.container.hasXmp, 'Container', 'technical');
  add(candidates, 'Embedded ICC profile', input.container.hasIcc, 'Container', 'technical');
  add(candidates, 'Alpha channel', input.container.hasAlpha, 'Container', 'technical');
  add(candidates, 'Animated', input.container.animated, 'Container', 'technical');
  if (input.container.chunks?.length) add(candidates, 'Container chunks', input.container.chunks, 'Container', 'technical');

  const fields = candidates.map(makeField);
  const sections = ORDER.map((id) => ({ id, ...SECTION_COPY[id], fields: fields.filter((field) => field.group === id) })).filter((section) => section.fields.length > 0);
  const legacy: Record<string, unknown> = { ...input.textMetadata };
  const priority = ['Make','Model','UniqueCameraModel','SerialNumber','BodySerialNumber','LensSerialNumber','LensModel','CameraOwnerName','DateTimeOriginal','CreateDate','ModifyDate','GPSLatitude','GPSLongitude','GPSAltitude','GPSDateStamp','GPSImgDirection','Location','City','State','Country','Artist','Author','Creator','OwnerName','Copyright','Credit','Contact','Email','By-line','Software','CreatorTool','History','DocumentID','InstanceID','DerivedFrom','Orientation','ColorSpace'];
  for (const key of priority) { const value = findValue(input.exifFields, [key]); if (usable(value)) legacy[key] = value; }
  legacy.HasEmbeddedThumbnail = input.exifFields.some((field) => /thumbnail/i.test(field.path));
  if (coordinates) { legacy.GPSLatitude = location.latitude; legacy.GPSLongitude = location.longitude; }
  return { sections, location, legacy };
}
