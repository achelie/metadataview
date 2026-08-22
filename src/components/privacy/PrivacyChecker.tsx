import { Icon } from '@iconify/react';
import alertIcon from '@iconify-icons/lucide/alert-triangle';
import cancelIcon from '@iconify-icons/lucide/stop-circle';
import checkIcon from '@iconify-icons/lucide/shield-check';
import imageIcon from '@iconify-icons/lucide/image';
import rotateIcon from '@iconify-icons/lucide/rotate-ccw';
import uploadIcon from '@iconify-icons/lucide/upload-cloud';
import { useEffect, useRef, useState } from 'react';
import { ExifToolCancellationError, ExifToolWorkerClient } from '../../lib/exiftool-worker-client';
import { ImageWorkerClient } from '../../lib/image-worker-client';
import { MetadataError } from '../../lib/metadata/errors';
import { IMAGE_LIMITS } from '../../lib/metadata/limits';
import type { NormalizedImageMetadata } from '../../lib/metadata/types';
import { downloadJson } from '../../lib/metadata/utils';
import { IMAGE_FULL_SCAN_MODE, IMAGE_FULL_SCAN_TIMEOUT_MS } from '../../lib/metadata-report/scan-policy';
import { recordPrivacyScanFailure } from '../../lib/privacy/create-privacy-report';
import { createAndVerifyPrivacyCleanup } from '../../lib/privacy/cleanup-workflow';
import { createSafeCleanupReceipt, privacyCleanupReceiptFilename } from '../../lib/privacy/safe-report-export';
import type { PrivacyCleanupMode, PrivacyCleanupResult, PrivacyReport } from '../../lib/privacy/types';
import type { ExifToolProgressStage } from '../../workers/exiftool-protocol';
import { DetectedData } from './DetectedData';
import { PrivacyCleanupPanel } from './PrivacyCleanupPanel';
import { PrivacyReportActions } from './PrivacyReportActions';
import { PrivacyRiskList } from './PrivacyRiskList';
import { PrivacyScanStatus } from './PrivacyScanStatus';
import { PrivacyScore } from './PrivacyScore';
import { PrivacySummary } from './PrivacySummary';
import type { Locale } from '../../i18n/core';
import { LocaleProvider, useLocale } from '../../i18n/react';

const ACCEPT = 'image/jpeg,image/png,image/webp';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

function errorMessage(caught: unknown): string {
  return caught instanceof Error ? caught.message : 'The local task could not be completed.';
}

export default function PrivacyChecker({ locale = 'en' }: { locale?: Locale }) {
  return <LocaleProvider locale={locale}><PrivacyCheckerContent /></LocaleProvider>;
}

