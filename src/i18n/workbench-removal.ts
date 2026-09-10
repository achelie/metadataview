import type { Locale } from './core';
import { interpolate } from './workbench-format';

export const removalMessages = {
  "result-verified": {
    "en": "Metadata scan verified. Review the separate content checks below.",
    "zh-CN": "元数据扫描验证通过。请查看下方独立的内容检查。",
    "de": "Metadatenscan bestätigt. Bitte die separaten Inhaltsprüfungen unten beachten.",
    "fr": "Analyse des métadonnées vérifiée. Consultez les contrôles du contenu ci-dessous."
  },
  "result-verified-residual": {
    "en": "Metadata scan verified with residual fields. Review the remaining data and content checks.",
    "zh-CN": "元数据扫描通过，但仍有残留字段。请检查剩余数据和内容验证结果。",
    "de": "Metadatenscan mit Restfeldern bestätigt. Restdaten und Inhaltsprüfungen beachten.",
    "fr": "Métadonnées vérifiées avec des champs résiduels. Vérifiez les données restantes et les contrôles du contenu."
  },
  "result-blocked": {
    "en": "The output failed an integrity check. Download is blocked.",
    "zh-CN": "输出未通过完整性检查，下载已阻止。",
    "de": "Die Ausgabe hat eine Integritätsprüfung nicht bestanden. Der Download ist gesperrt.",
    "fr": "La sortie a échoué au contrôle d’intégrité. Le téléchargement est bloqué."
  },
  "result-incomplete": {
    "en": "The copy was created, but the full metadata scan did not finish.",
    "zh-CN": "副本已生成，但完整元数据扫描没有完成。",
    "de": "Die Kopie wurde erstellt, der vollständige Metadatenscan aber nicht abgeschlossen.",
    "fr": "La copie a été créée, mais l’analyse complète des métadonnées n’a pas abouti."
  },
  "loading-the-local-metadata-engine": {
    "en": "Loading the local metadata engine",
    "zh-CN": "正在加载本地元数据引擎",
    "de": "Lokale Metadaten-Engine wird geladen",
    "fr": "Chargement du moteur local de métadonnées"
  },
  "reading-every-available-metadata-field": {
    "en": "Reading every available metadata field",
    "zh-CN": "正在读取所有可用元数据字段",
    "de": "Alle verfügbaren Metadatenfelder werden gelesen",
    "fr": "Lecture de tous les champs disponibles"
  },
  "building-the-safe-report": {
    "en": "Building the safe report",
    "zh-CN": "正在生成安全报告",
    "de": "Sicherer Bericht wird erstellt",
    "fr": "Création du rapport sûr"
  },
  "choose-an-image": {
    "en": "Choose an image",
    "zh-CN": "选择图片",
    "de": "Bild auswählen",
    "fr": "Choisir une image"
  },
  "choose-a-file": {
    "en": "Choose a file",
    "zh-CN": "选择文件",
    "de": "Datei auswählen",
    "fr": "Choisir un fichier"
  },
  "nothing-is-uploaded": {
    "en": "Nothing is uploaded.",
    "zh-CN": "不会上传。",
    "de": "Kein Upload.",
    "fr": "Rien n’est envoyé."
  },
  "checking-the-real-format-before-a-cleanup-engine-starts": {
    "en": "Checking the real format before a cleanup engine starts.",
    "zh-CN": "清理引擎启动前，先检查真实文件格式。",
    "de": "Vor dem Start der Bereinigung prüfen wir das tatsächliche Dateiformat.",
    "fr": "Vérification du vrai format avant le démarrage du moteur de nettoyage."
  },
  "the-fast-report-is-ready-but-the-full-metadata-scan-did-not-finish-cleanup-can-continue-only-as-an-incomplete-verification": {
    "en": "The fast report is ready, but the full metadata scan did not finish. Cleanup can continue only as an incomplete verification.",
    "zh-CN": "快速报告已经就绪，但完整元数据扫描未完成；继续清理只能得到“不完整验证”。",
    "de": "Der Schnellbericht ist fertig, der vollständige Metadatenscan aber nicht. Die Bereinigung kann nur mit unvollständiger Prüfung fortgesetzt werden.",
    "fr": "Le rapport rapide est prêt, mais l’analyse complète n’a pas abouti. Le nettoyage ne peut continuer qu’avec une vérification incomplète."
  },
  "the-scan-was-canceled": {
    "en": "The scan was canceled.",
    "zh-CN": "扫描已取消。",
    "de": "Der Scan wurde abgebrochen.",
    "fr": "L’analyse a été annulée."
  },
  "the-file-could-not-be-inspected-safely": {
    "en": "The file could not be inspected safely.",
    "zh-CN": "无法安全检查这个文件。",
    "de": "Die Datei konnte nicht sicher geprüft werden.",
    "fr": "Le fichier n’a pas pu être inspecté sans risque."
  },
  "preparing-a-metadata-only-copy-content-checks-run-after-cleanup": {
    "en": "Preparing a metadata-only copy. Content checks run after cleanup.",
    "zh-CN": "正在准备元数据清理副本，完成后会检查内容一致性。",
    "de": "Eine Kopie wird vorbereitet. Inhaltsprüfungen folgen nach der Bereinigung.",
    "fr": "Préparation d’une copie. Les contrôles du contenu suivront le nettoyage."
  },
  "exiftool-is-removing-writable-metadata-locally": {
    "en": "ExifTool is removing writable metadata locally.",
    "zh-CN": "ExifTool 正在本地清除可写元数据。",
    "de": "ExifTool entfernt beschreibbare Metadaten lokal.",
    "fr": "ExifTool retire localement les métadonnées modifiables."
  },
  "qpdf-is-removing-top-level-info-and-xmp-dictionaries-while-rewriting-the-entire-pdf": {
    "en": "qpdf is removing top-level Info and XMP dictionaries while rewriting the entire PDF.",
    "zh-CN": "qpdf 正在完整重写 PDF，并清除顶层 Info 与 XMP 字典。",
    "de": "qpdf schreibt das PDF vollständig neu und entfernt dabei die Info- und XMP-Verzeichnisse auf oberster Ebene.",
    "fr": "qpdf réécrit entièrement le PDF et retire les dictionnaires Info et XMP de premier niveau."
  },
  "loading-the-format-specific-cleanup-engine": {
    "en": "Loading the format-specific cleanup engine.",
    "zh-CN": "正在加载格式专用清理引擎。",
    "de": "Formatspezifische Bereinigungs-Engine wird geladen.",
    "fr": "Chargement du moteur adapté au format."
  },
  "rewriting-metadata-without-re-encoding-the-content": {
    "en": "Rewriting metadata without re-encoding the content.",
    "zh-CN": "正在重写元数据，不重新编码内容。",
    "de": "Metadaten werden neu geschrieben, ohne den Inhalt neu zu kodieren.",
    "fr": "Réécriture des métadonnées sans réencoder le contenu."
  },
  "checking-the-cleaned-container": {
    "en": "Checking the cleaned container.",
    "zh-CN": "正在检查清理后的容器。",
    "de": "Der bereinigte Container wird geprüft.",
    "fr": "Vérification du conteneur nettoyé."
  },
  "the-cleaned-copy-is-being-parsed-again-at-the-same-scan-depth": {
    "en": "The cleaned copy is being parsed again at the same scan depth.",
    "zh-CN": "正在用相同扫描深度重新解析清理副本。",
    "de": "Die bereinigte Kopie wird mit derselben Scantiefe erneut analysiert.",
    "fr": "La copie nettoyée est relue avec la même profondeur d’analyse."
  },
  "cleanup-was-canceled-the-source-file-is-unchanged": {
    "en": "Cleanup was canceled. The source file is unchanged.",
    "zh-CN": "清理已取消，原文件没有改变。",
    "de": "Die Bereinigung wurde abgebrochen. Die Originaldatei bleibt unverändert.",
    "fr": "Le nettoyage a été annulé. Le fichier source reste intact."
  },
  "metadata-cleanup-failed-safely": {
    "en": "Metadata cleanup failed safely.",
    "zh-CN": "元数据清理已安全失败。",
    "de": "Die Metadaten-Bereinigung ist sicher fehlgeschlagen.",
    "fr": "Le nettoyage a échoué sans endommager le fichier."
  },
  "no-downloadable-copy-was-accepted": {
    "en": "No downloadable copy was accepted.",
    "zh-CN": "没有接受任何可下载副本。",
    "de": "Es wurde keine herunterladbare Kopie übernommen.",
    "fr": "Aucune copie téléchargeable n’a été acceptée."
  },
  "your-file-stays-on-this-device": {
    "en": "Your file stays on this device.",
    "zh-CN": "文件只留在这台设备上。",
    "de": "Deine Datei bleibt auf diesem Gerät.",
    "fr": "Votre fichier reste sur cet appareil."
  },
  "one-file-metadata-only": {
    "en": "ONE FILE · METADATA ONLY",
    "zh-CN": "一个文件 · 只清元数据",
    "de": "EINE DATEI · NUR METADATEN",
    "fr": "UN FICHIER · MÉTADONNÉES SEULEMENT"
  },
  "up-to-50-mb": {
    "en": "up to 50 MB",
    "zh-CN": "最大 50 MB",
    "de": "bis 50 MB",
    "fr": "50 Mo maximum"
  },
  "up-to-100-mb": {
    "en": "up to 100 MB",
    "zh-CN": "最大 100 MB",
    "de": "bis 100 MB",
    "fr": "100 Mo maximum"
  },
  "no-re-encoding": {
    "en": "No re-encoding.",
    "zh-CN": "不重新编码。",
    "de": "Keine Neukodierung.",
    "fr": "Aucun réencodage."
  },
  "content-checks-included": {
    "en": "Content checks included.",
    "zh-CN": "包含内容检查。",
    "de": "Inhaltsprüfungen inklusive.",
    "fr": "Contrôles du contenu inclus."
  },
  "could-not-finish-this-file": {
    "en": "Could not finish this file",
    "zh-CN": "这个文件没能处理完",
    "de": "Diese Datei konnte nicht fertig verarbeitet werden",
    "fr": "Impossible de terminer ce fichier"
  },
  "choose-another-file": {
    "en": "Choose another file",
    "zh-CN": "换一个文件",
    "de": "Andere Datei wählen",
    "fr": "Choisir un autre fichier"
  },
  "cleanup-desk": {
    "en": "Cleanup desk",
    "zh-CN": "清理台",
    "de": "Bereinigungsplatz",
    "fr": "Comptoir de nettoyage"
  },
  "replace": {
    "en": "Replace",
    "zh-CN": "替换",
    "de": "Ersetzen",
    "fr": "Remplacer"
  },
  "clear": {
    "en": "Clear",
    "zh-CN": "清除",
    "de": "Leeren",
    "fr": "Effacer"
  },
  "format": {
    "en": "Format",
    "zh-CN": "格式",
    "de": "Format",
    "fr": "Format"
  },
  "source-size": {
    "en": "Source size",
    "zh-CN": "原文件大小",
    "de": "Originalgröße",
    "fr": "Taille source"
  },
  "fields-read": {
    "en": "Fields read",
    "zh-CN": "已读字段",
    "de": "Gelesene Felder",
    "fr": "Champs lus"
  },
  "eligible": {
    "en": "Eligible",
    "zh-CN": "可清除",
    "de": "Entfernbar",
    "fr": "Nettoyables"
  },
  "engine": {
    "en": "Engine",
    "zh-CN": "引擎",
    "de": "Engine",
    "fr": "Moteur"
  },
  "this-file-carries-a-signature": {
    "en": "This file carries a signature.",
    "zh-CN": "这个文件带有签名。",
    "de": "Diese Datei trägt eine Signatur.",
    "fr": "Ce fichier porte une signature."
  },
  "changing-metadata-invalidates-c2pa-or-document-signatures-the-original-remains-untouched-but-the-new-copy-cannot-keep-the-old-proof": {
    "en": "Changing metadata invalidates C2PA or document signatures. The original remains untouched, but the new copy cannot keep the old proof.",
    "zh-CN": "修改元数据会让 C2PA 或文档签名失效。原件不会改变，但新副本无法保留旧证明。",
    "de": "Änderungen an Metadaten machen C2PA- oder Dokumentsignaturen ungültig. Das Original bleibt unberührt, die neue Kopie kann den alten Nachweis aber nicht behalten.",
    "fr": "Modifier les métadonnées invalide les signatures C2PA ou de document. L’original reste intact, mais la copie ne peut pas conserver l’ancienne preuve."
  },
  "i-understand-clean-a-copy": {
    "en": "I understand — clean a copy",
    "zh-CN": "我明白，生成清理副本",
    "de": "Verstanden — Kopie bereinigen",
    "fr": "Je comprends — nettoyer une copie"
  },
  "cancel": {
    "en": "Cancel",
    "zh-CN": "取消",
    "de": "Abbrechen",
    "fr": "Annuler"
  },
  "content-preserving-policy": {
    "en": "Content-preserving policy",
    "zh-CN": "内容保留策略",
    "de": "Inhaltserhaltende Methode",
    "fr": "Politique de conservation du contenu"
  },
  "remove-labels-keep-the-actual-file": {
    "en": "Remove labels. Keep the actual file.",
    "zh-CN": "清标签，保留真正的文件。",
    "de": "Etiketten weg. Die eigentliche Datei bleibt.",
    "fr": "Retirez les étiquettes. Gardez le vrai fichier."
  },
  "descriptive-identity-location-software-date-and-custom-fields-are-targeted-cover-art-chapters-subtitles-attachments-comments-revisions-icc-color-orientation-and-media-tracks-stay": {
    "en": "Descriptive, identity, location, software, date, and custom fields are targeted. Cover art, chapters, subtitles, attachments, comments, revisions, ICC color, orientation, and media tracks stay.",
    "zh-CN": "目标是描述、身份、位置、软件、日期和自定义字段；封面、章节、字幕、附件、评论、修订、ICC 色彩、方向和媒体轨道会保留。",
    "de": "Entfernt werden Beschreibungs-, Identitäts-, Standort-, Software-, Datums- und benutzerdefinierte Felder. Cover, Kapitel, Untertitel, Anhänge, Kommentare, Revisionen, ICC-Farben, Ausrichtung und Medienspuren bleiben erhalten.",
    "fr": "Les champs descriptifs, d’identité, de lieu, de logiciel, de date et personnalisés sont ciblés. Pochettes, chapitres, sous-titres, pièces jointes, commentaires, révisions, couleur ICC, orientation et pistes restent."
  },
  "create-and-verify-clean-copy": {
    "en": "Create and verify clean copy",
    "zh-CN": "生成并验证清理副本",
    "de": "Saubere Kopie erstellen und prüfen",
    "fr": "Créer et vérifier la copie nettoyée"
  },
  "canceled-the-source-file-is-unchanged": {
    "en": "Canceled. The source file is unchanged.",
    "zh-CN": "已取消，原文件没有改变。",
    "de": "Abgebrochen. Die Originaldatei bleibt unverändert.",
    "fr": "Annulé. Le fichier source reste intact."
  },
  "verification-result": {
    "en": "Verification result",
    "zh-CN": "验证结果",
    "de": "Prüfergebnis",
    "fr": "Résultat de la vérification"
  },
  "verified": {
    "en": "Verified",
    "zh-CN": "验证通过",
    "de": "Bestätigt",
    "fr": "Vérifié"
  },
  "verified-with-residual-metadata": {
    "en": "Verified with residual metadata",
    "zh-CN": "验证通过，但有残留元数据",
    "de": "Bestätigt, mit Rest-Metadaten",
    "fr": "Vérifié avec métadonnées résiduelles"
  },
  "output-blocked": {
    "en": "Output blocked",
    "zh-CN": "输出已阻止",
    "de": "Ausgabe gesperrt",
    "fr": "Sortie bloquée"
  },
  "verification-incomplete": {
    "en": "Verification incomplete",
    "zh-CN": "验证不完整",
    "de": "Prüfung unvollständig",
    "fr": "Vérification inachevée"
  },
  "removed": {
    "en": "Removed",
    "zh-CN": "已清除",
    "de": "Entfernt",
    "fr": "Retirés"
  },
  "preserved": {
    "en": "Preserved",
    "zh-CN": "已保留",
    "de": "Behalten",
    "fr": "Conservés"
  },
  "residual": {
    "en": "Residual",
    "zh-CN": "残留",
    "de": "Verblieben",
    "fr": "Résiduels"
  },
  "removed-fields": {
    "en": "Removed fields",
    "zh-CN": "已清除字段",
    "de": "Entfernte Felder",
    "fr": "Champs retirés"
  },
  "no-eligible-fields-were-present-in-the-source-report": {
    "en": "No eligible fields were present in the source report.",
    "zh-CN": "原报告中没有可清除字段。",
    "de": "Im Ausgangsbericht waren keine entfernbaren Felder vorhanden.",
    "fr": "Le rapport source ne contenait aucun champ nettoyable."
  },
  "intentionally-preserved": {
    "en": "Intentionally preserved",
    "zh-CN": "有意保留",
    "de": "Bewusst beibehalten",
    "fr": "Conservés volontairement"
  },
  "residual-metadata": {
    "en": "Residual metadata",
    "zh-CN": "残留元数据",
    "de": "Rest-Metadaten",
    "fr": "Métadonnées résiduelles"
  },
  "no-eligible-residual-fields-were-found": {
    "en": "No eligible residual fields were found.",
    "zh-CN": "没有发现可清除的残留字段。",
    "de": "Es wurden keine entfernbaren Restfelder gefunden.",
    "fr": "Aucun champ résiduel nettoyable trouvé."
  },
  "download-clean-copy": {
    "en": "Download clean copy",
    "zh-CN": "下载清理副本",
    "de": "Saubere Kopie herunterladen",
    "fr": "Télécharger la copie nettoyée"
  },
  "download-receipt": {
    "en": "Download receipt",
    "zh-CN": "下载英文收据",
    "de": "Englischen Beleg herunterladen",
    "fr": "Télécharger le reçu en anglais"
  },
  "the-original-report-is-ready-for-another-local-cleanup": {
    "en": "The original report is ready for another local cleanup.",
    "zh-CN": "原报告已就绪，可以再次本地清理。",
    "de": "Der Ausgangsbericht ist bereit für eine weitere lokale Bereinigung.",
    "fr": "Le rapport d’origine est prêt pour un autre nettoyage local."
  },
  "start-over": {
    "en": "Start over",
    "zh-CN": "重新开始",
    "de": "Neu beginnen",
    "fr": "Recommencer"
  },
  "status-idle": {
    "en": "Waiting for a file",
    "de": "Warte auf eine Datei",
    "fr": "En attente d’un fichier",
    "zh-CN": "等待选择文件"
  },
  "status-inspecting": {
    "en": "Scanning the original file",
    "de": "Originaldatei wird geprüft",
    "fr": "Analyse du fichier original",
    "zh-CN": "正在扫描原文件"
  },
  "status-ready": {
    "en": "Ready to create a clean copy",
    "de": "Bereit für eine saubere Kopie",
    "fr": "Prêt à créer une copie nettoyée",
    "zh-CN": "可以生成清理副本"
  },
  "status-cleaning": {
    "en": "Removing writable metadata",
    "de": "Beschreibbare Metadaten werden entfernt",
    "fr": "Suppression des métadonnées modifiables",
    "zh-CN": "正在清除可写元数据"
  },
  "status-verifying": {
    "en": "Rescanning the output",
    "de": "Ausgabedatei wird erneut geprüft",
    "fr": "Nouvelle analyse de la sortie",
    "zh-CN": "正在复扫输出文件"
  },
  "status-complete": {
    "en": "Verification finished",
    "de": "Prüfung abgeschlossen",
    "fr": "Vérification terminée",
    "zh-CN": "验证完成"
  },
  "status-failed": {
    "en": "Stopped safely",
    "de": "Sicher gestoppt",
    "fr": "Arrêté sans risque",
    "zh-CN": "已安全停止"
  },
  "status-canceled": {
    "en": "Canceled",
    "de": "Abgebrochen",
    "fr": "Annulé",
    "zh-CN": "已取消"
  },
  "size-limit": {
    "en": "Files are limited to {limit} MB.",
    "zh-CN": "文件上限为 {limit} MB。",
    "de": "Dateien dürfen höchstens {limit} MB groß sein.",
    "fr": "Les fichiers sont limités à {limit} Mo."
  },
  "eligible-count": {
    "en": "Found {count} removable-looking fields. The source file is unchanged.",
    "zh-CN": "发现 {count} 个可能可清除的字段，原文件没有改变。",
    "de": "{count} vermutlich entfernbare Felder gefunden. Die Originaldatei bleibt unverändert.",
    "fr": "{count} champs probablement nettoyables trouvés. Le fichier source reste intact."
  },
  "drop-file": {
    "en": "Drop a file here",
    "zh-CN": "把文件拖到这里",
    "de": "Datei hier ablegen",
    "fr": "Déposez un fichier ici"
  },
  "drop-image": {
    "en": "Drop an image here",
    "zh-CN": "把图片拖到这里",
    "de": "Bild hier ablegen",
    "fr": "Déposez une image ici"
  }
} as const satisfies Record<string, Record<Locale, string>>;
export type removalMessageKey = keyof typeof removalMessages;
export const removalTranslator = (locale: Locale) => (key: removalMessageKey, values: Record<string, string | number> = {}): string => interpolate(removalMessages[key][locale], values);
