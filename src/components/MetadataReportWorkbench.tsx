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

function metadataNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string' || !/^\s*-?\d+(?:\.\d+)?\s*$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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
  const zh = locale === 'zh-CN';
  const de = locale === 'de';
  const t = (en: string, zhText: string, deText: string) => zh ? zhText : de ? deText : en;
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
          <div><strong>{field.label}</strong>{field.sensitive ? <mark>{t('Sensitive', '敏感', 'Sensibel')}</mark> : null}</div>
          <small>{field.key}</small>
          {field.binarySummary ? <span className="report-binary-chip">{field.binarySummary.bytes === undefined ? t('Binary payload', '二进制载荷', 'Binärdaten') : `${number(field.binarySummary.bytes)} B ${t('binary', '二进制', 'binär')}`}</span> : null}
        </div>
        <div className="report-field-value">
          <code>{shown}</code>
          {showNumeric ? <small className="report-raw-number">{t('Raw value', '原始值', 'Rohwert')}: {numeric}</small> : null}
          {field.binarySummary ? <small className="report-binary-note">{field.binarySummary.note}</small> : null}
          {long ? <button className="report-text-button" type="button" onClick={() => onExpand(field.id)}>{open ? t('Show less', '收起', 'Weniger anzeigen') : zh ? `显示全部 ${number(field.displayValue.length)} 个字符` : de ? `Alle ${number(field.displayValue.length)} Zeichen anzeigen` : `Show all ${number(field.displayValue.length)} characters`}</button> : null}
          {field.alternates?.length ? <details className="report-alternates"><summary>{zh ? `${field.alternates.length} 个解析器备选值` : de ? `${field.alternates.length} Parser-Alternativwert${field.alternates.length === 1 ? '' : 'e'}` : `${field.alternates.length} parser ${field.alternates.length === 1 ? 'alternate' : 'alternates'}`}</summary>{field.alternates.map((alternate) => <div key={`${alternate.path}-${alternate.displayValue}`}><b>{alternate.source}</b><code>{alternate.displayValue}</code><small>{alternate.path}</small></div>)}</details> : null}
        </div>
        <div className="report-field-origin">
          <span>{field.source}</span>
          <small>{field.path}</small>
          <div className="report-field-meta"><i>{field.origin}</i>{field.tagId !== undefined ? <i>ID {field.tagId}</i> : null}{field.format ? <i>{field.format}</i> : null}</div>
        </div>
        <button className="report-copy-icon" type="button" aria-label={zh ? `复制 ${field.label}` : de ? `${field.label} kopieren` : `Copy ${field.label}`} title={zh ? `复制 ${field.label}` : de ? `${field.label} kopieren` : `Copy ${field.label}`} onClick={() => onCopy(field)}><Icon icon={copyIcon} width="16" /></button>
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
  const zh = locale === 'zh-CN';
  const de = locale === 'de';
  const t = (en: string, zhText: string, deText: string) => zh ? zhText : de ? deText : en;
  return <div className="report-hex-table" role="table" aria-label={t('File header hexadecimal dump', '文件头十六进制转储', 'Hexadezimalansicht des Dateikopfs')}>
    <div role="row" className="report-hex-head"><span role="columnheader">{t('Offset', '偏移', 'Offset')}</span><span role="columnheader">{t('Hex', '十六进制', 'Hex')}</span><span role="columnheader">ASCII</span></div>
    {rows.map((row) => <div role="row" key={row.offset}><code role="cell">{row.offset}</code><code role="cell">{row.hex}</code><code role="cell">{row.ascii}</code></div>)}
  </div>;
}

