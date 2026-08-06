import type { ExifToolProgressStage } from '../../workers/exiftool-protocol';
import type { ExifToolWorkerClient } from '../exiftool-worker-client';
import type { ImageWorkerClient } from '../image-worker-client';
import { createPrivacyCleanupResult, validateCleanupOutput } from '../image/privacy-cleanup';
import { removeImageMetadata } from '../image/remove-metadata';
import type { NormalizedImageMetadata } from '../metadata/types';
import { IMAGE_FULL_SCAN_MODE, IMAGE_FULL_SCAN_TIMEOUT_MS, STANDARD_SCAN_TIMEOUT_MS } from '../metadata-report/scan-policy';
import { recordPrivacyScanFailure } from './create-privacy-report';
import type { PrivacyCleanupMode, PrivacyCleanupResult, PrivacyReport } from './types';

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'The cleaned copy could not be verified.';
}

export async function createAndVerifyPrivacyCleanup(input: {
  source: File;
  metadata: NormalizedImageMetadata;
  beforeReport: PrivacyReport;
  mode: PrivacyCleanupMode;
  quickClient: ImageWorkerClient;
  exifClient: ExifToolWorkerClient;
  onStage: (stage: string | ExifToolProgressStage) => void;
}): Promise<PrivacyCleanupResult> {
  const { source, metadata, beforeReport, mode, quickClient, exifClient, onStage } = input;
  let generated: { blob: Blob; mime: string; quality?: number; warnings: string[] };

  if (mode === 'privacy-first') {
    if (metadata.file.animated) throw new Error('Privacy-first cleanup is disabled for animated images because Canvas would keep only one frame.');
    onStage('Re-encoding pixels');
    const removal = await removeImageMetadata(source, 0.92, { width: metadata.file.width, height: metadata.file.height });
    generated = { blob: removal.blob, mime: removal.mime, quality: removal.quality, warnings: ['Pixels were re-encoded and original metadata containers were not copied.'] };
  } else {
    onStage('Loading cleanup engine');
    const structural = await exifClient.cleanPreservingEncoding(source, onStage, STANDARD_SCAN_TIMEOUT_MS);
    generated = { blob: new Blob([structural.data], { type: structural.mime }), mime: structural.mime, warnings: structural.warnings };
  }

  const extension = generated.mime === 'image/jpeg' ? 'jpg' : generated.mime.split('/')[1] || 'img';
  const cleanName = `${source.name.replace(/\.[^.]+$/, '')}-clean.${extension}`;
  const cleanFile = new File([generated.blob], cleanName, { type: generated.mime });
  onStage('Checking output structure');
  const quick = await quickClient.checkPrivacy(cleanFile);
  const outputChecks = validateCleanupOutput(metadata, quick.metadata, mode);
  const outputFailed = outputChecks.some((check) => check.status === 'failed');
  if (outputFailed) {
    return createPrivacyCleanupResult({ mode, blob: generated.blob, sourceName: source.name, sourceSize: source.size, mime: generated.mime, quality: generated.quality, beforeReport, afterReport: quick.report, expectedCompleteness: beforeReport.completeness, outputChecks, warnings: [...generated.warnings, 'Output integrity checks failed. Download is blocked.'] });
  }

  let afterReport = quick.report;
  let verificationError: string | undefined;
  const expectedCompleteness = beforeReport.completeness === 'quick' ? 'quick' : IMAGE_FULL_SCAN_MODE;
  if (beforeReport.completeness !== 'quick') {
    try {
      onStage('Running full verification');
      afterReport = (await exifClient.inspectPrivacy(cleanFile, quick.metadata, afterReport, IMAGE_FULL_SCAN_MODE, onStage, IMAGE_FULL_SCAN_TIMEOUT_MS)).report;
    } catch (error) {
      verificationError = message(error);
      afterReport = recordPrivacyScanFailure(afterReport, IMAGE_FULL_SCAN_MODE, verificationError);
    }
  }

  return createPrivacyCleanupResult({
    mode,
    blob: generated.blob,
    sourceName: source.name,
    sourceSize: source.size,
    mime: generated.mime,
    quality: generated.quality,
    beforeReport,
    afterReport,
    expectedCompleteness,
    outputChecks,
    forceIncomplete: beforeReport.completeness === 'quick' || Boolean(verificationError),
    warnings: [...generated.warnings, ...(verificationError ? [verificationError] : [])],
  });
}
