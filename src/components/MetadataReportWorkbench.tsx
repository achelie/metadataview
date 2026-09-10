import { engineMessage } from '../i18n/workbench-engine';
import { downloadBlob } from '../lib/browser/download';
import { reportTranslator, reportErrors } from '../i18n/workbench-report';
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
import mapIcon from '@iconify-icons/lucide/map-pin';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { ExifToolCancellationError, ExifToolWorkerClient } from '../lib/exiftool-worker-client';
import { IMAGE_LIMITS } from '../lib/metadata/limits';
import { sanitizeFilename } from '../lib/metadata/utils';
import { mergeExifToolInspection, recordExifToolFailure } from '../lib/metadata-report/exiftool-adapter';
import { IMAGE_FULL_SCAN_MODE, IMAGE_FULL_SCAN_TIMEOUT_MS, STANDARD_SCAN_TIMEOUT_MS } from '../lib/metadata-report/scan-policy';
import { createSafeReportExport } from '../lib/metadata-report/safe-export';
import type { MetadataInspectionMode, MetadataReport, MetadataReportField, MetadataReportSection } from '../lib/metadata-report/types';
import { runWorkerTask, type WorkerTask } from '../lib/worker-client';
import type { ExifToolProgressStage } from '../workers/exiftool-protocol';
import type { DetectedFileType } from '../lib/metadata/types';
import { MetadataError } from '../lib/metadata/errors';
import { localizePath, type Locale } from '../i18n/core';
import { LocaleProvider, useLocale } from '../i18n/react';

interface Props {
  scope: 'all' | 'image';
  formats: string;
  accept: string;
  allowedTypes: DetectedFileType[];
  placement?: 'home' | 'tool';
  locale?: Locale;
}

type ViewMode = 'readable' | 'native';
type ExifToolUiStatus = 'idle' | ExifToolProgressStage | 'complete' | 'failed' | 'canceled';

const UNIVERSAL_LIMIT = 100 * 1024 * 1024;
const DISPLAY_LIMIT = 1_200;
const FIELD_BATCH = 250;



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

function metadataNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string' || !/^\s*-?\d+(?:\.\d+)?\s*$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function reportValue(report: MetadataReport, keys: string[]): string | undefined {
  const wanted = keys.map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, ''));
  for (const [key, value] of Object.entries(report.normalized)) {
    if (!wanted.includes(key.toLowerCase().replace(/[^a-z0-9]/g, ''))) continue;
    const shown = displayScalar(value).trim();
    if (shown && shown !== 'false') return shown;
  }
  const fields = [...report.readableSections, ...report.nativeSections].flatMap((section) => section.fields);
  const field = fields.find((item) => wanted.includes(item.key.toLowerCase().replace(/[^a-z0-9]/g, '')) && item.displayValue.trim());
  return field?.displayValue.trim();
}

function formatExifValue(kind: 'iso' | 'aperture' | 'focal' | 'plain', value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (kind === 'iso') return /^iso\b/i.test(value) ? value : `ISO ${value}`;
  if (kind === 'aperture') return /^(?:f\/|ƒ\/)/i.test(value) ? value : `f/${value}`;
  if (kind === 'focal') return /\bmm\b/i.test(value) ? value : `${value} mm`;
  return value;
}

function exifSummaryFromReport(report: MetadataReport, gps: { text: string; mapUrl: string } | null) {
  const make = reportValue(report, ['Make']);
  const model = reportValue(report, ['CameraModelName', 'UniqueCameraModel', 'Model']);
  const camera = model ? (make && !model.toLowerCase().includes(make.toLowerCase()) ? `${make} · ${model}` : model) : make;
  return [
    { id: 'camera', label: 'Camera', value: camera },
    { id: 'lens', label: 'Lens', value: reportValue(report, ['LensModel', 'Lens', 'LensID', 'LensMake']) },
    { id: 'date', label: 'Date Taken', value: reportValue(report, ['SubSecDateTimeOriginal', 'DateTimeOriginal', 'CreateDate']) },
    { id: 'gps', label: 'GPS', value: gps?.text, href: gps?.mapUrl },
    { id: 'iso', label: 'ISO', value: formatExifValue('iso', reportValue(report, ['ISO', 'ISOSpeedRatings', 'PhotographicSensitivity'])) },
    { id: 'aperture', label: 'Aperture', value: formatExifValue('aperture', reportValue(report, ['FNumber', 'Aperture', 'ApertureValue'])) },
    { id: 'shutter', label: 'Shutter Speed', value: reportValue(report, ['ExposureTime', 'ShutterSpeed', 'ShutterSpeedValue']) },
    { id: 'focal', label: 'Focal Length', value: formatExifValue('focal', reportValue(report, ['FocalLength', 'FocalLengthIn35mmFormat'])) },
    { id: 'orientation', label: 'Orientation', value: reportValue(report, ['OrientationMeaning', 'Orientation']) },
  ];
}

