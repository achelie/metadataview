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

interface Props {
  scope: MetadataRemovalScope;
  formats: string;
  accept: string;
  allowedTypes: DetectedFileType[];
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

function statusLabel(status: WorkStatus): string {
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

async function scanReport(file: File, allowedTypes: DetectedFileType[], onStatus: (message: string) => void, registerTask: (task: WorkerTask<MetadataReport> | null) => void, registerExif: (client: ExifToolWorkerClient | null) => void) {
  const task = runWorkerTask<MetadataReport>({ type: 'inspect-metadata', file, allowedTypes } as never, 90_000);
  registerTask(task);
  const base = await task.promise;
  registerTask(null);
  const image = base.category === 'image';
  const mode = image ? 'embedded' as const : 'standard' as const;
  const client = new ExifToolWorkerClient();
  registerExif(client);
  try {
    const inspection = await client.inspect(file, mode, (stage) => onStatus(stage === 'loading' ? 'Loading the local metadata engine' : stage === 'extracting' ? 'Reading every available metadata field' : 'Building the safe report'), image ? IMAGE_FULL_SCAN_TIMEOUT_MS : STANDARD_SCAN_TIMEOUT_MS);
    return { report: mergeExifToolInspection(base, inspection), complete: true };
  } catch (error) {
    if (error instanceof ExifToolCancellationError) throw error;
    const message = error instanceof Error ? error.message : 'ExifTool could not complete the scan.';
    return { report: recordExifToolFailure(base, message, mode), complete: false, warning: message };
  } finally {
    client.terminate(); registerExif(null);
  }
}

export default function MetadataRemovalWorkbench({ scope, formats, accept, allowedTypes }: Props) {
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
  const [detail, setDetail] = useState('Nothing is uploaded.');
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
    stop(); setFile(null); setBefore(null); setResult(null); setError(null); setStatus('idle'); setDetail('Nothing is uploaded.'); setBaselineComplete(false); setSignaturePrompt(false);
    if (input.current) input.current.value = '';
    window.requestAnimationFrame(() => dropzone.current?.focus());
  };

  useEffect(() => () => stop(), []);

  const inspect = async (selected: File) => {
    stop();
    const id = runId.current + 1; runId.current = id;
    setFile(selected); setBefore(null); setResult(null); setError(null); setStatus('inspecting'); setDetail('Checking the real format before a cleanup engine starts.'); setBaselineComplete(false); setSignaturePrompt(false);
    const typeHint = selected.name.split('.').pop()?.toLowerCase();
    const imageHint = selected.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'tif', 'tiff', 'gif'].includes(typeHint ?? '');
    const limit = imageHint ? IMAGE_LIMIT : UNIVERSAL_LIMIT;
    if (selected.size > limit) { setStatus('failed'); setError(`${imageHint ? 'Images' : 'Files'} are limited to ${Math.round(limit / 1024 / 1024)} MB.`); return; }
    try {
      const scanned = await scanReport(selected, allowedTypes, setDetail, (current) => { task.current = current; }, (current) => { exif.current = current; });
      if (runId.current !== id) return;
      setBefore(scanned.report); setBaselineComplete(scanned.complete); setStatus('ready');
      setDetail(scanned.complete ? `Found ${createRemovalBaseline(scanned.report, likelyCleanupEngine(scanned.report.file.detectedType)).eligible} removable-looking fields. The source file is unchanged.` : 'The fast report is ready, but the full metadata scan did not finish. Cleanup can continue only as an incomplete verification.');
    } catch (caught) {
      if (runId.current !== id) return;
      if (caught instanceof ExifToolCancellationError) { setStatus('canceled'); setDetail('The scan was canceled.'); return; }
      setStatus('failed'); setError(caught instanceof Error ? caught.message : 'The file could not be inspected safely.');
    }
  };

  const picker = () => { if (busy) return; if (input.current) { input.current.value = ''; input.current.click(); } };

