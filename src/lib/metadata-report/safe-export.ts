import type { MetadataReport, MetadataReportExport } from './types';

export function createSafeReportExport(report: MetadataReport): MetadataReportExport {
  return {
    schemaVersion: report.schemaVersion,
    generatedAt: report.generatedAt,
    category: report.category,
    file: report.file,
    facts: report.facts,
    readableSections: report.readableSections,
    nativeSections: report.nativeSections,
    warnings: report.warnings,
    evidence: report.evidence,
    engines: report.engines,
    sourceStats: report.sourceStats,
    normalizedMetadata: report.normalized,
    rawMetadata: report.raw,
  };
}
