import { Icon } from '@iconify/react';
import copyIcon from '@iconify-icons/lucide/copy';
import downloadIcon from '@iconify-icons/lucide/download';
import { useEffect, useMemo, useRef, useState } from 'react';
import { copyText } from '../CopyButton';
import { DisclosureChevron } from '../DisclosureChevron';
import { ResultActionBar } from '../ResultActionBar';
import { downloadJson } from '../../lib/metadata/utils';
import { createSafePrivacyExport, privacyReportFilename, privacyReportSummaryText } from '../../lib/privacy/safe-report-export';
import type { PrivacyReport } from '../../lib/privacy/types';
import type { Locale } from '../../i18n/core';
import { privacyCleanupText } from '../../i18n/privacy-cleanup';

export function PrivacyReportActions({ report, deepPending, locale = 'en' }: { report: PrivacyReport; deepPending: boolean; locale?: Locale }) {
  const t = (en: string, zh: string, de: string, fr: string) => locale === 'zh-CN' ? zh : locale === 'de' ? de : locale === 'fr' ? fr : en;
  const data = useMemo(() => createSafePrivacyExport(report), [report]);
  const [status, setStatus] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copied = async (value: string, message: string) => {
    try {
      await copyText(value);
      setStatus(message);
    } catch {
      setStatus(t('Copy is blocked here—download the JSON report instead.', '这里无法复制，请改为下载 JSON 报告。', 'Kopieren ist hier blockiert – lade stattdessen den JSON-Bericht herunter.', 'La copie est bloquée ici : téléchargez plutôt le rapport JSON.'));
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus(null), 3_000);
  };

  const controls = <>
    <button className="button button-primary" type="button" disabled={deepPending} onClick={() => downloadJson(data, privacyReportFilename(report.file.name))}>
      <Icon icon={downloadIcon} width="16" aria-hidden="true" />{t('Download JSON report', '下载 JSON 报告（英文）', 'JSON-Bericht herunterladen (Englisch)', 'Télécharger le rapport JSON (anglais)')}
    </button>
    <details className="result-export-menu">
      <summary className="disclosure-summary"><span className="disclosure-label">{t('Copy options', '复制选项', 'Kopieroptionen', 'Options de copie')}</span><DisclosureChevron /></summary>
      <div className="result-export-options">
        <button className="button button-secondary" type="button" onClick={() => void copied(privacyReportSummaryText(report), t('Visible report summary copied.', '已复制当前报告摘要。', 'Aktuelle Berichtszusammenfassung kopiert.', 'Résumé visible copié.'))}>
          <Icon icon={copyIcon} width="16" aria-hidden="true" />{t('Copy visible summary', '复制当前摘要（英文）', 'Aktuelle Zusammenfassung kopieren (Englisch)', 'Copier le résumé visible (anglais)')}
        </button>
        <button className="button button-secondary" type="button" disabled={deepPending} onClick={() => void copied(JSON.stringify(data, null, 2), t('Full safe JSON report copied.', '已复制完整安全 JSON 报告。', 'Vollständiger sicherer JSON-Bericht kopiert.', 'Rapport JSON sûr complet copié.'))}>
          <Icon icon={copyIcon} width="16" aria-hidden="true" />{t('Copy complete JSON', '复制完整 JSON（英文字段）', 'Vollständiges JSON kopieren (englische Felder)', 'Copier le JSON complet (champs anglais)')}
        </button>
      </div>
    </details>
    {(status || deepPending) && <span className="result-action-feedback" role="status">{status ?? t('Full scan running. Copy the current summary while JSON is being prepared.', '完整扫描中。JSON 就绪前可先复制当前摘要。', 'Vollscan läuft. Bis das JSON bereit ist, kannst du die aktuelle Zusammenfassung kopieren.', 'Analyse en cours. Vous pouvez copier le résumé avant que le JSON soit prêt.')}</span>}
  </>;

  return <section className="privacy-report-actions privacy-report-actions-compact" aria-label={privacyCleanupText(locale, 'reportActions')}>
    <ResultActionBar label={privacyCleanupText(locale, 'reportActions')} className="privacy-report-action-bar">{controls}</ResultActionBar>
    <p className="privacy-report-export-status">{t('Exports contain the report, not the image. Original field names remain in English.', '导出只包含报告，不含图片；原始字段名保留英文。', 'Exporte enthalten den Bericht, nicht das Bild. Originalfeldnamen bleiben Englisch.', 'Les exports contiennent le rapport, pas l’image. Les noms des champs d’origine restent en anglais.')}</p>
  </section>;
}
