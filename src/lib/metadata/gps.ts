import type { ExifFieldEntry } from './exif-reader';
import type { ImageLocation } from './types';

function rational(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const fraction = value.match(/^\s*(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/);
    if (fraction) { const denominator = Number(fraction[2]); return denominator ? Number(fraction[1]) / denominator : undefined; }
    const number = Number(value); return Number.isFinite(number) ? number : undefined;
  }
  if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    const numerator = Number(object.numerator ?? object.num);
    const denominator = Number(object.denominator ?? object.den);
    if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) return numerator / denominator;
  }
  return undefined;
}

function coordinate(value: unknown): number | undefined {
  if (Array.isArray(value) && value.length >= 3) {
    const degrees = rational(value[0]), minutes = rational(value[1]), seconds = rational(value[2]);
    if (degrees !== undefined && minutes !== undefined && seconds !== undefined) return Math.abs(degrees) + minutes / 60 + seconds / 3600;
  }
  if (typeof value === 'string') {
    const values = value.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    if (values.length >= 3) return Math.abs(values[0] ?? 0) + (values[1] ?? 0) / 60 + (values[2] ?? 0) / 3600;
  }
  return rational(value);
}

function entry(fields: ExifFieldEntry[], names: string[]): ExifFieldEntry | undefined {
  const targets = names.map((name) => name.toLowerCase().replace(/[ _-]/g, ''));
  return fields.find((field) => targets.includes(field.key.toLowerCase().replace(/[ _-]/g, '')));
}

function signedCoordinate(raw: unknown, ref: unknown, latitude: boolean): number | undefined {
  let value = coordinate(raw);
  if (value === undefined) return undefined;
  const reference = String(ref ?? '').trim().toUpperCase();
  if (reference === 'S' || reference === 'W' || reference.includes('SOUTH') || reference.includes('WEST')) value = -Math.abs(value);
  else if (reference === 'N' || reference === 'E' || reference.includes('NORTH') || reference.includes('EAST')) value = Math.abs(value);
  const max = latitude ? 90 : 180;
  return Number.isFinite(value) && Math.abs(value) <= max ? value : undefined;
}

export function extractGps(fields: ExifFieldEntry[]): ImageLocation {
  const latEntry = entry(fields, ['GPSLatitude']);
  const lonEntry = entry(fields, ['GPSLongitude']);
  const latitude = signedCoordinate(latEntry?.value, entry(fields, ['GPSLatitudeRef'])?.value, true);
  const longitude = signedCoordinate(lonEntry?.value, entry(fields, ['GPSLongitudeRef'])?.value, false);
  const altitudeValue = rational(entry(fields, ['GPSAltitude'])?.value);
  const altitudeRef = rational(entry(fields, ['GPSAltitudeRef'])?.value);
  const altitude = altitudeValue === undefined ? undefined : altitudeRef === 1 ? -Math.abs(altitudeValue) : altitudeValue;
  const direction = rational(entry(fields, ['GPSImgDirection'])?.value);
  const valid = latitude !== undefined && longitude !== undefined && !(latitude === 0 && longitude === 0);
  return { latitude, longitude, altitude, direction, rawLatitude: latEntry?.value, rawLongitude: lonEntry?.value, valid };
}

export function coordinatesText(location: ImageLocation): string | undefined {
  return location.valid ? `${location.latitude!.toFixed(6)}, ${location.longitude!.toFixed(6)}` : undefined;
}
