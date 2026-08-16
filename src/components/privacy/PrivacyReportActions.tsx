import { Icon } from '@iconify/react';
import copyIcon from '@iconify-icons/lucide/copy';
import downloadIcon from '@iconify-icons/lucide/download';
import { useEffect, useMemo, useRef, useState } from 'react';
import { copyText } from '../CopyButton';
import { downloadJson } from '../../lib/metadata/utils';
import { createSafePrivacyExport, privacyReportFilename, privacyReportSummaryText } from '../../lib/privacy/safe-report-export';
import type { PrivacyReport } from '../../lib/privacy/types';
import type { Locale } from '../../i18n/core';

export function PrivacyReportActions({ report, deepPending, locale = 'en' }: { report: PrivacyReport; deepPending: boolean; locale?: Locale }) {
  const zh = locale === 'zh-CN';
  const de = locale === 'de';
  const t = (en: string, zhText: string, deText: string) => zh ? zhText : de ? deText : en;
  const data = useMemo(() => createSafePrivacyExport(report), [report]);
  const idleStatus = t('Values remain in this tab until you clear or refresh it.', '清除或刷新前，这些数值只留在当前标签页。', 'Die Werte bleiben bis zum Löschen oder Neuladen in diesem Tab.');
  const [status, setStatus] = useState(idleStatus);
  const timer = useRef<number | null>(null);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  const copied = async (value:string, message:string)=>{try{await copyText(value);setStatus(message);}catch{setStatus(t('Copy is blocked here—download the JSON report instead.', '这里无法复制，请改为下载 JSON 报告。', 'Kopieren ist hier blockiert – lade stattdessen den JSON-Bericht herunter.'));}if(timer.current)clearTimeout(timer.current);timer.current=window.setTimeout(()=>setStatus(idleStatus),1800);};
  return <section className="privacy-report-actions"><div><span className="eyebrow">{t('Export without the image', '不带图片的导出', 'Export ohne Bild')}</span><h2>{t('Keep the receipt, not the pixels.', '留下收据，不留像素。', 'Beleg behalten, Pixel nicht.')}</h2><p aria-live="polite">{deepPending ? t('The complete JSON waits for the full scan. A summary of the current result can be copied now.', '完整 JSON 要等扫描结束；现在可以先复制当前摘要。', 'Das vollständige JSON wartet auf den Vollscan. Die aktuelle Zusammenfassung lässt sich schon kopieren.') : status}</p></div><div className="button-row"><button className="button button-secondary" type="button" onClick={()=>void copied(privacyReportSummaryText(report),t('Visible report summary copied.', '已复制当前报告摘要。', 'Aktuelle Berichtszusammenfassung kopiert.'))}><Icon icon={copyIcon} width="16" />{t('Copy visible summary', '复制当前摘要（英文）', 'Aktuelle Zusammenfassung kopieren (Englisch)')}</button><button className="button button-secondary" type="button" disabled={deepPending} aria-disabled={deepPending} onClick={()=>void copied(JSON.stringify(data,null,2),t('Full safe JSON report copied.', '已复制完整安全 JSON 报告。', 'Vollständiger sicherer JSON-Bericht kopiert.'))}><Icon icon={copyIcon} width="16" />{t('Copy complete JSON', '复制完整 JSON（英文字段）', 'Vollständiges JSON kopieren (englische Felder)')}</button><button className="button button-primary" type="button" disabled={deepPending} aria-disabled={deepPending} onClick={()=>downloadJson(data,privacyReportFilename(report.file.name))}><Icon icon={downloadIcon} width="16" />{t('Download JSON report', '下载 JSON 报告（英文）', 'JSON-Bericht herunterladen (Englisch)')}</button></div></section>;
}
