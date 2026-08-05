import type { FileSummary, MetadataSection } from './types';

const MAX_DEPTH = 12;
const MAX_KEYS = 10_000;

export function sanitizeFilename(name: string, suffix = ''): string {
  const base = name.replace(/\.[^.]+$/, '').normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/[-_.]{2,}/g, '-').replace(/^[-_.]+|[-_.]+$/g, '').slice(0, 80) || 'metadata-file';
  return `${base}${suffix}`;
}

export function makeFileSummary(file: File, detectedType: FileSummary['detectedType']): FileSummary {
  return {
    name: file.name.replace(/[<>"'&]/g, ''),
    safeName: sanitizeFilename(file.name),
    size: file.size,
    mime: file.type || 'application/octet-stream',
    detectedType,
    extension: file.name.split('.').pop()?.toLowerCase() ?? '',
    lastModified: file.lastModified ? new Date(file.lastModified).toISOString() : undefined,
  };
}

export function toJsonSafe(value: unknown, depth = 0, seen = new WeakSet<object>(), counter = { value: 0 }): unknown {
  if (depth > MAX_DEPTH) return '[Maximum depth reached]';
  if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) return value;
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'undefined') return null;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Uint8Array) return `[Binary data: ${value.byteLength} bytes]`;
  if (ArrayBuffer.isView(value)) return `[Binary data: ${value.byteLength} bytes]`;
  if (value instanceof ArrayBuffer) return `[Binary data: ${value.byteLength} bytes]`;
  if (Array.isArray(value)) return value.slice(0, 2_000).map((item) => toJsonSafe(item, depth + 1, seen, counter));
  if (typeof value === 'object') {
    if (seen.has(value)) return '[Circular reference]';
    seen.add(value);
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      counter.value += 1;
      if (counter.value > MAX_KEYS) { output._truncated = 'Metadata output limit reached'; break; }
      output[key] = toJsonSafe(item, depth + 1, seen, counter);
    }
    seen.delete(value);
    return output;
  }
  return String(value);
}

export function recordToItems(record: Record<string, unknown>): MetadataSection['items'] {
  return Object.entries(record).map(([key, value]) => ({ key, value }));
}

export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = sanitizeFilename(filename, '.json');
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export function countMetadataValues(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + countMetadataValues(item), 0);
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).reduce<number>((sum, item) => sum + countMetadataValues(item), 0);
  return 1;
}
