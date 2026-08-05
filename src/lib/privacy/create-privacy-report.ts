import type { NormalizedImageMetadata } from '../metadata/types';
import type { ExifToolInspection, MetadataInspectionMode } from '../metadata-report/types';
import { privacyCombinationRules } from './combinations';
import { createPrivacyFieldIndex } from './field-index';
import { privacyRules } from './rules';
import type {
  PrivacyCombinationRule,
  PrivacyCompleteness,
  PrivacyDeepInspection,
  PrivacyLevel,
  PrivacyReport,
  PrivacyReportEngine,
  PrivacyRisk,
  PrivacyRule,
  RiskSeverity,
} from './types';

export const PRIVACY_REPORT_VERSION = '1.2' as const;
export const PRIVACY_EVIDENCE_POLICY_VERSION = '1.0' as const;
export const PRIVACY_DISCLAIMER = 'This report identifies metadata that may affect privacy. It does not guarantee that an image is safe to share. No detected metadata is not proof of anonymity or safety.';
const severityOrder: Record<RiskSeverity, number> = { critical: 4, high: 3, medium: 2, low: 1 };

export interface CreatePrivacyReportOptions {
  inspection?: ExifToolInspection;
  completeness?: PrivacyCompleteness;
  previousReport?: PrivacyReport;
  scanWarnings?: string[];
}

export function levelForScore(score: number): PrivacyLevel {
  if (score >= 70) return 'Critical';
  if (score >= 40) return 'High';
  if (score >= 20) return 'Moderate';
  return 'Low';
}

function stableSort(risks: PrivacyRisk[]): PrivacyRisk[] {
  return [...risks].sort((left, right) => severityOrder[right.severity] - severityOrder[left.severity] || right.score - left.score || left.id.localeCompare(right.id));
}

function dedupeRisks(risks: PrivacyRisk[]): PrivacyRisk[] {
  const seen = new Set<string>();
  return risks.filter((risk) => {
    const values = risk.fields.map((field) => `${field.key}|${JSON.stringify(field.rawValue ?? field.displayValue)}`).sort().join('|');
    const fingerprint = `${risk.id}|${values}`;
    if (seen.has(fingerprint)) return false;
    seen.add(fingerprint);
    return true;
  });
}

function uniqueSensitiveFieldCount(risks: readonly PrivacyRisk[]): number {
  const fingerprints = new Set<string>();
  for (const risk of risks) {
    for (const field of risk.fields) {
      fingerprints.add(`${field.category}|${field.key.toLowerCase().replace(/[^a-z0-9]/g, '')}|${JSON.stringify(field.rawValue ?? field.displayValue)}`);
    }
  }
  return fingerprints.size;
}

function coreFieldCount(metadata: NormalizedImageMetadata): number {
  return metadata.sections.reduce((total, section) => total + section.fields.length, 0);
}

function enginesFor(metadata: NormalizedImageMetadata, inspection?: ExifToolInspection): PrivacyReportEngine[] {
  const engines: PrivacyReportEngine[] = [{
    id: 'core',
    label: 'MetadataView quick parser',
    status: 'complete',
    mode: 'quick',
    fieldCount: coreFieldCount(metadata),
    truncated: false,
  }];
  if (inspection) {
    engines.push({
      id: 'exiftool',
      label: 'ExifTool WASM',
      version: inspection.version,
      status: 'complete',
      mode: inspection.mode,
      fieldCount: inspection.fields.length,
      truncated: inspection.truncated,
    });
  }
  return engines;
}

