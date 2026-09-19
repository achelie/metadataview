import type { C2paActionSummary, C2paValidationEntry } from '../lib/c2pa/types';
import type { Locale } from './core';
import { MetadataError } from '../lib/metadata/errors';
import { interpolate } from './workbench-format';

const emptyMessages = {
  en: {
    title: 'No Content Credentials found',
    explanation: 'This file has no embedded C2PA manifest, so there is no signature to verify.',
    meaning: 'That does not mean the content is fake or has never been edited. It is different from a signature failing verification.',
    metadata: 'View ordinary metadata', signedSample: 'Try signed sample', retrySample: 'Retry signed sample',
    unsupportedMetadata: 'The metadata viewer does not support this format. Use Replace to choose a JPEG or PNG.',
    sampleNote: 'See how a signed Adobe test image looks in this viewer.',
    fileDetails: 'File details', size: 'File size', dimensions: 'Dimensions', previewUnavailable: 'Preview unavailable',
    diagnostics: 'Technical diagnostics', diagnosticsNote: 'Verifier output and the complete JSON report', hashCopied: 'SHA-256 copied',
  },
  'zh-CN': {
    title: '未找到内容凭证',
    explanation: '这个文件没有内嵌 C2PA 清单，因此没有可供验证的签名。',
    meaning: '这不代表内容造假，也不代表文件从未编辑过；它与“签名验证失败”是不同的结果。',
    metadata: '查看普通元数据', signedSample: '试试带签名的样例', retrySample: '重试带签名的样例',
    unsupportedMetadata: '普通元数据查看器尚不支持这种格式。可以点“替换”，选择 JPEG 或 PNG 图片。',
    sampleNote: '用 Adobe 测试图片看看带签名的验证结果。',
    fileDetails: '文件信息', size: '文件大小', dimensions: '图片尺寸', previewUnavailable: '无法显示预览',
    diagnostics: '技术诊断', diagnosticsNote: '验证器输出和完整 JSON 报告', hashCopied: 'SHA-256 已复制',
  },
  de: {
    title: 'Keine Content Credentials gefunden',
    explanation: 'Diese Datei enthält kein C2PA-Manifest. Es gibt daher keine Signatur zu prüfen.',
    meaning: 'Das bedeutet weder, dass der Inhalt gefälscht ist, noch, dass er nie bearbeitet wurde. Es ist kein fehlgeschlagener Signaturtest.',
    metadata: 'Normale Metadaten ansehen', signedSample: 'Signiertes Beispiel testen', retrySample: 'Signiertes Beispiel erneut laden',
    unsupportedMetadata: 'Der Metadaten-Viewer unterstützt dieses Format nicht. Wähle über „Ersetzen“ ein JPEG- oder PNG-Bild.',
    sampleNote: 'Sieh dir das Ergebnis eines signierten Adobe-Testbilds an.',
    fileDetails: 'Dateidetails', size: 'Dateigröße', dimensions: 'Bildmaße', previewUnavailable: 'Keine Vorschau verfügbar',
    diagnostics: 'Technische Diagnose', diagnosticsNote: 'Verifier-Ausgabe und vollständiger JSON-Bericht', hashCopied: 'SHA-256 kopiert',
  },
  fr: {
    title: 'Aucun Content Credential trouvé',
    explanation: 'Ce fichier ne contient aucun manifeste C2PA intégré. Il n’y a donc aucune signature à vérifier.',
    meaning: 'Cela ne signifie ni que le contenu est faux, ni qu’il n’a jamais été modifié. Ce résultat est différent d’un échec de vérification de signature.',
    metadata: 'Voir les métadonnées ordinaires', signedSample: 'Tester un exemple signé', retrySample: 'Réessayer l’exemple signé',
    unsupportedMetadata: 'Le lecteur de métadonnées ne prend pas en charge ce format. Utilisez « Remplacer » pour choisir une image JPEG ou PNG.',
    sampleNote: 'Découvrez le résultat d’une image de test Adobe signée.',
    fileDetails: 'Détails du fichier', size: 'Taille du fichier', dimensions: 'Dimensions', previewUnavailable: 'Aperçu indisponible',
    diagnostics: 'Diagnostic technique', diagnosticsNote: 'Résultat du vérificateur et rapport JSON complet', hashCopied: 'SHA-256 copié',
  },
} as const;

export const c2paEmptyMessages = (locale: Locale) => emptyMessages[locale];

