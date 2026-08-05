import type { PrivacyReport } from '../../lib/privacy/types';

function conclusion(report: PrivacyReport): string {
  const parts = [report.summary.hasPreciseLocation ? 'precise location' : report.summary.hasApproximateLocation ? 'a named location' : '', report.summary.hasCaptureTime ? 'capture time' : '', report.summary.hasDeviceIdentifier ? 'a device identifier' : '', report.summary.hasIdentityInformation ? 'identity information' : '', report.summary.hasAiGenerationData ? 'AI generation data' : ''].filter(Boolean);
  if (!parts.length) return 'No supported privacy-sensitive metadata was detected at this scan depth.';
  const tail = parts.pop();
  return `This image contains ${parts.length ? `${parts.join(', ')} and ` : ''}${tail}.`;
}

export function PrivacyScore({ report }: { report: PrivacyReport }) {
  const highCount = report.risks.filter((risk) => risk.severity === 'critical' || risk.severity === 'high').length;
  const previous = report.scoreTimeline.at(-2);
  const delta = previous ? report.score - previous.score : 0;
  return <section className={`privacy-scoreboard level-${report.level.toLowerCase()}`} aria-labelledby="privacy-score-heading">
    <div className="privacy-score-number"><span id="privacy-score-heading">Privacy score</span><strong>{report.score}</strong><small>/ 100 · rule-based</small></div>
    <div className="privacy-score-reading"><span className="eyebrow">{report.completeness} report</span><h2>{report.level}</h2><p>{conclusion(report)}</p>{previous && <p className="privacy-score-delta"><b>{delta > 0 ? `+${delta}` : delta}</b> from {previous.stage} scan · {report.scoreTimeline.at(-1)?.addedRiskIds.length ?? 0} newly supported risks</p>}<div className="privacy-progress" role="progressbar" aria-label={`Privacy score ${report.score} out of 100, ${report.level} level`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={report.score}><i style={{ width: `${report.score}%` }} /></div></div>
    <dl><div><dt>Risks</dt><dd>{report.risks.length}</dd></div><div><dt>High priority</dt><dd>{highCount}</dd></div><div><dt>Sensitive fields</dt><dd>{report.sensitiveFieldCount}</dd></div></dl>
    {report.scoreTimeline.length > 1 && <ol className="privacy-score-timeline" aria-label="Privacy score history">{report.scoreTimeline.map((item) => <li key={`${item.stage}-${item.generatedAt}`}><span>{item.stage}</span><strong>{item.score}</strong><small>{item.riskCount} risks · {item.fieldCount} fields</small></li>)}</ol>}
  </section>;
}
