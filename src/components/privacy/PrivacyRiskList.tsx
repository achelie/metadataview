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
  const de = locale === 'de';
  const t = (en: string, zhText: string, deText: string) => zh ? zhText : de ? deText : en;
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [severity, setSeverity] = useState<SeverityFilter>('all');
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const risks = useMemo(() => report.risks.filter((risk) => {
    const translated = localizePrivacyRisk(risk, locale);
    const searchMatches = !normalizedQuery || [risk.title, risk.description, risk.recommendation, translated.title, translated.description, translated.recommendation, ...risk.fields.flatMap((field) => [field.label, field.key, field.path, field.groupPath ?? '', field.displayValue, field.source ?? ''])].join(' ').toLowerCase().includes(normalizedQuery);
    return categoryMatches(category, risk.category) && (severity === 'all' || risk.severity === severity) && searchMatches;
  }), [category, normalizedQuery, report.risks, severity]);
  if (!report.risks.length) return <section className="privacy-zero-state"><span className="eyebrow">{t('0 supported risks', '0 项受支持风险', '0 unterstützte Risiken')}</span><h2>{t('No supported privacy-sensitive metadata was detected.', '没有检出受支持的隐私敏感元数据。', 'Keine unterstützten datenschutzsensiblen Metadaten erkannt.')}</h2><p>{t('This does not guarantee that the image is anonymous. Visible content such as faces, addresses, license plates, reflections and landmarks may still reveal personal information.', '这不代表图片已匿名。画面中的人脸、地址、车牌、倒影和地标仍可能暴露个人信息。', 'Das garantiert keine Anonymität. Sichtbare Gesichter, Adressen, Kennzeichen, Spiegelungen und Wahrzeichen können weiterhin persönliche Informationen verraten.')}</p></section>;
  const reset = () => { setCategory('all'); setSeverity('all'); setQuery(''); };
  const categoryLabels: Record<CategoryFilter, string> = de ? { all: 'Alle', location: 'Standort', identity: 'Identität', device: 'Gerät', time: 'Zeit', editing: 'Bearbeitung' } : zh ? { all: '全部', location: '位置', identity: '身份', device: '设备', time: '时间', editing: '编辑' } : { all: 'All', location: 'Location', identity: 'Identity', device: 'Device', time: 'Time', editing: 'Editing' };
  return <section className="privacy-risk-section" aria-labelledby="privacy-risks-heading"><div className="privacy-risk-title"><span className="section-index">{t('RULE-BY-RULE RECEIPT', '逐条风险收据', 'REGEL-FÜR-REGEL-BELEG')}</span><h2 id="privacy-risks-heading">{t('Why the score moved', '分数为什么变了', 'Warum sich der Wert bewegt hat')}</h2><p>{t(`${risks.length} of ${report.risks.length} risks shown. Search and filters use the in-memory report; they do not parse the image again.`, `显示 ${risks.length} / ${report.risks.length} 项风险。搜索和筛选只查看内存中的报告，不会再次解析图片。`, `${risks.length.toLocaleString(locale)} von ${report.risks.length.toLocaleString(locale)} Risiken angezeigt. Suche und Filter nutzen nur den Bericht im Speicher und lesen das Bild nicht erneut.`)}</p></div><div className="privacy-filter-bar"><label className="privacy-search"><span>{t('Search risks and fields', '搜索风险和字段', 'Risiken und Felder suchen')}</span><input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder={t('Try GPS, serial, email, XMP…', '试试 GPS、序列号、邮箱、XMP…', 'Zum Beispiel GPS, Seriennummer, E-Mail, XMP…')} /></label><fieldset><legend>{t('Category', '分类', 'Kategorie')}</legend>{categoryIds.map((id) => <button type="button" aria-pressed={category === id} onClick={() => setCategory(id)} key={id}>{categoryLabels[id]}</button>)}</fieldset><fieldset><legend>{t('Severity', '严重程度', 'Schweregrad')}</legend>{severityIds.map((id) => <button type="button" aria-pressed={severity === id} onClick={() => setSeverity(id)} key={id}>{id === 'all' ? t('All severities', '全部程度', 'Alle Schweregrade') : privacySeverityLabels[locale][id]}</button>)}</fieldset></div><div className="privacy-risk-list">{risks.map((risk) => <PrivacyRiskCard locale={locale} risk={risk} key={risk.id} />)}</div>{!risks.length && <div className="empty-search"><strong>{t('No risks match this search.', '没有风险符合当前搜索。', 'Keine Risiken passen zu dieser Suche.')}</strong><button className="text-button" type="button" onClick={reset}>{t('Reset search and filters', '重置搜索和筛选', 'Suche und Filter zurücksetzen')}</button></div>}</section>;
}