const validationCopy: Record<string, [string, string]> = {
  'claimSignature.validated': ['签名匹配', '活动声明的加密签名验证通过。'],
  'claimSignature.insideValidity': ['证书在有效期内', '签名时间位于凭证有效期内。'],
  'signingCredential.trusted': ['发布者可信', '签名凭证可以链接到已配置的信任根。'],
  'signingCredential.untrusted': ['发布者未受信任', '签名凭证无法链接到已配置的信任根。'],
  'signingCredential.ocsp.notRevoked': ['凭证未被吊销', '可用的吊销信息未将该签名凭证标记为已吊销。'],
  'signingCredential.ocsp.revoked': ['凭证已吊销', '吊销服务报告该签名凭证已被吊销。'],
  'signingCredential.ocsp.skipped': ['已跳过吊销检查', '未发起在线吊销查询。'],
  'signingCredential.ocsp.inaccessible': ['吊销服务不可用', '无法访问凭证吊销服务。'],
  'assertion.dataHash.match': ['文件绑定匹配', '签名数据哈希与当前文件匹配。'],
  'assertion.dataHash.mismatch': ['文件绑定不匹配', '签名数据哈希与当前文件不匹配。'],
  'assertion.bmffHash.match': ['媒体绑定匹配', '签名 BMFF 哈希与当前媒体文件匹配。'],
  'assertion.bmffHash.mismatch': ['媒体绑定不匹配', '签名 BMFF 哈希与当前媒体文件不匹配。'],
  'assertion.boxesHash.match': ['容器绑定匹配', '签名容器哈希与当前文件匹配。'],
  'assertion.boxesHash.mismatch': ['容器绑定不匹配', '签名容器哈希与当前文件不匹配。'],
  'assertion.collectionHash.match': ['集合绑定匹配', '签名集合哈希与当前资产匹配。'],
  'assertion.collectionHash.mismatch': ['集合绑定不匹配', '签名集合哈希与当前资产不匹配。'],
};

const validationCopyDe: Record<string, [string, string]> = {
  'claimSignature.validated': ['Signatur stimmt überein', 'Die kryptografische Signatur der aktiven Aussage wurde erfolgreich verifiziert.'],
  'claimSignature.insideValidity': ['Zertifikat war gültig', 'Der Signaturzeitpunkt liegt innerhalb der Gültigkeitsdauer des Credentials.'],
  'signingCredential.trusted': ['Herausgeber vertrauenswürdig', 'Das Signatur-Credential lässt sich mit einem konfigurierten Vertrauensanker verbinden.'],
  'signingCredential.untrusted': ['Herausgeber nicht vertrauenswürdig', 'Das Signatur-Credential lässt sich mit keinem konfigurierten Vertrauensanker verbinden.'],
  'signingCredential.ocsp.notRevoked': ['Credential nicht widerrufen', 'Die verfügbaren Widerrufsdaten markieren das Signatur-Credential nicht als widerrufen.'],
  'signingCredential.ocsp.revoked': ['Credential widerrufen', 'Der Widerrufsdienst meldet das Signatur-Credential als widerrufen.'],
  'signingCredential.ocsp.skipped': ['Widerrufsprüfung übersprungen', 'Es wurde keine Online-Abfrage zum Widerruf durchgeführt.'],
  'signingCredential.ocsp.inaccessible': ['Widerrufsdienst nicht erreichbar', 'Der Dienst zur Prüfung des Zertifikatswiderrufs war nicht erreichbar.'],
  'assertion.dataHash.match': ['Dateibindung stimmt überein', 'Der signierte Daten-Hash passt zur aktuellen Datei.'],
  'assertion.dataHash.mismatch': ['Dateibindung stimmt nicht überein', 'Der signierte Daten-Hash passt nicht zur aktuellen Datei.'],
  'assertion.bmffHash.match': ['Medienbindung stimmt überein', 'Der signierte BMFF-Hash passt zur aktuellen Mediendatei.'],
  'assertion.bmffHash.mismatch': ['Medienbindung stimmt nicht überein', 'Der signierte BMFF-Hash passt nicht zur aktuellen Mediendatei.'],
  'assertion.boxesHash.match': ['Containerbindung stimmt überein', 'Der signierte Container-Hash passt zur aktuellen Datei.'],
  'assertion.boxesHash.mismatch': ['Containerbindung stimmt nicht überein', 'Der signierte Container-Hash passt nicht zur aktuellen Datei.'],
  'assertion.collectionHash.match': ['Sammlungsbindung stimmt überein', 'Der signierte Sammlungs-Hash passt zum aktuellen Asset.'],
  'assertion.collectionHash.mismatch': ['Sammlungsbindung stimmt nicht überein', 'Der signierte Sammlungs-Hash passt nicht zum aktuellen Asset.'],
};

