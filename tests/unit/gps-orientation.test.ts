import { describe, expect, it } from 'vitest';
import type { ExifFieldEntry } from '../../src/lib/metadata/exif-reader';
import { coordinatesText, extractGps } from '../../src/lib/metadata/gps';
import { displayDimensions, orientationNumber, ORIENTATION_LABELS } from '../../src/lib/metadata/orientation';

const fields = (values: Record<string, unknown>): ExifFieldEntry[] => Object.entries(values).map(([key, value]) => ({ key, value, path: `gps.${key}`, source: 'EXIF GPS' }));

describe('GPS normalization', () => {
  it('reads decimal coordinates', () => expect(extractGps(fields({ GPSLatitude: 37.77, GPSLongitude: -122.42 })).valid).toBe(true));
  it('converts DMS arrays', () => expect(extractGps(fields({ GPSLatitude: [37, 46, 30], GPSLatitudeRef: 'N', GPSLongitude: [122, 25, 10], GPSLongitudeRef: 'W' }))).toMatchObject({ latitude: 37.775, longitude: -122.41944444444445, valid: true }));
  it('understands rational components', () => expect(extractGps(fields({ GPSLatitude: [{ numerator: 10, denominator: 1 }, 30, 0], GPSLongitude: [20, 0, 0] }))).toMatchObject({ latitude: 10.5, longitude: 20 }));
  it('understands verbose south and west references', () => expect(extractGps(fields({ GPSLatitude: 3, GPSLatitudeRef: 'South latitude', GPSLongitude: 4, GPSLongitudeRef: 'West longitude' }))).toMatchObject({ latitude: -3, longitude: -4 }));
  it('rejects invalid coordinate ranges', () => expect(extractGps(fields({ GPSLatitude: 91, GPSLongitude: 181 })).valid).toBe(false));
  it('does not treat 0,0 as a valid shareable location', () => expect(extractGps(fields({ GPSLatitude: 0, GPSLongitude: 0 })).valid).toBe(false));
  it('applies below-sea-level altitude reference', () => expect(extractGps(fields({ GPSLatitude: 1, GPSLongitude: 2, GPSAltitude: 14, GPSAltitudeRef: 1 })).altitude).toBe(-14));
  it('prints valid coordinates with six decimals', () => expect(coordinatesText(extractGps(fields({ GPSLatitude: 1.2, GPSLongitude: 3.4 })))).toBe('1.200000, 3.400000'));
});

describe('EXIF orientation', () => {
  it('accepts numeric values 1 through 8', () => expect(orientationNumber(6)).toBe(6));
  it('reads ExifReader right-top descriptions', () => expect(orientationNumber('right-top')).toBe(6));
  it('reads human rotation descriptions', () => expect(orientationNumber('Rotate 90 clockwise')).toBe(6));
  it('swaps display dimensions for sideways orientations', () => expect(displayDimensions(4000, 3000, 8)).toEqual({ width: 3000, height: 4000 }));
  it('keeps dimensions for normal orientation', () => expect(displayDimensions(4000, 3000, 1)).toEqual({ width: 4000, height: 3000 }));
  it('has a readable label for every orientation', () => expect(Object.keys(ORIENTATION_LABELS)).toHaveLength(8));
});
