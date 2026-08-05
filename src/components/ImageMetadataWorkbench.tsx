import { Icon } from '@iconify/react';
import alertIcon from '@iconify-icons/lucide/alert-triangle';
import cancelIcon from '@iconify-icons/lucide/stop-circle';
import checkIcon from '@iconify-icons/lucide/shield-check';
import copyIcon from '@iconify-icons/lucide/copy';
import imageIcon from '@iconify-icons/lucide/image';
import mapIcon from '@iconify-icons/lucide/map-pin';
import rotateIcon from '@iconify-icons/lucide/rotate-ccw';
import searchIcon from '@iconify-icons/lucide/search';
import uploadIcon from '@iconify-icons/lucide/upload-cloud';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ImageWorkerClient } from '../lib/image-worker-client';
import { IMAGE_LIMITS } from '../lib/metadata/limits';
import { MetadataError } from '../lib/metadata/errors';
import type { ImageMetadataField, ImageMetadataGroup, ImageMetadataSection, NormalizedImageMetadata } from '../lib/metadata/types';
import { downloadJson } from '../lib/metadata/utils';
import { CopyButton, copyText } from './CopyButton';
import { JsonViewer } from './JsonViewer';

const ACCEPT = 'image/jpeg,image/png,image/webp';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

function sectionRecord(result: NormalizedImageMetadata, id: ImageMetadataGroup): Record<string, unknown> {
  const section = result.sections.find((item) => item.id === id);
  return Object.fromEntries((section?.fields ?? []).map((field) => [field.key, field.value]));
}

function exportRecord(result: NormalizedImageMetadata) {
  return {
    file: result.file,
    camera: sectionRecord(result, 'camera'),
    capture: sectionRecord(result, 'capture'),
    location: { ...result.location, fields: sectionRecord(result, 'location') },
    dates: sectionRecord(result, 'dates'),
    author: sectionRecord(result, 'author'),
    technical: { ...sectionRecord(result, 'privacy'), ...sectionRecord(result, 'software'), ...sectionRecord(result, 'technical') },
    ai: sectionRecord(result, 'ai'),
    raw: result.raw,
    warnings: result.warnings,
  };
}

