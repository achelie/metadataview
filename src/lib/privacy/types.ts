import type { NormalizedImageMetadata } from '../metadata/types';
import type { MetadataInspectionMode, MetadataReportField } from '../metadata-report/types';
import type { PrivacyFieldIndex } from './field-index';

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type PrivacyLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type PrivacyCategory = 'location' | 'device' | 'identity' | 'time' | 'editing' | 'thumbnail' | 'document-history' | 'other';
export type PrivacyCompleteness = 'quick' | 'standard' | 'embedded';
export type PrivacyScanStage = PrivacyCompleteness | 'cleaned';
export type PrivacyFieldOrigin = MetadataReportField['origin'] | 'derived';
export type PrivacyEvidenceClass = 'embedded' | 'container' | 'derived' | 'environment';
export type PrivacyCleanupMode = 'privacy-first' | 'preserve-encoding';
export type PrivacyVerificationStatus = 'verified' | 'incomplete' | 'failed';

export interface IndexedPrivacyField {
  normalizedKey: string;
  normalizedPath: string;
  originalKey: string;
  label: string;
  path: string;
  value: unknown;
  source?: string;
  origin: PrivacyFieldOrigin;
  groupPath?: string;
  tagId?: string | number;
  scanStage: PrivacyScanStage;
  binary: boolean;
  evidenceClass: PrivacyEvidenceClass;
  privacyEligible: boolean;
}

export interface DetectedPrivacyField {
  key: string;
  label: string;
  category: PrivacyCategory;
  source?: string;
  displayValue: string;
  rawValue?: unknown;
  sensitive: boolean;
  origin: PrivacyFieldOrigin;
  path: string;
  groupPath?: string;
  tagId?: string | number;
  scanStage: PrivacyScanStage;
  masked: boolean;
  evidenceClass: PrivacyEvidenceClass;
  privacyEligible: boolean;
}

export interface PrivacyRisk {
  id: string;
  category: PrivacyCategory;
  title: string;
  severity: RiskSeverity;
  score: number;
  fields: DetectedPrivacyField[];
  description: string;
  recommendation: string;
  removable: boolean;
  combination?: boolean;
}

export interface PrivacySummary {
  hasPreciseLocation: boolean;
  hasDeviceIdentifier: boolean;
  hasIdentityInformation: boolean;
  hasCaptureTime: boolean;
  hasEmbeddedThumbnail: boolean;
  hasEditingHistory: boolean;
  hasApproximateLocation: boolean;
  hasNamedPeople: boolean;
  hasOriginalFileReference: boolean;
}

export interface PrivacyReportEngine {
  id: 'core' | 'exiftool';
  label: string;
  version?: string;
  status: 'complete' | 'failed';
  mode: 'quick' | MetadataInspectionMode;
  fieldCount: number;
  truncated: boolean;
  message?: string;
}

export interface PrivacyScoreSnapshot {
  stage: PrivacyCompleteness;
  score: number;
  level: PrivacyLevel;
  riskCount: number;
  fieldCount: number;
  addedRiskIds: string[];
  generatedAt: string;
}

export interface PrivacySourceStat {
  origin: PrivacyFieldOrigin;
  fieldCount: number;
}

export interface PrivacyFieldStats {
  read: number;
  eligible: number;
  excludedEnvironment: number;
}

export interface PrivacyReport {
  version: '1.3';
  evidencePolicyVersion: '1.1';
  generatedAt: string;
  file: { name: string; size: number; type: string; width?: number; height?: number };
  score: number;
  level: PrivacyLevel;
  risks: PrivacyRisk[];
  detectedFieldCount: number;
  sensitiveFieldCount: number;
  summary: PrivacySummary;
  warnings: string[];
  completeness: PrivacyCompleteness;
  engines: PrivacyReportEngine[];
  scoreTimeline: PrivacyScoreSnapshot[];
  sourceStats: PrivacySourceStat[];
  fieldStats: PrivacyFieldStats;
  scanWarnings: string[];
  disclaimer: string;
}

export interface PrivacyDeepInspection {
  schemaVersion: '1.0';
  mode: MetadataInspectionMode;
  version?: string;
  fieldCount: number;
  truncated: boolean;
  report: PrivacyReport;
}

export interface PrivacyCleanupDiff {
  scoreBefore: number;
  scoreAfter: number;
  scoreDelta: number;
  fieldsBefore: number;
  fieldsAfter: number;
  removedRiskIds: string[];
  remainingRiskIds: string[];
  addedRiskIds: string[];
}

export interface PrivacyCleanupOutputCheck {
  id: 'signature' | 'dimensions' | 'orientation' | 'animation';
  status: 'passed' | 'failed';
  message: string;
}

export interface PrivacyCleanupResult {
  mode: PrivacyCleanupMode;
  blob: Blob;
  fileName: string;
  mime: string;
  beforeSize: number;
  afterSize: number;
  quality?: number;
  verificationStatus: PrivacyVerificationStatus;
  verificationDepth: PrivacyCompleteness;
  cleanupEngine: 'canvas' | 'exiftool';
  outputChecks: PrivacyCleanupOutputCheck[];
  beforeReport: PrivacyReport;
  afterReport?: PrivacyReport;
  diff?: PrivacyCleanupDiff;
  warnings: string[];
}

export interface PrivacyStructuralCleanup {
  schemaVersion: '1.0';
  data: ArrayBuffer;
  mime: string;
  warnings: string[];
  cleanupEngine: 'exiftool';
}

export interface PrivacyRuleContext {
  metadata: NormalizedImageMetadata;
  fieldIndex: PrivacyFieldIndex;
  completeness: PrivacyCompleteness;
}

export interface PrivacyRule {
  id: string;
  category: PrivacyCategory;
  title: string;
  severity: RiskSeverity;
  weight: number;
  evaluate(context: PrivacyRuleContext): PrivacyRisk | null;
}

export interface PrivacyCombinationRule {
  id: string;
  evaluate(context: PrivacyRuleContext, baseRisks: readonly PrivacyRisk[]): PrivacyRisk | null;
}
