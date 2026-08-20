import type { Locale } from './core';

export interface HomeCopy {
  title: string; description: string; rail: string; eyebrow: string; heading: string; intro: string; limit: string;
  formatsLabel: string;
  formats: Array<{ label: string; detail: string }>;
  exifTitle: string; exifIntro: string;
  benefitsLabel: string; benefitsTitle: string; benefitsIntro: string; openTool: string;
  benefits: Array<{ eyebrow: string; label: string; note: string }>;
  processLabel: string; processTitle: string; processIntro: string; ready: string; chooseAbove: string;
  process: Array<{ title: string; note: string }>;
  faqTitle: string;
  faqs: Array<{ question: string; answer: string }>;
}

const en: HomeCopy = {
  title: 'Free Online EXIF & Metadata Viewer | ViewExif',
  description: 'Free online EXIF and metadata viewer. View EXIF, XMP, IPTC, GPS, camera and file metadata from images, videos, documents and audio. No upload required.',
  rail: 'LOCAL / NO UPLOAD', eyebrow: 'Free EXIF & metadata viewer', heading: 'Free Online EXIF & Metadata Viewer',
  intro: 'View EXIF data, GPS location, camera settings, XMP, IPTC and other photo or file metadata directly in your browser. Your files never leave your device.', limit: 'one-file limit',
  formatsLabel: 'BROWSE BY FORMAT',
  formats: [
    { label: 'Images', detail: 'EXIF, GPS, camera settings, timestamps, XMP and IPTC, plus color and editing traces' },
    { label: 'Videos', detail: 'Duration, dimensions, codecs, frame rate, tracks, brands, and dates' },
    { label: 'Documents', detail: 'Authors, dates, applications, revisions, statistics, and custom properties' },
    { label: 'Audio', detail: 'Track tags, codec, duration, bitrate, channels, bit depth, and artwork summaries' },
  ],
  exifTitle: 'What can this EXIF viewer show?',
  exifIntro: 'This EXIF viewer reads the information a photo can carry beyond its pixels. When those fields are present, you can check the camera model, lens, shutter speed, aperture, ISO, date taken, GPS coordinates, orientation, software, and related capture notes. It also surfaces nearby XMP and IPTC records, helping you understand how an image was captured, edited, exported, or prepared for sharing—all locally in your browser.',
  benefitsLabel: 'WHY IT MATTERS', benefitsTitle: 'Why view file metadata?', benefitsIntro: 'Metadata can expose private details, explain how a file was made, and save time when you need technical facts.', openTool: 'Open tool',
  benefits: [
    { eyebrow: 'Privacy check', label: 'Protect private details', note: 'Spot GPS coordinates, author names, device IDs, embedded thumbnails, and editing traces before sharing.' },
    { eyebrow: 'Provenance check', label: 'Check file provenance', note: 'Review timestamps, software history, hashes, and signed C2PA credentials without treating editable metadata as proof.' },
    { eyebrow: 'Cleaner sharing', label: 'Share a cleaner copy', note: 'Remove writable tags from images, video, audio, or documents, rescan the result, and keep a verification receipt.' },
  ],
  processLabel: 'LOCAL, STEP BY STEP', processTitle: 'How the local scan works', processIntro: 'The browser reads the file in this tab. No account, upload, or server copy.', ready: 'Have a file ready?', chooseAbove: 'Choose a file above',
  process: [
    { title: 'Choose one file', note: 'Drop one of 28 supported image, video, document, or audio formats. The bytes stay in this browser tab.' },
    { title: 'Verify the format', note: 'The browser checks the file signature and size before a parser starts.' },
    { title: 'Read available metadata', note: 'A local Worker and ExifTool WASM read the fields supported by that format.' },
    { title: 'Build a useful report', note: 'Fields are grouped, searchable, copyable, and exported with local hashes and header evidence.' },
    { title: 'Forget the session', note: 'Clear, replace, or refresh to stop the task, release temporary previews, and leave no file history.' },
  ],
  faqTitle: 'Frequently asked questions',
  faqs: [
    { question: 'Is this metadata viewer safe to use?', answer: 'The file is processed inside this browser tab. ViewExif has no upload endpoint, account, or server-side parser for your selected file.' },
    { question: 'What EXIF data can this viewer read?', answer: 'When those fields are present, it can read camera model, lens, ISO, aperture, shutter speed, timestamps, GPS coordinates, orientation, XMP, IPTC, and other available EXIF and file metadata.' },
    { question: 'Can this reveal where a photo was taken?', answer: 'If the image contains usable GPS coordinates, the report shows them. Many files contain no location, and metadata can be removed or changed.' },
    { question: 'Can metadata be wrong?', answer: 'Yes. Dates, locations, camera labels, authors, and every other editable field can be stale, missing, or deliberately changed.' },
    { question: 'Can metadata restore blurred or redacted parts of an image?', answer: 'No. Metadata inspection does not reconstruct pixels. It can only reveal stored fields or an embedded preview that is already inside the file.' },
  ],
};

