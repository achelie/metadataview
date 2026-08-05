import type { NormalizedImageMetadata } from '../metadata/types';
import { createPrivacyReport, levelForScore } from './create-privacy-report';

export { levelForScore };
export function scorePrivacy(metadata: NormalizedImageMetadata) { return createPrivacyReport(metadata); }