const validationCopyFr: Record<string, [string, string]> = {
  'claimSignature.validated': ['Signature correspondante', 'La signature cryptographique de la déclaration active a été vérifiée.'],
  'claimSignature.insideValidity': ['Certificat dans sa période de validité', 'La date de signature se situe dans la période de validité de l’information d’authenticité.'],
  'signingCredential.trusted': ['Émetteur de confiance', 'L’information de signature mène à une racine de confiance configurée.'],
  'signingCredential.untrusted': ['Émetteur non approuvé', 'L’information de signature ne mène à aucune racine de confiance configurée.'],
  'signingCredential.ocsp.notRevoked': ['Information non révoquée', 'Les données de révocation disponibles ne signalent pas l’information de signature comme révoquée.'],
  'signingCredential.ocsp.revoked': ['Information révoquée', 'Le service de révocation indique que l’information de signature a été révoquée.'],
  'signingCredential.ocsp.skipped': ['Contrôle de révocation ignoré', 'Aucune requête de révocation en ligne n’a été effectuée.'],
  'signingCredential.ocsp.inaccessible': ['Service de révocation inaccessible', 'Le service de révocation du certificat n’était pas accessible.'],
  'assertion.dataHash.match': ['Liaison au fichier correcte', 'L’empreinte de données signée correspond au fichier actuel.'],
  'assertion.dataHash.mismatch': ['Liaison au fichier incorrecte', 'L’empreinte de données signée ne correspond pas au fichier actuel.'],
  'assertion.bmffHash.match': ['Liaison au média correcte', 'L’empreinte BMFF signée correspond au média actuel.'],
  'assertion.bmffHash.mismatch': ['Liaison au média incorrecte', 'L’empreinte BMFF signée ne correspond pas au média actuel.'],
  'assertion.boxesHash.match': ['Liaison au conteneur correcte', 'L’empreinte signée du conteneur correspond au fichier actuel.'],
  'assertion.boxesHash.mismatch': ['Liaison au conteneur incorrecte', 'L’empreinte signée du conteneur ne correspond pas au fichier actuel.'],
  'assertion.collectionHash.match': ['Liaison à la collection correcte', 'L’empreinte signée de la collection correspond au contenu actuel.'],
  'assertion.collectionHash.mismatch': ['Liaison à la collection incorrecte', 'L’empreinte signée de la collection ne correspond pas au contenu actuel.'],
};

const additionalValidationCopy: Record<string, Record<Locale, [string, string]>> = {
  'timeStamp.validated': {
    en: ['Time stamp validated', 'The time stamp matches the claim signature and falls within its time-stamp certificate’s validity period.'],
    'zh-CN': ['时间戳验证通过', '时间戳与声明签名匹配，且签发时间在时间戳证书的有效期内。'],
    de: ['Zeitstempel bestätigt', 'Der Zeitstempel passt zur Signatur der Aussage und liegt in der Gültigkeitsdauer seines Zertifikats.'],
    fr: ['Horodatage validé', 'L’horodatage correspond à la signature de la déclaration et respecte la période de validité de son certificat.'],
  },
  'timeStamp.trusted': {
    en: ['Time-stamp authority trusted', 'The verifier trusts the time-stamp credential. This does not establish trust in the publisher.'],
    'zh-CN': ['时间戳机构可信', '验证器信任这份时间戳凭证；这不代表发布者已经通过信任检查。'],
    de: ['Zeitstempeldienst vertrauenswürdig', 'Der Verifier vertraut dem Zeitstempelzertifikat. Das bestätigt nicht das Vertrauen in den Herausgeber.'],
    fr: ['Autorité d’horodatage de confiance', 'Le vérificateur fait confiance au certificat d’horodatage. Cela ne confirme pas la confiance dans l’émetteur.'],
  },
  'assertion.hashedURI.match': {
    en: ['Assertion hash matches', 'The referenced assertion matches the hash recorded in the claim.'],
    'zh-CN': ['断言哈希匹配', '引用的断言与声明中记录的哈希值匹配。'],
    de: ['Assertion-Hash stimmt überein', 'Die referenzierte Assertion passt zum in der Aussage gespeicherten Hash.'],
    fr: ['Empreinte de l’assertion correcte', 'L’assertion référencée correspond à l’empreinte enregistrée dans la déclaration.'],
  },
};

