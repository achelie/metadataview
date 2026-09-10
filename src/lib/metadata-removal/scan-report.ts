import type { Locale } from '../../i18n/core';
import { removalTranslator } from '../../i18n/workbench-removal';
import { ExifToolCancellationError, ExifToolWorkerClient } from '../exiftool-worker-client';
import type { DetectedFileType } from '../metadata/types';
import type { MetadataReport } from '../metadata-report/types';
import { mergeExifToolInspection, recordExifToolFailure } from '../metadata-report/exiftool-adapter';
import { IMAGE_FULL_SCAN_TIMEOUT_MS, STANDARD_SCAN_TIMEOUT_MS } from '../metadata-report/scan-policy';
import { runWorkerTask, type WorkerTask } from '../worker-client';
import { cleanupScanResult } from './verification';

export function matchingFacts(before: MetadataReport, after: MetadataReport) {
  const important = /format|dimensions|duration|codec|tracks|frame rate|sample rate|channels|pages|slides|worksheets|animation/i;
  const sourceFacts = before.facts.filter((fact) => important.test(`${fact.id} ${fact.label}`));
  const afterMap = new Map(after.facts.map((fact) => [fact.id, fact.value]));
  return sourceFacts.map((fact) => ({
    id: `fact-${fact.id}`, label: fact.label,
    status: afterMap.get(fact.id) === fact.value ? 'passed' as const : 'failed' as const,
    message: afterMap.get(fact.id) === fact.value ? `${fact.label} remains ${fact.value}.` : `${fact.label} changed from ${fact.value} to ${afterMap.get(fact.id) ?? 'unavailable'}.`,
  }));
}
export async function scanReport(file: File, allowedTypes: DetectedFileType[], locale: Locale, onStatus: (message: string) => void, registerTask: (task: WorkerTask<MetadataReport> | null) => void, registerExif: (client: ExifToolWorkerClient | null) => void) {
  const task = runWorkerTask<MetadataReport>({ type: 'inspect-metadata', file, allowedTypes } as never, 90_000);
  registerTask(task);
  const base = await task.promise;
  registerTask(null);
  const image = base.category === 'image';
  const mode = image ? 'embedded' as const : 'standard' as const;
  const client = new ExifToolWorkerClient();
  registerExif(client);
  try {
    const t = removalTranslator(locale);
    const inspection = await client.inspect(file, mode, (stage) => onStatus(stage === 'loading' ? t("loading-the-local-metadata-engine") : stage === 'extracting' ? t("reading-every-available-metadata-field") : t("building-the-safe-report")), image ? IMAGE_FULL_SCAN_TIMEOUT_MS : STANDARD_SCAN_TIMEOUT_MS);
    return cleanupScanResult(mergeExifToolInspection(base, inspection));
  } catch (error) {
    if (error instanceof ExifToolCancellationError) throw error;
    const message = error instanceof Error ? error.message : 'ExifTool could not complete the scan.';
    return { report: recordExifToolFailure(base, message, mode), complete: false, warning: message };
  } finally {
    client.terminate(); registerExif(null);
  }
}
