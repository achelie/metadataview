import { toSafeValue } from '../metadata/safe-value';
import type { FileSummary, ParseWarning } from '../metadata/types';
import type {
  C2paActionSummary,
  C2paAssertionSummary,
  C2paCheckState,
  C2paIngredientSummary,
  C2paManifestSummary,
  C2paReport,
  C2paReportStatus,
  C2paValidationEntry,
  C2paValidationSeverity,
} from './types';

const ENGINE_VERSION = '0.13.1';

type UnknownRecord = Record<string, unknown>;

export interface C2paReportInput {
  file: FileSummary & { declaredMime: string; inspectedMime?: string };
  sha256: string | null;
  manifestStore: unknown;
  activeManifest?: unknown;
  activeLabel?: string | null;
  warnings?: ParseWarning[];
  forcedStatus?: 'not-found' | 'unsupported';
}

const codeCopy: Record<string, [string, string]> = {
  'claimSignature.validated': ['Signature matches', 'The active claim signature validated.'],
  'claimSignature.insideValidity': ['Certificate was in date', 'The signature was made within the credential validity period.'],
  'signingCredential.trusted': ['Publisher is trusted', 'The signing credential chains to a configured trust anchor.'],
  'signingCredential.untrusted': ['Publisher is not trusted', 'The signing credential did not chain to a configured trust anchor.'],
  'signingCredential.ocsp.notRevoked': ['Credential not revoked', 'Available revocation information did not mark the signing credential as revoked.'],
  'signingCredential.ocsp.revoked': ['Credential revoked', 'The signing credential was reported as revoked.'],
  'signingCredential.ocsp.skipped': ['Revocation check skipped', 'No online revocation request was made.'],
  'signingCredential.ocsp.inaccessible': ['Revocation service unavailable', 'The credential revocation service could not be reached.'],
  'assertion.dataHash.match': ['File binding matches', 'The signed data hash matches this file.'],
  'assertion.dataHash.mismatch': ['File binding mismatch', 'The signed data hash does not match this file.'],
  'assertion.bmffHash.match': ['Media binding matches', 'The signed BMFF hash matches this media file.'],
  'assertion.bmffHash.mismatch': ['Media binding mismatch', 'The signed BMFF hash does not match this media file.'],
  'assertion.boxesHash.match': ['Container binding matches', 'The signed container hash matches this file.'],
  'assertion.boxesHash.mismatch': ['Container binding mismatch', 'The signed container hash does not match this file.'],
  'assertion.collectionHash.match': ['Collection binding matches', 'The signed collection hash matches this asset.'],
  'assertion.collectionHash.mismatch': ['Collection binding mismatch', 'The signed collection hash does not match this asset.'],
};

