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

interface Props {
  formats: string;
  accept: string;
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

function CheckFact({ label, value, note }: { label: string; value: C2paCheckState; note: string }) {
  const icon = value === 'passed' ? checkIcon : value === 'failed' ? failIcon : value === 'not-checked' ? infoIcon : helpIcon;
  return <div className={`c2pa-check is-${value}`}>
    <Icon icon={icon} width="19" aria-hidden="true" />
    <span>{label}<small>{note}</small></span>
    <strong>{stateCopy[value]}</strong>
  </div>;
}

function SafeJsonDetails({ title, note, value, className = '' }: { title: string; note: string; value: unknown; className?: string }) {
  const [open, setOpen] = useState(false);
  return <details className={`c2pa-json-details ${className}`} onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary><span>{title}<small>{note}</small></span><b>{open ? 'Close' : 'Open'}</b></summary>
    {open ? <pre>{JSON.stringify(value, null, 2)}</pre> : null}
  </details>;
}

function ValidationRows({ entries }: { entries: C2paValidationEntry[] }) {
  if (!entries.length) return <div className="c2pa-empty"><strong>No entries in this bucket.</strong><p>The SDK did not return a status code at this severity.</p></div>;
  return <div className="c2pa-validation-list">{entries.map((entry) => <article key={entry.id} className={`is-${entry.severity}`}>
    <span className="c2pa-validation-mark" aria-label={entry.severity === 'success' ? 'Passed' : entry.severity === 'failure' ? 'Failed' : 'Warning'}><Icon icon={entry.severity === 'success' ? checkIcon : entry.severity === 'failure' ? failIcon : warningIcon} width="15" /></span>
    <div><h4>{entry.title}</h4><code>{entry.code}</code><p>{entry.explanation}</p><small>{entry.scope}{entry.url ? ` · ${entry.url}` : ''}</small></div>
    <button type="button" aria-label={`Copy validation code ${entry.code}`} onClick={() => void copyText(entry.code)}><Icon icon={copyIcon} width="15" /></button>
  </article>)}</div>;
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

export default function C2paWorkbench({ formats, accept }: Props) {
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
  const [notice, setNotice] = useState('Waiting for a file');
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
    setFile(null); setReport(null); setBusy(false); setStage(null); setError(null); setNotice('Waiting for a file'); setQuery(''); setSelectedProvenance('file');
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
    setNotice(progressCopy['checking-file']);
    try {
      const result = await client.verify(selected, {
        timeoutMs: 120_000,
        onProgress: (nextStage) => {
          if (runId.current !== currentId) return;
          setStage(nextStage);
          setNotice(progressCopy[nextStage]);
        },
      });
      if (runId.current !== currentId) return;
      setReport(result);
      setNotice(result.status === 'not-found' ? 'Credential check complete · none found' : `Credential check complete · ${result.validationState}`);
    } catch (caught) {
      if (runId.current !== currentId) return;
      if (caught instanceof C2paCancellationError) {
        setNotice('Verification canceled');
        setError('Verification was canceled. Retry this file or choose another one.');
      } else {
        setNotice('Verification stopped safely');
        setError(caught instanceof Error ? caught.message : 'The Content Credentials check could not finish.');
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
    try { await copyText(reportReceipt(report)); setNotice('Verification receipt copied'); }
    catch { setNotice('Clipboard access was blocked by this browser'); }
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

  const verdict = report ? verdictCopy[report.status] : null;
  const active = report?.activeManifest;
  const hasCredential = report ? ['trusted', 'valid', 'invalid'].includes(report.status) : false;
  const honestTitle = report?.status === 'invalid' ? 'Do not rely on invalid manifest claims.'
    : report?.status === 'not-found' ? 'No credential is not a fake-content verdict.'
      : report?.status === 'unsupported' ? 'Unsupported here does not mean invalid elsewhere.'
        : 'A valid signature is evidence, not a truth machine.';

  const selectedIngredient = report?.ingredients.find((item) => item.id === selectedProvenance) ?? null;
  const previewableImage = report ? ['jpeg', 'png', 'webp', 'gif', 'svg', 'avif'].includes(report.file.detectedType) : false;
  const credentialBadge = report?.status === 'trusted' ? 'Trusted'
    : report?.status === 'valid' ? 'Valid with caveats'
      : report?.status === 'invalid' ? 'Invalid'
        : report?.status === 'not-found' ? 'No credential' : 'Unsupported';

  return <section className="workbench c2pa-workbench" aria-busy={busy}>
    <div className="workbench-topline">
      <div className="local-proof"><Icon icon={shieldIcon} width="18" aria-hidden="true" /><span>File bytes stay in this tab.</span></div>
      <span className="status-line" role="status" aria-live="polite"><i className={busy ? 'pulse' : ''} />{notice}</span>
    </div>
    <input ref={input} className="sr-only" type="file" accept={accept} tabIndex={-1} aria-hidden="true" onChange={(event) => pick(event.currentTarget.files)} />

    {!file ? <div ref={chooseButton} className={`c2pa-dropzone ${dragging ? 'is-dragging' : ''}`} role="button" tabIndex={0} aria-label="Choose a file" aria-describedby="c2pa-file-help" onClick={openPicker} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPicker(); } }}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); pick(event.dataTransfer.files); }}>
      <span className="c2pa-drop-mark" aria-hidden="true"><Icon icon={uploadIcon} width="32" /></span>
      <div><span className="eyebrow">Official verifier · local run</span><strong>Drop a file with Content Credentials</strong><p id="c2pa-file-help">{formats} · images and RAW up to 50 MB · everything else up to 100 MB</p><span className="button button-primary c2pa-pick-label" aria-hidden="true">Choose a file</span></div>
      <aside><Icon icon={fingerprintIcon} width="20" /><p><strong>What gets checked?</strong>Signature, file binding, manifest structure, actions, ingredients, and assertions.</p></aside>
    </div> : null}

    {file && !report ? <div className="c2pa-pending">
      <span className="c2pa-pending-mark"><Icon icon={fileSearchIcon} width="28" /></span>
      <div><span className="eyebrow">Local verification</span><h2>{busy ? progressCopy[stage ?? 'checking-file'] : 'No receipt was produced.'}</h2><p><strong>{file.name}</strong> · {formatBytes(file.size)}</p>{error ? <p className="c2pa-error" role="alert">{error}</p> : null}</div>
      <div className="button-row">{busy ? <button className="button button-secondary" type="button" onClick={cancel}><Icon icon={xIcon} width="16" />Cancel</button> : <><button className="button button-primary" type="button" onClick={() => void inspect(file)}><Icon icon={fileSearchIcon} width="16" />Retry</button><button className="button button-secondary" type="button" onClick={openPicker}><Icon icon={replaceIcon} width="16" />Replace</button><button className="button button-ghost" type="button" onClick={() => clear()}><Icon icon={trashIcon} width="16" />Clear</button></>}</div>
    </div> : null}

    {report && verdict ? <div className="c2pa-report">
      <header className="c2pa-report-heading">
        <div><span className="eyebrow">Local verification receipt · schema {report.schemaVersion}</span><h2 ref={resultHeading} tabIndex={-1}>{report.file.name}</h2><p>{report.file.detectedType.toUpperCase()} · {formatBytes(report.file.size)} · checked with {report.engine.name} {report.engine.version}</p></div>
        <div className="button-row"><button className="button button-secondary" type="button" onClick={openPicker}><Icon icon={replaceIcon} width="16" />Replace</button><button className="button button-ghost" type="button" onClick={() => clear()}><Icon icon={trashIcon} width="16" />Clear</button></div>
      </header>

      <div className="c2pa-report-overview">
        <section className="c2pa-asset-card" aria-labelledby="c2pa-asset-title">
          <div className="c2pa-asset-preview">
            {previewableImage && previewUrl && !previewFailed ? <img src={previewUrl} alt={`Preview of ${report.file.name}`} onError={() => setPreviewFailed(true)} onLoad={(event) => setPreviewFacts({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} /> : <span><Icon icon={imageIcon} width="38" /><b>{report.file.detectedType.toUpperCase()}</b></span>}
            <small className={`is-${report.status}`}>{credentialBadge}</small>
          </div>
          <div className="c2pa-asset-copy">
            <div><span className="eyebrow">Inspected asset</span><h3 id="c2pa-asset-title" title={report.file.name}>{report.file.name}</h3><p>{formatBytes(report.file.size)} · {previewFacts ? `${previewFacts.width} × ${previewFacts.height} · ` : ''}{report.file.detectedType.toUpperCase()}</p></div>
            <dl>
              <div><dt>Signed by</dt><dd>{active?.signer ?? 'No signer stated'}</dd></div>
              <div><dt>Issued</dt><dd>{active?.signedAt ?? 'Not stated'}</dd></div>
              <div><dt>Algorithm</dt><dd>{active?.algorithm ?? 'Not stated'}</dd></div>
              <div><dt>Cert status</dt><dd>{report.checks.publisherTrust === 'passed' ? 'Trusted signer' : report.status === 'invalid' ? 'Invalid credential' : hasCredential ? 'Trust not checked' : 'Not applicable'}</dd></div>
              <div><dt>Software</dt><dd>{active?.claimGenerator ?? 'Not stated'}</dd></div>
            </dl>
            <button className="button button-primary c2pa-share-button" type="button" onClick={() => downloadJson(report, sanitizeFilename(report.file.name, '-c2pa-report'))}><Icon icon={shareIcon} width="16" />Create shareable report</button>
            <small className="c2pa-local-export-note">Downloads a local JSON receipt. Nothing is uploaded.</small>
          </div>
        </section>

        <section className={`c2pa-verdict is-${report.status}`} aria-labelledby="c2pa-verdict-title">
          <div className="c2pa-verdict-copy"><span className="c2pa-verdict-mark"><Icon icon={report.status === 'invalid' ? warningIcon : report.status === 'not-found' || report.status === 'unsupported' ? fileSearchIcon : badgeIcon} width="34" /></span><div><span className="eyebrow">{verdict.eyebrow}</span><h3 id="c2pa-verdict-title">{verdict.title}</h3><p>{verdict.body}</p></div></div>
          <div className="c2pa-checks">
            <CheckFact label="File binding" value={report.checks.binding} note="Does the signed hash match these bytes?" />
            <CheckFact label="Claim signature" value={report.checks.signature} note="Did the cryptographic signature validate?" />
            <CheckFact label="Publisher trust" value={report.checks.publisherTrust} note="No external trust list is configured." />
            <CheckFact label="Revocation" value={report.checks.revocation} note="No online OCSP request is made." />
          </div>
        </section>
      </div>

      <section className="c2pa-file-receipt" aria-label="Inspected file receipt">
        <div><span>Detected format</span><strong>{report.file.detectedType.toUpperCase()}</strong><small>{report.file.inspectedMime ?? report.file.mime}</small></div>
        <div><span>Active manifest</span><strong>{report.activeManifestLabel ?? 'None'}</strong><small>{report.manifests.length} manifest{report.manifests.length === 1 ? '' : 's'} in store</small></div>
        <div className="c2pa-hash"><Icon icon={fingerprintIcon} width="19" /><span>SHA-256</span><code>{report.fingerprint?.value ?? 'Not calculated'}</code>{report.fingerprint ? <button type="button" aria-label="Copy SHA-256" onClick={() => void copyText(report.fingerprint!.value)}><Icon icon={copyIcon} width="15" /></button> : null}</div>
      </section>

      {report.warnings.length ? <div className="c2pa-warning-list">{report.warnings.map((warning) => <p key={`${warning.code}-${warning.message}`}><strong>{warning.code}</strong> {warning.message}</p>)}</div> : null}

      <label className="c2pa-search"><Icon icon={searchIcon} width="17" /><span className="sr-only">Search this credential report</span><input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search checks, actions, sources, or assertions" /></label>

      <div className="c2pa-evidence-stack">
        <section className="c2pa-evidence-panel c2pa-validation-panel" aria-labelledby="c2pa-validation-title">
          <header className="c2pa-evidence-heading"><div><span className="eyebrow">Cryptographic checks</span><h3 id="c2pa-validation-title">Validation results</h3><p>{validationPresentation?.total ?? 0} checks · {validationPresentation?.passed ?? 0} passed · {validationPresentation?.warnings ?? 0} warning{validationPresentation?.warnings === 1 ? '' : 's'}{validationPresentation?.failed ? ` · ${validationPresentation.failed} failed` : ''}</p></div><strong>{filteredValidationPresentation.entries.length}</strong></header>
          {filteredValidationPresentation.entries.length ? <ValidationRows entries={filteredValidationPresentation.entries} /> : <div className="c2pa-empty"><strong>{query ? 'No matching validation checks.' : 'No validation checks were returned.'}</strong><p>{report.status === 'not-found' ? 'There is no C2PA manifest to validate in this file.' : 'The safe receipt still records the verifier result.'}</p></div>}
        </section>

        <section className="c2pa-evidence-panel c2pa-actions-panel" aria-labelledby="c2pa-actions-title">
          <header className="c2pa-evidence-heading"><div><span className="eyebrow">Signed history</span><h3 id="c2pa-actions-title">Actions</h3><p>{report.actions.length} entr{report.actions.length === 1 ? 'y' : 'ies'} from the active C2PA actions assertion.</p></div><strong>{filteredActions.length}</strong></header>
          {filteredActions.length ? <div className="c2pa-action-list">{filteredActions.map((action, index) => <article key={action.id}><i>{index + 1}</i><div><strong>{action.label}</strong><code>{action.action}</code></div><div><p>{action.softwareAgent ?? action.description ?? 'No tool was stated.'}</p><small>{[action.when, action.digitalSourceType].filter(Boolean).join(' · ') || 'No timestamp or source type stated.'}</small>{action.details ? <SafeJsonDetails title="Action details" note="Safe structured values" value={action.details} /> : null}</div></article>)}</div> : <div className="c2pa-empty"><strong>{query ? 'No matching actions.' : 'No actions were declared.'}</strong><p>A missing action list does not mean the file was never edited.</p></div>}
        </section>

        <section className="c2pa-evidence-panel c2pa-provenance-panel" aria-labelledby="c2pa-provenance-title">
          <header className="c2pa-evidence-heading"><div><span className="eyebrow">Direct source links</span><h3 id="c2pa-provenance-title">Provenance</h3><p>{report.ingredients.length ? `${report.ingredients.length} direct ingredient${report.ingredients.length === 1 ? '' : 's'} linked to this file.` : 'Current file only · no prior ingredients declared.'}</p></div><Icon icon={routeIcon} width="25" /></header>
          <div className={`c2pa-provenance-flow ${filteredIngredients.length ? 'has-sources' : ''}`}>
            {filteredIngredients.length ? <div className="c2pa-source-nodes">{filteredIngredients.map((ingredient) => <button key={ingredient.id} type="button" className={selectedProvenance === ingredient.id ? 'is-selected' : ''} aria-pressed={selectedProvenance === ingredient.id} onClick={() => setSelectedProvenance(ingredient.id)}><span>Source asset</span><strong>{ingredient.title}</strong><small>{ingredient.format ?? ingredient.relationship ?? 'Format not stated'}</small></button>)}</div> : null}
            <button type="button" className={`c2pa-current-node ${selectedProvenance === 'file' ? 'is-selected' : ''}`} aria-pressed={selectedProvenance === 'file'} onClick={() => setSelectedProvenance('file')}><span>This file · {credentialBadge}</span><strong>{report.file.name}</strong><small>{active?.signer ? `Signed by ${active.signer}` : 'No signer stated'}</small></button>
          </div>
          <div className="c2pa-selected-node"><span className="eyebrow">Selected node</span><div><span className="c2pa-node-thumb"><Icon icon={selectedIngredient ? linkIcon : imageIcon} width="28" /></span><div><small>{selectedIngredient ? 'Source asset' : 'This file'} · {selectedIngredient ? selectedIngredient.relationship ?? 'relationship not stated' : credentialBadge}</small><h4>{selectedIngredient?.title ?? report.file.name}</h4><p>{selectedIngredient ? [selectedIngredient.format, selectedIngredient.instanceId ?? selectedIngredient.documentId].filter(Boolean).join(' · ') || 'No additional source details were stated.' : active?.signer ? `Signed by ${active.signer}` : 'No C2PA signer is attached to this file.'}</p></div></div><p>{report.status === 'invalid' ? 'The active credential is invalid, so treat every provenance claim as diagnostic only.' : report.status === 'not-found' ? 'No Content Credentials were found, so no signed provenance chain is available.' : 'This view shows declared direct links only. It does not invent relationships that are absent from the manifest.'}</p></div>
        </section>

        <section className="c2pa-evidence-panel c2pa-watermark-panel" aria-labelledby="c2pa-watermark-title">
          <header className="c2pa-evidence-heading"><div><span className="eyebrow">Manifest declaration</span><h3 id="c2pa-watermark-title">Embedded watermark</h3><p>{watermarkDeclarations.length} declaration{watermarkDeclarations.length === 1 ? '' : 's'} found in the active manifest.</p></div><Icon icon={wavesIcon} width="25" /></header>
          <p className="c2pa-watermark-note">This verifier reads watermark declarations in Content Credentials. It does not inspect pixels or audio samples to confirm that a watermark signal is present.</p>
          {filteredWatermarks.length ? <div className="c2pa-watermark-list">{filteredWatermarks.map((item) => <div key={item.id}><span>{item.source}</span><strong>{item.label}</strong><code>{item.code}</code></div>)}</div> : <div className="c2pa-empty"><strong>{query ? 'No matching watermark declaration.' : 'No watermark declaration found.'}</strong><p>This result does not prove that the media contains no invisible watermark.</p></div>}
        </section>

        <section className="c2pa-evidence-panel c2pa-technical-panel" aria-labelledby="c2pa-technical-title">
          <header className="c2pa-evidence-heading"><div><span className="eyebrow">Complete evidence</span><h3 id="c2pa-technical-title">Technical details</h3><p>Assertions, manifest history, and the safe normalized JSON receipt.</p></div><strong>{report.assertions.length + report.manifests.length}</strong></header>
          <details><summary><span>Assertions<small>{filteredAssertions.length} safe entries</small></span><b>Open</b></summary>{filteredAssertions.length ? <div className="c2pa-assertion-list">{filteredAssertions.map((assertion) => <SafeJsonDetails key={assertion.id} title={assertion.label} note={`${assertion.kind ?? 'Unknown format'} · ${assertion.created ? 'created by signer' : 'gathered'}`} value={assertion.data} />)}</div> : <div className="c2pa-empty"><strong>No matching assertions.</strong><p>Clear the search to restore the assertion index.</p></div>}</details>
          <details><summary><span>Manifest history<small>{filteredManifests.length} entries</small></span><b>Open</b></summary>{filteredManifests.length ? <div className="c2pa-manifest-list">{filteredManifests.map((manifest, index) => <article key={manifest.label} className={manifest.active ? 'is-active' : undefined}><span>{manifest.active ? 'Active' : `History ${index + 1}`}</span><h4>{manifest.title ?? manifest.label}</h4><code>{manifest.label}</code><dl><div><dt>Generator</dt><dd>{manifest.claimGenerator ?? 'Not stated'}</dd></div><div><dt>Signer</dt><dd>{manifest.signer ?? 'Not stated'}</dd></div><div><dt>Signed</dt><dd>{manifest.signedAt ?? 'Not stated'}</dd></div><div><dt>Contents</dt><dd>{manifest.assertionCount} assertions · {manifest.ingredientCount} ingredients</dd></div></dl></article>)}</div> : <div className="c2pa-empty"><strong>No manifest matches this search.</strong><p>Clear the search to restore the provenance history.</p></div>}</details>
          <SafeJsonDetails className="is-raw" title="Complete safe C2PA report" note="No file bytes, Blob URLs, thumbnails, or worker state" value={report} />
        </section>
      </div>

      <aside className="c2pa-honest-limit"><Icon icon={infoIcon} width="22" /><div><strong>{honestTitle}</strong><p>Content Credentials can show who signed a claim and whether it still binds to this file. They cannot prove that every statement or visible scene is true. This privacy-first verifier also makes no external trust-list or OCSP request.</p></div></aside>

      <footer className="c2pa-export"><div><span className="eyebrow">Portable receipt</span><h3>Keep the result with the file.</h3><p>The JSON contains safe manifest data and status codes, never the source bytes.</p></div><div className="button-row"><button className="button button-secondary" type="button" onClick={() => void copyReceipt()}><Icon icon={copyIcon} width="16" />Copy receipt</button><button className="button button-primary" type="button" onClick={() => downloadJson(report, sanitizeFilename(report.file.name, '-c2pa-report'))}><Icon icon={downloadIcon} width="16" />Download JSON</button></div></footer>
    </div> : null}
  </section>;
}
