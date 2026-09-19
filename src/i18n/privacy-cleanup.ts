import type { Locale } from './core';
import type { PrivacyCleanupOutputCheck } from '../lib/privacy/types';

const messages = {
  riskScore: ['Privacy risk score', '隐私风险分数', 'Datenschutz-Risikowert', 'Score de risque pour la confidentialité'],
  lowerIsBetter: ['Lower is better. This score covers supported metadata only.', '越低越好。分数只涵盖支持检查的元数据。', 'Niedriger ist besser. Der Wert erfasst nur unterstützte Metadaten.', 'Plus le score est bas, mieux c’est. Il couvre seulement les métadonnées prises en charge.'],
  cleanupCandidates: ['{count} risks are cleanup candidates.', '{count} 项风险可尝试清理。', '{count} Risiken können möglicherweise entfernt werden.', '{count} risque(s) peuvent être supprimés.'],
  workingStage: ['Working locally: {stage}…', '正在本地处理：{stage}…', 'Lokale Verarbeitung: {stage}…', 'Traitement local : {stage}…'],
  resultActions: ['Download actions', '下载操作', 'Download-Aktionen', 'Actions de téléchargement'],
  reportActions: ['Report actions', '报告操作', 'Berichtsaktionen', 'Actions du rapport'],
  verificationDetails: ['Review changes and verification details', '查看变更和验证详情', 'Änderungen und Prüfergebnisse ansehen', 'Voir les modifications et les contrôles'],
  verifiedClear: ['Full scan complete · no supported risks detected', '完整扫描完成 · 未检出支持检查的风险', 'Vollscan abgeschlossen · keine unterstützten Risiken erkannt', 'Analyse complète terminée · aucun risque pris en charge détecté'],
  verifiedResidual: ['Full scan complete · risks remain', '完整扫描完成 · 仍有风险', 'Vollscan abgeschlossen · Risiken verbleiben', 'Analyse complète terminée · des risques subsistent'],
  verificationIncomplete: ['Verification incomplete', '验证未完成', 'Prüfung unvollständig', 'Vérification inachevée'],
  verificationFailed: ['Output check failed · download blocked', '输出检查失败 · 已阻止下载', 'Ausgabeprüfung fehlgeschlagen · Download gesperrt', 'Contrôle de sortie échoué · téléchargement bloqué'],
  clearLimit: ['No supported metadata risks were detected. This does not make the image anonymous.', '未检出支持检查的元数据风险，这不代表图片已匿名。', 'Keine unterstützten Metadatenrisiken erkannt. Das macht das Bild nicht anonym.', 'Aucun risque de métadonnées pris en charge détecté. L’image n’est pas pour autant anonyme.'],
  residualLimit: ['Review the remaining and newly detected risks before sharing this copy.', '分享副本前，请检查仍存在和新检出的风险。', 'Prüfe verbleibende und neu erkannte Risiken, bevor du diese Kopie teilst.', 'Examinez les risques restants et nouvellement détectés avant de partager cette copie.'],
  incompleteLimit: ['The copy exists, but the full verification did not finish. Its remaining risks may be unknown.', '副本已生成，但完整验证未完成，可能仍有未知风险。', 'Die Kopie wurde erstellt, aber die vollständige Prüfung ist nicht abgeschlossen. Weitere Risiken können unbekannt sein.', 'La copie existe, mais la vérification complète n’a pas abouti. Certains risques peuvent rester inconnus.'],
  failedLimit: ['The output did not pass its checks. Keep the original and try another cleanup method.', '输出未通过检查。请保留原文件，并尝试其他清理方式。', 'Die Ausgabe hat ihre Prüfungen nicht bestanden. Behalte das Original und versuche eine andere Methode.', 'La sortie n’a pas passé les contrôles. Conservez l’original et essayez une autre méthode.'],
  remainingRisks: ['Remaining risks: {count}', '仍存在的风险：{count}', 'Verbleibende Risiken: {count}', 'Risques restants : {count}'],
  addedRisks: ['Newly detected risks: {count}', '新检出的风险：{count}', 'Neu erkannte Risiken: {count}', 'Risques nouvellement détectés : {count}'],
  observedRemainingRisks: ['Remaining risks detected so far: {count}', '目前检出的仍存风险：{count}', 'Bisher erkannte verbleibende Risiken: {count}', 'Risques restants détectés à ce stade : {count}'],
  observedAddedRisks: ['New risks detected so far: {count}', '目前新检出的风险：{count}', 'Bisher neu erkannte Risiken: {count}', 'Nouveaux risques détectés à ce stade : {count}'],
  risksRemain: ['{count} risks remain in this processed copy.', '处理后的副本仍有 {count} 项风险。', 'Diese bearbeitete Kopie enthält noch {count} Risiken.', 'Cette copie traitée contient encore {count} risque(s).'],
  unknownRemaining: ['Remaining risks: unknown', '仍存在的风险：未知', 'Verbleibende Risiken: unbekannt', 'Risques restants : inconnus'],
  downloadProcessed: ['Download processed copy', '下载处理后的副本', 'Bearbeitete Kopie herunterladen', 'Télécharger la copie traitée'],
  scanNote: ['Scan note', '扫描提示', 'Scan-Hinweis', 'Note d’analyse'],
  originalDiagnostic: ['Original diagnostic', '原始诊断信息', 'Originaldiagnose', 'Diagnostic d’origine'],
  changeMethod: ['Change cleanup method', '更换清理方式', 'Bereinigungsmethode ändern', 'Changer de méthode de nettoyage'],
  moreActions: ['More actions', '更多操作', 'Weitere Aktionen', 'Autres actions'],
  preparing: ['Preparing verification', '准备验证', 'Prüfung vorbereiten', 'Préparation de la vérification'],
  pixels: ['Re-encoding pixels', '重新编码像素', 'Pixel neu codieren', 'Réencodage des pixels'],
  loading: ['Loading the local engine', '加载本地引擎', 'Lokale Engine laden', 'Chargement du moteur local'],
  extracting: ['Reading metadata', '读取元数据', 'Metadaten lesen', 'Lecture des métadonnées'],
  building: ['Building the report', '整理报告', 'Bericht erstellen', 'Création du rapport'],
  scoring: ['Checking privacy risks', '检查隐私风险', 'Datenschutzrisiken prüfen', 'Évaluation des risques de confidentialité'],
  cleaning: ['Removing metadata', '移除元数据', 'Metadaten entfernen', 'Suppression des métadonnées'],
  structure: ['Checking output structure', '检查输出结构', 'Ausgabestruktur prüfen', 'Contrôle de la structure de sortie'],
  verifying: ['Running full verification', '执行完整验证', 'Vollständige Prüfung ausführen', 'Vérification complète'],
  signature: ['File signature', '文件签名', 'Dateisignatur', 'Signature du fichier'],
  dimensions: ['Display dimensions', '显示尺寸', 'Anzeigeabmessungen', 'Dimensions d’affichage'],
  orientation: ['Image orientation', '图像方向', 'Bildausrichtung', 'Orientation de l’image'],
  animation: ['Animation', '动画', 'Animation', 'Animation'],
  signaturePassed: ['Output signature is {value}.', '输出文件签名为 {value}。', 'Die Ausgabesignatur ist {value}.', 'La signature de sortie est {value}.'],
  signatureFailed: ['Output signature changed from {before} to {after}.', '输出文件签名从 {before} 变为 {after}。', 'Die Ausgabesignatur änderte sich von {before} zu {after}.', 'La signature de sortie est passée de {before} à {after}.'],
  dimensionsPassed: ['Display dimensions remain {value}.', '显示尺寸仍为 {value}。', 'Die Anzeigeabmessungen bleiben {value}.', 'Les dimensions d’affichage restent {value}.'],
  dimensionsFailed: ['Display dimensions changed from {before} to {after}.', '显示尺寸从 {before} 变为 {after}。', 'Die Anzeigeabmessungen änderten sich von {before} zu {after}.', 'Les dimensions d’affichage sont passées de {before} à {after}.'],
  orientationPassed: ['Orientation remains {value}.', '方向标记仍为 {value}。', 'Die Ausrichtung bleibt {value}.', 'L’orientation reste {value}.'],
  orientationFailed: ['Orientation changed from {before} to {after}.', '方向标记从 {before} 变为 {after}。', 'Die Ausrichtung änderte sich von {before} zu {after}.', 'L’orientation est passée de {before} à {after}.'],
  orientationApplied: ['Orientation was applied to pixels and no rotation tag remains.', '方向已应用到像素，不再保留旋转标记。', 'Die Ausrichtung wurde auf die Pixel angewandt; kein Drehungs-Tag bleibt zurück.', 'L’orientation a été appliquée aux pixels ; aucune balise de rotation ne subsiste.'],
  orientationRetained: ['The re-encoded copy still declares Orientation {value}.', '重新编码的副本仍声明方向标记 {value}。', 'Die neu codierte Kopie enthält weiterhin die Ausrichtung {value}.', 'La copie réencodée déclare encore l’orientation {value}.'],
  unset: ['unset', '未设置', 'nicht gesetzt', 'non définie'],
  animationPassed: ['Animation remains present in the cleaned copy.', '清理副本仍保留动画。', 'Die bereinigte Kopie enthält weiterhin die Animation.', 'L’animation est conservée dans la copie nettoyée.'],
  animationFailed: ['The cleaned copy lost its animation.', '清理副本丢失了动画。', 'Die bereinigte Kopie hat ihre Animation verloren.', 'La copie nettoyée a perdu son animation.'],
  staticImage: ['The source is a static image.', '原文件是静态图片。', 'Die Quelle ist ein statisches Bild.', 'La source est une image fixe.'],
  checkPassed: ['This output check passed.', '此项输出检查通过。', 'Diese Ausgabeprüfung wurde bestanden.', 'Ce contrôle de sortie a réussi.'],
  checkFailed: ['This output check failed.', '此项输出检查失败。', 'Diese Ausgabeprüfung ist fehlgeschlagen.', 'Ce contrôle de sortie a échoué.'],
  reencodedWarning: ['Pixels were re-encoded and original metadata containers were not copied.', '像素已重新编码，原始元数据容器没有复制到副本。', 'Die Pixel wurden neu codiert; ursprüngliche Metadatencontainer wurden nicht kopiert.', 'Les pixels ont été réencodés et les conteneurs de métadonnées d’origine n’ont pas été copiés.'],
  retainedWarning: ['Orientation and ICC color profile were intentionally retained. Some formats may keep structural fields, so verification is required.', '已保留方向和 ICC 色彩配置。部分格式可能保留结构字段，因此仍需验证。', 'Ausrichtung und ICC-Farbprofil wurden bewusst erhalten. Manche Formate behalten Strukturfelder; deshalb ist eine Nachprüfung nötig.', 'L’orientation et le profil ICC ont été conservés. Certains formats peuvent garder des champs structurels ; une vérification reste nécessaire.'],
  failedWarning: ['Output integrity checks failed. Download is blocked.', '输出完整性检查失败，下载已阻止。', 'Die Integritätsprüfung der Ausgabe ist fehlgeschlagen. Der Download ist gesperrt.', 'L’intégrité de la sortie n’a pas été vérifiée. Le téléchargement est bloqué.'],
  incompleteWarning: ['Verification did not complete a full scan for both files. Do not describe this copy as safe.', '未完成两个文件的完整扫描，不能将此副本称为安全。', 'Der Vollscan beider Dateien wurde nicht abgeschlossen. Diese Kopie darf nicht als sicher bezeichnet werden.', 'L’analyse complète des deux fichiers n’a pas abouti. Cette copie ne peut pas être déclarée sûre.'],
  canceled: ['The local task was canceled. You can retry it.', '本地任务已取消，可以重试。', 'Die lokale Aufgabe wurde abgebrochen. Du kannst sie erneut starten.', 'La tâche locale a été annulée. Vous pouvez réessayer.'],
  timeout: ['The local task exceeded its time limit. Retry or choose a smaller image.', '本地任务超时。请重试，或选择更小的图片。', 'Die lokale Aufgabe hat ihr Zeitlimit erreicht. Versuche es erneut oder wähle ein kleineres Bild.', 'La tâche locale a dépassé son délai. Réessayez ou choisissez une image plus petite.'],
  engineUnavailable: ['The local engine could not load. Check your connection and retry.', '本地引擎未能加载。请检查网络连接后重试。', 'Die lokale Engine konnte nicht geladen werden. Prüfe die Verbindung und versuche es erneut.', 'Le moteur local n’a pas pu se charger. Vérifiez la connexion et réessayez.'],
  unknownWarning: ['The scan returned an additional diagnostic. Review the original details.', '扫描返回了额外诊断信息，可展开查看原文。', 'Der Scan lieferte eine zusätzliche Diagnose. Sieh dir die Originaldetails an.', 'L’analyse a renvoyé un diagnostic supplémentaire. Consultez les détails d’origine.'],
  unknownError: ['The local task could not finish. Retry or choose another image.', '本地任务未能完成。请重试或选择其他图片。', 'Die lokale Aufgabe konnte nicht abgeschlossen werden. Versuche es erneut oder wähle ein anderes Bild.', 'La tâche locale n’a pas abouti. Réessayez ou choisissez une autre image.'],
} as const;

