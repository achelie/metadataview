import { Icon } from '@iconify/react';
import copyIcon from '@iconify-icons/lucide/copy';
import downloadIcon from '@iconify-icons/lucide/download';
import { useEffect, useMemo, useRef, useState } from 'react';
import { copyText } from '../CopyButton';
import { downloadJson } from '../../lib/metadata/utils';
import { createSafePrivacyExport, privacyReportFilename, privacyReportSummaryText } from '../../lib/privacy/safe-report-export';
import type { PrivacyReport } from '../../lib/privacy/types';

export function PrivacyReportActions({ report, deepPending }: { report: PrivacyReport; deepPending: boolean }) {
  const data = useMemo(() => createSafePrivacyExport(report), [report]);
  const [status, setStatus] = useState('Values remain in this tab until you clear or refresh it.');
  const timer = useRef<number | null>(null);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  const copied = async (value:string, message:string)=>{try{await copyText(value);setStatus(message);}catch{setStatus('Copy is blocked here—download the JSON report instead.');}if(timer.current)clearTimeout(timer.current);timer.current=window.setTimeout(()=>setStatus('Values remain in this tab until you clear or refresh it.'),1800);};
  return <section className="privacy-report-actions"><div><span className="eyebrow">Export without the image</span><h2>Keep the receipt, not the pixels.</h2><p aria-live="polite">{deepPending ? 'The complete JSON waits for the full scan. A summary of the current result can be copied now.' : status}</p></div><div className="button-row"><button className="button button-secondary" type="button" onClick={()=>void copied(privacyReportSummaryText(report),'Visible report summary copied.')}><Icon icon={copyIcon} width="16" />Copy visible summary</button><button className="button button-secondary" type="button" disabled={deepPending} aria-disabled={deepPending} onClick={()=>void copied(JSON.stringify(data,null,2),'Full safe JSON report copied.')}><Icon icon={copyIcon} width="16" />Copy complete JSON</button><button className="button button-primary" type="button" disabled={deepPending} aria-disabled={deepPending} onClick={()=>downloadJson(data,privacyReportFilename(report.file.name))}><Icon icon={downloadIcon} width="16" />Download JSON report</button></div></section>;
}
