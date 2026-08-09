import { IMAGE_LIMITS } from '../metadata/limits';
import { stringifyDisplayValue, toSafeValue } from '../metadata/safe-value';
import type { MetadataReportSection } from './types';

export interface FlattenOptions {
  maxFields?: number;
  maxDepth?: number;
}

function humanize(value: string): string {
  const leaf = value.replace(/\[\d+\]$/g, '').split('.').at(-1) || value;
  return leaf.replace(/[_-]+/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (letter) => letter.toUpperCase());
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'native';
}

function sourceFor(root: string): string {
  const known: Record<string, string> = {
    exif: 'EXIF', iptc: 'IPTC', xmp: 'XMP', png: 'PNG chunks', webp: 'WebP container', jpeg: 'JPEG container',
    info: 'PDF info dictionary', core: 'OOXML core properties', application: 'OOXML application properties', custom: 'Custom properties', package: 'OOXML package',
    common: 'Common audio tags', format: 'Audio format', native: 'Native audio tags',
    container: 'Container', imageSummary: 'Image parser',
  };
  return known[root.toLowerCase()] ?? humanize(root);
}

function sensitive(path: string): boolean {
  return /gps|location|latitude|longitude|serial|owner|artist|author|creator|copyright|contact|email|datetime|datecreated|thumbnail|preview/i.test(path);
}

export function flattenNativeFields(rawInput: Record<string, unknown>, options: FlattenOptions = {}): MetadataReportSection[] {
  const raw = toSafeValue(rawInput) as Record<string, unknown>;
  const maxFields = Math.min(options.maxFields ?? IMAGE_LIMITS.jsonKeys, IMAGE_LIMITS.jsonKeys);
  const maxDepth = Math.min(options.maxDepth ?? IMAGE_LIMITS.jsonDepth, IMAGE_LIMITS.jsonDepth);
  const sections = new Map<string, MetadataReportSection>();
  const seen = new Set<string>();
  let count = 0;

  const add = (root: string, path: string, value: unknown) => {
    if (count >= maxFields) return;
    const safe = toSafeValue(value);
    const displayValue = stringifyDisplayValue(safe);
    const identity = `${path}\u0000${displayValue}`;
    if (seen.has(identity)) return;
    seen.add(identity);
    count += 1;
    const id = `native-${slug(root)}`;
    const section = sections.get(id) ?? {
      id,
      title: `${humanize(root)} native fields`,
      note: `Exact safe values reported by ${sourceFor(root)}. Paths keep nested fields unambiguous.`,
      fields: [],
    };
    section.fields.push({
      id: `${id}-${count}`,
      key: path.split('.').at(-1) ?? path,
      label: humanize(path),
      path,
      source: sourceFor(root),
      value: safe,
      displayValue,
      sensitive: sensitive(path),
      searchValue: `${path} ${sourceFor(root)} ${displayValue}`.slice(0, IMAGE_LIMITS.searchPreviewChars),
      origin: 'parser',
      groupPath: root,
    });
    sections.set(id, section);
  };

  const walk = (root: string, path: string, value: unknown, depth: number): void => {
    if (count >= maxFields) return;
    if (depth >= maxDepth) { add(root, path, '[Maximum depth reached]'); return; }
    if (Array.isArray(value)) {
      if (!value.length) add(root, path, []);
      else value.forEach((item, index) => walk(root, `${path}[${index}]`, item, depth + 1));
      return;
    }
    if (value && typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      if (!entries.length) add(root, path, {});
      else entries.forEach(([key, item]) => walk(root, path ? `${path}.${key}` : key, item, depth + 1));
      return;
    }
    add(root, path, value);
  };

  for (const [root, value] of Object.entries(raw)) walk(root, root, value, 0);
  if (count >= maxFields) {
    const last = [...sections.values()].at(-1);
    if (last) last.note += ` Showing the first ${maxFields.toLocaleString('en-US')} fields; the safety limit was reached.`;
  }
  return [...sections.values()];
}
