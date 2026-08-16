import { Icon } from '@iconify/react';
import checkIcon from '@iconify-icons/lucide/shield-check';
import uploadIcon from '@iconify-icons/lucide/upload-cloud';
import eraseIcon from '@iconify-icons/lucide/eraser';
import downloadIcon from '@iconify-icons/lucide/download';
import receiptIcon from '@iconify-icons/lucide/file-json-2';
import replaceIcon from '@iconify-icons/lucide/replace';
import trashIcon from '@iconify-icons/lucide/trash-2';
import warningIcon from '@iconify-icons/lucide/alert-triangle';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ExifToolCancellationError, ExifToolWorkerClient } from '../lib/exiftool-worker-client';
import type { DetectedFileType } from '../lib/metadata/types';
import { sanitizeFilename } from '../lib/metadata/utils';
import { mergeExifToolInspection, recordExifToolFailure } from '../lib/metadata-report/exiftool-adapter';
import { IMAGE_FULL_SCAN_TIMEOUT_MS, STANDARD_SCAN_TIMEOUT_MS } from '../lib/metadata-report/scan-policy';
import type { MetadataReport } from '../lib/metadata-report/types';
import { compareRemovalReports, createRemovalBaseline, likelyCleanupEngine } from '../lib/metadata-removal/policy';
import { createCleanupReceipt } from '../lib/metadata-removal/receipt';
import type { MetadataCleanupResult, MetadataCleanupStatus, MetadataRemovalScope, MetadataWorkerCleanup } from '../lib/metadata-removal/types';
import { MetadataRemovalCanceledError, MetadataRemovalWorkerClient } from '../lib/metadata-removal/worker-client';
import { runWorkerTask, type WorkerTask } from '../lib/worker-client';
import type { Locale } from '../i18n/core';
import { LocaleProvider, useLocale } from '../i18n/react';

interface Props {
  scope: MetadataRemovalScope;
  formats: string;
  accept: string;
  allowedTypes: DetectedFileType[];
  locale?: Locale;
}

type WorkStatus = 'idle' | 'inspecting' | 'ready' | 'cleaning' | 'verifying' | 'complete' | 'failed' | 'canceled';
const IMAGE_TYPES: DetectedFileType[] = ['jpeg', 'png', 'webp', 'heic', 'tiff', 'gif'];
const EXIF_TYPES: DetectedFileType[] = [...IMAGE_TYPES, 'mp4', 'mov', '3gp', '3g2'];
const UNIVERSAL_LIMIT = 100 * 1024 * 1024;
const IMAGE_LIMIT = 50 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

function cleanName(name: string, type: DetectedFileType): string {
  const extension = name.split('.').pop()?.toLowerCase();
  const safeExtension = extension && /^[a-z0-9]{1,5}$/.test(extension) ? extension : type === 'jpeg' ? 'jpg' : type;
  return `${sanitizeFilename(name, '-clean')}.${safeExtension}`;
}

function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function statusLabel(status: WorkStatus, locale: Locale): string {
  const zh = locale === 'zh-CN';
  const de = locale === 'de';
  if (zh) {
    if (status === 'inspecting') return '正在扫描原文件';
    if (status === 'cleaning') return '正在清除可写元数据';
    if (status === 'verifying') return '正在复扫输出文件';
    if (status === 'complete') return '验证完成';
    if (status === 'ready') return '可以生成清理副本';
    if (status === 'failed') return '已安全停止';
    if (status === 'canceled') return '已取消';
    return '等待选择文件';
  }
  if (de) {
    if (status === 'inspecting') return 'Originaldatei wird geprüft';
    if (status === 'cleaning') return 'Beschreibbare Metadaten werden entfernt';
    if (status === 'verifying') return 'Ausgabedatei wird erneut geprüft';
    if (status === 'complete') return 'Prüfung abgeschlossen';
    if (status === 'ready') return 'Bereit für eine saubere Kopie';
    if (status === 'failed') return 'Sicher gestoppt';
    if (status === 'canceled') return 'Abgebrochen';
    return 'Warte auf eine Datei';
  }
  if (status === 'inspecting') return 'Scanning the original file';
  if (status === 'cleaning') return 'Removing writable metadata';
  if (status === 'verifying') return 'Rescanning the output';
  if (status === 'complete') return 'Verification finished';
  if (status === 'ready') return 'Ready to create a clean copy';
  if (status === 'failed') return 'Stopped safely';
  if (status === 'canceled') return 'Canceled';
  return 'Waiting for a file';
}

