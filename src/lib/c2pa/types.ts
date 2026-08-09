import type { ParseWarning } from '../metadata/types';
import type { C2paFileSummary } from './formats';

export type C2paReportStatus = 'trusted' | 'valid' | 'invalid' | 'not-found' | 'unsupported';
export type C2paValidationSeverity = 'success' | 'informational' | 'failure';
export type C2paCheckState = 'passed' | 'failed' | 'not-checked' | 'not-applicable' | 'unknown';

export interface C2paValidationEntry {
  id: string;
  code: string;
  title: string;
  explanation: string;
  severity: C2paValidationSeverity;
  scope: string;
  url?: string;
}

export interface C2paCheckSummary {
  binding: C2paCheckState;
  signature: C2paCheckState;
  publisherTrust: C2paCheckState;
  revocation: C2paCheckState;
}

export interface C2paActionSummary {
  id: string;
  action: string;
  label: string;
  when?: string;
  softwareAgent?: string;
  digitalSourceType?: string;
  description?: string;
  details?: unknown;
}

export interface C2paIngredientSummary {
  id: string;
  title: string;
  format?: string;
  relationship?: string;
  instanceId?: string;
  documentId?: string;
  activeManifest?: string;
  validation: C2paValidationEntry[];
  thumbnail?: { format?: string; identifier?: string };
}

export interface C2paAssertionSummary {
  id: string;
  label: string;
  kind?: string;
  instance?: number;
  created: boolean;
  description: string;
  data: unknown;
}

export interface C2paManifestSummary {
  label: string;
  active: boolean;
  title?: string;
  format?: string;
  vendor?: string;
  claimGenerator?: string;
  claimVersion?: number;
  instanceId?: string;
  signer?: string;
  issuer?: string;
  algorithm?: string;
  signedAt?: string;
  assertionCount: number;
  ingredientCount: number;
}

export interface C2paReport {
  schemaVersion: '1.0';
  generatedAt: string;
  status: C2paReportStatus;
  validationState: 'Trusted' | 'Valid' | 'Invalid' | 'NotFound' | 'Unsupported';
  file: C2paFileSummary;
  fingerprint: {
    algorithm: 'SHA-256';
    value: string;
  } | null;
  engine: {
    name: '@contentauth/c2pa-web';
    version: string;
    status: 'complete' | 'not-run';
    verificationPolicy: 'local-cryptographic-validation';
    trustList: 'not-configured';
    networkPolicy: 'same-origin-only';
  };
  activeManifestLabel: string | null;
  checks: C2paCheckSummary;
  activeManifest: C2paManifestSummary | null;
  manifests: C2paManifestSummary[];
  actions: C2paActionSummary[];
  ingredients: C2paIngredientSummary[];
  assertions: C2paAssertionSummary[];
  validation: {
    success: C2paValidationEntry[];
    informational: C2paValidationEntry[];
    failure: C2paValidationEntry[];
  };
  warnings: ParseWarning[];
  rawManifestStore: unknown;
}

export type C2paProgressStage = 'checking-file' | 'loading-engine' | 'reading-credential' | 'validating' | 'building-report';

export interface C2paVerificationOptions {
  onProgress?: (stage: C2paProgressStage) => void;
  timeoutMs?: number;
}
