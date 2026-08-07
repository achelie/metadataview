import type { PrivacyReport } from '../../lib/privacy/types';

function conclusion(report: PrivacyReport): string {
  const parts = [report.summary.hasPreciseLocation ? 'precise location' : report.summary.hasApproximateLocation ? 'a named location' : '', report.summary.hasCaptureTime ? 'capture time' : '', report.summary.hasDeviceIdentifier ? 'a device identifier' : '', report.summary.hasIdentityInformation ? 'identity information' : ''].filter(Boolean);
  if (!parts.length) return 'No supported privacy-sensitive metadata has been detected in the current result.';
  const tail = parts.pop();
  return `This image contains ${parts.length ? `${parts.join(', ')} and ` : ''}${tail}.`;
}

export function PrivacyScore({ report, pending = false }: { report: PrivacyReport; pending?: boolean }) {
  const highCount = report.risks.filter((risk) => risk.severity === 'critical' || risk.severity === 'high').length;
  const exif = report.engines.find((engine) => engine.id === 'exiftool');
  const label = pending ? 'Full scan running' : report.completeness === 'embedded' && exif?.status === 'complete' ? 'Full scan complete' : 'Full scan incomplete';
  return <section className={`privacy-scoreboard level-${report.level.toLowerCase()}`} aria-labelledby="privacy-score-heading">
    <div className="privacy-score-number"><span id="privacy-score-heading">Privacy score</span><strong>{report.score}</strong><small>/ 100 · rule-based</small></div>
    <div className="privacy-score-reading"><span className="eyebrow">{label}</span><h2>{report.level}</h2><p>{conclusion(report)}</p>{pending ? <p className="privacy-score-delta">The score can change while ExifTool checks embedded previews and nested records.</p> : null}<div className="privacy-progress" role="progressbar" aria-label={`Privacy score ${report.score} out of 100, ${report.level} level`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={report.score}><i style={{ width: `${report.score}%` }} /></div></div>
    <dl><div><dt>Risks</dt><dd>{report.risks.length}</dd></div><div><dt>High priority</dt><dd>{highCount}</dd></div><div><dt>Sensitive fields</dt><dd>{report.sensitiveFieldCount}</dd></div></dl>
  </section>;
}