export function createPrivacyReportFromRules(
  metadata: NormalizedImageMetadata,
  baseRules: readonly PrivacyRule[] = privacyRules,
  combinationRules: readonly PrivacyCombinationRule[] = privacyCombinationRules,
  options: CreatePrivacyReportOptions = {},
): PrivacyReport {
  const completeness = options.completeness ?? (options.inspection?.mode ?? 'quick');
  const fieldIndex = createPrivacyFieldIndex(metadata, options.inspection, completeness);
  const context = { metadata, fieldIndex, completeness };
  const scanWarnings = [...(options.scanWarnings ?? [])];
  const warnings = metadata.warnings.map((warning) => `${warning.code}: ${warning.message}`);
  if (options.inspection) warnings.push(...options.inspection.warnings.map((warning) => `${warning.code}: ${warning.message}`));
  const baseRisks: PrivacyRisk[] = [];
  for (const rule of baseRules) {
    try {
      const risk = rule.evaluate(context);
      if (risk) baseRisks.push(risk);
    } catch {
      warnings.push(`Privacy rule ${rule.id} could not be evaluated.`);
    }
  }
  const combinations: PrivacyRisk[] = [];
  for (const rule of combinationRules) {
    try {
      const risk = rule.evaluate(context, baseRisks);
      if (risk) combinations.push(risk);
    } catch {
      warnings.push(`Combination rule ${rule.id} could not be evaluated.`);
    }
  }
  if (fieldIndex.scanBudgetExhausted) scanWarnings.push(`Text scanning reached the ${fieldIndex.scannedCharacterCount.toLocaleString('en-US')}-character safety budget. Remaining long text was not inspected.`);

  const risks = stableSort(dedupeRisks([...baseRisks, ...combinations]));
  const score = Math.min(100, risks.reduce((sum, risk) => sum + risk.score, 0));
  const level = levelForScore(score);
  const has = (...ids: string[]) => risks.some((risk) => ids.includes(risk.id));
  const now = new Date().toISOString();
  const previousRiskIds = new Set(options.previousReport?.risks.map((risk) => risk.id) ?? []);
  const snapshot = {
    stage: completeness,
    score,
    level,
    riskCount: risks.length,
    fieldCount: fieldIndex.fields.length,
    addedRiskIds: risks.filter((risk) => !previousRiskIds.has(risk.id)).map((risk) => risk.id),
    generatedAt: now,
  };
  const previousTimeline = options.previousReport?.scoreTimeline.filter((item) => item.stage !== completeness) ?? [];
  const sourceMap = new Map<ReturnType<typeof createPrivacyFieldIndex>['fields'][number]['origin'], number>();
  for (const field of fieldIndex.fields) sourceMap.set(field.origin, (sourceMap.get(field.origin) ?? 0) + 1);

  return {
    version: PRIVACY_REPORT_VERSION,
    evidencePolicyVersion: PRIVACY_EVIDENCE_POLICY_VERSION,
    generatedAt: now,
    file: { name: metadata.file.name, size: metadata.file.size, type: metadata.file.actualFormat, width: metadata.file.width, height: metadata.file.height },
    score,
    level,
    risks,
    detectedFieldCount: fieldIndex.fields.length,
    sensitiveFieldCount: uniqueSensitiveFieldCount(risks),
    summary: {
      hasPreciseLocation: has('precise-location'),
      hasDeviceIdentifier: has('device-identifier'),
      hasIdentityInformation: has('device-owner', 'creator-identity', 'contact-details', 'named-people'),
      hasCaptureTime: has('capture-time'),
      hasEmbeddedThumbnail: has('embedded-thumbnail'),
      hasAiGenerationData: has('ai-prompt', 'ai-settings', 'comfy-workflow'),
      hasEditingHistory: has('editing-history'),
      hasApproximateLocation: has('approximate-location'),
      hasNamedPeople: has('named-people'),
      hasOriginalFileReference: has('original-file-reference'),
    },
    warnings: [...new Set(warnings)],
    completeness,
    engines: enginesFor(metadata, options.inspection),
    scoreTimeline: [...previousTimeline, snapshot],
    sourceStats: [...sourceMap.entries()].map(([origin, fieldCount]) => ({ origin, fieldCount })),
    fieldStats: {
      read: fieldIndex.readFieldCount,
      eligible: fieldIndex.fields.length,
      excludedEnvironment: fieldIndex.excludedEnvironmentFieldCount,
    },
    scanWarnings: [...new Set(scanWarnings)],
    disclaimer: PRIVACY_DISCLAIMER,
  };
}

export function createPrivacyReport(metadata: NormalizedImageMetadata): PrivacyReport {
  return createPrivacyReportFromRules(metadata);
}

export function createPrivacyDeepInspection(metadata: NormalizedImageMetadata, inspection: ExifToolInspection, previousReport?: PrivacyReport): PrivacyDeepInspection {
  const completeness: PrivacyCompleteness = inspection.mode;
  const report = createPrivacyReportFromRules(metadata, privacyRules, privacyCombinationRules, { inspection, completeness, previousReport });
  return {
    schemaVersion: '1.0',
    mode: inspection.mode,
    version: inspection.version,
    fieldCount: inspection.fields.length,
    truncated: inspection.truncated,
    report: {
      ...report,
      risks: report.risks.map((risk) => ({
        ...risk,
        fields: risk.fields.map(({ rawValue: _rawValue, ...field }) => field),
      })),
    },
  };
}

export function recordPrivacyScanFailure(report: PrivacyReport, mode: MetadataInspectionMode, message: string): PrivacyReport {
  const failedEngine: PrivacyReportEngine = {
    id: 'exiftool',
    label: 'ExifTool WASM',
    status: 'failed',
    mode,
    fieldCount: 0,
    truncated: false,
    message,
  };
  const completedExif = report.engines.find((engine) => engine.id === 'exiftool' && engine.status === 'complete');
  return {
    ...report,
    engines: completedExif ? report.engines : [...report.engines.filter((engine) => engine.id !== 'exiftool'), failedEngine],
    scanWarnings: [...new Set([...report.scanWarnings, `${mode === 'embedded' ? 'Embedded' : 'Standard'} scan failed: ${message}`])],
  };
}
