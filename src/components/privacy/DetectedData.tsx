import { useMemo, useState } from 'react';
import { CopyButton } from '../CopyButton';
import type { PrivacyReport } from '../../lib/privacy/types';
import type { Locale } from '../../i18n/core';
import { localizePath } from '../../i18n/core';

export function DetectedData({ report, locale = 'en' }: { report: PrivacyReport; locale?: Locale }) {
  const zh = locale === 'zh-CN';
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
  return <section className="privacy-detected-data"><div><span className="section-index">{zh ? '已检出元数据' : 'DETECTED METADATA'}</span><h2>{zh ? '这份报告用到的证据' : 'The evidence used here'}</h2><p>{zh ? '这里只列隐私相关字段，同时保留遮罩预览和精确来源路径。' : 'This is the privacy-relevant subset, with masked previews and exact source paths.'}</p><a className="inline-link" href={localizePath('/image-metadata-viewer/', locale)}>{zh ? '查看全部图片元数据' : 'View all image metadata'} →</a><small>{zh ? '换页后需要重新选择图片；文件不会在页面间传递。' : 'You will need to select the image again. The file is never carried between pages.'}</small></div><div className="privacy-data-ledger">{visible.length ? visible.map((field,index)=><div key={`${field.path}-${index}`}><span>{zh ? '元数据字段' : 'Metadata field'}</span><strong>{field.label}</strong><code>{field.displayValue}</code><small>{field.groupPath ?? field.origin}<br />{field.path}</small><CopyButton value={field.displayValue} label={zh ? '复制预览值' : 'Copy preview'} /></div>) : <p>{zh ? '报告里没有隐私相关字段。' : 'No privacy-relevant fields were added to the report.'}</p>}{fields.length > 12 && <button className="button button-secondary" type="button" onClick={()=>setExpanded((value)=>!value)}>{expanded ? (zh ? '收起部分字段' : 'Show fewer fields') : (zh ? `显示全部 ${fields.length.toLocaleString(locale)} 个字段` : `Show all ${fields.length} fields`)}</button>}</div></section>;
}
