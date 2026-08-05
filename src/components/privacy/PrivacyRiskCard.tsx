import { CopyButton } from '../CopyButton';
import type { PrivacyRisk } from '../../lib/privacy/types';

const categoryLabels: Record<PrivacyRisk['category'], string> = { location: 'Location', device: 'Device', identity: 'Identity', time: 'Time', editing: 'Editing', thumbnail: 'Thumbnail', 'ai-generation': 'AI data', 'document-history': 'Document history', other: 'Other' };

export function PrivacyRiskCard({ risk }: { risk: PrivacyRisk }) {
  return <article className={`privacy-risk-card severity-${risk.severity}`} id={`risk-${risk.id}`}>
    <header><div><span>{risk.severity} · {categoryLabels[risk.category]}</span><h3>{risk.title}</h3></div><strong>+{risk.score}</strong></header>
    <div className="privacy-risk-copy"><div><span>Why this matters</span><p>{risk.description}</p></div><div><span>Recommended action</span><p>{risk.recommendation}</p></div></div>
    <details><summary>Review {risk.fields.length} detected {risk.fields.length === 1 ? 'field' : 'fields'}</summary><div className="privacy-detected-fields">{risk.fields.map((field, index) => <div key={`${field.path}-${index}`}><div><strong>{field.label}</strong><small>{field.groupPath ?? field.category} · {field.scanStage}{field.tagId !== undefined ? ` · tag ${field.tagId}` : ''}</small><small title={field.path}>{field.path}</small></div><code>{field.displayValue}</code><div><CopyButton value={field.displayValue} label={`Copy ${field.masked ? 'masked ' : ''}value`} /><small>{field.source ?? field.origin}</small></div></div>)}</div></details>
    <footer><span>{risk.combination ? 'Combined signal' : `Found during ${risk.fields[0]?.scanStage ?? 'quick'} scan`}</span><b>{risk.removable ? 'Cleanup candidate' : 'Review manually'}</b></footer>
  </article>;
}