export function localizeC2paValidation(entry: C2paValidationEntry, locale: Locale): Pick<C2paValidationEntry, 'title' | 'explanation'> {
  const additional = additionalValidationCopy[entry.code]?.[locale];
  if (additional) return { title: additional[0], explanation: additional[1] };
  if (locale === 'en') return entry;
  const copy = (locale === 'zh-CN' ? validationCopy : locale === 'de' ? validationCopyDe : validationCopyFr)[entry.code];
  return copy ? { title: copy[0], explanation: copy[1] } : entry;
}

const actionCopy: Record<string, Record<Locale, string>> = {
  'c2pa.created': { en: 'Created', 'zh-CN': '创建', de: 'Erstellt', fr: 'Création' },
  'c2pa.opened': { en: 'Opened', 'zh-CN': '打开', de: 'Geöffnet', fr: 'Ouverture' },
  'c2pa.edited': { en: 'Edited', 'zh-CN': '编辑', de: 'Bearbeitet', fr: 'Modification' },
  'c2pa.edited.metadata': { en: 'Metadata edited', 'zh-CN': '修改元数据', de: 'Metadaten bearbeitet', fr: 'Modification des métadonnées' },
  'c2pa.cropped': { en: 'Cropped', 'zh-CN': '裁剪', de: 'Zugeschnitten', fr: 'Recadrage' },
  'c2pa.resized': { en: 'Resized', 'zh-CN': '调整大小', de: 'Größe geändert', fr: 'Redimensionnement' },
  'c2pa.adjustedColor': { en: 'Color adjusted', 'zh-CN': '调整颜色', de: 'Farbe angepasst', fr: 'Réglage des couleurs' },
  'c2pa.color_adjustments': { en: 'Color adjusted', 'zh-CN': '调整颜色', de: 'Farbe angepasst', fr: 'Réglage des couleurs' },
  'c2pa.filtered': { en: 'Filter applied', 'zh-CN': '应用滤镜', de: 'Filter angewendet', fr: 'Application d’un filtre' },
  'c2pa.enhanced': { en: 'Enhanced', 'zh-CN': '增强处理', de: 'Verbessert', fr: 'Amélioration' },
  'c2pa.orientation': { en: 'Orientation changed', 'zh-CN': '调整方向', de: 'Ausrichtung geändert', fr: 'Changement d’orientation' },
  'c2pa.drawing': { en: 'Drawing tools used', 'zh-CN': '绘图操作', de: 'Zeichenwerkzeuge verwendet', fr: 'Utilisation d’outils de dessin' },
  'c2pa.placed': { en: 'Source added', 'zh-CN': '添加素材', de: 'Quelle hinzugefügt', fr: 'Ajout d’une source' },
  'c2pa.removed': { en: 'Source removed', 'zh-CN': '移除素材', de: 'Quelle entfernt', fr: 'Retrait d’une source' },
  'c2pa.deleted': { en: 'Content deleted', 'zh-CN': '删除内容', de: 'Inhalt gelöscht', fr: 'Suppression de contenu' },
  'c2pa.converted': { en: 'Format converted', 'zh-CN': '转换格式', de: 'Format konvertiert', fr: 'Conversion de format' },
  'c2pa.repackaged': { en: 'Repackaged', 'zh-CN': '重新封装', de: 'Neu verpackt', fr: 'Reconditionnement' },
  'c2pa.transcoded': { en: 'Transcoded', 'zh-CN': '转码', de: 'Transkodiert', fr: 'Transcodage' },
  'c2pa.published': { en: 'Published', 'zh-CN': '发布', de: 'Veröffentlicht', fr: 'Publication' },
  'c2pa.watermarked': { en: 'Watermark added', 'zh-CN': '添加水印', de: 'Wasserzeichen hinzugefügt', fr: 'Ajout d’un filigrane' },
};

export function localizeC2paAction(action: Pick<C2paActionSummary, 'action' | 'label'>, locale: Locale): string {
  return actionCopy[action.action]?.[locale] ?? action.label;
}

