import type { DetectedFileType } from '../lib/metadata/types';
import type { MetadataWorkerCleanup } from '../lib/metadata-removal/types';

export type MetadataRemovalProgress = 'loading-engine' | 'reading-container' | 'rewriting-file' | 'finalizing';

export interface MetadataRemovalWorkerRequest {
  id: string;
  type: 'clean-container-metadata';
  file: File;
  fileType: DetectedFileType;
}

export type MetadataRemovalWorkerResponse =
  | { id: string; status: 'progress'; stage: MetadataRemovalProgress }
  | { id: string; status: 'success'; result: MetadataWorkerCleanup }
  | { id: string; status: 'error'; error: { message: string } };
