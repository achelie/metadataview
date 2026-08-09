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

const ACCEPT = 'image/jpeg,image/png,image/webp';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

function errorMessage(caught: unknown): string {
  return caught instanceof Error ? caught.message : 'The local task could not be completed.';
}

export default function PrivacyChecker() {
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
  const [status, setStatus] = useState('Waiting for a JPEG, PNG, or WebP');
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
    setStatus('Waiting for a JPEG, PNG, or WebP');
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
    setStatus('Scanning every metadata field locally');
    try {
      const inspection = await exifClient.current!.inspectPrivacy(file, parsed, previous, IMAGE_FULL_SCAN_MODE, setDeepStage, IMAGE_FULL_SCAN_TIMEOUT_MS);
      if (request.current !== current) return;
      setReport(inspection.report);
      setStatus(`Full scan complete · ${inspection.report.risks.length} supported risks`);
    } catch (caught) {
      if (request.current !== current) return;
      const message = caught instanceof ExifToolCancellationError ? 'Canceled by user.' : errorMessage(caught);
      setReport((value) => value ? recordPrivacyScanFailure(value, IMAGE_FULL_SCAN_MODE, message) : value);
      setStatus('Full scan incomplete · the browser-only result remains usable');
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
    setNotice(selected.length > 1 ? `You chose ${selected.length} files. This checker reads one at a time, so only ${file.name} was checked.` : null);

    if (file.size > IMAGE_LIMITS.fileBytes) {
      setQuickBusy(false);
      setStatus('Stopped safely');
      setError({ code: 'FILE_TOO_LARGE', message: 'That image is over the 50 MB local inspection limit.' });
      return;
    }

    setQuickBusy(true);
    setStatus('Reading image structure in a local Worker');
    try {
      const quick = await quickClient.current!.checkPrivacy(file);
      if (request.current !== current) return;
      setMetadata(quick.metadata);
      setReport(quick.report);
      if (quick.metadata.file.animated || quick.metadata.file.width > IMAGE_LIMITS.canvasSide || quick.metadata.file.height > IMAGE_LIMITS.canvasSide || quick.metadata.file.width * quick.metadata.file.height > IMAGE_LIMITS.canvasPixels) setCleanupMode('preserve-encoding');
      setQuickBusy(false);
      setStatus('Initial result ready · starting the full image scan');
      void runFullScan(file, quick.metadata, quick.report, current);
    } catch (caught) {
      if (request.current !== current || (caught instanceof MetadataError && caught.code === 'PARSE_CANCELLED')) return;
      setError({ code: caught instanceof MetadataError ? caught.code : 'UNKNOWN_PARSE_ERROR', message: errorMessage(caught) });
      setStatus('Stopped safely');
      setQuickBusy(false);
    }
  };

  const runCleanup = async () => {
    if (!source || !metadata || !report || cleanupPending) return;
    const current = request.current;
    setCleanupPending(true);
    setCleanupResult(null);
    setCleanupError(null);
    setCleanupStage(cleanupMode === 'privacy-first' ? 'Re-encoding pixels' : 'Loading engine');
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
    <div className="workbench-topline"><div className="local-proof"><Icon icon={checkIcon} width="18" /><span>Your files never leave your device.</span></div><span className="status-line" aria-live="polite"><i className={quickBusy || deepPending || cleanupPending ? 'pulse' : ''} />{status}</span></div>
    <input ref={picker} className="sr-only" type="file" accept={ACCEPT} multiple tabIndex={-1} aria-hidden="true" onChange={(event) => { if (event.currentTarget.files) void inspect(event.currentTarget.files); }} />

    {!selection && <div ref={chooseButton} className={`privacy-dropzone ${dragging ? 'is-dragging' : ''}`} role="button" tabIndex={0} aria-label="Choose an image" aria-describedby="privacy-drop-help" onClick={openPicker} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPicker(); } }} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); void inspect(event.dataTransfer.files); }}>
      <span className="privacy-drop-icon" aria-hidden="true"><Icon icon={uploadIcon} width="34" /></span><div className="privacy-drop-copy"><span className="eyebrow">Before you post it</span><strong>Drop an image here</strong><p id="privacy-drop-help">JPEG, PNG, or WebP · up to 50 MB</p><span className="button button-primary privacy-pick-label" aria-hidden="true">Choose an image</span></div><p className="privacy-check-scope">Checks GPS, names, device IDs, editing history, thumbnails, and nested image records.</p><small>The initial result appears fast, then one automatic full scan finishes the job.</small>
    </div>}

    {quickBusy && <div className="privacy-processing" role="status"><span className="privacy-processing-mark"><Icon icon={imageIcon} width="26" /></span><div><strong>Reading the image structure</strong><p>The first usable result appears before the automatic full scan finishes.</p></div><button className="button button-secondary" type="button" onClick={clearState}><Icon icon={cancelIcon} width="16" />Cancel</button></div>}
    {notice && <p className="image-notice" role="status">{notice}</p>}
    {error && <div className="image-error" role="alert"><Icon icon={alertIcon} width="26" /><div><span>{error.code}</span><strong>We stopped without keeping a report.</strong><p>{error.message}</p><button className="button button-secondary" type="button" onClick={clearState}>Choose another image</button></div></div>}

    {selection && !quickBusy && <div className="privacy-result-actions"><div><span className="eyebrow">Local privacy receipt</span><h2 ref={resultHeading} tabIndex={-1}>{report ? `${report.file.name} privacy report` : 'No report was created'}</h2></div><div className="button-row"><button className="button button-secondary" type="button" onClick={() => { if (picker.current) { picker.current.value = ''; picker.current.click(); } }}><Icon icon={rotateIcon} width="16" />Replace image</button><button className="button button-ghost" type="button" onClick={clearState}>Clear</button></div></div>}

    {report && metadata && source && <div className="privacy-result-shell">
      <section className="privacy-file-overview" aria-label="Checked image summary">{preview && <figure><img src={preview} alt="Local preview of the selected image" /><figcaption>Local preview · never uploaded</figcaption></figure>}<div className="privacy-file-strip"><div><span>File</span><strong title={metadata.file.name}>{metadata.file.name}</strong></div><div><span>Actual format</span><strong>{metadata.file.actualFormat.toUpperCase()}</strong></div><div><span>Size</span><strong>{formatBytes(metadata.file.size)}</strong></div><div><span>Dimensions</span><strong>{metadata.file.width} × {metadata.file.height}</strong></div><div><span>Animation</span><strong>{metadata.file.animated ? 'Animated' : 'Static'}</strong></div><div><span>Browser fields</span><strong>{metadata.file.metadataFieldCount}</strong></div></div></section>
      {[...report.warnings, ...report.scanWarnings].length > 0 && <div className="warning-list privacy-rule-warnings">{[...new Set([...report.warnings, ...report.scanWarnings])].map((warning, index) => <p key={`${warning}-${index}`}><strong>SCAN_NOTE</strong> {warning}</p>)}</div>}
      <PrivacyScanStatus report={report} pending={deepPending} onCancel={() => exifClient.current?.cancel()} onRetry={() => void runFullScan(source, metadata, report, request.current)} />
      <PrivacyScore report={report} pending={deepPending} />
      <PrivacySummary report={report} />
      <PrivacyCleanupPanel report={report} metadata={metadata} mode={cleanupMode} pending={cleanupPending} baselinePending={deepPending} stage={cleanupStage} error={cleanupError} result={cleanupResult} onMode={setCleanupMode} onClean={() => void runCleanup()} onDownload={downloadClean} onReceipt={downloadReceipt} />
      <PrivacyRiskList report={report} />
      <DetectedData report={report} />
      <PrivacyReportActions report={report} deepPending={deepPending} />
      <aside className="privacy-honest-limit"><Icon icon={alertIcon} width="22" /><div><strong>This tool checks embedded metadata only. It does not analyze visible image content.</strong><p>Faces, text, addresses, license plates, reflections, screens, uniforms, and landmarks in the image pixels can still reveal personal information.</p></div></aside><p className="privacy-disclaimer">{report.disclaimer}</p>
    </div>}
  </section>;
}
