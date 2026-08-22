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

const frUi: Record<string, string> = {
  'Waiting for a file': 'En attente d’un fichier', 'Verification canceled': 'Vérification annulée',
  'Verification was canceled. Retry this file or choose another one.': 'La vérification a été annulée. Relancez ce fichier ou choisissez-en un autre.',
  'Verification stopped safely': 'Vérification arrêtée sans risque', 'The Content Credentials check could not finish.': 'La vérification des Content Credentials n’a pas pu se terminer.',
  'Verification receipt copied': 'Reçu de vérification en anglais copié', 'Clipboard access was blocked by this browser': 'Le navigateur a bloqué l’accès au presse-papiers',
  'File bytes stay in this tab.': 'Les octets du fichier restent dans cet onglet.', 'Choose a file': 'Choisir un fichier',
  'Official verifier · local run': 'Vérificateur officiel · exécution locale', 'Drop a file with Content Credentials': 'Déposez un fichier avec des Content Credentials',
  'images and RAW up to 50 MB · everything else up to 100 MB': 'images et RAW jusqu’à 50 Mo · autres formats jusqu’à 100 Mo',
  'What gets checked?': 'Que vérifie-t-on ?', 'Signature, file binding, manifest structure, actions, ingredients, and assertions.': 'Signature, liaison au fichier, structure du manifeste, actions, ingrédients et assertions.',
  'Local verification': 'Vérification locale', 'No receipt was produced.': 'Aucun reçu n’a été produit.', 'Cancel': 'Annuler', 'Retry': 'Réessayer', 'Replace': 'Remplacer', 'Clear': 'Effacer',
  'checked with': 'vérifié avec', 'Inspected asset': 'Contenu inspecté', 'Signed by': 'Signé par', 'No signer stated': 'Aucun signataire indiqué', 'Issued': 'Émis le', 'Not stated': 'Non indiqué',
  'Algorithm': 'Algorithme', 'Cert status': 'État du certificat', 'Trusted signer': 'Signataire de confiance', 'Invalid credential': 'Information invalide', 'Trust not checked': 'Confiance non vérifiée', 'Not applicable': 'Sans objet', 'Software': 'Logiciel',
  'Create shareable report': 'Créer un rapport partageable en anglais', 'Downloads a local JSON receipt. Nothing is uploaded.': 'Télécharge un reçu JSON local en anglais. Rien n’est envoyé.',
  'File binding': 'Liaison au fichier', 'Does the signed hash match these bytes?': 'L’empreinte signée correspond-elle à ces octets ?', 'Claim signature': 'Signature de la déclaration',
  'Did the cryptographic signature validate?': 'La signature cryptographique est-elle valide ?', 'Publisher trust': 'Confiance dans l’émetteur', 'No external trust list is configured.': 'Aucune liste de confiance externe n’est configurée.',
  'Revocation': 'Révocation', 'No online OCSP request is made.': 'Aucune requête OCSP en ligne n’est effectuée.', 'Inspected file receipt': 'Reçu du fichier inspecté',
  'Detected format': 'Format détecté', 'Active manifest': 'Manifeste actif', 'None': 'Aucun', 'Not calculated': 'Non calculé', 'Copy SHA-256': 'Copier SHA-256',
  'Search this credential report': 'Rechercher dans ce rapport', 'Search checks, actions, sources, or assertions': 'Rechercher contrôles, actions, sources ou assertions',
  'Cryptographic checks': 'Contrôles cryptographiques', 'Validation results': 'Résultats de validation', 'No matching validation checks.': 'Aucun contrôle correspondant.', 'No validation checks were returned.': 'Aucun contrôle de validation n’a été renvoyé.',
  'There is no C2PA manifest to validate in this file.': 'Ce fichier ne contient aucun manifeste C2PA à valider.', 'The safe receipt still records the verifier result.': 'Le reçu sûr conserve tout de même le résultat du vérificateur.',
  'Signed history': 'Historique signé', 'Actions': 'Actions', 'No tool was stated.': 'Aucun outil indiqué.', 'No timestamp or source type stated.': 'Aucune date ni type de source indiqué.',
  'Action details': 'Détails de l’action', 'Safe structured values': 'Valeurs structurées sûres', 'No matching actions.': 'Aucune action correspondante.', 'No actions were declared.': 'Aucune action déclarée.',
  'A missing action list does not mean the file was never edited.': 'L’absence de liste d’actions ne signifie pas que le fichier n’a jamais été modifié.',
  'Direct source links': 'Liens directs vers les sources', 'Provenance': 'Provenance', 'Current file only · no prior ingredients declared.': 'Fichier actuel uniquement · aucun ingrédient antérieur déclaré.',
  'Assertions': 'Assertions', 'Manifests': 'Manifestes', 'Watermark declarations': 'Déclarations de filigrane', 'No matching assertions.': 'Aucune assertion correspondante.',
  'No assertions were declared.': 'Aucune assertion déclarée.', 'No matching manifests.': 'Aucun manifeste correspondant.', 'No manifests were returned.': 'Aucun manifeste renvoyé.',
  'Copy receipt': 'Copier le reçu en anglais', 'Download JSON': 'Télécharger le JSON en anglais', 'Open': 'Ouvrir', 'Close': 'Fermer',
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
  const stateDe: Record<C2paCheckState, string> = { passed: 'Bestanden', failed: 'Fehlgeschlagen', 'not-checked': 'Nicht geprüft', 'not-applicable': 'Nicht zutreffend', unknown: 'Unbekannt' };
  const stateFr: Record<C2paCheckState, string> = { passed: 'Réussi', failed: 'Échoué', 'not-checked': 'Non vérifié', 'not-applicable': 'Sans objet', unknown: 'Inconnu' };
  return <div className={`c2pa-check is-${value}`}>
    <Icon icon={icon} width="19" aria-hidden="true" />
    <span>{label}<small>{note}</small></span>
    <strong>{locale === 'zh-CN' ? ({ passed: '通过', failed: '失败', 'not-checked': '未检查', 'not-applicable': '不适用', unknown: '未知' } as const)[value] : locale === 'de' ? stateDe[value] : locale === 'fr' ? stateFr[value] : stateCopy[value]}</strong>
  </div>;
}

