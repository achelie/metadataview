import { sanitizeFilename } from '../metadata/utils';
import type { NormalizedImageMetadata } from '../metadata/types';
import { orientationNumber } from '../metadata/orientation';
import type { PrivacyCleanupDiff, PrivacyCleanupMode, PrivacyCleanupOutputCheck, PrivacyCleanupResult, PrivacyReport, PrivacyVerificationStatus } from '../privacy/types';

export const PRESERVE_ENCODING_CLEANUP_ARGS = Object.freeze(['-all=', '--ICC_Profile:All', '-tagsFromFile', '@', '-ColorSpaceTags', '-Orientation', '-m', '-q', '-q']);

export function extensionForImageMime(mime: string): 'jpg' | 'png' | 'webp' {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

export function cleanImageFilename(name: string, mime: string): string {
  return `${sanitizeFilename(name, '-clean')}.${extensionForImageMime(mime)}`;
}

export function buildPrivacyCleanupDiff(before: PrivacyReport, after: PrivacyReport): PrivacyCleanupDiff {
  const beforeIds = new Set(before.risks.map((risk) => risk.id));
  const afterIds = new Set(after.risks.map((risk) => risk.id));
  return {
    scoreBefore: before.score,
    scoreAfter: after.score,
    scoreDelta: after.score - before.score,
    fieldsBefore: before.sensitiveFieldCount,
    fieldsAfter: after.sensitiveFieldCount,
    removedRiskIds: [...beforeIds].filter((id) => !afterIds.has(id)),
    remainingRiskIds: [...afterIds].filter((id) => beforeIds.has(id)),
    addedRiskIds: [...afterIds].filter((id) => !beforeIds.has(id)),
  };
}

export function verificationStatusFor(report: PrivacyReport | undefined, expected: PrivacyReport['completeness']): PrivacyVerificationStatus {
  if (!report) return 'failed';
  if (report.engines.some((engine) => engine.status === 'failed')) return 'incomplete';
  return report.completeness === expected ? 'verified' : 'incomplete';
}

export function validateCleanupOutput(source: NormalizedImageMetadata, cleaned: NormalizedImageMetadata, mode: PrivacyCleanupMode): PrivacyCleanupOutputCheck[] {
  const sameFormat = source.file.actualFormat === cleaned.file.actualFormat;
  const sameDimensions = source.file.width === cleaned.file.width && source.file.height === cleaned.file.height;
  const sourceOrientation = orientationNumber(source.legacy.Orientation);
  const cleanedOrientation = orientationNumber(cleaned.legacy.Orientation);
  const orientationPreserved = mode === 'preserve-encoding'
    ? sourceOrientation === cleanedOrientation
    : cleanedOrientation === undefined || cleanedOrientation === 1;
  const animationPreserved = !source.file.animated || (mode === 'preserve-encoding' && cleaned.file.animated);
  return [
    { id: 'signature', status: sameFormat ? 'passed' : 'failed', message: sameFormat ? `Output signature is ${cleaned.file.actualFormat.toUpperCase()}.` : `Output signature changed from ${source.file.actualFormat.toUpperCase()} to ${cleaned.file.actualFormat.toUpperCase()}.` },
    { id: 'dimensions', status: sameDimensions ? 'passed' : 'failed', message: sameDimensions ? `Display dimensions remain ${cleaned.file.width} × ${cleaned.file.height}.` : `Display dimensions changed from ${source.file.width} × ${source.file.height} to ${cleaned.file.width} × ${cleaned.file.height}.` },
    { id: 'orientation', status: orientationPreserved ? 'passed' : 'failed', message: mode === 'preserve-encoding' ? (orientationPreserved ? `Orientation remains ${sourceOrientation ?? 'unset'}.` : `Orientation changed from ${sourceOrientation ?? 'unset'} to ${cleanedOrientation ?? 'unset'}.`) : (orientationPreserved ? 'Orientation was applied to pixels and no rotation tag remains.' : `The re-encoded copy still declares Orientation ${cleanedOrientation}.`) },
    { id: 'animation', status: animationPreserved ? 'passed' : 'failed', message: source.file.animated ? (animationPreserved ? 'Animation remains present in the cleaned copy.' : 'The cleaned copy lost its animation.') : 'The source is a static image.' },
  ];
}

export function createPrivacyCleanupResult(input: {
  mode: PrivacyCleanupMode;
  blob: Blob;
  sourceName: string;
  sourceSize: number;
  mime: string;
  beforeReport: PrivacyReport;
  afterReport?: PrivacyReport;
  expectedCompleteness: PrivacyReport['completeness'];
  outputChecks?: PrivacyCleanupOutputCheck[];
  forceIncomplete?: boolean;
  quality?: number;
  warnings?: string[];
}): PrivacyCleanupResult {
  const outputChecks = input.outputChecks ?? [];
  const outputFailed = outputChecks.some((check) => check.status === 'failed');
  const verificationStatus = outputFailed ? 'failed' : input.forceIncomplete ? 'incomplete' : verificationStatusFor(input.afterReport, input.expectedCompleteness);
  return {
    mode: input.mode,
    blob: input.blob,
    fileName: cleanImageFilename(input.sourceName, input.mime),
    mime: input.mime,
    beforeSize: input.sourceSize,
    afterSize: input.blob.size,
    quality: input.quality,
    verificationStatus,
    verificationDepth: input.expectedCompleteness,
    cleanupEngine: input.mode === 'privacy-first' ? 'canvas' : 'exiftool',
    outputChecks,
    beforeReport: input.beforeReport,
    afterReport: input.afterReport,
    diff: input.afterReport ? buildPrivacyCleanupDiff(input.beforeReport, input.afterReport) : undefined,
    warnings: [...(input.warnings ?? []), ...(verificationStatus === 'verified' ? [] : ['Verification did not complete a full scan for both files. Do not describe this copy as safe.'])],
  };
}
