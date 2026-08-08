import type { NormalizedImageMetadata } from '../lib/metadata/types';
import type { ExifToolInspection, MetadataInspectionMode } from '../lib/metadata-report/types';
import type { PrivacyDeepInspection, PrivacyReport, PrivacyStructuralCleanup } from '../lib/privacy/types';
import type { MetadataWorkerCleanup } from '../lib/metadata-removal/types';

export type ExifToolProgressStage = 'loading' | 'extracting' | 'building' | 'scoring' | 'cleaning';
export type ExifToolOperation = 'metadata' | 'privacy' | 'cleanup' | 'metadata-cleanup';

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

export interface ExifToolMetadataCleanupRequest {
  id: string;
  type: 'clean-metadata-exiftool';
  file: File;
  family: 'image' | 'quicktime' | 'pdf';
}

export type ExifToolWorkerRequest = ExifToolInspectionRequest | ExifToolPrivacyRequest | ExifToolCleanupRequest | ExifToolMetadataCleanupRequest;

export type ExifToolWorkerResponse =
  | { id: string; status: 'progress'; stage: ExifToolProgressStage }
  | { id: string; status: 'success'; operation: 'metadata'; result: ExifToolInspection }
  | { id: string; status: 'success'; operation: 'privacy'; result: PrivacyDeepInspection }
  | { id: string; status: 'success'; operation: 'cleanup'; result: PrivacyStructuralCleanup }
  | { id: string; status: 'success'; operation: 'metadata-cleanup'; result: MetadataWorkerCleanup }
  | { id: string; status: 'error'; error: { message: string } };
