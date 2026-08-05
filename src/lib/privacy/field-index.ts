import { stringifyDisplayValue } from '../metadata/safe-value';
import type { ImageMetadataField, NormalizedImageMetadata } from '../metadata/types';
import type { ExifToolInspection, MetadataReportField } from '../metadata-report/types';
import { FIELD_ALIASES } from './field-patterns';
import type { IndexedPrivacyField, PrivacyCompleteness, PrivacyEvidenceClass } from './types';

const MAX_SCAN_FIELD_CHARS = 200_000;
export const MAX_PRIVACY_SCAN_CHARS = 2_000_000;

export function normalizePrivacyKey(value: string): string { return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, ''); }

function usable(value: unknown): boolean { return value !== undefined && value !== null && value !== '' && value !== false; }

function privacyEligibleField(key: string, path: string, source: string): boolean {
  const location = `${path} ${source}`;
  if (!/icc(?:_|\s|\b)/i.test(location)) return true;
  return /copyright|rights?|licen[cs]e/i.test(key);
}

function numeric(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string') {
    const fraction = value.match(/^\s*(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/);
    if (fraction) { const denominator = Number(fraction[2]); return denominator ? Number(fraction[1]) / denominator : undefined; }
    const direct = Number(value.trim());
    if (Number.isFinite(direct)) return direct;
    const first = value.match(/-?\d+(?:\.\d+)?/); return first ? Number(first[0]) : undefined;
  }
  return undefined;
}

function asIndexed(field: ImageMetadataField, section: string): IndexedPrivacyField {
  const path = field.path || `${section}.${field.key}`;
  const evidenceClass: PrivacyEvidenceClass = /^(file|technical|container)$/i.test(section) ? 'container' : 'embedded';
  return { normalizedKey: normalizePrivacyKey(field.key), normalizedPath: normalizePrivacyKey(`${section}.${path}`), originalKey: field.key, label: field.label, path, value: field.value, source: field.source, origin: 'parser', groupPath: section, scanStage: 'quick', binary: false, evidenceClass, privacyEligible: privacyEligibleField(field.key, path, field.source) };
}

export function classifyExifToolEvidence(groupPath: string): PrivacyEvidenceClass {
  const groups = groupPath.split(':').map((group) => normalizePrivacyKey(group));
  if (groups.some((group) => group === 'system' || group === 'exiftool')) return 'environment';
  if (groups.some((group) => group === 'composite')) return 'derived';
  if (groups.some((group) => /^(file|jpeg|jfif|png|riff|webp)$/.test(group))) return 'container';
  return 'embedded';
}

function asExifTool(field: MetadataReportField, stage: PrivacyCompleteness): IndexedPrivacyField {
  const evidenceClass = classifyExifToolEvidence(field.groupPath ?? '');
  return {
    normalizedKey: normalizePrivacyKey(field.key), normalizedPath: normalizePrivacyKey(field.path), originalKey: field.key,
    label: field.label, path: field.path, value: field.numericValue ?? field.value, source: field.source,
    origin: 'exiftool', groupPath: field.groupPath, tagId: field.tagId, scanStage: stage, binary: Boolean(field.binarySummary),
    evidenceClass, privacyEligible: evidenceClass !== 'environment' && privacyEligibleField(field.key, field.groupPath ?? field.path, field.source),
  };
}

function aliasesMatch(field: IndexedPrivacyField, aliases: readonly string[]): boolean {
  const originalHasNamespace = /[.:/]/.test(field.originalKey);
  return aliases.some((alias) => {
    const target = normalizePrivacyKey(alias);
    if (field.normalizedKey === target) return true;
    return target.length >= 5 && ((originalHasNamespace && field.normalizedKey.endsWith(target)) || field.normalizedPath.endsWith(target));
  });
}

function dedupe(fields: IndexedPrivacyField[]): IndexedPrivacyField[] {
  const seen = new Set<string>();
  return fields.filter((field) => {
    const fingerprint = `${field.normalizedKey}|${stringifyDisplayValue(field.value).trim().toLowerCase()}`;
    if (seen.has(fingerprint)) return false;
    seen.add(fingerprint); return true;
  });
}

export interface NumericPrivacyField { field: IndexedPrivacyField; value: number }
export interface PrivacyCoordinates { latitude: number; longitude: number; fields: IndexedPrivacyField[] }

export class PrivacyFieldIndex {
  readonly fields: readonly IndexedPrivacyField[];
  readonly readFieldCount: number;
  readonly excludedEnvironmentFieldCount: number;
  private readonly metadata: NormalizedImageMetadata;
  private readonly scanCache = new Map<IndexedPrivacyField, string>();
  private remainingScanChars = MAX_PRIVACY_SCAN_CHARS;
  private exhausted = false;

