import { Icon } from '@iconify/react';
import badgeIcon from '@iconify-icons/lucide/badge-check';
import warningIcon from '@iconify-icons/lucide/shield-alert';
import shieldIcon from '@iconify-icons/lucide/shield-check';
import fingerprintIcon from '@iconify-icons/lucide/fingerprint';
import stampIcon from '@iconify-icons/lucide/stamp';
import linkIcon from '@iconify-icons/lucide/link-2';
import clockIcon from '@iconify-icons/lucide/clock-3';
import wrenchIcon from '@iconify-icons/lucide/wrench';
import layersIcon from '@iconify-icons/lucide/layers-3';
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
import { useEffect, useMemo, useRef, useState } from 'react';
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

type ReportView = 'overview' | 'validation' | 'manifests' | 'raw';

const reportViews: ReportView[] = ['overview', 'validation', 'manifests', 'raw'];

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
    <span>{entry.severity}</span>
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
  const [view, setView] = useState<ReportView>('overview');
  const [query, setQuery] = useState('');

  const openPicker = () => {
    if (!input.current) return;
    input.current.value = '';
    input.current.click();
  };

  const clear = (returnFocus = true) => {
    runId.current += 1;
    verifier.current?.cancel();
    setFile(null); setReport(null); setBusy(false); setStage(null); setError(null); setNotice('Waiting for a file'); setView('overview'); setQuery('');
    if (input.current) input.current.value = '';
    if (returnFocus) window.requestAnimationFrame(() => chooseButton.current?.focus());
  };

  useEffect(() => () => {
    runId.current += 1;
    verifier.current?.dispose();
    verifier.current = null;
  }, []);

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
    setFile(selected); setReport(null); setBusy(true); setStage('checking-file'); setError(null); setView('overview'); setQuery('');
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

  const verdict = report ? verdictCopy[report.status] : null;
  const active = report?.activeManifest;
  const hasCredential = report ? ['trusted', 'valid', 'invalid'].includes(report.status) : false;
  const honestTitle = report?.status === 'invalid' ? 'Do not rely on invalid manifest claims.'
    : report?.status === 'not-found' ? 'No credential is not a fake-content verdict.'
      : report?.status === 'unsupported' ? 'Unsupported here does not mean invalid elsewhere.'
        : 'A valid signature is evidence, not a truth machine.';

  const moveReportTab = (current: ReportView, direction: -1 | 1 | 'first' | 'last') => {
    const currentIndex = reportViews.indexOf(current);
    const nextIndex = direction === 'first' ? 0
      : direction === 'last' ? reportViews.length - 1
        : (currentIndex + direction + reportViews.length) % reportViews.length;
    const nextView = reportViews[nextIndex]!;
    setView(nextView);
    window.requestAnimationFrame(() => document.getElementById(`c2pa-tab-${nextView}`)?.focus());
  };

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
        <div><span className="eyebrow">Verification receipt · schema {report.schemaVersion}</span><h2 ref={resultHeading} tabIndex={-1}>{report.file.name}</h2><p>{report.file.detectedType.toUpperCase()} · {formatBytes(report.file.size)} · checked with {report.engine.name} {report.engine.version}</p></div>
        <div className="button-row"><button className="button button-secondary" type="button" onClick={openPicker}><Icon icon={replaceIcon} width="16" />Replace</button><button className="button button-ghost" type="button" onClick={() => clear()}><Icon icon={trashIcon} width="16" />Clear</button></div>
      </header>

      <section className={`c2pa-verdict is-${report.status}`} aria-labelledby="c2pa-verdict-title">
        <div className="c2pa-verdict-copy"><span className="c2pa-verdict-mark"><Icon icon={report.status === 'invalid' ? warningIcon : report.status === 'not-found' || report.status === 'unsupported' ? fileSearchIcon : badgeIcon} width="34" /></span><div><span className="eyebrow">{verdict.eyebrow}</span><h3 id="c2pa-verdict-title">{verdict.title}</h3><p>{verdict.body}</p></div></div>
        <div className="c2pa-checks">
          <CheckFact label="File binding" value={report.checks.binding} note="Does the signed hash match these bytes?" />
          <CheckFact label="Claim signature" value={report.checks.signature} note="Did the cryptographic signature validate?" />
          <CheckFact label="Publisher trust" value={report.checks.publisherTrust} note="Is the signer on a configured trust list?" />
          <CheckFact label="Revocation" value={report.checks.revocation} note="Was credential revocation established?" />
        </div>
      </section>

      <section className="c2pa-file-receipt" aria-label="Inspected file receipt">
        <div><span>Detected format</span><strong>{report.file.detectedType.toUpperCase()}</strong><small>{report.file.inspectedMime ?? report.file.mime}</small></div>
        <div><span>Active manifest</span><strong>{report.activeManifestLabel ?? 'None'}</strong><small>{report.manifests.length} manifest{report.manifests.length === 1 ? '' : 's'} in store</small></div>
        <div className="c2pa-hash"><Icon icon={fingerprintIcon} width="19" /><span>SHA-256</span><code>{report.fingerprint?.value ?? 'Not calculated'}</code>{report.fingerprint ? <button type="button" aria-label="Copy SHA-256" onClick={() => void copyText(report.fingerprint!.value)}><Icon icon={copyIcon} width="15" /></button> : null}</div>
      </section>

      {report.warnings.length ? <div className="c2pa-warning-list">{report.warnings.map((warning) => <p key={`${warning.code}-${warning.message}`}><strong>{warning.code}</strong> {warning.message}</p>)}</div> : null}

      {hasCredential ? <section className="c2pa-claim-strip" aria-label="Active claim summary">
        <div><Icon icon={stampIcon} width="20" /><span>Signer<strong>{active?.signer ?? 'Not stated'}</strong><small>{active?.issuer ?? 'Issuer not stated'}</small></span></div>
        <div><Icon icon={wrenchIcon} width="20" /><span>Claim generator<strong>{active?.claimGenerator ?? 'Not stated'}</strong><small>{active?.vendor ?? 'Vendor not stated'}</small></span></div>
        <div><Icon icon={clockIcon} width="20" /><span>Signed time<strong>{active?.signedAt ?? 'Not stated'}</strong><small>{active?.algorithm ?? 'Algorithm not stated'}</small></span></div>
        <div><Icon icon={layersIcon} width="20" /><span>Ledger<strong>{report.actions.length} actions · {report.ingredients.length} ingredients</strong><small>{report.assertions.length} assertions</small></span></div>
      </section> : null}

      <section className="c2pa-ledger" aria-labelledby="c2pa-ledger-title">
        <header><div><span className="eyebrow">Credential evidence</span><h3 id="c2pa-ledger-title">Read the claim. Keep the caveat.</h3></div><div className="c2pa-tabs" role="tablist" aria-label="Credential report views">{reportViews.map((item) => <button key={item} id={`c2pa-tab-${item}`} type="button" role="tab" aria-selected={view === item} aria-controls={`c2pa-panel-${item}`} tabIndex={view === item ? 0 : -1} onClick={() => setView(item)} onKeyDown={(event) => {
          if (event.key === 'ArrowRight') { event.preventDefault(); moveReportTab(item, 1); }
          else if (event.key === 'ArrowLeft') { event.preventDefault(); moveReportTab(item, -1); }
          else if (event.key === 'Home') { event.preventDefault(); moveReportTab(item, 'first'); }
          else if (event.key === 'End') { event.preventDefault(); moveReportTab(item, 'last'); }
        }}>{item === 'raw' ? 'Raw JSON' : item[0]!.toUpperCase() + item.slice(1)}</button>)}</div></header>
        {view !== 'raw' ? <label className="c2pa-search"><Icon icon={searchIcon} width="17" /><span className="sr-only">Search this credential report</span><input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Search actions, status codes, ingredients, or assertions" /></label> : null}

        <div className="c2pa-view" id={`c2pa-panel-${view}`} role="tabpanel" aria-labelledby={`c2pa-tab-${view}`} tabIndex={0}>
          {view === 'overview' ? hasCredential ? <>
            <section className="c2pa-section"><header><span>01</span><div><h4>Actions</h4><p>What the claim generator says happened to this asset.</p></div><b>{filteredActions.length}</b></header>{filteredActions.length ? <div className="c2pa-action-list">{filteredActions.map((action, index) => <article key={action.id}><i>{String(index + 1).padStart(2, '0')}</i><div><strong>{action.label}</strong><code>{action.action}</code><p>{[action.when, action.softwareAgent, action.description].filter(Boolean).join(' · ') || 'No extra action details were stated.'}</p>{action.digitalSourceType ? <small>{action.digitalSourceType}</small> : null}{action.details ? <SafeJsonDetails title="Action details" note="Safe structured values" value={action.details} /> : null}</div></article>)}</div> : <div className="c2pa-empty"><strong>No matching actions.</strong><p>The active manifest did not include an action that matches this search.</p></div>}</section>
            <section className="c2pa-section"><header><span>02</span><div><h4>Ingredients</h4><p>Source assets named by the active manifest.</p></div><b>{filteredIngredients.length}</b></header>{filteredIngredients.length ? <div className="c2pa-ingredient-list">{filteredIngredients.map((ingredient) => <article key={ingredient.id}><Icon icon={linkIcon} width="20" /><div><strong>{ingredient.title}</strong><p>{[ingredient.relationship, ingredient.format, ingredient.activeManifest].filter(Boolean).join(' · ') || 'No relationship details stated.'}</p><small>{ingredient.instanceId ?? ingredient.documentId ?? 'No instance identifier'}</small>{ingredient.validation.length ? <details><summary>{ingredient.validation.length} ingredient validation entries</summary><ValidationRows entries={ingredient.validation} /></details> : null}</div></article>)}</div> : <div className="c2pa-empty"><strong>No matching ingredients.</strong><p>This can be normal for a newly created asset.</p></div>}</section>
            <section className="c2pa-section"><header><span>03</span><div><h4>Assertions</h4><p>The complete safe assertion index from the active manifest.</p></div><b>{filteredAssertions.length}</b></header>{filteredAssertions.length ? <div className="c2pa-assertion-list">{filteredAssertions.map((assertion) => <SafeJsonDetails key={assertion.id} title={assertion.label} note={`${assertion.kind ?? 'Unknown format'} · ${assertion.created ? 'created by signer' : 'gathered'}`} value={assertion.data} />)}</div> : <div className="c2pa-empty"><strong>No matching assertions.</strong><p>Clear the search to restore the full assertion index.</p></div>}</section>
          </> : <div className="c2pa-empty is-large"><Icon icon={fileSearchIcon} width="34" /><strong>{report.status === 'not-found' ? 'There is no manifest to unpack.' : 'This format was not sent to the verifier.'}</strong><p>The SHA-256 receipt still identifies the exact local file you checked.</p></div> : null}

          {view === 'validation' ? <div className="c2pa-validation-columns">
            <section><header><span>Failure</span><b>{filteredValidation.failure.length}</b></header><ValidationRows entries={filteredValidation.failure} /></section>
            <section><header><span>Informational</span><b>{filteredValidation.informational.length}</b></header><ValidationRows entries={filteredValidation.informational} /></section>
            <section><header><span>Success</span><b>{filteredValidation.success.length}</b></header><ValidationRows entries={filteredValidation.success} /></section>
          </div> : null}

          {view === 'manifests' ? filteredManifests.length ? <div className="c2pa-manifest-list">{filteredManifests.map((manifest, index) => <article key={manifest.label} className={manifest.active ? 'is-active' : undefined}><span>{manifest.active ? 'Active' : `History ${index + 1}`}</span><h4>{manifest.title ?? manifest.label}</h4><code>{manifest.label}</code><dl><div><dt>Generator</dt><dd>{manifest.claimGenerator ?? 'Not stated'}</dd></div><div><dt>Signer</dt><dd>{manifest.signer ?? 'Not stated'}</dd></div><div><dt>Signed</dt><dd>{manifest.signedAt ?? 'Not stated'}</dd></div><div><dt>Contents</dt><dd>{manifest.assertionCount} assertions · {manifest.ingredientCount} ingredients</dd></div></dl></article>)}</div> : <div className="c2pa-empty is-large"><strong>No manifest matches this search.</strong><p>Clear the search to see the whole provenance chain.</p></div> : null}

          {view === 'raw' ? <SafeJsonDetails className="is-raw" title="Complete safe C2PA report" note="No file bytes, Blob URLs, thumbnails, or worker state" value={report} /> : null}
        </div>
      </section>

      <aside className="c2pa-honest-limit"><Icon icon={infoIcon} width="22" /><div><strong>{honestTitle}</strong><p>Content Credentials can show who signed a claim and whether it still binds to this file. They cannot prove that every statement or visible scene is true. This privacy-first verifier also makes no external trust-list or OCSP request.</p></div></aside>

      <footer className="c2pa-export"><div><span className="eyebrow">Portable receipt</span><h3>Keep the result with the file.</h3><p>The JSON contains safe manifest data and status codes, never the source bytes.</p></div><div className="button-row"><button className="button button-secondary" type="button" onClick={() => void copyReceipt()}><Icon icon={copyIcon} width="16" />Copy receipt</button><button className="button button-primary" type="button" onClick={() => downloadJson(report, sanitizeFilename(report.file.name, '-c2pa-report'))}><Icon icon={downloadIcon} width="16" />Download JSON</button></div></footer>
    </div> : null}
  </section>;
}