type MessageKey = keyof typeof messages;
const localeIndex: Record<Locale, 0 | 1 | 2 | 3> = { en: 0, 'zh-CN': 1, de: 2, fr: 3 };

export function privacyCleanupText(locale: Locale, key: MessageKey, params: Record<string, string | number> = {}): string {
  return messages[key][localeIndex[locale]].replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = params[name];
    return value === undefined ? placeholder : typeof value === 'number' ? value.toLocaleString(locale) : value;
  });
}

const stageKeys: Record<string, MessageKey> = {
  'Re-encoding pixels': 'pixels', 'Loading engine': 'loading', 'Loading cleanup engine': 'loading',
  'Checking output structure': 'structure', 'Running full verification': 'verifying',
  loading: 'loading', extracting: 'extracting', building: 'building', scoring: 'scoring', cleaning: 'cleaning',
};

export function localizePrivacyCleanupStage(stage: string | null, locale: Locale): string {
  return privacyCleanupText(locale, stageKeys[stage ?? ''] ?? 'preparing');
}

export function localizePrivacyCleanupCheck(check: PrivacyCleanupOutputCheck, locale: Locale): { label: string; message: string; original?: string } {
  const label = privacyCleanupText(locale, check.id);
  const translate = (key: MessageKey, params: Record<string, string>) => ({ label, message: privacyCleanupText(locale, key, params) });
  const rules: Array<[RegExp, MessageKey, string[]]> = [
    [/^Output signature is (.+)\.$/, 'signaturePassed', ['value']],
    [/^Output signature changed from (.+) to (.+)\.$/, 'signatureFailed', ['before', 'after']],
    [/^Display dimensions remain (.+)\.$/, 'dimensionsPassed', ['value']],
    [/^Display dimensions changed from (.+) to (.+)\.$/, 'dimensionsFailed', ['before', 'after']],
    [/^Orientation remains (.+)\.$/, 'orientationPassed', ['value']],
    [/^Orientation changed from (.+) to (.+)\.$/, 'orientationFailed', ['before', 'after']],
    [/^The re-encoded copy still declares Orientation (.+)\.$/, 'orientationRetained', ['value']],
  ];
  for (const [pattern, key, names] of rules) {
    const match = check.message.match(pattern);
    if (match) return translate(key, Object.fromEntries(names.map((name, index) => [name, match[index + 1] === 'unset' ? privacyCleanupText(locale, 'unset') : match[index + 1]!])));
  }
  const known: Record<string, MessageKey> = {
    'Orientation was applied to pixels and no rotation tag remains.': 'orientationApplied',
    'Animation remains present in the cleaned copy.': 'animationPassed',
    'The cleaned copy lost its animation.': 'animationFailed',
    'The source is a static image.': 'staticImage',
  };
  const key = known[check.message];
  return { label, message: key ? privacyCleanupText(locale, key) : locale === 'en' ? check.message : privacyCleanupText(locale, check.status === 'passed' ? 'checkPassed' : 'checkFailed'), original: key || locale === 'en' ? undefined : check.message };
}