function matchingFacts(before: MetadataReport, after: MetadataReport) {
  const important = /format|dimensions|duration|codec|tracks|frame rate|sample rate|channels|pages|slides|worksheets|animation/i;
  const sourceFacts = before.facts.filter((fact) => important.test(`${fact.id} ${fact.label}`));
  const afterMap = new Map(after.facts.map((fact) => [fact.id, fact.value]));
  return sourceFacts.map((fact) => ({
    id: `fact-${fact.id}`, label: fact.label,
    status: afterMap.get(fact.id) === fact.value ? 'passed' as const : 'failed' as const,
    message: afterMap.get(fact.id) === fact.value ? `${fact.label} remains ${fact.value}.` : `${fact.label} changed from ${fact.value} to ${afterMap.get(fact.id) ?? 'unavailable'}.`,
  }));
}

async function scanReport(file: File, allowedTypes: DetectedFileType[], locale: Locale, onStatus: (message: string) => void, registerTask: (task: WorkerTask<MetadataReport> | null) => void, registerExif: (client: ExifToolWorkerClient | null) => void) {
  const task = runWorkerTask<MetadataReport>({ type: 'inspect-metadata', file, allowedTypes } as never, 90_000);
  registerTask(task);
  const base = await task.promise;
  registerTask(null);
  const image = base.category === 'image';
  const mode = image ? 'embedded' as const : 'standard' as const;
  const client = new ExifToolWorkerClient();
  registerExif(client);
  try {
    const zh = locale === 'zh-CN';
    const de = locale === 'de';
    const t = (en: string, zhText: string, deText: string) => zh ? zhText : de ? deText : en;
    const inspection = await client.inspect(file, mode, (stage) => onStatus(stage === 'loading' ? t('Loading the local metadata engine', '正在加载本地元数据引擎', 'Lokale Metadaten-Engine wird geladen') : stage === 'extracting' ? t('Reading every available metadata field', '正在读取所有可用元数据字段', 'Alle verfügbaren Metadatenfelder werden gelesen') : t('Building the safe report', '正在生成安全报告', 'Sicherer Bericht wird erstellt')), image ? IMAGE_FULL_SCAN_TIMEOUT_MS : STANDARD_SCAN_TIMEOUT_MS);
    return { report: mergeExifToolInspection(base, inspection), complete: true };
  } catch (error) {
    if (error instanceof ExifToolCancellationError) throw error;
    const message = error instanceof Error ? error.message : 'ExifTool could not complete the scan.';
    return { report: recordExifToolFailure(base, message, mode), complete: false, warning: message };
  } finally {
    client.terminate(); registerExif(null);
  }
}

export default function MetadataRemovalWorkbench({ locale = 'en', ...props }: Props) {
  return <LocaleProvider locale={locale}><MetadataRemovalWorkbenchContent {...props} /></LocaleProvider>;
}

