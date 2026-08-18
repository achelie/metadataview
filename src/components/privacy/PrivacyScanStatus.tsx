import { Icon } from '@iconify/react';
import cpuIcon from '@iconify-icons/lucide/cpu';
import stopIcon from '@iconify-icons/lucide/stop-circle';
import type { PrivacyReport } from '../../lib/privacy/types';
import type { Locale } from '../../i18n/core';

export function PrivacyScanStatus({ report, pending, onCancel, onRetry, locale = 'en' }: {
  report: PrivacyReport;
  pending: boolean;
  onCancel: () => void;
  onRetry: () => void;
  locale?: Locale;
}) {
  const zh = locale === 'zh-CN';
  const de = locale === 'de';
  const t = (en: string, zhText: string, deText: string) => zh ? zhText : de ? deText : en;
  const exif = report.engines.find((engine) => engine.id === 'exiftool');
  const failed = !pending && exif?.status === 'failed';
  const complete = !pending && report.completeness === 'embedded' && exif?.status === 'complete';
  return <section className={`privacy-engine-rail is-full-scan${failed ? ' is-failed' : complete ? ' is-complete' : ''}`} aria-live="polite" aria-busy={pending}>
    <span className="privacy-engine-mark" aria-hidden="true"><Icon icon={cpuIcon} width="23" /></span>
    <div className="privacy-engine-copy"><span className="section-index">{t('ONE-PASS FULL SCAN', '单次完整扫描', 'VOLLScan IN EINEM DURCHGANG')}</span><h2>{pending ? t('Scanning every metadata field…', '正在扫描所有元数据字段…', 'Alle Metadatenfelder werden gescannt…') : complete ? t('Full scan complete', '完整扫描完成', 'Vollscan abgeschlossen') : t('Full scan incomplete', '完整扫描未完成', 'Vollscan unvollständig')}</h2><p>{pending ? t('ExifTool is checking standard tags, embedded previews, and nested image records locally. The current result may still change.', 'ExifTool 正在本地检查标准标签、内嵌预览和嵌套图片记录，当前结果仍可能变化。', 'ExifTool prüft Standard-Tags, eingebettete Vorschauen und verschachtelte Bilddatensätze lokal. Das Ergebnis kann sich noch ändern.') : failed ? `${exif.message ?? t('ExifTool stopped before the full scan finished.', 'ExifTool 在完整扫描结束前停止了。', 'ExifTool stoppte vor Abschluss des Vollscans.')} ${t('The browser-only result remains usable.', '浏览器初步结果仍可使用。', 'Das Browser-Ergebnis bleibt nutzbar.')}` : t(`${report.detectedFieldCount} normalized fields were considered. The image never left this tab.`, `共考虑了 ${report.detectedFieldCount} 个规范化字段，图片从未离开当前标签页。`, `${report.detectedFieldCount.toLocaleString(locale)} normalisierte Felder wurden berücksichtigt. Das Bild hat diesen Tab nie verlassen.`)}</p></div>
    <dl className="privacy-engine-stats"><div><dt>{t('Engine', '引擎', 'Engine')}</dt><dd>ExifTool {exif?.version ?? 'WASM'}</dd></div><div><dt>{t('Fields', '字段', 'Felder')}</dt><dd>{exif?.fieldCount?.toLocaleString(locale) ?? (pending ? t('Counting…', '计数中…', 'Wird gezählt…') : '—')}</dd></div></dl>
    <div className="button-row">{pending ? <button className="button button-secondary" type="button" onClick={onCancel}><Icon icon={stopIcon} width="16" />{t('Cancel full scan', '取消完整扫描', 'Vollscan abbrechen')}</button> : failed ? <button className="button button-secondary" type="button" onClick={onRetry}>{t('Retry full scan', '重试完整扫描', 'Vollscan wiederholen')}</button> : null}</div>
  </section>;
}