function record(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : null;
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function text(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function titleCase(value: string): string {
  return value
    .replace(/^c2pa\./i, '')
    .replace(/^org\.contentauth\./i, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function explainValidationCode(code: string): { title: string; explanation: string } {
  const known = codeCopy[code];
  if (known) return { title: known[0], explanation: known[1] };
  return {
    title: titleCase(code || 'Unknown validation result'),
    explanation: 'The verifier returned this C2PA status code. Keep the code in the report when comparing results with another validator.',
  };
}

function validationEntry(value: unknown, severity: C2paValidationSeverity, scope: string, index: number): C2paValidationEntry | null {
  const source = record(value);
  if (!source) return null;
  const code = text(source.code);
  if (!code) return null;
  const copy = explainValidationCode(code);
  return {
    id: `${scope}-${severity}-${index}-${code}`.replace(/[^a-zA-Z0-9_-]/g, '-'),
    code,
    title: copy.title,
    explanation: text(source.explanation) ?? copy.explanation,
    severity,
    scope,
    url: text(source.url),
  };
}

function collectStatusCodes(target: C2paReport['validation'], value: unknown, scope: string): void {
  const status = record(value);
  if (!status) return;
  (['success', 'informational', 'failure'] as const).forEach((severity) => {
    array(status[severity]).forEach((item, index) => {
      const entry = validationEntry(item, severity, scope, index);
      if (entry) target[severity].push(entry);
    });
  });
}

function dedupeValidation(entries: C2paValidationEntry[]): C2paValidationEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = [entry.severity, entry.scope, entry.code, entry.url ?? '', entry.explanation].join('\u0000');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function collectValidation(manifestStore: unknown): C2paReport['validation'] {
  const output: C2paReport['validation'] = { success: [], informational: [], failure: [] };
  const store = record(manifestStore);
  const results = record(store?.validation_results);
  collectStatusCodes(output, results?.activeManifest, 'Active manifest');
  array(results?.ingredientDeltas).forEach((delta, index) => {
    const item = record(delta);
    collectStatusCodes(output, item?.validationDeltas, `Ingredient delta ${index + 1}`);
  });

  array(store?.validation_status).forEach((item, index) => {
    const source = record(item);
    const code = text(source?.code) ?? '';
    const severity: C2paValidationSeverity = source?.success === true ? 'success'
      : source?.success === null || code === 'signingCredential.untrusted' ? 'informational' : 'failure';
    const entry = validationEntry(item, severity, 'Legacy validation', index);
    if (entry) output[severity].push(entry);
  });

  output.success = dedupeValidation(output.success);
  output.informational = dedupeValidation(output.informational);
  output.failure = dedupeValidation(output.failure);
  return output;
}

function signatureInfo(manifest: UnknownRecord): UnknownRecord {
  return record(manifest.signature_info) ?? {};
}

function manifestSummary(label: string, value: unknown, activeLabel: string | null): C2paManifestSummary {
  const manifest = record(value) ?? {};
  const signature = signatureInfo(manifest);
  return {
    label,
    active: label === activeLabel,
    title: text(manifest.title),
    format: text(manifest.format),
    vendor: text(manifest.vendor),
    claimGenerator: text(manifest.claim_generator),
    claimVersion: numberValue(manifest.claim_version),
    instanceId: text(manifest.instance_id),
    signer: text(signature.common_name),
    issuer: text(signature.issuer),
    algorithm: text(signature.alg),
    signedAt: text(signature.time),
    assertionCount: array(manifest.assertions).length,
    ingredientCount: array(manifest.ingredients).length,
  };
}

function softwareAgent(value: unknown): string | undefined {
  const plain = text(value);
  if (plain) return plain;
  const item = record(value);
  if (!item) return undefined;
  const name = text(item.name);
  const version = text(item.version);
  return [name, version].filter(Boolean).join(' ') || undefined;
}

function extractActions(assertions: unknown[]): C2paActionSummary[] {
  const actions: C2paActionSummary[] = [];
  assertions.forEach((assertion, assertionIndex) => {
    const item = record(assertion);
    if (!item || !/actions/i.test(text(item.label) ?? '')) return;
    const data = record(item.data);
    array(data?.actions).forEach((value, actionIndex) => {
      const action = record(value);
      if (!action) return;
      const code = text(action.action) ?? 'c2pa.unknown';
      const details = { ...action };
      delete details.action;
      delete details.when;
      delete details.softwareAgent;
      delete details.software_agent;
      delete details.digitalSourceType;
      delete details.digital_source_type;
      delete details.description;
      actions.push({
        id: `action-${assertionIndex}-${actionIndex}`,
        action: code,
        label: titleCase(code),
        when: text(action.when),
        softwareAgent: softwareAgent(action.softwareAgent ?? action.software_agent),
        digitalSourceType: text(action.digitalSourceType ?? action.digital_source_type),
        description: text(action.description),
        details: Object.keys(details).length ? toSafeValue(details) : undefined,
      });
    });
  });
  return actions;
}

function ingredientValidation(value: UnknownRecord, scope: string): C2paValidationEntry[] {
  const result: C2paReport['validation'] = { success: [], informational: [], failure: [] };
  collectStatusCodes(result, record(value.validation_results)?.activeManifest, scope);
  array(value.validation_status).forEach((entry, index) => {
    const source = record(entry);
    const code = text(source?.code) ?? '';
    const severity: C2paValidationSeverity = source?.success === true ? 'success'
      : source?.success === null || code === 'signingCredential.untrusted' ? 'informational' : 'failure';
    const normalized = validationEntry(entry, severity, scope, index);
    if (normalized) result[severity].push(normalized);
  });
  return dedupeValidation([...result.failure, ...result.informational, ...result.success]);
}

function extractIngredients(manifest: UnknownRecord): C2paIngredientSummary[] {
  return array(manifest.ingredients).map((value, index) => {
    const item = record(value) ?? {};
    const thumbnail = record(item.thumbnail);
    return {
      id: `ingredient-${index}`,
      title: text(item.title) ?? `Ingredient ${index + 1}`,
      format: text(item.format),
      relationship: text(item.relationship),
      instanceId: text(item.instance_id),
      documentId: text(item.document_id),
      activeManifest: text(item.active_manifest),
      validation: ingredientValidation(item, `Ingredient ${index + 1}`),
      thumbnail: thumbnail ? { format: text(thumbnail.format), identifier: text(thumbnail.identifier) } : undefined,
    };
  });
}

function assertionDescription(label: string): string {
  if (/actions/i.test(label)) return 'A signed record of creation or editing steps.';
  if (/ingredient/i.test(label)) return 'A signed reference to source material used by this asset.';
  if (/hash|binding/i.test(label)) return 'Cryptographic data that binds the credential to the asset.';
  if (/thumbnail/i.test(label)) return 'A resource reference stored with the credential.';
  return 'A signed assertion included by the claim generator.';
}

function extractAssertions(manifest: UnknownRecord): C2paAssertionSummary[] {
  return array(manifest.assertions).map((value, index) => {
    const item = record(value) ?? {};
    const label = text(item.label) ?? `assertion-${index + 1}`;
    return {
      id: `assertion-${index}`,
      label,
      kind: text(item.kind),
      instance: numberValue(item.instance),
      created: item.created === true,
      description: assertionDescription(label),
      data: toSafeValue(item.data, { maxDepth: 14, maxKeys: 20_000, maxStringLength: 100_000 }),
    };
  });
}

function containsCode(entries: C2paValidationEntry[], matcher: RegExp): boolean {
  return entries.some((entry) => matcher.test(entry.code));
}

function inferredCheck(valid: boolean, failed: boolean, passed: boolean): C2paCheckState {
  if (failed) return 'failed';
  if (passed || valid) return 'passed';
  return 'unknown';
}

function checksFor(status: C2paReportStatus, validation: C2paReport['validation']): C2paReport['checks'] {
  if (status === 'not-found' || status === 'unsupported') {
    return { binding: 'not-applicable', signature: 'not-applicable', publisherTrust: 'not-applicable', revocation: 'not-applicable' };
  }
  const valid = status === 'valid' || status === 'trusted';
  const all = [...validation.success, ...validation.informational, ...validation.failure];
  const binding = inferredCheck(valid,
    containsCode(validation.failure, /assertion\.(?:data|bmff|boxes|collection|multiAsset)Hash\.(?:mismatch|missing)/i),
    containsCode(validation.success, /assertion\.(?:data|bmff|boxes|collection|multiAsset)Hash\.match/i));
  const signature = inferredCheck(valid,
    containsCode(validation.failure, /claimSignature\.(?:invalid|mismatch|missing|outsideValidity)|signingCredential\.(?:invalid|ocsp\.revoked)/i),
    containsCode(validation.success, /claimSignature\.validated/i));
  const revocation: C2paCheckState = containsCode(validation.failure, /ocsp\.revoked/i) ? 'failed'
    : containsCode(validation.success, /ocsp\.notRevoked/i) ? 'passed'
      : containsCode(all, /ocsp\.(?:skipped|inaccessible|unknown)/i) ? 'not-checked' : 'unknown';
  return {
    binding,
    signature,
    publisherTrust: status === 'trusted' ? 'passed' : 'not-checked',
    revocation,
  };
}

function reportStatus(store: UnknownRecord, validation: C2paReport['validation']): { status: C2paReportStatus; state: C2paReport['validationState'] } {
  if (validation.failure.length) return { status: 'invalid', state: 'Invalid' };
  const declared = text(store.validation_state)?.toLowerCase();
  if (declared === 'invalid') return { status: 'invalid', state: 'Invalid' };
  if (declared === 'trusted') return { status: 'trusted', state: 'Trusted' };
  return { status: 'valid', state: 'Valid' };
}

function emptyReport(input: C2paReportInput, status: 'not-found' | 'unsupported'): C2paReport {
  const validationState = status === 'not-found' ? 'NotFound' : 'Unsupported';
  return {
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    status,
    validationState,
    file: input.file,
    fingerprint: input.sha256 ? { algorithm: 'SHA-256', value: input.sha256 } : null,
    engine: {
      name: '@contentauth/c2pa-web', version: ENGINE_VERSION, status: status === 'unsupported' ? 'not-run' : 'complete',
      verificationPolicy: 'local-cryptographic-validation', trustList: 'not-configured', networkPolicy: 'same-origin-only',
    },
    activeManifestLabel: null,
    checks: checksFor(status, { success: [], informational: [], failure: [] }),
    activeManifest: null,
    manifests: [], actions: [], ingredients: [], assertions: [],
    validation: { success: [], informational: [], failure: [] },
    warnings: input.warnings ?? [],
    rawManifestStore: null,
  };
}

export function createC2paReport(input: C2paReportInput): C2paReport {
  if (input.forcedStatus) return emptyReport(input, input.forcedStatus);
  const store = record(input.manifestStore);
  if (!store) return emptyReport(input, 'not-found');
  const validation = collectValidation(store);
  const activeLabel = input.activeLabel ?? text(store.active_manifest) ?? null;
  const manifestMap = record(store.manifests) ?? {};
  const summaries = Object.entries(manifestMap).map(([label, manifest]) => manifestSummary(label, manifest, activeLabel));
  const activeValue = record(input.activeManifest) ?? record(activeLabel ? manifestMap[activeLabel] : undefined) ?? {};
  const activeSummary = activeLabel
    ? summaries.find((manifest) => manifest.label === activeLabel) ?? manifestSummary(activeLabel, activeValue, activeLabel)
    : null;
  const result = reportStatus(store, validation);
  return {
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    status: result.status,
    validationState: result.state,
    file: input.file,
    fingerprint: input.sha256 ? { algorithm: 'SHA-256', value: input.sha256 } : null,
    engine: {
      name: '@contentauth/c2pa-web', version: ENGINE_VERSION, status: 'complete',
      verificationPolicy: 'local-cryptographic-validation', trustList: 'not-configured', networkPolicy: 'same-origin-only',
    },
    activeManifestLabel: activeLabel,
    checks: checksFor(result.status, validation),
    activeManifest: activeSummary,
    manifests: summaries.sort((a, b) => Number(b.active) - Number(a.active)),
    actions: extractActions(array(activeValue.assertions)),
    ingredients: extractIngredients(activeValue),
    assertions: extractAssertions(activeValue),
    validation,
    warnings: input.warnings ?? [],
    rawManifestStore: toSafeValue(store, { maxDepth: 16, maxKeys: 20_000, maxStringLength: 100_000 }),
  };
}

export function c2paEngineVersion(): string {
  return ENGINE_VERSION;
}
