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
  const data = useMemo(() => createSafePrivacyExport(report), [report]);
  const idleStatus = zh ? '清除或刷新前，这些数值只留在当前标签页。' : 'Values remain in this tab until you clear or refresh it.';
  const [status, setStatus] = useState(idleStatus);
  const timer = useRef<number | null>(null);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  const copied = async (value:string, message:string)=>{try{await copyText(value);setStatus(message);}catch{setStatus(zh ? '这里无法复制，请改为下载 JSON 报告。' : 'Copy is blocked here—download the JSON report instead.');}if(timer.current)clearTimeout(timer.current);timer.current=window.setTimeout(()=>setStatus(idleStatus),1800);};
  return <section className="privacy-report-actions"><div><span className="eyebrow">{zh ? '不带图片的导出' : 'Export without the image'}</span><h2>{zh ? '留下收据，不留像素。' : 'Keep the receipt, not the pixels.'}</h2><p aria-live="polite">{deepPending ? (zh ? '完整 JSON 要等扫描结束；现在可以先复制当前摘要。' : 'The complete JSON waits for the full scan. A summary of the current result can be copied now.') : status}</p></div><div className="button-row"><button className="button button-secondary" type="button" onClick={()=>void copied(privacyReportSummaryText(report),zh ? '已复制当前报告摘要。' : 'Visible report summary copied.')}><Icon icon={copyIcon} width="16" />{zh ? '复制当前摘要（英文）' : 'Copy visible summary'}</button><button className="button button-secondary" type="button" disabled={deepPending} aria-disabled={deepPending} onClick={()=>void copied(JSON.stringify(data,null,2),zh ? '已复制完整安全 JSON 报告。' : 'Full safe JSON report copied.')}><Icon icon={copyIcon} width="16" />{zh ? '复制完整 JSON（英文字段）' : 'Copy complete JSON'}</button><button className="button button-primary" type="button" disabled={deepPending} aria-disabled={deepPending} onClick={()=>downloadJson(data,privacyReportFilename(report.file.name))}><Icon icon={downloadIcon} width="16" />{zh ? '下载 JSON 报告（英文）' : 'Download JSON report'}</button></div></section>;
}