function gpsFromReport(report: MetadataReport | null): { text: string; mapUrl: string } | null {
  if (!report || report.category !== 'image') return null;
  const fields = [...report.readableSections, ...report.nativeSections].flatMap((section) => section.fields);
  const byKey = (key: string) => fields.find((field) => field.key.toLowerCase().replace(/[^a-z0-9]/g, '') === key.toLowerCase());
  const valueFor = (key: string) => {
    const field = byKey(key);
    return metadataNumber(field?.numericValue) ?? metadataNumber(field?.value) ?? metadataNumber(field?.displayValue);
  };
  let latitude = metadataNumber(report.normalized.GPSLatitude) ?? valueFor('gpslatitude');
  let longitude = metadataNumber(report.normalized.GPSLongitude) ?? valueFor('gpslongitude');
  if (latitude === undefined || longitude === undefined) return null;

  const latitudeRef = String(byKey('gpslatituderef')?.value ?? '').toUpperCase();
  const longitudeRef = String(byKey('gpslongituderef')?.value ?? '').toUpperCase();
  if (latitudeRef.includes('S')) latitude = -Math.abs(latitude);
  if (longitudeRef.includes('W')) longitude = -Math.abs(longitude);
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || (latitude === 0 && longitude === 0)) return null;

  const text = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  return {
    text,
    mapUrl: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`,
  };
}

function FieldRows({ section, expanded, onExpand, onCopy, locale }: {
  section: MetadataReportSection;
  expanded: Set<string>;
  onExpand: (id: string) => void;
  onCopy: (field: MetadataReportField) => void;
  locale: Locale;
}) {

  const t = reportTranslator(locale);
  const number = (value: number) => value.toLocaleString(locale);
  return <div className="report-field-list">
    {section.fields.map((field) => {
      const long = field.displayValue.length > DISPLAY_LIMIT;
      const open = expanded.has(field.id);
      const shown = long && !open ? `${field.displayValue.slice(0, DISPLAY_LIMIT)}…` : field.displayValue;
      const numeric = field.numericValue === undefined ? null : displayScalar(field.numericValue);
      const showNumeric = numeric !== null && numeric !== field.displayValue;
      return <article key={field.id} className={field.sensitive ? 'is-sensitive' : undefined} data-field-path={field.path}>
        <div className="report-field-name">
          <div><strong>{field.label}</strong>{field.sensitive ? <mark>{t("sensitive")}</mark> : null}</div>
          <small>{field.key}</small>
          {field.binarySummary ? <span className="report-binary-chip">{field.binarySummary.bytes === undefined ? t("binary-payload") : `${number(field.binarySummary.bytes)} B ${t("binary")}`}</span> : null}
        </div>
        <div className="report-field-value">
          <code>{shown}</code>
          {showNumeric ? <small className="report-raw-number">{t("raw-value")}: {numeric}</small> : null}
          {field.binarySummary ? <small className="report-binary-note">{field.binarySummary.note}</small> : null}
          {long ? <button className="report-text-button" type="button" onClick={() => onExpand(field.id)}>{open ? t("show-less") : t("show-all", { count: number(field.displayValue.length) })}</button> : null}
          {field.alternates?.length ? <details className="report-alternates"><summary>{t("alternates", { count: field.alternates.length })}</summary>{field.alternates.map((alternate) => <div key={`${alternate.path}-${alternate.displayValue}`}><b>{alternate.source}</b><code>{alternate.displayValue}</code><small>{alternate.path}</small></div>)}</details> : null}
        </div>
        <div className="report-field-origin">
          <span>{field.source}</span>
          <small>{field.path}</small>
          <div className="report-field-meta"><i>{field.origin}</i>{field.tagId !== undefined ? <i>ID {field.tagId}</i> : null}{field.format ? <i>{field.format}</i> : null}</div>
        </div>
        <button className="report-copy-icon" type="button" aria-label={t("copy-field", { name: field.label })} title={t("copy-field", { name: field.label })} onClick={() => onCopy(field)}><Icon icon={copyIcon} width="16" /></button>
      </article>;
    })}
  </div>;
}

function HeaderHex({ bytes, locale }: { bytes: number[]; locale: Locale }) {
  const rows = Array.from({ length: Math.ceil(bytes.length / 16) }, (_, row) => {
    const offset = row * 16;
    const slice = bytes.slice(offset, offset + 16);
    return {
      offset: offset.toString(16).padStart(4, '0'),
      hex: slice.map((byte) => byte.toString(16).padStart(2, '0')).join(' '),
      ascii: slice.map((byte) => byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.').join(''),
    };
  });

  const t = reportTranslator(locale);
  return <div className="report-hex-table" role="table" aria-label={t("file-header-hexadecimal-dump")}>
    <div role="row" className="report-hex-head"><span role="columnheader">{t("offset")}</span><span role="columnheader">{t("hex")}</span><span role="columnheader">ASCII</span></div>
    {rows.map((row) => <div role="row" key={row.offset}><code role="cell">{row.offset}</code><code role="cell">{row.hex}</code><code role="cell">{row.ascii}</code></div>)}
  </div>;
}



export default function MetadataReportWorkbench({ locale = 'en', ...props }: Props) {
  return <LocaleProvider locale={locale}><MetadataReportWorkbenchContent {...props} /></LocaleProvider>;
}

function MetadataReportWorkbenchContent({ scope, formats, accept, allowedTypes, placement = 'tool' }: Omit<Props, 'locale'>) {
  const locale = useLocale();

  const t = reportTranslator(locale);
  const number = (value: number) => value.toLocaleString(locale);
  const chooseLabel = scope === 'image' ? t("choose-an-image") : t("choose-a-file");
  const input = useRef<HTMLInputElement>(null);
  const chooseButton = useRef<HTMLDivElement>(null);
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
  const [notice, setNotice] = useState(t("waiting-for-a-file"));
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
    setFile(null); setReport(null); setBusy(false); setError(null); setNotice(t("waiting-for-a-file"));
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
      }, mode === 'embedded' ? IMAGE_FULL_SCAN_TIMEOUT_MS : STANDARD_SCAN_TIMEOUT_MS);
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
      const message = caught instanceof Error ? caught.message : t("exiftool-could-not-inspect-this-file");
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
      setBusy(false); setError(t("size-error", { size: (selected.size / 1024 / 1024).toFixed(1), limit: formatLimit(limit) })); setNotice(t("stopped-before-parsing")); return;
    }
    setNotice(extraFiles ? (t("extra-files", { count: extraFiles })) : (t("reading-structure-and-computing-two-checksums-locally")));
    try {
      const current = runWorkerTask<MetadataReport>({ type: 'inspect-metadata', file: selected, allowedTypes } as never, 60_000);
      task.current = current;
      const result = await current.promise;
      if (runId.current !== currentId) return;
      setReport(result);
      if (result.category === 'image' && !previewUrl.current) showPreview(selected);
      const imageReport = result.category === 'image';
      const nativeCount = number(result.nativeSections.flatMap((section) => section.fields).length);
      setNotice(t("initial-report", { count: nativeCount, ignored: extraFiles ? `; ${t(extraFiles === 1 ? "ignored-one" : "ignored-many", { count: extraFiles })}` : "" }));
      void inspectWithExifTool(selected, currentId, result, imageReport ? IMAGE_FULL_SCAN_MODE : 'standard');
    } catch (caught) {
      if (runId.current !== currentId) return;
      const fallback = t("the-local-parser-could-not-read-this-file");
      const raw = caught instanceof Error ? caught.message : fallback;
      const code = caught instanceof MetadataError ? caught.code : undefined;
      const localizedErrors: Partial<Record<string, string>> = reportErrors[locale];
      setError(code && localizedErrors[code] ? localizedErrors[code]! : raw);
      setNotice(t("stopped-safely"));
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
  const gps = useMemo(() => gpsFromReport(report), [report]);
  const exifSummary = useMemo(() => report?.category === 'image' ? exifSummaryFromReport(report, gps) : [], [report, gps]);
  const sensitiveFields = report?.readableSections.flatMap((section) => section.fields).filter((field) => field.sensitive) ?? [];
  const exifEngine = report?.engines.find((engine) => engine.id === 'exiftool');
  const fullImageScan = report?.category === 'image';

  const copied = async (text: string, message: string) => {
    try { await copyText(text); setNotice(message); }
    catch { setNotice(t("clipboard-access-was-blocked-by-this-browser")); }
  };

  const downloadJson = (rawOnly = false) => {
    if (!report || exifRunning) return;
    const data = rawOnly ? report.raw : createSafeReportExport(report);
    const suffix = rawOnly ? '-raw-metadata.json' : '-metadata-report.json';
    downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), sanitizeFilename(report.file.name, suffix));
    setNotice(rawOnly ? t("raw-safe-json-downloaded") : t("complete-json-report-downloaded"));
  };

  const downloadPdf = async () => {
    if (!report || exportingPdf || exifRunning) return;
    setExportingPdf(true); setNotice(t("building-the-readable-pdf-in-this-tab"));
    try {
      const { downloadMetadataReportPdf } = await import('../lib/metadata-report/pdf-export');
      await downloadMetadataReportPdf(report, sanitizeFilename(report.file.name, '-metadata-report.pdf'));
      setNotice(t("readable-pdf-report-downloaded-json-remains-the-complete-record"));
    } catch (error) {
      const reason = error instanceof Error ? error.message : t("unknown-browser-error");
      setNotice(t("pdf-error", { reason }));
    }
    finally { setExportingPdf(false); }
  };

  const rerunExifTool = (mode: MetadataInspectionMode) => {
    if (!file || !report || exifRunning) return;
    void inspectWithExifTool(file, runId.current, report, mode);
  };

  const stopExifTool = () => {
    exifTool.current?.cancel();
    setReport((current) => current ? recordExifToolFailure(current, 'Canceled by user.', exifMode) : current);
    setExifStatus('canceled');
    setNotice(t("scan-canceled"));
  };

  return <section id={`metadata-workbench-${placement}`} className={`workbench report-workbench is-${placement}`} aria-busy={busy || exifRunning}>
    <div className="workbench-topline">
      <div className="local-proof"><Icon icon={checkIcon} width="18" aria-hidden="true" /><span>{t("your-file-stays-on-this-device")}</span></div>
      <span className="status-line" role="status" aria-live="polite"><i className={busy || exifRunning ? 'pulse' : ''} />{notice}</span>
    </div>
    <input ref={input} className="sr-only" type="file" accept={accept} multiple tabIndex={-1} aria-hidden="true" onChange={(event) => pickFiles(event.target.files)} />

    {!file ? <><div ref={chooseButton} className={`report-dropzone ${dragging ? 'is-dragging' : ''}`} role="button" tabIndex={0} aria-label={chooseLabel} aria-describedby={`report-drop-help-${placement}`}
      onClick={openPicker} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPicker(); } }}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); pickFiles(event.dataTransfer.files); }}>
      <span className="report-drop-mark" aria-hidden="true"><Icon icon={uploadIcon} width="33" /></span>
      <div className="report-drop-copy"><span className="eyebrow">{t("one-file-processed-locally")}</span><strong>{t(scope === "image" ? "drop-image" : "drop-file")}</strong><p id={`report-drop-help-${placement}`}>{formats} · {t("up-to")} {formatLimit(fileLimit(scope))}</p><span className="button button-primary report-pick-button" aria-hidden="true">{chooseLabel}</span></div>
      <span className="report-drop-note">{t("exiftool-loads-after-you-choose-a-file")}<small>{t("nothing-is-uploaded")}</small></span>
    </div>{placement === 'home' ? <aside className="home-exif-upload-guide" aria-label={t("photo-metadata-highlights")}>
      <p>{t("view-exif-data-gps-location-camera-settings-date-taken-and-file-metadata-directly-in-your-browser")}</p>
      <ul><li>{t("camera-lens")}</li><li>{t("gps-location")}</li><li>{t("date-taken")}</li><li>{t("full-metadata")}</li></ul>
    </aside> : null}</> : null}

    {file && !report ? <div className="report-pending">
      <span className="report-file-mark"><Icon icon={file.type.startsWith('image/') ? imageIcon : fileIcon} width="28" /></span>
      <div><span className="eyebrow">{t("local-inspection")}</span><h2>{busy ? t("reading-the-bytes-once") : t("this-file-stopped-at-the-door")}</h2><p>{file.name} · {(file.size / 1024).toFixed(1)} KB</p>{error ? <p className="report-error" role="alert">{error}</p> : null}</div>
      <div className="button-row">{busy ? <button className="button button-secondary" type="button" onClick={clear}><Icon icon={xIcon} width="16" />{t("cancel")}</button> : null}{!busy ? <button className="button button-primary" type="button" onClick={openPicker}><Icon icon={replaceIcon} width="16" />{t("choose-another-file")}</button> : null}</div>
    </div> : null}

    {report ? <div className="report-result">
      <header className="report-heading">
        <div><span className="eyebrow">{t("report-ready-bytes-stayed-local")}</span><h2 ref={resultHeading} tabIndex={-1}>{t("file-report", { name: report.file.name })}</h2><p>{t("a-practical-reading-first-then-the-exact-exiftool-paths-when-you-need-receipts")}</p></div>
        <div className="button-row"><button className="button button-secondary" type="button" onClick={openPicker}><Icon icon={replaceIcon} width="16" />{t("replace")}</button><button className="button button-ghost" type="button" onClick={clear}><Icon icon={trashIcon} width="16" />{t("clear")}</button></div>
      </header>

      {placement === 'home' && report.category === 'image' ? <section className="home-exif-summary" aria-labelledby="home-exif-summary-title">
        <header><span className="eyebrow">{t("photo-quick-read")}</span><div><h3 id="home-exif-summary-title">EXIF Summary</h3><p>{t("the-photo-details-people-check-first-missing-means-this-file-did-not-expose-a-usable-value")}</p></div></header>
        <dl>{exifSummary.map((item) => <div key={item.id} data-exif-summary={item.id}><dt>{item.label}</dt><dd>{item.value ? item.href ? <a href={item.href} target="_blank" rel="noreferrer">{item.value}<small>{t("open-map")}</small></a> : item.value : <span>{t("not-found")}</span>}</dd></div>)}</dl>
        <footer><span>{t("full-metadata-continues-below")}</span><a href="#metadata-results-heading">EXIF · XMP · IPTC · ICC · File Information · Raw Metadata ↓</a></footer>
      </section> : null}

      <section className="report-summary" aria-labelledby="report-summary-title">
        <div className="report-preview">{preview && report.category === 'image' ? <img src={preview} alt={t("file-preview", { name: report.file.name })} onError={releasePreview} /> : <Icon icon={report.category === 'image' ? imageIcon : fileIcon} width="46" />}</div>
        <div className="report-file-title"><span id="report-summary-title">{t("file-summary")}</span><strong>{report.file.name}</strong><small>{report.category} / {report.file.detectedType}</small></div>
        <dl className="report-facts">{report.facts.map((fact) => <div key={fact.id}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
        <div className="report-hashes">
          <div><span>{t("sha-256-primary-fingerprint")}</span><code>{report.evidence.sha256}</code><button type="button" aria-label={t("copy-sha-256")} onClick={() => void copied(report.evidence.sha256, t("sha-256-copied"))}><Icon icon={copyIcon} width="15" /></button></div>
          <div><span>{t("md5-compatibility-checksum-not-security-proof")}</span><code>{report.evidence.md5}</code><button type="button" aria-label={t("copy-md5")} onClick={() => void copied(report.evidence.md5, t("md5-copied"))}><Icon icon={copyIcon} width="15" /></button></div>
        </div>
      </section>

      <section className={`report-engine is-${exifStatus}${fullImageScan ? ' is-full-scan' : ''}`} aria-label={t("exiftool-inspection-status")} aria-busy={exifRunning}>
        <div className="report-engine-mark"><Icon icon={cpuIcon} width="24" /></div>
        <div className="report-engine-copy"><span className="eyebrow">{fullImageScan ? t("one-pass-image-inspection") : t("deep-field-engine")}</span><strong>{fullImageScan ? exifRunning ? t("scanning-every-metadata-field") : exifStatus === 'complete' ? t("full-scan-complete") : exifStatus === 'failed' || exifStatus === 'canceled' ? t("full-scan-incomplete") : t("full-image-scan") : `ExifTool ${exifEngine?.version || 'WebAssembly'}`}</strong><p>{engineMessage(exifStatus, exifMode, Boolean(fullImageScan), locale)}</p></div>
        {!fullImageScan ? <ol aria-label={t("exiftool-progress")}><li data-state={exifStatus === 'loading' ? 'active' : exifStatus === 'idle' ? 'waiting' : 'done'}>{t("load-engine")}</li><li data-state={exifStatus === 'extracting' ? 'active' : ['building', 'complete'].includes(exifStatus) ? 'done' : 'waiting'}>{t("read-tags")}</li><li data-state={exifStatus === 'building' ? 'active' : exifStatus === 'complete' ? 'done' : 'waiting'}>{t("build-report")}</li></ol> : null}
        <div className="report-engine-stats"><span>{fullImageScan ? `ExifTool ${exifEngine?.version || 'WASM'}` : exifMode === 'embedded' ? t("embedded-scan") : t("standard-scan")}</span><b>{exifEngine?.fieldCount ? number(exifEngine.fieldCount) : (exifRunning ? t("counting") : '—')} {t("fields")}</b></div>
        <div className="report-engine-actions">{exifRunning ? <button className="button button-ghost" type="button" onClick={stopExifTool}><Icon icon={xIcon} width="16" />{fullImageScan ? t("cancel-full-scan") : t("stop-deep-scan")}</button> : null}{!fullImageScan && exifStatus === 'complete' && exifMode === 'standard' ? <button className="button button-secondary" type="button" onClick={() => rerunExifTool('embedded')}><Icon icon={scanIcon} width="16" />{t("scan-embedded-data")}</button> : null}{exifStatus === 'failed' || exifStatus === 'canceled' ? <button className="button button-secondary" type="button" onClick={() => rerunExifTool(fullImageScan ? IMAGE_FULL_SCAN_MODE : exifMode)}><Icon icon={scanIcon} width="16" />{fullImageScan ? t("retry-full-scan") : t("retry-exiftool")}</button> : null}</div>
      </section>

      {report.warnings.length > 0 ? <section className="report-warnings" aria-label={t("parser-warnings")}><Icon icon={warningIcon} width="22" /> <div><strong>{t("warning-count", { count: report.warnings.length })}</strong>{report.warnings.map((warning) => <p key={`${warning.code}-${warning.message}`}><b>{warning.code}</b> {warning.message}</p>)}</div></section> : null}

      {gps ? <aside className="map-action report-map-action" aria-label={t("gps-metadata-location")}>
        <div><Icon icon={mapIcon} width="23" aria-hidden="true" /><span><strong>{t("gps-location-found")}</strong><small>{t("coordinates-stored-in-this-file")}</small><code>{gps.text}</code></span></div>
        <a href={gps.mapUrl} target="_blank" rel="noreferrer">{t("open-map")}</a>
      </aside> : null}

      {report.category === 'image' ? <section className={`report-privacy ${sensitiveFields.length ? 'has-signals' : ''}`}>
        <div><span className="eyebrow">{t("privacy-pass")}</span><strong>{sensitiveFields.length ? (t("sensitive-count", { count: sensitiveFields.length })) : t("no-common-sensitive-fields-in-the-readable-set")}</strong><p>{t("metadata-is-editable-and-pixels-can-still-reveal-people-signs-addresses-and-landmarks")}</p></div>
        <div className="button-row"><a className="button button-secondary" href={localizePath('/image-privacy-checker/', locale)}>{t("open-privacy-checker")}</a><a className="button button-primary" href={localizePath('/image-metadata-remover/', locale)}>{t("remove-image-metadata")}</a></div>
      </section> : null}

      <section className="report-ledger" aria-labelledby="metadata-results-heading">
        <div className="report-ledger-head">
          <div><span className="eyebrow">{t("metadata-results")}</span><h3 id="metadata-results-heading">{t("read-the-useful-part-or-audit-every-tag")}</h3></div>
          <div className="report-view-switch" aria-label={t("metadata-view")}><button type="button" aria-pressed={view === 'readable'} onClick={() => { setView('readable'); setSource('all'); }}>{t("readable")} <b>{report.readableSections.flatMap((section) => section.fields).length}</b></button><button type="button" aria-label={t("all-native-fields-all-fields")} aria-pressed={view === 'native'} onClick={() => { setView('native'); setSource('all'); }}>{t("all-fields")} <b>{report.nativeSections.flatMap((section) => section.fields).length}</b></button></div>
        </div>
        <div className="report-controls">
          <label><Icon icon={searchIcon} width="17" /><span className="sr-only">{t("search-metadata-fields")}</span><input type="search" placeholder={t("search-value-field-path-or-source")} value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <label><span>{t("source")}</span><select aria-label={t("filter-by-source")} value={source} onChange={(event) => setSource(event.target.value)}><option value="all">{t("all-sources")}</option>{sources.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <strong>{t("found-count", { count: number(matchingFields.length) })}</strong>
        </div>
        <div className="report-ledger-body">
          <nav className="report-chapters" aria-label={t("report-chapters")}><span>{t("loaded-chapters")}</span>{renderedSections.map((section, index) => <a key={section.id} href={`#${section.id}`}><i>{String(index + 1).padStart(2, '0')}</i>{section.title}<b>{section.fields.length}</b></a>)}</nav>
          <div className="report-sections">{renderedSections.map((section, index) => <details id={section.id} key={section.id} className="report-section" open={index === 0 || view === 'readable'}><summary><span><strong>{section.title}</strong><small>{section.note}</small></span><b>{section.fields.length}</b></summary><FieldRows locale={locale} section={section} expanded={expanded} onExpand={(id) => setExpanded((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; })} onCopy={(field) => void copied(field.displayValue, t("copy-field", { name: field.label }))} /></details>)}{!filtered.length ? <div className="report-empty"><strong>{t("no-matching-fields")}</strong><p>{t("clear-the-search-or-switch-the-source-filter")}</p><button className="report-text-button" type="button" onClick={() => { setQuery(''); setSource('all'); }}>{t("clear-filters")}</button></div> : null}{renderedCount < matchingFields.length ? <button className="report-load-more" type="button" onClick={() => setRenderLimit((current) => current + FIELD_BATCH)}><b>{t("load-250-more-rows")}</b><span>{t("render-count", { count: number(renderedCount), total: number(matchingFields.length) })}</span></button> : null}</div>
        </div>
      </section>

      <section className="report-evidence">
        <details><summary><span>{t("header-count", { count: report.evidence.headerBytes.length })}</span><small>{t("offset-hexadecimal-and-printable-ascii")}</small></summary><HeaderHex bytes={report.evidence.headerBytes} locale={locale} /></details>
        <details open={openRaw} onToggle={(event) => setOpenRaw((event.currentTarget as HTMLDetailsElement).open)}><summary><span>{t("raw-safe-json")}</span><small>{t("binary-values-are-summaries-size-and-depth-caps-remain-active")}</small></summary><pre className="report-raw-json">{openRaw ? JSON.stringify(report.raw, null, 2) : ''}</pre></details>
      </section>

      <footer className="report-export">
        <div><span className="eyebrow">{t("take-the-receipt")}</span><h3>{t("complete-json-readable-pdf-or-a-quick-copy")}</h3><p>{exifRunning ? t("export-wait") : t("pdf-deliberately-trims-giant-fields-json-is-the-complete-safe-record-and-never-includes-file-bytes-or-preview-urls")}</p></div>
        <div className="report-export-buttons">
          <button className="button button-ghost" type="button" disabled={exifRunning} onClick={() => void copied(linesFor(allFields), t("all-readable-and-native-fields-copied"))}><Icon icon={copyIcon} width="16" />{t("copy-all")}</button>
          <button className="button button-ghost" type="button" disabled={!matchingFields.length} onClick={() => void copied(linesFor(matchingFields), t("visible-copied", { count: matchingFields.length }))}><Icon icon={copyIcon} width="16" />{t("copy-visible")}</button>
          <button className="button button-secondary" type="button" disabled={exifRunning} onClick={() => downloadJson()}><Icon icon={jsonIcon} width="16" />{t("complete-json")}</button>
          <button className="button button-secondary" type="button" onClick={() => void downloadPdf()} disabled={exportingPdf || exifRunning}><Icon icon={pdfIcon} width="16" />{exportingPdf ? t("building-pdf") : t("readable-pdf")}</button>
          <button className="button button-primary" type="button" disabled={exifRunning} onClick={() => downloadJson(true)}><Icon icon={downloadIcon} width="16" />{t("raw-json")}</button>
        </div>
      </footer>
    </div> : null}
  </section>;
}
