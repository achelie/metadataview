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
  const exif = report.engines.find((engine) => engine.id === 'exiftool');
  const failed = !pending && exif?.status === 'failed';
  const complete = !pending && report.completeness === 'embedded' && exif?.status === 'complete';
  return <section className={`privacy-engine-rail is-full-scan${failed ? ' is-failed' : complete ? ' is-complete' : ''}`} aria-live="polite" aria-busy={pending}>
    <span className="privacy-engine-mark" aria-hidden="true"><Icon icon={cpuIcon} width="23" /></span>
    <div className="privacy-engine-copy"><span className="section-index">{zh ? '单次完整扫描' : 'ONE-PASS FULL SCAN'}</span><h2>{pending ? (zh ? '正在扫描所有元数据字段…' : 'Scanning every metadata field…') : complete ? (zh ? '完整扫描完成' : 'Full scan complete') : (zh ? '完整扫描未完成' : 'Full scan incomplete')}</h2><p>{pending ? (zh ? 'ExifTool 正在本地检查标准标签、内嵌预览和嵌套图片记录，当前结果仍可能变化。' : 'ExifTool is checking standard tags, embedded previews, and nested image records locally. The current result may still change.') : failed ? `${exif.message ?? (zh ? 'ExifTool 在完整扫描结束前停止了。' : 'ExifTool stopped before the full scan finished.')} ${zh ? '浏览器初步结果仍可使用。' : 'The browser-only result remains usable.'}` : (zh ? `共考虑了 ${report.detectedFieldCount} 个规范化字段，图片从未离开当前标签页。` : `${report.detectedFieldCount} normalized fields were considered. The image never left this tab.`)}</p></div>
    <dl className="privacy-engine-stats"><div><dt>{zh ? '引擎' : 'Engine'}</dt><dd>ExifTool {exif?.version ?? 'WASM'}</dd></div><div><dt>{zh ? '字段' : 'Fields'}</dt><dd>{exif?.fieldCount?.toLocaleString(locale) ?? (pending ? (zh ? '计数中…' : 'Counting…') : '—')}</dd></div></dl>
    <div className="button-row">{pending ? <button className="button button-secondary" type="button" onClick={onCancel}><Icon icon={stopIcon} width="16" />{zh ? '取消完整扫描' : 'Cancel full scan'}</button> : failed ? <button className="button button-secondary" type="button" onClick={onRetry}>{zh ? '重试完整扫描' : 'Retry full scan'}</button> : null}</div>
  </section>;
}
