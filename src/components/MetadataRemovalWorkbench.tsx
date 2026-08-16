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
    const inspection = await client.inspect(file, mode, (stage) => onStatus(stage === 'loading' ? (zh ? '正在加载本地元数据引擎' : 'Loading the local metadata engine') : stage === 'extracting' ? (zh ? '正在读取所有可用元数据字段' : 'Reading every available metadata field') : (zh ? '正在生成安全报告' : 'Building the safe report')), image ? IMAGE_FULL_SCAN_TIMEOUT_MS : STANDARD_SCAN_TIMEOUT_MS);
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
  const chooseLabel = scope === 'image' ? (zh ? '选择图片' : 'Choose an image') : (zh ? '选择文件' : 'Choose a file');
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
  const [detail, setDetail] = useState(zh ? '不会上传任何内容。' : 'Nothing is uploaded.');
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
    stop(); setFile(null); setBefore(null); setResult(null); setError(null); setStatus('idle'); setDetail(zh ? '不会上传任何内容。' : 'Nothing is uploaded.'); setBaselineComplete(false); setSignaturePrompt(false);
    if (input.current) input.current.value = '';
    window.requestAnimationFrame(() => dropzone.current?.focus());
  };

  useEffect(() => () => stop(), []);

  const inspect = async (selected: File) => {
    stop();
    const id = runId.current + 1; runId.current = id;
    setFile(selected); setBefore(null); setResult(null); setError(null); setStatus('inspecting'); setDetail(zh ? '清理引擎启动前，先检查真实文件格式。' : 'Checking the real format before a cleanup engine starts.'); setBaselineComplete(false); setSignaturePrompt(false);
    const typeHint = selected.name.split('.').pop()?.toLowerCase();
    const imageHint = selected.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'tif', 'tiff', 'gif'].includes(typeHint ?? '');
    const limit = imageHint ? IMAGE_LIMIT : UNIVERSAL_LIMIT;
    if (selected.size > limit) { setStatus('failed'); setError(zh ? `${imageHint ? '图片' : '文件'}上限为 ${Math.round(limit / 1024 / 1024)} MB。` : `${imageHint ? 'Images' : 'Files'} are limited to ${Math.round(limit / 1024 / 1024)} MB.`); return; }
    try {
      const scanned = await scanReport(selected, allowedTypes, locale, setDetail, (current) => { task.current = current; }, (current) => { exif.current = current; });
      if (runId.current !== id) return;
      setBefore(scanned.report); setBaselineComplete(scanned.complete); setStatus('ready');
      setDetail(scanned.complete ? (zh ? `发现 ${createRemovalBaseline(scanned.report, likelyCleanupEngine(scanned.report.file.detectedType)).eligible} 个可能可清除的字段，原文件没有改变。` : `Found ${createRemovalBaseline(scanned.report, likelyCleanupEngine(scanned.report.file.detectedType)).eligible} removable-looking fields. The source file is unchanged.`) : (zh ? '快速报告已经就绪，但完整元数据扫描未完成；继续清理只能得到“不完整验证”。' : 'The fast report is ready, but the full metadata scan did not finish. Cleanup can continue only as an incomplete verification.'));
    } catch (caught) {
      if (runId.current !== id) return;
      if (caught instanceof ExifToolCancellationError) { setStatus('canceled'); setDetail(zh ? '扫描已取消。' : 'The scan was canceled.'); return; }
      setStatus('failed'); setError(caught instanceof Error ? caught.message : (zh ? '无法安全检查这个文件。' : 'The file could not be inspected safely.'));
    }
  };

  const picker = () => { if (busy) return; if (input.current) { input.current.value = ''; input.current.click(); } };

  const clean = async (confirmed = false) => {
    if (!file || !before || busy) return;
    if (baseline?.signed && !confirmed) { setSignaturePrompt(true); return; }
    setSignaturePrompt(false); setResult(null); setError(null); setStatus('cleaning'); setDetail(zh ? '正在准备只清理元数据的副本，媒体和文档内容不会动。' : 'Preparing a metadata-only copy. Media and document content stay untouched.');
    const id = runId.current;
    const type = before.file.detectedType;
    try {
      let cleaned: MetadataWorkerCleanup;
      if (EXIF_TYPES.includes(type)) {
        const client = new ExifToolWorkerClient(); exif.current = client;
        cleaned = await client.cleanMetadata(file, IMAGE_TYPES.includes(type) ? 'image' : 'quicktime', () => setDetail(zh ? 'ExifTool 正在本地清除可写元数据。' : 'ExifTool is removing writable metadata locally.'));
        client.terminate(); exif.current = null;
      } else if (type === 'pdf') {
        const worker = new MetadataRemovalWorkerClient(); removal.current = worker;
        cleaned = await worker.clean(file, type, () => setDetail(zh ? 'qpdf 正在完整重写 PDF，并清除顶层 Info 与 XMP 字典。' : 'qpdf is removing top-level Info and XMP dictionaries while rewriting the entire PDF.'));
        removal.current = null;
      } else {
        const worker = new MetadataRemovalWorkerClient(); removal.current = worker;
        cleaned = await worker.clean(file, type, (stage) => setDetail(stage === 'loading-engine' ? (zh ? '正在加载格式专用清理引擎。' : 'Loading the format-specific cleanup engine.') : stage === 'rewriting-file' ? (zh ? '正在重写元数据，不重新编码内容。' : 'Rewriting metadata without re-encoding the content.') : (zh ? '正在检查清理后的容器。' : 'Checking the cleaned container.')));
        removal.current = null;
      }
      if (runId.current !== id) return;
      const name = cleanName(file.name, type);
      const blob = new Blob([cleaned.data], { type: cleaned.mime });
      const output = new File([blob], name, { type: cleaned.mime, lastModified: Date.now() });
      setStatus('verifying'); setDetail(zh ? '正在用相同扫描深度重新解析清理副本。' : 'The cleaned copy is being parsed again at the same scan depth.');
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
      setStatus('complete'); setDetail(zh ? (cleanupStatus === 'verified' ? '验证通过：输出扫描未发现可清除元数据。' : cleanupStatus === 'verified-residual' ? '验证通过，但仍有残留元数据；分享前请检查剩余内容。' : cleanupStatus === 'blocked' ? '输出未通过完整性检查，下载已阻止。' : '副本已生成，但完整验证没有完成。') : cleanupStatus === 'verified' ? 'Verified: removable metadata was not found in the output scan.' : cleanupStatus === 'verified-residual' ? 'Verified with residual metadata. Review what remains before sharing.' : cleanupStatus === 'blocked' ? 'The output failed an integrity check and download is blocked.' : 'The copy was created, but full verification did not finish.');
    } catch (caught) {
      if (runId.current !== id) return;
      if (caught instanceof MetadataRemovalCanceledError || caught instanceof ExifToolCancellationError) { setStatus('canceled'); setDetail(zh ? '清理已取消，原文件没有改变。' : 'Cleanup was canceled. The source file is unchanged.'); return; }
      setStatus('failed'); setError(caught instanceof Error ? caught.message : (zh ? '元数据清理已安全失败。' : 'Metadata cleanup failed safely.')); setDetail(zh ? '没有接受任何可下载副本。' : 'No downloadable copy was accepted.');
    }
  };

  const receipt = result && before ? createCleanupReceipt(result, { name: before.file.safeName, type: before.file.detectedType, size: before.file.size }) : null;

  return <section className={`workbench removal-workbench removal-${scope}`} aria-busy={busy}>
    <div className="workbench-topline"><div className="local-proof"><Icon icon={checkIcon} width="18" /><span>{zh ? '文件只留在这台设备上。' : 'Your file stays on this device.'}</span></div><span className="status-line" role="status" aria-live="polite"><i className={busy ? 'is-live' : ''}></i>{statusLabel(status, locale)}</span></div>
    <input ref={input} className="sr-only" type="file" tabIndex={-1} aria-hidden="true" accept={accept} onChange={(event) => { const selected = event.target.files?.item(0); if (selected) void inspect(selected); }} />
    {!before ? <div ref={dropzone} className={`removal-dropzone ${dragging ? 'is-dragging' : ''}`} role="button" tabIndex={busy ? -1 : 0} aria-label={chooseLabel} aria-describedby={`removal-drop-help-${scope}`} aria-disabled={busy} onClick={picker} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); picker(); } }} onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); const selected = event.dataTransfer.files.item(0); if (selected && !busy) void inspect(selected); }}>
      <div className="removal-drop-icon"><Icon icon={uploadIcon} width="38" /></div><div><span className="eyebrow">{zh ? '一个文件 · 只清元数据' : 'ONE FILE · METADATA ONLY'}</span><h2>{zh ? `把${scope === 'image' ? '图片' : '文件'}拖到这里` : scope === 'image' ? 'Drop an image here' : 'Drop a file here'}</h2><p id={`removal-drop-help-${scope}`}>{formats} · {scope === 'image' ? (zh ? '最大 50 MB' : 'up to 50 MB') : (zh ? '最大 100 MB' : 'up to 100 MB')}</p><span className="button button-primary removal-pick-label">{chooseLabel}</span></div><aside><strong>{zh ? '不重新编码。' : 'No re-encoding.'}</strong><span>{zh ? '内容保持完整。' : 'Content stays intact.'}</span><small>{zh ? '不会上传。' : 'Nothing is uploaded.'}</small></aside>
    </div> : null}
    {error ? <div className="removal-error" role="alert"><Icon icon={warningIcon} width="20" /><div><strong>{zh ? '这个文件没能处理完' : 'Could not finish this file'}</strong><p>{error}</p></div><button type="button" onClick={clear}>{zh ? '换一个文件' : 'Choose another file'}</button></div> : null}
    {before ? <div className="removal-report">
      <header className="removal-file-head"><div><span className="eyebrow">{zh ? '清理台' : 'Cleanup desk'}</span><h2>{before.file.name}</h2><p>{detail}</p></div><div className="removal-file-actions"><button className="button button-secondary" type="button" onClick={picker} disabled={busy}><Icon icon={replaceIcon} width="16" />{zh ? '替换' : 'Replace'}</button><button className="button button-ghost" type="button" onClick={clear} disabled={busy}><Icon icon={trashIcon} width="16" />{zh ? '清除' : 'Clear'}</button></div></header>
      <div className="removal-facts"><div><span>{zh ? '格式' : 'Format'}</span><strong>{before.file.detectedType.toUpperCase()}</strong></div><div><span>{zh ? '原文件大小' : 'Source size'}</span><strong>{formatBytes(before.file.size)}</strong></div><div><span>{zh ? '已读字段' : 'Fields read'}</span><strong>{baseline?.read ?? 0}</strong></div><div><span>{zh ? '可清除' : 'Eligible'}</span><strong>{baseline?.eligible ?? 0}</strong></div><div><span>{zh ? '引擎' : 'Engine'}</span><strong>{baseline?.engine ?? '—'}</strong></div></div>
      {signaturePrompt ? <section className="signature-warning" role="alert"><Icon icon={warningIcon} width="24" /><div><h3>{zh ? '这个文件带有签名。' : 'This file carries a signature.'}</h3><p>{zh ? '修改元数据会让 C2PA 或文档签名失效。原件不会改变，但新副本无法保留旧证明。' : 'Changing metadata invalidates C2PA or document signatures. The original remains untouched, but the new copy cannot keep the old proof.'}</p><div className="button-row"><button className="button button-primary" type="button" onClick={() => void clean(true)}>{zh ? '我明白，生成清理副本' : 'I understand — clean a copy'}</button><button className="button button-ghost" type="button" onClick={() => setSignaturePrompt(false)}>{zh ? '取消' : 'Cancel'}</button></div></div></section> : null}
      {!result ? <section className="removal-action"><div><span className="eyebrow">{zh ? '内容保留策略' : 'Content-preserving policy'}</span><h3>{zh ? '清标签，保留真正的文件。' : 'Remove labels. Keep the actual file.'}</h3><p>{zh ? '目标是描述、身份、位置、软件、日期和自定义字段；封面、章节、字幕、附件、评论、修订、ICC 色彩、方向和媒体轨道会保留。' : 'Descriptive, identity, location, software, date, and custom fields are targeted. Cover art, chapters, subtitles, attachments, comments, revisions, ICC color, orientation, and media tracks stay.'}</p></div><button className="button button-primary" type="button" disabled={busy} onClick={() => void clean()}><Icon icon={eraseIcon} width="18" />{busy ? statusLabel(status, locale) : (zh ? '生成并验证清理副本' : 'Create and verify clean copy')}</button></section> : null}
      {busy ? <div className="removal-progress"><i></i><span>{detail}</span><button type="button" onClick={() => { stop(); setStatus('canceled'); setDetail(zh ? '已取消，原文件没有改变。' : 'Canceled. The source file is unchanged.'); }}>{zh ? '取消' : 'Cancel'}</button></div> : null}
      {result ? <section className={`removal-result is-${result.status}`}>
        <header><div><span className="eyebrow">{zh ? '验证结果' : 'Verification result'}</span><h3>{result.status === 'verified' ? (zh ? '验证通过' : 'Verified') : result.status === 'verified-residual' ? (zh ? '验证通过，但有残留元数据' : 'Verified with residual metadata') : result.status === 'blocked' ? (zh ? '输出已阻止' : 'Output blocked') : (zh ? '验证不完整' : 'Verification incomplete')}</h3><p>{formatBytes(result.beforeSize)} → {formatBytes(result.afterSize)} · {result.engine}</p></div><div className="removal-counts"><b><strong>{result.removed.length}</strong>{zh ? '已清除' : 'Removed'}</b><b><strong>{result.preserved.length}</strong>{zh ? '已保留' : 'Preserved'}</b><b><strong>{result.residual.length}</strong>{zh ? '残留' : 'Residual'}</b></div></header>
        <div className="removal-checks">{result.checks.map((check) => <article key={check.id} className={`is-${check.status}`}><i></i><div><strong>{check.label}</strong><span>{check.message}</span></div></article>)}</div>
        {result.warnings.length ? <div className="removal-warnings">{result.warnings.map((warning) => <p key={warning}><Icon icon={warningIcon} width="15" />{warning}</p>)}</div> : null}
        <div className="removal-diff-grid"><details open><summary>{zh ? '已清除字段' : 'Removed fields'} <b>{result.removed.length}</b></summary>{result.removed.length ? result.removed.slice(0, 120).map((field) => <div key={`${field.id}-${field.path}`}><strong>{field.label}</strong><code>{field.path}</code><span>{field.displayValue}</span></div>) : <p>{zh ? '原报告中没有可清除字段。' : 'No eligible fields were present in the source report.'}</p>}</details><details><summary>{zh ? '有意保留' : 'Intentionally preserved'} <b>{result.preserved.length}</b></summary>{result.preserved.map((field) => <div key={`${field.id}-${field.path}`}><strong>{field.label}</strong><code>{field.path}</code><span>{field.reason}</span></div>)}</details><details open={result.residual.length > 0}><summary>{zh ? '残留元数据' : 'Residual metadata'} <b>{result.residual.length}</b></summary>{result.residual.length ? result.residual.map((field) => <div key={`${field.id}-${field.path}`}><strong>{field.label}</strong><code>{field.path}</code><span>{field.displayValue}</span></div>) : <p>{zh ? '没有发现可清除的残留字段。' : 'No eligible residual fields were found.'}</p>}</details></div>
        <footer><button className="button button-primary" type="button" disabled={result.status === 'blocked'} onClick={() => downloadBlob(result.blob, result.fileName)}><Icon icon={downloadIcon} width="17" />{zh ? '下载清理副本' : 'Download clean copy'}</button><button className="button button-secondary" type="button" onClick={() => receipt && downloadBlob(new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' }), `${sanitizeFilename(result.fileName, '')}.metadata-cleanup.json`)}><Icon icon={receiptIcon} width="17" />{zh ? '下载英文收据' : 'Download receipt'}</button><button className="button button-ghost" type="button" onClick={() => { setResult(null); setStatus('ready'); setDetail(zh ? '原报告已就绪，可以再次本地清理。' : 'The original report is ready for another local cleanup.'); }}>{zh ? '重新开始' : 'Start over'}</button></footer>
      </section> : null}
    </div> : null}
  </section>;
}
