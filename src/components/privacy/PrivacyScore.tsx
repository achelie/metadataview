import type { PrivacyReport } from '../../lib/privacy/types';
import type { Locale } from '../../i18n/core';

function conclusion(report: PrivacyReport, locale: Locale): string {
  if (locale === 'zh-CN') {
    const parts = [report.summary.hasPreciseLocation ? '精确位置' : report.summary.hasApproximateLocation ? '地名' : '', report.summary.hasCaptureTime ? '拍摄时间' : '', report.summary.hasDeviceIdentifier ? '设备标识' : '', report.summary.hasIdentityInformation ? '身份信息' : ''].filter(Boolean);
    return parts.length ? `这张图片包含${parts.join('、')}。` : '当前结果未检出受支持的隐私敏感元数据。';
  }
  const parts = [report.summary.hasPreciseLocation ? 'precise location' : report.summary.hasApproximateLocation ? 'a named location' : '', report.summary.hasCaptureTime ? 'capture time' : '', report.summary.hasDeviceIdentifier ? 'a device identifier' : '', report.summary.hasIdentityInformation ? 'identity information' : ''].filter(Boolean);
  if (!parts.length) return 'No supported privacy-sensitive metadata has been detected in the current result.';
  const tail = parts.pop();
  return `This image contains ${parts.length ? `${parts.join(', ')} and ` : ''}${tail}.`;
}

export function PrivacyScore({ report, pending = false, locale = 'en' }: { report: PrivacyReport; pending?: boolean; locale?: Locale }) {
  const zh = locale === 'zh-CN';
  const highCount = report.risks.filter((risk) => risk.severity === 'critical' || risk.severity === 'high').length;
  const exif = report.engines.find((engine) => engine.id === 'exiftool');
  const label = pending ? (zh ? '正在完整扫描' : 'Full scan running') : report.completeness === 'embedded' && exif?.status === 'complete' ? (zh ? '完整扫描完成' : 'Full scan complete') : (zh ? '完整扫描未完成' : 'Full scan incomplete');
  const level = zh ? ({ Low: '低', Moderate: '中', High: '高', Critical: '严重' }[report.level] ?? report.level) : report.level;
  return <section className={`privacy-scoreboard level-${report.level.toLowerCase()}`} aria-labelledby="privacy-score-heading">
    <div className="privacy-score-number"><span id="privacy-score-heading">{zh ? '隐私分数' : 'Privacy score'}</span><strong>{report.score}</strong><small>/ 100 · {zh ? '规则评估' : 'rule-based'}</small></div>
    <div className="privacy-score-reading"><span className="eyebrow">{label}</span><h2>{level}</h2><p>{conclusion(report, locale)}</p>{pending ? <p className="privacy-score-delta">{zh ? 'ExifTool 检查内嵌预览和嵌套记录时，分数仍可能变化。' : 'The score can change while ExifTool checks embedded previews and nested records.'}</p> : null}<div className="privacy-progress" role="progressbar" aria-label={zh ? `隐私分数 ${report.score}/100，等级${level}` : `Privacy score ${report.score} out of 100, ${report.level} level`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={report.score}><i style={{ width: `${report.score}%` }} /></div></div>
    <dl><div><dt>{zh ? '风险' : 'Risks'}</dt><dd>{report.risks.length.toLocaleString(locale)}</dd></div><div><dt>{zh ? '高优先级' : 'High priority'}</dt><dd>{highCount.toLocaleString(locale)}</dd></div><div><dt>{zh ? '敏感字段' : 'Sensitive fields'}</dt><dd>{report.sensitiveFieldCount.toLocaleString(locale)}</dd></div></dl>
  </section>;
}
