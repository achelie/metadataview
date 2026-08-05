import type { NormalizedImageMetadata } from '../lib/metadata/types';
import type { ExifToolInspection, MetadataInspectionMode } from '../lib/metadata-report/types';
import type { PrivacyDeepInspection, PrivacyReport, PrivacyStructuralCleanup } from '../lib/privacy/types';

export type ExifToolProgressStage = 'loading' | 'extracting' | 'building' | 'scoring' | 'cleaning';
export type ExifToolOperation = 'metadata' | 'privacy' | 'cleanup';

export interface ExifToolInspectionRequest {
  id: string;
  type: 'inspect-exiftool';
  file: File;
  mode: MetadataInspectionMode;
}

export interface ExifToolPrivacyRequest {
  id: string;
  type: 'inspect-privacy';
  file: File;
  mode: MetadataInspectionMode;
  metadata: NormalizedImageMetadata;
  previousReport: PrivacyReport;
}

export interface ExifToolCleanupRequest {
  id: string;
  type: 'clean-preserve-encoding';
  file: File;
}

export type ExifToolWorkerRequest = ExifToolInspectionRequest | ExifToolPrivacyRequest | ExifToolCleanupRequest;

export type ExifToolWorkerResponse =
  | { id: string; status: 'progress'; stage: ExifToolProgressStage }
  | { id: string; status: 'success'; operation: 'metadata'; result: ExifToolInspection }
  | { id: string; status: 'success'; operation: 'privacy'; result: PrivacyDeepInspection }
  | { id: string; status: 'success'; operation: 'cleanup'; result: PrivacyStructuralCleanup }
  | { id: string; status: 'error'; error: { message: string } };
