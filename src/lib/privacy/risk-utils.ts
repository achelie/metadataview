import { stringifyDisplayValue } from '../metadata/safe-value';
import { normalizePrivacyKey } from './field-index';
import { FIELD_ALIASES } from './field-patterns';
import type { DetectedPrivacyField, IndexedPrivacyField, PrivacyCategory, PrivacyRisk, RiskSeverity } from './types';

const MAX_FIELD_PREVIEW = 360;
const LOCATION_FAMILIES: Array<[string, readonly string[]]> = Object.entries({
  latitudeRef: FIELD_ALIASES.latitudeRef,
  longitudeRef: FIELD_ALIASES.longitudeRef,
  latitude: FIELD_ALIASES.latitude,
  longitude: FIELD_ALIASES.longitude,
  altitude: FIELD_ALIASES.altitude,
  direction: FIELD_ALIASES.direction,
});

export function maskSensitiveText(value: string): string {
  return value
    .replace(/([A-Za-z]:\\Users\\)([^\\\s]+)/gi, (_, prefix: string, user: string) => `${prefix}${user.slice(0, 2)}***`)
    .replace(/(\/(?:Users|home)\/)([^/\s]+)/gi, (_, prefix: string, user: string) => `${prefix}${user.slice(0, 2)}***`)
    .replace(/([A-Z0-9.!#$%&'*+/=?^_`{|}~-]{2})[A-Z0-9.!#$%&'*+/=?^_`{|}~-]*(@[A-Z0-9.-]+\.[A-Z]{2,63})/gi, '$1***$2')
    .replace(/(?:\+?\d[\d ().-]{6,}\d)/g, (phone) => `${phone.slice(0, 3)}***${phone.slice(-2)}`)
    .replace(/([?&](?:access_?token|auth|api_?key|secret|signature|sig)=)[^&#\s]+/gi, '$1[redacted]');
}

function preview(field: IndexedPrivacyField, category: PrivacyCategory): string {
  if (category === 'ai-generation' && field.value && typeof field.value === 'object') {
    const size = Array.isArray(field.value) ? field.value.length : Object.keys(field.value as Record<string, unknown>).length;
    return `[Workflow data: ${size} top-level ${size === 1 ? 'entry' : 'entries'}]`;
  }
  const normalizedKey = normalizePrivacyKey(field.originalKey);
  const original = stringifyDisplayValue(field.value);
  let masked = maskSensitiveText(original);
  if (category === 'location' && /(latitude|longitude|gpsposition)/.test(normalizedKey)) {
    const coordinate = Number(field.value);
    if (Number.isFinite(coordinate)) masked = `${coordinate.toFixed(2)}… (masked)`;
  } else if (category === 'device' && /(serial|unique|deviceid|cameraid)/.test(normalizedKey) && original.length > 4) {
    masked = `${original.slice(0, 2)}***${original.slice(-2)}`;
  } else if (category === 'identity' && /(owner|artist|author|creator|person|byline)/.test(normalizedKey) && masked === original && original.length > 1) {
    masked = `${original.slice(0, 1)}***`;
  }
  return masked.length > MAX_FIELD_PREVIEW ? `${masked.slice(0, MAX_FIELD_PREVIEW)}…` : masked;
}

export function detectedFields(fields: readonly IndexedPrivacyField[], category: PrivacyCategory, label?: string): DetectedPrivacyField[] {
  const seen = new Set<string>();
  const output: DetectedPrivacyField[] = [];
  for (const field of fields) {
    const rawDisplay = stringifyDisplayValue(field.value);
    const rawText = rawDisplay.trim().toLowerCase();
    const normalized = normalizePrivacyKey(field.originalKey);
    const semantic = (category === 'location' ? LOCATION_FAMILIES : []).find(([, aliases]) => aliases.some((alias) => normalized === normalizePrivacyKey(alias) || normalized.endsWith(normalizePrivacyKey(alias))))?.[0] ?? (category === 'location' ? normalized : '');
    const fingerprint = `${semantic}|${rawText}`;
    if (!rawText || seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    const displayValue = preview(field, category);
    output.push({
      key: field.originalKey,
      label: label ?? field.label,
      category,
      source: field.source,
      displayValue,
      rawValue: field.value,
      sensitive: true,
      origin: field.origin,
      path: field.path,
      groupPath: field.groupPath,
      tagId: field.tagId,
      scanStage: field.scanStage,
      masked: displayValue !== rawDisplay,
      evidenceClass: field.evidenceClass,
      privacyEligible: field.privacyEligible,
    });
  }
  return output;
}

export function makeRisk(input: {
  id: string; category: PrivacyCategory; title: string; severity: RiskSeverity; score: number;
  fields: readonly IndexedPrivacyField[]; description: string; recommendation: string; removable?: boolean; combination?: boolean;
}): PrivacyRisk | null {
  const fields = detectedFields(input.fields, input.category);
  if (!fields.length) return null;
  return { id: input.id, category: input.category, title: input.title, severity: input.severity, score: input.score, fields, description: input.description, recommendation: input.recommendation, removable: input.removable ?? true, combination: input.combination };
}

export function riskFields(risks: readonly PrivacyRisk[], ids: readonly string[]): IndexedPrivacyField[] {
  return risks.filter((risk) => ids.includes(risk.id)).flatMap((risk) => risk.fields.map((field) => ({
    normalizedKey: normalizePrivacyKey(field.key),
    normalizedPath: normalizePrivacyKey(field.path),
    originalKey: field.key,
    label: field.label,
    path: field.path,
    value: field.rawValue ?? field.displayValue,
    source: field.source,
    origin: field.origin,
    groupPath: field.groupPath,
    tagId: field.tagId,
    scanStage: field.scanStage,
    binary: false,
    evidenceClass: field.evidenceClass,
    privacyEligible: field.privacyEligible,
  })));
}
