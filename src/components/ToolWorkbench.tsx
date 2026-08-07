import { Icon } from '@iconify/react';
import checkIcon from '@iconify-icons/lucide/shield-check';
import rotateIcon from '@iconify-icons/lucide/rotate-ccw';
import sparklesIcon from '@iconify-icons/lucide/sparkles';
import { useEffect, useRef, useState } from 'react';
import { removeImageMetadata, type RemovalResult } from '../lib/image/remove-metadata';
import { cleanImageFilename } from '../lib/image/privacy-cleanup';
import type { DetectedFileType, ParsedMetadata } from '../lib/metadata/types';
import { countMetadataValues, sanitizeFilename } from '../lib/metadata/utils';
import type { PrivacyReport } from '../lib/privacy/types';
import { runWorkerTask, type WorkerTask } from '../lib/worker-client';
import type { WorkerResult } from '../workers/protocol';
import { DownloadJsonButton } from './DownloadJsonButton';
import { FileDropzone } from './FileDropzone';
import { FileSummary } from './FileSummary';
import { JsonViewer } from './JsonViewer';
import { MetadataSections } from './MetadataSections';
import { PrivacyRiskList } from './PrivacyRiskList';
import { PrivacyScore } from './PrivacyScore';

export type ToolMode = 'metadata' | 'privacy' | 'remover';

interface Props {
  mode: ToolMode;
  formats: string;
  accept: string;
  allowedTypes?: DetectedFileType[];
}

interface PrivacyWorkerResult { metadata: ParsedMetadata; report: PrivacyReport }

