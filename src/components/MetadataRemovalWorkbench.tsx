import { outputCheckText } from '../i18n/workbench-checks';
import { downloadBlob } from '../lib/browser/download';
import { scanReport, matchingFacts } from '../lib/metadata-removal/scan-report';
import { removalTranslator } from '../i18n/workbench-removal';
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
import type { MetadataReport } from '../lib/metadata-report/types';
import { compareRemovalReports, createRemovalBaseline, likelyCleanupEngine } from '../lib/metadata-removal/policy';
import { createCleanupReceipt } from '../lib/metadata-removal/receipt';
import type { MetadataCleanupResult, MetadataCleanupStatus, MetadataRemovalScope, MetadataWorkerCleanup } from '../lib/metadata-removal/types';
import { MetadataRemovalCanceledError, MetadataRemovalWorkerClient } from '../lib/metadata-removal/worker-client';
import { type WorkerTask } from '../lib/worker-client';
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

export default function MetadataRemovalWorkbench({ locale = 'en', ...props }: Props) {
  return <LocaleProvider locale={locale}><MetadataRemovalWorkbenchContent {...props} /></LocaleProvider>;
}

function MetadataRemovalWorkbenchContent({ scope, formats, accept, allowedTypes }: Omit<Props, 'locale'>) {
  const locale = useLocale();
  const t = removalTranslator(locale);
  const chooseLabel = scope === 'image' ? t("choose-an-image") : t("choose-a-file");
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
  const [detail, setDetail] = useState(t("nothing-is-uploaded"));
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
    stop(); setFile(null); setBefore(null); setResult(null); setError(null); setStatus('idle'); setDetail(t("nothing-is-uploaded")); setBaselineComplete(false); setSignaturePrompt(false);
    if (input.current) input.current.value = '';
    window.requestAnimationFrame(() => dropzone.current?.focus());
  };

  useEffect(() => () => stop(), []);

  const inspect = async (selected: File) => {
    stop();
    const id = runId.current + 1; runId.current = id;
    setFile(selected); setBefore(null); setResult(null); setError(null); setStatus('inspecting'); setDetail(t("checking-the-real-format-before-a-cleanup-engine-starts")); setBaselineComplete(false); setSignaturePrompt(false);
    const typeHint = selected.name.split('.').pop()?.toLowerCase();
    const imageHint = selected.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'tif', 'tiff', 'gif'].includes(typeHint ?? '');
    const limit = imageHint ? IMAGE_LIMIT : UNIVERSAL_LIMIT;
    if (selected.size > limit) { setStatus('failed'); setError(t("size-limit", { limit: Math.round(limit / 1024 / 1024) })); return; }
    try {
      const scanned = await scanReport(selected, allowedTypes, locale, setDetail, (current) => { task.current = current; }, (current) => { exif.current = current; });
      if (runId.current !== id) return;
      setBefore(scanned.report); setBaselineComplete(scanned.complete); setStatus('ready');
      const eligible = createRemovalBaseline(scanned.report, likelyCleanupEngine(scanned.report.file.detectedType)).eligible;
      setDetail(scanned.complete ? (t("eligible-count", { count: eligible })) : t("the-fast-report-is-ready-but-the-full-metadata-scan-did-not-finish-cleanup-can-continue-only-as-an-incomplete-verification"));
    } catch (caught) {
      if (runId.current !== id) return;
      if (caught instanceof ExifToolCancellationError) { setStatus('canceled'); setDetail(t("the-scan-was-canceled")); return; }
      setStatus('failed'); setError(caught instanceof Error ? caught.message : t("the-file-could-not-be-inspected-safely"));
    }
  };

  const picker = () => { if (busy) return; if (input.current) { input.current.value = ''; input.current.click(); } };

  const clean = async (confirmed = false) => {
    if (!file || !before || busy) return;
    if (baseline?.signed && !confirmed) { setSignaturePrompt(true); return; }
    setSignaturePrompt(false); setResult(null); setError(null); setStatus('cleaning'); setDetail(t("preparing-a-metadata-only-copy-content-checks-run-after-cleanup"));
    const id = runId.current;
    const type = before.file.detectedType;
    try {
      let cleaned: MetadataWorkerCleanup;
      if (EXIF_TYPES.includes(type)) {
        const client = new ExifToolWorkerClient(); exif.current = client;
        cleaned = await client.cleanMetadata(file, IMAGE_TYPES.includes(type) ? 'image' : 'quicktime', () => setDetail(t("exiftool-is-removing-writable-metadata-locally")));
        client.terminate(); exif.current = null;
      } else if (type === 'pdf') {
        const worker = new MetadataRemovalWorkerClient(); removal.current = worker;
        cleaned = await worker.clean(file, type, () => setDetail(t("qpdf-is-removing-top-level-info-and-xmp-dictionaries-while-rewriting-the-entire-pdf")));
        removal.current = null;
      } else {
        const worker = new MetadataRemovalWorkerClient(); removal.current = worker;
        cleaned = await worker.clean(file, type, (stage) => setDetail(stage === 'loading-engine' ? t("loading-the-format-specific-cleanup-engine") : stage === 'rewriting-file' ? t("rewriting-metadata-without-re-encoding-the-content") : t("checking-the-cleaned-container")));
        removal.current = null;
      }
      if (runId.current !== id) return;
      const name = cleanName(file.name, type);
      const blob = new Blob([cleaned.data], { type: cleaned.mime });
      const output = new File([blob], name, { type: cleaned.mime, lastModified: Date.now() });
      setStatus('verifying'); setDetail(t("the-cleaned-copy-is-being-parsed-again-at-the-same-scan-depth"));
      const verified = await scanReport(output, [type], locale, setDetail, (current) => { task.current = current; }, (current) => { exif.current = current; });
      if (runId.current !== id) return;
      const diff = compareRemovalReports(before, verified.report);
      const checks = [
        { id: 'signature', label: 'File signature', status: verified.report.file.detectedType === type ? 'passed' as const : 'failed' as const, message: verified.report.file.detectedType === type ? `Output is still ${type.toUpperCase()}.` : `Output changed to ${verified.report.file.detectedType.toUpperCase()}.` },
        { id: 'non-empty', label: 'Output bytes', status: blob.size > 0 ? 'passed' as const : 'failed' as const, message: blob.size > 0 ? `Output contains ${formatBytes(blob.size)}.` : 'The cleanup engine produced an empty file.' },
        ...matchingFacts(before, verified.report),
        ...(cleaned.contentChecks ?? [{ id: 'content-payload', label: 'Content consistency', status: 'warning' as const, message: 'Only structure was checked. Content consistency has not been verified for this format.' }]),
      ];
      const blocked = checks.some((check) => check.status === 'failed');
      const cleanupStatus: MetadataCleanupStatus = blocked ? 'blocked' : (!baselineComplete || !verified.complete) ? 'incomplete' : diff.residual.length ? 'verified-residual' : 'verified';
      const warnings = [...cleaned.warnings];
      if (!baselineComplete) warnings.push('The original metadata scan was incomplete. Removal counts cannot account for unread fields.');
      if (baseline?.signed) warnings.unshift('The source carried a signature or Content Credential. Any signature on this modified copy is no longer valid.');
      if (!verified.complete) warnings.push(verified.warning ?? 'The full output rescan did not finish.');
      setResult({ blob, fileName: name, mime: cleaned.mime, engine: cleaned.engine, status: cleanupStatus, beforeSize: file.size, afterSize: blob.size, removed: diff.removed, preserved: diff.preserved, residual: diff.residual, checks, warnings });
      setStatus('complete'); setDetail(t(`result-${cleanupStatus}`));
    } catch (caught) {
      if (runId.current !== id) return;
      if (caught instanceof MetadataRemovalCanceledError || caught instanceof ExifToolCancellationError) { setStatus('canceled'); setDetail(t("cleanup-was-canceled-the-source-file-is-unchanged")); return; }
      setStatus('failed'); setError(caught instanceof Error ? caught.message : t("metadata-cleanup-failed-safely")); setDetail(t("no-downloadable-copy-was-accepted"));
    }
  };

  const receipt = result && before ? createCleanupReceipt(result, { name: before.file.safeName, type: before.file.detectedType, size: before.file.size }) : null;

  return <section className={`workbench removal-workbench removal-${scope}`} aria-busy={busy}>
    <div className="workbench-topline"><div className="local-proof"><Icon icon={checkIcon} width="18" /><span>{t("your-file-stays-on-this-device")}</span></div><span className="status-line" role="status" aria-live="polite"><i className={busy ? 'is-live' : ''}></i>{t(`status-${status}`)}</span></div>
    <input ref={input} className="sr-only" type="file" tabIndex={-1} aria-hidden="true" accept={accept} onChange={(event) => { const selected = event.target.files?.item(0); if (selected) void inspect(selected); }} />
    {!before ? <div ref={dropzone} className={`removal-dropzone ${dragging ? 'is-dragging' : ''}`} role="button" tabIndex={busy ? -1 : 0} aria-label={chooseLabel} aria-describedby={`removal-drop-help-${scope}`} aria-disabled={busy} onClick={picker} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); picker(); } }} onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); const selected = event.dataTransfer.files.item(0); if (selected && !busy) void inspect(selected); }}>
      <div className="removal-drop-icon"><Icon icon={uploadIcon} width="38" /></div><div><span className="eyebrow">{t("one-file-metadata-only")}</span><h2>{t(scope === "image" ? "drop-image" : "drop-file")}</h2><p id={`removal-drop-help-${scope}`}>{formats} · {scope === 'image' ? t("up-to-50-mb") : t("up-to-100-mb")}</p><span className="button button-primary removal-pick-label">{chooseLabel}</span></div><aside><strong>{t("no-re-encoding")}</strong><span>{t("content-checks-included")}</span><small>{t("nothing-is-uploaded")}</small></aside>
    </div> : null}
    {error ? <div className="removal-error" role="alert"><Icon icon={warningIcon} width="20" /><div><strong>{t("could-not-finish-this-file")}</strong><p>{error}</p></div><button type="button" onClick={clear}>{t("choose-another-file")}</button></div> : null}
    {before ? <div className="removal-report">
      <header className="removal-file-head"><div><span className="eyebrow">{t("cleanup-desk")}</span><h2>{before.file.name}</h2><p>{detail}</p></div><div className="removal-file-actions"><button className="button button-secondary" type="button" onClick={picker} disabled={busy}><Icon icon={replaceIcon} width="16" />{t("replace")}</button><button className="button button-ghost" type="button" onClick={clear} disabled={busy}><Icon icon={trashIcon} width="16" />{t("clear")}</button></div></header>
      <div className="removal-facts"><div><span>{t("format")}</span><strong>{before.file.detectedType.toUpperCase()}</strong></div><div><span>{t("source-size")}</span><strong>{formatBytes(before.file.size)}</strong></div><div><span>{t("fields-read")}</span><strong>{baseline?.read ?? 0}</strong></div><div><span>{t("eligible")}</span><strong>{baseline?.eligible ?? 0}</strong></div><div><span>{t("engine")}</span><strong>{baseline?.engine ?? '—'}</strong></div></div>
      {signaturePrompt ? <section className="signature-warning" role="alert"><Icon icon={warningIcon} width="24" /><div><h3>{t("this-file-carries-a-signature")}</h3><p>{t("changing-metadata-invalidates-c2pa-or-document-signatures-the-original-remains-untouched-but-the-new-copy-cannot-keep-the-old-proof")}</p><div className="button-row"><button className="button button-primary" type="button" onClick={() => void clean(true)}>{t("i-understand-clean-a-copy")}</button><button className="button button-ghost" type="button" onClick={() => setSignaturePrompt(false)}>{t("cancel")}</button></div></div></section> : null}
      {!result ? <section className="removal-action"><div><span className="eyebrow">{t("content-preserving-policy")}</span><h3>{t("remove-labels-keep-the-actual-file")}</h3><p>{t("descriptive-identity-location-software-date-and-custom-fields-are-targeted-cover-art-chapters-subtitles-attachments-comments-revisions-icc-color-orientation-and-media-tracks-stay")}</p></div><button className="button button-primary" type="button" disabled={busy} onClick={() => void clean()}><Icon icon={eraseIcon} width="18" />{busy ? t(`status-${status}`) : t("create-and-verify-clean-copy")}</button></section> : null}
      {busy ? <div className="removal-progress"><i></i><span>{detail}</span><button type="button" onClick={() => { stop(); setStatus('canceled'); setDetail(t("canceled-the-source-file-is-unchanged")); }}>{t("cancel")}</button></div> : null}
      {result ? <section className={`removal-result is-${result.status}`}>
        <header><div><span className="eyebrow">{t("verification-result")}</span><h3>{result.status === 'verified' ? t("verified") : result.status === 'verified-residual' ? t("verified-with-residual-metadata") : result.status === 'blocked' ? t("output-blocked") : t("verification-incomplete")}</h3><p>{formatBytes(result.beforeSize)} → {formatBytes(result.afterSize)} · {result.engine}</p></div><div className="removal-counts"><b><strong>{result.removed.length}</strong>{t("removed")}</b><b><strong>{result.preserved.length}</strong>{t("preserved")}</b><b><strong>{result.residual.length}</strong>{t("residual")}</b></div></header>
        <div className="removal-checks">{result.checks.map((check) => <article key={check.id} className={`is-${check.status}`}><i></i><div><strong>{outputCheckText(check, locale).label}</strong><span>{outputCheckText(check, locale).message}</span></div></article>)}</div>
        {result.warnings.length ? <div className="removal-warnings">{result.warnings.map((warning) => <p key={warning}><Icon icon={warningIcon} width="15" />{warning}</p>)}</div> : null}
        <div className="removal-diff-grid"><details open><summary>{t("removed-fields")} <b>{result.removed.length}</b></summary>{result.removed.length ? result.removed.slice(0, 120).map((field) => <div key={`${field.id}-${field.path}`}><strong>{field.label}</strong><code>{field.path}</code><span>{field.displayValue}</span></div>) : <p>{t("no-eligible-fields-were-present-in-the-source-report")}</p>}</details><details><summary>{t("intentionally-preserved")} <b>{result.preserved.length}</b></summary>{result.preserved.map((field) => <div key={`${field.id}-${field.path}`}><strong>{field.label}</strong><code>{field.path}</code><span>{field.reason}</span></div>)}</details><details open={result.residual.length > 0}><summary>{t("residual-metadata")} <b>{result.residual.length}</b></summary>{result.residual.length ? result.residual.map((field) => <div key={`${field.id}-${field.path}`}><strong>{field.label}</strong><code>{field.path}</code><span>{field.displayValue}</span></div>) : <p>{t("no-eligible-residual-fields-were-found")}</p>}</details></div>
        <footer><button className="button button-primary" type="button" disabled={result.status === 'blocked'} onClick={() => downloadBlob(result.blob, result.fileName)}><Icon icon={downloadIcon} width="17" />{t("download-clean-copy")}</button><button className="button button-secondary" type="button" onClick={() => receipt && downloadBlob(new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' }), `${sanitizeFilename(result.fileName, '')}.metadata-cleanup.json`)}><Icon icon={receiptIcon} width="17" />{t("download-receipt")}</button><button className="button button-ghost" type="button" onClick={() => { setResult(null); setStatus('ready'); setDetail(t("the-original-report-is-ready-for-another-local-cleanup")); }}>{t("start-over")}</button></footer>
      </section> : null}
    </div> : null}
  </section>;
}