  const clean = async (confirmed = false) => {
    if (!file || !before || busy) return;
    if (baseline?.signed && !confirmed) { setSignaturePrompt(true); return; }
    setSignaturePrompt(false); setResult(null); setError(null); setStatus('cleaning'); setDetail('Preparing a metadata-only copy. Media and document content stay untouched.');
    const id = runId.current;
    const type = before.file.detectedType;
    try {
      let cleaned: MetadataWorkerCleanup;
      if (EXIF_TYPES.includes(type)) {
        const client = new ExifToolWorkerClient(); exif.current = client;
        cleaned = await client.cleanMetadata(file, IMAGE_TYPES.includes(type) ? 'image' : 'quicktime', () => setDetail('ExifTool is removing writable metadata locally.'));
        client.terminate(); exif.current = null;
      } else if (type === 'pdf') {
        const worker = new MetadataRemovalWorkerClient(); removal.current = worker;
        cleaned = await worker.clean(file, type, () => setDetail('qpdf is removing top-level Info and XMP dictionaries while rewriting the entire PDF.'));
        removal.current = null;
      } else {
        const worker = new MetadataRemovalWorkerClient(); removal.current = worker;
        cleaned = await worker.clean(file, type, (stage) => setDetail(stage === 'loading-engine' ? 'Loading the format-specific cleanup engine.' : stage === 'rewriting-file' ? 'Rewriting metadata without re-encoding the content.' : 'Checking the cleaned container.'));
        removal.current = null;
      }
      if (runId.current !== id) return;
      const name = cleanName(file.name, type);
      const blob = new Blob([cleaned.data], { type: cleaned.mime });
      const output = new File([blob], name, { type: cleaned.mime, lastModified: Date.now() });
      setStatus('verifying'); setDetail('The cleaned copy is being parsed again at the same scan depth.');
      const verified = await scanReport(output, [type], setDetail, (current) => { task.current = current; }, (current) => { exif.current = current; });
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
      setStatus('complete'); setDetail(cleanupStatus === 'verified' ? 'Verified: removable metadata was not found in the output scan.' : cleanupStatus === 'verified-residual' ? 'Verified with residual metadata. Review what remains before sharing.' : cleanupStatus === 'blocked' ? 'The output failed an integrity check and download is blocked.' : 'The copy was created, but full verification did not finish.');
    } catch (caught) {
      if (runId.current !== id) return;
      if (caught instanceof MetadataRemovalCanceledError || caught instanceof ExifToolCancellationError) { setStatus('canceled'); setDetail('Cleanup was canceled. The source file is unchanged.'); return; }
      setStatus('failed'); setError(caught instanceof Error ? caught.message : 'Metadata cleanup failed safely.'); setDetail('No downloadable copy was accepted.');
    }
  };

  const receipt = result && before ? createCleanupReceipt(result, { name: before.file.safeName, type: before.file.detectedType, size: before.file.size }) : null;

