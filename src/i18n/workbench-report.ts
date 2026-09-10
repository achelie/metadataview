import type { Locale } from './core';
import { interpolate } from './workbench-format';

export const reportMessages = {
  "scan-canceled": {
    "en": "Deep scan canceled; the initial report remains available",
    "zh-CN": "深度扫描已取消，初步报告仍可使用",
    "de": "Tiefenscan abgebrochen; der erste Bericht bleibt verfügbar",
    "fr": "Analyse approfondie annulée ; le premier rapport reste disponible"
  },
  "export-wait": {
    "en": "Exports unlock when the local scan finishes. Copy visible remains available now.",
    "zh-CN": "扫描完成后才能导出，现在仍可复制可见字段。",
    "de": "Der Export wird nach dem Scan freigeschaltet. Sichtbare Felder lassen sich jetzt kopieren.",
    "fr": "Les exports seront disponibles après l’analyse. La copie des champs visibles reste possible."
  },
  "show-all": {
    "en": "Show all {count} characters",
    "zh-CN": "显示全部 {count} 个字符",
    "de": "Alle {count} Zeichen anzeigen",
    "fr": "Afficher les {count} caractères"
  },
  "alternates": {
    "en": "{count} parser alternatives",
    "zh-CN": "{count} 个解析器备选值",
    "de": "{count} Parser-Alternativwerte",
    "fr": "{count} alternatives de l’analyseur"
  },
  "copy-field": {
    "en": "Copy {name}",
    "zh-CN": "复制 {name}",
    "de": "{name} kopieren",
    "fr": "Copier {name}"
  },
  "size-error": {
    "en": "This file is {size} MB. The viewer stops at {limit}.",
    "zh-CN": "这个文件有 {size} MB，查看器上限为 {limit}。",
    "de": "Diese Datei ist {size} MB groß. Die Grenze ist {limit}.",
    "fr": "Ce fichier pèse {size} Mo. La limite est {limit}."
  },
  "extra-files": {
    "en": "Inspecting the first file locally; {count} extra files ignored",
    "zh-CN": "只在本地检查第一个文件，另外 {count} 个文件已忽略",
    "de": "Die erste Datei wird lokal geprüft; {count} weitere Dateien ignoriert",
    "fr": "Analyse locale du premier fichier ; {count} fichiers ignorés"
  },
  "initial-report": {
    "en": "Initial report ready · {count} native fields; the deep scan is running below{ignored}",
    "zh-CN": "初步报告已就绪 · {count} 个原生字段；深度扫描正在运行{ignored}",
    "de": "Erster Bericht fertig · {count} native Felder; der Tiefenscan läuft{ignored}",
    "fr": "Premier rapport prêt · {count} champs natifs ; analyse approfondie en cours{ignored}"
  },
  "pdf-error": {
    "en": "The PDF could not be built ({reason}). The JSON report is still available.",
    "zh-CN": "PDF 无法生成（{reason}），JSON 报告仍可下载。",
    "de": "Das PDF konnte nicht erstellt werden ({reason}). JSON bleibt verfügbar.",
    "fr": "Impossible de créer le PDF ({reason}). Le rapport JSON reste disponible."
  },
  "drop-file": {
    "en": "Drop a file here",
    "zh-CN": "把文件拖到这里",
    "de": "Datei hier ablegen",
    "fr": "Déposez un fichier ici"
  },
  "file-report": {
    "en": "{name} metadata report",
    "zh-CN": "{name} 元数据报告",
    "de": "Metadatenbericht für {name}",
    "fr": "Rapport de métadonnées pour {name}"
  },
  "file-preview": {
    "en": "Local preview of {name}",
    "zh-CN": "{name} 的本地预览",
    "de": "Lokale Vorschau von {name}",
    "fr": "Aperçu local de {name}"
  },
  "warning-count": {
    "en": "{count} parser notes",
    "zh-CN": "{count} 条解析器提醒",
    "de": "{count} Parser-Hinweise",
    "fr": "{count} notes de l’analyseur"
  },
  "sensitive-count": {
    "en": "{count} potentially sensitive fields found",
    "zh-CN": "发现 {count} 个可能敏感的字段",
    "de": "{count} möglicherweise sensible Felder gefunden",
    "fr": "{count} champs potentiellement sensibles trouvés"
  },
  "found-count": {
    "en": "{count} found",
    "zh-CN": "找到 {count} 个",
    "de": "{count} gefunden",
    "fr": "{count} trouvé(s)"
  },
  "render-count": {
    "en": "{count} of {total} currently rendered",
    "zh-CN": "当前已渲染 {count} / {total}",
    "de": "{count} von {total} derzeit angezeigt",
    "fr": "{count} sur {total} affichés"
  },
  "header-count": {
    "en": "File header · first {count} bytes",
    "zh-CN": "文件头 · 前 {count} 字节",
    "de": "Dateikopf · erste {count} Bytes",
    "fr": "En-tête · {count} premiers octets"
  },
  "visible-copied": {
    "en": "{count} visible fields copied",
    "zh-CN": "{count} 个可见字段已复制",
    "de": "{count} sichtbare Felder kopiert",
    "fr": "{count} champs visibles copiés"
  },
  "sensitive": {
    "en": "Sensitive",
    "zh-CN": "敏感",
    "de": "Sensibel",
    "fr": "Sensible"
  },
  "binary-payload": {
    "en": "Binary payload",
    "zh-CN": "二进制载荷",
    "de": "Binärdaten",
    "fr": "Charge binaire"
  },
  "binary": {
    "en": "binary",
    "zh-CN": "二进制",
    "de": "binär",
    "fr": "binaire"
  },
  "raw-value": {
    "en": "Raw value",
    "zh-CN": "原始值",
    "de": "Rohwert",
    "fr": "Valeur brute"
  },
  "show-less": {
    "en": "Show less",
    "zh-CN": "收起",
    "de": "Weniger anzeigen",
    "fr": "Afficher moins"
  },
  "file-header-hexadecimal-dump": {
    "en": "File header hexadecimal dump",
    "zh-CN": "文件头十六进制转储",
    "de": "Hexadezimalansicht des Dateikopfs",
    "fr": "Vue hexadécimale de l’en-tête"
  },
  "offset": {
    "en": "Offset",
    "zh-CN": "偏移",
    "de": "Offset",
    "fr": "Décalage"
  },
  "hex": {
    "en": "Hex",
    "zh-CN": "十六进制",
    "de": "Hex",
    "fr": "Hex"
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
  "waiting-for-a-file": {
    "en": "Waiting for a file",
    "zh-CN": "等待选择文件",
    "de": "Warte auf eine Datei",
    "fr": "En attente d’un fichier"
  },
  "exiftool-could-not-inspect-this-file": {
    "en": "ExifTool could not inspect this file.",
    "zh-CN": "ExifTool 无法检查这个文件。",
    "de": "ExifTool konnte diese Datei nicht prüfen.",
    "fr": "ExifTool n’a pas pu analyser ce fichier."
  },
  "stopped-before-parsing": {
    "en": "Stopped before parsing",
    "zh-CN": "解析开始前已停止",
    "de": "Vor der Analyse gestoppt",
    "fr": "Arrêt avant l’analyse"
  },
  "reading-structure-and-computing-two-checksums-locally": {
    "en": "Reading structure and computing two checksums locally",
    "zh-CN": "正在本地读取结构并计算两种校验和",
    "de": "Struktur wird lokal gelesen und zwei Prüfsummen werden berechnet",
    "fr": "Lecture de la structure et calcul local de deux sommes de contrôle"
  },
  "the-local-parser-could-not-read-this-file": {
    "en": "The local parser could not read this file.",
    "zh-CN": "本地解析器无法读取这个文件。",
    "de": "Der lokale Parser konnte diese Datei nicht lesen.",
    "fr": "L’analyseur local n’a pas pu lire ce fichier."
  },
  "stopped-safely": {
    "en": "Stopped safely",
    "zh-CN": "已安全停止",
    "de": "Sicher gestoppt",
    "fr": "Arrêté sans risque"
  },
  "clipboard-access-was-blocked-by-this-browser": {
    "en": "Clipboard access was blocked by this browser",
    "zh-CN": "浏览器阻止了剪贴板访问",
    "de": "Der Browser hat den Zugriff auf die Zwischenablage blockiert",
    "fr": "Le navigateur a bloqué l’accès au presse-papiers"
  },
  "raw-safe-json-downloaded": {
    "en": "Raw safe JSON downloaded",
    "zh-CN": "原始安全 JSON 已下载",
    "de": "Sicheres Roh-JSON heruntergeladen",
    "fr": "JSON brut sûr téléchargé"
  },
  "complete-json-report-downloaded": {
    "en": "Complete JSON report downloaded",
    "zh-CN": "完整 JSON 报告已下载",
    "de": "Vollständiger englischer JSON-Bericht heruntergeladen",
    "fr": "Rapport JSON complet téléchargé"
  },
  "building-the-readable-pdf-in-this-tab": {
    "en": "Building the readable PDF in this tab",
    "zh-CN": "正在当前标签页生成英文 PDF",
    "de": "Das englische PDF wird in diesem Tab erstellt",
    "fr": "Création du PDF lisible dans cet onglet"
  },
  "readable-pdf-report-downloaded-json-remains-the-complete-record": {
    "en": "Readable PDF report downloaded; JSON remains the complete record",
    "zh-CN": "英文 PDF 已下载；JSON 仍是完整记录",
    "de": "Englischer PDF-Bericht heruntergeladen; JSON bleibt der vollständige Datensatz",
    "fr": "PDF téléchargé ; JSON reste le registre complet"
  },
  "unknown-browser-error": {
    "en": "Unknown browser error",
    "zh-CN": "未知浏览器错误",
    "de": "Unbekannter Browserfehler",
    "fr": "Erreur inconnue du navigateur"
  },
  "your-file-stays-on-this-device": {
    "en": "Your file stays on this device.",
    "zh-CN": "文件只留在这台设备上。",
    "de": "Deine Datei bleibt auf diesem Gerät.",
    "fr": "Votre fichier reste sur cet appareil."
  },
  "one-file-processed-locally": {
    "en": "One file · processed locally",
    "zh-CN": "一个文件 · 本地处理",
    "de": "Eine Datei · lokal verarbeitet",
    "fr": "Un fichier · traité localement"
  },
  "up-to": {
    "en": "up to",
    "zh-CN": "最大",
    "de": "bis",
    "fr": "jusqu’à"
  },
  "exiftool-loads-after-you-choose-a-file": {
    "en": "ExifTool loads after you choose a file.",
    "zh-CN": "选好文件后才加载 ExifTool。",
    "de": "ExifTool wird erst nach der Dateiauswahl geladen.",
    "fr": "ExifTool se charge seulement après le choix du fichier."
  },
  "nothing-is-uploaded": {
    "en": "Nothing is uploaded.",
    "zh-CN": "不会上传任何内容。",
    "de": "Nichts wird hochgeladen.",
    "fr": "Rien n’est envoyé."
  },
  "photo-metadata-highlights": {
    "en": "Photo metadata highlights",
    "zh-CN": "照片元数据重点",
    "de": "Foto-Metadaten im Überblick",
    "fr": "Points clés des métadonnées photo"
  },
  "view-exif-data-gps-location-camera-settings-date-taken-and-file-metadata-directly-in-your-browser": {
    "en": "View EXIF data, GPS location, camera settings, date taken and file metadata directly in your browser.",
    "zh-CN": "直接在浏览器里查看 EXIF、GPS 位置、相机设置、拍摄日期和文件元数据。",
    "de": "EXIF-Daten, GPS-Standort, Kameraeinstellungen, Aufnahmedatum und Dateimetadaten direkt im Browser ansehen.",
    "fr": "Consultez EXIF, position GPS, réglages de l’appareil, date de prise de vue et métadonnées du fichier directement dans votre navigateur."
  },
  "camera-lens": {
    "en": "Camera & Lens",
    "zh-CN": "相机与镜头",
    "de": "Kamera & Objektiv",
    "fr": "Appareil et objectif"
  },
  "gps-location": {
    "en": "GPS Location",
    "zh-CN": "GPS 位置",
    "de": "GPS-Standort",
    "fr": "Position GPS"
  },
  "date-taken": {
    "en": "Date Taken",
    "zh-CN": "拍摄日期",
    "de": "Aufnahmedatum",
    "fr": "Date de prise de vue"
  },
  "full-metadata": {
    "en": "Full Metadata",
    "zh-CN": "完整元数据",
    "de": "Vollständige Metadaten",
    "fr": "Métadonnées complètes"
  },
  "local-inspection": {
    "en": "Local inspection",
    "zh-CN": "本地检查",
    "de": "Lokale Prüfung",
    "fr": "Inspection locale"
  },
  "reading-the-bytes-once": {
    "en": "Reading the bytes once.",
    "zh-CN": "只读一遍文件字节。",
    "de": "Die Dateibytes werden einmal gelesen.",
    "fr": "Lecture unique des octets."
  },
  "this-file-stopped-at-the-door": {
    "en": "This file stopped at the door.",
    "zh-CN": "这个文件没能进门。",
    "de": "Diese Datei kam nicht durch die Tür.",
    "fr": "Ce fichier s’est arrêté à l’entrée."
  },
  "cancel": {
    "en": "Cancel",
    "zh-CN": "取消",
    "de": "Abbrechen",
    "fr": "Annuler"
  },
  "choose-another-file": {
    "en": "Choose another file",
    "zh-CN": "换一个文件",
    "de": "Andere Datei wählen",
    "fr": "Choisir un autre fichier"
  },
  "report-ready-bytes-stayed-local": {
    "en": "Report ready · bytes stayed local",
    "zh-CN": "报告已就绪 · 文件字节留在本机",
    "de": "Bericht fertig · Dateibytes blieben lokal",
    "fr": "Rapport prêt · octets restés en local"
  },
  "a-practical-reading-first-then-the-exact-exiftool-paths-when-you-need-receipts": {
    "en": "A practical reading first, then the exact ExifTool paths when you need receipts.",
    "zh-CN": "先看实用摘要，需要核对时再看精确的 ExifTool 路径。",
    "de": "Zuerst die praktische Zusammenfassung, bei Bedarf danach die exakten ExifTool-Pfade.",
    "fr": "D’abord une lecture pratique, puis les chemins ExifTool exacts quand vous devez vérifier."
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
  "photo-quick-read": {
    "en": "Photo quick read",
    "zh-CN": "照片快速摘要",
    "de": "Foto-Schnellübersicht",
    "fr": "Résumé rapide de la photo"
  },
  "the-photo-details-people-check-first-missing-means-this-file-did-not-expose-a-usable-value": {
    "en": "The photo details people check first. Missing means this file did not expose a usable value.",
    "zh-CN": "先看最常用的照片信息；“未找到”表示文件没有提供可用值。",
    "de": "Die wichtigsten Fotodaten zuerst. „Nicht gefunden“ bedeutet, dass die Datei keinen nutzbaren Wert enthält.",
    "fr": "Les détails photo les plus consultés. « Introuvable » signifie que le fichier ne fournit pas de valeur exploitable."
  },
  "open-map": {
    "en": "Open map",
    "zh-CN": "打开地图",
    "de": "Karte öffnen",
    "fr": "Ouvrir la carte"
  },
  "not-found": {
    "en": "Not found",
    "zh-CN": "未找到",
    "de": "Nicht gefunden",
    "fr": "Introuvable"
  },
  "full-metadata-continues-below": {
    "en": "Full metadata continues below",
    "zh-CN": "下方继续显示完整元数据",
    "de": "Vollständige Metadaten folgen unten",
    "fr": "Les métadonnées complètes continuent ci-dessous"
  },
  "file-summary": {
    "en": "File summary",
    "zh-CN": "文件摘要",
    "de": "Dateiübersicht",
    "fr": "Résumé du fichier"
  },
  "sha-256-primary-fingerprint": {
    "en": "SHA-256 · primary fingerprint",
    "zh-CN": "SHA-256 · 主要指纹",
    "de": "SHA-256 · primärer Fingerabdruck",
    "fr": "SHA-256 · empreinte principale"
  },
  "copy-sha-256": {
    "en": "Copy SHA-256",
    "zh-CN": "复制 SHA-256",
    "de": "SHA-256 kopieren",
    "fr": "Copier SHA-256"
  },
  "sha-256-copied": {
    "en": "SHA-256 copied",
    "zh-CN": "SHA-256 已复制",
    "de": "SHA-256 kopiert",
    "fr": "SHA-256 copié"
  },
  "md5-compatibility-checksum-not-security-proof": {
    "en": "MD5 · compatibility checksum, not security proof",
    "zh-CN": "MD5 · 兼容校验，不是安全证明",
    "de": "MD5 · Kompatibilitätsprüfsumme, kein Sicherheitsnachweis",
    "fr": "MD5 · somme de compatibilité, pas preuve de sécurité"
  },
  "copy-md5": {
    "en": "Copy MD5",
    "zh-CN": "复制 MD5",
    "de": "MD5 kopieren",
    "fr": "Copier MD5"
  },
  "md5-copied": {
    "en": "MD5 copied",
    "zh-CN": "MD5 已复制",
    "de": "MD5 kopiert",
    "fr": "MD5 copié"
  },
  "exiftool-inspection-status": {
    "en": "ExifTool inspection status",
    "zh-CN": "ExifTool 检查状态",
    "de": "ExifTool-Prüfstatus",
    "fr": "État de l’inspection ExifTool"
  },
  "one-pass-image-inspection": {
    "en": "One-pass image inspection",
    "zh-CN": "单次完整图片检查",
    "de": "Bildprüfung in einem Durchlauf",
    "fr": "Inspection de l’image en un passage"
  },
  "deep-field-engine": {
    "en": "Deep field engine",
    "zh-CN": "深度字段引擎",
    "de": "Tiefen-Engine",
    "fr": "Moteur de lecture approfondie"
  },
  "scanning-every-metadata-field": {
    "en": "Scanning every metadata field…",
    "zh-CN": "正在扫描所有元数据字段…",
    "de": "Alle Metadatenfelder werden geprüft…",
    "fr": "Analyse de tous les champs…"
  },
  "full-scan-complete": {
    "en": "Full scan complete",
    "zh-CN": "完整扫描完成",
    "de": "Vollständiger Scan fertig",
    "fr": "Analyse complète terminée"
  },
  "full-scan-incomplete": {
    "en": "Full scan incomplete",
    "zh-CN": "完整扫描未完成",
    "de": "Vollständiger Scan unvollständig",
    "fr": "Analyse complète inachevée"
  },
  "full-image-scan": {
    "en": "Full image scan",
    "zh-CN": "完整图片扫描",
    "de": "Vollständiger Bildscan",
    "fr": "Analyse complète de l’image"
  },
  "exiftool-progress": {
    "en": "ExifTool progress",
    "zh-CN": "ExifTool 进度",
    "de": "ExifTool-Fortschritt",
    "fr": "Progression ExifTool"
  },
  "load-engine": {
    "en": "Load engine",
    "zh-CN": "加载引擎",
    "de": "Engine laden",
    "fr": "Charger le moteur"
  },
  "read-tags": {
    "en": "Read tags",
    "zh-CN": "读取标签",
    "de": "Tags lesen",
    "fr": "Lire les balises"
  },
  "build-report": {
    "en": "Build report",
    "zh-CN": "生成报告",
    "de": "Bericht erstellen",
    "fr": "Créer le rapport"
  },
  "embedded-scan": {
    "en": "Embedded scan",
    "zh-CN": "内嵌扫描",
    "de": "Scan eingebetteter Daten",
    "fr": "Analyse intégrée"
  },
  "standard-scan": {
    "en": "Standard scan",
    "zh-CN": "标准扫描",
    "de": "Standardscan",
    "fr": "Analyse standard"
  },
  "counting": {
    "en": "Counting…",
    "zh-CN": "计数中…",
    "de": "Wird gezählt…",
    "fr": "Comptage…"
  },
  "fields": {
    "en": "fields",
    "zh-CN": "个字段",
    "de": "Felder",
    "fr": "champs"
  },
  "cancel-full-scan": {
    "en": "Cancel full scan",
    "zh-CN": "取消完整扫描",
    "de": "Vollständigen Scan abbrechen",
    "fr": "Annuler l’analyse complète"
  },
  "stop-deep-scan": {
    "en": "Stop deep scan",
    "zh-CN": "停止深度扫描",
    "de": "Tiefenscan stoppen",
    "fr": "Arrêter l’analyse approfondie"
  },
  "scan-embedded-data": {
    "en": "Scan embedded data",
    "zh-CN": "扫描内嵌数据",
    "de": "Eingebettete Daten prüfen",
    "fr": "Analyser les données intégrées"
  },
  "retry-full-scan": {
    "en": "Retry full scan",
    "zh-CN": "重试完整扫描",
    "de": "Vollständigen Scan wiederholen",
    "fr": "Relancer l’analyse complète"
  },
  "retry-exiftool": {
    "en": "Retry ExifTool",
    "zh-CN": "重试 ExifTool",
    "de": "ExifTool erneut starten",
    "fr": "Relancer ExifTool"
  },
  "parser-warnings": {
    "en": "Parser warnings",
    "zh-CN": "解析器提醒",
    "de": "Parser-Hinweise",
    "fr": "Notes de l’analyseur"
  },
  "gps-metadata-location": {
    "en": "GPS metadata location",
    "zh-CN": "GPS 元数据位置",
    "de": "GPS-Metadatenstandort",
    "fr": "Position GPS des métadonnées"
  },
  "gps-location-found": {
    "en": "GPS location found",
    "zh-CN": "发现 GPS 位置",
    "de": "GPS-Standort gefunden",
    "fr": "Position GPS trouvée"
  },
  "coordinates-stored-in-this-file": {
    "en": "Coordinates stored in this file",
    "zh-CN": "文件中保存的坐标",
    "de": "In dieser Datei gespeicherte Koordinaten",
    "fr": "Coordonnées enregistrées dans ce fichier"
  },
  "privacy-pass": {
    "en": "Privacy pass",
    "zh-CN": "隐私快速检查",
    "de": "Datenschutz-Schnellcheck",
    "fr": "Contrôle rapide de confidentialité"
  },
  "no-common-sensitive-fields-in-the-readable-set": {
    "en": "No common sensitive fields in the readable set",
    "zh-CN": "易读字段中未发现常见敏感项",
    "de": "Keine üblichen sensiblen Felder in der lesbaren Ansicht",
    "fr": "Aucun champ sensible courant dans la vue lisible"
  },
  "metadata-is-editable-and-pixels-can-still-reveal-people-signs-addresses-and-landmarks": {
    "en": "Metadata is editable, and pixels can still reveal people, signs, addresses, and landmarks.",
    "zh-CN": "元数据可以修改，画面本身仍可能暴露人物、标志、地址和地标。",
    "de": "Metadaten lassen sich ändern. Bildpixel können trotzdem Personen, Schilder, Adressen und markante Orte verraten.",
    "fr": "Les métadonnées sont modifiables et les pixels peuvent encore révéler personnes, panneaux, adresses et monuments."
  },
  "open-privacy-checker": {
    "en": "Open Privacy Checker",
    "zh-CN": "打开隐私检查器",
    "de": "Datenschutz-Check öffnen",
    "fr": "Ouvrir le vérificateur de confidentialité"
  },
  "remove-image-metadata": {
    "en": "Remove image metadata",
    "zh-CN": "清除图片元数据",
    "de": "Bild-Metadaten entfernen",
    "fr": "Supprimer les métadonnées de l’image"
  },
  "metadata-results": {
    "en": "Metadata results",
    "zh-CN": "元数据结果",
    "de": "Metadaten-Ergebnisse",
    "fr": "Résultats des métadonnées"
  },
  "read-the-useful-part-or-audit-every-tag": {
    "en": "Read the useful part—or audit every tag.",
    "zh-CN": "先看有用的，或者逐个审计所有标签。",
    "de": "Lies das Wesentliche – oder prüfe jeden einzelnen Tag.",
    "fr": "Lisez l’essentiel, ou contrôlez chaque balise."
  },
  "metadata-view": {
    "en": "Metadata view",
    "zh-CN": "元数据视图",
    "de": "Metadatenansicht",
    "fr": "Vue des métadonnées"
  },
  "readable": {
    "en": "Readable",
    "zh-CN": "易读",
    "de": "Lesbar",
    "fr": "Lisible"
  },
  "all-native-fields-all-fields": {
    "en": "All native fields / All fields",
    "zh-CN": "所有原生字段",
    "de": "Alle nativen Felder",
    "fr": "Tous les champs natifs"
  },
  "all-fields": {
    "en": "All fields",
    "zh-CN": "所有字段",
    "de": "Alle Felder",
    "fr": "Tous les champs"
  },
  "search-metadata-fields": {
    "en": "Search metadata fields",
    "zh-CN": "搜索元数据字段",
    "de": "Metadatenfelder durchsuchen",
    "fr": "Rechercher dans les métadonnées"
  },
  "search-value-field-path-or-source": {
    "en": "Search value, field, path, or source",
    "zh-CN": "搜索值、字段、路径或来源",
    "de": "Wert, Feld, Pfad oder Quelle suchen",
    "fr": "Rechercher valeur, champ, chemin ou source"
  },
  "source": {
    "en": "Source",
    "zh-CN": "来源",
    "de": "Quelle",
    "fr": "Source"
  },
  "filter-by-source": {
    "en": "Filter by source",
    "zh-CN": "按来源筛选",
    "de": "Nach Quelle filtern",
    "fr": "Filtrer par source"
  },
  "all-sources": {
    "en": "All sources",
    "zh-CN": "全部来源",
    "de": "Alle Quellen",
    "fr": "Toutes les sources"
  },
  "report-chapters": {
    "en": "Report chapters",
    "zh-CN": "报告章节",
    "de": "Berichtskapitel",
    "fr": "Chapitres du rapport"
  },
  "loaded-chapters": {
    "en": "Loaded chapters",
    "zh-CN": "已加载章节",
    "de": "Geladene Kapitel",
    "fr": "Chapitres chargés"
  },
  "no-matching-fields": {
    "en": "No matching fields.",
    "zh-CN": "没有匹配字段。",
    "de": "Keine passenden Felder.",
    "fr": "Aucun champ correspondant."
  },
  "clear-the-search-or-switch-the-source-filter": {
    "en": "Clear the search or switch the source filter.",
    "zh-CN": "清空搜索或更换来源筛选。",
    "de": "Suche leeren oder den Quellenfilter ändern.",
    "fr": "Effacez la recherche ou changez le filtre de source."
  },
  "clear-filters": {
    "en": "Clear filters",
    "zh-CN": "清除筛选",
    "de": "Filter löschen",
    "fr": "Effacer les filtres"
  },
  "load-250-more-rows": {
    "en": "Load 250 more rows",
    "zh-CN": "再加载 250 行",
    "de": "250 weitere Zeilen laden",
    "fr": "Charger 250 lignes de plus"
  },
  "offset-hexadecimal-and-printable-ascii": {
    "en": "Offset, hexadecimal, and printable ASCII",
    "zh-CN": "偏移、十六进制和可打印 ASCII",
    "de": "Offset, Hexadezimalwerte und druckbares ASCII",
    "fr": "Décalage, hexadécimal et ASCII imprimable"
  },
  "raw-safe-json": {
    "en": "Raw safe JSON",
    "zh-CN": "原始安全 JSON",
    "de": "Sicheres Roh-JSON",
    "fr": "JSON sûr brut"
  },
  "binary-values-are-summaries-size-and-depth-caps-remain-active": {
    "en": "Binary values are summaries; size and depth caps remain active",
    "zh-CN": "二进制值只显示摘要，大小与深度限制仍然生效",
    "de": "Binärwerte werden zusammengefasst; Größen- und Tiefenlimits bleiben aktiv",
    "fr": "Les valeurs binaires sont résumées ; les limites de taille et profondeur restent actives"
  },
  "take-the-receipt": {
    "en": "Take the receipt",
    "zh-CN": "把收据带走",
    "de": "Beleg mitnehmen",
    "fr": "Emportez le reçu"
  },
  "complete-json-readable-pdf-or-a-quick-copy": {
    "en": "Complete JSON, readable PDF, or a quick copy.",
    "zh-CN": "完整 JSON、易读 PDF，或者快速复制。",
    "de": "Vollständiges JSON, lesbares PDF oder schnell kopieren.",
    "fr": "JSON complet, PDF lisible ou copie rapide."
  },
  "pdf-deliberately-trims-giant-fields-json-is-the-complete-safe-record-and-never-includes-file-bytes-or-preview-urls": {
    "en": "PDF deliberately trims giant fields. JSON is the complete safe record and never includes file bytes or preview URLs.",
    "zh-CN": "PDF 会主动缩短超长字段且保持英文；JSON 是完整安全记录，不包含文件字节或预览 URL。",
    "de": "PDF und JSON bleiben auf Englisch. Das PDF kürzt sehr lange Felder; JSON ist der vollständige sichere Datensatz ohne Dateibytes oder Vorschau-URLs.",
    "fr": "PDF et JSON restent en anglais. Le PDF raccourcit les champs géants ; le JSON est le registre sûr complet, sans octets ni URL d’aperçu."
  },
  "all-readable-and-native-fields-copied": {
    "en": "All readable and native fields copied",
    "zh-CN": "所有易读与原生字段已复制",
    "de": "Alle lesbaren und nativen Felder kopiert",
    "fr": "Tous les champs lisibles et natifs ont été copiés"
  },
  "copy-all": {
    "en": "Copy all",
    "zh-CN": "复制全部",
    "de": "Alle kopieren",
    "fr": "Tout copier"
  },
  "copy-visible": {
    "en": "Copy visible",
    "zh-CN": "复制可见项",
    "de": "Sichtbare kopieren",
    "fr": "Copier les éléments visibles"
  },
  "complete-json": {
    "en": "Complete JSON",
    "zh-CN": "完整 JSON",
    "de": "Vollständiges JSON",
    "fr": "JSON complet"
  },
  "building-pdf": {
    "en": "Building PDF…",
    "zh-CN": "正在生成 PDF…",
    "de": "PDF wird erstellt…",
    "fr": "Création du PDF…"
  },
  "readable-pdf": {
    "en": "Readable PDF",
    "zh-CN": "英文易读 PDF",
    "de": "Lesbares englisches PDF",
    "fr": "PDF lisible en anglais"
  },
  "raw-json": {
    "en": "Raw JSON",
    "zh-CN": "原始 JSON",
    "de": "Roh-JSON",
    "fr": "JSON brut"
  },
  "drop-image": {
    "en": "Drop an image here",
    "zh-CN": "把图片拖到这里",
    "de": "Bild hier ablegen",
    "fr": "Déposez une image ici"
  },
  "ignored-one": {
    "en": "{count} extra file was ignored",
    "zh-CN": "已忽略 {count} 个额外文件",
    "de": "{count} weitere Datei ignoriert",
    "fr": "{count} fichier supplémentaire ignoré"
  },
  "ignored-many": {
    "en": "{count} extra files were ignored",
    "zh-CN": "已忽略 {count} 个额外文件",
    "de": "{count} weitere Dateien ignoriert",
    "fr": "{count} fichiers supplémentaires ignorés"
  }
} as const satisfies Record<string, Record<Locale, string>>;
export type reportMessageKey = keyof typeof reportMessages;
export const reportTranslator = (locale: Locale) => (key: reportMessageKey, values: Record<string, string | number> = {}): string => interpolate(reportMessages[key][locale], values);

export const reportErrors: Record<Locale, Partial<Record<string, string>>> = {
  "en": {},
  "de": {
    "UNSUPPORTED_FILE_TYPE": "Dieses Dateiformat wird von diesem Werkzeug nicht unterstützt.",
    "FILE_TOO_LARGE": "Die Datei überschreitet die sichere Verarbeitungsgrenze.",
    "INVALID_FILE_SIGNATURE": "Die Dateisignatur gehört zu keinem unterstützten Format.",
    "ENCRYPTED_PDF": "Dieses PDF ist passwortgeschützt. Das Werkzeug versucht nicht, den Schutz zu umgehen.",
    "ENCRYPTED_OFFICE": "Diese Office-Datei ist verschlüsselt. Das Werkzeug versucht nicht, die Verschlüsselung zu umgehen.",
    "CORRUPTED_FILE": "Die Datei ist beschädigt oder unvollständig und kann nicht sicher gelesen werden.",
    "PARSE_TIMEOUT": "Die Analyse dauerte zu lange und wurde sicher gestoppt."
  },
  "fr": {
    "UNSUPPORTED_FILE_TYPE": "Ce format n’est pas pris en charge par cet outil.",
    "FILE_TOO_LARGE": "Le fichier dépasse la limite de traitement sûr.",
    "INVALID_FILE_SIGNATURE": "La signature du fichier ne correspond à aucun format pris en charge.",
    "ENCRYPTED_PDF": "Ce PDF est protégé par mot de passe. L’outil ne tente pas de contourner la protection.",
    "ENCRYPTED_OFFICE": "Ce document Office est chiffré. L’outil ne tente pas de le déchiffrer.",
    "CORRUPTED_FILE": "Le fichier est endommagé ou incomplet et ne peut pas être lu sans risque.",
    "PARSE_TIMEOUT": "L’analyse a pris trop de temps et s’est arrêtée sans risque."
  },
  "zh-CN": {
    "UNSUPPORTED_FILE_TYPE": "这个工具不支持该文件格式。",
    "FILE_TOO_LARGE": "文件超过了安全处理上限。",
    "INVALID_FILE_SIGNATURE": "文件签名不属于受支持的格式。",
    "ENCRYPTED_PDF": "这个 PDF 受密码保护，工具不会尝试绕过密码。",
    "ENCRYPTED_OFFICE": "这个 Office 文件已加密，工具不会尝试绕过密码。",
    "CORRUPTED_FILE": "文件已损坏或结构不完整，无法安全读取。",
    "PARSE_TIMEOUT": "解析耗时过长，已经安全停止。"
  }
};
