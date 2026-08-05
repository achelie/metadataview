import { Icon } from '@iconify/react';
import checkIcon from '@iconify-icons/lucide/shield-check';
import uploadIcon from '@iconify-icons/lucide/upload-cloud';
import replaceIcon from '@iconify-icons/lucide/replace';
import trashIcon from '@iconify-icons/lucide/trash-2';
import copyIcon from '@iconify-icons/lucide/copy';
import downloadIcon from '@iconify-icons/lucide/download';
import jsonIcon from '@iconify-icons/lucide/file-json-2';
import pdfIcon from '@iconify-icons/lucide/file-text';
import searchIcon from '@iconify-icons/lucide/search';
import warningIcon from '@iconify-icons/lucide/alert-triangle';
import imageIcon from '@iconify-icons/lucide/file-image';
import fileIcon from '@iconify-icons/lucide/file';
import xIcon from '@iconify-icons/lucide/x';
import cpuIcon from '@iconify-icons/lucide/cpu';
import scanIcon from '@iconify-icons/lucide/scan-search';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { ExifToolCancellationError, ExifToolWorkerClient } from '../lib/exiftool-worker-client';
import { IMAGE_LIMITS } from '../lib/metadata/limits';
import { sanitizeFilename } from '../lib/metadata/utils';
import { mergeExifToolInspection, recordExifToolFailure } from '../lib/metadata-report/exiftool-adapter';
import { createSafeReportExport } from '../lib/metadata-report/safe-export';
import type { MetadataInspectionMode, MetadataReport, MetadataReportField, MetadataReportSection } from '../lib/metadata-report/types';
import { runWorkerTask, type WorkerTask } from '../lib/worker-client';
import type { ExifToolProgressStage } from '../workers/exiftool-protocol';

interface Props {
  scope: 'all' | 'image';
  formats: string;
  accept: string;
  allowedTypes: string[];
  placement?: 'home' | 'tool';
}

type ViewMode = 'readable' | 'native';
type ExifToolUiStatus = 'idle' | ExifToolProgressStage | 'complete' | 'failed' | 'canceled';

const UNIVERSAL_LIMIT = 100 * 1024 * 1024;
const DISPLAY_LIMIT = 1_200;
const FIELD_BATCH = 250;

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function linesFor(fields: MetadataReportField[]): string {
  return fields.map((field) => `${field.path}\t${field.displayValue}`).join('\n');
}

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(value); return; }
  const area = document.createElement('textarea');
  area.value = value;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.append(area);
  area.select();
  (Reflect.get(document, 'execCommand') as (command: string) => boolean).call(document, 'copy');
  area.remove();
}

function fileLimit(scope: Props['scope']): number {
  return scope === 'image' ? IMAGE_LIMITS.fileBytes : UNIVERSAL_LIMIT;
}

function formatLimit(bytes: number): string {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

function limitSections(sections: MetadataReportSection[], limit: number): MetadataReportSection[] {
  let remaining = limit;
  const output: MetadataReportSection[] = [];
  for (const section of sections) {
    if (remaining <= 0) break;
    const fields = section.fields.slice(0, remaining);
    if (fields.length) output.push({ ...section, fields });
    remaining -= fields.length;
  }
  return output;
}

function displayScalar(value: unknown): string {
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); }
  catch { return String(value); }
}