  return <section className={`workbench removal-workbench removal-${scope}`} aria-busy={busy}>
    <div className="workbench-topline"><div className="local-proof"><Icon icon={checkIcon} width="18" /><span>Your file stays on this device.</span></div><span className="status-line" role="status" aria-live="polite"><i className={busy ? 'is-live' : ''}></i>{statusLabel(status)}</span></div>
    <input ref={input} className="sr-only" type="file" tabIndex={-1} aria-hidden="true" accept={accept} onChange={(event) => { const selected = event.target.files?.item(0); if (selected) void inspect(selected); }} />
    {!before ? <div ref={dropzone} className={`removal-dropzone ${dragging ? 'is-dragging' : ''}`} role="button" tabIndex={busy ? -1 : 0} aria-label={`Choose ${scope === 'image' ? 'an image' : 'a file'}`} aria-describedby={`removal-drop-help-${scope}`} aria-disabled={busy} onClick={picker} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); picker(); } }} onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); const selected = event.dataTransfer.files.item(0); if (selected && !busy) void inspect(selected); }}>
      <div className="removal-drop-icon"><Icon icon={uploadIcon} width="38" /></div><div><span className="eyebrow">ONE FILE · METADATA ONLY</span><h2>{scope === 'image' ? 'Drop an image here' : 'Drop a file here'}</h2><p id={`removal-drop-help-${scope}`}>{formats} · {scope === 'image' ? 'up to 50 MB' : 'up to 100 MB'}</p><span className="button button-primary removal-pick-label">Choose a {scope === 'image' ? 'image' : 'file'}</span></div><aside><strong>No re-encoding.</strong><span>Content stays intact.</span><small>Nothing is uploaded.</small></aside>
    </div> : null}
    {error ? <div className="removal-error" role="alert"><Icon icon={warningIcon} width="20" /><div><strong>Could not finish this file</strong><p>{error}</p></div><button type="button" onClick={clear}>Choose another file</button></div> : null}
    {before ? <div className="removal-report">
      <header className="removal-file-head"><div><span className="eyebrow">Cleanup desk</span><h2>{before.file.name}</h2><p>{detail}</p></div><div className="removal-file-actions"><button className="button button-secondary" type="button" onClick={picker} disabled={busy}><Icon icon={replaceIcon} width="16" />Replace</button><button className="button button-ghost" type="button" onClick={clear} disabled={busy}><Icon icon={trashIcon} width="16" />Clear</button></div></header>
      <div className="removal-facts"><div><span>Format</span><strong>{before.file.detectedType.toUpperCase()}</strong></div><div><span>Source size</span><strong>{formatBytes(before.file.size)}</strong></div><div><span>Fields read</span><strong>{baseline?.read ?? 0}</strong></div><div><span>Eligible</span><strong>{baseline?.eligible ?? 0}</strong></div><div><span>Engine</span><strong>{baseline?.engine ?? '—'}</strong></div></div>
      {signaturePrompt ? <section className="signature-warning" role="alert"><Icon icon={warningIcon} width="24" /><div><h3>This file carries a signature.</h3><p>Changing metadata invalidates C2PA or document signatures. The original remains untouched, but the new copy cannot keep the old proof.</p><div className="button-row"><button className="button button-primary" type="button" onClick={() => void clean(true)}>I understand — clean a copy</button><button className="button button-ghost" type="button" onClick={() => setSignaturePrompt(false)}>Cancel</button></div></div></section> : null}
      {!result ? <section className="removal-action"><div><span className="eyebrow">Content-preserving policy</span><h3>Remove labels. Keep the actual file.</h3><p>Descriptive, identity, location, software, date, and custom fields are targeted. Cover art, chapters, subtitles, attachments, comments, revisions, ICC color, orientation, and media tracks stay.</p></div><button className="button button-primary" type="button" disabled={busy} onClick={() => void clean()}><Icon icon={eraseIcon} width="18" />{busy ? statusLabel(status) : 'Create and verify clean copy'}</button></section> : null}
      {busy ? <div className="removal-progress"><i></i><span>{detail}</span><button type="button" onClick={() => { stop(); setStatus('canceled'); setDetail('Canceled. The source file is unchanged.'); }}>Cancel</button></div> : null}
      {result ? <section className={`removal-result is-${result.status}`}>
        <header><div><span className="eyebrow">Verification result</span><h3>{result.status === 'verified' ? 'Verified' : result.status === 'verified-residual' ? 'Verified with residual metadata' : result.status === 'blocked' ? 'Output blocked' : 'Verification incomplete'}</h3><p>{formatBytes(result.beforeSize)} → {formatBytes(result.afterSize)} · {result.engine}</p></div><div className="removal-counts"><b><strong>{result.removed.length}</strong>Removed</b><b><strong>{result.preserved.length}</strong>Preserved</b><b><strong>{result.residual.length}</strong>Residual</b></div></header>
        <div className="removal-checks">{result.checks.map((check) => <article key={check.id} className={`is-${check.status}`}><i></i><div><strong>{check.label}</strong><span>{check.message}</span></div></article>)}</div>
        {result.warnings.length ? <div className="removal-warnings">{result.warnings.map((warning) => <p key={warning}><Icon icon={warningIcon} width="15" />{warning}</p>)}</div> : null}
        <div className="removal-diff-grid"><details open><summary>Removed fields <b>{result.removed.length}</b></summary>{result.removed.length ? result.removed.slice(0, 120).map((field) => <div key={`${field.id}-${field.path}`}><strong>{field.label}</strong><code>{field.path}</code><span>{field.displayValue}</span></div>) : <p>No eligible fields were present in the source report.</p>}</details><details><summary>Intentionally preserved <b>{result.preserved.length}</b></summary>{result.preserved.map((field) => <div key={`${field.id}-${field.path}`}><strong>{field.label}</strong><code>{field.path}</code><span>{field.reason}</span></div>)}</details><details open={result.residual.length > 0}><summary>Residual metadata <b>{result.residual.length}</b></summary>{result.residual.length ? result.residual.map((field) => <div key={`${field.id}-${field.path}`}><strong>{field.label}</strong><code>{field.path}</code><span>{field.displayValue}</span></div>) : <p>No eligible residual fields were found.</p>}</details></div>
        <footer><button className="button button-primary" type="button" disabled={result.status === 'blocked'} onClick={() => downloadBlob(result.blob, result.fileName)}><Icon icon={downloadIcon} width="17" />Download clean copy</button><button className="button button-secondary" type="button" onClick={() => receipt && downloadBlob(new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' }), `${sanitizeFilename(result.fileName, '')}.metadata-cleanup.json`)}><Icon icon={receiptIcon} width="17" />Download receipt</button><button className="button button-ghost" type="button" onClick={() => { setResult(null); setStatus('ready'); setDetail('The original report is ready for another local cleanup.'); }}>Start over</button></footer>
      </section> : null}
    </div> : null}
  </section>;
}
