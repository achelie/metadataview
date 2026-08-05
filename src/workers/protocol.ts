import type { GenerationMetadata } from '../lib/generators/types';
import type { NormalizedImageMetadata, ParsedMetadata } from '../lib/metadata/types';
import type { PrivacyReport } from '../lib/privacy/types';
import type { MetadataReport } from '../lib/metadata-report/types';

export type WorkerRequest =
  | { id: string; type: 'parse-metadata'; file: File; allowedTypes?: string[] }
  | { id: string; type: 'inspect-metadata'; file: File; allowedTypes?: string[] }
  | { id: string; type: 'parse-image'; file: File }
  | { id: string; type: 'check-image-privacy'; file: File }
  | { id: string; type: 'check-privacy'; file: File }
  | { id: string; type: 'read-ai-prompt'; file: File };

export interface ImagePrivacyWorkerResult { metadata: NormalizedImageMetadata; report: PrivacyReport }
export type WorkerResult = ParsedMetadata | NormalizedImageMetadata | MetadataReport | ImagePrivacyWorkerResult | { metadata: ParsedMetadata; generation: GenerationMetadata };

export type WorkerResponse =
  | { id: string; status: 'success'; result: WorkerResult }
  | { id: string; status: 'error'; error: { code: string; message: string } };