function FieldRows({ section, expanded, onExpand, onCopy }: {
  section: MetadataReportSection;
  expanded: Set<string>;
  onExpand: (id: string) => void;
  onCopy: (field: MetadataReportField) => void;
}) {
  return <div className="report-field-list">
    {section.fields.map((field) => {
      const long = field.displayValue.length > DISPLAY_LIMIT;
      const open = expanded.has(field.id);
      const shown = long && !open ? `${field.displayValue.slice(0, DISPLAY_LIMIT)}…` : field.displayValue;
      const numeric = field.numericValue === undefined ? null : displayScalar(field.numericValue);
      const showNumeric = numeric !== null && numeric !== field.displayValue;
      return <article key={field.id} className={field.sensitive ? 'is-sensitive' : undefined} data-field-path={field.path}>
        <div className="report-field-name">
          <div><strong>{field.label}</strong>{field.sensitive ? <mark>Sensitive</mark> : null}</div>
          <small>{field.key}</small>
          {field.binarySummary ? <span className="report-binary-chip">{field.binarySummary.bytes === undefined ? 'Binary payload' : `${field.binarySummary.bytes.toLocaleString('en-US')} B binary`}</span> : null}
        </div>
        <div className="report-field-value">
          <code>{shown}</code>
          {showNumeric ? <small className="report-raw-number">Raw value: {numeric}</small> : null}
          {field.binarySummary ? <small className="report-binary-note">{field.binarySummary.note}</small> : null}
          {long ? <button className="report-text-button" type="button" onClick={() => onExpand(field.id)}>{open ? 'Show less' : `Show all ${field.displayValue.length.toLocaleString('en-US')} characters`}</button> : null}
          {field.alternates?.length ? <details className="report-alternates"><summary>{field.alternates.length} parser {field.alternates.length === 1 ? 'alternate' : 'alternates'}</summary>{field.alternates.map((alternate) => <div key={`${alternate.path}-${alternate.displayValue}`}><b>{alternate.source}</b><code>{alternate.displayValue}</code><small>{alternate.path}</small></div>)}</details> : null}
        </div>
        <div className="report-field-origin">
          <span>{field.source}</span>
          <small>{field.path}</small>
          <div className="report-field-meta"><i>{field.origin}</i>{field.tagId !== undefined ? <i>ID {field.tagId}</i> : null}{field.format ? <i>{field.format}</i> : null}</div>
        </div>
        <button className="report-copy-icon" type="button" aria-label={`Copy ${field.label}`} title={`Copy ${field.label}`} onClick={() => onCopy(field)}><Icon icon={copyIcon} width="16" /></button>
      </article>;
    })}
  </div>;
}

