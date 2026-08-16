import { Icon } from '@iconify/react';
import downloadIcon from '@iconify-icons/lucide/download';
import eraserIcon from '@iconify-icons/lucide/eraser';
import fileIcon from '@iconify-icons/lucide/file-check-2';
import shieldIcon from '@iconify-icons/lucide/shield-check';
import type { NormalizedImageMetadata } from '../../lib/metadata/types';
import type { PrivacyCleanupMode, PrivacyCleanupResult, PrivacyReport } from '../../lib/privacy/types';
import type { ExifToolProgressStage } from '../../workers/exiftool-protocol';
import type { Locale } from '../../i18n/core';
import { localizePath } from '../../i18n/core';
import { localizePrivacyRiskId } from '../../i18n/privacy';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

export function PrivacyCleanupPanel({ report, metadata, mode, pending, baselinePending = false, variant = 'checker', stage, error, result, onMode, onClean, onDownload, onReceipt, locale = 'en' }: {
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
  locale?: Locale;
}) {
  const zh = locale === 'zh-CN';
  const canvasTooLarge = metadata.file.width * metadata.file.height > 40_000_000 || metadata.file.width > 16_384 || metadata.file.height > 16_384;
  const privacyFirstDisabled = metadata.file.animated || canvasTooLarge;
  const integrityFailed = result?.verificationStatus === 'failed';
  return <section className="privacy-cleanup" aria-labelledby="privacy-cleanup-heading" aria-busy={pending}>
    <header><Icon icon={eraserIcon} width="32" /><div><span className="eyebrow">{variant === 'remover' ? (zh ? '清理、验证，再下载' : 'Clean, verify, then download') : (zh ? '当前标签页内完成闭环' : 'Close the loop in this tab')}</span><h2 id="privacy-cleanup-heading">{variant === 'remover' ? (zh ? '选择清理副本需要保留什么。' : 'Choose what the clean copy should preserve.') : (zh ? '做一份更干净的副本，然后再查它一遍。' : 'Make a cleaner copy. Then challenge it again.')}</h2><p>{zh ? <>原文件不会被修改。我们会生成新的 <code>*-clean</code> 文件，用同一套隐私扫描再检查一次，并告诉你还剩什么。</> : <>The original file is never modified. We generate a new <code>*-clean</code> file, run the same privacy scan again, and show what remains.</>}</p></div></header>
    <div className="privacy-cleanup-modes" role="radiogroup" aria-label={zh ? '清理方式' : 'Cleanup method'}>
      <button type="button" role="radio" aria-checked={mode === 'privacy-first'} disabled={privacyFirstDisabled || pending} onClick={() => onMode('privacy-first')}><strong>{zh ? '隐私优先' : 'Privacy-first'}</strong><span>{zh ? '重新编码像素。PNG 保持无损；JPEG 和 WebP 使用 92% 质量，不复制原始元数据。' : 'Re-encode pixels. PNG stays lossless; JPEG and WebP use 92% quality. Original metadata is not copied.'}</span><small>{metadata.file.animated ? (zh ? '不可用：动图会丢失帧。' : 'Disabled: animated images would lose frames.') : canvasTooLarge ? (zh ? '不可用：图片超过 4000 万像素 / 16,384 px 的 Canvas 安全上限。' : 'Disabled: this image exceeds the 40 MP / 16,384 px Canvas safety limit.') : (zh ? '适合「彻底去元数据」比「保持原始编码流」更重要的情况。' : 'Best when stripping metadata matters more than preserving the exact encoded stream.')}</small></button>
      <button type="button" role="radio" aria-checked={mode === 'preserve-encoding'} disabled={pending} onClick={() => onMode('preserve-encoding')}><strong>{zh ? '保留编码' : 'Preserve encoding'}</strong><span>{zh ? 'ExifTool 在删除元数据的同时，尽量保留压缩图像数据、动画、方向、ICC 和色彩空间标签。' : 'ExifTool strips metadata while preserving compressed image data, animation, orientation, ICC, and color-space tags.'}</span><small>{zh ? '保留的色彩配置仍可能包含可识别文字。最终结论以验证结果为准。' : 'Retained color profiles can still contain identifying text. Verification decides what we claim.'}</small></button>
    </div>
    {!result && <div className="privacy-cleanup-run"><div><b>{baselinePending ? (zh ? '清理前先完成源文件全量扫描。' : 'Finishing the full source scan before cleanup.') : report.risks.length ? (zh ? `${report.risks.length.toLocaleString(locale)} 项风险可尝试清理。` : `${report.risks.length} risks are cleanup candidates.`) : (zh ? '0 分不是安全保证。' : 'A zero score is not a safety guarantee.')}</b><span>{pending ? (zh ? `正在本地处理：${stage ?? '准备验证'}…` : `Working locally: ${stage ?? 'preparing verification'}…`) : baselinePending ? (zh ? '前后使用同一套完整扫描，避免分数变化造成误导。' : 'Using the same complete scan before and after prevents misleading score changes.') : (zh ? '清理副本也会跑同一套完整扫描，通过后才标记为已验证。' : 'The clean copy gets the same one-pass full scan before it is marked verified.')}</span></div><button className="button button-primary" type="button" disabled={pending || baselinePending || (privacyFirstDisabled && mode === 'privacy-first')} onClick={onClean}><Icon icon={shieldIcon} width="17" />{pending ? (zh ? '正在清理并验证…' : 'Cleaning and verifying…') : baselinePending ? (zh ? '正在准备完整基线…' : 'Preparing full baseline…') : (zh ? '创建并验证清理副本' : 'Create and verify clean copy')}</button></div>}
    {error && <p className="privacy-cleanup-error" role="alert">{error}</p>}
    {result && <div className={`privacy-cleanup-result status-${result.verificationStatus}`}>
      <div className="privacy-cleanup-verdict"><Icon icon={fileIcon} width="28" /><div><span>{result.verificationStatus === 'verified' ? (zh ? '验证完成' : 'Verification complete') : (zh ? '验证未完成' : 'Verification incomplete')}</span><h3>{result.verificationStatus === 'verified' ? (zh ? '副本已重新扫描，请检查下方仍然存在的风险。' : 'The copy was rescanned. Review any residual risk below.') : (zh ? '副本已生成，但我们不能说它安全。' : 'The copy exists, but we cannot call it safe.')}</h3><p>{result.fileName} · {result.mode === 'privacy-first' && zh ? '隐私优先' : result.mode === 'preserve-encoding' && zh ? '保留编码' : result.mode}</p></div></div>
      <dl><div><dt>{zh ? '分数' : 'Score'}</dt><dd>{result.diff ? `${result.diff.scoreBefore} → ${result.diff.scoreAfter}` : (zh ? '未验证' : 'Not verified')}</dd></div><div><dt>{zh ? '敏感字段' : 'Sensitive fields'}</dt><dd>{result.diff ? `${result.diff.fieldsBefore} → ${result.diff.fieldsAfter}` : (zh ? '未知' : 'Unknown')}</dd></div><div><dt>{zh ? '文件大小' : 'File size'}</dt><dd>{formatBytes(result.beforeSize)} → {formatBytes(result.afterSize)}</dd></div></dl>
      {result.diff && <div className="privacy-cleanup-diff"><p><b>{zh ? '已移除' : 'Removed'}</b><span>{result.diff.removedRiskIds.map((id) => localizePrivacyRiskId(id, locale)).join('、') || (zh ? '未确认移除任何风险类别' : 'No risk categories confirmed removed')}</span></p><p><b>{zh ? '仍存在' : 'Remaining'}</b><span>{result.diff.remainingRiskIds.map((id) => localizePrivacyRiskId(id, locale)).join('、') || (zh ? '未检出受支持的残留风险' : 'No supported residual risks detected')}</span></p><p><b>{zh ? '新出现' : 'New'}</b><span>{result.diff.addedRiskIds.map((id) => localizePrivacyRiskId(id, locale)).join('、') || (zh ? '无' : 'None')}</span></p></div>}
      <div className="privacy-cleanup-checks">{result.outputChecks.map((check) => <p className={`is-${check.status}`} key={check.id}><b>{zh ? ({ signature: '文件签名', dimensions: '显示尺寸', orientation: '图像方向', animation: '动画状态' }[check.id] ?? check.id) : check.id}</b><span>{check.message}</span></p>)}</div>
      {result.warnings.length > 0 && <ul>{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
      <div className="button-row"><button className="button button-primary" type="button" disabled={integrityFailed} onClick={onDownload}><Icon icon={downloadIcon} width="16" />{integrityFailed ? (zh ? '输出无效，已阻止下载' : 'Download blocked: invalid output') : (zh ? '下载清理副本' : 'Download clean copy')}</button><button className="button button-secondary" type="button" onClick={onReceipt}><Icon icon={downloadIcon} width="16" />{zh ? '下载清理收据（英文）' : 'Download cleanup receipt'}</button><button className="button button-ghost" type="button" onClick={onClean}>{zh ? '再清理一次' : 'Run cleanup again'}</button></div>
    </div>}
    <footer>{variant === 'remover' ? (zh ? <>分数只覆盖内嵌元数据，不包括输出文件名或画面像素。<a href={localizePath('/image-privacy-checker/', locale)}>打开完整隐私检查器</a>。</> : <>The score covers embedded metadata, not the output filename or visible pixels. <a href="/image-privacy-checker/">Open the full Privacy Checker</a>.</>) : (zh ? <>只想用一个更简单的单功能流程？<a href={localizePath('/image-metadata-remover/', locale)}>可以用图片元数据清理器</a>。这个检查器会保留更详细的前后证据。</> : <>Need a simpler one-purpose flow? <a href="/image-metadata-remover/">Image Metadata Remover is available</a>. This checker keeps the detailed before/after evidence here.</>)}</footer>
  </section>;
}
