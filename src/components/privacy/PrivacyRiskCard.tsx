import { CopyButton } from '../CopyButton';
import type { PrivacyRisk } from '../../lib/privacy/types';
import type { Locale } from '../../i18n/core';
import { localizePrivacyRisk, privacyCategoryLabels, privacySeverityLabels } from '../../i18n/privacy';

export function PrivacyRiskCard({ risk, locale = 'en' }: { risk: PrivacyRisk; locale?: Locale }) {
  const zh = locale === 'zh-CN';
  const copy = localizePrivacyRisk(risk, locale);
  return <article className={`privacy-risk-card severity-${risk.severity}`} id={`risk-${risk.id}`}>
    <header><div><span>{privacySeverityLabels[locale][risk.severity]} · {privacyCategoryLabels[locale][risk.category]}</span><h3>{copy.title}</h3></div><strong>+{risk.score}</strong></header>
    <div className="privacy-risk-copy"><div><span>{zh ? '为什么需要注意' : 'Why this matters'}</span><p>{copy.description}</p></div><div><span>{zh ? '建议怎么做' : 'Recommended action'}</span><p>{copy.recommendation}</p></div></div>
    <details><summary>{zh ? `查看检出的 ${risk.fields.length} 个字段` : `Review ${risk.fields.length} detected ${risk.fields.length === 1 ? 'field' : 'fields'}`}</summary><div className="privacy-detected-fields">{risk.fields.map((field, index) => <div key={`${field.path}-${index}`}><div><strong>{field.label}</strong><small>{field.groupPath ?? field.category}{field.tagId !== undefined ? ` · tag ${field.tagId}` : ''}</small><small title={field.path}>{field.path}</small></div><code>{field.displayValue}</code><div><CopyButton value={field.displayValue} label={zh ? `复制${field.masked ? '已遮罩' : ''}数值` : `Copy ${field.masked ? 'masked ' : ''}value`} /><small>{field.source ?? field.origin}</small></div></div>)}</div></details>
    <footer><span>{risk.combination ? (zh ? '组合信号' : 'Combined signal') : (zh ? '元数据证据' : 'Metadata evidence')}</span><b>{risk.removable ? (zh ? '可清理' : 'Cleanup candidate') : (zh ? '需手动检查' : 'Review manually')}</b></footer>
  </article>;
}
