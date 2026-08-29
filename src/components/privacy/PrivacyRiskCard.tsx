import { CopyButton } from '../CopyButton';
import type { PrivacyRisk } from '../../lib/privacy/types';
import type { Locale } from '../../i18n/core';
import { localizePrivacyRisk, privacyCategoryLabels, privacySeverityLabels } from '../../i18n/privacy';

export function PrivacyRiskCard({ risk, locale = 'en' }: { risk: PrivacyRisk; locale?: Locale }) {
  const zh = locale === 'zh-CN';
  const de = locale === 'de';
  const fr = locale === 'fr';
  const t = (en: string, zhText: string, deText: string, frText: string) => zh ? zhText : de ? deText : fr ? frText : en;
  const copy = localizePrivacyRisk(risk, locale);
  return <article className={`privacy-risk-card severity-${risk.severity}`} id={`risk-${risk.id}`}>
    <header><div><span>{privacySeverityLabels[locale][risk.severity]} · {privacyCategoryLabels[locale][risk.category]}</span><h3>{copy.title}</h3></div><strong>+{risk.score}</strong></header>
    <div className="privacy-risk-copy"><div><span>{t('Why this matters', '为什么需要注意', 'Warum das wichtig ist', 'Pourquoi c’est important')}</span><p>{copy.description}</p></div><div><span>{t('Recommended action', '建议怎么做', 'Empfohlene Maßnahme', 'Action recommandée')}</span><p>{copy.recommendation}</p></div></div>
    <details><summary>{t(`Review ${risk.fields.length} detected ${risk.fields.length === 1 ? 'field' : 'fields'}`, `查看检出的 ${risk.fields.length} 个字段`, `${risk.fields.length.toLocaleString(locale)} erkannte ${risk.fields.length === 1 ? 'Feld' : 'Felder'} prüfen`, `Examiner ${risk.fields.length.toLocaleString(locale)} ${risk.fields.length === 1 ? 'champ détecté' : 'champs détectés'}`)}</summary><div className="privacy-detected-fields">{risk.fields.map((field, index) => <div key={`${field.path}-${index}`}><div><strong>{field.label}</strong><small>{field.groupPath ?? field.category}{field.tagId !== undefined ? ` · tag ${field.tagId}` : ''}</small><small title={field.path}>{field.path}</small></div><code>{field.displayValue}</code><div><CopyButton value={field.displayValue} label={t(`Copy ${field.masked ? 'masked ' : ''}value`, `复制${field.masked ? '已遮罩' : ''}数值`, `${field.masked ? 'Maskierten ' : ''}Wert kopieren`, `Copier la valeur${field.masked ? ' masquée' : ''}`)} /><small>{field.source ?? field.origin}</small></div></div>)}</div></details>
    <footer><span>{risk.combination ? t('Combined signal', '组合信号', 'Kombiniertes Signal', 'Signal combiné') : t('Metadata evidence', '元数据证据', 'Metadaten-Nachweis', 'Preuve dans les métadonnées')}</span><b>{risk.removable ? t('Cleanup candidate', '可清理', 'Bereinigungskandidat', 'Nettoyage possible') : t('Review manually', '需手动检查', 'Manuell prüfen', 'Vérification manuelle')}</b></footer>
  </article>;
}
