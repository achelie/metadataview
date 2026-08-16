import { Icon } from '@iconify/react';
import badgeIcon from '@iconify-icons/lucide/badge-check';
import warningIcon from '@iconify-icons/lucide/shield-alert';
import shieldIcon from '@iconify-icons/lucide/shield-check';
import fingerprintIcon from '@iconify-icons/lucide/fingerprint';
import linkIcon from '@iconify-icons/lucide/link-2';
import copyIcon from '@iconify-icons/lucide/copy';
import downloadIcon from '@iconify-icons/lucide/download';
import replaceIcon from '@iconify-icons/lucide/replace';
import trashIcon from '@iconify-icons/lucide/trash-2';
import xIcon from '@iconify-icons/lucide/x';
import checkIcon from '@iconify-icons/lucide/check-circle-2';
import failIcon from '@iconify-icons/lucide/x-circle';
import helpIcon from '@iconify-icons/lucide/help-circle';
import infoIcon from '@iconify-icons/lucide/info';
import fileSearchIcon from '@iconify-icons/lucide/file-search';
import uploadIcon from '@iconify-icons/lucide/upload-cloud';
import searchIcon from '@iconify-icons/lucide/search';
import imageIcon from '@iconify-icons/lucide/image';
import shareIcon from '@iconify-icons/lucide/share-2';
import routeIcon from '@iconify-icons/lucide/git-branch';
import wavesIcon from '@iconify-icons/lucide/waves';
import { useEffect, useMemo, useRef, useState } from 'react';
import { collectWatermarkDeclarations, presentC2paValidation } from '../lib/c2pa/presentation';
import { C2paCancellationError, C2paVerifierClient } from '../lib/c2pa/verify';
import type {
  C2paCheckState,
  C2paProgressStage,
  C2paReport,
  C2paValidationEntry,
} from '../lib/c2pa/types';
import { downloadJson, sanitizeFilename } from '../lib/metadata/utils';
import type { Locale } from '../i18n/core';
import { LocaleProvider, useLocale } from '../i18n/react';
import { localizeC2paValidation } from '../i18n/c2pa';

interface Props {
  formats: string;
  accept: string;
  locale?: Locale;
}

type PreviewFacts = { width: number; height: number } | null;

const progressCopy: Record<C2paProgressStage, string> = {
  'checking-file': 'Checking the real file signature',
  'loading-engine': 'Loading the official verifier',
  'reading-credential': 'Reading Content Credentials',
  validating: 'Checking signatures and file bindings',
  'building-report': 'Building a safe local receipt',
};

const verdictCopy = {
  trusted: {
    eyebrow: 'Trusted C2PA state',
    title: 'Trusted credential',
    body: 'The credential is valid and the verifier reports that its signer chains to a configured trust anchor.',
  },
  valid: {
    eyebrow: 'Cryptographic result',
    title: 'Valid credential',
    body: 'The signature and file binding passed. Publisher trust is deliberately shown separately and was not checked against a trust list.',
  },
  invalid: {
    eyebrow: 'Do not trust these claims',
    title: 'Invalid credential',
    body: 'At least one C2PA failure was reported. The file or credential may have changed, so the manifest details below are diagnostic only.',
  },
  'not-found': {
    eyebrow: 'No embedded credential',
    title: 'No Content Credentials',
    body: 'The official verifier found no C2PA manifest in this file. That says nothing by itself about whether the content is authentic or fake.',
  },
  unsupported: {
    eyebrow: 'Format boundary',
    title: 'Not supported here',
    body: 'The file signature is readable, but this production verifier does not accept that format on this page.',
  },
} as const;

const stateCopy: Record<C2paCheckState, string> = {
  passed: 'Passed',
  failed: 'Failed',
  'not-checked': 'Not checked',
  'not-applicable': 'Not applicable',
  unknown: 'Unknown',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const area = document.createElement('textarea');
  area.value = value;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.append(area);
  area.select();
  (Reflect.get(document, 'execCommand') as (command: string) => boolean).call(document, 'copy');
  area.remove();
}

function CheckFact({ label, value, note, locale }: { label: string; value: C2paCheckState; note: string; locale: Locale }) {
  const icon = value === 'passed' ? checkIcon : value === 'failed' ? failIcon : value === 'not-checked' ? infoIcon : helpIcon;
  return <div className={`c2pa-check is-${value}`}>
    <Icon icon={icon} width="19" aria-hidden="true" />
    <span>{label}<small>{note}</small></span>
    <strong>{locale === 'zh-CN' ? ({ passed: '通过', failed: '失败', 'not-checked': '未检查', 'not-applicable': '不适用', unknown: '未知' } as const)[value] : stateCopy[value]}</strong>
  </div>;
}