const zh: HomeCopy = {
  title: '免费在线 EXIF 与元数据查看器 | ViewExif',
  description: '免费在线查看图片、视频、文档和音频中的 EXIF、XMP、IPTC、GPS、相机与文件元数据。文件留在浏览器里，无需上传。',
  rail: '本机处理 / 不上传', eyebrow: '免费元数据查看器', heading: '免费在线 EXIF 与元数据查看器',
  intro: '直接在浏览器里查看 EXIF、XMP、IPTC、GPS、相机信息和其他文件元数据。文件不会离开你的设备。', limit: '单个文件上限',
  formatsLabel: '按文件类型查看',
  formats: [
    { label: '图片', detail: '相机、GPS、色彩、注释、动画、作者信息和编辑痕迹' },
    { label: '视频', detail: '时长、尺寸、编码、帧率、轨道、容器品牌和日期' },
    { label: '文档', detail: '作者、日期、应用程序、修订、统计和自定义属性' },
    { label: '音频', detail: '曲目信息、编码、时长、码率、声道、位深和封面摘要' },
  ],
  exifTitle: '这个 EXIF 查看器能显示什么？',
  exifIntro: '这个 EXIF 查看器可以读取照片像素之外保存的信息。字段存在时，你能查看相机型号、镜头、快门速度、光圈、ISO、拍摄日期、GPS 坐标、方向、软件和相关拍摄记录。它也会显示附近的 XMP 与 IPTC 数据，帮助你了解图片如何拍摄、编辑、导出或准备分享，而且所有处理都在浏览器本地完成。',
  benefitsLabel: '为什么值得看', benefitsTitle: '为什么要查看文件元数据？', benefitsIntro: '元数据可能暴露隐私，也能说明文件怎么来的。需要技术参数时，它还能少让你猜半天。', openTool: '打开工具',
  benefits: [
    { eyebrow: '隐私检查', label: '先把私密信息揪出来', note: '分享前找出 GPS、作者姓名、设备 ID、内嵌缩略图和编辑痕迹。' },
    { eyebrow: '来源检查', label: '看看文件经历过什么', note: '检查时间、软件历史、哈希和 C2PA 签名凭证，但别把可编辑的元数据当成铁证。' },
    { eyebrow: '更干净地分享', label: '做一份少带行李的副本', note: '清除图片、视频、音频或文档里可写的标签，再扫描一次，并保存验证收据。' },
  ],
  processLabel: '本机处理，一步一步来', processTitle: '本地扫描怎么工作', processIntro: '浏览器只在当前标签页读取文件。不注册、不上传，服务器也拿不到副本。', ready: '文件准备好了？', chooseAbove: '在上面选择文件',
  process: [
    { title: '选择一个文件', note: '支持 28 种常见图片、视频、文档和音频格式。文件字节只留在当前标签页。' },
    { title: '先验明正身', note: '解析前先检查文件签名和大小，不会只听扩展名的一面之词。' },
    { title: '读取现有元数据', note: '本地 Worker 和 ExifTool WASM 会读取该格式支持的字段。' },
    { title: '整理成能看的报告', note: '字段会分组，可搜索、复制，并可连同本地哈希和文件头证据一起导出。' },
    { title: '结束后就忘掉', note: '清除、替换或刷新页面会停止任务、释放临时预览，不留下文件历史。' },
  ],
  faqTitle: '常见问题',
  faqs: [
    { question: '这个元数据查看器安全吗？', answer: '文件只在当前浏览器标签页处理。ViewExif 没有文件上传接口、账号系统，也不会把你选择的文件交给服务器解析。' },
    { question: '它能查看 EXIF 吗？', answer: '可以。除了 EXIF，还会读取文件中已有的 XMP、IPTC、ICC、媒体容器、文档属性和 ExifTool 原生字段。' },
    { question: '它能看出照片在哪里拍的吗？', answer: '如果图片里保存了可用的 GPS 坐标，报告会显示。很多文件没有位置数据，而且元数据可以被删除或修改。' },
    { question: '元数据可能是错的吗？', answer: '当然。日期、位置、相机型号、作者和其他可编辑字段都可能过期、缺失，甚至被故意改过。' },
    { question: '元数据能恢复打码或模糊的画面吗？', answer: '不能。查看元数据不会重建像素；它只能显示文件里本来就存着的字段或内嵌预览。' },
  ],
};