function engineMessage(status: ExifToolUiStatus, mode: MetadataInspectionMode, fullImageScan: boolean, locale: Locale): string {
  const zh = locale === 'zh-CN';
  const de = locale === 'de';
  if (fullImageScan) {
    if (zh) {
      if (status === 'loading' || status === 'extracting' || status === 'building') return '正在本地扫描所有元数据字段、内嵌预览和嵌套图片记录。';
      if (status === 'complete') return '完整图片扫描已完成，所有安全的 ExifTool 结果都可以在下方搜索。';
      if (status === 'failed') return '完整扫描已停止，浏览器初步报告仍可使用、导出或重试。';
      if (status === 'canceled') return '完整扫描已取消，浏览器初步报告仍然可用。';
      return '浏览器初步报告已经就绪，完整图片扫描尚未开始。';
    }
    if (de) {
      if (status === 'loading' || status === 'extracting' || status === 'building') return 'Alle Metadatenfelder, eingebetteten Vorschauen und verschachtelten Bilddatensätze werden lokal geprüft.';
      if (status === 'complete') return 'Der vollständige Bildscan ist fertig. Alle sicheren ExifTool-Ergebnisse sind unten durchsuchbar.';
      if (status === 'failed') return 'Der vollständige Scan wurde gestoppt. Der Browser-Schnellbericht bleibt erhalten und kann exportiert oder erneut geprüft werden.';
      if (status === 'canceled') return 'Der vollständige Scan wurde abgebrochen. Der Browser-Schnellbericht bleibt nutzbar.';
      return 'Der Browser-Schnellbericht ist fertig. Der vollständige Bildscan wurde noch nicht gestartet.';
    }
    if (status === 'loading' || status === 'extracting' || status === 'building') return 'Scanning every metadata field, embedded preview, and nested image record locally.';
    if (status === 'complete') return 'The full image scan is complete. Every safe ExifTool result is now searchable below.';
    if (status === 'failed') return 'The full scan stopped. The browser-only report is intact and can be exported or retried.';
    if (status === 'canceled') return 'The full scan was canceled. The browser-only report is still usable.';
    return 'The browser-only report is ready. The full image scan has not started.';
  }
  if (zh) {
    if (status === 'loading') return '正在从本站加载 ExifTool 引擎，文件内容不会离开当前标签页。';
    if (status === 'extracting') return mode === 'embedded' ? '正在本地遍历标签和内嵌文档，这一步会慢一些。' : '正在本地读取所有标准标签，包括未知和重复实例。';
    if (status === 'building') return '正在把原生标签整理成可搜索的报告行。';
    if (status === 'complete') return mode === 'embedded' ? '标准标签和内嵌文档已加入报告。' : '完整标准 ExifTool 字段已经加入报告。';
    if (status === 'failed') return '快速报告仍然完整，不用重新选择文件即可重试 ExifTool。';
    if (status === 'canceled') return '深度检查已停止，快速浏览器报告仍可使用。';
    return '快速报告已经就绪，深度引擎尚未启动。';
  }
  if (de) {
    if (status === 'loading') return 'ExifTool wird von dieser Website geladen. Nichts aus der Datei verlässt diesen Tab.';
    if (status === 'extracting') return mode === 'embedded' ? 'Tags und eingebettete Dokumente werden lokal durchsucht. Dieser Durchlauf dauert länger.' : 'Alle Standard-Tags werden lokal gelesen, auch unbekannte und doppelte Instanzen.';
    if (status === 'building') return 'Native Tags werden in durchsuchbare Berichtszeilen umgewandelt.';
    if (status === 'complete') return mode === 'embedded' ? 'Standard-Tags und eingebettete Dokumente stehen im Bericht.' : 'Der vollständige ExifTool-Standardsatz steht im Bericht.';
    if (status === 'failed') return 'Der Schnellbericht bleibt erhalten. ExifTool kann ohne erneute Dateiauswahl gestartet werden.';
    if (status === 'canceled') return 'Die Tiefenprüfung wurde gestoppt. Der Browser-Schnellbericht bleibt nutzbar.';
    return 'Der Schnellbericht ist fertig. Die Tiefen-Engine wurde noch nicht gestartet.';
  }
  if (status === 'loading') return 'Loading the ExifTool engine from this site. Nothing from the file leaves this tab.';
  if (status === 'extracting') return mode === 'embedded' ? 'Walking tags and embedded documents locally. This is the slow pass.' : 'Reading every standard tag locally, including unknown and duplicate instances.';
  if (status === 'building') return 'Turning native tags into searchable report rows.';
  if (status === 'complete') return mode === 'embedded' ? 'Standard tags and embedded documents are in the report.' : 'The full standard ExifTool field set is in the report.';
  if (status === 'failed') return 'The fast report is intact. ExifTool can be retried without choosing the file again.';
  if (status === 'canceled') return 'Deep inspection stopped. The fast browser report is still usable.';
  return 'The fast report is ready. The deep engine has not started.';
}

export default function MetadataReportWorkbench({ locale = 'en', ...props }: Props) {
  return <LocaleProvider locale={locale}><MetadataReportWorkbenchContent {...props} /></LocaleProvider>;
}