export function localizePrivacyDiagnostic(message: string, locale: Locale, kind: 'warning' | 'error' = 'warning'): { message: string; original?: string } {
  const known: Record<string, MessageKey> = {
    'Canceled by user.': 'canceled', '用户已取消。': 'canceled', 'Vom Benutzer abgebrochen.': 'canceled', 'Annulé par l’utilisateur.': 'canceled',
    'Pixels were re-encoded and original metadata containers were not copied.': 'reencodedWarning',
    'Orientation and ICC color profile were intentionally retained. Some formats may keep structural fields, so verification is required.': 'retainedWarning',
    'Output integrity checks failed. Download is blocked.': 'failedWarning',
    'Verification did not complete a full scan for both files. Do not describe this copy as safe.': 'incompleteWarning',
  };
  const key = known[message] ?? (/cancel(?:ed|led)/i.test(message) ? 'canceled' : /(?:timed?\s*out|did not finish within|timeout)/i.test(message) ? 'timeout' : /(?:failed to fetch|fetch.*failed|networkerror|load.*wasm|wasm.*load)/i.test(message) ? 'engineUnavailable' : undefined);
  if (key) return { message: privacyCleanupText(locale, key) };
  return locale === 'en' ? { message } : { message: privacyCleanupText(locale, kind === 'error' ? 'unknownError' : 'unknownWarning'), original: message };
}
