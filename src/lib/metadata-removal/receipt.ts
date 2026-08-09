import type { MetadataCleanupReceipt, MetadataCleanupResult } from './types';
import type { DetectedFileType } from '../metadata/types';

export function createCleanupReceipt(result: MetadataCleanupResult, source: { name: string; type: DetectedFileType; size: number }): MetadataCleanupReceipt {
  return {
    schemaVersion: '1.0', generatedAt: new Date().toISOString(), source,
    output: { name: result.fileName, type: source.type, size: result.afterSize, mime: result.mime },
    engine: result.engine, status: result.status,
    counts: { removed: result.removed.length, preserved: result.preserved.length, residual: result.residual.length },
    checks: result.checks, warnings: result.warnings,
  };
}
