import type { PrivacyReport } from '../../lib/privacy/types';
import type { Locale } from '../../i18n/core';

function conclusion(report: PrivacyReport, locale: Locale): string {
  if (locale === 'zh-CN') {
    const parts = [report.summary.hasPreciseLocation ? '精确位置' : report.summary.hasApproximateLocation ? '地名' : '', report.summary.hasCaptureTime ? '拍摄时间' : '', report.summary.hasDeviceIdentifier ? '设备标识' : '', report.summary.hasIdentityInformation ? '身份信息' : ''].filter(Boolean);
    return parts.length ? `这张图片包含${parts.join('、')}。` : '当前结果未检出受支持的隐私敏感元数据。';
  }
  if (locale === 'de') {
    const parts = [report.summary.hasPreciseLocation ? 'einen genauen Standort' : report.summary.hasApproximateLocation ? 'einen benannten Ort' : '', report.summary.hasCaptureTime ? 'die Aufnahmezeit' : '', report.summary.hasDeviceIdentifier ? 'eine Gerätekennung' : '', report.summary.hasIdentityInformation ? 'Identitätsangaben' : ''].filter(Boolean);
    if (!parts.length) return 'Im aktuellen Ergebnis wurden keine unterstützten datenschutzsensiblen Metadaten erkannt.';
    const tail = parts.pop();
    return `Dieses Bild enthält ${parts.length ? `${parts.join(', ')} und ` : ''}${tail}.`;
  }
  const parts = [report.summary.hasPreciseLocation ? 'precise location' : report.summary.hasApproximateLocation ? 'a named location' : '', report.summary.hasCaptureTime ? 'capture time' : '', report.summary.hasDeviceIdentifier ? 'a device identifier' : '', report.summary.hasIdentityInformation ? 'identity information' : ''].filter(Boolean);
  if (!parts.length) return 'No supported privacy-sensitive metadata has been detected in the current result.';
  const tail = parts.pop();
  return `This image contains ${parts.length ? `${parts.join(', ')} and ` : ''}${tail}.`;
}

export function PrivacyScore({ report, pending = false, locale = 'en' }: { report: PrivacyReport; pending?: boolean; locale?: Locale }) {
  const zh = locale === 'zh-CN';
  const de = locale === 'de';
  const t = (en: string, zhText: string, deText: string) => zh ? zhText : de ? deText : en;
  const highCount = report.risks.filter((risk) => risk.severity === 'critical' || risk.severity === 'high').length;
  const exif = report.engines.find((engine) => engine.id === 'exiftool');
  const label = pending ? t('Full scan running', '正在完整扫描', 'Vollscan läuft') : report.completeness === 'embedded' && exif?.status === 'complete' ? t('Full scan complete', '完整扫描完成', 'Vollscan abgeschlossen') : t('Full scan incomplete', '完整扫描未完成', 'Vollscan unvollständig');
  const level = zh ? ({ Low: '低', Moderate: '中', High: '高', Critical: '严重' }[report.level] ?? report.level) : de ? ({ Low: 'Niedrig', Moderate: 'Mittel', High: 'Hoch', Critical: 'Kritisch' }[report.level] ?? report.level) : report.level;
  return <section className={`privacy-scoreboard level-${report.level.toLowerCase()}`} aria-labelledby="privacy-score-heading">
    <div className="privacy-score-number"><span id="privacy-score-heading">{t('Privacy score', '隐私分数', 'Datenschutzwert')}</span><strong>{report.score}</strong><small>/ 100 · {t('rule-based', '规则评估', 'regelbasiert')}</small></div>
    <div className="privacy-score-reading"><span className="eyebrow">{label}</span><h2>{level}</h2><p>{conclusion(report, locale)}</p>{pending ? <p className="privacy-score-delta">{t('The score can change while ExifTool checks embedded previews and nested records.', 'ExifTool 检查内嵌预览和嵌套记录时，分数仍可能变化。', 'Der Wert kann sich noch ändern, während ExifTool eingebettete Vorschauen und verschachtelte Datensätze prüft.')}</p> : null}<div className="privacy-progress" role="progressbar" aria-label={t(`Privacy score ${report.score} out of 100, ${report.level} level`, `隐私分数 ${report.score}/100，等级${level}`, `Datenschutzwert ${report.score} von 100, Stufe ${level}`)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={report.score}><i style={{ width: `${report.score}%` }} /></div></div>
    <dl><div><dt>{t('Risks', '风险', 'Risiken')}</dt><dd>{report.risks.length.toLocaleString(locale)}</dd></div><div><dt>{t('High priority', '高优先级', 'Hohe Priorität')}</dt><dd>{highCount.toLocaleString(locale)}</dd></div><div><dt>{t('Sensitive fields', '敏感字段', 'Sensible Felder')}</dt><dd>{report.sensitiveFieldCount.toLocaleString(locale)}</dd></div></dl>
  </section>;
}
