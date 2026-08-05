import { useMemo, useState } from 'react';
import { CopyButton } from '../CopyButton';
import type { PrivacyReport } from '../../lib/privacy/types';

export function DetectedData({ report }: { report: PrivacyReport }) {
  const [expanded, setExpanded] = useState(false);
  const fields = useMemo(() => {
    const seen = new Set<string>();
    return report.risks.flatMap((risk) => risk.fields).filter((field) => {
      const key = `${field.key.toLowerCase()}|${field.displayValue.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [report.risks]);
  const visible = expanded ? fields : fields.slice(0, 12);
  return <section className="privacy-detected-data"><div><span className="section-index">DETECTED METADATA</span><h2>The evidence used here</h2><p>This is the privacy-relevant subset, with masked previews and exact source paths.</p><a className="inline-link" href="/image-metadata-viewer">View all image metadata →</a><small>You will need to select the image again. The file is never carried between pages.</small></div><div className="privacy-data-ledger">{visible.length ? visible.map((field,index)=><div key={`${field.path}-${index}`}><span>{field.scanStage}</span><strong>{field.label}</strong><code>{field.displayValue}</code><small>{field.groupPath ?? field.origin}<br />{field.path}</small><CopyButton value={field.displayValue} label="Copy preview" /></div>) : <p>No privacy-relevant fields were added to the report.</p>}{fields.length > 12 && <button className="button button-secondary" type="button" onClick={()=>setExpanded((value)=>!value)}>{expanded?'Show fewer fields':`Show all ${fields.length} fields`}</button>}</div></section>;
}
