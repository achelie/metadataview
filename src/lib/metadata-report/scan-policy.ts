import type { MetadataInspectionMode } from './types';

export const STANDARD_SCAN_TIMEOUT_MS = 120_000;
export const IMAGE_FULL_SCAN_TIMEOUT_MS = 180_000;
export const IMAGE_FULL_SCAN_MODE = 'embedded' as const satisfies MetadataInspectionMode;