function MetadataReportWorkbenchContent({ scope, formats, accept, allowedTypes, placement = 'tool' }: Omit<Props, 'locale'>) {
  const locale = useLocale();
  const zh = locale === 'zh-CN';
  const de = locale === 'de';
  const t = (en: string, zhText: string, deText: string) => zh ? zhText : de ? deText : en;
  const number = (value: number) => value.toLocaleString(locale);
  const chooseLabel = scope === 'image' ? t('Choose an image', '选择图片', 'Bild auswählen') : t('Choose a file', '选择文件', 'Datei auswählen');
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
  const [notice, setNotice] = useState(t('Waiting for a file', '等待选择文件', 'Warte auf eine Datei'));
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
    setFile(null); setReport(null); setBusy(false); setError(null); setNotice(t('Waiting for a file', '等待选择文件', 'Warte auf eine Datei'));
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
      const message = caught instanceof Error ? caught.message : t('ExifTool could not inspect this file.', 'ExifTool 无法检查这个文件。', 'ExifTool konnte diese Datei nicht prüfen.');
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
      setBusy(false); setError(zh ? `这个文件有 ${(selected.size / 1024 / 1024).toFixed(1)} MB，${scope === 'image' ? '图片' : '通用'}查看器上限为 ${formatLimit(limit)}。` : de ? `Diese Datei ist ${(selected.size / 1024 / 1024).toFixed(1)} MB groß. Der ${scope === 'image' ? 'Bild' : 'Universal'}-Viewer akzeptiert höchstens ${formatLimit(limit)}.` : `This file is ${(selected.size / 1024 / 1024).toFixed(1)} MB. The ${scope === 'image' ? 'image' : 'universal'} viewer stops at ${formatLimit(limit)}.`); setNotice(t('Stopped before parsing', '解析开始前已停止', 'Vor der Analyse gestoppt')); return;
    }
    setNotice(extraFiles ? (zh ? `只在本地检查第一个文件，另外 ${extraFiles} 个文件已忽略` : de ? `Die erste Datei wird lokal geprüft; ${extraFiles} weitere Datei${extraFiles === 1 ? '' : 'en'} ignoriert` : `Inspecting the first file locally; ${extraFiles} extra ${extraFiles === 1 ? 'file was' : 'files were'} ignored`) : t('Reading structure and computing two checksums locally', '正在本地读取结构并计算两种校验和', 'Struktur wird lokal gelesen und zwei Prüfsummen werden berechnet'));
    try {
      const current = runWorkerTask<MetadataReport>({ type: 'inspect-metadata', file: selected, allowedTypes } as never, 60_000);
      task.current = current;
      const result = await current.promise;
      if (runId.current !== currentId) return;
      setReport(result);
      if (result.category === 'image' && !previewUrl.current) showPreview(selected);
      const ignored = extraFiles ? `; ${extraFiles} extra ${extraFiles === 1 ? 'file was' : 'files were'} ignored` : '';
      const imageReport = result.category === 'image';
      const nativeCount = number(result.nativeSections.flatMap((section) => section.fields).length);
      setNotice(zh ? `初步报告已就绪 · ${nativeCount} 个原生字段；${imageReport ? '完整图片扫描' : 'ExifTool'}正在下方运行${extraFiles ? `；已忽略 ${extraFiles} 个额外文件` : ''}` : de ? `Erster Bericht fertig · ${nativeCount} native Felder; ${imageReport ? 'der vollständige Bildscan' : 'ExifTool'} läuft unten${extraFiles ? `; ${extraFiles} weitere Datei${extraFiles === 1 ? '' : 'en'} ignoriert` : ''}` : `Initial report ready · ${nativeCount} native fields; ${imageReport ? 'the full image scan' : 'ExifTool'} is running below${ignored}`);
      void inspectWithExifTool(selected, currentId, result, imageReport ? IMAGE_FULL_SCAN_MODE : 'standard');
    } catch (caught) {
      if (runId.current !== currentId) return;
      const fallback = t('The local parser could not read this file.', '本地解析器无法读取这个文件。', 'Der lokale Parser konnte diese Datei nicht lesen.');
      const raw = caught instanceof Error ? caught.message : fallback;
      const code = caught instanceof MetadataError ? caught.code : undefined;
      const localizedErrors: Partial<Record<string, string>> = zh ? { UNSUPPORTED_FILE_TYPE: '这个工具不支持该文件格式。', FILE_TOO_LARGE: '文件超过了安全处理上限。', INVALID_FILE_SIGNATURE: '文件签名不属于受支持的格式。', ENCRYPTED_PDF: '这个 PDF 受密码保护，工具不会尝试绕过密码。', ENCRYPTED_OFFICE: '这个 Office 文件已加密，工具不会尝试绕过密码。', CORRUPTED_FILE: '文件已损坏或结构不完整，无法安全读取。', PARSE_TIMEOUT: '解析耗时过长，已经安全停止。' } : de ? { UNSUPPORTED_FILE_TYPE: 'Dieses Dateiformat wird von diesem Werkzeug nicht unterstützt.', FILE_TOO_LARGE: 'Die Datei überschreitet die sichere Verarbeitungsgrenze.', INVALID_FILE_SIGNATURE: 'Die Dateisignatur gehört zu keinem unterstützten Format.', ENCRYPTED_PDF: 'Dieses PDF ist passwortgeschützt. Das Werkzeug versucht nicht, den Schutz zu umgehen.', ENCRYPTED_OFFICE: 'Diese Office-Datei ist verschlüsselt. Das Werkzeug versucht nicht, die Verschlüsselung zu umgehen.', CORRUPTED_FILE: 'Die Datei ist beschädigt oder unvollständig und kann nicht sicher gelesen werden.', PARSE_TIMEOUT: 'Die Analyse dauerte zu lange und wurde sicher gestoppt.' } : {};
      setError(code && localizedErrors[code] ? localizedErrors[code]! : raw);
      setNotice(t('Stopped safely', '已安全停止', 'Sicher gestoppt'));
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
  const sensitiveFields = report?.readableSections.flatMap((section) => section.fields).filter((field) => field.sensitive) ?? [];
  const exifEngine = report?.engines.find((engine) => engine.id === 'exiftool');
  const fullImageScan = report?.category === 'image';

  const copied = async (text: string, message: string) => {
    try { await copyText(text); setNotice(message); }
    catch { setNotice(t('Clipboard access was blocked by this browser', '浏览器阻止了剪贴板访问', 'Der Browser hat den Zugriff auf die Zwischenablage blockiert')); }
  };

  const downloadJson = (rawOnly = false) => {
    if (!report || exifRunning) return;
    const data = rawOnly ? report.raw : createSafeReportExport(report);
    const suffix = rawOnly ? '-raw-metadata.json' : '-metadata-report.json';
    downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), sanitizeFilename(report.file.name, suffix));
    setNotice(rawOnly ? t('Raw safe JSON downloaded', '原始安全 JSON 已下载', 'Sicheres Roh-JSON heruntergeladen') : t('Complete JSON report downloaded', '完整 JSON 报告已下载', 'Vollständiger englischer JSON-Bericht heruntergeladen'));
  };

  const downloadPdf = async () => {
    if (!report || exportingPdf || exifRunning) return;
    setExportingPdf(true); setNotice(t('Building the readable PDF in this tab', '正在当前标签页生成英文 PDF', 'Das englische PDF wird in diesem Tab erstellt'));
    try {
      const { downloadMetadataReportPdf } = await import('../lib/metadata-report/pdf-export');
      await downloadMetadataReportPdf(report, sanitizeFilename(report.file.name, '-metadata-report.pdf'));
      setNotice(t('Readable PDF report downloaded; JSON remains the complete record', '英文 PDF 已下载；JSON 仍是完整记录', 'Englischer PDF-Bericht heruntergeladen; JSON bleibt der vollständige Datensatz'));
    } catch (error) {
      const reason = error instanceof Error ? error.message : t('Unknown browser error', '未知浏览器错误', 'Unbekannter Browserfehler');
      setNotice(zh ? `PDF 无法生成（${reason}），JSON 报告仍可下载。` : de ? `Das PDF konnte nicht erstellt werden (${reason}). Der englische JSON-Bericht ist weiterhin verfügbar.` : `The PDF could not be built (${reason}). The JSON report is still available.`);
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
    setNotice(zh ? `${fullImageScan ? '完整图片' : 'ExifTool'}扫描已取消，初步报告仍可使用` : de ? `${fullImageScan ? 'Vollständiger Bildscan' : 'ExifTool-Scan'} abgebrochen; der erste Bericht bleibt verfügbar` : `${fullImageScan ? 'Full image' : 'ExifTool'} scan canceled; the initial report remains available`);
  };

  return <section id={`metadata-workbench-${placement}`} className={`workbench report-workbench is-${placement}`} aria-busy={busy || exifRunning}>
    <div className="workbench-topline">
      <div className="local-proof"><Icon icon={checkIcon} width="18" aria-hidden="true" /><span>{t('Your file stays on this device.', '文件只留在这台设备上。', 'Deine Datei bleibt auf diesem Gerät.')}</span></div>
      <span className="status-line" role="status" aria-live="polite"><i className={busy || exifRunning ? 'pulse' : ''} />{notice}</span>
    </div>
    <input ref={input} className="sr-only" type="file" accept={accept} multiple tabIndex={-1} aria-hidden="true" onChange={(event) => pickFiles(event.target.files)} />

    {!file ? <div ref={chooseButton} className={`report-dropzone ${dragging ? 'is-dragging' : ''}`} role="button" tabIndex={0} aria-label={chooseLabel} aria-describedby={`report-drop-help-${placement}`}
      onClick={openPicker} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPicker(); } }}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); pickFiles(event.dataTransfer.files); }}>
      <span className="report-drop-mark" aria-hidden="true"><Icon icon={uploadIcon} width="33" /></span>
      <div className="report-drop-copy"><span className="eyebrow">{t('One file · processed locally', '一个文件 · 本地处理', 'Eine Datei · lokal verarbeitet')}</span><strong>{zh ? `把${scope === 'image' ? '图片' : '文件'}拖到这里` : de ? (scope === 'image' ? 'Bild hier ablegen' : 'Datei hier ablegen') : `Drop ${scope === 'image' ? 'an image' : 'a file'} here`}</strong><p id={`report-drop-help-${placement}`}>{formats} · {t('up to', '最大', 'bis')} {formatLimit(fileLimit(scope))}</p><span className="button button-primary report-pick-button" aria-hidden="true">{chooseLabel}</span></div>
      <span className="report-drop-note">{t('ExifTool loads after you choose a file.', '选好文件后才加载 ExifTool。', 'ExifTool wird erst nach der Dateiauswahl geladen.')}<small>{t('Nothing is uploaded.', '不会上传任何内容。', 'Nichts wird hochgeladen.')}</small></span>
    </div> : null}

    {file && !report ? <div className="report-pending">
      <span className="report-file-mark"><Icon icon={file.type.startsWith('image/') ? imageIcon : fileIcon} width="28" /></span>
      <div><span className="eyebrow">{t('Local inspection', '本地检查', 'Lokale Prüfung')}</span><h2>{busy ? t('Reading the bytes once.', '只读一遍文件字节。', 'Die Dateibytes werden einmal gelesen.') : t('This file stopped at the door.', '这个文件没能进门。', 'Diese Datei kam nicht durch die Tür.')}</h2><p>{file.name} · {(file.size / 1024).toFixed(1)} KB</p>{error ? <p className="report-error" role="alert">{error}</p> : null}</div>
      <div className="button-row">{busy ? <button className="button button-secondary" type="button" onClick={clear}><Icon icon={xIcon} width="16" />{t('Cancel', '取消', 'Abbrechen')}</button> : null}{!busy ? <button className="button button-primary" type="button" onClick={openPicker}><Icon icon={replaceIcon} width="16" />{t('Choose another file', '换一个文件', 'Andere Datei wählen')}</button> : null}</div>
    </div> : null}

    {report ? <div className="report-result">
      <header className="report-heading">
        <div><span className="eyebrow">{t('Report ready · bytes stayed local', '报告已就绪 · 文件字节留在本机', 'Bericht fertig · Dateibytes blieben lokal')}</span><h2 ref={resultHeading} tabIndex={-1}>{zh ? `${report.file.name} 元数据报告` : de ? `Metadatenbericht für ${report.file.name}` : `${report.file.name} metadata report`}</h2><p>{t('A practical reading first, then the exact ExifTool paths when you need receipts.', '先看实用摘要，需要核对时再看精确的 ExifTool 路径。', 'Zuerst die praktische Zusammenfassung, bei Bedarf danach die exakten ExifTool-Pfade.')}</p></div>
        <div className="button-row"><button className="button button-secondary" type="button" onClick={openPicker}><Icon icon={replaceIcon} width="16" />{t('Replace', '替换', 'Ersetzen')}</button><button className="button button-ghost" type="button" onClick={clear}><Icon icon={trashIcon} width="16" />{t('Clear', '清除', 'Leeren')}</button></div>
      </header>

      <section className="report-summary" aria-labelledby="report-summary-title">
        <div className="report-preview">{preview && report.category === 'image' ? <img src={preview} alt={zh ? `${report.file.name} 的本地预览` : de ? `Lokale Vorschau von ${report.file.name}` : `Local preview of ${report.file.name}`} onError={releasePreview} /> : <Icon icon={report.category === 'image' ? imageIcon : fileIcon} width="46" />}</div>
        <div className="report-file-title"><span id="report-summary-title">{t('File summary', '文件摘要', 'Dateiübersicht')}</span><strong>{report.file.name}</strong><small>{report.category} / {report.file.detectedType}</small></div>
        <dl className="report-facts">{report.facts.map((fact) => <div key={fact.id}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
        <div className="report-hashes">
          <div><span>{t('SHA-256 · primary fingerprint', 'SHA-256 · 主要指纹', 'SHA-256 · primärer Fingerabdruck')}</span><code>{report.evidence.sha256}</code><button type="button" aria-label={t('Copy SHA-256', '复制 SHA-256', 'SHA-256 kopieren')} onClick={() => void copied(report.evidence.sha256, t('SHA-256 copied', 'SHA-256 已复制', 'SHA-256 kopiert'))}><Icon icon={copyIcon} width="15" /></button></div>
          <div><span>{t('MD5 · compatibility checksum, not security proof', 'MD5 · 兼容校验，不是安全证明', 'MD5 · Kompatibilitätsprüfsumme, kein Sicherheitsnachweis')}</span><code>{report.evidence.md5}</code><button type="button" aria-label={t('Copy MD5', '复制 MD5', 'MD5 kopieren')} onClick={() => void copied(report.evidence.md5, t('MD5 copied', 'MD5 已复制', 'MD5 kopiert'))}><Icon icon={copyIcon} width="15" /></button></div>
        </div>
      </section>

      <section className={`report-engine is-${exifStatus}${fullImageScan ? ' is-full-scan' : ''}`} aria-label={t('ExifTool inspection status', 'ExifTool 检查状态', 'ExifTool-Prüfstatus')} aria-busy={exifRunning}>
        <div className="report-engine-mark"><Icon icon={cpuIcon} width="24" /></div>
        <div className="report-engine-copy"><span className="eyebrow">{fullImageScan ? t('One-pass image inspection', '单次完整图片检查', 'Bildprüfung in einem Durchlauf') : t('Deep field engine', '深度字段引擎', 'Tiefen-Engine')}</span><strong>{fullImageScan ? exifRunning ? t('Scanning every metadata field…', '正在扫描所有元数据字段…', 'Alle Metadatenfelder werden geprüft…') : exifStatus === 'complete' ? t('Full scan complete', '完整扫描完成', 'Vollständiger Scan fertig') : exifStatus === 'failed' || exifStatus === 'canceled' ? t('Full scan incomplete', '完整扫描未完成', 'Vollständiger Scan unvollständig') : t('Full image scan', '完整图片扫描', 'Vollständiger Bildscan') : `ExifTool ${exifEngine?.version || 'WebAssembly'}`}</strong><p>{engineMessage(exifStatus, exifMode, Boolean(fullImageScan), locale)}</p></div>
        {!fullImageScan ? <ol aria-label={t('ExifTool progress', 'ExifTool 进度', 'ExifTool-Fortschritt')}><li data-state={exifStatus === 'loading' ? 'active' : exifStatus === 'idle' ? 'waiting' : 'done'}>{t('Load engine', '加载引擎', 'Engine laden')}</li><li data-state={exifStatus === 'extracting' ? 'active' : ['building', 'complete'].includes(exifStatus) ? 'done' : 'waiting'}>{t('Read tags', '读取标签', 'Tags lesen')}</li><li data-state={exifStatus === 'building' ? 'active' : exifStatus === 'complete' ? 'done' : 'waiting'}>{t('Build report', '生成报告', 'Bericht erstellen')}</li></ol> : null}
        <div className="report-engine-stats"><span>{fullImageScan ? `ExifTool ${exifEngine?.version || 'WASM'}` : exifMode === 'embedded' ? t('Embedded scan', '内嵌扫描', 'Scan eingebetteter Daten') : t('Standard scan', '标准扫描', 'Standardscan')}</span><b>{exifEngine?.fieldCount ? number(exifEngine.fieldCount) : (exifRunning ? t('Counting…', '计数中…', 'Wird gezählt…') : '—')} {t('fields', '个字段', 'Felder')}</b></div>
        <div className="report-engine-actions">{exifRunning ? <button className="button button-ghost" type="button" onClick={stopExifTool}><Icon icon={xIcon} width="16" />{fullImageScan ? t('Cancel full scan', '取消完整扫描', 'Vollständigen Scan abbrechen') : t('Stop deep scan', '停止深度扫描', 'Tiefenscan stoppen')}</button> : null}{!fullImageScan && exifStatus === 'complete' && exifMode === 'standard' ? <button className="button button-secondary" type="button" onClick={() => rerunExifTool('embedded')}><Icon icon={scanIcon} width="16" />{t('Scan embedded data', '扫描内嵌数据', 'Eingebettete Daten prüfen')}</button> : null}{exifStatus === 'failed' || exifStatus === 'canceled' ? <button className="button button-secondary" type="button" onClick={() => rerunExifTool(fullImageScan ? IMAGE_FULL_SCAN_MODE : exifMode)}><Icon icon={scanIcon} width="16" />{fullImageScan ? t('Retry full scan', '重试完整扫描', 'Vollständigen Scan wiederholen') : t('Retry ExifTool', '重试 ExifTool', 'ExifTool erneut starten')}</button> : null}</div>
      </section>

      {report.warnings.length > 0 ? <section className="report-warnings" aria-label={t('Parser warnings', '解析器提醒', 'Parser-Hinweise')}><Icon icon={warningIcon} width="22" /> <div><strong>{zh ? `${report.warnings.length} 条解析器提醒` : de ? `${report.warnings.length} Parser-Hinweis${report.warnings.length === 1 ? '' : 'e'}` : `${report.warnings.length} parser ${report.warnings.length === 1 ? 'note' : 'notes'}`}</strong>{report.warnings.map((warning) => <p key={`${warning.code}-${warning.message}`}><b>{warning.code}</b> {warning.message}</p>)}</div></section> : null}

      {gps ? <aside className="map-action report-map-action" aria-label={t('GPS metadata location', 'GPS 元数据位置', 'GPS-Metadatenstandort')}>
        <div><Icon icon={mapIcon} width="23" aria-hidden="true" /><span><strong>{t('GPS location found', '发现 GPS 位置', 'GPS-Standort gefunden')}</strong><small>{t('Coordinates stored in this image', '图片中保存的坐标', 'Im Bild gespeicherte Koordinaten')}</small><code>{gps.text}</code></span></div>
        <a href={gps.mapUrl} target="_blank" rel="noreferrer">{t('Open map', '打开地图', 'Karte öffnen')}</a>
      </aside> : null}

      {report.category === 'image' ? <section className={`report-privacy ${sensitiveFields.length ? 'has-signals' : ''}`}>
        <div><span className="eyebrow">{t('Privacy pass', '隐私快速检查', 'Datenschutz-Schnellcheck')}</span><strong>{sensitiveFields.length ? (zh ? `发现 ${sensitiveFields.length} 个可能敏感的字段` : de ? `${sensitiveFields.length} möglicherweise sensible${sensitiveFields.length === 1 ? 's Feld' : ' Felder'} gefunden` : `${sensitiveFields.length} potentially sensitive ${sensitiveFields.length === 1 ? 'field' : 'fields'} found`) : t('No common sensitive fields in the readable set', '易读字段中未发现常见敏感项', 'Keine üblichen sensiblen Felder in der lesbaren Ansicht')}</strong><p>{t('Metadata is editable, and pixels can still reveal people, signs, addresses, and landmarks.', '元数据可以修改，画面本身仍可能暴露人物、标志、地址和地标。', 'Metadaten lassen sich ändern. Bildpixel können trotzdem Personen, Schilder, Adressen und markante Orte verraten.')}</p></div>
        <div className="button-row"><a className="button button-secondary" href={localizePath('/image-privacy-checker/', locale)}>{t('Open Privacy Checker', '打开隐私检查器', 'Datenschutz-Check öffnen')}</a><a className="button button-primary" href={localizePath('/image-metadata-remover/', locale)}>{t('Remove image metadata', '清除图片元数据', 'Bild-Metadaten entfernen')}</a></div>
      </section> : null}

      <section className="report-ledger" aria-labelledby="metadata-results-heading">
        <div className="report-ledger-head">
          <div><span className="eyebrow">{t('Metadata results', '元数据结果', 'Metadaten-Ergebnisse')}</span><h3 id="metadata-results-heading">{t('Read the useful part—or audit every tag.', '先看有用的，或者逐个审计所有标签。', 'Lies das Wesentliche – oder prüfe jeden einzelnen Tag.')}</h3></div>
          <div className="report-view-switch" aria-label={t('Metadata view', '元数据视图', 'Metadatenansicht')}><button type="button" aria-pressed={view === 'readable'} onClick={() => { setView('readable'); setSource('all'); }}>{t('Readable', '易读', 'Lesbar')} <b>{report.readableSections.flatMap((section) => section.fields).length}</b></button><button type="button" aria-label={t('All native fields / All fields', '所有原生字段', 'Alle nativen Felder')} aria-pressed={view === 'native'} onClick={() => { setView('native'); setSource('all'); }}>{t('All fields', '所有字段', 'Alle Felder')} <b>{report.nativeSections.flatMap((section) => section.fields).length}</b></button></div>
        </div>
        <div className="report-controls">
          <label><Icon icon={searchIcon} width="17" /><span className="sr-only">{t('Search metadata fields', '搜索元数据字段', 'Metadatenfelder durchsuchen')}</span><input type="search" placeholder={t('Search value, field, path, or source', '搜索值、字段、路径或来源', 'Wert, Feld, Pfad oder Quelle suchen')} value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <label><span>{t('Source', '来源', 'Quelle')}</span><select aria-label={t('Filter by source', '按来源筛选', 'Nach Quelle filtern')} value={source} onChange={(event) => setSource(event.target.value)}><option value="all">{t('All sources', '全部来源', 'Alle Quellen')}</option>{sources.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <strong>{zh ? `找到 ${number(matchingFields.length)} 个` : de ? `${number(matchingFields.length)} gefunden` : `${number(matchingFields.length)} found`}</strong>
        </div>
        <div className="report-ledger-body">
          <nav className="report-chapters" aria-label={t('Report chapters', '报告章节', 'Berichtskapitel')}><span>{t('Loaded chapters', '已加载章节', 'Geladene Kapitel')}</span>{renderedSections.map((section, index) => <a key={section.id} href={`#${section.id}`}><i>{String(index + 1).padStart(2, '0')}</i>{section.title}<b>{section.fields.length}</b></a>)}</nav>
          <div className="report-sections">{renderedSections.map((section, index) => <details id={section.id} key={section.id} className="report-section" open={index === 0 || view === 'readable'}><summary><span><strong>{section.title}</strong><small>{section.note}</small></span><b>{section.fields.length}</b></summary><FieldRows locale={locale} section={section} expanded={expanded} onExpand={(id) => setExpanded((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; })} onCopy={(field) => void copied(field.displayValue, zh ? `${field.label} 已复制` : de ? `${field.label} kopiert` : `${field.label} copied`)} /></details>)}{!filtered.length ? <div className="report-empty"><strong>{t('No matching fields.', '没有匹配字段。', 'Keine passenden Felder.')}</strong><p>{t('Clear the search or switch the source filter.', '清空搜索或更换来源筛选。', 'Suche leeren oder den Quellenfilter ändern.')}</p><button className="report-text-button" type="button" onClick={() => { setQuery(''); setSource('all'); }}>{t('Clear filters', '清除筛选', 'Filter löschen')}</button></div> : null}{renderedCount < matchingFields.length ? <button className="report-load-more" type="button" onClick={() => setRenderLimit((current) => current + FIELD_BATCH)}><b>{t('Load 250 more rows', '再加载 250 行', '250 weitere Zeilen laden')}</b><span>{zh ? `当前已渲染 ${number(renderedCount)} / ${number(matchingFields.length)}` : de ? `${number(renderedCount)} von ${number(matchingFields.length)} derzeit angezeigt` : `${number(renderedCount)} of ${number(matchingFields.length)} currently rendered`}</span></button> : null}</div>
        </div>
      </section>

      <section className="report-evidence">
        <details><summary><span>{zh ? `文件头 · 前 ${report.evidence.headerBytes.length} 字节` : de ? `Dateikopf · erste ${report.evidence.headerBytes.length} Bytes` : `File header · first ${report.evidence.headerBytes.length} bytes`}</span><small>{t('Offset, hexadecimal, and printable ASCII', '偏移、十六进制和可打印 ASCII', 'Offset, Hexadezimalwerte und druckbares ASCII')}</small></summary><HeaderHex bytes={report.evidence.headerBytes} locale={locale} /></details>
        <details open={openRaw} onToggle={(event) => setOpenRaw((event.currentTarget as HTMLDetailsElement).open)}><summary><span>{t('Raw safe JSON', '原始安全 JSON', 'Sicheres Roh-JSON')}</span><small>{t('Binary values are summaries; size and depth caps remain active', '二进制值只显示摘要，大小与深度限制仍然生效', 'Binärwerte werden zusammengefasst; Größen- und Tiefenlimits bleiben aktiv')}</small></summary><pre className="report-raw-json">{openRaw ? JSON.stringify(report.raw, null, 2) : ''}</pre></details>
      </section>

      <footer className="report-export">
        <div><span className="eyebrow">{t('Take the receipt', '把收据带走', 'Beleg mitnehmen')}</span><h3>{t('Complete JSON, readable PDF, or a quick copy.', '完整 JSON、易读 PDF，或者快速复制。', 'Vollständiges JSON, lesbares PDF oder schnell kopieren.')}</h3><p>{exifRunning ? (zh ? `${fullImageScan ? '完整图片' : 'ExifTool'}扫描完成后才能导出，现在仍可复制可见字段。` : de ? `Der Export wird nach dem lokalen ${fullImageScan ? 'Bildscan' : 'ExifTool-Scan'} freigeschaltet. Sichtbare Felder lassen sich schon jetzt kopieren.` : `${fullImageScan ? 'Full image' : 'ExifTool'} exports unlock when the local scan finishes. Copy visible remains available now.`) : t('PDF deliberately trims giant fields. JSON is the complete safe record and never includes file bytes or preview URLs.', 'PDF 会主动缩短超长字段且保持英文；JSON 是完整安全记录，不包含文件字节或预览 URL。', 'PDF und JSON bleiben auf Englisch. Das PDF kürzt sehr lange Felder; JSON ist der vollständige sichere Datensatz ohne Dateibytes oder Vorschau-URLs.')}</p></div>
        <div className="report-export-buttons">
          <button className="button button-ghost" type="button" disabled={exifRunning} onClick={() => void copied(linesFor(allFields), t('All readable and native fields copied', '所有易读与原生字段已复制', 'Alle lesbaren und nativen Felder kopiert'))}><Icon icon={copyIcon} width="16" />{t('Copy all', '复制全部', 'Alle kopieren')}</button>
          <button className="button button-ghost" type="button" disabled={!matchingFields.length} onClick={() => void copied(linesFor(matchingFields), zh ? `${matchingFields.length} 个可见字段已复制` : de ? `${matchingFields.length} sichtbare Felder kopiert` : `${matchingFields.length} visible fields copied`)}><Icon icon={copyIcon} width="16" />{t('Copy visible', '复制可见项', 'Sichtbare kopieren')}</button>
          <button className="button button-secondary" type="button" disabled={exifRunning} onClick={() => downloadJson()}><Icon icon={jsonIcon} width="16" />{t('Complete JSON', '完整 JSON', 'Vollständiges JSON')}</button>
          <button className="button button-secondary" type="button" onClick={() => void downloadPdf()} disabled={exportingPdf || exifRunning}><Icon icon={pdfIcon} width="16" />{exportingPdf ? t('Building PDF…', '正在生成 PDF…', 'PDF wird erstellt…') : t('Readable PDF', '英文易读 PDF', 'Lesbares englisches PDF')}</button>
          <button className="button button-primary" type="button" disabled={exifRunning} onClick={() => downloadJson(true)}><Icon icon={downloadIcon} width="16" />{t('Raw JSON', '原始 JSON', 'Roh-JSON')}</button>
        </div>
      </footer>
    </div> : null}
  </section>;
}