function LongValue({ field }: { field: ImageMetadataField }) {
  const [expanded, setExpanded] = useState(false);
  const long = field.displayValue.length > IMAGE_LIMITS.displayPreviewChars;
  const display = long && !expanded ? `${field.displayValue.slice(0, IMAGE_LIMITS.displayPreviewChars)}\n… ${field.displayValue.length - IMAGE_LIMITS.displayPreviewChars} more characters` : field.displayValue;
  return <div className="image-field-value"><code>{display}</code>{long && <button className="text-button" type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Show less' : 'Show full value'}</button>}</div>;
}

function MetadataSectionView({ section }: { section: ImageMetadataSection }) {
  return <details className="image-metadata-section" open={section.id === 'privacy' || section.id === 'location'}>
    <summary><span><strong>{section.title}</strong><small>{section.note}</small></span><b>{section.fields.length}</b></summary>
    <div className="image-field-list">
      {section.fields.map((field) => <article className={field.sensitive ? 'is-sensitive' : ''} key={field.id}>
        <div className="field-heading"><div><span>{field.label}</span><small>{field.key} · {field.source}</small></div>{field.sensitive && <mark>Sensitive</mark>}</div>
        <LongValue field={field} />
        <CopyButton value={field.value} label="Copy full value" />
      </article>)}
    </div>
  </details>;
}

function PrivacyHighlights({ result }: { result: NormalizedImageMetadata }) {
  const all = result.sections.flatMap((section) => section.fields);
  const tests = [
    ['GPS coordinates', result.location.valid, 'A precise place can travel with the image.'],
    ['Device serial number', all.some((field) => /serial/i.test(field.key)), 'A persistent device ID is stored.'],
    ['Author or owner name', all.some((field) => /artist|author|owner|creator/i.test(field.key)), 'A personal credit or owner label is present.'],
    ['Capture date', all.some((field) => /datetimeoriginal|date taken/i.test(`${field.key} ${field.label}`)), 'The original capture time is readable.'],
    ['Embedded thumbnail', Boolean(result.legacy.HasEmbeddedThumbnail), 'A second, smaller image may remain inside.'],
    ['AI prompt or workflow', all.some((field) => field.group === 'ai'), 'Generation details survived the export.'],
  ] as const;
  const visible = tests.filter(([, present]) => present);
  if (!visible.length) return <aside className="privacy-highlights is-clear"><Icon icon={checkIcon} width="22" /><div><strong>No obvious privacy fields found</strong><p>That is useful, not a guarantee. Visible faces, text, and landmarks are outside metadata.</p></div><a href="/image-privacy-checker">Run the full privacy checker</a></aside>;
  return <aside className="privacy-highlights"><header><span className="eyebrow">Worth a look before sharing</span><h3>{visible.length} privacy signal{visible.length === 1 ? '' : 's'}</h3></header><div>{visible.map(([label,, note]) => <p key={label}><Icon icon={alertIcon} width="17" /><span><strong>{label}</strong><small>{note}</small></span></p>)}</div><a href="/image-privacy-checker">Open the full privacy checker</a></aside>;
}

export default function ImageMetadataWorkbench() {
  const client = useRef<ImageWorkerClient | null>(null);
  const request = useRef(0);
  const picker = useRef<HTMLInputElement>(null);
  const previewUrl = useRef<string | null>(null);
  const copiedTimer = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Waiting for a JPEG, PNG, or WebP');
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [source, setSource] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<NormalizedImageMetadata | null>(null);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const releasePreview = () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); previewUrl.current = null; setPreview(null); };
  const reset = () => {
    request.current += 1; client.current?.cancel(); releasePreview();
    setBusy(false); setStatus('Waiting for a JPEG, PNG, or WebP'); setError(null); setNotice(null); setSource(null); setResult(null); setQuery(''); setCopied(null);
    if (picker.current) picker.current.value = '';
  };
  useEffect(() => {
    client.current = new ImageWorkerClient();
    return () => {
      request.current += 1; client.current?.dispose();
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  const inspect = async (files: FileList | File[]) => {
    const selected = Array.from(files);
    if (!selected.length) return;
    const file = selected[0]!;
    const current = ++request.current;
    client.current?.cancel(); releasePreview();
    setSource(file); setResult(null); setError(null); setQuery(''); setCopied(null);
    setNotice(selected.length > 1 ? `You chose ${selected.length} files. This desk reads one at a time, so only ${file.name} was opened.` : null);
    if (file.size > IMAGE_LIMITS.fileBytes) { setBusy(false); setStatus('Stopped safely'); setError({ code: 'FILE_TOO_LARGE', message: 'That image is over the 50 MB local inspection limit.' }); return; }
    const url = URL.createObjectURL(file); previewUrl.current = url; setPreview(url);
    setBusy(true); setStatus('Reading image bytes in a local Worker…');
    try {
      const parsed = await client.current!.parse(file);
      if (request.current !== current) return;
      setResult(parsed); setStatus(`Local inspection complete · ${parsed.file.metadataFieldCount} readable fields`);
    } catch (caught) {
      if (request.current !== current || (caught instanceof MetadataError && caught.code === 'PARSE_CANCELLED')) return;
      setError({ code: caught instanceof MetadataError ? caught.code : 'UNKNOWN_PARSE_ERROR', message: caught instanceof Error ? caught.message : 'The image could not be inspected.' });
      setStatus('Stopped safely');
    } finally { if (request.current === current) setBusy(false); }
  };

  const filtered = useMemo(() => {
    if (!result) return [];
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return result.sections;
    return result.sections.map((section) => ({ ...section, fields: section.fields.filter((field) => `${field.label}\n${field.key}\n${field.source}\n${field.searchValue}`.toLocaleLowerCase().includes(needle)) })).filter((section) => section.fields.length);
  }, [query, result]);
  const visibleCount = filtered.reduce((sum, section) => sum + section.fields.length, 0);

  const copyRecord = async (value: unknown, message: string) => {
    try {
      await copyText(JSON.stringify(value, null, 2)); setCopied(message);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(null), 1600);
    }
    catch { setCopied('Copy is blocked here—use Download JSON instead.'); }
  };

  return <section className="workbench image-workbench" aria-busy={busy}>
    <div className="workbench-topline"><div className="local-proof"><Icon icon={checkIcon} width="18" /><span>Local-only parser. No uploads, no file history.</span></div><span className="status-line" aria-live="polite"><i className={busy ? 'pulse' : ''} />{status}</span></div>
    {!source && <div className={`image-dropzone ${dragging ? 'is-dragging' : ''}`} role="button" tabIndex={0} aria-label="Choose a JPEG, PNG, or WebP image up to 50 megabytes" onClick={() => picker.current?.click()} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); picker.current?.click(); } }} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); void inspect(event.dataTransfer.files); }}>
      <input ref={picker} type="file" accept={ACCEPT} multiple hidden onChange={(event) => { if (event.currentTarget.files) void inspect(event.currentTarget.files); }} />
      <span className="image-drop-icon"><Icon icon={uploadIcon} width="32" /></span><div><span className="eyebrow">One image. Zero uploads.</span><strong>Drop the original file here</strong><p>JPEG, PNG, or WebP · up to 50 MB · click or press Enter</p></div><small>We trust the bytes, not a renamed extension.</small>
    </div>}
    {source && <input ref={picker} type="file" accept={ACCEPT} multiple hidden onChange={(event) => { if (event.currentTarget.files) void inspect(event.currentTarget.files); }} />}
    {busy && <div className="image-processing" role="status"><span /><div><strong>Reading locally, off the main thread</strong><p>EXIF, PNG text, and WebP chunks can be large. Cancel whenever you like.</p></div><button className="button button-secondary" type="button" onClick={reset}><Icon icon={cancelIcon} width="16" />Cancel</button></div>}
    {notice && <p className="image-notice" role="status">{notice}</p>}
    {error && <div className="image-error" role="alert"><Icon icon={alertIcon} width="26" /><div><span>{error.code}</span><strong>We stopped before the file could jam the tab.</strong><p>{error.message}</p><button className="button button-secondary" type="button" onClick={reset}>Choose another image</button></div></div>}
    {source && !busy && <div className="image-result-actions"><div><span className="eyebrow">Local result</span><h2>{result ? 'What the image kept' : 'Image not parsed'}</h2></div><div className="button-row"><button className="button button-secondary" type="button" onClick={() => picker.current?.click()}><Icon icon={rotateIcon} width="16" />Replace</button><button className="button button-ghost" type="button" onClick={reset}>Clear</button></div></div>}
    {result && <div className="image-result-shell">
      <section className="image-overview" aria-label="Image summary"><div className="image-preview">{preview ? <img src={preview} alt="Preview of the selected image" /> : <Icon icon={imageIcon} width="36" />}</div><dl>
        <div className="summary-name"><dt>File</dt><dd title={result.file.name}>{result.file.name}</dd></div><div><dt>Actual format</dt><dd>{result.file.actualFormat.toUpperCase()}</dd></div><div><dt>Declared MIME</dt><dd>{result.file.declaredMime}</dd></div><div><dt>Size</dt><dd>{formatBytes(result.file.size)}</dd></div><div><dt>Dimensions</dt><dd>{result.file.width} × {result.file.height}</dd></div><div><dt>Image</dt><dd>{result.file.megapixels} MP · {result.file.aspectRatio}</dd></div><div><dt>Container</dt><dd>{result.file.animated ? 'Animated' : 'Still'} · {result.file.alpha ? 'Alpha' : 'No alpha'}</dd></div><div><dt>Readout</dt><dd>{result.file.metadataFieldCount} fields · {result.file.warningCount} warnings</dd></div>
      </dl></section>
      {result.warnings.length > 0 && <div className="warning-list">{result.warnings.map((warning, index) => <p key={`${warning.code}-${index}`}><strong>{warning.code}</strong> {warning.message}</p>)}</div>}
      <PrivacyHighlights result={result} />
      {!result.file.hasEmbeddedMetadata && <div className="no-metadata"><Icon icon={checkIcon} width="26" /><div><strong>No embedded metadata was found.</strong><p>You can still see format and image dimensions because those live in the image structure. Cameras and social apps often strip the rest.</p></div></div>}
      <div className="metadata-controls"><label><Icon icon={searchIcon} width="18" /><span className="sr-only">Search metadata</span><input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search field, value, or source…" /></label><span>{visibleCount} of {result.file.metadataFieldCount} fields</span></div>
      {filtered.length ? <div className="image-sections">{filtered.map((section) => <MetadataSectionView section={section} key={section.id} />)}</div> : <div className="empty-search"><strong>No field matches “{query}”.</strong><button className="text-button" type="button" onClick={() => setQuery('')}>Clear search</button></div>}
      {result.location.valid && <div className="map-action"><div><Icon icon={mapIcon} width="22" /><span><strong>{result.location.latitude!.toFixed(6)}, {result.location.longitude!.toFixed(6)}</strong><small>No map request has been made.</small></span></div><a className="button button-secondary" href={`https://www.openstreetmap.org/?mlat=${result.location.latitude}&mlon=${result.location.longitude}#map=15/${result.location.latitude}/${result.location.longitude}`} target="_blank" rel="noreferrer">Open map by choice</a></div>}
      <section className="export-bar"><div><span className="eyebrow">Take the record with you</span><h3>Copy or export clean JSON</h3><p aria-live="polite">{copied ?? 'Full values are copied—even when the screen preview is shortened.'}</p></div><div className="button-row"><button className="button button-secondary" type="button" onClick={() => void copyRecord(exportRecord(result), 'All metadata copied.')}><Icon icon={copyIcon} width="16" />Copy all</button><button className="button button-secondary" type="button" onClick={() => void copyRecord(Object.fromEntries(filtered.map((section) => [section.id, Object.fromEntries(section.fields.map((field) => [field.key, field.value]))])), 'Visible fields copied.')}><Icon icon={copyIcon} width="16" />Copy visible</button><button className="button button-primary" type="button" onClick={() => downloadJson(exportRecord(result), `${result.file.safeName}-image-metadata`)}>Download JSON</button></div></section>
      <JsonViewer data={result.raw} title="Raw parser output" />
    </div>}
  </section>;
}
