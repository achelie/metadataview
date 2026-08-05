import type { PrivacyReport } from '../lib/privacy/types';

export function PrivacyScore({ report }: { report: PrivacyReport }) {
  return (
    <div className={`privacy-score risk-${report.level.toLowerCase()}`}>
      <div className="score-dial" style={{ '--score': report.score } as React.CSSProperties}><strong>{report.score}</strong><span>/ 100</span></div>
      <div><span className="eyebrow">Privacy risk</span><h3>{report.level}</h3><p>{report.risks.length} explainable {report.risks.length === 1 ? 'finding' : 'findings'} detected.</p></div>
    </div>
  );
}