function HeaderHex({ bytes }: { bytes: number[] }) {
  const rows = Array.from({ length: Math.ceil(bytes.length / 16) }, (_, row) => {
    const offset = row * 16;
    const slice = bytes.slice(offset, offset + 16);
    return {
      offset: offset.toString(16).padStart(4, '0'),
      hex: slice.map((byte) => byte.toString(16).padStart(2, '0')).join(' '),
      ascii: slice.map((byte) => byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.').join(''),
    };
  });
  return <div className="report-hex-table" role="table" aria-label="File header hexadecimal dump">
    <div role="row" className="report-hex-head"><span role="columnheader">Offset</span><span role="columnheader">Hex</span><span role="columnheader">ASCII</span></div>
    {rows.map((row) => <div role="row" key={row.offset}><code role="cell">{row.offset}</code><code role="cell">{row.hex}</code><code role="cell">{row.ascii}</code></div>)}
  </div>;
}

function engineMessage(status: ExifToolUiStatus, mode: MetadataInspectionMode): string {
  if (status === 'loading') return 'Loading the ExifTool engine from this site. Nothing from the file leaves this tab.';
  if (status === 'extracting') return mode === 'embedded' ? 'Walking tags and embedded documents locally. This is the slow pass.' : 'Reading every standard tag locally, including unknown and duplicate instances.';
  if (status === 'building') return 'Turning native tags into searchable report rows.';
  if (status === 'complete') return mode === 'embedded' ? 'Standard tags and embedded documents are in the report.' : 'The full standard ExifTool field set is in the report.';
  if (status === 'failed') return 'The fast report is intact. ExifTool can be retried without choosing the file again.';
  if (status === 'canceled') return 'Deep inspection stopped. The fast browser report is still usable.';
  return 'The fast report is ready. The deep engine has not started.';
}

export default function MetadataReportWorkbench({ scope, formats, accept, allowedTypes, placement = 'tool' }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const chooseButton = useRef<HTMLButtonElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const task = useRef<WorkerTask<MetadataReport> | null>(null);
  const exifTool = useRef<ExifToolWorkerClient | null>(null);
  const runId = useRef(0);
  const previewUrl = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [report, setReport] = useState<MetadataReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('Waiting for a file');
  const [view, setView] = useState<ViewMode>('readable');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [source, setSource] = useState('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [openRaw, setOpenRaw] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [renderLimit, setRenderLimit] = useState(FIELD_BATCH);
  const [exifStatus, setExifStatus] = useState<ExifToolUiStatus>('idle');
  const [exifMode, setExifMode] = useState<MetadataInspectionMode>('standard');

  const exifRunning = exifStatus === 'loading' || exifStatus === 'extracting' || exifStatus === 'building';

  const openPicker = () => {
    if (!input.current) return;
    input.current.value = '';
    input.current.click();
  };

  const releasePreview = () => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setPreview(null);
  };

  const showPreview = (selected: File) => {
    releasePreview();
    const url = URL.createObjectURL(selected);
    previewUrl.current = url;
    setPreview(url);
  };

  const clear = () => {
    runId.current += 1;
    task.current?.cancel();
    task.current = null;
    exifTool.current?.terminate();
    exifTool.current = null;
    releasePreview();
    setFile(null); setReport(null); setBusy(false); setError(null); setNotice('Waiting for a file');
    setView('readable'); setQuery(''); setSource('all'); setExpanded(new Set()); setOpenRaw(false);
    setExifStatus('idle'); setExifMode('standard'); setRenderLimit(FIELD_BATCH);
    if (input.current) input.current.value = '';
    window.requestAnimationFrame(() => chooseButton.current?.focus());
  };

  useEffect(() => () => {
    runId.current += 1;
    task.current?.cancel();
    exifTool.current?.terminate();
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
  }, []);

  useEffect(() => setRenderLimit(FIELD_BATCH), [view, deferredQuery, source]);

  useEffect(() => {
    if (!report) return;
    window.requestAnimationFrame(() => {
      const heading = resultHeading.current;
      if (!heading) return;
      heading.focus({ preventScroll: true });
      const bounds = heading.getBoundingClientRect();
      if (bounds.top < 74 || bounds.bottom > window.innerHeight) {
        heading.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
    });
  }, [report?.file.name]);

  const inspectWithExifTool = async (selected: File, currentId: number, baseReport: MetadataReport, mode: MetadataInspectionMode) => {
    const client = exifTool.current ?? new ExifToolWorkerClient();
    exifTool.current = client;
    setExifMode(mode);
    setExifStatus('loading');
    try {
      const inspection = await client.inspect(selected, mode, (stage) => {
        if (runId.current !== currentId) return;
        setExifStatus(stage);
      }, mode === 'embedded' ? 180_000 : 120_000);
      if (runId.current !== currentId) return;
      const merged = mergeExifToolInspection(baseReport, inspection);
      setReport(merged);
      setExifStatus('complete');
    } catch (caught) {
      if (runId.current !== currentId) return;
      if (caught instanceof ExifToolCancellationError) {
        setExifStatus('canceled');
        return;
      }
      const message = caught instanceof Error ? caught.message : 'ExifTool could not inspect this file.';
      setReport((current) => current ? recordExifToolFailure(current, message, mode) : current);
      setExifStatus('failed');
    }
  };

  const inspect = async (selected: File, extraFiles = 0) => {
    const currentId = runId.current + 1;
    runId.current = currentId;
    task.current?.cancel();
    exifTool.current?.terminate();
    exifTool.current = null;
    releasePreview();
    setFile(selected); setReport(null); setError(null); setBusy(true); setView('readable'); setQuery(''); setSource('all'); setExpanded(new Set());
    setExifStatus('idle'); setExifMode('standard'); setRenderLimit(FIELD_BATCH);
    if (selected.type.startsWith('image/')) showPreview(selected);
    const limit = fileLimit(scope);
    if (selected.size > limit) {
      setBusy(false); setError(`This file is ${(selected.size / 1024 / 1024).toFixed(1)} MB. The ${scope === 'image' ? 'image' : 'universal'} viewer stops at ${formatLimit(limit)}.`); setNotice('Stopped before parsing'); return;
    }
    setNotice(extraFiles ? `Inspecting the first file locally; ${extraFiles} extra ${extraFiles === 1 ? 'file was' : 'files were'} ignored` : 'Reading structure and computing two checksums locally');
    try {
      const current = runWorkerTask<MetadataReport>({ type: 'inspect-metadata', file: selected, allowedTypes } as never, 60_000);
      task.current = current;
      const result = await current.promise;
      if (runId.current !== currentId) return;
      setReport(result);
      if (result.category === 'image' && !previewUrl.current) showPreview(selected);
      const ignored = extraFiles ? `; ${extraFiles} extra ${extraFiles === 1 ? 'file was' : 'files were'} ignored` : '';
      setNotice(`Fast report ready · ${result.nativeSections.flatMap((section) => section.fields).length.toLocaleString('en-US')} native fields; ExifTool is running below${ignored}`);
      void inspectWithExifTool(selected, currentId, result, 'standard');
    } catch (caught) {
      if (runId.current !== currentId) return;
      setError(caught instanceof Error ? caught.message : 'The local parser could not read this file.');
      setNotice('Stopped safely');
    } finally {
      if (runId.current === currentId) { setBusy(false); task.current = null; }
    }
  };

  const pickFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const selected = files.item(0);
    if (selected) void inspect(selected, Math.max(0, files.length - 1));
  };

  const baseSections = useMemo(() => report ? (view === 'readable' ? report.readableSections : report.nativeSections) : [], [report, view]);
  const sources = useMemo(() => [...new Set(baseSections.flatMap((section) => section.fields.map((field) => field.source)))].sort(), [baseSections]);
  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    return baseSections.map((section) => ({ ...section, fields: section.fields.filter((field) => {
      if (source !== 'all' && field.source !== source) return false;
      return !needle || field.searchValue.toLowerCase().includes(needle) || `${field.label} ${field.key} ${field.path} ${field.source}`.toLowerCase().includes(needle);
    }) })).filter((section) => section.fields.length);
  }, [baseSections, deferredQuery, source]);
  const matchingFields = useMemo(() => filtered.flatMap((section) => section.fields), [filtered]);
  const renderedSections = useMemo(() => limitSections(filtered, renderLimit), [filtered, renderLimit]);
  const renderedCount = renderedSections.reduce((count, section) => count + section.fields.length, 0);
  const allFields = useMemo(() => report ? [...report.readableSections, ...report.nativeSections].flatMap((section) => section.fields) : [], [report]);
  const sensitiveFields = report?.readableSections.flatMap((section) => section.fields).filter((field) => field.sensitive) ?? [];
  const exifEngine = report?.engines.find((engine) => engine.id === 'exiftool');

  const copied = async (text: string, message: string) => {
    try { await copyText(text); setNotice(message); }
    catch { setNotice('Clipboard access was blocked by this browser'); }
  };

  const downloadJson = (rawOnly = false) => {
    if (!report || exifRunning) return;
    const data = rawOnly ? report.raw : createSafeReportExport(report);
    const suffix = rawOnly ? '-raw-metadata.json' : '-metadata-report.json';
    downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), sanitizeFilename(report.file.name, suffix));
    setNotice(rawOnly ? 'Raw safe JSON downloaded' : 'Complete JSON report downloaded');
  };

  const downloadPdf = async () => {
    if (!report || exportingPdf || exifRunning) return;
    setExportingPdf(true); setNotice('Building the readable PDF in this tab');
    try {
      const { downloadMetadataReportPdf } = await import('../lib/metadata-report/pdf-export');
      await downloadMetadataReportPdf(report, sanitizeFilename(report.file.name, '-metadata-report.pdf'));
      setNotice('Readable PDF report downloaded; JSON remains the complete record');
    } catch { setNotice('The PDF could not be built. The JSON report is still available.'); }
    finally { setExportingPdf(false); }
  };

  const rerunExifTool = (mode: MetadataInspectionMode) => {
    if (!file || !report || exifRunning) return;
    void inspectWithExifTool(file, runId.current, report, mode);
  };

  const stopExifTool = () => {
    exifTool.current?.cancel();
    setExifStatus('canceled');
    setNotice('ExifTool scan canceled; the fast report remains available');
  };

  return <section className={`workbench report-workbench is-${placement}`} aria-busy={busy || exifRunning}>
    <div className="workbench-topline">
      <div className="local-proof"><Icon icon={checkIcon} width="18" aria-hidden="true" /><span>Your file stays on this device.</span></div>
      <span className="status-line" role="status" aria-live="polite"><i className={busy || exifRunning ? 'pulse' : ''} />{notice}</span>
    </div>
    <input ref={input} className="sr-only" type="file" accept={accept} multiple onChange={(event) => pickFiles(event.target.files)} />

    {!file ? <div className={`report-dropzone ${dragging ? 'is-dragging' : ''}`}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); pickFiles(event.dataTransfer.files); }}>
      <span className="report-drop-mark" aria-hidden="true"><Icon icon={uploadIcon} width="33" /></span>
      <div className="report-drop-copy"><span className="eyebrow">One file · processed locally</span><strong>Drop {scope === 'image' ? 'an image' : 'a file'} here</strong><p id={`report-drop-help-${placement}`}>{formats} · up to {formatLimit(fileLimit(scope))}</p><button ref={chooseButton} className="button button-primary report-pick-button" type="button" onClick={openPicker} aria-describedby={`report-drop-help-${placement}`}>Choose {scope === 'image' ? 'an image' : 'a file'}</button></div>
      <span className="report-drop-note">ExifTool loads after you choose a file.<small>Nothing is uploaded.</small></span>
    </div> : null}

    {file && !report ? <div className="report-pending">
      <span className="report-file-mark"><Icon icon={file.type.startsWith('image/') ? imageIcon : fileIcon} width="28" /></span>
      <div><span className="eyebrow">Local inspection</span><h2>{busy ? 'Reading the bytes once.' : 'This file stopped at the door.'}</h2><p>{file.name} · {(file.size / 1024).toFixed(1)} KB</p>{error ? <p className="report-error" role="alert">{error}</p> : null}</div>
      <div className="button-row">{busy ? <button className="button button-secondary" type="button" onClick={clear}><Icon icon={xIcon} width="16" />Cancel</button> : null}{!busy ? <button className="button button-primary" type="button" onClick={openPicker}><Icon icon={replaceIcon} width="16" />Choose another file</button> : null}</div>
    </div> : null}

    {report ? <div className="report-result">
      <header className="report-heading">
        <div><span className="eyebrow">Report ready · bytes stayed local</span><h2 ref={resultHeading} tabIndex={-1}>{report.file.name} metadata report</h2><p>A practical reading first, then the exact ExifTool paths when you need receipts.</p></div>
        <div className="button-row"><button className="button button-secondary" type="button" onClick={openPicker}><Icon icon={replaceIcon} width="16" />Replace</button><button className="button button-ghost" type="button" onClick={clear}><Icon icon={trashIcon} width="16" />Clear</button></div>
      </header>

      <section className="report-summary" aria-labelledby="report-summary-title">
        <div className="report-preview">{preview && report.category === 'image' ? <img src={preview} alt={`Local preview of ${report.file.name}`} /> : <Icon icon={report.category === 'image' ? imageIcon : fileIcon} width="46" />}</div>
        <div className="report-file-title"><span id="report-summary-title">File summary</span><strong>{report.file.name}</strong><small>{report.category} / {report.file.detectedType}</small></div>
        <dl className="report-facts">{report.facts.map((fact) => <div key={fact.id}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
        <div className="report-hashes">
          <div><span>SHA-256 · primary fingerprint</span><code>{report.evidence.sha256}</code><button type="button" aria-label="Copy SHA-256" onClick={() => void copied(report.evidence.sha256, 'SHA-256 copied')}><Icon icon={copyIcon} width="15" /></button></div>
          <div><span>MD5 · compatibility checksum, not security proof</span><code>{report.evidence.md5}</code><button type="button" aria-label="Copy MD5" onClick={() => void copied(report.evidence.md5, 'MD5 copied')}><Icon icon={copyIcon} width="15" /></button></div>
        </div>
      </section>

      <section className={`report-engine is-${exifStatus}`} aria-label="ExifTool inspection status">
        <div className="report-engine-mark"><Icon icon={cpuIcon} width="24" /></div>
        <div className="report-engine-copy"><span className="eyebrow">Deep field engine</span><strong>ExifTool {exifEngine?.version || 'WebAssembly'}</strong><p>{engineMessage(exifStatus, exifMode)}</p></div>
        <ol aria-label="ExifTool progress"><li data-state={exifStatus === 'loading' ? 'active' : exifStatus === 'idle' ? 'waiting' : 'done'}>Load engine</li><li data-state={exifStatus === 'extracting' ? 'active' : ['building', 'complete'].includes(exifStatus) ? 'done' : 'waiting'}>Read tags</li><li data-state={exifStatus === 'building' ? 'active' : exifStatus === 'complete' ? 'done' : 'waiting'}>Build report</li></ol>
        <div className="report-engine-stats"><span>{exifMode === 'embedded' ? 'Embedded scan' : 'Standard scan'}</span><b>{exifEngine?.fieldCount?.toLocaleString('en-US') || '—'} fields</b></div>
        <div className="report-engine-actions">{exifRunning ? <button className="button button-ghost" type="button" onClick={stopExifTool}><Icon icon={xIcon} width="16" />Stop deep scan</button> : null}{exifStatus === 'complete' && exifMode === 'standard' ? <button className="button button-secondary" type="button" onClick={() => rerunExifTool('embedded')}><Icon icon={scanIcon} width="16" />Scan embedded data</button> : null}{exifStatus === 'failed' || exifStatus === 'canceled' ? <button className="button button-secondary" type="button" onClick={() => rerunExifTool('standard')}><Icon icon={scanIcon} width="16" />Retry ExifTool</button> : null}</div>
      </section>

      {report.warnings.length > 0 ? <section className="report-warnings" aria-label="Parser warnings"><Icon icon={warningIcon} width="22" /> <div><strong>{report.warnings.length} parser {report.warnings.length === 1 ? 'note' : 'notes'}</strong>{report.warnings.map((warning) => <p key={`${warning.code}-${warning.message}`}><b>{warning.code}</b> {warning.message}</p>)}</div></section> : null}

      {report.category === 'image' ? <section className={`report-privacy ${sensitiveFields.length ? 'has-signals' : ''}`}>
        <div><span className="eyebrow">Privacy pass</span><strong>{sensitiveFields.length ? `${sensitiveFields.length} potentially sensitive ${sensitiveFields.length === 1 ? 'field' : 'fields'} found` : 'No common sensitive fields in the readable set'}</strong><p>Metadata is editable, and pixels can still reveal people, signs, addresses, and landmarks.</p></div>
        <div className="button-row"><a className="button button-secondary" href="/image-privacy-checker">Open Privacy Checker</a><a className="button button-primary" href="/metadata-remover">Remove image metadata</a></div>
      </section> : null}

      <section className="report-ledger" aria-labelledby="metadata-results-heading">
        <div className="report-ledger-head">
          <div><span className="eyebrow">Metadata results</span><h3 id="metadata-results-heading">Read the useful part—or audit every tag.</h3></div>
          <div className="report-view-switch" aria-label="Metadata view"><button type="button" aria-pressed={view === 'readable'} onClick={() => { setView('readable'); setSource('all'); }}>Readable <b>{report.readableSections.flatMap((section) => section.fields).length}</b></button><button type="button" aria-label="All native fields / All fields" aria-pressed={view === 'native'} onClick={() => { setView('native'); setSource('all'); }}>All fields <b>{report.nativeSections.flatMap((section) => section.fields).length}</b></button></div>
        </div>
        <div className="report-controls">
          <label><Icon icon={searchIcon} width="17" /><span className="sr-only">Search metadata fields</span><input type="search" placeholder="Search value, field, path, or source" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <label><span>Source</span><select aria-label="Filter by source" value={source} onChange={(event) => setSource(event.target.value)}><option value="all">All sources</option>{sources.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <strong>{matchingFields.length.toLocaleString('en-US')} found</strong>
        </div>
        <div className="report-ledger-body">
          <nav className="report-chapters" aria-label="Report chapters"><span>Loaded chapters</span>{renderedSections.map((section, index) => <a key={section.id} href={`#${section.id}`}><i>{String(index + 1).padStart(2, '0')}</i>{section.title}<b>{section.fields.length}</b></a>)}</nav>
          <div className="report-sections">{renderedSections.map((section, index) => <details id={section.id} key={section.id} className="report-section" open={index === 0 || view === 'readable'}><summary><span><strong>{section.title}</strong><small>{section.note}</small></span><b>{section.fields.length}</b></summary><FieldRows section={section} expanded={expanded} onExpand={(id) => setExpanded((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; })} onCopy={(field) => void copied(field.displayValue, `${field.label} copied`)} /></details>)}{!filtered.length ? <div className="report-empty"><strong>No matching fields.</strong><p>Clear the search or switch the source filter.</p><button className="report-text-button" type="button" onClick={() => { setQuery(''); setSource('all'); }}>Clear filters</button></div> : null}{renderedCount < matchingFields.length ? <button className="report-load-more" type="button" onClick={() => setRenderLimit((current) => current + FIELD_BATCH)}><b>Load 250 more rows</b><span>{renderedCount.toLocaleString('en-US')} of {matchingFields.length.toLocaleString('en-US')} currently rendered</span></button> : null}</div>
        </div>
      </section>

      <section className="report-evidence">
        <details><summary><span>File header · first {report.evidence.headerBytes.length} bytes</span><small>Offset, hexadecimal, and printable ASCII</small></summary><HeaderHex bytes={report.evidence.headerBytes} /></details>
        <details open={openRaw} onToggle={(event) => setOpenRaw((event.currentTarget as HTMLDetailsElement).open)}><summary><span>Raw safe JSON</span><small>Binary values are summaries; size and depth caps remain active</small></summary><pre className="report-raw-json">{openRaw ? JSON.stringify(report.raw, null, 2) : ''}</pre></details>
      </section>

      <footer className="report-export">
        <div><span className="eyebrow">Take the receipt</span><h3>Complete JSON, readable PDF, or a quick copy.</h3><p>{exifRunning ? 'Full exports unlock when the local ExifTool pass finishes. Copy visible remains available now.' : 'PDF deliberately trims giant fields. JSON is the complete safe record and never includes file bytes or preview URLs.'}</p></div>
        <div className="report-export-buttons">
          <button className="button button-ghost" type="button" disabled={exifRunning} onClick={() => void copied(linesFor(allFields), 'All readable and native fields copied')}><Icon icon={copyIcon} width="16" />Copy all</button>
          <button className="button button-ghost" type="button" disabled={!matchingFields.length} onClick={() => void copied(linesFor(matchingFields), `${matchingFields.length} visible fields copied`)}><Icon icon={copyIcon} width="16" />Copy visible</button>
          <button className="button button-secondary" type="button" disabled={exifRunning} onClick={() => downloadJson()}><Icon icon={jsonIcon} width="16" />Complete JSON</button>
          <button className="button button-secondary" type="button" onClick={() => void downloadPdf()} disabled={exportingPdf || exifRunning}><Icon icon={pdfIcon} width="16" />{exportingPdf ? 'Building PDF…' : 'Readable PDF'}</button>
          <button className="button button-primary" type="button" disabled={exifRunning} onClick={() => downloadJson(true)}><Icon icon={downloadIcon} width="16" />Raw JSON</button>
        </div>
      </footer>
    </div> : null}
  </section>;
}