export default function ToolWorkbench({ mode, formats, accept, allowedTypes }: Props) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Waiting for a file');
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<ParsedMetadata | null>(null);
  const [privacy, setPrivacy] = useState<PrivacyReport | null>(null);
  const [quality, setQuality] = useState(0.92);
  const [removal, setRemoval] = useState<RemovalResult | null>(null);
  const [cleanMetadata, setCleanMetadata] = useState<ParsedMetadata | null>(null);
  const task = useRef<WorkerTask<WorkerResult> | null>(null);
  const cleanUrl = useRef<string | null>(null);
  const chooseButton = useRef<HTMLDivElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);

  const clearCleanUrl = () => { if (cleanUrl.current) URL.revokeObjectURL(cleanUrl.current); cleanUrl.current = null; };
  const reset = (returnFocus = true) => {
    task.current?.cancel(); clearCleanUrl(); setBusy(false); setStatus('Waiting for a file'); setError(null); setSource(null);
    setMetadata(null); setPrivacy(null); setRemoval(null); setCleanMetadata(null);
    if (returnFocus) window.requestAnimationFrame(() => chooseButton.current?.focus());
  };

  useEffect(() => () => { task.current?.cancel(); clearCleanUrl(); }, []);

  const inspect = async (file: File) => {
    reset(false); setSource(file); setBusy(true); setStatus('Inspecting file bytes locally…');
    try {
      const type = mode === 'privacy' ? 'check-privacy' : 'parse-metadata';
      const current = runWorkerTask<WorkerResult>({ type, file, ...(type === 'parse-metadata' ? { allowedTypes } : {}) } as never);
      task.current = current;
      const result = await current.promise;
      if (mode === 'privacy') { const value = result as unknown as PrivacyWorkerResult; setMetadata(value.metadata); setPrivacy(value.report); }
      else setMetadata(result as ParsedMetadata);
      setStatus(mode === 'remover' ? 'Scan complete — ready to remove metadata' : 'Local inspection complete');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The file could not be processed.'); setStatus('Stopped safely');
    } finally { setBusy(false); task.current = null; }
  };

  const remove = async () => {
    if (!source) return;
    setBusy(true); setError(null); setStatus('Re-encoding pixels in your browser…'); clearCleanUrl();
    try {
      const result = await removeImageMetadata(source, quality);
      setRemoval(result);
      const cleanFile = new File([result.blob], cleanImageFilename(source.name, result.mime), { type: result.mime });
      setStatus('Checking the cleaned copy…');
      const { parseFile } = await import('../lib/metadata/parse-file');
      const verified = await parseFile(cleanFile, ['jpeg', 'png', 'webp']);
      setCleanMetadata(verified); setStatus('Metadata removed and checked');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'The image could not be re-encoded.'); setStatus('Stopped safely'); }
    finally { setBusy(false); }
  };

  const downloadClean = () => {
    if (!removal || !source) return;
    clearCleanUrl();
    const url = URL.createObjectURL(removal.blob); cleanUrl.current = url;
    const anchor = document.createElement('a'); anchor.href = url;
    anchor.download = cleanImageFilename(source.name, removal.mime); anchor.click();
    window.setTimeout(clearCleanUrl, 1_000);
  };

  const jsonData = privacy && metadata ? { file: metadata.file, privacyReport: privacy, metadata: metadata.normalized }
    : metadata ? { file: metadata.file, category: metadata.category, metadata: metadata.normalized, rawMetadata: metadata.raw, warnings: metadata.warnings } : null;

  const filename = source ? `${sanitizeFilename(source.name)}-${mode}` : `metadata-${mode}`;
  const hasResult = Boolean(metadata);

  useEffect(() => {
    if (!hasResult) return;
    window.requestAnimationFrame(() => {
      const heading = resultHeading.current;
      if (!heading) return;
      heading.focus({ preventScroll: true });
      const bounds = heading.getBoundingClientRect();
      if (bounds.top < 74 || bounds.bottom > window.innerHeight) heading.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  }, [hasResult]);

  return (
    <section className="workbench" aria-busy={busy}>
      <div className="workbench-topline">
        <div className="local-proof"><Icon icon={checkIcon} width="18" aria-hidden="true" /><span>Your files never leave your device.</span></div>
        <span className="status-line"><i className={busy ? 'pulse' : ''} />{status}</span>
      </div>

      {!hasResult && <FileDropzone ref={chooseButton} accept={accept} formats={formats} onFile={inspect} disabled={busy} />}

      {busy && <div className="processing-state" role="status"><span /><div><strong>Working in this tab</strong><p>Large files can take a moment. You can close the page to cancel immediately.</p></div></div>}
      {error && <div className="error-state" role="alert"><strong>That file stopped us at the door.</strong><p>{error}</p><button className="button button-secondary" type="button" onClick={() => reset()}>Choose another file</button></div>}

      {hasResult && <div className="result-shell">
        <div className="result-actions">
          <div><span className="eyebrow">Local result</span><h2 ref={resultHeading} tabIndex={-1}>{mode === 'privacy' ? 'Privacy report' : mode === 'remover' ? 'Metadata removal' : 'Metadata found'}</h2></div>
          <div className="button-row">{jsonData && <DownloadJsonButton data={jsonData} filename={filename} />}<button type="button" className="button button-ghost" onClick={() => reset()}><Icon icon={rotateIcon} width="16" />New file</button></div>
        </div>
        {metadata && <FileSummary file={metadata.file} />}
        {metadata?.warnings.length ? <div className="warning-list">{metadata.warnings.map((warning) => <p key={warning.code}><strong>{warning.code}</strong> {warning.message}</p>)}</div> : null}

        {mode === 'metadata' && metadata && <><MetadataSections sections={metadata.sections} /><JsonViewer data={metadata.raw} /></>}
        {mode === 'privacy' && privacy && metadata && <><PrivacyScore report={privacy} /><PrivacyRiskList risks={privacy.risks} /><p className="notice">{privacy.disclaimer}</p><div className="button-row"><a className="button button-primary" href="/metadata-remover/">Remove this kind of metadata</a></div><JsonViewer data={metadata.raw} title="Complete metadata" /></>}
        {mode === 'remover' && metadata && <div className="removal-flow">
          <div className="before-after"><div><span>Before</span><strong>{countMetadataValues(metadata.normalized)} fields</strong></div><div><span>After</span><strong>{cleanMetadata ? `${countMetadataValues(cleanMetadata.normalized)} fields` : 'Not cleaned yet'}</strong></div></div>
          {!removal && <div className="removal-controls"><label><span>Output quality</span><select value={quality} onChange={(event) => setQuality(Number(event.target.value))} disabled={metadata.file.detectedType === 'png'}><option value="0.8">80%</option><option value="0.9">90%</option><option value="0.92">92% — default</option><option value="0.95">95%</option></select></label><button className="button button-primary" type="button" onClick={remove} disabled={busy}><Icon icon={sparklesIcon} width="17" />Remove all removable metadata</button></div>}
          {removal && <div className="removal-success"><strong>Clean copy created and rescanned.</strong><p>{(removal.beforeSize / 1024).toFixed(1)} KB → {(removal.afterSize / 1024).toFixed(1)} KB · {removal.mime} · {removal.mime === 'image/png' ? 'lossless' : `${Math.round(removal.quality * 100)}% quality`}</p><div className="button-row"><button className="button button-primary" type="button" onClick={downloadClean}>Download cleaned image</button><button className="button button-secondary" type="button" onClick={() => cleanMetadata && setStatus(`Verified again: ${countMetadataValues(cleanMetadata.normalized)} metadata values remain.`)}>Verify again</button></div></div>}
          <p className="notice">Re-encoding can change file size, remove color profiles, and slightly alter JPEG or WebP quality. Animated images are not supported. Removing metadata does not hide faces, text, license plates, or visible locations.</p>
        </div>}
      </div>}
    </section>
  );
}
