import { useMemo, useState } from 'react';
import { CopyButton } from '../CopyButton';
import type { PrivacyReport } from '../../lib/privacy/types';
import type { Locale } from '../../i18n/core';
import { localizePath } from '../../i18n/core';

export function DetectedData({ report, locale = 'en' }: { report: PrivacyReport; locale?: Locale }) {
  const zh = locale === 'zh-CN';
  const de = locale === 'de';
  const fr = locale === 'fr';
  const t = (en: string, zhText: string, deText: string, frText: string) => zh ? zhText : de ? deText : fr ? frText : en;
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
  return <section className="privacy-detected-data"><div><span className="section-index">{t('DETECTED METADATA', '已检出元数据', 'ERKANNTE METADATEN', 'MÉTADONNÉES DÉTECTÉES')}</span><h2>{t('The evidence used here', '这份报告用到的证据', 'Die hier verwendeten Nachweise', 'Les preuves utilisées ici')}</h2><p>{t('This is the privacy-relevant subset, with masked previews and exact source paths.', '这里只列隐私相关字段，同时保留遮罩预览和精确来源路径。', 'Hier stehen nur datenschutzrelevante Felder – mit maskierter Vorschau und exaktem Quellpfad.', 'Voici uniquement les champs liés à la confidentialité, avec aperçu masqué et chemin source exact.')}</p><a className="inline-link" href={localizePath('/image-metadata-viewer/', locale)}>{t('View all image metadata', '查看全部图片元数据', 'Alle Bildmetadaten ansehen', 'Voir toutes les métadonnées de l’image')} →</a><small>{t('You will need to select the image again. The file is never carried between pages.', '换页后需要重新选择图片；文件不会在页面间传递。', 'Auf der nächsten Seite musst du das Bild erneut auswählen. Dateien werden nie zwischen Seiten weitergegeben.', 'Vous devrez sélectionner à nouveau l’image. Le fichier ne passe jamais d’une page à l’autre.')}</small></div><div className="privacy-data-ledger">{visible.length ? visible.map((field,index)=><div key={`${field.path}-${index}`}><span>{t('Metadata field', '元数据字段', 'Metadatenfeld', 'Champ de métadonnées')}</span><strong>{field.label}</strong><code>{field.displayValue}</code><small>{field.groupPath ?? field.origin}<br />{field.path}</small><CopyButton value={field.displayValue} label={t('Copy preview', '复制预览值', 'Vorschau kopieren', 'Copier l’aperçu')} /></div>) : <p>{t('No privacy-relevant fields were added to the report.', '报告里没有隐私相关字段。', 'Dem Bericht wurden keine datenschutzrelevanten Felder hinzugefügt.', 'Aucun champ lié à la confidentialité n’a été ajouté au rapport.')}</p>}{fields.length > 12 && <button className="button button-secondary" type="button" onClick={()=>setExpanded((value)=>!value)}>{expanded ? t('Show fewer fields', '收起部分字段', 'Weniger Felder anzeigen', 'Afficher moins de champs') : t(`Show all ${fields.length} fields`, `显示全部 ${fields.length.toLocaleString(locale)} 个字段`, `Alle ${fields.length.toLocaleString(locale)} Felder anzeigen`, `Afficher les ${fields.length.toLocaleString(locale)} champs`)}</button>}</div></section>;
}
