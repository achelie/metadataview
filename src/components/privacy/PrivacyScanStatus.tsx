import { Icon } from '@iconify/react';
import cpuIcon from '@iconify-icons/lucide/cpu';
import stopIcon from '@iconify-icons/lucide/stop-circle';
import type { PrivacyReport } from '../../lib/privacy/types';

export function PrivacyScanStatus({ report, pending, onCancel, onRetry }: {
  report: PrivacyReport;
  pending: boolean;
  onCancel: () => void;
  onRetry: () => void;
}) {
  const exif = report.engines.find((engine) => engine.id === 'exiftool');
  const failed = !pending && exif?.status === 'failed';
  const complete = !pending && report.completeness === 'embedded' && exif?.status === 'complete';
  return <section className={`privacy-engine-rail is-full-scan${failed ? ' is-failed' : complete ? ' is-complete' : ''}`} aria-live="polite" aria-busy={pending}>
    <span className="privacy-engine-mark" aria-hidden="true"><Icon icon={cpuIcon} width="23" /></span>
    <div className="privacy-engine-copy"><span className="section-index">ONE-PASS FULL SCAN</span><h2>{pending ? 'Scanning every metadata field…' : complete ? 'Full scan complete' : 'Full scan incomplete'}</h2><p>{pending ? 'ExifTool is checking standard tags, embedded previews, and nested image records locally. The current result may still change.' : failed ? `${exif.message ?? 'ExifTool stopped before the full scan finished.'} The browser-only result remains usable.` : `${report.detectedFieldCount} normalized fields were considered. The image never left this tab.`}</p></div>
    <dl className="privacy-engine-stats"><div><dt>Engine</dt><dd>ExifTool {exif?.version ?? 'WASM'}</dd></div><div><dt>Fields</dt><dd>{exif?.fieldCount?.toLocaleString('en-US') ?? (pending ? 'Counting…' : '—')}</dd></div></dl>
    <div className="button-row">{pending ? <button className="button button-secondary" type="button" onClick={onCancel}><Icon icon={stopIcon} width="16" />Cancel full scan</button> : failed ? <button className="button button-secondary" type="button" onClick={onRetry}>Retry full scan</button> : null}</div>
  </section>;
}
