import { useMemo, useState } from 'react';
import type { PrivacyCategory, PrivacyReport, PrivacyScanStage, RiskSeverity } from '../../lib/privacy/types';
import { PrivacyRiskCard } from './PrivacyRiskCard';

type CategoryFilter = 'all' | 'location' | 'identity' | 'device' | 'time' | 'editing' | 'ai-generation';
type SeverityFilter = 'all' | RiskSeverity;
type StageFilter = 'all' | PrivacyScanStage;
const categories: Array<{ id: CategoryFilter; label: string }> = [{id:'all',label:'All'},{id:'location',label:'Location'},{id:'identity',label:'Identity'},{id:'device',label:'Device'},{id:'time',label:'Time'},{id:'editing',label:'Editing'},{id:'ai-generation',label:'AI data'}];
const severities: Array<{ id: SeverityFilter; label: string }> = [{id:'all',label:'All severities'},{id:'critical',label:'Critical'},{id:'high',label:'High'},{id:'medium',label:'Medium'},{id:'low',label:'Low'}];
const stages: Array<{ id: StageFilter; label: string }> = [{id:'all',label:'All stages'},{id:'quick',label:'Quick'},{id:'standard',label:'Standard'},{id:'embedded',label:'Embedded'}];

function categoryMatches(filter: CategoryFilter, category: PrivacyCategory): boolean {
  if (filter === 'all') return true;
  if (filter === 'editing') return ['editing','document-history','thumbnail','other'].includes(category);
  return category === filter;
}

export function PrivacyRiskList({ report }: { report: PrivacyReport }) {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [severity, setSeverity] = useState<SeverityFilter>('all');
  const [stage, setStage] = useState<StageFilter>('all');
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const risks = useMemo(() => report.risks.filter((risk) => {
    const stageMatches = stage === 'all' || risk.fields.some((field) => field.scanStage === stage);
    const searchMatches = !normalizedQuery || [risk.title, risk.description, risk.recommendation, ...risk.fields.flatMap((field) => [field.label, field.key, field.path, field.groupPath ?? '', field.displayValue, field.source ?? ''])].join(' ').toLowerCase().includes(normalizedQuery);
    return categoryMatches(category, risk.category) && (severity === 'all' || risk.severity === severity) && stageMatches && searchMatches;
  }), [category, normalizedQuery, report.risks, severity, stage]);
  if (!report.risks.length) return <section className="privacy-zero-state"><span className="eyebrow">0 supported risks</span><h2>No supported privacy-sensitive metadata was detected.</h2><p>This does not guarantee that the image is anonymous. Visible content such as faces, addresses, license plates, reflections and landmarks may still reveal personal information.</p></section>;
  const reset = () => { setCategory('all'); setSeverity('all'); setStage('all'); setQuery(''); };
  return <section className="privacy-risk-section" aria-labelledby="privacy-risks-heading"><div className="privacy-risk-title"><span className="section-index">RULE-BY-RULE RECEIPT</span><h2 id="privacy-risks-heading">Why the score moved</h2><p>{risks.length} of {report.risks.length} risks shown. Search and filters use the in-memory report; they do not parse the image again.</p></div><div className="privacy-filter-bar"><label className="privacy-search"><span>Search risks and fields</span><input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Try GPS, serial, email, XMP…" /></label><fieldset><legend>Category</legend>{categories.map((item) => <button type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)} key={item.id}>{item.label}</button>)}</fieldset><fieldset><legend>Severity</legend>{severities.map((item) => <button type="button" aria-pressed={severity === item.id} onClick={() => setSeverity(item.id)} key={item.id}>{item.label}</button>)}</fieldset><fieldset><legend>Scan stage</legend>{stages.map((item) => <button type="button" aria-pressed={stage === item.id} onClick={() => setStage(item.id)} key={item.id}>{item.label}</button>)}</fieldset></div><div className="privacy-risk-list">{risks.map((risk) => <PrivacyRiskCard risk={risk} key={risk.id} />)}</div>{!risks.length && <div className="empty-search"><strong>No risks match this search.</strong><button className="text-button" type="button" onClick={reset}>Reset search and filters</button></div>}</section>;
}
