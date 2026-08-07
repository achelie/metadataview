import { FIELD_ALIASES, SOFTWARE_NAMES, EMAIL_PATTERN, INTERNAL_ADDRESS_PATTERN, TOKEN_URL_PATTERN, UNIX_PATH_PATTERN, WINDOWS_PATH_PATTERN } from './field-patterns';
import { recommendations } from './recommendations';
import { makeRisk } from './risk-utils';
import type { IndexedPrivacyField, PrivacyRisk, PrivacyRule } from './types';

function textFields(fields: IndexedPrivacyField[]): IndexedPrivacyField[] { return fields.filter((field) => typeof field.value === 'string' && field.value.trim().length > 0); }
function cameraGroup(field: IndexedPrivacyField): boolean {
  const path = `${field.groupPath ?? ''}:${field.path}`.toLowerCase();
  if (field.groupPath?.toLowerCase() === 'camera' || field.path.toLowerCase().startsWith('camera.')) return true;
  return /(?:^|:)(?:ifd\d*|exif|makernotes?|canon|nikon|sony|fujifilm|olympus|panasonic|pentax|apple|samsung)(?::|$)/i.test(path);
}
function obviousCreator(field: IndexedPrivacyField): boolean {
  const value = String(field.value).trim();
  return value.length >= 2 && value.length <= 300 && !SOFTWARE_NAMES.test(value);
}
function validEmailIn(value: string): boolean {
  if (!value.includes('@')) return false;
  const candidates = value.match(/[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,63}/gi) ?? [];
  return candidates.some((candidate) => EMAIL_PATTERN.test(candidate));
}
function phoneLikeValue(value: string): boolean {
  const text = value.trim();
  if (/\b(?:guid|uuid|hash|checksum)\b/i.test(text)) return false;
  if (/\b\d{4}[:/-]\d{2}[:/-]\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?/i.test(text)) return false;
  if (/^\d+(?:\.\d+){2,}$/.test(text)) return false;
  if (/^-?\d+(?:\.\d+)?(?:[ ,]+-?\d+(?:\.\d+)?){1,}$/.test(text)) return false;
  if (/^[0-9a-f]{16,}$/i.test(text.replace(/[-{}]/g, ''))) return false;
  const candidates = text.match(/(?:^|[^\d])(?:\+?\d[\d ().-]{5,}\d)(?=$|[^\d])/g) ?? [];
  return candidates.some((candidate) => {
    const cleaned = candidate.trim().replace(/^[^+\d]+|[^\d]+$/g, '');
    const digits = cleaned.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) return false;
    if (/^(?:19|20)\d{6,12}$/.test(digits)) return false;
    return /[+() .-]/.test(cleaned);
  });
}
function obviousContact(field: IndexedPrivacyField): boolean {
  const value = String(field.value).trim();
  if (!value.includes('@') && !/\d/.test(value) && !/email|tel|phone|adr|address|url/i.test(field.originalKey)) return false;
  if (/email/i.test(field.originalKey)) return validEmailIn(value);
  if (validEmailIn(value)) return true;
  if (/tel|phone/i.test(field.originalKey)) return value.replace(/\D/g, '').length >= 7;
  if (/adr|address/i.test(field.originalKey)) return value.length >= 6;
  if (/url/i.test(field.originalKey)) return /^https?:\/\/\S+$/i.test(value);
  return phoneLikeValue(value);
}
function thumbnailValue(field: IndexedPrivacyField): boolean {
  return field.value === true || (typeof field.value === 'string' && /binary data|\d+ bytes|thumbnail/i.test(field.value));
}

const preciseLocationRule: PrivacyRule = {
  id: 'precise-location', category: 'location', title: 'Precise GPS coordinates', severity: 'critical', weight: 40,
  evaluate({ fieldIndex }): PrivacyRisk | null {
    const coordinates = fieldIndex.findValidCoordinates();
    if (!coordinates) return null;
    const extras = [...fieldIndex.findFieldsByAliases(FIELD_ALIASES.altitude), ...fieldIndex.findFieldsByAliases(FIELD_ALIASES.direction)];
    return makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields: [...coordinates.fields, ...extras], description: 'This image contains precise GPS coordinates that may reveal where it was captured.', recommendation: recommendations.location });
  },
};

