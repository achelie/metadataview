const PRIORITY_KEYS = [
  'Make', 'Model', 'UniqueCameraModel', 'SerialNumber', 'BodySerialNumber', 'LensSerialNumber',
  'CameraOwnerName', 'DateTimeOriginal', 'CreateDate', 'ModifyDate', 'GPSLatitude', 'GPSLongitude',
  'GPSAltitude', 'GPSDateStamp', 'GPSImgDirection', 'Location', 'City', 'State', 'Country', 'Artist',
  'Author', 'Creator', 'OwnerName', 'Copyright', 'Credit', 'Contact', 'Email', 'By-line', 'Software',
  'CreatorTool', 'History', 'DocumentID', 'InstanceID', 'DerivedFrom', 'Orientation', 'ColorSpace',
];

function unwrap(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const record = value as Record<string, unknown>;
  if ('description' in record && record.description !== undefined) return record.description;
  if ('value' in record && record.value !== undefined) return record.value;
  return value;
}

function findKey(value: unknown, target: string, visited = new WeakSet<object>()): unknown {
  if (!value || typeof value !== 'object') return undefined;
  if (visited.has(value)) return undefined;
  visited.add(value);
  const record = value as Record<string, unknown>;
  for (const [key, item] of Object.entries(record)) if (key.toLowerCase() === target.toLowerCase()) return unwrap(item);
  for (const item of Object.values(record)) {
    const found = findKey(item, target, visited);
    if (found !== undefined) return found;
  }
  return undefined;
}

export function normalizeImageMetadata(raw: Record<string, unknown>, textMetadata: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  for (const key of PRIORITY_KEYS) {
    const value = findKey(raw, key);
    if (value !== undefined && value !== '') normalized[key] = value;
  }
  for (const [key, value] of Object.entries(textMetadata)) normalized[key] = value;
  normalized.HasEmbeddedThumbnail = Boolean(findKey(raw, 'Thumbnail') || findKey(raw, 'ThumbnailImage'));
  return normalized;
}

export function flattenMetadata(input: unknown, prefix = '', output: Record<string, unknown> = {}, depth = 0): Record<string, unknown> {
  if (depth > 8 || input === null || input === undefined) return output;
  if (typeof input !== 'object' || input instanceof Date || ArrayBuffer.isView(input)) {
    if (prefix) output[prefix] = unwrap(input);
    return output;
  }
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !('description' in (value as Record<string, unknown>)) && !Array.isArray(value)) flattenMetadata(value, path, output, depth + 1);
    else output[path] = unwrap(value);
  }
  return output;
}