function SafeJsonDetails({ title, note, value, className = '', locale = 'en' }: { title: string; note: string; value: unknown; className?: string; locale?: Locale }) {
  const [open, setOpen] = useState(false);
  return <details className={`c2pa-json-details ${className}`} onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary><span>{title}<small>{note}</small></span><b>{open ? (locale === 'zh-CN' ? '关闭' : 'Close') : (locale === 'zh-CN' ? '打开' : 'Open')}</b></summary>
    {open ? <pre>{JSON.stringify(value, null, 2)}</pre> : null}
  </details>;
}

function ValidationRows({ entries, locale }: { entries: C2paValidationEntry[]; locale: Locale }) {
  const zh = locale === 'zh-CN';
  if (!entries.length) return <div className="c2pa-empty"><strong>{zh ? '这一组没有条目。' : 'No entries in this bucket.'}</strong><p>{zh ? 'SDK 没有返回这个严重级别的状态码。' : 'The SDK did not return a status code at this severity.'}</p></div>;
  return <div className="c2pa-validation-list">{entries.map((entry) => { const copy = localizeC2paValidation(entry, locale); return <article key={entry.id} className={`is-${entry.severity}`}>
    <span className="c2pa-validation-mark" aria-label={entry.severity === 'success' ? (zh ? '通过' : 'Passed') : entry.severity === 'failure' ? (zh ? '失败' : 'Failed') : (zh ? '警告' : 'Warning')}><Icon icon={entry.severity === 'success' ? checkIcon : entry.severity === 'failure' ? failIcon : warningIcon} width="15" /></span>
    <div><h4>{copy.title}</h4><code>{entry.code}</code><p>{copy.explanation}</p><small>{entry.scope}{entry.url ? ` · ${entry.url}` : ''}</small></div>
    <button type="button" aria-label={zh ? `复制验证码 ${entry.code}` : `Copy validation code ${entry.code}`} onClick={() => void copyText(entry.code)}><Icon icon={copyIcon} width="15" /></button>
  </article>;})}</div>;
}

function reportReceipt(report: C2paReport): string {
  return JSON.stringify({
    schemaVersion: report.schemaVersion,
    generatedAt: report.generatedAt,
    file: { name: report.file.name, size: report.file.size, detectedType: report.file.detectedType },
    sha256: report.fingerprint?.value ?? null,
    result: report.status,
    validationState: report.validationState,
    checks: report.checks,
    activeManifest: report.activeManifest,
    validationCounts: {
      success: report.validation.success.length,
      informational: report.validation.informational.length,
      failure: report.validation.failure.length,
    },
  }, null, 2);
}

export default function C2paWorkbench({ locale = 'en', ...props }: Props) {
  return <LocaleProvider locale={locale}><C2paWorkbenchContent {...props} /></LocaleProvider>;
}