const de: HomeCopy = {
  title: 'Kostenloser EXIF- & Metadaten-Viewer online | ViewExif',
  description: 'EXIF, XMP, IPTC, GPS, Kamera- und Dateimetadaten aus Bildern, Videos, Dokumenten und Audiodateien kostenlos im Browser anzeigen. Kein Upload nötig.',
  rail: 'LOKAL / KEIN UPLOAD', eyebrow: 'Kostenloser Metadaten-Viewer', heading: 'EXIF & Metadaten kostenlos online ansehen',
  intro: 'Lies EXIF, XMP, IPTC, GPS, Kameradaten und weitere Dateimetadaten direkt im Browser. Deine Dateien verlassen dein Gerät nicht.', limit: 'pro Datei',
  formatsLabel: 'NACH FORMAT',
  formats: [
    { label: 'Bilder', detail: 'Kamera, GPS, Farbe, Kommentare, Animation, Urheberschaft und Bearbeitungsspuren' },
    { label: 'Videos', detail: 'Dauer, Abmessungen, Codecs, Bildrate, Spuren, Marken und Zeitangaben' },
    { label: 'Dokumente', detail: 'Autoren, Daten, Anwendungen, Revisionen, Statistiken und eigene Eigenschaften' },
    { label: 'Audio', detail: 'Tags, Codec, Dauer, Bitrate, Kanäle, Bittiefe und Cover-Zusammenfassungen' },
  ],
  exifTitle: 'Was kann dieser EXIF-Viewer anzeigen?',
  exifIntro: 'Dieser EXIF-Viewer liest Informationen, die ein Foto zusätzlich zu seinen Pixeln speichern kann. Wenn die Felder vorhanden sind, siehst du Kameramodell, Objektiv, Verschlusszeit, Blende, ISO, Aufnahmedatum, GPS-Koordinaten, Ausrichtung, Software und weitere Aufnahmedaten. Auch XMP- und IPTC-Einträge werden sichtbar, damit du den Weg eines Bildes von der Aufnahme bis zum Export besser verstehst – lokal in deinem Browser.',
  benefitsLabel: 'WARUM DAS ZÄHLT', benefitsTitle: 'Warum Dateimetadaten ansehen?', benefitsIntro: 'Metadaten können Privates verraten, die Entstehung einer Datei erklären und technische Fragen ohne Rätselraten beantworten.', openTool: 'Tool öffnen',
  benefits: [
    { eyebrow: 'Datenschutz-Check', label: 'Private Details entdecken', note: 'Finde GPS-Koordinaten, Namen, Geräte-IDs, eingebettete Vorschaubilder und Bearbeitungsspuren vor dem Teilen.' },
    { eyebrow: 'Herkunfts-Check', label: 'Dateiherkunft prüfen', note: 'Sieh Zeitangaben, Software-Verlauf, Hashes und signierte C2PA-Nachweise – ohne editierbare Metadaten mit Beweisen zu verwechseln.' },
    { eyebrow: 'Sauberer teilen', label: 'Eine sauberere Kopie erstellen', note: 'Entferne beschreibbare Tags aus Bildern, Videos, Audio oder Dokumenten, prüfe die Kopie erneut und speichere einen Prüfbeleg.' },
  ],
  processLabel: 'LOKAL, SCHRITT FÜR SCHRITT', processTitle: 'So funktioniert der lokale Scan', processIntro: 'Der Browser liest die Datei nur in diesem Tab. Kein Konto, kein Upload, keine Serverkopie.', ready: 'Datei zur Hand?', chooseAbove: 'Oben eine Datei wählen',
  process: [
    { title: 'Eine Datei auswählen', note: 'Wähle eines von 28 unterstützten Bild-, Video-, Dokument- oder Audioformaten. Die Bytes bleiben in diesem Browser-Tab.' },
    { title: 'Format verifizieren', note: 'Vor dem Parser prüft der Browser Dateisignatur und Größe – nicht bloß die Endung.' },
    { title: 'Verfügbare Metadaten lesen', note: 'Ein lokaler Worker und ExifTool WASM lesen die Felder, die das Format hergibt.' },
    { title: 'Einen brauchbaren Bericht bauen', note: 'Felder werden gruppiert, durchsuchbar und kopierbar. Exporte enthalten lokale Hashes und Header-Nachweise.' },
    { title: 'Sitzung vergessen', note: 'Löschen, Ersetzen oder Neuladen stoppt den Vorgang, gibt Vorschauen frei und hinterlässt keinen Dateiverlauf.' },
  ],
  faqTitle: 'Häufige Fragen',
  faqs: [
    { question: 'Ist dieser Metadaten-Viewer sicher?', answer: 'Die Datei wird in diesem Browser-Tab verarbeitet. ViewExif besitzt keinen Upload-Endpunkt, kein Konto und keinen serverseitigen Parser für deine ausgewählte Datei.' },
    { question: 'Funktioniert das auch mit EXIF-Daten?', answer: 'Ja. Neben EXIF liest das Tool verfügbare XMP-, IPTC-, ICC-, Mediencontainer-, Dokument- und native ExifTool-Felder.' },
    { question: 'Kann ich sehen, wo ein Foto aufgenommen wurde?', answer: 'Enthält das Bild brauchbare GPS-Koordinaten, zeigt der Bericht sie an. Viele Dateien enthalten keinen Standort; außerdem lassen sich Metadaten entfernen oder verändern.' },
    { question: 'Können Metadaten falsch sein?', answer: 'Ja. Daten, Orte, Kameranamen, Autoren und alle anderen editierbaren Felder können veraltet, leer oder absichtlich verändert sein.' },
    { question: 'Können Metadaten verpixelte oder geschwärzte Bildbereiche wiederherstellen?', answer: 'Nein. Eine Metadatenprüfung rekonstruiert keine Pixel. Sie zeigt nur gespeicherte Felder oder eine bereits in der Datei eingebettete Vorschau.' },
  ],
};

export const homeCopy: Record<Locale, HomeCopy> = { en, de, 'zh-CN': zh };