const c2paErrors: Record<string, Record<Locale, string>> = {
  FILE_TOO_LARGE: {
    en: 'This file exceeds the browser verification limit: 50 MB for images and RAW, 100 MB for other files.',
    'zh-CN': '文件超过浏览器验证上限：图片和 RAW 最大 50 MB，其他文件最大 100 MB。',
    de: 'Die Datei überschreitet das Browserlimit: 50 MB für Bilder und RAW, 100 MB für andere Dateien.',
    fr: 'Le fichier dépasse la limite du navigateur : 50 Mo pour les images et RAW, 100 Mo pour les autres fichiers.',
  },
  INVALID_FILE_SIGNATURE: {
    en: 'The file signature does not match a supported C2PA asset format.',
    'zh-CN': '文件签名不属于此页面支持的 C2PA 文件格式。',
    de: 'Die Dateisignatur gehört zu keinem hier unterstützten C2PA-Format.',
    fr: 'La signature du fichier ne correspond à aucun format C2PA pris en charge ici.',
  },
  C2PA_UNSUPPORTED: {
    en: 'The browser verifier does not support this file format.',
    'zh-CN': '浏览器验证器不支持这个文件格式。',
    de: 'Der Browser-Verifier unterstützt dieses Dateiformat nicht.',
    fr: 'Le vérificateur du navigateur ne prend pas en charge ce format.',
  },
  C2PA_WASM_LOAD_FAILED: {
    en: 'The local verification engine could not start. Allow WebAssembly and Web Workers in your browser, then retry.',
    'zh-CN': '本地验证引擎未能启动。请确认浏览器允许 WebAssembly 和 Web Worker 后重试。',
    de: 'Die lokale Prüf-Engine konnte nicht starten. Erlaube WebAssembly und Web Workers im Browser und versuche es erneut.',
    fr: 'Le moteur local n’a pas pu démarrer. Autorisez WebAssembly et les Web Workers dans le navigateur, puis réessayez.',
  },
  PARSE_TIMEOUT: {
    en: 'Verification took too long and stopped. Retry this file or choose another one.',
    'zh-CN': '验证耗时过长，已经停止。可以重试这个文件，或换一个文件。',
    de: 'Die Prüfung dauerte zu lange und wurde gestoppt. Versuche es erneut oder wähle eine andere Datei.',
    fr: 'La vérification a pris trop de temps et s’est arrêtée. Réessayez ou choisissez un autre fichier.',
  },
  C2PA_VALIDATION_FAILED: {
    en: 'The credential data could not be read. The file may be damaged or use an unsupported C2PA layout.',
    'zh-CN': '无法读取凭证数据。文件可能损坏，或使用了当前引擎不支持的 C2PA 结构。',
    de: 'Die Credential-Daten konnten nicht gelesen werden. Die Datei ist möglicherweise beschädigt oder nutzt eine nicht unterstützte C2PA-Struktur.',
    fr: 'Les données d’authenticité sont illisibles. Le fichier est peut-être endommagé ou utilise une structure C2PA non prise en charge.',
  },
};

export function localizeC2paError(error: unknown, locale: Locale): string {
  if (locale === 'en' && error instanceof Error) return error.message;
  const code = error instanceof MetadataError ? error.code : 'C2PA_VALIDATION_FAILED';
  return (c2paErrors[code] ?? c2paErrors.C2PA_VALIDATION_FAILED!)[locale];
}

const mismatchCopy = {
  extension: {
    en: 'The filename suggests {declared}, but the file bytes identify {actual}.',
    'zh-CN': '文件名显示为 {declared}，但真实文件格式是 {actual}。',
    de: 'Der Dateiname deutet auf {declared} hin, die Dateibytes ergeben jedoch {actual}.',
    fr: 'Le nom indique {declared}, mais les octets du fichier identifient {actual}.',
  },
  mime: {
    en: 'The browser reported {declared}, but the file bytes identify {actual}.',
    'zh-CN': '浏览器报告的类型为 {declared}，但真实文件格式是 {actual}。',
    de: 'Der Browser meldete {declared}, die Dateibytes ergeben jedoch {actual}.',
    fr: 'Le navigateur indique {declared}, mais les octets du fichier identifient {actual}.',
  },
} satisfies Record<string, Record<Locale, string>>;

export function localizeC2paWarning(warning: { code: string; message: string }, locale: Locale): string {
  const extension = warning.code === 'EXTENSION_SIGNATURE_MISMATCH';
  const match = warning.message.match(extension
    ? /^The filename suggests (.+), but the file bytes identify (.+)\.$/
    : /^The browser reported (.+), but the file bytes identify (.+)\.$/);
  return match ? interpolate(mismatchCopy[extension ? 'extension' : 'mime'][locale], { declared: match[1]!, actual: match[2]! }) : warning.message;
}
