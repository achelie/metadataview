import type { MetadataReport } from '../metadata-report/types';

/** Successful execution is not proof that every field was inspected. */
export function cleanupScanResult(report: MetadataReport) {
  const incomplete = !report.engines.some((engine) => engine.id === 'exiftool' && engine.status === 'complete')
    || report.engines.some((engine) => engine.status !== 'complete' || engine.truncated)
    || report.warnings.some((warning) => /LIMIT|TRUNCAT|PARTIAL|TOO_LARGE|XML_INVALID|PARSER_WARNING/i.test(warning.code));
  return {
    report,
    complete: !incomplete,
    warning: incomplete ? 'The metadata scan was incomplete or reached a safety limit. Unread fields may remain.' : undefined,
  };
}