function PrivacyCheckerContent() {
  const locale = useLocale();
  const zh = locale === 'zh-CN';
  const de = locale === 'de';
  const fr = locale === 'fr';
  const frCopy: Record<string, string> = {
    'Waiting for a JPEG, PNG, or WebP': 'En attente d’un JPEG, PNG ou WebP',
    'Scanning every metadata field locally': 'Analyse locale de tous les champs de métadonnées',
    'Canceled by user.': 'Annulé par l’utilisateur.',
    'Full scan incomplete · the browser-only result remains usable': 'Analyse complète inachevée · le résultat initial reste utilisable',
    'Stopped safely': 'Arrêté sans risque', 'That image is over the 50 MB local inspection limit.': 'Cette image dépasse la limite locale de 50 Mo.',
    'Reading image structure in a local Worker': 'Lecture de la structure dans un Worker local',
    'Initial result ready · starting the full image scan': 'Premier résultat prêt · démarrage de l’analyse complète',
    'Re-encoding pixels': 'Réencodage des pixels', 'Loading engine': 'Chargement du moteur',
    'Your files never leave your device.': 'Vos fichiers ne quittent jamais votre appareil.',
    'Choose an image': 'Choisir une image', 'Before you post it': 'Avant de la publier', 'Drop an image here': 'Déposez une image ici', 'up to 50 MB': '50 Mo maximum',
    'Checks GPS, names, device IDs, editing history, thumbnails, and nested image records.': 'Vérifie GPS, noms, identifiants d’appareil, historique de retouche, miniatures et images imbriquées.',
    'The initial result appears fast, then one automatic full scan finishes the job.': 'Le premier résultat arrive vite, puis une analyse complète automatique termine le travail.',
    'Reading the image structure': 'Lecture de la structure de l’image', 'The first usable result appears before the automatic full scan finishes.': 'Un premier résultat utilisable apparaît avant la fin de l’analyse complète.',
    'Cancel': 'Annuler', 'We stopped without keeping a report.': 'L’opération s’est arrêtée sans conserver de rapport.', 'Choose another image': 'Choisir une autre image',
    'Local privacy receipt': 'Reçu local de confidentialité', 'No report was created': 'Aucun rapport créé', 'Replace image': 'Remplacer l’image', 'Clear': 'Effacer',
    'Checked image summary': 'Résumé de l’image vérifiée', 'Local preview of the selected image': 'Aperçu local de l’image sélectionnée', 'Local preview · never uploaded': 'Aperçu local · jamais envoyé',
    'File': 'Fichier', 'Actual format': 'Format réel', 'Size': 'Taille', 'Dimensions': 'Dimensions', 'Animation': 'Animation', 'Animated': 'Animée', 'Static': 'Statique', 'Browser fields': 'Champs du navigateur',
    'This tool checks embedded metadata only. It does not analyze visible image content.': 'Cet outil vérifie uniquement les métadonnées intégrées. Il n’analyse pas le contenu visible.',
    'Faces, text, addresses, license plates, reflections, screens, uniforms, and landmarks in the image pixels can still reveal personal information.': 'Visages, textes, adresses, plaques, reflets, écrans, uniformes et monuments visibles peuvent encore révéler des informations personnelles.',
  };
  const t = (en: string, zhText: string, deText: string) => zh ? zhText : de ? deText : fr ? (frCopy[en] ?? en) : en;
  const quickClient = useRef<ImageWorkerClient | null>(null);
  const exifClient = useRef<ExifToolWorkerClient | null>(null);
  const request = useRef(0);
  const picker = useRef<HTMLInputElement>(null);
  const chooseButton = useRef<HTMLDivElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const previewUrl = useRef<string | null>(null);
  const downloadUrl = useRef<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [quickBusy, setQuickBusy] = useState(false);
  const [deepPending, setDeepPending] = useState(false);
  const [, setDeepStage] = useState<ExifToolProgressStage | null>(null);
  const [status, setStatus] = useState(t('Waiting for a JPEG, PNG, or WebP', '等待 JPEG、PNG 或 WebP', 'Warte auf JPEG, PNG oder WebP'));
  const [source, setSource] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [metadata, setMetadata] = useState<NormalizedImageMetadata | null>(null);
  const [report, setReport] = useState<PrivacyReport | null>(null);
  const [cleanupMode, setCleanupMode] = useState<PrivacyCleanupMode>('privacy-first');
  const [cleanupPending, setCleanupPending] = useState(false);
  const [cleanupStage, setCleanupStage] = useState<string | ExifToolProgressStage | null>(null);
  const [cleanupError, setCleanupError] = useState<string | null>(null);
  const [cleanupResult, setCleanupResult] = useState<PrivacyCleanupResult | null>(null);

  const revokePreview = () => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
  };
  const revokeDownload = () => {
    if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current);
    downloadUrl.current = null;
  };
  const openPicker = () => {
    if (!picker.current) return;
    picker.current.value = '';
    picker.current.click();
  };

  useEffect(() => {
    quickClient.current = new ImageWorkerClient();
    exifClient.current = new ExifToolWorkerClient();
    return () => {
      request.current += 1;
      quickClient.current?.dispose();
      exifClient.current?.terminate();
      revokePreview();
      revokeDownload();
    };
  }, []);

  const clearState = () => {
    request.current += 1;
    quickClient.current?.cancel();
    exifClient.current?.cancel();
    revokePreview();
    revokeDownload();
    setDragging(false);
    setQuickBusy(false);
    setDeepPending(false);
    setDeepStage(null);
    setStatus(t('Waiting for a JPEG, PNG, or WebP', '等待 JPEG、PNG 或 WebP', 'Warte auf JPEG, PNG oder WebP'));
    setSource(null);
    setPreview(null);
    setNotice(null);
    setError(null);
    setMetadata(null);
    setReport(null);
    setCleanupMode('privacy-first');
    setCleanupPending(false);
    setCleanupStage(null);
    setCleanupError(null);
    setCleanupResult(null);
    if (picker.current) picker.current.value = '';
    window.requestAnimationFrame(() => chooseButton.current?.focus());
  };

  useEffect(() => {
    if (!report) return;
    window.requestAnimationFrame(() => {
      const heading = resultHeading.current;
      if (!heading) return;
      heading.focus({ preventScroll: true });
      const bounds = heading.getBoundingClientRect();
      if (bounds.top < 74 || bounds.bottom > window.innerHeight) heading.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  }, [report?.file.name]);

  const runFullScan = async (file: File, parsed: NormalizedImageMetadata, previous: PrivacyReport, current: number) => {
    setDeepPending(true);
    setDeepStage('loading');
    setStatus(t('Scanning every metadata field locally', '正在本地扫描所有元数据字段', 'Alle Metadatenfelder werden lokal gescannt'));
    try {
      const inspection = await exifClient.current!.inspectPrivacy(file, parsed, previous, IMAGE_FULL_SCAN_MODE, setDeepStage, IMAGE_FULL_SCAN_TIMEOUT_MS);
      if (request.current !== current) return;
      setReport(inspection.report);
      setStatus(fr ? `Analyse complète terminée · ${inspection.report.risks.length.toLocaleString(locale)} risque(s) pris en charge` : t(`Full scan complete · ${inspection.report.risks.length} supported risks`, `完整扫描完成 · ${inspection.report.risks.length} 项支持的风险`, `Vollscan abgeschlossen · ${inspection.report.risks.length.toLocaleString(locale)} unterstützte Risiken`));
    } catch (caught) {
      if (request.current !== current) return;
      const message = caught instanceof ExifToolCancellationError ? t('Canceled by user.', '用户已取消。', 'Vom Benutzer abgebrochen.') : errorMessage(caught);
      setReport((value) => value ? recordPrivacyScanFailure(value, IMAGE_FULL_SCAN_MODE, message) : value);
      setStatus(t('Full scan incomplete · the browser-only result remains usable', '完整扫描未完成 · 浏览器初步结果仍可使用', 'Vollscan unvollständig · das Browser-Ergebnis bleibt nutzbar'));
    } finally {
      if (request.current === current) {
        setDeepPending(false);
        setDeepStage(null);
      }
    }
  };

  const inspect = async (files: FileList | File[]) => {
    const selected = Array.from(files);
    if (!selected.length) return;
    const file = selected[0]!;
    request.current += 1;
    const current = request.current;
    quickClient.current?.cancel();
    exifClient.current?.cancel();
    revokePreview();
    revokeDownload();
    setSource(file);
    previewUrl.current = URL.createObjectURL(file);
    setPreview(previewUrl.current);
    setMetadata(null);
    setReport(null);
    setCleanupResult(null);
    setCleanupError(null);
    setError(null);
    setNotice(selected.length > 1 ? (fr ? `Vous avez choisi ${selected.length.toLocaleString(locale)} fichiers. Le vérificateur n’en lit qu’un à la fois : seul ${file.name} a été analysé.` : t(`You chose ${selected.length} files. This checker reads one at a time, so only ${file.name} was checked.`, `你选择了 ${selected.length} 个文件。检查器一次只读一个，因此只检查了 ${file.name}。`, `Du hast ${selected.length.toLocaleString(locale)} Dateien gewählt. Der Check liest jeweils nur eine, daher wurde nur ${file.name} geprüft.`)) : null);

    if (file.size > IMAGE_LIMITS.fileBytes) {
      setQuickBusy(false);
      setStatus(t('Stopped safely', '已安全停止', 'Sicher gestoppt'));
      setError({ code: 'FILE_TOO_LARGE', message: t('That image is over the 50 MB local inspection limit.', '这张图片超过了 50 MB 本地检查上限。', 'Dieses Bild überschreitet das lokale Prüflimit von 50 MB.') });
      return;
    }

    setQuickBusy(true);
    setStatus(t('Reading image structure in a local Worker', '正在本地 Worker 中读取图片结构', 'Bildstruktur wird in einem lokalen Worker gelesen'));
    try {
      const quick = await quickClient.current!.checkPrivacy(file);
      if (request.current !== current) return;
      setMetadata(quick.metadata);
      setReport(quick.report);
      if (quick.metadata.file.animated || quick.metadata.file.width > IMAGE_LIMITS.canvasSide || quick.metadata.file.height > IMAGE_LIMITS.canvasSide || quick.metadata.file.width * quick.metadata.file.height > IMAGE_LIMITS.canvasPixels) setCleanupMode('preserve-encoding');
      setQuickBusy(false);
      setStatus(t('Initial result ready · starting the full image scan', '初步结果已就绪 · 正在启动完整图片扫描', 'Erstes Ergebnis fertig · Vollscan wird gestartet'));
      void runFullScan(file, quick.metadata, quick.report, current);
    } catch (caught) {
      if (request.current !== current || (caught instanceof MetadataError && caught.code === 'PARSE_CANCELLED')) return;
      setError({ code: caught instanceof MetadataError ? caught.code : 'UNKNOWN_PARSE_ERROR', message: errorMessage(caught) });
      setStatus(t('Stopped safely', '已安全停止', 'Sicher gestoppt'));
      setQuickBusy(false);
    }
  };

  const runCleanup = async () => {
    if (!source || !metadata || !report || cleanupPending) return;
    const current = request.current;
    setCleanupPending(true);
    setCleanupResult(null);
    setCleanupError(null);
    setCleanupStage(cleanupMode === 'privacy-first' ? t('Re-encoding pixels', '正在重新编码像素', 'Pixel werden neu codiert') : t('Loading engine', '正在加载引擎', 'Engine wird geladen'));
    try {
      const result = await createAndVerifyPrivacyCleanup({ source, metadata, beforeReport: report, mode: cleanupMode, quickClient: quickClient.current!, exifClient: exifClient.current!, onStage: setCleanupStage });
      if (request.current !== current) return;
      setCleanupResult(result);
      setCleanupStage(null);
    } catch (caught) {
      if (request.current !== current) return;
      setCleanupError(errorMessage(caught));
      setCleanupStage(null);
    } finally {
      if (request.current === current) setCleanupPending(false);
    }
  };

  const downloadClean = () => {
    if (!cleanupResult) return;
    revokeDownload();
    downloadUrl.current = URL.createObjectURL(cleanupResult.blob);
    const anchor = document.createElement('a');
    anchor.href = downloadUrl.current;
    anchor.download = cleanupResult.fileName;
    anchor.click();
    window.setTimeout(revokeDownload, 1_500);
  };

  const downloadReceipt = () => {
    if (!cleanupResult) return;
    downloadJson(createSafeCleanupReceipt(cleanupResult), privacyCleanupReceiptFilename(cleanupResult.fileName));
  };

  const selection = Boolean(source);
  return <section id="privacy-checker-workbench" className="workbench privacy-checker" aria-busy={quickBusy || deepPending || cleanupPending}>
    <div className="workbench-topline"><div className="local-proof"><Icon icon={checkIcon} width="18" /><span>{t('Your files never leave your device.', '文件不会离开你的设备。', 'Deine Dateien verlassen dein Gerät nicht.')}</span></div><span className="status-line" aria-live="polite"><i className={quickBusy || deepPending || cleanupPending ? 'pulse' : ''} />{status}</span></div>
    <input ref={picker} className="sr-only" type="file" accept={ACCEPT} multiple tabIndex={-1} aria-hidden="true" onChange={(event) => { if (event.currentTarget.files) void inspect(event.currentTarget.files); }} />

    {!selection && <div ref={chooseButton} className={`privacy-dropzone ${dragging ? 'is-dragging' : ''}`} role="button" tabIndex={0} aria-label={t('Choose an image', '选择图片', 'Bild auswählen')} aria-describedby="privacy-drop-help" onClick={openPicker} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPicker(); } }} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); void inspect(event.dataTransfer.files); }}>
      <span className="privacy-drop-icon" aria-hidden="true"><Icon icon={uploadIcon} width="34" /></span><div className="privacy-drop-copy"><span className="eyebrow">{t('Before you post it', '发出去之前', 'Bevor du es teilst')}</span><strong>{t('Drop an image here', '把图片拖到这里', 'Bild hier ablegen')}</strong><p id="privacy-drop-help">JPEG · PNG · WebP · {t('up to 50 MB', '最大 50 MB', 'bis 50 MB')}</p><span className="button button-primary privacy-pick-label" aria-hidden="true">{t('Choose an image', '选择图片', 'Bild auswählen')}</span></div><p className="privacy-check-scope">{t('Checks GPS, names, device IDs, editing history, thumbnails, and nested image records.', '检查 GPS、姓名、设备 ID、编辑历史、缩略图和嵌套图片记录。', 'Prüft GPS, Namen, Geräte-IDs, Bearbeitungsverlauf, Vorschaubilder und verschachtelte Bilddatensätze.')}</p><small>{t('The initial result appears fast, then one automatic full scan finishes the job.', '初步结果很快出现，随后自动完整扫描把事情做完。', 'Das erste Ergebnis erscheint schnell; danach beendet ein automatischer Vollscan die Prüfung.')}</small>
    </div>}

    {quickBusy && <div className="privacy-processing" role="status"><span className="privacy-processing-mark"><Icon icon={imageIcon} width="26" /></span><div><strong>{t('Reading the image structure', '正在读取图片结构', 'Bildstruktur wird gelesen')}</strong><p>{t('The first usable result appears before the automatic full scan finishes.', '自动完整扫描结束前，先给你一个能用的初步结果。', 'Ein erstes nutzbares Ergebnis erscheint, bevor der automatische Vollscan fertig ist.')}</p></div><button className="button button-secondary" type="button" onClick={clearState}><Icon icon={cancelIcon} width="16" />{t('Cancel', '取消', 'Abbrechen')}</button></div>}
    {notice && <p className="image-notice" role="status">{notice}</p>}
    {error && <div className="image-error" role="alert"><Icon icon={alertIcon} width="26" /><div><span>{error.code}</span><strong>{t('We stopped without keeping a report.', '已经停止，没有保留报告。', 'Der Vorgang wurde ohne Bericht gestoppt.')}</strong><p>{error.message}</p><button className="button button-secondary" type="button" onClick={clearState}>{t('Choose another image', '换一张图片', 'Anderes Bild auswählen')}</button></div></div>}

    {selection && !quickBusy && <div className="privacy-result-actions"><div><span className="eyebrow">{t('Local privacy receipt', '本地隐私收据', 'Lokaler Datenschutzbeleg')}</span><h2 ref={resultHeading} tabIndex={-1}>{report ? (fr ? `Rapport de confidentialité pour ${report.file.name}` : t(`${report.file.name} privacy report`, `${report.file.name} 隐私报告`, `Datenschutzbericht für ${report.file.name}`)) : t('No report was created', '没有生成报告', 'Kein Bericht erstellt')}</h2></div><div className="button-row"><button className="button button-secondary" type="button" onClick={() => { if (picker.current) { picker.current.value = ''; picker.current.click(); } }}><Icon icon={rotateIcon} width="16" />{t('Replace image', '替换图片', 'Bild ersetzen')}</button><button className="button button-ghost" type="button" onClick={clearState}>{t('Clear', '清除', 'Löschen')}</button></div></div>}

    {report && metadata && source && <div className="privacy-result-shell">
      <section className="privacy-file-overview" aria-label={t('Checked image summary', '已检查图片摘要', 'Zusammenfassung des geprüften Bildes')}>{preview && <figure><img src={preview} alt={t('Local preview of the selected image', '所选图片的本地预览', 'Lokale Vorschau des ausgewählten Bildes')} /><figcaption>{t('Local preview · never uploaded', '本地预览 · 从未上传', 'Lokale Vorschau · nie hochgeladen')}</figcaption></figure>}<div className="privacy-file-strip"><div><span>{t('File', '文件', 'Datei')}</span><strong title={metadata.file.name}>{metadata.file.name}</strong></div><div><span>{t('Actual format', '真实格式', 'Echtes Format')}</span><strong>{metadata.file.actualFormat.toUpperCase()}</strong></div><div><span>{t('Size', '大小', 'Größe')}</span><strong>{formatBytes(metadata.file.size)}</strong></div><div><span>{t('Dimensions', '尺寸', 'Abmessungen')}</span><strong>{metadata.file.width} × {metadata.file.height}</strong></div><div><span>{t('Animation', '动画', 'Animation')}</span><strong>{metadata.file.animated ? t('Animated', '动态', 'Animiert') : t('Static', '静态', 'Statisch')}</strong></div><div><span>{t('Browser fields', '浏览器字段', 'Browser-Felder')}</span><strong>{metadata.file.metadataFieldCount}</strong></div></div></section>
      {[...report.warnings, ...report.scanWarnings].length > 0 && <div className="warning-list privacy-rule-warnings">{[...new Set([...report.warnings, ...report.scanWarnings])].map((warning, index) => <p key={`${warning}-${index}`}><strong>SCAN_NOTE</strong> {warning}</p>)}</div>}
      <PrivacyScanStatus locale={locale} report={report} pending={deepPending} onCancel={() => exifClient.current?.cancel()} onRetry={() => void runFullScan(source, metadata, report, request.current)} />
      <PrivacyScore locale={locale} report={report} pending={deepPending} />
      <PrivacySummary locale={locale} report={report} />
      <PrivacyCleanupPanel locale={locale} report={report} metadata={metadata} mode={cleanupMode} pending={cleanupPending} baselinePending={deepPending} stage={cleanupStage} error={cleanupError} result={cleanupResult} onMode={setCleanupMode} onClean={() => void runCleanup()} onDownload={downloadClean} onReceipt={downloadReceipt} />
      <PrivacyRiskList locale={locale} report={report} />
      <DetectedData locale={locale} report={report} />
      <PrivacyReportActions locale={locale} report={report} deepPending={deepPending} />
      <aside className="privacy-honest-limit"><Icon icon={alertIcon} width="22" /><div><strong>{t('This tool checks embedded metadata only. It does not analyze visible image content.', '这个工具只检查内嵌元数据，不分析可见画面。', 'Dieses Tool prüft nur eingebettete Metadaten und analysiert keine sichtbaren Bildinhalte.')}</strong><p>{t('Faces, text, addresses, license plates, reflections, screens, uniforms, and landmarks in the image pixels can still reveal personal information.', '图片像素里的人脸、文字、地址、车牌、倒影、屏幕、制服和地标仍可能暴露个人信息。', 'Gesichter, Texte, Adressen, Kennzeichen, Spiegelungen, Bildschirme, Uniformen und Wahrzeichen in den Pixeln können weiterhin persönliche Informationen verraten.')}</p></div></aside><p className="privacy-disclaimer">{fr ? 'Ce score couvre uniquement les métadonnées cachées prises en charge. Il ne garantit pas que l’image soit anonyme ni que les métadonnées soient vraies.' : t(report.disclaimer, '这个分数只覆盖受支持的隐藏元数据，不代表画面本身匿名，也不证明元数据真实。', 'Dieser Wert deckt nur unterstützte versteckte Metadaten ab. Er bedeutet weder, dass das Bild anonym ist, noch dass die Metadaten wahr sind.')}</p>
    </div>}
  </section>;
}
