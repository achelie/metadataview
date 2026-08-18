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
  const de = locale === 'de';
  const t = (en: string, zhText: string, deText: string) => zh ? zhText : de ? deText : en;
  const joiner = zh ? '、' : ', ';
  const canvasTooLarge = metadata.file.width * metadata.file.height > 40_000_000 || metadata.file.width > 16_384 || metadata.file.height > 16_384;
  const privacyFirstDisabled = metadata.file.animated || canvasTooLarge;
  const integrityFailed = result?.verificationStatus === 'failed';
  return <section className="privacy-cleanup" aria-labelledby="privacy-cleanup-heading" aria-busy={pending}>
    <header><Icon icon={eraserIcon} width="32" /><div><span className="eyebrow">{variant === 'remover' ? t('Clean, verify, then download', '清理、验证，再下载', 'Bereinigen, prüfen, herunterladen') : t('Close the loop in this tab', '当前标签页内完成闭环', 'Den Kreis in diesem Tab schließen')}</span><h2 id="privacy-cleanup-heading">{variant === 'remover' ? t('Choose what the clean copy should preserve.', '选择清理副本需要保留什么。', 'Wähle, was die bereinigte Kopie behalten soll.') : t('Make a cleaner copy. Then challenge it again.', '做一份更干净的副本，然后再查它一遍。', 'Erstelle eine sauberere Kopie. Dann prüfe sie noch einmal.')}</h2><p>{zh ? <>原文件不会被修改。我们会生成新的 <code>*-clean</code> 文件，用同一套隐私扫描再检查一次，并告诉你还剩什么。</> : de ? <>Das Original wird nie verändert. Wir erzeugen eine neue <code>*-clean</code>-Datei, führen denselben Datenschutzscan erneut aus und zeigen, was übrig bleibt.</> : <>The original file is never modified. We generate a new <code>*-clean</code> file, run the same privacy scan again, and show what remains.</>}</p></div></header>
    <div className="privacy-cleanup-modes" role="radiogroup" aria-label={t('Cleanup method', '清理方式', 'Bereinigungsmethode')}>
      <button type="button" role="radio" aria-checked={mode === 'privacy-first'} disabled={privacyFirstDisabled || pending} onClick={() => onMode('privacy-first')}><strong>{t('Privacy-first', '隐私优先', 'Datenschutz zuerst')}</strong><span>{t('Re-encode pixels. PNG stays lossless; JPEG and WebP use 92% quality. Original metadata is not copied.', '重新编码像素。PNG 保持无损；JPEG 和 WebP 使用 92% 质量，不复制原始元数据。', 'Codiert Pixel neu. PNG bleibt verlustfrei; JPEG und WebP nutzen 92 % Qualität. Ursprüngliche Metadaten werden nicht kopiert.')}</span><small>{metadata.file.animated ? t('Disabled: animated images would lose frames.', '不可用：动图会丢失帧。', 'Deaktiviert: Animierte Bilder würden Frames verlieren.') : canvasTooLarge ? t('Disabled: this image exceeds the 40 MP / 16,384 px Canvas safety limit.', '不可用：图片超过 4000 万像素 / 16,384 px 的 Canvas 安全上限。', 'Deaktiviert: Das Bild überschreitet das Canvas-Limit von 40 MP / 16.384 px.') : t('Best when stripping metadata matters more than preserving the exact encoded stream.', '适合「彻底去元数据」比「保持原始编码流」更重要的情况。', 'Am besten, wenn vollständige Metadatenentfernung wichtiger ist als der exakt gleiche codierte Datenstrom.')}</small></button>
      <button type="button" role="radio" aria-checked={mode === 'preserve-encoding'} disabled={pending} onClick={() => onMode('preserve-encoding')}><strong>{t('Preserve encoding', '保留编码', 'Codierung erhalten')}</strong><span>{t('ExifTool strips metadata while preserving compressed image data, animation, orientation, ICC, and color-space tags.', 'ExifTool 在删除元数据的同时，尽量保留压缩图像数据、动画、方向、ICC 和色彩空间标签。', 'ExifTool entfernt Metadaten und erhält dabei komprimierte Bilddaten, Animation, Ausrichtung, ICC und Farbraum-Tags.')}</span><small>{t('Retained color profiles can still contain identifying text. Verification decides what we claim.', '保留的色彩配置仍可能包含可识别文字。最终结论以验证结果为准。', 'Erhaltene Farbprofile können weiterhin identifizierenden Text enthalten. Die Nachprüfung bestimmt das Ergebnis.')}</small></button>
    </div>
    {!result && <div className="privacy-cleanup-run"><div><b>{baselinePending ? t('Finishing the full source scan before cleanup.', '清理前先完成源文件全量扫描。', 'Der vollständige Quellscan wird vor der Bereinigung beendet.') : report.risks.length ? t(`${report.risks.length} risks are cleanup candidates.`, `${report.risks.length.toLocaleString(locale)} 项风险可尝试清理。`, `${report.risks.length.toLocaleString(locale)} Risiken sind Bereinigungskandidaten.`) : t('A zero score is not a safety guarantee.', '0 分不是安全保证。', 'Ein Wert von null ist keine Sicherheitsgarantie.')}</b><span>{pending ? t(`Working locally: ${stage ?? 'preparing verification'}…`, `正在本地处理：${stage ?? '准备验证'}…`, `Lokale Verarbeitung: ${stage ?? 'Prüfung wird vorbereitet'}…`) : baselinePending ? t('Using the same complete scan before and after prevents misleading score changes.', '前后使用同一套完整扫描，避免分数变化造成误导。', 'Derselbe Vollscan davor und danach verhindert irreführende Wertänderungen.') : t('The clean copy gets the same one-pass full scan before it is marked verified.', '清理副本也会跑同一套完整扫描，通过后才标记为已验证。', 'Auch die bereinigte Kopie erhält denselben Vollscan, bevor sie als verifiziert gilt.')}</span></div><button className="button button-primary" type="button" disabled={pending || baselinePending || (privacyFirstDisabled && mode === 'privacy-first')} onClick={onClean}><Icon icon={shieldIcon} width="17" />{pending ? t('Cleaning and verifying…', '正在清理并验证…', 'Bereinigung und Prüfung…') : baselinePending ? t('Preparing full baseline…', '正在准备完整基线…', 'Vollständige Ausgangsbasis wird erstellt…') : t('Create and verify clean copy', '创建并验证清理副本', 'Bereinigte Kopie erstellen und prüfen')}</button></div>}
    {error && <p className="privacy-cleanup-error" role="alert">{error}</p>}
    {result && <div className={`privacy-cleanup-result status-${result.verificationStatus}`}>
      <div className="privacy-cleanup-verdict"><Icon icon={fileIcon} width="28" /><div><span>{result.verificationStatus === 'verified' ? t('Verification complete', '验证完成', 'Prüfung abgeschlossen') : t('Verification incomplete', '验证未完成', 'Prüfung unvollständig')}</span><h3>{result.verificationStatus === 'verified' ? t('The copy was rescanned. Review any residual risk below.', '副本已重新扫描，请检查下方仍然存在的风险。', 'Die Kopie wurde erneut gescannt. Prüfe unten verbleibende Risiken.') : t('The copy exists, but we cannot call it safe.', '副本已生成，但我们不能说它安全。', 'Die Kopie wurde erstellt, kann aber nicht als sicher bezeichnet werden.')}</h3><p>{result.fileName} · {result.mode === 'privacy-first' ? t('privacy-first', '隐私优先', 'Datenschutz zuerst') : t('preserve-encoding', '保留编码', 'Codierung erhalten')}</p></div></div>
      <dl><div><dt>{t('Score', '分数', 'Wert')}</dt><dd>{result.diff ? `${result.diff.scoreBefore} → ${result.diff.scoreAfter}` : t('Not verified', '未验证', 'Nicht verifiziert')}</dd></div><div><dt>{t('Sensitive fields', '敏感字段', 'Sensible Felder')}</dt><dd>{result.diff ? `${result.diff.fieldsBefore} → ${result.diff.fieldsAfter}` : t('Unknown', '未知', 'Unbekannt')}</dd></div><div><dt>{t('File size', '文件大小', 'Dateigröße')}</dt><dd>{formatBytes(result.beforeSize)} → {formatBytes(result.afterSize)}</dd></div></dl>
      {result.diff && <div className="privacy-cleanup-diff"><p><b>{t('Removed', '已移除', 'Entfernt')}</b><span>{result.diff.removedRiskIds.map((id) => localizePrivacyRiskId(id, locale)).join(joiner) || t('No risk categories confirmed removed', '未确认移除任何风险类别', 'Keine Risikokategorie bestätigt entfernt')}</span></p><p><b>{t('Remaining', '仍存在', 'Verbleibend')}</b><span>{result.diff.remainingRiskIds.map((id) => localizePrivacyRiskId(id, locale)).join(joiner) || t('No supported residual risks detected', '未检出受支持的残留风险', 'Keine unterstützten Restrisiken erkannt')}</span></p><p><b>{t('New', '新出现', 'Neu')}</b><span>{result.diff.addedRiskIds.map((id) => localizePrivacyRiskId(id, locale)).join(joiner) || t('None', '无', 'Keine')}</span></p></div>}
      <div className="privacy-cleanup-checks">{result.outputChecks.map((check) => <p className={`is-${check.status}`} key={check.id}><b>{zh ? ({ signature: '文件签名', dimensions: '显示尺寸', orientation: '图像方向', animation: '动画状态' }[check.id] ?? check.id) : de ? ({ signature: 'Dateisignatur', dimensions: 'Abmessungen', orientation: 'Bildausrichtung', animation: 'Animationsstatus' }[check.id] ?? check.id) : check.id}</b><span>{check.message}</span></p>)}</div>
      {result.warnings.length > 0 && <ul>{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
      <div className="button-row"><button className="button button-primary" type="button" disabled={integrityFailed} onClick={onDownload}><Icon icon={downloadIcon} width="16" />{integrityFailed ? t('Download blocked: invalid output', '输出无效，已阻止下载', 'Download blockiert: ungültige Ausgabe') : t('Download clean copy', '下载清理副本', 'Bereinigte Kopie herunterladen')}</button><button className="button button-secondary" type="button" onClick={onReceipt}><Icon icon={downloadIcon} width="16" />{t('Download cleanup receipt', '下载清理收据（英文）', 'Bereinigungsbeleg herunterladen (Englisch)')}</button><button className="button button-ghost" type="button" onClick={onClean}>{t('Run cleanup again', '再清理一次', 'Bereinigung wiederholen')}</button></div>
    </div>}
    <footer>{variant === 'remover' ? (zh ? <>分数只覆盖内嵌元数据，不包括输出文件名或画面像素。<a href={localizePath('/image-privacy-checker/', locale)}>打开完整隐私检查器</a>。</> : de ? <>Der Wert deckt eingebettete Metadaten ab, nicht Ausgabedateiname oder sichtbare Pixel. <a href={localizePath('/image-privacy-checker/', locale)}>Vollständigen Datenschutz-Check öffnen</a>.</> : <>The score covers embedded metadata, not the output filename or visible pixels. <a href="/image-privacy-checker/">Open the full Privacy Checker</a>.</>) : (zh ? <>只想用一个更简单的单功能流程？<a href={localizePath('/image-metadata-remover/', locale)}>可以用图片元数据清理器</a>。这个检查器会保留更详细的前后证据。</> : de ? <>Brauchst du nur einen einfachen Ablauf? <a href={localizePath('/image-metadata-remover/', locale)}>Nutze den Bild-Metadaten-Entferner</a>. Dieser Check behält hier die ausführlichen Vorher-/Nachher-Nachweise.</> : <>Need a simpler one-purpose flow? <a href="/image-metadata-remover/">Image Metadata Remover is available</a>. This checker keeps the detailed before/after evidence here.</>)}</footer>
  </section>;
}
