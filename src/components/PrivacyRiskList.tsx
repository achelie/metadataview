import type { PrivacyRisk } from '../lib/privacy/types';

export function PrivacyRiskList({ risks }: { risks: PrivacyRisk[] }) {
  if (!risks.length) return <div className="clean-state"><strong>No risky metadata found</strong><p>That is a good sign, not an anonymity guarantee. Visible pixels can still reveal plenty.</p></div>;
  return <div className="risk-list">{risks.map((risk) => (
    <article className="risk-item" key={risk.id}>
      <div className="risk-heading"><span>{risk.severity} · +{risk.score}</span><h4>{risk.title}</h4></div>
      <p>{risk.description}</p>
      <dl><dt>Fields found</dt><dd>{risk.fields.map((field) => field.key.split('.').pop()).join(', ')}</dd><dt>Do this</dt><dd>{risk.recommendation}</dd></dl>
    </article>
  ))}</div>;
}
