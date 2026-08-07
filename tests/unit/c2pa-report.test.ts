import { describe, expect, it } from 'vitest';
import { collectValidation, createC2paReport, explainValidationCode } from '../../src/lib/c2pa/report';
import type { C2paReportInput } from '../../src/lib/c2pa/report';

function input(manifestStore: unknown): C2paReportInput {
  return {
    file: {
      name: 'signed.jpg', safeName: 'signed', size: 1_024, mime: 'image/jpeg', declaredMime: 'image/jpeg', inspectedMime: 'image/jpeg',
      detectedType: 'jpeg', extension: 'jpg',
    },
    sha256: 'a'.repeat(64),
    manifestStore,
    activeLabel: 'example:claim',
  };
}

function validStore(state: 'Valid' | 'Trusted' = 'Valid'): any {
  const manifest = {
    title: 'Newsroom export',
    format: 'image/jpeg',
    vendor: 'example.org',
    claim_generator: 'ExampleEditor/4.2',
    claim_version: 2,
    signature_info: { common_name: 'Example Publisher', issuer: 'Example CA', alg: 'Es256', time: '2026-08-01T12:00:00Z' },
    ingredients: [{ title: 'camera-original.jpg', format: 'image/jpeg', relationship: 'parentOf', instance_id: 'xmp:iid:source' }],
    assertions: [{
      label: 'c2pa.actions.v2', kind: 'Cbor', created: true,
      data: { actions: [{ action: 'c2pa.edited', when: '2026-08-01T11:58:00Z', softwareAgent: { name: 'Example Editor', version: '4.2' }, parameters: { redacted: false } }] },
    }, { label: 'c2pa.hash.data', kind: 'Cbor', created: true, data: new Uint8Array(64) }],
  };
  return {
    active_manifest: 'example:claim',
    validation_state: state,
    validation_results: {
      activeManifest: {
        success: [
          { code: 'claimSignature.validated', success: true },
          { code: 'claimSignature.insideValidity', success: true },
          { code: 'assertion.dataHash.match', success: true },
          ...(state === 'Trusted' ? [{ code: 'signingCredential.trusted', success: true }] : []),
        ],
        informational: [{ code: 'signingCredential.ocsp.skipped', success: null }],
        failure: [],
      },
      ingredientDeltas: [],
    },
    manifests: { 'example:claim': manifest },
  };
}

describe('C2PA production report adapter', () => {
  it('keeps Valid separate from Trusted and exposes each verification dimension', () => {
    const report = createC2paReport({ ...input(validStore()), activeManifest: validStore().manifests['example:claim'] });
    expect(report.status).toBe('valid');
    expect(report.validationState).toBe('Valid');
    expect(report.checks).toEqual({ binding: 'passed', signature: 'passed', publisherTrust: 'not-checked', revocation: 'not-checked' });
    expect(report.activeManifest).toMatchObject({ signer: 'Example Publisher', algorithm: 'Es256', assertionCount: 2, ingredientCount: 1 });
  });

  it('uses the SDK failure bucket instead of matching the word valid inside an error', () => {
    const store = validStore();
    store.validation_state = 'Invalid';
    store.validation_results.activeManifest.failure.push({ code: 'claimSignature.invalid', explanation: 'Signature invalid after byte change.', success: false });
    const report = createC2paReport(input(store));
    expect(report.status).toBe('invalid');
    expect(report.validation.failure).toHaveLength(1);
    expect(report.checks.signature).toBe('failed');
  });

  it('recognizes a real Trusted state only when the SDK reports it', () => {
    const report = createC2paReport(input(validStore('Trusted')));
    expect(report.status).toBe('trusted');
    expect(report.checks.publisherTrust).toBe('passed');
  });

  it('extracts actions, ingredients, assertions, and safe binary summaries', () => {
    const store = validStore();
    const report = createC2paReport({ ...input(store), activeManifest: store.manifests['example:claim'] });
    expect(report.actions[0]).toMatchObject({ action: 'c2pa.edited', label: 'Edited', softwareAgent: 'Example Editor 4.2' });
    expect(report.ingredients[0]).toMatchObject({ title: 'camera-original.jpg', relationship: 'parentOf' });
    expect(report.assertions).toHaveLength(2);
    expect(JSON.stringify(report)).toContain('Binary data omitted: 64 bytes');
    expect(JSON.stringify(report)).not.toContain('0,0,0,0,0,0');
  });

  it('returns a fingerprinted no-credential receipt without inventing validation data', () => {
    const report = createC2paReport({ ...input(null), forcedStatus: 'not-found' });
    expect(report.status).toBe('not-found');
    expect(report.activeManifest).toBeNull();
    expect(report.fingerprint?.value).toHaveLength(64);
    expect(report.checks.binding).toBe('not-applicable');
  });

  it('deduplicates repeated status entries while preserving severity and scope', () => {
    const store = validStore();
    store.validation_status = [
      { code: 'signingCredential.untrusted', explanation: 'No configured anchor.' },
      { code: 'signingCredential.untrusted', explanation: 'No configured anchor.' },
    ];
    const validation = collectValidation(store);
    expect(validation.informational.filter((entry) => entry.code === 'signingCredential.untrusted')).toHaveLength(1);
    expect(validation.failure).toHaveLength(0);
  });

  it('provides plain copy for known and unknown SDK codes', () => {
    expect(explainValidationCode('assertion.dataHash.mismatch').title).toBe('File binding mismatch');
    expect(explainValidationCode('vendor.futureStatus').title).toBe('Vendor Future Status');
  });
});