function C2paWorkbenchContent({ formats, accept }: Omit<Props, 'locale'>) {
  const locale = useLocale();
  const zh = locale === 'zh-CN';
  const progress = (current: C2paProgressStage) => zh ? ({ 'checking-file': '正在检查真实文件签名', 'loading-engine': '正在加载官方验证器', 'reading-credential': '正在读取内容凭证', validating: '正在检查签名和文件绑定', 'building-report': '正在生成安全本地收据' } as const)[current] : progressCopy[current];
  const input = useRef<HTMLInputElement>(null);
  const chooseButton = useRef<HTMLDivElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const verifier = useRef<C2paVerifierClient | null>(null);
  const runId = useRef(0);
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<C2paReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState<C2paProgressStage | null>(null);
  const [notice, setNotice] = useState(zh ? '等待选择文件' : 'Waiting for a file');
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [previewFacts, setPreviewFacts] = useState<PreviewFacts>(null);
  const [selectedProvenance, setSelectedProvenance] = useState('file');

  const openPicker = () => {
    if (!input.current) return;
    input.current.value = '';
    input.current.click();
  };

  const clear = (returnFocus = true) => {
    runId.current += 1;
    verifier.current?.cancel();
    setFile(null); setReport(null); setBusy(false); setStage(null); setError(null); setNotice(zh ? '等待选择文件' : 'Waiting for a file'); setQuery(''); setSelectedProvenance('file');
    if (input.current) input.current.value = '';
    if (returnFocus) window.requestAnimationFrame(() => chooseButton.current?.focus());
  };

  useEffect(() => () => {
    runId.current += 1;
    verifier.current?.dispose();
    verifier.current = null;
  }, []);

  useEffect(() => {
    setPreviewFailed(false);
    setPreviewFacts(null);
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

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
  }, [report?.generatedAt]);

  const inspect = async (selected: File) => {
    const currentId = runId.current + 1;
    runId.current = currentId;
    verifier.current?.cancel();
    const client = verifier.current ?? new C2paVerifierClient();
    verifier.current = client;
    setFile(selected); setReport(null); setBusy(true); setStage('checking-file'); setError(null); setQuery(''); setSelectedProvenance('file');
    setNotice(progress('checking-file'));
    try {
      const result = await client.verify(selected, {
        timeoutMs: 120_000,
        onProgress: (nextStage) => {
          if (runId.current !== currentId) return;
          setStage(nextStage);
          setNotice(progress(nextStage));
        },
      });
      if (runId.current !== currentId) return;
      setReport(result);
      setNotice(zh ? (result.status === 'not-found' ? '凭证检查完成 · 没有找到' : `凭证检查完成 · ${result.validationState}`) : result.status === 'not-found' ? 'Credential check complete · none found' : `Credential check complete · ${result.validationState}`);
    } catch (caught) {
      if (runId.current !== currentId) return;
      if (caught instanceof C2paCancellationError) {
        setNotice(zh ? '验证已取消' : 'Verification canceled');
        setError(zh ? '验证已取消。可以重试这个文件，或者换一个。' : 'Verification was canceled. Retry this file or choose another one.');
      } else {
        setNotice(zh ? '验证已安全停止' : 'Verification stopped safely');
        setError(caught instanceof Error ? caught.message : (zh ? '内容凭证检查没能完成。' : 'The Content Credentials check could not finish.'));
      }
    } finally {
      if (runId.current === currentId) { setBusy(false); setStage(null); }
    }
  };

  const pick = (files: FileList | null) => {
    const selected = files?.item(0);
    if (selected) void inspect(selected);
  };

  const cancel = () => {
    verifier.current?.cancel();
  };

  const copyReceipt = async () => {
    if (!report) return;
    try { await copyText(reportReceipt(report)); setNotice(zh ? '验证收据已复制' : 'Verification receipt copied'); }
    catch { setNotice(zh ? '浏览器阻止了剪贴板访问' : 'Clipboard access was blocked by this browser'); }
  };

  const needle = query.trim().toLowerCase();
  const filteredValidation = useMemo(() => report ? {
    failure: report.validation.failure.filter((entry) => !needle || JSON.stringify(entry).toLowerCase().includes(needle)),
    informational: report.validation.informational.filter((entry) => !needle || JSON.stringify(entry).toLowerCase().includes(needle)),
    success: report.validation.success.filter((entry) => !needle || JSON.stringify(entry).toLowerCase().includes(needle)),
  } : { failure: [], informational: [], success: [] }, [report, needle]);
  const filteredActions = useMemo(() => report?.actions.filter((item) => !needle || JSON.stringify(item).toLowerCase().includes(needle)) ?? [], [report, needle]);
  const filteredIngredients = useMemo(() => report?.ingredients.filter((item) => !needle || JSON.stringify(item).toLowerCase().includes(needle)) ?? [], [report, needle]);
  const filteredAssertions = useMemo(() => report?.assertions.filter((item) => !needle || JSON.stringify(item).toLowerCase().includes(needle)) ?? [], [report, needle]);
  const filteredManifests = useMemo(() => report?.manifests.filter((item) => !needle || JSON.stringify(item).toLowerCase().includes(needle)) ?? [], [report, needle]);
  const validationPresentation = useMemo(() => report ? presentC2paValidation(report.validation) : null, [report]);
  const filteredValidationPresentation = useMemo(() => presentC2paValidation(filteredValidation), [filteredValidation]);
  const watermarkDeclarations = useMemo(() => report ? collectWatermarkDeclarations(report.actions, report.assertions) : [], [report]);
  const filteredWatermarks = useMemo(() => watermarkDeclarations.filter((item) => !needle || JSON.stringify(item).toLowerCase().includes(needle)), [watermarkDeclarations, needle]);

  const verdictZh = {
    trusted: { eyebrow: '可信 C2PA 状态', title: '可信凭证', body: '凭证有效，而且验证器报告签名者可连接到已配置的信任锚。' },
    valid: { eyebrow: '加密验证结果', title: '有效凭证', body: '签名和文件绑定通过。发布者信任会单独显示，本页没有通过外部信任列表检查。' },
    invalid: { eyebrow: '不要相信这些声明', title: '无效凭证', body: 'C2PA 至少报告了一项失败。文件或凭证可能被修改，下方清单详情只能用于诊断。' },
    'not-found': { eyebrow: '没有内嵌凭证', title: '没有内容凭证', body: '官方验证器没有在这个文件中找到 C2PA 清单。这本身不能说明内容是真是假。' },
    unsupported: { eyebrow: '格式边界', title: '此处不支持', body: '文件签名可以读取，但当前验证器页面不接受这种格式。' },
  } as const;
  const verdict = report ? (zh ? verdictZh[report.status] : verdictCopy[report.status]) : null;
  const active = report?.activeManifest;
  const hasCredential = report ? ['trusted', 'valid', 'invalid'].includes(report.status) : false;
  const honestTitle = zh ? (report?.status === 'invalid' ? '不要依赖无效清单里的声明。' : report?.status === 'not-found' ? '没有凭证不等于内容造假。' : report?.status === 'unsupported' ? '这里不支持，不代表别处验证会无效。' : '有效签名是证据，不是真相机器。') : report?.status === 'invalid' ? 'Do not rely on invalid manifest claims.'
    : report?.status === 'not-found' ? 'No credential is not a fake-content verdict.'
      : report?.status === 'unsupported' ? 'Unsupported here does not mean invalid elsewhere.'
        : 'A valid signature is evidence, not a truth machine.';

  const selectedIngredient = report?.ingredients.find((item) => item.id === selectedProvenance) ?? null;
  const previewableImage = report ? ['jpeg', 'png', 'webp', 'gif', 'svg', 'avif'].includes(report.file.detectedType) : false;
  const credentialBadge = zh ? (report?.status === 'trusted' ? '可信' : report?.status === 'valid' ? '有效但有边界' : report?.status === 'invalid' ? '无效' : report?.status === 'not-found' ? '无凭证' : '不支持') : report?.status === 'trusted' ? 'Trusted'
    : report?.status === 'valid' ? 'Valid with caveats'
      : report?.status === 'invalid' ? 'Invalid'
        : report?.status === 'not-found' ? 'No credential' : 'Unsupported';

  return <section className="workbench c2pa-workbench" aria-busy={busy}>
    <div className="workbench-topline">
      <div className="local-proof"><Icon icon={shieldIcon} width="18" aria-hidden="true" /><span>{zh ? '文件字节只留在当前标签页。' : 'File bytes stay in this tab.'}</span></div>
      <span className="status-line" role="status" aria-live="polite"><i className={busy ? 'pulse' : ''} />{notice}</span>
    </div>
    <input ref={input} className="sr-only" type="file" accept={accept} tabIndex={-1} aria-hidden="true" onChange={(event) => pick(event.currentTarget.files)} />

    {!file ? <div ref={chooseButton} className={`c2pa-dropzone ${dragging ? 'is-dragging' : ''}`} role="button" tabIndex={0} aria-label={zh ? '选择文件' : 'Choose a file'} aria-describedby="c2pa-file-help" onClick={openPicker} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPicker(); } }}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); pick(event.dataTransfer.files); }}>
      <span className="c2pa-drop-mark" aria-hidden="true"><Icon icon={uploadIcon} width="32" /></span>
      <div><span className="eyebrow">{zh ? '官方验证器 · 本地运行' : 'Official verifier · local run'}</span><strong>{zh ? '把带有内容凭证的文件拖到这里' : 'Drop a file with Content Credentials'}</strong><p id="c2pa-file-help">{formats} · {zh ? '图片与 RAW 最大 50 MB · 其他格式最大 100 MB' : 'images and RAW up to 50 MB · everything else up to 100 MB'}</p><span className="button button-primary c2pa-pick-label" aria-hidden="true">{zh ? '选择文件' : 'Choose a file'}</span></div>
      <aside><Icon icon={fingerprintIcon} width="20" /><p><strong>{zh ? '会检查什么？' : 'What gets checked?'}</strong>{zh ? '签名、文件绑定、清单结构、操作、素材和断言。' : 'Signature, file binding, manifest structure, actions, ingredients, and assertions.'}</p></aside>
    </div> : null}

    {file && !report ? <div className="c2pa-pending">
      <span className="c2pa-pending-mark"><Icon icon={fileSearchIcon} width="28" /></span>
      <div><span className="eyebrow">{zh ? '本地验证' : 'Local verification'}</span><h2>{busy ? progress(stage ?? 'checking-file') : (zh ? '没有生成收据。' : 'No receipt was produced.')}</h2><p><strong>{file.name}</strong> · {formatBytes(file.size)}</p>{error ? <p className="c2pa-error" role="alert">{error}</p> : null}</div>
      <div className="button-row">{busy ? <button className="button button-secondary" type="button" onClick={cancel}><Icon icon={xIcon} width="16" />{zh ? '取消' : 'Cancel'}</button> : <><button className="button button-primary" type="button" onClick={() => void inspect(file)}><Icon icon={fileSearchIcon} width="16" />{zh ? '重试' : 'Retry'}</button><button className="button button-secondary" type="button" onClick={openPicker}><Icon icon={replaceIcon} width="16" />{zh ? '替换' : 'Replace'}</button><button className="button button-ghost" type="button" onClick={() => clear()}><Icon icon={trashIcon} width="16" />{zh ? '清除' : 'Clear'}</button></>}</div>
    </div> : null}

    {report && verdict ? <div className="c2pa-report">
      <header className="c2pa-report-heading">
        <div><span className="eyebrow">{zh ? `本地验证收据 · schema ${report.schemaVersion}` : `Local verification receipt · schema ${report.schemaVersion}`}</span><h2 ref={resultHeading} tabIndex={-1}>{report.file.name}</h2><p>{report.file.detectedType.toUpperCase()} · {formatBytes(report.file.size)} · {zh ? '检查引擎' : 'checked with'} {report.engine.name} {report.engine.version}</p></div>
        <div className="button-row"><button className="button button-secondary" type="button" onClick={openPicker}><Icon icon={replaceIcon} width="16" />{zh ? '替换' : 'Replace'}</button><button className="button button-ghost" type="button" onClick={() => clear()}><Icon icon={trashIcon} width="16" />{zh ? '清除' : 'Clear'}</button></div>
      </header>

      <div className="c2pa-report-overview">
        <section className="c2pa-asset-card" aria-labelledby="c2pa-asset-title">
          <div className="c2pa-asset-preview">
            {previewableImage && previewUrl && !previewFailed ? <img src={previewUrl} alt={zh ? `${report.file.name} 的预览` : `Preview of ${report.file.name}`} onError={() => setPreviewFailed(true)} onLoad={(event) => setPreviewFacts({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} /> : <span><Icon icon={imageIcon} width="38" /><b>{report.file.detectedType.toUpperCase()}</b></span>}
            <small className={`is-${report.status}`}>{credentialBadge}</small>
          </div>
          <div className="c2pa-asset-copy">
            <div><span className="eyebrow">{zh ? '已检查资源' : 'Inspected asset'}</span><h3 id="c2pa-asset-title" title={report.file.name}>{report.file.name}</h3><p>{formatBytes(report.file.size)} · {previewFacts ? `${previewFacts.width} × ${previewFacts.height} · ` : ''}{report.file.detectedType.toUpperCase()}</p></div>
            <dl>
              <div><dt>{zh ? '签名者' : 'Signed by'}</dt><dd>{active?.signer ?? (zh ? '未声明签名者' : 'No signer stated')}</dd></div>
              <div><dt>{zh ? '签发时间' : 'Issued'}</dt><dd>{active?.signedAt ?? (zh ? '未声明' : 'Not stated')}</dd></div>
              <div><dt>{zh ? '算法' : 'Algorithm'}</dt><dd>{active?.algorithm ?? (zh ? '未声明' : 'Not stated')}</dd></div>
              <div><dt>{zh ? '证书状态' : 'Cert status'}</dt><dd>{report.checks.publisherTrust === 'passed' ? (zh ? '可信签名者' : 'Trusted signer') : report.status === 'invalid' ? (zh ? '无效凭证' : 'Invalid credential') : hasCredential ? (zh ? '信任未检查' : 'Trust not checked') : (zh ? '不适用' : 'Not applicable')}</dd></div>
              <div><dt>{zh ? '软件' : 'Software'}</dt><dd>{active?.claimGenerator ?? (zh ? '未声明' : 'Not stated')}</dd></div>
            </dl>
            <button className="button button-primary c2pa-share-button" type="button" onClick={() => downloadJson(report, sanitizeFilename(report.file.name, '-c2pa-report'))}><Icon icon={shareIcon} width="16" />{zh ? '生成可分享的英文报告' : 'Create shareable report'}</button>
            <small className="c2pa-local-export-note">{zh ? '下载本地 JSON 收据，不会上传任何内容。' : 'Downloads a local JSON receipt. Nothing is uploaded.'}</small>
          </div>
        </section>

        <section className={`c2pa-verdict is-${report.status}`} aria-labelledby="c2pa-verdict-title">
          <div className="c2pa-verdict-copy"><span className="c2pa-verdict-mark"><Icon icon={report.status === 'invalid' ? warningIcon : report.status === 'not-found' || report.status === 'unsupported' ? fileSearchIcon : badgeIcon} width="34" /></span><div><span className="eyebrow">{verdict.eyebrow}</span><h3 id="c2pa-verdict-title">{verdict.title}</h3><p>{verdict.body}</p></div></div>
          <div className="c2pa-checks">
            <CheckFact locale={locale} label={zh ? '文件绑定' : 'File binding'} value={report.checks.binding} note={zh ? '签名哈希是否匹配这些文件字节？' : 'Does the signed hash match these bytes?'} />
            <CheckFact locale={locale} label={zh ? '声明签名' : 'Claim signature'} value={report.checks.signature} note={zh ? '加密签名是否验证通过？' : 'Did the cryptographic signature validate?'} />
            <CheckFact locale={locale} label={zh ? '发布者信任' : 'Publisher trust'} value={report.checks.publisherTrust} note={zh ? '未配置外部信任列表。' : 'No external trust list is configured.'} />
            <CheckFact locale={locale} label={zh ? '吊销状态' : 'Revocation'} value={report.checks.revocation} note={zh ? '不会发起在线 OCSP 请求。' : 'No online OCSP request is made.'} />
          </div>
        </section>
      </div>

      <section className="c2pa-file-receipt" aria-label={zh ? '已检查文件收据' : 'Inspected file receipt'}>
        <div><span>{zh ? '检测格式' : 'Detected format'}</span><strong>{report.file.detectedType.toUpperCase()}</strong><small>{report.file.inspectedMime ?? report.file.mime}</small></div>
        <div><span>{zh ? '活动清单' : 'Active manifest'}</span><strong>{report.activeManifestLabel ?? (zh ? '无' : 'None')}</strong><small>{zh ? `存储中有 ${report.manifests.length} 个清单` : `${report.manifests.length} manifest${report.manifests.length === 1 ? '' : 's'} in store`}</small></div>
        <div className="c2pa-hash"><Icon icon={fingerprintIcon} width="19" /><span>SHA-256</span><code>{report.fingerprint?.value ?? (zh ? '未计算' : 'Not calculated')}</code>{report.fingerprint ? <button type="button" aria-label={zh ? '复制 SHA-256' : 'Copy SHA-256'} onClick={() => void copyText(report.fingerprint!.value)}><Icon icon={copyIcon} width="15" /></button> : null}</div>
      </section>

      {report.warnings.length ? <div className="c2pa-warning-list">{report.warnings.map((warning) => <p key={`${warning.code}-${warning.message}`}><strong>{warning.code}</strong> {warning.message}</p>)}</div> : null}

      <label className="c2pa-search"><Icon icon={searchIcon} width="17" /><span className="sr-only">{zh ? '搜索凭证报告' : 'Search this credential report'}</span><input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder={zh ? '搜索检查、操作、来源或断言' : 'Search checks, actions, sources, or assertions'} /></label>

      <div className="c2pa-evidence-stack">
        <section className="c2pa-evidence-panel c2pa-validation-panel" aria-labelledby="c2pa-validation-title">
          <header className="c2pa-evidence-heading"><div><span className="eyebrow">{zh ? '加密检查' : 'Cryptographic checks'}</span><h3 id="c2pa-validation-title">{zh ? '验证结果' : 'Validation results'}</h3><p>{zh ? `${validationPresentation?.total ?? 0} 项检查 · ${validationPresentation?.passed ?? 0} 项通过 · ${validationPresentation?.warnings ?? 0} 条警告${validationPresentation?.failed ? ` · ${validationPresentation.failed} 项失败` : ''}` : `${validationPresentation?.total ?? 0} checks · ${validationPresentation?.passed ?? 0} passed · ${validationPresentation?.warnings ?? 0} warning${validationPresentation?.warnings === 1 ? '' : 's'}${validationPresentation?.failed ? ` · ${validationPresentation.failed} failed` : ''}`}</p></div><strong>{filteredValidationPresentation.entries.length}</strong></header>
          {filteredValidationPresentation.entries.length ? <ValidationRows locale={locale} entries={filteredValidationPresentation.entries} /> : <div className="c2pa-empty"><strong>{query ? (zh ? '没有匹配的验证检查。' : 'No matching validation checks.') : (zh ? '验证器没有返回检查项。' : 'No validation checks were returned.')}</strong><p>{report.status === 'not-found' ? (zh ? '这个文件里没有可验证的 C2PA 清单。' : 'There is no C2PA manifest to validate in this file.') : (zh ? '安全收据仍然记录了验证器结论。' : 'The safe receipt still records the verifier result.')}</p></div>}
        </section>

        <section className="c2pa-evidence-panel c2pa-actions-panel" aria-labelledby="c2pa-actions-title">
          <header className="c2pa-evidence-heading"><div><span className="eyebrow">{zh ? '签名历史' : 'Signed history'}</span><h3 id="c2pa-actions-title">{zh ? '操作记录' : 'Actions'}</h3><p>{zh ? `活动 C2PA 操作断言中有 ${report.actions.length} 条记录。` : `${report.actions.length} entr${report.actions.length === 1 ? 'y' : 'ies'} from the active C2PA actions assertion.`}</p></div><strong>{filteredActions.length}</strong></header>
          {filteredActions.length ? <div className="c2pa-action-list">{filteredActions.map((action, index) => <article key={action.id}><i>{index + 1}</i><div><strong>{action.label}</strong><code>{action.action}</code></div><div><p>{action.softwareAgent ?? action.description ?? (zh ? '未声明工具。' : 'No tool was stated.')}</p><small>{[action.when, action.digitalSourceType].filter(Boolean).join(' · ') || (zh ? '未声明时间或来源类型。' : 'No timestamp or source type stated.')}</small>{action.details ? <SafeJsonDetails locale={locale} title={zh ? '操作详情' : 'Action details'} note={zh ? '安全结构化值' : 'Safe structured values'} value={action.details} /> : null}</div></article>)}</div> : <div className="c2pa-empty"><strong>{query ? (zh ? '没有匹配的操作。' : 'No matching actions.') : (zh ? '没有声明操作。' : 'No actions were declared.')}</strong><p>{zh ? '缺少操作列表，不代表文件从未被编辑。' : 'A missing action list does not mean the file was never edited.'}</p></div>}
        </section>

        <section className="c2pa-evidence-panel c2pa-provenance-panel" aria-labelledby="c2pa-provenance-title">
          <header className="c2pa-evidence-heading"><div><span className="eyebrow">{zh ? '直接来源链接' : 'Direct source links'}</span><h3 id="c2pa-provenance-title">{zh ? '来源关系' : 'Provenance'}</h3><p>{report.ingredients.length ? (zh ? `${report.ingredients.length} 个直接素材链接到当前文件。` : `${report.ingredients.length} direct ingredient${report.ingredients.length === 1 ? '' : 's'} linked to this file.`) : (zh ? '只有当前文件 · 未声明之前的素材' : 'Current file only · no prior ingredients declared.')}</p></div><Icon icon={routeIcon} width="25" /></header>
          <div className={`c2pa-provenance-flow ${filteredIngredients.length ? 'has-sources' : ''}`}>
            {filteredIngredients.length ? <div className="c2pa-source-nodes">{filteredIngredients.map((ingredient) => <button key={ingredient.id} type="button" className={selectedProvenance === ingredient.id ? 'is-selected' : ''} aria-pressed={selectedProvenance === ingredient.id} onClick={() => setSelectedProvenance(ingredient.id)}><span>{zh ? '源素材' : 'Source asset'}</span><strong>{ingredient.title}</strong><small>{ingredient.format ?? ingredient.relationship ?? (zh ? '未声明格式' : 'Format not stated')}</small></button>)}</div> : null}
            <button type="button" className={`c2pa-current-node ${selectedProvenance === 'file' ? 'is-selected' : ''}`} aria-pressed={selectedProvenance === 'file'} onClick={() => setSelectedProvenance('file')}><span>{zh ? '当前文件' : 'This file'} · {credentialBadge}</span><strong>{report.file.name}</strong><small>{active?.signer ? (zh ? `由 ${active.signer} 签署` : `Signed by ${active.signer}`) : (zh ? '未声明签名者' : 'No signer stated')}</small></button>
          </div>
          <div className="c2pa-selected-node"><span className="eyebrow">{zh ? '当前选中节点' : 'Selected node'}</span><div><span className="c2pa-node-thumb"><Icon icon={selectedIngredient ? linkIcon : imageIcon} width="28" /></span><div><small>{selectedIngredient ? (zh ? '源素材' : 'Source asset') : (zh ? '当前文件' : 'This file')} · {selectedIngredient ? selectedIngredient.relationship ?? (zh ? '未声明关系' : 'relationship not stated') : credentialBadge}</small><h4>{selectedIngredient?.title ?? report.file.name}</h4><p>{selectedIngredient ? [selectedIngredient.format, selectedIngredient.instanceId ?? selectedIngredient.documentId].filter(Boolean).join(' · ') || (zh ? '未声明更多来源细节。' : 'No additional source details were stated.') : active?.signer ? (zh ? `由 ${active.signer} 签署` : `Signed by ${active.signer}`) : (zh ? '此文件没有附带 C2PA 签名者。' : 'No C2PA signer is attached to this file.')}</p></div></div><p>{report.status === 'invalid' ? (zh ? '活动凭证无效，所有来源声明都只能当作诊断线索。' : 'The active credential is invalid, so treat every provenance claim as diagnostic only.') : report.status === 'not-found' ? (zh ? '没有找到内容凭证，因此也没有可用的签名来源链。' : 'No Content Credentials were found, so no signed provenance chain is available.') : (zh ? '这里只显示已声明的直接关系，不会编造清单中没有的链接。' : 'This view shows declared direct links only. It does not invent relationships that are absent from the manifest.')}</p></div>
        </section>

        <section className="c2pa-evidence-panel c2pa-watermark-panel" aria-labelledby="c2pa-watermark-title">
          <header className="c2pa-evidence-heading"><div><span className="eyebrow">{zh ? '清单声明' : 'Manifest declaration'}</span><h3 id="c2pa-watermark-title">{zh ? '内嵌水印' : 'Embedded watermark'}</h3><p>{zh ? `活动清单中找到 ${watermarkDeclarations.length} 条声明。` : `${watermarkDeclarations.length} declaration${watermarkDeclarations.length === 1 ? '' : 's'} found in the active manifest.`}</p></div><Icon icon={wavesIcon} width="25" /></header>
          <p className="c2pa-watermark-note">{zh ? '验证器只读取内容凭证中的水印声明，不检查像素或音频样本来确认水印信号是否真实存在。' : 'This verifier reads watermark declarations in Content Credentials. It does not inspect pixels or audio samples to confirm that a watermark signal is present.'}</p>
          {filteredWatermarks.length ? <div className="c2pa-watermark-list">{filteredWatermarks.map((item) => <div key={item.id}><span>{item.source}</span><strong>{item.label}</strong><code>{item.code}</code></div>)}</div> : <div className="c2pa-empty"><strong>{query ? (zh ? '没有匹配的水印声明。' : 'No matching watermark declaration.') : (zh ? '没有找到水印声明。' : 'No watermark declaration found.')}</strong><p>{zh ? '这个结果不能证明媒体里没有不可见水印。' : 'This result does not prove that the media contains no invisible watermark.'}</p></div>}
        </section>

        <section className="c2pa-evidence-panel c2pa-technical-panel" aria-labelledby="c2pa-technical-title">
          <header className="c2pa-evidence-heading"><div><span className="eyebrow">{zh ? '完整证据' : 'Complete evidence'}</span><h3 id="c2pa-technical-title">{zh ? '技术详情' : 'Technical details'}</h3><p>{zh ? '断言、清单历史和安全规范化 JSON 收据。' : 'Assertions, manifest history, and the safe normalized JSON receipt.'}</p></div><strong>{report.assertions.length + report.manifests.length}</strong></header>
          <details><summary><span>{zh ? '断言' : 'Assertions'}<small>{filteredAssertions.length} {zh ? '条安全记录' : 'safe entries'}</small></span><b>{zh ? '打开' : 'Open'}</b></summary>{filteredAssertions.length ? <div className="c2pa-assertion-list">{filteredAssertions.map((assertion) => <SafeJsonDetails locale={locale} key={assertion.id} title={assertion.label} note={`${assertion.kind ?? (zh ? '未知格式' : 'Unknown format')} · ${assertion.created ? (zh ? '由签名者创建' : 'created by signer') : (zh ? '已收集' : 'gathered')}`} value={assertion.data} />)}</div> : <div className="c2pa-empty"><strong>{zh ? '没有匹配的断言。' : 'No matching assertions.'}</strong><p>{zh ? '清空搜索即可恢复断言索引。' : 'Clear the search to restore the assertion index.'}</p></div>}</details>
          <details><summary><span>{zh ? '清单历史' : 'Manifest history'}<small>{filteredManifests.length} {zh ? '条记录' : 'entries'}</small></span><b>{zh ? '打开' : 'Open'}</b></summary>{filteredManifests.length ? <div className="c2pa-manifest-list">{filteredManifests.map((manifest, index) => <article key={manifest.label} className={manifest.active ? 'is-active' : undefined}><span>{manifest.active ? (zh ? '活动清单' : 'Active') : (zh ? `历史 ${index + 1}` : `History ${index + 1}`)}</span><h4>{manifest.title ?? manifest.label}</h4><code>{manifest.label}</code><dl><div><dt>{zh ? '生成器' : 'Generator'}</dt><dd>{manifest.claimGenerator ?? (zh ? '未声明' : 'Not stated')}</dd></div><div><dt>{zh ? '签名者' : 'Signer'}</dt><dd>{manifest.signer ?? (zh ? '未声明' : 'Not stated')}</dd></div><div><dt>{zh ? '签发时间' : 'Signed'}</dt><dd>{manifest.signedAt ?? (zh ? '未声明' : 'Not stated')}</dd></div><div><dt>{zh ? '内容' : 'Contents'}</dt><dd>{manifest.assertionCount} {zh ? '条断言' : 'assertions'} · {manifest.ingredientCount} {zh ? '个素材' : 'ingredients'}</dd></div></dl></article>)}</div> : <div className="c2pa-empty"><strong>{zh ? '没有清单匹配当前搜索。' : 'No manifest matches this search.'}</strong><p>{zh ? '清空搜索即可恢复来源历史。' : 'Clear the search to restore the provenance history.'}</p></div>}</details>
          <SafeJsonDetails locale={locale} className="is-raw" title={zh ? '完整安全 C2PA 报告' : 'Complete safe C2PA report'} note={zh ? '不含文件字节、Blob URL、缩略图或 Worker 状态' : 'No file bytes, Blob URLs, thumbnails, or worker state'} value={report} />
        </section>
      </div>

      <aside className="c2pa-honest-limit"><Icon icon={infoIcon} width="22" /><div><strong>{honestTitle}</strong><p>{zh ? '内容凭证能显示谁签署了声明，以及它是否仍绑定当前文件；它不能证明每段话或画面都是真的。这个隐私优先的验证器也不会请求外部信任列表或 OCSP。' : 'Content Credentials can show who signed a claim and whether it still binds to this file. They cannot prove that every statement or visible scene is true. This privacy-first verifier also makes no external trust-list or OCSP request.'}</p></div></aside>

      <footer className="c2pa-export"><div><span className="eyebrow">{zh ? '可携带收据' : 'Portable receipt'}</span><h3>{zh ? '把结果和文件放在一起。' : 'Keep the result with the file.'}</h3><p>{zh ? 'JSON 保持英文 schema，包含安全清单数据和状态码，不包含源文件字节。' : 'The JSON contains safe manifest data and status codes, never the source bytes.'}</p></div><div className="button-row"><button className="button button-secondary" type="button" onClick={() => void copyReceipt()}><Icon icon={copyIcon} width="16" />{zh ? '复制英文收据' : 'Copy receipt'}</button><button className="button button-primary" type="button" onClick={() => downloadJson(report, sanitizeFilename(report.file.name, '-c2pa-report'))}><Icon icon={downloadIcon} width="16" />{zh ? '下载 JSON' : 'Download JSON'}</button></div></footer>
    </div> : null}
  </section>;
}
