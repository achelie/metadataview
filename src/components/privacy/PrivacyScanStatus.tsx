import { Icon } from '@iconify/react';
import checkIcon from '@iconify-icons/lucide/check-circle-2';
import cpuIcon from '@iconify-icons/lucide/cpu';
import stopIcon from '@iconify-icons/lucide/stop-circle';
import type { ExifToolProgressStage } from '../../workers/exiftool-protocol';
import type { MetadataInspectionMode } from '../../lib/metadata-report/types';
import type { PrivacyReport } from '../../lib/privacy/types';

const labels: Record<ExifToolProgressStage, string> = { loading: 'Loading engine', extracting: 'Reading tags', building: 'Building report', scoring: 'Scoring evidence', cleaning: 'Removing metadata' };

export function PrivacyScanStatus({ report, pending, stage, mode, onCancel, onRetry, onEmbedded }: {
  report: PrivacyReport;
  pending: boolean;
  stage: ExifToolProgressStage | null;
  mode: MetadataInspectionMode;
  onCancel: () => void;
  onRetry: () => void;
  onEmbedded: () => void;
}) {
  const exif = report.engines.find((engine) => engine.id === 'exiftool');
  return <section className="privacy-engine-rail" aria-live="polite">
    <div><span className="section-index">SCAN COMPLETENESS</span><h2>{pending ? labels[stage ?? 'loading'] : `${report.completeness} report ready`}</h2><p>{pending ? `${mode === 'embedded' ? 'Embedded' : 'Standard'} ExifTool scan is running locally. The quick report stays usable.` : exif?.status === 'failed' ? exif.message : `${report.detectedFieldCount} normalized fields were considered. ExifTool ${exif?.version ?? 'version'} never sends the image anywhere.`}</p></div>
    <ol>
      <li className="is-complete"><Icon icon={checkIcon} width="18" /><span><b>Quick</b><small>Browser parsers</small></span></li>
      <li className={report.completeness !== 'quick' && exif?.status === 'complete' ? 'is-complete' : exif?.status === 'failed' ? 'is-failed' : pending && mode === 'standard' ? 'is-active' : ''}><Icon icon={cpuIcon} width="18" /><span><b>Standard</b><small>ExifTool tags</small></span></li>
      <li className={report.completeness === 'embedded' ? 'is-complete' : pending && mode === 'embedded' ? 'is-active' : ''}><Icon icon={cpuIcon} width="18" /><span><b>Embedded</b><small>Optional -ee3</small></span></li>
    </ol>
    <div className="button-row">{pending ? <button className="button button-secondary" type="button" onClick={onCancel}><Icon icon={stopIcon} width="16" />Cancel deep scan</button> : <>{exif?.status === 'failed' && <button className="button button-secondary" type="button" onClick={onRetry}>Retry standard scan</button>}<button className="button button-secondary" type="button" disabled={report.completeness === 'embedded'} onClick={onEmbedded}>{report.completeness === 'embedded' ? 'Embedded scan complete' : 'Scan embedded data'}</button></>}</div>
  </section>;
}
