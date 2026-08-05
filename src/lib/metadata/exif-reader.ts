import ExifReader from 'exifreader';
import { toSafeValue } from './safe-value';
import type { ParseWarning } from './types';

export interface ExifFieldEntry { key: string; path: string; source: string; value: unknown }
export interface ExifReadResult { raw: Record<string, unknown>; fields: ExifFieldEntry[]; warnings: ParseWarning[] }

function readableTag(value: Record<string, unknown>): unknown {
  if (value.description !== undefined && value.description !== '') return value.description;
  if (value.value !== undefined) return toSafeValue(value.value);
  return toSafeValue(value);
}

function sourceName(value: string): string {
  const key = value.toLowerCase();
  if (key.includes('gps')) return 'EXIF GPS';
  if (key.includes('iptc')) return 'IPTC';
  if (key.includes('xmp')) return 'XMP';
  if (key.includes('icc')) return 'ICC';
  if (key.includes('jfif')) return 'JFIF';
  if (key.includes('photoshop')) return 'Photoshop APP13';
  if (key.includes('png')) return 'PNG metadata';
  if (key.includes('thumbnail')) return 'EXIF thumbnail';
  return 'EXIF';
}

function flatten(value: unknown, path: string, source: string, output: ExifFieldEntry[], seen: WeakSet<object>, depth: number): void {
  if (!value || typeof value !== 'object' || depth > 30 || output.length >= 20_000) return;
  if (seen.has(value)) return;
  seen.add(value);
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    const nextPath = path ? `${path}.${key}` : key;
    const nextSource = path ? source : sourceName(key);
    if (item && typeof item === 'object' && ('description' in (item as Record<string, unknown>) || 'value' in (item as Record<string, unknown>))) {
      output.push({ key, path: nextPath, source: nextSource, value: readableTag(item as Record<string, unknown>) });
    } else if (item && typeof item === 'object' && !Array.isArray(item) && !ArrayBuffer.isView(item)) flatten(item, nextPath, nextSource, output, seen, depth + 1);
    else if (item !== undefined && item !== null && item !== '') output.push({ key, path: nextPath, source: nextSource, value: toSafeValue(item) });
  }
  seen.delete(value);
}

export function readExifMetadata(buffer: ArrayBuffer): ExifReadResult {
  const warnings: ParseWarning[] = [];
  try {
    const loaded = ExifReader.load(buffer, { expanded: true, includeUnknown: true });
    const fields: ExifFieldEntry[] = [];
    flatten(loaded, '', 'EXIF', fields, new WeakSet<object>(), 0);
    return { raw: toSafeValue(loaded) as Record<string, unknown>, fields, warnings };
  } catch (error) {
    warnings.push({ code: 'METADATA_PARTIAL', message: `The image opened, but some EXIF-family metadata could not be decoded${error instanceof Error ? `: ${error.message}` : '.'}` });
    return { raw: {}, fields: [], warnings };
  }
}
