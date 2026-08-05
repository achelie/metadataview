import { Icon } from '@iconify/react';
import downloadIcon from '@iconify-icons/lucide/download';
import eraserIcon from '@iconify-icons/lucide/eraser';
import fileIcon from '@iconify-icons/lucide/file-check-2';
import shieldIcon from '@iconify-icons/lucide/shield-check';
import type { NormalizedImageMetadata } from '../../lib/metadata/types';
import type { PrivacyCleanupMode, PrivacyCleanupResult, PrivacyReport } from '../../lib/privacy/types';
import type { ExifToolProgressStage } from '../../workers/exiftool-protocol';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

export function PrivacyCleanupPanel({ report, metadata, mode, pending, baselinePending = false, variant = 'checker', stage, error, result, onMode, onClean, onDownload, onReceipt }: {
  report: PrivacyReport;
  metadata: NormalizedImageMetadata;
  mode: PrivacyCleanupMode;
  pending: boolean;
  baselinePending?: boolean;
  variant?: 'checker' | 'remover';
  stage: string | ExifToolProgressStage | null;
  error: string | null;
  result: PrivacyCleanupResult | null;
  onMode: (mode: PrivacyCleanupMode) => void;
  onClean: () => void;
  onDownload: () => void;
  onReceipt: () => void;
}) {
  const canvasTooLarge = metadata.file.width * metadata.file.height > 40_000_000 || metadata.file.width > 16_384 || metadata.file.height > 16_384;
  const privacyFirstDisabled = metadata.file.animated || canvasTooLarge;
  const integrityFailed = result?.verificationStatus === 'failed';
  return <section className="privacy-cleanup" aria-labelledby="privacy-cleanup-heading" aria-busy={pending}>
    <header><Icon icon={eraserIcon} width="32" /><div><span className="eyebrow">{variant === 'remover' ? 'Clean, verify, then download' : 'Close the loop in this tab'}</span><h2 id="privacy-cleanup-heading">{variant === 'remover' ? 'Choose what the clean copy should preserve.' : 'Make a cleaner copy. Then challenge it again.'}</h2><p>The original file is never modified. We generate a new <code>*-clean</code> file, run the same privacy scan again, and show what remains.</p></div></header>
    <div className="privacy-cleanup-modes" role="radiogroup" aria-label="Cleanup method">
      <button type="button" role="radio" aria-checked={mode === 'privacy-first'} disabled={privacyFirstDisabled || pending} onClick={() => onMode('privacy-first')}><strong>Privacy-first</strong><span>Re-encode pixels. PNG stays lossless; JPEG and WebP use 92% quality. Original metadata is not copied.</span><small>{metadata.file.animated ? 'Disabled: animated images would lose frames.' : canvasTooLarge ? 'Disabled: this image exceeds the 40 MP / 16,384 px Canvas safety limit.' : 'Best when stripping metadata matters more than preserving the exact encoded stream.'}</small></button>
      <button type="button" role="radio" aria-checked={mode === 'preserve-encoding'} disabled={pending} onClick={() => onMode('preserve-encoding')}><strong>Preserve encoding</strong><span>ExifTool strips metadata while preserving compressed image data, animation, orientation, ICC, and color-space tags.</span><small>Retained color profiles can still contain identifying text. Verification decides what we claim.</small></button>
    </div>
    {!result && <div className="privacy-cleanup-run"><div><b>{baselinePending ? 'Finishing the Standard baseline before cleanup.' : report.risks.length ? `${report.risks.length} risks are cleanup candidates.` : 'A zero score is not a safety guarantee.'}</b><span>{pending ? `Working locally: ${stage ?? 'preparing verification'}…` : baselinePending ? 'Using one scoring policy before and after prevents misleading score changes.' : 'The clean copy is rescanned to the same completed depth before it is marked verified.'}</span></div><button className="button button-primary" type="button" disabled={pending || baselinePending || (privacyFirstDisabled && mode === 'privacy-first')} onClick={onClean}><Icon icon={shieldIcon} width="17" />{pending ? 'Cleaning and verifying…' : baselinePending ? 'Preparing full baseline…' : 'Create and verify clean copy'}</button></div>}
    {error && <p className="privacy-cleanup-error" role="alert">{error}</p>}
    {result && <div className={`privacy-cleanup-result status-${result.verificationStatus}`}>
      <div className="privacy-cleanup-verdict"><Icon icon={fileIcon} width="28" /><div><span>{result.verificationStatus === 'verified' ? 'Verification complete' : 'Verification incomplete'}</span><h3>{result.verificationStatus === 'verified' ? 'The copy was rescanned. Review any residual risk below.' : 'The copy exists, but we cannot call it safe.'}</h3><p>{result.fileName} · {result.mode}</p></div></div>
      <dl><div><dt>Score</dt><dd>{result.diff ? `${result.diff.scoreBefore} → ${result.diff.scoreAfter}` : 'Not verified'}</dd></div><div><dt>Sensitive fields</dt><dd>{result.diff ? `${result.diff.fieldsBefore} → ${result.diff.fieldsAfter}` : 'Unknown'}</dd></div><div><dt>File size</dt><dd>{formatBytes(result.beforeSize)} → {formatBytes(result.afterSize)}</dd></div></dl>
      {result.diff && <div className="privacy-cleanup-diff"><p><b>Removed</b><span>{result.diff.removedRiskIds.join(', ') || 'No risk categories confirmed removed'}</span></p><p><b>Remaining</b><span>{result.diff.remainingRiskIds.join(', ') || 'No supported residual risks detected'}</span></p><p><b>New</b><span>{result.diff.addedRiskIds.join(', ') || 'None'}</span></p></div>}
      <div className="privacy-cleanup-checks">{result.outputChecks.map((check) => <p className={`is-${check.status}`} key={check.id}><b>{check.id}</b><span>{check.message}</span></p>)}</div>
      {result.warnings.length > 0 && <ul>{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
      <div className="button-row"><button className="button button-primary" type="button" disabled={integrityFailed} onClick={onDownload}><Icon icon={downloadIcon} width="16" />{integrityFailed ? 'Download blocked: invalid output' : 'Download clean copy'}</button><button className="button button-secondary" type="button" onClick={onReceipt}><Icon icon={downloadIcon} width="16" />Download cleanup receipt</button><button className="button button-ghost" type="button" onClick={onClean}>Run cleanup again</button></div>
    </div>}
    <footer>{variant === 'remover' ? <>The score covers embedded metadata, not the output filename or visible pixels. <a href="/image-privacy-checker">Open the full Privacy Checker</a>.</> : <>Need a simpler one-purpose flow? <a href="/metadata-remover">Metadata Remover is still available</a>. This checker keeps the detailed before/after evidence here.</>}</footer>
  </section>;
}