  constructor(metadata: NormalizedImageMetadata, inspection?: ExifToolInspection, completeness: PrivacyCompleteness = 'quick') {
    this.metadata = metadata;
    const parserFields = metadata.sections.flatMap((section) => section.fields.filter((field) => usable(field.value)).map((field) => asIndexed(field, section.id)));
    const exifFields = inspection?.fields.filter((field) => usable(field.value)).map((field) => asExifTool(field, completeness)) ?? [];
    const fields = [...exifFields, ...parserFields];
    if (metadata.legacy.HasEmbeddedThumbnail === true && !fields.some((field) => aliasesMatch(field, FIELD_ALIASES.thumbnail))) {
      fields.push({ normalizedKey: normalizePrivacyKey('HasEmbeddedThumbnail'), normalizedPath: normalizePrivacyKey('privacy.HasEmbeddedThumbnail'), originalKey: 'HasEmbeddedThumbnail', label: 'Embedded thumbnail', path: 'privacy.HasEmbeddedThumbnail', value: true, source: 'Normalized EXIF', origin: 'derived', scanStage: 'quick', binary: true, evidenceClass: 'derived', privacyEligible: true });
    }
    const unique = dedupe(fields);
    this.readFieldCount = unique.length;
    this.excludedEnvironmentFieldCount = unique.filter((field) => field.evidenceClass === 'environment').length;
    this.fields = unique.filter((field) => field.privacyEligible);
  }

  get scanBudgetExhausted(): boolean { return this.exhausted; }
  get scannedCharacterCount(): number { return MAX_PRIVACY_SCAN_CHARS - this.remainingScanChars; }

  scanText(field: IndexedPrivacyField): string {
    const cached = this.scanCache.get(field);
    if (cached !== undefined) return cached;
    if (this.remainingScanChars <= 0) { this.exhausted = true; this.scanCache.set(field, ''); return ''; }
    const value = stringifyDisplayValue(field.value);
    const length = Math.min(value.length, MAX_SCAN_FIELD_CHARS, this.remainingScanChars);
    const scanned = value.slice(0, length);
    this.remainingScanChars -= length;
    if (length < Math.min(value.length, MAX_SCAN_FIELD_CHARS) || this.remainingScanChars <= 0) this.exhausted = true;
    this.scanCache.set(field, scanned);
    return scanned;
  }

  findFieldsByAliases(aliases: readonly string[]): IndexedPrivacyField[] { return dedupe(this.fields.filter((field) => aliasesMatch(field, aliases))); }

  findNumericField(aliases: readonly string[]): NumericPrivacyField | undefined {
    for (const field of this.findFieldsByAliases(aliases)) { const value = numeric(field.value); if (value !== undefined) return { field, value }; }
    return undefined;
  }

  findStringField(aliases: readonly string[]): IndexedPrivacyField | undefined {
    return this.findFieldsByAliases(aliases).find((field) => typeof field.value === 'string' && field.value.trim().length > 0);
  }

  findValidCoordinates(): PrivacyCoordinates | undefined {
    const families = [
      { latitude: FIELD_ALIASES.latitude, longitude: FIELD_ALIASES.longitude, latitudeRef: FIELD_ALIASES.latitudeRef, longitudeRef: FIELD_ALIASES.longitudeRef, normalized: true },
      { latitude: FIELD_ALIASES.destinationLatitude, longitude: FIELD_ALIASES.destinationLongitude, latitudeRef: FIELD_ALIASES.destinationLatitudeRef, longitudeRef: FIELD_ALIASES.destinationLongitudeRef, normalized: false },
    ];
    for (const family of families) {
      const latitude = this.findNumericField(family.latitude);
      const longitude = this.findNumericField(family.longitude);
      if (!latitude || !longitude) continue;
      let lat = family.normalized ? this.metadata.location.latitude ?? latitude.value : latitude.value;
      let lon = family.normalized ? this.metadata.location.longitude ?? longitude.value : longitude.value;
      const latRef = String(this.findStringField(family.latitudeRef)?.value ?? '').toUpperCase();
      const lonRef = String(this.findStringField(family.longitudeRef)?.value ?? '').toUpperCase();
      if (latRef === 'S' || latRef.includes('SOUTH')) lat = -Math.abs(lat);
      if (lonRef === 'W' || lonRef.includes('WEST')) lon = -Math.abs(lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) continue;
      return { latitude: lat, longitude: lon, fields: dedupe([latitude.field, longitude.field, ...this.findFieldsByAliases([...family.latitudeRef, ...family.longitudeRef])]) };
    }
    return undefined;
  }
}

export function createPrivacyFieldIndex(metadata: NormalizedImageMetadata, inspection?: ExifToolInspection, completeness: PrivacyCompleteness = 'quick'): PrivacyFieldIndex { return new PrivacyFieldIndex(metadata, inspection, completeness); }