const altitudeRule: PrivacyRule = {
  id: 'gps-altitude', category: 'location', title: 'GPS altitude', severity: 'low', weight: 5,
  evaluate({ fieldIndex }): PrivacyRisk | null {
    if (fieldIndex.findValidCoordinates()) return null;
    const field = fieldIndex.findNumericField(FIELD_ALIASES.altitude)?.field;
    return field ? makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields: [field], description: 'Altitude alone is not a precise location, but it still reveals context about where the image was created.', recommendation: recommendations.location }) : null;
  },
};

const directionRule: PrivacyRule = {
  id: 'gps-direction', category: 'location', title: 'Camera direction', severity: 'low', weight: 3,
  evaluate({ fieldIndex }): PrivacyRisk | null {
    if (fieldIndex.findValidCoordinates()) return null;
    const field = fieldIndex.findNumericField(FIELD_ALIASES.direction)?.field;
    return field ? makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields: [field], description: 'The image records the direction the camera was facing. This is contextual rather than a precise location by itself.', recommendation: recommendations.location }) : null;
  },
};

export const privacyRules: PrivacyRule[] = [
  preciseLocationRule,
  altitudeRule,
  directionRule,
  {
    id: 'approximate-location', category: 'location', title: 'Named place or location', severity: 'medium', weight: 15,
    evaluate({ fieldIndex }) {
      if (fieldIndex.findValidCoordinates()) return null;
      return makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields: textFields(fieldIndex.findFieldsByAliases(FIELD_ALIASES.place)), description: 'A city, venue, scene, or named place can still reveal where the image came from even without coordinates.', recommendation: recommendations.location });
    },
  },
  {
    id: 'device-model', category: 'device', title: 'Camera or phone model', severity: 'low', weight: 5,
    evaluate({ fieldIndex }) { const fields = fieldIndex.findFieldsByAliases(FIELD_ALIASES.deviceModel).filter(cameraGroup); return makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields, description: 'The image names the camera, phone, or lens used to create it. This is usually a small privacy signal, not a direct identifier.', recommendation: recommendations.device }); },
  },
  {
    id: 'device-identifier', category: 'device', title: 'Unique device identifier', severity: 'high', weight: 25,
    evaluate({ fieldIndex }) { return makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields: fieldIndex.findFieldsByAliases(FIELD_ALIASES.deviceIdentifier), description: 'A unique device identifier may allow multiple images to be linked to the same camera or device.', recommendation: recommendations.device }); },
  },
  {
    id: 'device-owner', category: 'identity', title: 'Camera owner name', severity: 'high', weight: 20,
    evaluate({ fieldIndex }) { return makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields: textFields(fieldIndex.findFieldsByAliases(FIELD_ALIASES.deviceOwner)), description: 'A camera owner field may directly identify the person associated with the device.', recommendation: recommendations.identity }); },
  },
  {
    id: 'creator-identity', category: 'identity', title: 'Author or creator name', severity: 'medium', weight: 15,
    evaluate({ fieldIndex }) { return makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields: textFields(fieldIndex.findFieldsByAliases(FIELD_ALIASES.creator)).filter(obviousCreator), description: 'The image contains an author or credit field that may identify its creator or source.', recommendation: recommendations.identity }); },
  },
  {
    id: 'contact-details', category: 'identity', title: 'Email or contact information', severity: 'high', weight: 25,
    evaluate({ fieldIndex }) {
      const candidates = new Set([
        ...fieldIndex.findFieldsByAliases(FIELD_ALIASES.contact),
        ...fieldIndex.fields.filter((field) => !field.binary && typeof field.value === 'string' && obviousContact({ ...field, value: fieldIndex.scanText(field) })),
      ]);
      return makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields: textFields([...candidates]).filter(obviousContact), description: 'The image contains contact information that can directly identify or reach a person.', recommendation: recommendations.identity });
    },
  },
  {
    id: 'named-people', category: 'identity', title: 'Named people or face regions', severity: 'high', weight: 20,
    evaluate({ fieldIndex }) { return makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields: textFields(fieldIndex.findFieldsByAliases(FIELD_ALIASES.people)), description: 'Person or region labels may identify people shown in the image even when the pixels are never analyzed.', recommendation: recommendations.identity }); },
  },
  {
    id: 'rights-information', category: 'identity', title: 'Ownership or rights information', severity: 'medium', weight: 8,
    evaluate({ fieldIndex }) { return makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields: textFields(fieldIndex.findFieldsByAliases(FIELD_ALIASES.rights)), description: 'The image contains ownership or rights information that may identify its creator or source.', recommendation: recommendations.rights }); },
  },
  {
    id: 'capture-time', category: 'time', title: 'Original capture time', severity: 'medium', weight: 10,
    evaluate({ fieldIndex }) { return makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields: fieldIndex.findFieldsByAliases(FIELD_ALIASES.captureTime), description: 'An embedded capture timestamp can connect the image to a routine, trip, meeting, or specific event.', recommendation: recommendations.time }); },
  },
  {
    id: 'modification-time', category: 'time', title: 'Embedded modification time', severity: 'low', weight: 3,
    evaluate({ fieldIndex }) { if (fieldIndex.findFieldsByAliases(FIELD_ALIASES.captureTime).length) return null; return makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields: fieldIndex.findFieldsByAliases(FIELD_ALIASES.modificationTime), description: 'The file contains an internal modification timestamp. It is weaker evidence than the original capture time.', recommendation: recommendations.time }); },
  },
  {
    id: 'software-information', category: 'editing', title: 'Editing software', severity: 'low', weight: 3,
    evaluate({ fieldIndex }) { return makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields: textFields(fieldIndex.findFieldsByAliases(FIELD_ALIASES.software)), description: 'The image names software used to create or process it.', recommendation: recommendations.software }); },
  },
  {
    id: 'editing-history', category: 'document-history', title: 'Editing history or persistent document IDs', severity: 'medium', weight: 8,
    evaluate({ fieldIndex }) {
      const fields = fieldIndex.findFieldsByAliases(FIELD_ALIASES.editingHistory);
      const detailed = fields.some((field) => /history|derivedfrom/i.test(field.originalKey));
      return makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: detailed ? 15 : this.weight, fields, description: detailed ? 'The metadata preserves editing actions or source-document relationships that expose a production trail.' : 'Persistent document identifiers can link versions of the same asset without directly identifying a person.', recommendation: recommendations.history });
    },
  },
  {
    id: 'original-file-reference', category: 'document-history', title: 'Original file name or source reference', severity: 'low', weight: 5,
    evaluate({ fieldIndex }) { return makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields: textFields(fieldIndex.findFieldsByAliases(FIELD_ALIASES.originalFile)), description: 'A preserved source filename can expose a project name, naming convention, or where the image originated.', recommendation: recommendations.history }); },
  },
  {
    id: 'embedded-thumbnail', category: 'thumbnail', title: 'Embedded thumbnail', severity: 'medium', weight: 12,
    evaluate({ fieldIndex }) { return makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields: fieldIndex.findFieldsByAliases(FIELD_ALIASES.thumbnail).filter(thumbnailValue), description: 'The file contains an embedded thumbnail that may preserve an earlier version of the image.', recommendation: recommendations.thumbnail }); },
  },
  {
    id: 'local-file-path', category: 'identity', title: 'Local file path', severity: 'high', weight: 20,
    evaluate({ fieldIndex }) { const fields = fieldIndex.fields.filter((field) => !field.binary && (WINDOWS_PATH_PATTERN.test(fieldIndex.scanText(field)) || UNIX_PATH_PATTERN.test(fieldIndex.scanText(field)))); return makeRisk({ id: this.id, category: this.category, title: this.title, severity: this.severity, score: this.weight, fields, description: 'A local path may reveal a computer username, folder structure, project name, or internal asset location.', recommendation: recommendations.path }); },
  },
  {
    id: 'internal-network-address', category: 'other', title: 'Internal address or credential-bearing URL', severity: 'medium', weight: 10,
    evaluate({ fieldIndex }) {
      const fields = fieldIndex.fields.filter((field) => !field.binary && (INTERNAL_ADDRESS_PATTERN.test(fieldIndex.scanText(field)) || TOKEN_URL_PATTERN.test(fieldIndex.scanText(field))));
      const token = fields.some((field) => TOKEN_URL_PATTERN.test(fieldIndex.scanText(field)));
      return makeRisk({ id: this.id, category: this.category, title: this.title, severity: token ? 'high' : this.severity, score: token ? 25 : this.weight, fields, description: token ? 'A URL appears to contain a credential or access token. The checker never opens it.' : 'The metadata references a private network, localhost, or internal file resource. The checker never opens it.', recommendation: recommendations.network });
    },
  },
];