function SafeJsonDetails({ title, note, value, className = '', locale = 'en' }: { title: string; note: string; value: unknown; className?: string; locale?: Locale }) {
  const [open, setOpen] = useState(false);
  return <details className={`c2pa-json-details ${className}`} onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary><span>{title}<small>{note}</small></span><b>{open ? (locale === 'zh-CN' ? '关闭' : locale === 'de' ? 'Schließen' : locale === 'fr' ? 'Fermer' : 'Close') : (locale === 'zh-CN' ? '打开' : locale === 'de' ? 'Öffnen' : locale === 'fr' ? 'Ouvrir' : 'Open')}</b></summary>
    {open ? <pre>{JSON.stringify(value, null, 2)}</pre> : null}
  </details>;
}

function ValidationRows({ entries, locale }: { entries: C2paValidationEntry[]; locale: Locale }) {
  const zh = locale === 'zh-CN';
  const de = locale === 'de';
  const fr = locale === 'fr';
  const t = (en: string, zhText: string, deText: string, frText: string) => zh ? zhText : de ? deText : fr ? frText : en;
  if (!entries.length) return <div className="c2pa-empty"><strong>{t('No entries in this bucket.', '这一组没有条目。', 'Keine Einträge in dieser Gruppe.', 'Aucune entrée dans ce groupe.')}</strong><p>{t('The SDK did not return a status code at this severity.', 'SDK 没有返回这个严重级别的状态码。', 'Das SDK hat für diesen Schweregrad keinen Statuscode zurückgegeben.', 'Le SDK n’a renvoyé aucun code pour ce niveau de gravité.')}</p></div>;
  return <div className="c2pa-validation-list">{entries.map((entry) => { const copy = localizeC2paValidation(entry, locale); return <article key={entry.id} className={`is-${entry.severity}`}>
    <span className="c2pa-validation-mark" aria-label={entry.severity === 'success' ? t('Passed', '通过', 'Bestanden', 'Réussi') : entry.severity === 'failure' ? t('Failed', '失败', 'Fehlgeschlagen', 'Échoué') : t('Warning', '警告', 'Warnung', 'Avertissement')}><Icon icon={entry.severity === 'success' ? checkIcon : entry.severity === 'failure' ? failIcon : warningIcon} width="15" /></span>
    <div><h4>{copy.title}</h4><code>{entry.code}</code><p>{copy.explanation}</p><small>{entry.scope}{entry.url ? ` · ${entry.url}` : ''}</small></div>
    <button type="button" aria-label={zh ? `复制验证码 ${entry.code}` : de ? `Prüfcode ${entry.code} kopieren` : fr ? `Copier le code de validation ${entry.code}` : `Copy validation code ${entry.code}`} onClick={() => void copyText(entry.code)}><Icon icon={copyIcon} width="15" /></button>
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
  const de = locale === 'de';
  const fr = locale === 'fr';
  const t = (en: string, zhText: string, deText: string) => zh ? zhText : de ? deText : fr ? (frUi[en] ?? en) : en;
  const progressDe: Record<C2paProgressStage, string> = { 'checking-file': 'Tatsächliche Dateisignatur wird geprüft', 'loading-engine': 'Offizieller Verifier wird geladen', 'reading-credential': 'Content Credentials werden gelesen', validating: 'Signaturen und Dateibindungen werden geprüft', 'building-report': 'Sicherer lokaler Beleg wird erstellt' };
  const progressFr: Record<C2paProgressStage, string> = { 'checking-file': 'Vérification de la vraie signature du fichier', 'loading-engine': 'Chargement du vérificateur officiel', 'reading-credential': 'Lecture des Content Credentials', validating: 'Vérification des signatures et liaisons', 'building-report': 'Création d’un reçu local sûr' };
  const progress = (current: C2paProgressStage) => zh ? ({ 'checking-file': '正在检查真实文件签名', 'loading-engine': '正在加载官方验证器', 'reading-credential': '正在读取内容凭证', validating: '正在检查签名和文件绑定', 'building-report': '正在生成安全本地收据' } as const)[current] : de ? progressDe[current] : fr ? progressFr[current] : progressCopy[current];
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
  const [notice, setNotice] = useState(t('Waiting for a file', '等待选择文件', 'Warte auf eine Datei'));
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
    setFile(null); setReport(null); setBusy(false); setStage(null); setError(null); setNotice(t('Waiting for a file', '等待选择文件', 'Warte auf eine Datei')); setQuery(''); setSelectedProvenance('file');
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
      setNotice(zh ? (result.status === 'not-found' ? '凭证检查完成 · 没有找到' : `凭证检查完成 · ${result.validationState}`) : de ? (result.status === 'not-found' ? 'Credential-Prüfung abgeschlossen · nichts gefunden' : `Credential-Prüfung abgeschlossen · ${result.validationState}`) : fr ? (result.status === 'not-found' ? 'Vérification terminée · rien trouvé' : `Vérification terminée · ${result.validationState}`) : result.status === 'not-found' ? 'Credential check complete · none found' : `Credential check complete · ${result.validationState}`);
    } catch (caught) {
      if (runId.current !== currentId) return;
      if (caught instanceof C2paCancellationError) {
        setNotice(t('Verification canceled', '验证已取消', 'Prüfung abgebrochen'));
        setError(t('Verification was canceled. Retry this file or choose another one.', '验证已取消。可以重试这个文件，或者换一个。', 'Die Prüfung wurde abgebrochen. Versuche die Datei erneut oder wähle eine andere.'));
      } else {
        setNotice(t('Verification stopped safely', '验证已安全停止', 'Prüfung sicher gestoppt'));
        setError(caught instanceof Error ? caught.message : t('The Content Credentials check could not finish.', '内容凭证检查没能完成。', 'Die Prüfung der Content Credentials konnte nicht abgeschlossen werden.'));
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
    try { await copyText(reportReceipt(report)); setNotice(t('Verification receipt copied', '验证收据已复制', 'Englischer Prüfbeleg kopiert')); }
    catch { setNotice(t('Clipboard access was blocked by this browser', '浏览器阻止了剪贴板访问', 'Der Browser hat den Zugriff auf die Zwischenablage blockiert')); }
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
  const verdictDe = {
    trusted: { eyebrow: 'Vertrauenswürdiger C2PA-Status', title: 'Vertrauenswürdiges Credential', body: 'Das Credential ist gültig, und laut Verifier führt die Signaturkette zu einem konfigurierten Vertrauensanker.' },
    valid: { eyebrow: 'Kryptografisches Ergebnis', title: 'Gültiges Credential', body: 'Signatur und Dateibindung sind gültig. Das Vertrauen in den Herausgeber wird getrennt angezeigt und nicht gegen eine externe Vertrauensliste geprüft.' },
    invalid: { eyebrow: 'Diesen Angaben nicht vertrauen', title: 'Ungültiges Credential', body: 'C2PA meldet mindestens einen Fehler. Datei oder Credential könnten verändert worden sein; die Details unten dienen nur zur Diagnose.' },
    'not-found': { eyebrow: 'Kein eingebettetes Credential', title: 'Keine Content Credentials', body: 'Der offizielle Verifier hat in dieser Datei kein C2PA-Manifest gefunden. Das sagt allein nichts darüber aus, ob der Inhalt echt oder gefälscht ist.' },
    unsupported: { eyebrow: 'Formatgrenze', title: 'Hier nicht unterstützt', body: 'Die Dateisignatur ist lesbar, aber dieser produktive Verifier akzeptiert das Format auf dieser Seite nicht.' },
  } as const;
  const verdictFr = {
    trusted: { eyebrow: 'État C2PA de confiance', title: 'Information de confiance', body: 'L’information est valide et sa chaîne de signature mène, selon le vérificateur, à une racine de confiance configurée.' },
    valid: { eyebrow: 'Résultat cryptographique', title: 'Information valide', body: 'La signature et la liaison au fichier sont valides. La confiance dans l’émetteur est séparée et n’a pas été contrôlée avec une liste externe.' },
    invalid: { eyebrow: 'Ne pas faire confiance à ces déclarations', title: 'Information invalide', body: 'C2PA signale au moins un échec. Le fichier ou l’information a peut-être changé ; les détails ci-dessous servent uniquement au diagnostic.' },
    'not-found': { eyebrow: 'Aucune information intégrée', title: 'Aucune Content Credential', body: 'Le vérificateur officiel n’a trouvé aucun manifeste C2PA. Cela ne dit rien, à lui seul, sur l’authenticité du contenu.' },
    unsupported: { eyebrow: 'Limite de format', title: 'Non pris en charge ici', body: 'La signature du fichier est lisible, mais ce vérificateur de production n’accepte pas ce format sur cette page.' },
  } as const;
  const verdict = report ? (zh ? verdictZh[report.status] : de ? verdictDe[report.status] : fr ? verdictFr[report.status] : verdictCopy[report.status]) : null;
  const active = report?.activeManifest;
  const hasCredential = report ? ['trusted', 'valid', 'invalid'].includes(report.status) : false;
  const honestTitle = zh ? (report?.status === 'invalid' ? '不要依赖无效清单里的声明。' : report?.status === 'not-found' ? '没有凭证不等于内容造假。' : report?.status === 'unsupported' ? '这里不支持，不代表别处验证会无效。' : '有效签名是证据，不是真相机器。') : de ? (report?.status === 'invalid' ? 'Verlass dich nicht auf Angaben aus einem ungültigen Manifest.' : report?.status === 'not-found' ? 'Kein Credential ist kein Beweis für eine Fälschung.' : report?.status === 'unsupported' ? 'Hier nicht unterstützt heißt nicht anderswo ungültig.' : 'Eine gültige Signatur ist ein Beleg, keine Wahrheitsmaschine.') : fr ? (report?.status === 'invalid' ? 'Ne vous fiez pas aux déclarations d’un manifeste invalide.' : report?.status === 'not-found' ? 'L’absence de Content Credential ne prouve pas une falsification.' : report?.status === 'unsupported' ? 'Non pris en charge ici ne signifie pas invalide ailleurs.' : 'Une signature valide est une preuve, pas une machine à vérité.') : report?.status === 'invalid' ? 'Do not rely on invalid manifest claims.'
    : report?.status === 'not-found' ? 'No credential is not a fake-content verdict.'
      : report?.status === 'unsupported' ? 'Unsupported here does not mean invalid elsewhere.'
        : 'A valid signature is evidence, not a truth machine.';

  const selectedIngredient = report?.ingredients.find((item) => item.id === selectedProvenance) ?? null;
  const previewableImage = report ? ['jpeg', 'png', 'webp', 'gif', 'svg', 'avif'].includes(report.file.detectedType) : false;
  const credentialBadge = zh ? (report?.status === 'trusted' ? '可信' : report?.status === 'valid' ? '有效但有边界' : report?.status === 'invalid' ? '无效' : report?.status === 'not-found' ? '无凭证' : '不支持') : de ? (report?.status === 'trusted' ? 'Vertrauenswürdig' : report?.status === 'valid' ? 'Gültig mit Einschränkungen' : report?.status === 'invalid' ? 'Ungültig' : report?.status === 'not-found' ? 'Kein Credential' : 'Nicht unterstützt') : fr ? (report?.status === 'trusted' ? 'De confiance' : report?.status === 'valid' ? 'Valide avec réserves' : report?.status === 'invalid' ? 'Invalide' : report?.status === 'not-found' ? 'Aucune information' : 'Non pris en charge') : report?.status === 'trusted' ? 'Trusted'
    : report?.status === 'valid' ? 'Valid with caveats'
      : report?.status === 'invalid' ? 'Invalid'
        : report?.status === 'not-found' ? 'No credential' : 'Unsupported';

  return <section className="workbench c2pa-workbench" aria-busy={busy}>
    <div className="workbench-topline">
      <div className="local-proof"><Icon icon={shieldIcon} width="18" aria-hidden="true" /><span>{t('File bytes stay in this tab.', '文件字节只留在当前标签页。', 'Die Dateibytes bleiben in diesem Tab.')}</span></div>
      <span className="status-line" role="status" aria-live="polite"><i className={busy ? 'pulse' : ''} />{notice}</span>
    </div>
    <input ref={input} className="sr-only" type="file" accept={accept} tabIndex={-1} aria-hidden="true" onChange={(event) => pick(event.currentTarget.files)} />

    {!file ? <div ref={chooseButton} className={`c2pa-dropzone ${dragging ? 'is-dragging' : ''}`} role="button" tabIndex={0} aria-label={t('Choose a file', '选择文件', 'Datei auswählen')} aria-describedby="c2pa-file-help" onClick={openPicker} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openPicker(); } }}
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); pick(event.dataTransfer.files); }}>
      <span className="c2pa-drop-mark" aria-hidden="true"><Icon icon={uploadIcon} width="32" /></span>
      <div><span className="eyebrow">{t('Official verifier · local run', '官方验证器 · 本地运行', 'Offizieller Verifier · lokal')}</span><strong>{t('Drop a file with Content Credentials', '把带有内容凭证的文件拖到这里', 'Datei mit Content Credentials hier ablegen')}</strong><p id="c2pa-file-help">{formats} · {t('images and RAW up to 50 MB · everything else up to 100 MB', '图片与 RAW 最大 50 MB · 其他格式最大 100 MB', 'Bilder und RAW bis 50 MB · alles andere bis 100 MB')}</p><span className="button button-primary c2pa-pick-label" aria-hidden="true">{t('Choose a file', '选择文件', 'Datei auswählen')}</span></div>
      <aside><Icon icon={fingerprintIcon} width="20" /><p><strong>{t('What gets checked?', '会检查什么？', 'Was wird geprüft?')}</strong>{t('Signature, file binding, manifest structure, actions, ingredients, and assertions.', '签名、文件绑定、清单结构、操作、素材和断言。', 'Signatur, Dateibindung, Manifeststruktur, Aktionen, Zutaten und Assertions.')}</p></aside>
    </div> : null}

    {file && !report ? <div className="c2pa-pending">
      <span className="c2pa-pending-mark"><Icon icon={fileSearchIcon} width="28" /></span>
      <div><span className="eyebrow">{t('Local verification', '本地验证', 'Lokale Prüfung')}</span><h2>{busy ? progress(stage ?? 'checking-file') : t('No receipt was produced.', '没有生成收据。', 'Es wurde kein Beleg erstellt.')}</h2><p><strong>{file.name}</strong> · {formatBytes(file.size)}</p>{error ? <p className="c2pa-error" role="alert">{error}</p> : null}</div>
      <div className="button-row">{busy ? <button className="button button-secondary" type="button" onClick={cancel}><Icon icon={xIcon} width="16" />{t('Cancel', '取消', 'Abbrechen')}</button> : <><button className="button button-primary" type="button" onClick={() => void inspect(file)}><Icon icon={fileSearchIcon} width="16" />{t('Retry', '重试', 'Erneut versuchen')}</button><button className="button button-secondary" type="button" onClick={openPicker}><Icon icon={replaceIcon} width="16" />{t('Replace', '替换', 'Ersetzen')}</button><button className="button button-ghost" type="button" onClick={() => clear()}><Icon icon={trashIcon} width="16" />{t('Clear', '清除', 'Leeren')}</button></>}</div>
    </div> : null}

    {report && verdict ? <div className="c2pa-report">
      <header className="c2pa-report-heading">
        <div><span className="eyebrow">{zh ? `本地验证收据 · schema ${report.schemaVersion}` : de ? `Lokaler Prüfbeleg · Schema ${report.schemaVersion}` : fr ? `Reçu de vérification local · schéma ${report.schemaVersion}` : `Local verification receipt · schema ${report.schemaVersion}`}</span><h2 ref={resultHeading} tabIndex={-1}>{report.file.name}</h2><p>{report.file.detectedType.toUpperCase()} · {formatBytes(report.file.size)} · {t('checked with', '检查引擎', 'geprüft mit')} {report.engine.name} {report.engine.version}</p></div>
        <div className="button-row"><button className="button button-secondary" type="button" onClick={openPicker}><Icon icon={replaceIcon} width="16" />{t('Replace', '替换', 'Ersetzen')}</button><button className="button button-ghost" type="button" onClick={() => clear()}><Icon icon={trashIcon} width="16" />{t('Clear', '清除', 'Leeren')}</button></div>
      </header>

      <div className="c2pa-report-overview">
        <section className="c2pa-asset-card" aria-labelledby="c2pa-asset-title">
          <div className="c2pa-asset-preview">
            {previewableImage && previewUrl && !previewFailed ? <img src={previewUrl} alt={zh ? `${report.file.name} 的预览` : de ? `Vorschau von ${report.file.name}` : fr ? `Aperçu de ${report.file.name}` : `Preview of ${report.file.name}`} onError={() => setPreviewFailed(true)} onLoad={(event) => setPreviewFacts({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} /> : <span><Icon icon={imageIcon} width="38" /><b>{report.file.detectedType.toUpperCase()}</b></span>}
            <small className={`is-${report.status}`}>{credentialBadge}</small>
          </div>
          <div className="c2pa-asset-copy">
            <div><span className="eyebrow">{t('Inspected asset', '已检查资源', 'Geprüfte Datei')}</span><h3 id="c2pa-asset-title" title={report.file.name}>{report.file.name}</h3><p>{formatBytes(report.file.size)} · {previewFacts ? `${previewFacts.width} × ${previewFacts.height} · ` : ''}{report.file.detectedType.toUpperCase()}</p></div>
            <dl>
              <div><dt>{t('Signed by', '签名者', 'Signiert von')}</dt><dd>{active?.signer ?? t('No signer stated', '未声明签名者', 'Kein Signierer angegeben')}</dd></div>
              <div><dt>{t('Issued', '签发时间', 'Ausgestellt')}</dt><dd>{active?.signedAt ?? t('Not stated', '未声明', 'Nicht angegeben')}</dd></div>
              <div><dt>{t('Algorithm', '算法', 'Algorithmus')}</dt><dd>{active?.algorithm ?? t('Not stated', '未声明', 'Nicht angegeben')}</dd></div>
              <div><dt>{t('Cert status', '证书状态', 'Zertifikatsstatus')}</dt><dd>{report.checks.publisherTrust === 'passed' ? t('Trusted signer', '可信签名者', 'Vertrauenswürdiger Signierer') : report.status === 'invalid' ? t('Invalid credential', '无效凭证', 'Ungültiges Credential') : hasCredential ? t('Trust not checked', '信任未检查', 'Vertrauen nicht geprüft') : t('Not applicable', '不适用', 'Nicht zutreffend')}</dd></div>
              <div><dt>{t('Software', '软件', 'Software')}</dt><dd>{active?.claimGenerator ?? t('Not stated', '未声明', 'Nicht angegeben')}</dd></div>
            </dl>
            <button className="button button-primary c2pa-share-button" type="button" onClick={() => downloadJson(report, sanitizeFilename(report.file.name, '-c2pa-report'))}><Icon icon={shareIcon} width="16" />{t('Create shareable report', '生成可分享的英文报告', 'Teilbaren englischen Bericht erstellen')}</button>
            <small className="c2pa-local-export-note">{t('Downloads a local JSON receipt. Nothing is uploaded.', '下载本地 JSON 收据，不会上传任何内容。', 'Lädt einen lokalen englischen JSON-Beleg herunter. Nichts wird hochgeladen.')}</small>
          </div>
        </section>

        <section className={`c2pa-verdict is-${report.status}`} aria-labelledby="c2pa-verdict-title">
          <div className="c2pa-verdict-copy"><span className="c2pa-verdict-mark"><Icon icon={report.status === 'invalid' ? warningIcon : report.status === 'not-found' || report.status === 'unsupported' ? fileSearchIcon : badgeIcon} width="34" /></span><div><span className="eyebrow">{verdict.eyebrow}</span><h3 id="c2pa-verdict-title">{verdict.title}</h3><p>{verdict.body}</p></div></div>
          <div className="c2pa-checks">
            <CheckFact locale={locale} label={t('File binding', '文件绑定', 'Dateibindung')} value={report.checks.binding} note={t('Does the signed hash match these bytes?', '签名哈希是否匹配这些文件字节？', 'Passt der signierte Hash zu diesen Dateibytes?')} />
            <CheckFact locale={locale} label={t('Claim signature', '声明签名', 'Claim-Signatur')} value={report.checks.signature} note={t('Did the cryptographic signature validate?', '加密签名是否验证通过？', 'Wurde die kryptografische Signatur bestätigt?')} />
            <CheckFact locale={locale} label={t('Publisher trust', '发布者信任', 'Vertrauen in Herausgeber')} value={report.checks.publisherTrust} note={t('No external trust list is configured.', '未配置外部信任列表。', 'Es ist keine externe Vertrauensliste konfiguriert.')} />
            <CheckFact locale={locale} label={t('Revocation', '吊销状态', 'Widerruf')} value={report.checks.revocation} note={t('No online OCSP request is made.', '不会发起在线 OCSP 请求。', 'Es wird keine Online-OCSP-Anfrage gestellt.')} />
          </div>
        </section>
      </div>

      <section className="c2pa-file-receipt" aria-label={t('Inspected file receipt', '已检查文件收据', 'Beleg zur geprüften Datei')}>
        <div><span>{t('Detected format', '检测格式', 'Erkanntes Format')}</span><strong>{report.file.detectedType.toUpperCase()}</strong><small>{report.file.inspectedMime ?? report.file.mime}</small></div>
        <div><span>{t('Active manifest', '活动清单', 'Aktives Manifest')}</span><strong>{report.activeManifestLabel ?? t('None', '无', 'Keins')}</strong><small>{zh ? `存储中有 ${report.manifests.length} 个清单` : de ? `${report.manifests.length} Manifest${report.manifests.length === 1 ? '' : 'e'} im Speicher` : fr ? `${report.manifests.length} manifeste(s) en mémoire` : `${report.manifests.length} manifest${report.manifests.length === 1 ? '' : 's'} in store`}</small></div>
        <div className="c2pa-hash"><Icon icon={fingerprintIcon} width="19" /><span>SHA-256</span><code>{report.fingerprint?.value ?? t('Not calculated', '未计算', 'Nicht berechnet')}</code>{report.fingerprint ? <button type="button" aria-label={t('Copy SHA-256', '复制 SHA-256', 'SHA-256 kopieren')} onClick={() => void copyText(report.fingerprint!.value)}><Icon icon={copyIcon} width="15" /></button> : null}</div>
      </section>

      {report.warnings.length ? <div className="c2pa-warning-list">{report.warnings.map((warning) => <p key={`${warning.code}-${warning.message}`}><strong>{warning.code}</strong> {warning.message}</p>)}</div> : null}

      <label className="c2pa-search"><Icon icon={searchIcon} width="17" /><span className="sr-only">{t('Search this credential report', '搜索凭证报告', 'Credential-Bericht durchsuchen')}</span><input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder={t('Search checks, actions, sources, or assertions', '搜索检查、操作、来源或断言', 'Prüfungen, Aktionen, Quellen oder Assertions suchen')} /></label>

      <div className="c2pa-evidence-stack">
        <section className="c2pa-evidence-panel c2pa-validation-panel" aria-labelledby="c2pa-validation-title">
          <header className="c2pa-evidence-heading"><div><span className="eyebrow">{t('Cryptographic checks', '加密检查', 'Kryptografische Prüfungen')}</span><h3 id="c2pa-validation-title">{t('Validation results', '验证结果', 'Prüfergebnisse')}</h3><p>{zh ? `${validationPresentation?.total ?? 0} 项检查 · ${validationPresentation?.passed ?? 0} 项通过 · ${validationPresentation?.warnings ?? 0} 条警告${validationPresentation?.failed ? ` · ${validationPresentation.failed} 项失败` : ''}` : de ? `${validationPresentation?.total ?? 0} Prüfungen · ${validationPresentation?.passed ?? 0} bestanden · ${validationPresentation?.warnings ?? 0} Warnungen${validationPresentation?.failed ? ` · ${validationPresentation.failed} fehlgeschlagen` : ''}` : fr ? `${validationPresentation?.total ?? 0} contrôles · ${validationPresentation?.passed ?? 0} réussis · ${validationPresentation?.warnings ?? 0} avertissements${validationPresentation?.failed ? ` · ${validationPresentation.failed} échecs` : ''}` : `${validationPresentation?.total ?? 0} checks · ${validationPresentation?.passed ?? 0} passed · ${validationPresentation?.warnings ?? 0} warning${validationPresentation?.warnings === 1 ? '' : 's'}${validationPresentation?.failed ? ` · ${validationPresentation.failed} failed` : ''}`}</p></div><strong>{filteredValidationPresentation.entries.length}</strong></header>
          {filteredValidationPresentation.entries.length ? <ValidationRows locale={locale} entries={filteredValidationPresentation.entries} /> : <div className="c2pa-empty"><strong>{query ? t('No matching validation checks.', '没有匹配的验证检查。', 'Keine passenden Prüfungen.') : t('No validation checks were returned.', '验证器没有返回检查项。', 'Der Verifier hat keine Prüfeinträge zurückgegeben.')}</strong><p>{report.status === 'not-found' ? t('There is no C2PA manifest to validate in this file.', '这个文件里没有可验证的 C2PA 清单。', 'Diese Datei enthält kein prüfbares C2PA-Manifest.') : t('The safe receipt still records the verifier result.', '安全收据仍然记录了验证器结论。', 'Der sichere Beleg hält das Ergebnis des Verifiers trotzdem fest.')}</p></div>}
        </section>

        <section className="c2pa-evidence-panel c2pa-actions-panel" aria-labelledby="c2pa-actions-title">
          <header className="c2pa-evidence-heading"><div><span className="eyebrow">{t('Signed history', '签名历史', 'Signierter Verlauf')}</span><h3 id="c2pa-actions-title">{t('Actions', '操作记录', 'Aktionen')}</h3><p>{zh ? `活动 C2PA 操作断言中有 ${report.actions.length} 条记录。` : de ? `${report.actions.length} Einträge aus der aktiven C2PA-Aktions-Assertion.` : fr ? `${report.actions.length} entrée(s) dans l’assertion d’actions C2PA active.` : `${report.actions.length} entr${report.actions.length === 1 ? 'y' : 'ies'} from the active C2PA actions assertion.`}</p></div><strong>{filteredActions.length}</strong></header>
          {filteredActions.length ? <div className="c2pa-action-list">{filteredActions.map((action, index) => <article key={action.id}><i>{index + 1}</i><div><strong>{action.label}</strong><code>{action.action}</code></div><div><p>{action.softwareAgent ?? action.description ?? t('No tool was stated.', '未声明工具。', 'Kein Werkzeug angegeben.')}</p><small>{[action.when, action.digitalSourceType].filter(Boolean).join(' · ') || t('No timestamp or source type stated.', '未声明时间或来源类型。', 'Kein Zeitstempel oder Quelltyp angegeben.')}</small>{action.details ? <SafeJsonDetails locale={locale} title={t('Action details', '操作详情', 'Aktionsdetails')} note={t('Safe structured values', '安全结构化值', 'Sichere strukturierte Werte')} value={action.details} /> : null}</div></article>)}</div> : <div className="c2pa-empty"><strong>{query ? t('No matching actions.', '没有匹配的操作。', 'Keine passenden Aktionen.') : t('No actions were declared.', '没有声明操作。', 'Es wurden keine Aktionen angegeben.')}</strong><p>{t('A missing action list does not mean the file was never edited.', '缺少操作列表，不代表文件从未被编辑。', 'Eine fehlende Aktionsliste bedeutet nicht, dass die Datei nie bearbeitet wurde.')}</p></div>}
        </section>

        <section className="c2pa-evidence-panel c2pa-provenance-panel" aria-labelledby="c2pa-provenance-title">
          <header className="c2pa-evidence-heading"><div><span className="eyebrow">{t('Direct source links', '直接来源链接', 'Direkte Quellenverweise')}</span><h3 id="c2pa-provenance-title">{t('Provenance', '来源关系', 'Herkunft')}</h3><p>{report.ingredients.length ? (zh ? `${report.ingredients.length} 个直接素材链接到当前文件。` : de ? `${report.ingredients.length} direkte Quelle${report.ingredients.length === 1 ? '' : 'n'} mit dieser Datei verknüpft.` : fr ? `${report.ingredients.length} ingrédient(s) directement lié(s) à ce fichier.` : `${report.ingredients.length} direct ingredient${report.ingredients.length === 1 ? '' : 's'} linked to this file.`) : t('Current file only · no prior ingredients declared.', '只有当前文件 · 未声明之前的素材', 'Nur aktuelle Datei · keine vorherigen Quellen angegeben.')}</p></div><Icon icon={routeIcon} width="25" /></header>
          <div className={`c2pa-provenance-flow ${filteredIngredients.length ? 'has-sources' : ''}`}>
            {filteredIngredients.length ? <div className="c2pa-source-nodes">{filteredIngredients.map((ingredient) => <button key={ingredient.id} type="button" className={selectedProvenance === ingredient.id ? 'is-selected' : ''} aria-pressed={selectedProvenance === ingredient.id} onClick={() => setSelectedProvenance(ingredient.id)}><span>{t('Source asset', '源素材', 'Quelldatei')}</span><strong>{ingredient.title}</strong><small>{ingredient.format ?? ingredient.relationship ?? t('Format not stated', '未声明格式', 'Format nicht angegeben')}</small></button>)}</div> : null}
            <button type="button" className={`c2pa-current-node ${selectedProvenance === 'file' ? 'is-selected' : ''}`} aria-pressed={selectedProvenance === 'file'} onClick={() => setSelectedProvenance('file')}><span>{t('This file', '当前文件', 'Diese Datei')} · {credentialBadge}</span><strong>{report.file.name}</strong><small>{active?.signer ? (zh ? `由 ${active.signer} 签署` : de ? `Signiert von ${active.signer}` : `Signed by ${active.signer}`) : t('No signer stated', '未声明签名者', 'Kein Signierer angegeben')}</small></button>
          </div>
          <div className="c2pa-selected-node"><span className="eyebrow">{t('Selected node', '当前选中节点', 'Ausgewählter Knoten')}</span><div><span className="c2pa-node-thumb"><Icon icon={selectedIngredient ? linkIcon : imageIcon} width="28" /></span><div><small>{selectedIngredient ? t('Source asset', '源素材', 'Quelldatei') : t('This file', '当前文件', 'Diese Datei')} · {selectedIngredient ? selectedIngredient.relationship ?? t('relationship not stated', '未声明关系', 'Beziehung nicht angegeben') : credentialBadge}</small><h4>{selectedIngredient?.title ?? report.file.name}</h4><p>{selectedIngredient ? [selectedIngredient.format, selectedIngredient.instanceId ?? selectedIngredient.documentId].filter(Boolean).join(' · ') || t('No additional source details were stated.', '未声明更多来源细节。', 'Keine weiteren Quelldetails angegeben.') : active?.signer ? (zh ? `由 ${active.signer} 签署` : de ? `Signiert von ${active.signer}` : `Signed by ${active.signer}`) : t('No C2PA signer is attached to this file.', '此文件没有附带 C2PA 签名者。', 'Mit dieser Datei ist kein C2PA-Signierer verknüpft.')}</p></div></div><p>{report.status === 'invalid' ? t('The active credential is invalid, so treat every provenance claim as diagnostic only.', '活动凭证无效，所有来源声明都只能当作诊断线索。', 'Das aktive Credential ist ungültig. Behandle alle Herkunftsangaben nur als Diagnosehinweise.') : report.status === 'not-found' ? t('No Content Credentials were found, so no signed provenance chain is available.', '没有找到内容凭证，因此也没有可用的签名来源链。', 'Es wurden keine Content Credentials gefunden, daher ist keine signierte Herkunftskette verfügbar.') : t('This view shows declared direct links only. It does not invent relationships that are absent from the manifest.', '这里只显示已声明的直接关系，不会编造清单中没有的链接。', 'Diese Ansicht zeigt nur angegebene direkte Verbindungen. Sie erfindet keine Beziehungen, die im Manifest fehlen.')}</p></div>
        </section>

        <section className="c2pa-evidence-panel c2pa-watermark-panel" aria-labelledby="c2pa-watermark-title">
          <header className="c2pa-evidence-heading"><div><span className="eyebrow">{t('Manifest declaration', '清单声明', 'Manifestangabe')}</span><h3 id="c2pa-watermark-title">{t('Embedded watermark', '内嵌水印', 'Eingebettetes Wasserzeichen')}</h3><p>{zh ? `活动清单中找到 ${watermarkDeclarations.length} 条声明。` : de ? `${watermarkDeclarations.length} Angabe${watermarkDeclarations.length === 1 ? '' : 'n'} im aktiven Manifest gefunden.` : `${watermarkDeclarations.length} declaration${watermarkDeclarations.length === 1 ? '' : 's'} found in the active manifest.`}</p></div><Icon icon={wavesIcon} width="25" /></header>
          <p className="c2pa-watermark-note">{t('This verifier reads watermark declarations in Content Credentials. It does not inspect pixels or audio samples to confirm that a watermark signal is present.', '验证器只读取内容凭证中的水印声明，不检查像素或音频样本来确认水印信号是否真实存在。', 'Dieser Verifier liest Wasserzeichenangaben in Content Credentials. Er untersucht keine Pixel oder Audiosamples, um ein tatsächliches Wasserzeichensignal zu bestätigen.')}</p>
          {filteredWatermarks.length ? <div className="c2pa-watermark-list">{filteredWatermarks.map((item) => <div key={item.id}><span>{item.source}</span><strong>{item.label}</strong><code>{item.code}</code></div>)}</div> : <div className="c2pa-empty"><strong>{query ? t('No matching watermark declaration.', '没有匹配的水印声明。', 'Keine passende Wasserzeichenangabe.') : t('No watermark declaration found.', '没有找到水印声明。', 'Keine Wasserzeichenangabe gefunden.')}</strong><p>{t('This result does not prove that the media contains no invisible watermark.', '这个结果不能证明媒体里没有不可见水印。', 'Dieses Ergebnis beweist nicht, dass das Medium kein unsichtbares Wasserzeichen enthält.')}</p></div>}
        </section>

        <section className="c2pa-evidence-panel c2pa-technical-panel" aria-labelledby="c2pa-technical-title">
          <header className="c2pa-evidence-heading"><div><span className="eyebrow">{t('Complete evidence', '完整证据', 'Vollständige Nachweise')}</span><h3 id="c2pa-technical-title">{t('Technical details', '技术详情', 'Technische Details')}</h3><p>{t('Assertions, manifest history, and the safe normalized JSON receipt.', '断言、清单历史和安全规范化 JSON 收据。', 'Assertions, Manifestverlauf und der sicher normalisierte JSON-Beleg.')}</p></div><strong>{report.assertions.length + report.manifests.length}</strong></header>
          <details><summary><span>{t('Assertions', '断言', 'Assertions')}<small>{filteredAssertions.length} {t('safe entries', '条安全记录', 'sichere Einträge')}</small></span><b>{t('Open', '打开', 'Öffnen')}</b></summary>{filteredAssertions.length ? <div className="c2pa-assertion-list">{filteredAssertions.map((assertion) => <SafeJsonDetails locale={locale} key={assertion.id} title={assertion.label} note={`${assertion.kind ?? t('Unknown format', '未知格式', 'Unbekanntes Format')} · ${assertion.created ? t('created by signer', '由签名者创建', 'vom Signierer erstellt') : t('gathered', '已收集', 'gesammelt')}`} value={assertion.data} />)}</div> : <div className="c2pa-empty"><strong>{t('No matching assertions.', '没有匹配的断言。', 'Keine passenden Assertions.')}</strong><p>{t('Clear the search to restore the assertion index.', '清空搜索即可恢复断言索引。', 'Leere die Suche, um den Assertion-Index wiederherzustellen.')}</p></div>}</details>
          <details><summary><span>{t('Manifest history', '清单历史', 'Manifestverlauf')}<small>{filteredManifests.length} {t('entries', '条记录', 'Einträge')}</small></span><b>{t('Open', '打开', 'Öffnen')}</b></summary>{filteredManifests.length ? <div className="c2pa-manifest-list">{filteredManifests.map((manifest, index) => <article key={manifest.label} className={manifest.active ? 'is-active' : undefined}><span>{manifest.active ? t('Active', '活动清单', 'Aktiv') : (zh ? `历史 ${index + 1}` : de ? `Verlauf ${index + 1}` : `History ${index + 1}`)}</span><h4>{manifest.title ?? manifest.label}</h4><code>{manifest.label}</code><dl><div><dt>{t('Generator', '生成器', 'Generator')}</dt><dd>{manifest.claimGenerator ?? t('Not stated', '未声明', 'Nicht angegeben')}</dd></div><div><dt>{t('Signer', '签名者', 'Signierer')}</dt><dd>{manifest.signer ?? t('Not stated', '未声明', 'Nicht angegeben')}</dd></div><div><dt>{t('Signed', '签发时间', 'Signiert')}</dt><dd>{manifest.signedAt ?? t('Not stated', '未声明', 'Nicht angegeben')}</dd></div><div><dt>{t('Contents', '内容', 'Inhalt')}</dt><dd>{manifest.assertionCount} {t('assertions', '条断言', 'Assertions')} · {manifest.ingredientCount} {t('ingredients', '个素材', 'Quellen')}</dd></div></dl></article>)}</div> : <div className="c2pa-empty"><strong>{t('No manifest matches this search.', '没有清单匹配当前搜索。', 'Kein Manifest passt zur aktuellen Suche.')}</strong><p>{t('Clear the search to restore the provenance history.', '清空搜索即可恢复来源历史。', 'Leere die Suche, um den Herkunftsverlauf wiederherzustellen.')}</p></div>}</details>
          <SafeJsonDetails locale={locale} className="is-raw" title={t('Complete safe C2PA report', '完整安全 C2PA 报告', 'Vollständiger sicherer C2PA-Bericht')} note={t('No file bytes, Blob URLs, thumbnails, or worker state', '不含文件字节、Blob URL、缩略图或 Worker 状态', 'Keine Dateibytes, Blob-URLs, Vorschaubilder oder Worker-Zustände')} value={report} />
        </section>
      </div>

      <aside className="c2pa-honest-limit"><Icon icon={infoIcon} width="22" /><div><strong>{honestTitle}</strong><p>{t('Content Credentials can show who signed a claim and whether it still binds to this file. They cannot prove that every statement or visible scene is true. This privacy-first verifier also makes no external trust-list or OCSP request.', '内容凭证能显示谁签署了声明，以及它是否仍绑定当前文件；它不能证明每段话或画面都是真的。这个隐私优先的验证器也不会请求外部信任列表或 OCSP。', 'Content Credentials zeigen, wer eine Aussage signiert hat und ob sie noch an diese Datei gebunden ist. Sie beweisen nicht, dass jede Aussage oder sichtbare Szene wahr ist. Dieser datenschutzfreundliche Verifier stellt außerdem keine Anfragen an externe Vertrauenslisten oder OCSP.')}</p></div></aside>

      <footer className="c2pa-export"><div><span className="eyebrow">{t('Portable receipt', '可携带收据', 'Portabler Beleg')}</span><h3>{t('Keep the result with the file.', '把结果和文件放在一起。', 'Bewahre das Ergebnis zusammen mit der Datei auf.')}</h3><p>{t('The JSON contains safe manifest data and status codes, never the source bytes.', 'JSON 保持英文 schema，包含安全清单数据和状态码，不包含源文件字节。', 'Das JSON behält das englische Schema und enthält sichere Manifestdaten und Statuscodes, niemals die Quelldateibytes.')}</p></div><div className="button-row"><button className="button button-secondary" type="button" onClick={() => void copyReceipt()}><Icon icon={copyIcon} width="16" />{t('Copy receipt', '复制英文收据', 'Englischen Beleg kopieren')}</button><button className="button button-primary" type="button" onClick={() => downloadJson(report, sanitizeFilename(report.file.name, '-c2pa-report'))}><Icon icon={downloadIcon} width="16" />{t('Download JSON', '下载 JSON', 'JSON herunterladen')}</button></div></footer>
    </div> : null}
  </section>;
}