function MetadataRemovalWorkbenchContent({ scope, formats, accept, allowedTypes }: Omit<Props, 'locale'>) {
  const locale = useLocale();
  const zh = locale === 'zh-CN';
  const de = locale === 'de';
  const t = (en: string, zhText: string, deText: string) => zh ? zhText : de ? deText : en;
  const chooseLabel = scope === 'image' ? t('Choose an image', '选择图片', 'Bild auswählen') : t('Choose a file', '选择文件', 'Datei auswählen');
  const input = useRef<HTMLInputElement>(null);
  const dropzone = useRef<HTMLDivElement>(null);
  const task = useRef<WorkerTask<MetadataReport> | null>(null);
  const exif = useRef<ExifToolWorkerClient | null>(null);
  const removal = useRef<MetadataRemovalWorkerClient | null>(null);
  const runId = useRef(0);
  const [file, setFile] = useState<File | null>(null);
  const [before, setBefore] = useState<MetadataReport | null>(null);
  const [baselineComplete, setBaselineComplete] = useState(false);
  const [result, setResult] = useState<MetadataCleanupResult | null>(null);
  const [status, setStatus] = useState<WorkStatus>('idle');
  const [detail, setDetail] = useState(t('Nothing is uploaded.', '不会上传任何内容。', 'Nichts wird hochgeladen.'));
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [signaturePrompt, setSignaturePrompt] = useState(false);

  const busy = ['inspecting', 'cleaning', 'verifying'].includes(status);
  const baseline = useMemo(() => before ? createRemovalBaseline(before, likelyCleanupEngine(before.file.detectedType)) : null, [before]);

  const stop = () => {
    runId.current += 1;
    task.current?.cancel(); task.current = null;
    exif.current?.cancel(); exif.current = null;
    removal.current?.cancel(); removal.current = null;
  };

  const clear = () => {
    stop(); setFile(null); setBefore(null); setResult(null); setError(null); setStatus('idle'); setDetail(t('Nothing is uploaded.', '不会上传任何内容。', 'Nichts wird hochgeladen.')); setBaselineComplete(false); setSignaturePrompt(false);
    if (input.current) input.current.value = '';
    window.requestAnimationFrame(() => dropzone.current?.focus());
  };

  useEffect(() => () => stop(), []);

  const inspect = async (selected: File) => {
    stop();
    const id = runId.current + 1; runId.current = id;
    setFile(selected); setBefore(null); setResult(null); setError(null); setStatus('inspecting'); setDetail(t('Checking the real format before a cleanup engine starts.', '清理引擎启动前，先检查真实文件格式。', 'Vor dem Start der Bereinigung prüfen wir das tatsächliche Dateiformat.')); setBaselineComplete(false); setSignaturePrompt(false);
    const typeHint = selected.name.split('.').pop()?.toLowerCase();
    const imageHint = selected.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'tif', 'tiff', 'gif'].includes(typeHint ?? '');
    const limit = imageHint ? IMAGE_LIMIT : UNIVERSAL_LIMIT;
    if (selected.size > limit) { setStatus('failed'); setError(zh ? `${imageHint ? '图片' : '文件'}上限为 ${Math.round(limit / 1024 / 1024)} MB。` : de ? `${imageHint ? 'Bilder' : 'Dateien'} dürfen höchstens ${Math.round(limit / 1024 / 1024)} MB groß sein.` : `${imageHint ? 'Images' : 'Files'} are limited to ${Math.round(limit / 1024 / 1024)} MB.`); return; }
    try {
      const scanned = await scanReport(selected, allowedTypes, locale, setDetail, (current) => { task.current = current; }, (current) => { exif.current = current; });
      if (runId.current !== id) return;
      setBefore(scanned.report); setBaselineComplete(scanned.complete); setStatus('ready');
      const eligible = createRemovalBaseline(scanned.report, likelyCleanupEngine(scanned.report.file.detectedType)).eligible;
      setDetail(scanned.complete ? (zh ? `发现 ${eligible} 个可能可清除的字段，原文件没有改变。` : de ? `${eligible} vermutlich entfernbare Felder gefunden. Die Originaldatei bleibt unverändert.` : `Found ${eligible} removable-looking fields. The source file is unchanged.`) : t('The fast report is ready, but the full metadata scan did not finish. Cleanup can continue only as an incomplete verification.', '快速报告已经就绪，但完整元数据扫描未完成；继续清理只能得到“不完整验证”。', 'Der Schnellbericht ist fertig, der vollständige Metadatenscan aber nicht. Die Bereinigung kann nur mit unvollständiger Prüfung fortgesetzt werden.'));
    } catch (caught) {
      if (runId.current !== id) return;
      if (caught instanceof ExifToolCancellationError) { setStatus('canceled'); setDetail(t('The scan was canceled.', '扫描已取消。', 'Der Scan wurde abgebrochen.')); return; }
      setStatus('failed'); setError(caught instanceof Error ? caught.message : t('The file could not be inspected safely.', '无法安全检查这个文件。', 'Die Datei konnte nicht sicher geprüft werden.'));
    }
  };

  const picker = () => { if (busy) return; if (input.current) { input.current.value = ''; input.current.click(); } };

  const clean = async (confirmed = false) => {
    if (!file || !before || busy) return;
    if (baseline?.signed && !confirmed) { setSignaturePrompt(true); return; }
    setSignaturePrompt(false); setResult(null); setError(null); setStatus('cleaning'); setDetail(t('Preparing a metadata-only copy. Media and document content stay untouched.', '正在准备只清理元数据的副本，媒体和文档内容不会动。', 'Eine Kopie nur für die Metadaten-Bereinigung wird vorbereitet. Medien- und Dokumentinhalte bleiben unangetastet.'));
    const id = runId.current;
    const type = before.file.detectedType;
    try {
      let cleaned: MetadataWorkerCleanup;
      if (EXIF_TYPES.includes(type)) {
        const client = new ExifToolWorkerClient(); exif.current = client;
        cleaned = await client.cleanMetadata(file, IMAGE_TYPES.includes(type) ? 'image' : 'quicktime', () => setDetail(t('ExifTool is removing writable metadata locally.', 'ExifTool 正在本地清除可写元数据。', 'ExifTool entfernt beschreibbare Metadaten lokal.')));
        client.terminate(); exif.current = null;
      } else if (type === 'pdf') {
        const worker = new MetadataRemovalWorkerClient(); removal.current = worker;
        cleaned = await worker.clean(file, type, () => setDetail(t('qpdf is removing top-level Info and XMP dictionaries while rewriting the entire PDF.', 'qpdf 正在完整重写 PDF，并清除顶层 Info 与 XMP 字典。', 'qpdf schreibt das PDF vollständig neu und entfernt dabei die Info- und XMP-Verzeichnisse auf oberster Ebene.')));
        removal.current = null;
      } else {
        const worker = new MetadataRemovalWorkerClient(); removal.current = worker;
        cleaned = await worker.clean(file, type, (stage) => setDetail(stage === 'loading-engine' ? t('Loading the format-specific cleanup engine.', '正在加载格式专用清理引擎。', 'Formatspezifische Bereinigungs-Engine wird geladen.') : stage === 'rewriting-file' ? t('Rewriting metadata without re-encoding the content.', '正在重写元数据，不重新编码内容。', 'Metadaten werden neu geschrieben, ohne den Inhalt neu zu kodieren.') : t('Checking the cleaned container.', '正在检查清理后的容器。', 'Der bereinigte Container wird geprüft.')));
        removal.current = null;
      }
      if (runId.current !== id) return;
      const name = cleanName(file.name, type);
      const blob = new Blob([cleaned.data], { type: cleaned.mime });
      const output = new File([blob], name, { type: cleaned.mime, lastModified: Date.now() });
      setStatus('verifying'); setDetail(t('The cleaned copy is being parsed again at the same scan depth.', '正在用相同扫描深度重新解析清理副本。', 'Die bereinigte Kopie wird mit derselben Scantiefe erneut analysiert.'));
      const verified = await scanReport(output, [type], locale, setDetail, (current) => { task.current = current; }, (current) => { exif.current = current; });
      if (runId.current !== id) return;
      const diff = compareRemovalReports(before, verified.report);
      const checks = [
        { id: 'signature', label: 'File signature', status: verified.report.file.detectedType === type ? 'passed' as const : 'failed' as const, message: verified.report.file.detectedType === type ? `Output is still ${type.toUpperCase()}.` : `Output changed to ${verified.report.file.detectedType.toUpperCase()}.` },
        { id: 'non-empty', label: 'Output bytes', status: blob.size > 0 ? 'passed' as const : 'failed' as const, message: blob.size > 0 ? `Output contains ${formatBytes(blob.size)}.` : 'The cleanup engine produced an empty file.' },
        ...matchingFacts(before, verified.report),
      ];
      const blocked = checks.some((check) => check.status === 'failed');
      const cleanupStatus: MetadataCleanupStatus = blocked ? 'blocked' : (!baselineComplete || !verified.complete) ? 'incomplete' : diff.residual.length ? 'verified-residual' : 'verified';
      const warnings = [...cleaned.warnings];
      if (baseline?.signed) warnings.unshift('The source carried a signature or Content Credential. Any signature on this modified copy is no longer valid.');
      if (!verified.complete) warnings.push(verified.warning ?? 'The full output rescan did not finish.');
      setResult({ blob, fileName: name, mime: cleaned.mime, engine: cleaned.engine, status: cleanupStatus, beforeSize: file.size, afterSize: blob.size, removed: diff.removed, preserved: diff.preserved, residual: diff.residual, checks, warnings });
      setStatus('complete'); setDetail(zh ? (cleanupStatus === 'verified' ? '验证通过：输出扫描未发现可清除元数据。' : cleanupStatus === 'verified-residual' ? '验证通过，但仍有残留元数据；分享前请检查剩余内容。' : cleanupStatus === 'blocked' ? '输出未通过完整性检查，下载已阻止。' : '副本已生成，但完整验证没有完成。') : de ? (cleanupStatus === 'verified' ? 'Bestätigt: Im Ausgabescan wurden keine entfernbaren Metadaten gefunden.' : cleanupStatus === 'verified-residual' ? 'Bestätigt, aber es sind Rest-Metadaten vorhanden. Vor dem Teilen bitte prüfen.' : cleanupStatus === 'blocked' ? 'Die Ausgabe hat eine Integritätsprüfung nicht bestanden. Der Download ist gesperrt.' : 'Die Kopie wurde erstellt, die vollständige Prüfung aber nicht abgeschlossen.') : cleanupStatus === 'verified' ? 'Verified: removable metadata was not found in the output scan.' : cleanupStatus === 'verified-residual' ? 'Verified with residual metadata. Review what remains before sharing.' : cleanupStatus === 'blocked' ? 'The output failed an integrity check and download is blocked.' : 'The copy was created, but full verification did not finish.');
    } catch (caught) {
      if (runId.current !== id) return;
      if (caught instanceof MetadataRemovalCanceledError || caught instanceof ExifToolCancellationError) { setStatus('canceled'); setDetail(t('Cleanup was canceled. The source file is unchanged.', '清理已取消，原文件没有改变。', 'Die Bereinigung wurde abgebrochen. Die Originaldatei bleibt unverändert.')); return; }
      setStatus('failed'); setError(caught instanceof Error ? caught.message : t('Metadata cleanup failed safely.', '元数据清理已安全失败。', 'Die Metadaten-Bereinigung ist sicher fehlgeschlagen.')); setDetail(t('No downloadable copy was accepted.', '没有接受任何可下载副本。', 'Es wurde keine herunterladbare Kopie übernommen.'));
    }
  };

  const receipt = result && before ? createCleanupReceipt(result, { name: before.file.safeName, type: before.file.detectedType, size: before.file.size }) : null;

  return <section className={`workbench removal-workbench removal-${scope}`} aria-busy={busy}>
    <div className="workbench-topline"><div className="local-proof"><Icon icon={checkIcon} width="18" /><span>{t('Your file stays on this device.', '文件只留在这台设备上。', 'Deine Datei bleibt auf diesem Gerät.')}</span></div><span className="status-line" role="status" aria-live="polite"><i className={busy ? 'is-live' : ''}></i>{statusLabel(status, locale)}</span></div>
    <input ref={input} className="sr-only" type="file" tabIndex={-1} aria-hidden="true" accept={accept} onChange={(event) => { const selected = event.target.files?.item(0); if (selected) void inspect(selected); }} />
    {!before ? <div ref={dropzone} className={`removal-dropzone ${dragging ? 'is-dragging' : ''}`} role="button" tabIndex={busy ? -1 : 0} aria-label={chooseLabel} aria-describedby={`removal-drop-help-${scope}`} aria-disabled={busy} onClick={picker} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); picker(); } }} onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); const selected = event.dataTransfer.files.item(0); if (selected && !busy) void inspect(selected); }}>
      <div className="removal-drop-icon"><Icon icon={uploadIcon} width="38" /></div><div><span className="eyebrow">{t('ONE FILE · METADATA ONLY', '一个文件 · 只清元数据', 'EINE DATEI · NUR METADATEN')}</span><h2>{zh ? `把${scope === 'image' ? '图片' : '文件'}拖到这里` : de ? (scope === 'image' ? 'Bild hier ablegen' : 'Datei hier ablegen') : scope === 'image' ? 'Drop an image here' : 'Drop a file here'}</h2><p id={`removal-drop-help-${scope}`}>{formats} · {scope === 'image' ? t('up to 50 MB', '最大 50 MB', 'bis 50 MB') : t('up to 100 MB', '最大 100 MB', 'bis 100 MB')}</p><span className="button button-primary removal-pick-label">{chooseLabel}</span></div><aside><strong>{t('No re-encoding.', '不重新编码。', 'Keine Neukodierung.')}</strong><span>{t('Content stays intact.', '内容保持完整。', 'Inhalte bleiben intakt.')}</span><small>{t('Nothing is uploaded.', '不会上传。', 'Kein Upload.')}</small></aside>
    </div> : null}
    {error ? <div className="removal-error" role="alert"><Icon icon={warningIcon} width="20" /><div><strong>{t('Could not finish this file', '这个文件没能处理完', 'Diese Datei konnte nicht fertig verarbeitet werden')}</strong><p>{error}</p></div><button type="button" onClick={clear}>{t('Choose another file', '换一个文件', 'Andere Datei wählen')}</button></div> : null}
    {before ? <div className="removal-report">
      <header className="removal-file-head"><div><span className="eyebrow">{t('Cleanup desk', '清理台', 'Bereinigungsplatz')}</span><h2>{before.file.name}</h2><p>{detail}</p></div><div className="removal-file-actions"><button className="button button-secondary" type="button" onClick={picker} disabled={busy}><Icon icon={replaceIcon} width="16" />{t('Replace', '替换', 'Ersetzen')}</button><button className="button button-ghost" type="button" onClick={clear} disabled={busy}><Icon icon={trashIcon} width="16" />{t('Clear', '清除', 'Leeren')}</button></div></header>
      <div className="removal-facts"><div><span>{t('Format', '格式', 'Format')}</span><strong>{before.file.detectedType.toUpperCase()}</strong></div><div><span>{t('Source size', '原文件大小', 'Originalgröße')}</span><strong>{formatBytes(before.file.size)}</strong></div><div><span>{t('Fields read', '已读字段', 'Gelesene Felder')}</span><strong>{baseline?.read ?? 0}</strong></div><div><span>{t('Eligible', '可清除', 'Entfernbar')}</span><strong>{baseline?.eligible ?? 0}</strong></div><div><span>{t('Engine', '引擎', 'Engine')}</span><strong>{baseline?.engine ?? '—'}</strong></div></div>
      {signaturePrompt ? <section className="signature-warning" role="alert"><Icon icon={warningIcon} width="24" /><div><h3>{t('This file carries a signature.', '这个文件带有签名。', 'Diese Datei trägt eine Signatur.')}</h3><p>{t('Changing metadata invalidates C2PA or document signatures. The original remains untouched, but the new copy cannot keep the old proof.', '修改元数据会让 C2PA 或文档签名失效。原件不会改变，但新副本无法保留旧证明。', 'Änderungen an Metadaten machen C2PA- oder Dokumentsignaturen ungültig. Das Original bleibt unberührt, die neue Kopie kann den alten Nachweis aber nicht behalten.')}</p><div className="button-row"><button className="button button-primary" type="button" onClick={() => void clean(true)}>{t('I understand — clean a copy', '我明白，生成清理副本', 'Verstanden — Kopie bereinigen')}</button><button className="button button-ghost" type="button" onClick={() => setSignaturePrompt(false)}>{t('Cancel', '取消', 'Abbrechen')}</button></div></div></section> : null}
      {!result ? <section className="removal-action"><div><span className="eyebrow">{t('Content-preserving policy', '内容保留策略', 'Inhaltserhaltende Methode')}</span><h3>{t('Remove labels. Keep the actual file.', '清标签，保留真正的文件。', 'Etiketten weg. Die eigentliche Datei bleibt.')}</h3><p>{t('Descriptive, identity, location, software, date, and custom fields are targeted. Cover art, chapters, subtitles, attachments, comments, revisions, ICC color, orientation, and media tracks stay.', '目标是描述、身份、位置、软件、日期和自定义字段；封面、章节、字幕、附件、评论、修订、ICC 色彩、方向和媒体轨道会保留。', 'Entfernt werden Beschreibungs-, Identitäts-, Standort-, Software-, Datums- und benutzerdefinierte Felder. Cover, Kapitel, Untertitel, Anhänge, Kommentare, Revisionen, ICC-Farben, Ausrichtung und Medienspuren bleiben erhalten.')}</p></div><button className="button button-primary" type="button" disabled={busy} onClick={() => void clean()}><Icon icon={eraseIcon} width="18" />{busy ? statusLabel(status, locale) : t('Create and verify clean copy', '生成并验证清理副本', 'Saubere Kopie erstellen und prüfen')}</button></section> : null}
      {busy ? <div className="removal-progress"><i></i><span>{detail}</span><button type="button" onClick={() => { stop(); setStatus('canceled'); setDetail(t('Canceled. The source file is unchanged.', '已取消，原文件没有改变。', 'Abgebrochen. Die Originaldatei bleibt unverändert.')); }}>{t('Cancel', '取消', 'Abbrechen')}</button></div> : null}
      {result ? <section className={`removal-result is-${result.status}`}>
        <header><div><span className="eyebrow">{t('Verification result', '验证结果', 'Prüfergebnis')}</span><h3>{result.status === 'verified' ? t('Verified', '验证通过', 'Bestätigt') : result.status === 'verified-residual' ? t('Verified with residual metadata', '验证通过，但有残留元数据', 'Bestätigt, mit Rest-Metadaten') : result.status === 'blocked' ? t('Output blocked', '输出已阻止', 'Ausgabe gesperrt') : t('Verification incomplete', '验证不完整', 'Prüfung unvollständig')}</h3><p>{formatBytes(result.beforeSize)} → {formatBytes(result.afterSize)} · {result.engine}</p></div><div className="removal-counts"><b><strong>{result.removed.length}</strong>{t('Removed', '已清除', 'Entfernt')}</b><b><strong>{result.preserved.length}</strong>{t('Preserved', '已保留', 'Behalten')}</b><b><strong>{result.residual.length}</strong>{t('Residual', '残留', 'Verblieben')}</b></div></header>
        <div className="removal-checks">{result.checks.map((check) => <article key={check.id} className={`is-${check.status}`}><i></i><div><strong>{check.label}</strong><span>{check.message}</span></div></article>)}</div>
        {result.warnings.length ? <div className="removal-warnings">{result.warnings.map((warning) => <p key={warning}><Icon icon={warningIcon} width="15" />{warning}</p>)}</div> : null}
        <div className="removal-diff-grid"><details open><summary>{t('Removed fields', '已清除字段', 'Entfernte Felder')} <b>{result.removed.length}</b></summary>{result.removed.length ? result.removed.slice(0, 120).map((field) => <div key={`${field.id}-${field.path}`}><strong>{field.label}</strong><code>{field.path}</code><span>{field.displayValue}</span></div>) : <p>{t('No eligible fields were present in the source report.', '原报告中没有可清除字段。', 'Im Ausgangsbericht waren keine entfernbaren Felder vorhanden.')}</p>}</details><details><summary>{t('Intentionally preserved', '有意保留', 'Bewusst beibehalten')} <b>{result.preserved.length}</b></summary>{result.preserved.map((field) => <div key={`${field.id}-${field.path}`}><strong>{field.label}</strong><code>{field.path}</code><span>{field.reason}</span></div>)}</details><details open={result.residual.length > 0}><summary>{t('Residual metadata', '残留元数据', 'Rest-Metadaten')} <b>{result.residual.length}</b></summary>{result.residual.length ? result.residual.map((field) => <div key={`${field.id}-${field.path}`}><strong>{field.label}</strong><code>{field.path}</code><span>{field.displayValue}</span></div>) : <p>{t('No eligible residual fields were found.', '没有发现可清除的残留字段。', 'Es wurden keine entfernbaren Restfelder gefunden.')}</p>}</details></div>
        <footer><button className="button button-primary" type="button" disabled={result.status === 'blocked'} onClick={() => downloadBlob(result.blob, result.fileName)}><Icon icon={downloadIcon} width="17" />{t('Download clean copy', '下载清理副本', 'Saubere Kopie herunterladen')}</button><button className="button button-secondary" type="button" onClick={() => receipt && downloadBlob(new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' }), `${sanitizeFilename(result.fileName, '')}.metadata-cleanup.json`)}><Icon icon={receiptIcon} width="17" />{t('Download receipt', '下载英文收据', 'Englischen Beleg herunterladen')}</button><button className="button button-ghost" type="button" onClick={() => { setResult(null); setStatus('ready'); setDetail(t('The original report is ready for another local cleanup.', '原报告已就绪，可以再次本地清理。', 'Der Ausgangsbericht ist bereit für eine weitere lokale Bereinigung.')); }}>{t('Start over', '重新开始', 'Neu beginnen')}</button></footer>
      </section> : null}
    </div> : null}
  </section>;
}
