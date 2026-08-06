import { toSafeValue } from '../metadata/safe-value';
import { sanitizeFilename } from '../metadata/utils';
import type { PrivacyCleanupResult, PrivacyReport } from './types';

function safeReportShape(report: PrivacyReport): Record<string, unknown> {
  return {
    version: report.version,
    evidencePolicyVersion: report.evidencePolicyVersion,
    generatedAt: report.generatedAt,
    file: report.file,
    completeness: report.completeness,
    engines: report.engines,
    score: report.score,
    level: report.level,
    scoreTimeline: report.scoreTimeline,
    sourceStats: report.sourceStats,
    fieldStats: report.fieldStats,
    summary: report.summary,
    detectedFieldCount: report.detectedFieldCount,
    sensitiveFieldCount: report.sensitiveFieldCount,
    risks: report.risks.map((risk) => ({
      id: risk.id,
      category: risk.category,
      title: risk.title,
      severity: risk.severity,
      score: risk.score,
      fields: risk.fields.map(({ rawValue: _rawValue, ...field }) => field),
      description: risk.description,
      recommendation: risk.recommendation,
      removable: risk.removable,
      combination: risk.combination ?? false,
    })),
    warnings: report.warnings,
    scanWarnings: report.scanWarnings,
    disclaimer: report.disclaimer,
  };
}

export function createSafePrivacyExport(report: PrivacyReport): Record<string, unknown> {
  return toSafeValue(safeReportShape(report)) as Record<string, unknown>;
}

export function createSafeCleanupReceipt(result: PrivacyCleanupResult): Record<string, unknown> {
  return toSafeValue({
    schemaVersion: '1.1',
    generatedAt: new Date().toISOString(),
    mode: result.mode,
    fileName: result.fileName,
    mime: result.mime,
    beforeSize: result.beforeSize,
    afterSize: result.afterSize,
    quality: result.quality,
    verificationStatus: result.verificationStatus,
    verificationDepth: result.verificationDepth,
    cleanupEngine: result.cleanupEngine,
    outputChecks: result.outputChecks,
    diff: result.diff,
    warnings: result.warnings,
    beforeReport: safeReportShape(result.beforeReport),
    afterReport: result.afterReport ? safeReportShape(result.afterReport) : undefined,
  }) as Record<string, unknown>;
}

export function privacyReportFilename(name: string): string { return `${sanitizeFilename(name)}.privacy-report.json`; }
export function privacyCleanupReceiptFilename(name: string): string { return `${sanitizeFilename(name)}.privacy-cleanup.json`; }

export function privacyReportSummaryText(report: PrivacyReport): string {
  const high = report.risks.filter((risk) => risk.severity === 'critical' || risk.severity === 'high').length;
  const latest = report.scoreTimeline.at(-1);
  const earlier = report.scoreTimeline.at(-2);
  const delta = latest && earlier ? latest.score - earlier.score : 0;
  return [
    'Image privacy report',
    `File: ${report.file.name}`,
    `Scan: ${report.completeness === 'embedded' ? 'Full scan complete' : 'Full scan incomplete'}`,
    `Score: ${report.score} / 100 (${report.level})${delta ? `, ${delta > 0 ? '+' : ''}${delta} after deeper scanning` : ''}`,
    `Risks: ${report.risks.length}`,
    `High-priority risks: ${high}`,
    `Sensitive fields: ${report.sensitiveFieldCount}`,
    report.scanWarnings.length ? `Scan warnings: ${report.scanWarnings.join(' | ')}` : '',
    '',
    report.disclaimer,
  ].filter(Boolean).join('\n');
}
