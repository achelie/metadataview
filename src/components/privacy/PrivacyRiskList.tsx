import { useMemo, useState } from 'react';
import type { PrivacyCategory, PrivacyReport, RiskSeverity } from '../../lib/privacy/types';
import { PrivacyRiskCard } from './PrivacyRiskCard';
import type { Locale } from '../../i18n/core';
import { localizePrivacyRisk, privacySeverityLabels } from '../../i18n/privacy';

type CategoryFilter = 'all' | 'location' | 'identity' | 'device' | 'time' | 'editing';
type SeverityFilter = 'all' | RiskSeverity;
const categoryIds: CategoryFilter[] = ['all', 'location', 'identity', 'device', 'time', 'editing'];
const severityIds: SeverityFilter[] = ['all', 'critical', 'high', 'medium', 'low'];

function categoryMatches(filter: CategoryFilter, category: PrivacyCategory): boolean {
  if (filter === 'all') return true;
  if (filter === 'editing') return ['editing','document-history','thumbnail','other'].includes(category);
  return category === filter;
}

export function PrivacyRiskList({ report, locale = 'en' }: { report: PrivacyReport; locale?: Locale }) {
  const zh = locale === 'zh-CN';
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [severity, setSeverity] = useState<SeverityFilter>('all');
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const risks = useMemo(() => report.risks.filter((risk) => {
    const translated = localizePrivacyRisk(risk, locale);
    const searchMatches = !normalizedQuery || [risk.title, risk.description, risk.recommendation, translated.title, translated.description, translated.recommendation, ...risk.fields.flatMap((field) => [field.label, field.key, field.path, field.groupPath ?? '', field.displayValue, field.source ?? ''])].join(' ').toLowerCase().includes(normalizedQuery);
    return categoryMatches(category, risk.category) && (severity === 'all' || risk.severity === severity) && searchMatches;
  }), [category, normalizedQuery, report.risks, severity]);
  if (!report.risks.length) return <section className="privacy-zero-state"><span className="eyebrow">{zh ? '0 项受支持风险' : '0 supported risks'}</span><h2>{zh ? '没有检出受支持的隐私敏感元数据。' : 'No supported privacy-sensitive metadata was detected.'}</h2><p>{zh ? '这不代表图片已匿名。画面中的人脸、地址、车牌、倒影和地标仍可能暴露个人信息。' : 'This does not guarantee that the image is anonymous. Visible content such as faces, addresses, license plates, reflections and landmarks may still reveal personal information.'}</p></section>;
  const reset = () => { setCategory('all'); setSeverity('all'); setQuery(''); };
  return <section className="privacy-risk-section" aria-labelledby="privacy-risks-heading"><div className="privacy-risk-title"><span className="section-index">{zh ? '逐条风险收据' : 'RULE-BY-RULE RECEIPT'}</span><h2 id="privacy-risks-heading">{zh ? '分数为什么变了' : 'Why the score moved'}</h2><p>{zh ? `显示 ${risks.length} / ${report.risks.length} 项风险。搜索和筛选只查看内存中的报告，不会再次解析图片。` : `${risks.length} of ${report.risks.length} risks shown. Search and filters use the in-memory report; they do not parse the image again.`}</p></div><div className="privacy-filter-bar"><label className="privacy-search"><span>{zh ? '搜索风险和字段' : 'Search risks and fields'}</span><input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder={zh ? '试试 GPS、序列号、邮箱、XMP…' : 'Try GPS, serial, email, XMP…'} /></label><fieldset><legend>{zh ? '分类' : 'Category'}</legend>{categoryIds.map((id) => <button type="button" aria-pressed={category === id} onClick={() => setCategory(id)} key={id}>{zh ? ({ all: '全部', location: '位置', identity: '身份', device: '设备', time: '时间', editing: '编辑' }[id]) : id === 'all' ? 'All' : id[0]?.toUpperCase() + id.slice(1)}</button>)}</fieldset><fieldset><legend>{zh ? '严重程度' : 'Severity'}</legend>{severityIds.map((id) => <button type="button" aria-pressed={severity === id} onClick={() => setSeverity(id)} key={id}>{id === 'all' ? (zh ? '全部程度' : 'All severities') : privacySeverityLabels[locale][id]}</button>)}</fieldset></div><div className="privacy-risk-list">{risks.map((risk) => <PrivacyRiskCard locale={locale} risk={risk} key={risk.id} />)}</div>{!risks.length && <div className="empty-search"><strong>{zh ? '没有风险符合当前搜索。' : 'No risks match this search.'}</strong><button className="text-button" type="button" onClick={reset}>{zh ? '重置搜索和筛选' : 'Reset search and filters'}</button></div>}</section>;
}
