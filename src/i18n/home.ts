import type { Locale } from './core';

export interface HomeCopy {
  title: string; description: string; rail: string; eyebrow: string; heading: string; intro: string; limit: string;
  fileLimits: string;
  formatsLabel: string;
  formats: Array<{ label: string; detail: string; extensions: string }>;
  exifLabel: string; exifTitle: string; exifIntro: string;
  exifExtra: Array<{ label: string; note: string }>;
  exifChecksLabel: string;
  exifChecks: Array<{ label: string; note: string }>;
  exifReferenceLabel: string;
  exampleLabel: string; exampleTitle: string; exampleIntro: string; exampleAlt: string; exampleCaption: string;
  supportTitle: string; supportIntro: string; supportNote: string;
  socialAlt: string; appName: string; appFeatures: string[];
  benefitsLabel: string; benefitsTitle: string; benefitsIntro: string; openTool: string;
  benefits: Array<{ eyebrow: string; label: string; note: string }>;
  processLabel: string; processTitle: string; processIntro: string; ready: string; chooseAbove: string;
  process: Array<{ title: string; note: string }>;
  faqTitle: string;
  faqs: Array<{ question: string; answer: string }>;
}

const en: HomeCopy = {
  title: 'Free EXIF Viewer Online – View Photo Metadata | ViewExif',
  description: "View EXIF data, GPS coordinates, camera settings and photo dates with ViewExif's free online EXIF viewer. Files stay in your browser. No upload.",
  rail: 'LOCAL / NO UPLOAD', eyebrow: 'ViewExif · EXIF & file metadata', heading: 'Free Online EXIF Viewer',
  intro: 'ViewExif helps you view EXIF data: camera and lens details, exposure settings, photo dates and GPS coordinates when a picture contains them. Choose a file to read its metadata in your browser. Your files stay on your device. You can also inspect supported videos, documents and audio here.', limit: 'one-file limit',
  fileLimits: 'Images: up to 50 MB. Other supported files: up to 100 MB.',
  formatsLabel: 'BROWSE BY FORMAT',
  formats: [
    { label: 'Images', detail: 'EXIF, GPS, camera settings, timestamps, XMP and IPTC, plus color and editing traces', extensions: 'PNG, JPG, JPEG, WebP, HEIC, HEIF, TIF, TIFF, GIF' },
    { label: 'Videos', detail: 'Duration, dimensions, codecs, frame rate, tracks, brands, and dates', extensions: 'MP4, M4V, MOV, MKV, WebM, AVI, FLV, 3GP, 3G2' },
    { label: 'Documents', detail: 'Authors, dates, applications, revisions, statistics, and custom properties', extensions: 'PDF, DOCX, PPTX, XLSX' },
    { label: 'Audio', detail: 'Track tags, codec, duration, bitrate, channels, bit depth, and artwork summaries', extensions: 'MP3, FLAC, OGG, OPUS, OGA, M4A, AAC, WAV, WMA' },
  ],
  exifLabel: 'EXIF DETAILS',
  exifTitle: 'What can this EXIF viewer show?',
  exifIntro: 'EXIF is information a camera or phone can save inside a picture. It can include the camera model, lens, shutter speed, aperture, ISO, orientation and the date recorded at capture. GPS coordinates may also appear when location recording was enabled. This EXIF viewer reads the fields available in your selected copy. It also shows separate metadata records such as XMP and IPTC, which may contain captions, credits, keywords or editing software labels. These records describe what the file stores; they do not prove that the details are accurate.',
  exifExtra: [
    { label: 'Location', note: 'A photo can contain latitude and longitude, but many pictures have no GPS tags. A screenshot, downloaded copy or exported image may contain different metadata from the camera original. If coordinates appear, review the stored values before choosing to open a map. The viewer does not infer a location from buildings, faces or other objects in the picture.' },
    { label: 'Photo dates', note: 'Look for DateTimeOriginal when you want the recorded capture time. Creation and modification dates can describe other steps in the file’s history. Some camera dates omit a time zone, and a device clock can be wrong. Compare the available date fields instead of treating the newest date as the moment the photo was taken.' },
    { label: 'Missing fields', note: 'No camera model or GPS result does not mean the picture is fake or untouched. The device may never have recorded the field, or an app may have removed it. If the scan reports a reading problem, check that warning before concluding that the metadata is absent.' },
  ],
  exifChecksLabel: 'Popular EXIF checks',
  exifChecks: [
    { label: 'Find photo GPS location', note: 'Read stored coordinates and open the map only when you choose.' },
    { label: 'Check camera & lens', note: 'See the recorded camera model, lens, and capture settings.' },
    { label: 'Find date taken', note: 'Look for DateTimeOriginal and related photo timestamps.' },
    { label: 'Check photo privacy', note: 'Review GPS, identity, device, and hidden preview risks.' },
    { label: 'Remove EXIF metadata', note: 'Create a cleaner copy and verify what remains.' },
  ],
  exifReferenceLabel: 'Read the EXIF standard from CIPA',
  exampleLabel: 'DEMO REPORT',
  exampleTitle: 'See an example EXIF report',
  exampleIntro: 'Not sure what to look for? This example shows a photo preview beside the camera, exposure, date and GPS fields found in a demo JPEG. Use it to see how a report groups the information. To explore the real report, select Try sample above; the viewer reads the sample through the same local workflow as your own file.',
  exampleAlt: 'ViewExif demo EXIF report with a photo preview, camera settings, capture date and GPS coordinates.',
  exampleCaption: 'Demo report: the metadata and landmark coordinates were added for this example. They do not describe a real camera or the photo’s actual capture location.',
  supportTitle: 'Which file formats can ViewExif read?',
  supportIntro: 'Photos are the starting point, but you can use the same page to inspect other supported files. Choose a format-specific viewer when you want guidance for that file type. EXIF is mainly relevant to photos; videos, documents and audio use other metadata records and technical headers.',
  supportNote: 'Support for a file format does not mean every file contains the same fields. A JPEG may carry detailed camera settings, while a PNG may contain only dimensions and a few text records. The report shows available fields and reading warnings. Camera RAW files and macro-enabled Office documents are outside this viewer’s supported formats.',
  socialAlt: 'ViewExif EXIF viewer with a local photo metadata report.',
  appName: 'ViewExif EXIF Viewer',
  appFeatures: ['Read available EXIF, GPS, XMP and IPTC metadata', 'Inspect supported image, video, document and audio files', 'Search fields and export JSON or PDF reports', 'Process selected files locally without uploading them'],
  benefitsLabel: 'WHY IT MATTERS', benefitsTitle: 'Why check photo metadata before sharing?', benefitsIntro: 'Metadata can expose private details, explain how a file was made, and save time when you need technical facts.', openTool: 'Open tool',
  benefits: [
    { eyebrow: 'Privacy check', label: 'Protect private details', note: 'Spot GPS coordinates, author names, device IDs, embedded thumbnails, and editing traces before sharing.' },
    { eyebrow: 'Provenance check', label: 'Check file provenance', note: 'Review timestamps, software history, hashes, and signed C2PA credentials without treating editable metadata as proof.' },
    { eyebrow: 'Cleaner sharing', label: 'Share a cleaner copy', note: 'Remove supported writable tags from images, video, audio, or documents, rescan the result, and keep a verification receipt.' },
  ],
  processLabel: 'LOCAL, STEP BY STEP', processTitle: 'How to use this online EXIF viewer', processIntro: 'The browser reads the file in this tab. No account, upload, or server copy.', ready: 'Have a file ready?', chooseAbove: 'Choose a file above',
  process: [
    { title: 'Choose one file', note: 'Drop a supported photo, video, document or audio file, or choose Try sample to explore a demo. The bytes stay in this browser tab.' },
    { title: 'Verify the format', note: 'The browser checks the file signature and size before a parser starts.' },
    { title: 'Read available metadata', note: 'Start with the summary, then search the available fields for camera details, GPS, dates or the information you need. Read any scan warnings.' },
    { title: 'Build a useful report', note: 'Copy a useful value or export a JSON or PDF report. The report includes local hashes and file-header evidence when available.' },
    { title: 'Forget the session', note: 'Clear, replace, or refresh to stop the task, release temporary previews, and leave no file history.' },
  ],
  faqTitle: 'Frequently asked questions',
  faqs: [
    { question: 'Is this EXIF viewer safe to use?', answer: 'The file is processed inside this browser tab. ViewExif has no upload endpoint, account, or server-side parser for your selected file.' },
    { question: 'What EXIF data can this viewer read?', answer: 'When present, EXIF fields can include camera model, lens, ISO, aperture, shutter speed, capture dates, GPS coordinates and orientation. The viewer also reads available XMP and IPTC records. Those are separate metadata formats, not EXIF fields.' },
    { question: 'Can this reveal where a photo was taken?', answer: 'If the image contains usable GPS coordinates, the report shows them. Many files contain no location, and metadata can be removed or changed.' },
    { question: 'Can metadata be wrong?', answer: 'Yes. Dates, locations, camera labels, authors, and every other editable field can be stale, missing, or deliberately changed.' },
    { question: 'Can metadata restore blurred or redacted parts of an image?', answer: 'No. Metadata inspection does not reconstruct pixels. It can only reveal stored fields or an embedded preview that is already inside the file.' },
  ],
};

const zh: HomeCopy = {
  title: '免费在线 EXIF 查看器 – 查看照片元数据 | ViewExif',
  description: '用 ViewExif 免费在线查看 EXIF、GPS 坐标、相机设置和照片日期。文件留在浏览器里，无需上传；也可检查支持的视频、文档和音频元数据。',
  rail: '本机处理 / 不上传', eyebrow: 'ViewExif · EXIF 与文件元数据', heading: '免费在线 EXIF 查看器',
  intro: '用 ViewExif 查看照片里已有的 EXIF：相机和镜头、曝光设置、照片日期，以及 GPS 坐标。选择一个文件，就能在浏览器里读取元数据。文件留在你的设备上。这里也能检查支持的视频、文档和音频。', limit: '单个文件上限',
  fileLimits: '图片最大 50 MB；其他支持的文件最大 100 MB。',
  formatsLabel: '按文件类型查看',
  formats: [
    { label: '图片', detail: 'EXIF、GPS、相机设置、日期、XMP、IPTC，以及色彩和编辑痕迹', extensions: 'PNG、JPG、JPEG、WebP、HEIC、HEIF、TIF、TIFF、GIF' },
    { label: '视频', detail: '时长、尺寸、编码、帧率、轨道、容器品牌和日期', extensions: 'MP4、M4V、MOV、MKV、WebM、AVI、FLV、3GP、3G2' },
    { label: '文档', detail: '作者、日期、应用程序、修订、统计和自定义属性', extensions: 'PDF、DOCX、PPTX、XLSX' },
    { label: '音频', detail: '曲目信息、编码、时长、码率、声道、位深和封面摘要', extensions: 'MP3、FLAC、OGG、OPUS、OGA、M4A、AAC、WAV、WMA' },
  ],
  exifLabel: 'EXIF 详情',
  exifTitle: '这个 EXIF 查看器能显示什么？',
  exifIntro: 'EXIF 是相机或手机可以写进图片的信息，包括相机型号、镜头、快门速度、光圈、ISO、方向和拍摄时记录的日期。开启位置记录时，照片也可能保存 GPS 坐标。这个 EXIF 查看器读取你选中副本里已有的字段，也会显示 XMP 和 IPTC 这些独立的元数据记录。它们可能保存说明、署名、关键词或编辑软件名称。这些记录只说明文件存了什么，不能保证内容准确。',
  exifExtra: [
    { label: '拍摄位置', note: '照片可能保存经纬度，但很多图片没有 GPS 标签。截图、下载副本或导出图片的元数据可能与相机原片不同。看到坐标后，先检查记录的数值，再决定是否打开地图。查看器不会根据建筑、人脸或其他画面内容猜位置。' },
    { label: '照片日期', note: '想找记录的拍摄时间，先看 DateTimeOriginal。创建和修改日期可能对应文件经历的其他步骤。有些相机日期没有时区，设备时钟也可能不准。结合几个日期字段判断，别把最新日期直接当成拍摄时间。' },
    { label: '字段缺失', note: '没有相机型号或 GPS，不代表图片是假的，也不代表它没改过。设备可能从未记录这个字段，某个应用也可能删掉了它。如果扫描提示读取有问题，先看警告，再判断元数据是否缺失。' },
  ],
  exifChecksLabel: '常用 EXIF 检查',
  exifChecks: [
    { label: '查找照片 GPS 位置', note: '读取保存的坐标，由你决定是否打开地图。' },
    { label: '查看相机和镜头', note: '检查记录的相机型号、镜头和拍摄设置。' },
    { label: '查找拍摄日期', note: '查看 DateTimeOriginal 和相关照片时间字段。' },
    { label: '检查照片隐私', note: '检查 GPS、身份、设备和隐藏预览风险。' },
    { label: '移除 EXIF 元数据', note: '生成更干净的副本，再核验还留下了什么。' },
  ],
  exifReferenceLabel: '阅读 CIPA 的 EXIF 标准',
  exampleLabel: '演示报告',
  exampleTitle: '看看 EXIF 报告长什么样',
  exampleIntro: '不知道先看哪里？这个示例把照片预览和演示 JPEG 里的相机、曝光、日期、GPS 字段放在一起，帮你认识报告的分组。想查看完整报告，点击上方的“测试案例”。查看器会用处理你自己文件的同一套本地流程读取它。',
  exampleAlt: 'ViewExif 演示 EXIF 报告，包含照片预览、相机设置、拍摄日期和 GPS 坐标。',
  exampleCaption: '演示报告：元数据和地标坐标由我们为示例添加，不代表真实相机信息或这张照片的实际拍摄位置。',
  supportTitle: 'ViewExif 能读取哪些文件格式？',
  supportIntro: '从照片开始，也能在同一页检查其他支持的文件。想看某一类文件的具体说明，可以打开对应的查看器。EXIF 主要用于照片；视频、文档和音频使用其他元数据记录和技术信息。',
  supportNote: '支持某种格式，不代表每个文件都有同样的字段。JPEG 可能带着完整的相机设置，PNG 也可能只有尺寸和少量文本记录。报告会展示已有字段和读取警告。这个查看器不支持相机 RAW 文件和含宏的 Office 文档。',
  socialAlt: 'ViewExif EXIF 查看器和本地照片元数据报告。',
  appName: 'ViewExif EXIF 查看器',
  appFeatures: ['读取已有的 EXIF、GPS、XMP 和 IPTC 元数据', '检查支持的图片、视频、文档和音频文件', '搜索字段并导出 JSON 或 PDF 报告', '在浏览器本地处理文件，无需上传'],
  benefitsLabel: '为什么值得看', benefitsTitle: '分享前为什么要检查照片元数据？', benefitsIntro: '元数据可能暴露隐私，也能说明文件怎么来的。需要技术参数时，它还能少让你猜半天。', openTool: '打开工具',
  benefits: [
    { eyebrow: '隐私检查', label: '先把私密信息揪出来', note: '分享前找出 GPS、作者姓名、设备 ID、内嵌缩略图和编辑痕迹。' },
    { eyebrow: '来源检查', label: '看看文件经历过什么', note: '检查时间、软件历史、哈希和 C2PA 签名凭证，但别把可编辑的元数据当成铁证。' },
    { eyebrow: '更干净地分享', label: '做一份少带行李的副本', note: '清除图片、视频、音频或文档里支持清理的可写标签，再扫描一次，并保存验证收据。' },
  ],
  processLabel: '本机处理，一步一步来', processTitle: '怎么使用这个在线 EXIF 查看器', processIntro: '浏览器只在当前标签页读取文件。不注册、不上传，服务器也拿不到副本。', ready: '文件准备好了？', chooseAbove: '在上面选择文件',
  process: [
    { title: '选择一个文件', note: '拖入支持的照片、视频、文档或音频，也可以点击“测试案例”看看演示。文件字节只留在当前标签页。' },
    { title: '先验明正身', note: '解析前先检查文件签名和大小，不会只听扩展名的一面之词。' },
    { title: '读取现有元数据', note: '先看摘要，再搜索相机、GPS、日期或你需要的字段。有扫描警告时，也别跳过。' },
    { title: '整理成能看的报告', note: '复制有用的数值，或导出 JSON、PDF 报告。能读取时，报告也会包含本地哈希和文件头证据。' },
    { title: '结束后就忘掉', note: '清除、替换或刷新页面会停止任务、释放临时预览，不留下文件历史。' },
  ],
  faqTitle: '常见问题',
  faqs: [
    { question: '这个 EXIF 查看器安全吗？', answer: '文件只在当前浏览器标签页处理。ViewExif 没有文件上传接口、账号系统，也不会把你选择的文件交给服务器解析。' },
    { question: '它能查看 EXIF 吗？', answer: '可以。字段存在时，EXIF 可以包含相机型号、镜头、ISO、光圈、快门速度、拍摄日期、GPS 坐标和方向。查看器也会读取已有的 XMP 和 IPTC；它们是独立的元数据格式，不是 EXIF 字段。' },
    { question: '它能看出照片在哪里拍的吗？', answer: '如果图片里保存了可用的 GPS 坐标，报告会显示。很多文件没有位置数据，而且元数据可以被删除或修改。' },
    { question: '元数据可能是错的吗？', answer: '当然。日期、位置、相机型号、作者和其他可编辑字段都可能过期、缺失，甚至被故意改过。' },
    { question: '元数据能恢复打码或模糊的画面吗？', answer: '不能。查看元数据不会重建像素；它只能显示文件里本来就存着的字段或内嵌预览。' },
  ],
};

const de: HomeCopy = {
  title: 'EXIF-Viewer online – Fotometadaten kostenlos | ViewExif',
  description: 'EXIF, GPS, Kameraeinstellungen und Fotodaten kostenlos mit ViewExif ansehen. Dateien bleiben in deinem Browser. Kein Upload nötig.',
  rail: 'LOKAL / KEIN UPLOAD', eyebrow: 'ViewExif · EXIF & Dateimetadaten', heading: 'Kostenloser EXIF-Viewer online',
  intro: 'Mit ViewExif liest du vorhandene EXIF-Daten: Kamera, Objektiv, Belichtung, Fotodatum und GPS-Koordinaten. Wähle eine Datei und sieh ihre Metadaten direkt im Browser. Deine Dateien bleiben auf deinem Gerät. Hier kannst du auch unterstützte Videos, Dokumente und Audiodateien prüfen.', limit: 'pro Datei',
  fileLimits: 'Bilder: bis zu 50 MB. Andere unterstützte Dateien: bis zu 100 MB.',
  formatsLabel: 'NACH FORMAT',
  formats: [
    { label: 'Bilder', detail: 'EXIF, GPS, Kameraeinstellungen, Zeitangaben, XMP und IPTC sowie Farb- und Bearbeitungsspuren', extensions: 'PNG, JPG, JPEG, WebP, HEIC, HEIF, TIF, TIFF, GIF' },
    { label: 'Videos', detail: 'Dauer, Abmessungen, Codecs, Bildrate, Spuren, Marken und Zeitangaben', extensions: 'MP4, M4V, MOV, MKV, WebM, AVI, FLV, 3GP, 3G2' },
    { label: 'Dokumente', detail: 'Autoren, Daten, Anwendungen, Revisionen, Statistiken und eigene Eigenschaften', extensions: 'PDF, DOCX, PPTX, XLSX' },
    { label: 'Audio', detail: 'Tags, Codec, Dauer, Bitrate, Kanäle, Bittiefe und Cover-Zusammenfassungen', extensions: 'MP3, FLAC, OGG, OPUS, OGA, M4A, AAC, WAV, WMA' },
  ],
  exifLabel: 'EXIF-DETAILS',
  exifTitle: 'Was kann dieser EXIF-Viewer anzeigen?',
  exifIntro: 'EXIF sind Informationen, die eine Kamera oder ein Handy in einem Bild speichern kann. Dazu gehören Kameramodell, Objektiv, Verschlusszeit, Blende, ISO, Ausrichtung und das bei der Aufnahme gespeicherte Datum. Bei aktivierter Standortaufzeichnung können auch GPS-Koordinaten vorhanden sein. Dieser EXIF-Viewer liest die Felder deiner ausgewählten Kopie. Er zeigt außerdem separate Metadaten wie XMP und IPTC. Darin können Bildbeschreibungen, Urheberangaben, Stichwörter oder Namen von Bearbeitungsprogrammen stehen. Die Einträge zeigen, was die Datei speichert; sie beweisen nicht, dass die Angaben stimmen.',
  exifExtra: [
    { label: 'Standort', note: 'Ein Foto kann Breiten- und Längengrad enthalten, doch viele Bilder haben keine GPS-Tags. Screenshots, heruntergeladene Kopien und exportierte Bilder können andere Metadaten als das Kameraoriginal enthalten. Prüfe angezeigte Koordinaten, bevor du eine Karte öffnest. Der Viewer errät keinen Standort anhand von Gebäuden, Gesichtern oder anderen Bildinhalten.' },
    { label: 'Fotodatum', note: 'Suche nach DateTimeOriginal, wenn du die gespeicherte Aufnahmezeit brauchst. Erstellungs- und Änderungsdaten können andere Schritte der Dateihistorie beschreiben. Manche Kameradaten enthalten keine Zeitzone, und die Geräteuhr kann falsch gehen. Vergleiche die Datumsfelder, statt das neueste Datum automatisch als Aufnahmezeit zu lesen.' },
    { label: 'Fehlende Felder', note: 'Ein fehlendes Kameramodell oder GPS-Ergebnis bedeutet weder, dass ein Bild gefälscht ist, noch, dass es unverändert blieb. Das Gerät hat das Feld vielleicht nie gespeichert, oder eine App hat es entfernt. Meldet der Scan ein Leseproblem, prüfe zuerst die Warnung, bevor du von fehlenden Metadaten ausgehst.' },
  ],
  exifChecksLabel: 'Häufige EXIF-Prüfungen',
  exifChecks: [
    { label: 'GPS-Standort eines Fotos finden', note: 'Lies gespeicherte Koordinaten und öffne die Karte nur, wenn du möchtest.' },
    { label: 'Kamera und Objektiv prüfen', note: 'Sieh das gespeicherte Kameramodell, Objektiv und die Aufnahmeeinstellungen.' },
    { label: 'Aufnahmedatum finden', note: 'Suche nach DateTimeOriginal und weiteren Zeitangaben des Fotos.' },
    { label: 'Privates im Foto prüfen', note: 'Prüfe GPS, Identitäts- und Geräteangaben sowie versteckte Vorschaubilder.' },
    { label: 'EXIF-Metadaten entfernen', note: 'Erstelle eine sauberere Kopie und prüfe, was darin bleibt.' },
  ],
  exifReferenceLabel: 'Den EXIF-Standard bei CIPA lesen',
  exampleLabel: 'DEMOBERICHT',
  exampleTitle: 'So sieht ein EXIF-Bericht aus',
  exampleIntro: 'Du weißt noch nicht, worauf du achten sollst? Dieses Beispiel zeigt eine Bildvorschau neben Kamera-, Belichtungs-, Datums- und GPS-Feldern aus einer Demo-JPEG. So erkennst du die Gruppen im Bericht. Für den vollständigen Bericht wähle oben Beispiel testen. Der Viewer liest das Beispiel mit demselben lokalen Ablauf wie deine eigene Datei.',
  exampleAlt: 'ViewExif-EXIF-Demobericht mit Bildvorschau, Kameraeinstellungen, Aufnahmedatum und GPS-Koordinaten.',
  exampleCaption: 'Demobericht: Metadaten und Koordinaten der Sehenswürdigkeit wurden für dieses Beispiel ergänzt. Sie beschreiben weder eine echte Kamera noch den tatsächlichen Aufnahmeort des Fotos.',
  supportTitle: 'Welche Dateiformate kann ViewExif lesen?',
  supportIntro: 'Fotos sind der Ausgangspunkt, aber auf derselben Seite kannst du weitere unterstützte Dateien prüfen. Wähle einen Viewer für das jeweilige Format, wenn du gezielte Hinweise brauchst. EXIF betrifft hauptsächlich Fotos; Videos, Dokumente und Audio nutzen andere Metadaten und technische Dateiangaben.',
  supportNote: 'Ein unterstütztes Format bedeutet nicht, dass jede Datei dieselben Felder enthält. Ein JPEG kann genaue Kameraeinstellungen speichern, ein PNG nur Abmessungen und wenige Texteinträge. Der Bericht zeigt vorhandene Felder und Lesewarnungen. Kamera-RAW-Dateien und Office-Dokumente mit Makros unterstützt dieser Viewer nicht. Bei einem DOCX kann der Firmenname aus einer alten Vorlage stammen, obwohl im sichtbaren Briefkopf ein anderer Name steht. Ein daraus exportiertes PDF kann wiederum eigene Info- und XMP-Einträge besitzen. Diese Angaben gehören zu unterschiedlichen Dateikopien und Quellen. Ein übereinstimmender Titel verbindet die Dateien nicht automatisch mit derselben Person. Gespeicherte Seiten- und Wortzahlen sind zudem Eigenschaften der Anwendung, keine neue Auszählung des Inhalts durch diesen Viewer.',
  socialAlt: 'ViewExif-EXIF-Viewer mit einem lokalen Fotometadatenbericht.',
  appName: 'ViewExif EXIF-Viewer',
  appFeatures: ['Vorhandene EXIF-, GPS-, XMP- und IPTC-Metadaten lesen', 'Unterstützte Bild-, Video-, Dokument- und Audiodateien prüfen', 'Felder durchsuchen und JSON- oder PDF-Berichte exportieren', 'Ausgewählte Dateien lokal ohne Upload verarbeiten'],
  benefitsLabel: 'WARUM DAS ZÄHLT', benefitsTitle: 'Warum Fotometadaten vor dem Teilen prüfen?', benefitsIntro: 'Metadaten können Privates verraten, die Entstehung einer Datei erklären und technische Fragen ohne Rätselraten beantworten.', openTool: 'Tool öffnen',
  benefits: [
    { eyebrow: 'Datenschutz-Check', label: 'Private Details entdecken', note: 'Finde GPS-Koordinaten, Namen, Geräte-IDs, eingebettete Vorschaubilder und Bearbeitungsspuren vor dem Teilen.' },
    { eyebrow: 'Herkunfts-Check', label: 'Dateiherkunft prüfen', note: 'Sieh Zeitangaben, Software-Verlauf, Hashes und signierte C2PA-Nachweise – ohne editierbare Metadaten mit Beweisen zu verwechseln.' },
    { eyebrow: 'Sauberer teilen', label: 'Eine sauberere Kopie erstellen', note: 'Entferne unterstützte beschreibbare Tags aus Bildern, Videos, Audio oder Dokumenten, prüfe die Kopie erneut und speichere einen Prüfbeleg.' },
  ],
  processLabel: 'LOKAL, SCHRITT FÜR SCHRITT', processTitle: 'So nutzt du diesen EXIF-Viewer online', processIntro: 'Der Browser liest die Datei nur in diesem Tab. Kein Konto, kein Upload, keine Serverkopie.', ready: 'Datei zur Hand?', chooseAbove: 'Oben eine Datei wählen',
  process: [
    { title: 'Eine Datei auswählen', note: 'Ziehe ein unterstütztes Foto, Video, Dokument oder eine Audiodatei hierher. Mit Beispiel testen kannst du die Demo ansehen. Die Bytes bleiben in diesem Browser-Tab.' },
    { title: 'Format verifizieren', note: 'Vor dem Parser prüft der Browser Dateisignatur und Größe – nicht bloß die Endung.' },
    { title: 'Verfügbare Metadaten lesen', note: 'Beginne mit der Übersicht. Suche dann nach Kamera, GPS, Datum oder anderen benötigten Feldern. Lies auch die Scanwarnungen.' },
    { title: 'Einen brauchbaren Bericht bauen', note: 'Kopiere einen nützlichen Wert oder exportiere einen JSON- oder PDF-Bericht. Wenn verfügbar, enthält er lokale Hashes und Nachweise aus dem Dateikopf.' },
    { title: 'Sitzung vergessen', note: 'Löschen, Ersetzen oder Neuladen stoppt den Vorgang, gibt Vorschauen frei und hinterlässt keinen Dateiverlauf.' },
  ],
  faqTitle: 'Häufige Fragen',
  faqs: [
    { question: 'Ist dieser EXIF-Viewer sicher?', answer: 'Die Datei wird in diesem Browser-Tab verarbeitet. ViewExif besitzt keinen Upload-Endpunkt, kein Konto und keinen serverseitigen Parser für deine ausgewählte Datei.' },
    { question: 'Funktioniert das auch mit EXIF-Daten?', answer: 'Ja. Vorhandene EXIF-Felder können Kameramodell, Objektiv, ISO, Blende, Verschlusszeit, Aufnahmedatum, GPS-Koordinaten und Ausrichtung enthalten. Der Viewer liest auch vorhandene XMP- und IPTC-Einträge. Das sind separate Metadatenformate, keine EXIF-Felder.' },
    { question: 'Kann ich sehen, wo ein Foto aufgenommen wurde?', answer: 'Enthält das Bild brauchbare GPS-Koordinaten, zeigt der Bericht sie an. Viele Dateien enthalten keinen Standort; außerdem lassen sich Metadaten entfernen oder verändern.' },
    { question: 'Können Metadaten falsch sein?', answer: 'Ja. Daten, Orte, Kameranamen, Autoren und alle anderen editierbaren Felder können veraltet, leer oder absichtlich verändert sein.' },
    { question: 'Können Metadaten verpixelte oder geschwärzte Bildbereiche wiederherstellen?', answer: 'Nein. Eine Metadatenprüfung rekonstruiert keine Pixel. Sie zeigt nur gespeicherte Felder oder eine bereits in der Datei eingebettete Vorschau.' },
  ],
};

const fr: HomeCopy = {
  title: 'Visionneuse EXIF gratuite en ligne | ViewExif',
  description: 'Consultez gratuitement EXIF, GPS, réglages photo et dates avec ViewExif. Vos fichiers restent dans votre navigateur. Aucun envoi requis.',
  rail: 'LOCAL / AUCUN ENVOI', eyebrow: 'ViewExif · EXIF et métadonnées', heading: 'Visionneuse EXIF gratuite en ligne',
  intro: 'ViewExif vous aide à lire les données EXIF présentes : appareil, objectif, exposition, dates et coordonnées GPS. Choisissez un fichier pour consulter ses métadonnées dans votre navigateur. Vos fichiers restent sur votre appareil. Vous pouvez aussi examiner les vidéos, documents et fichiers audio pris en charge.', limit: 'par fichier',
  fileLimits: 'Images : jusqu’à 50 Mo. Autres fichiers pris en charge : jusqu’à 100 Mo.',
  formatsLabel: 'PAR FORMAT',
  formats: [
    { label: 'Images', detail: 'EXIF, GPS, appareil, dates, XMP et IPTC, plus les traces de couleur et de retouche', extensions: 'PNG, JPG, JPEG, WebP, HEIC, HEIF, TIF, TIFF, GIF' },
    { label: 'Vidéos', detail: 'Durée, dimensions, codecs, fréquence d’images, pistes, marques et dates', extensions: 'MP4, M4V, MOV, MKV, WebM, AVI, FLV, 3GP, 3G2' },
    { label: 'Documents', detail: 'Auteurs, dates, applications, révisions, statistiques et propriétés personnalisées', extensions: 'PDF, DOCX, PPTX, XLSX' },
    { label: 'Audio', detail: 'Tags, codec, durée, débit, canaux, profondeur de bits et résumé des pochettes', extensions: 'MP3, FLAC, OGG, OPUS, OGA, M4A, AAC, WAV, WMA' },
  ],
  exifLabel: 'DÉTAILS EXIF',
  exifTitle: 'Que peut afficher cette visionneuse EXIF ?',
  exifIntro: 'EXIF désigne les informations qu’un appareil photo ou un téléphone peut enregistrer dans une image. Elles peuvent inclure le modèle, l’objectif, la vitesse d’obturation, l’ouverture, l’ISO, l’orientation et la date notée à la prise de vue. Des coordonnées GPS peuvent aussi apparaître si l’appareil enregistrait la position. Cette visionneuse EXIF lit les champs présents dans votre copie. Elle affiche aussi des métadonnées distinctes comme XMP et IPTC : légendes, crédits, mots-clés ou noms de logiciels de retouche. Ces données décrivent ce que le fichier contient ; elles ne prouvent pas que les détails sont exacts.',
  exifExtra: [
    { label: 'Position', note: 'Une photo peut contenir une latitude et une longitude, mais beaucoup d’images n’ont aucun tag GPS. Une capture d’écran, une copie téléchargée ou une image exportée peut avoir des métadonnées différentes de l’original. Vérifiez les coordonnées affichées avant de choisir d’ouvrir une carte. La visionneuse ne devine pas un lieu à partir des bâtiments, visages ou autres éléments visibles.' },
    { label: 'Dates de la photo', note: 'Cherchez DateTimeOriginal pour trouver l’heure de prise de vue enregistrée. Les dates de création et de modification peuvent correspondre à d’autres étapes du fichier. Certaines dates n’indiquent aucun fuseau horaire, et l’horloge de l’appareil peut être fausse. Comparez les champs au lieu de prendre la date la plus récente pour celle de la photo.' },
    { label: 'Champs absents', note: 'L’absence de modèle d’appareil ou de GPS ne signifie ni que l’image est fausse ni qu’elle est intacte. L’appareil n’a peut-être jamais enregistré ce champ, ou une application l’a supprimé. Si l’analyse signale un problème de lecture, consultez cet avertissement avant de conclure que les métadonnées sont absentes.' },
  ],
  exifChecksLabel: 'Vérifications EXIF courantes',
  exifChecks: [
    { label: 'Trouver la position GPS d’une photo', note: 'Lisez les coordonnées enregistrées et ouvrez la carte seulement si vous le souhaitez.' },
    { label: 'Vérifier appareil et objectif', note: 'Consultez le modèle, l’objectif et les réglages enregistrés.' },
    { label: 'Trouver la date de prise de vue', note: 'Cherchez DateTimeOriginal et les autres dates de la photo.' },
    { label: 'Vérifier la confidentialité', note: 'Examinez GPS, identité, appareil et risques liés aux aperçus cachés.' },
    { label: 'Supprimer les métadonnées EXIF', note: 'Créez une copie allégée et vérifiez ce qui reste.' },
  ],
  exifReferenceLabel: 'Lire la norme EXIF de la CIPA',
  exampleLabel: 'RAPPORT DE DÉMONSTRATION',
  exampleTitle: 'Voir un exemple de rapport EXIF',
  exampleIntro: 'Vous ne savez pas par où commencer ? Cet exemple montre un aperçu photo avec les champs d’appareil, d’exposition, de date et de GPS trouvés dans un JPEG de démonstration. Il vous aide à comprendre les groupes du rapport. Pour explorer le rapport complet, choisissez Tester un exemple ci-dessus. La visionneuse utilise le même traitement local que pour votre propre fichier.',
  exampleAlt: 'Rapport EXIF de démonstration ViewExif avec aperçu photo, réglages, date de prise de vue et coordonnées GPS.',
  exampleCaption: 'Rapport de démonstration : les métadonnées et coordonnées du monument ont été ajoutées pour cet exemple. Elles ne décrivent ni un appareil réel ni le véritable lieu de prise de vue.',
  supportTitle: 'Quels formats ViewExif peut-il lire ?',
  supportIntro: 'Les photos sont le point de départ, mais cette page permet aussi d’examiner d’autres fichiers pris en charge. Choisissez une visionneuse dédiée pour obtenir des conseils sur un format précis. EXIF concerne surtout les photos ; vidéos, documents et audio utilisent d’autres métadonnées et informations techniques.',
  supportNote: 'La prise en charge d’un format ne signifie pas que tous ses fichiers contiennent les mêmes champs. Un JPEG peut conserver des réglages détaillés ; un PNG peut n’avoir que des dimensions et quelques textes. Le rapport affiche les champs disponibles et les avertissements de lecture. Cette visionneuse ne prend pas en charge les fichiers RAW d’appareil photo ni les documents Office avec macros.',
  socialAlt: 'Visionneuse EXIF ViewExif avec rapport local de métadonnées photo.',
  appName: 'Visionneuse EXIF ViewExif',
  appFeatures: ['Lire les métadonnées EXIF, GPS, XMP et IPTC disponibles', 'Examiner les images, vidéos, documents et fichiers audio pris en charge', 'Rechercher les champs et exporter des rapports JSON ou PDF', 'Traiter les fichiers localement sans les envoyer'],
  benefitsLabel: 'POURQUOI C’EST UTILE', benefitsTitle: 'Pourquoi vérifier les métadonnées avant de partager une photo ?', benefitsIntro: 'Les métadonnées peuvent révéler des informations privées, expliquer la création d’un fichier et éviter de deviner ses caractéristiques techniques.', openTool: 'Ouvrir l’outil',
  benefits: [
    { eyebrow: 'Confidentialité', label: 'Repérer les détails privés', note: 'Détectez coordonnées GPS, noms d’auteur, identifiants d’appareil, miniatures intégrées et traces de retouche avant de partager.' },
    { eyebrow: 'Provenance', label: 'Examiner l’origine du fichier', note: 'Consultez dates, historique logiciel, empreintes et justificatifs C2PA signés sans prendre des métadonnées modifiables pour une preuve.' },
    { eyebrow: 'Partage plus propre', label: 'Créer une copie allégée', note: 'Supprimez les tags modifiables pris en charge d’une image, vidéo, piste audio ou document, rescanez la copie et gardez un reçu de vérification.' },
  ],
  processLabel: 'LOCAL, ÉTAPE PAR ÉTAPE', processTitle: 'Comment utiliser cette visionneuse EXIF en ligne', processIntro: 'Le navigateur lit le fichier dans cet onglet. Aucun compte, aucun envoi, aucune copie serveur.', ready: 'Un fichier sous la main ?', chooseAbove: 'Choisir un fichier ci-dessus',
  process: [
    { title: 'Choisir un fichier', note: 'Déposez une photo, une vidéo, un document ou un fichier audio pris en charge. Vous pouvez aussi choisir Tester un exemple. Les octets restent dans cet onglet.' },
    { title: 'Vérifier le format', note: 'Le navigateur contrôle la signature réelle et la taille avant de lancer un parseur.' },
    { title: 'Lire les métadonnées disponibles', note: 'Commencez par le résumé, puis cherchez appareil, GPS, dates ou les champs utiles. Lisez aussi les avertissements de l’analyse.' },
    { title: 'Construire un rapport utile', note: 'Copiez une valeur utile ou exportez un rapport JSON ou PDF. Quand ils sont disponibles, le rapport inclut des empreintes locales et des éléments de l’en-tête du fichier.' },
    { title: 'Oublier la session', note: 'Effacer, remplacer ou actualiser arrête la tâche, libère les aperçus temporaires et ne laisse aucun historique de fichier.' },
  ],
  faqTitle: 'Questions fréquentes',
  faqs: [
    { question: 'Cette visionneuse EXIF est-elle sûre ?', answer: 'Le fichier est traité dans cet onglet. ViewExif ne possède ni point d’envoi, ni compte, ni parseur serveur pour le fichier sélectionné.' },
    { question: 'Quelles données EXIF peut-elle lire ?', answer: 'Les champs EXIF présents peuvent inclure appareil, objectif, ISO, ouverture, vitesse d’obturation, dates de prise de vue, GPS et orientation. La visionneuse lit aussi les enregistrements XMP et IPTC disponibles. Ce sont des formats de métadonnées distincts, pas des champs EXIF.' },
    { question: 'Peut-elle révéler où une photo a été prise ?', answer: 'Si l’image contient des coordonnées GPS exploitables, le rapport les affiche. Beaucoup de fichiers n’en ont pas, et les métadonnées peuvent être supprimées ou modifiées.' },
    { question: 'Les métadonnées peuvent-elles être fausses ?', answer: 'Oui. Dates, lieux, noms d’appareil, auteurs et autres champs modifiables peuvent être obsolètes, absents ou volontairement changés.' },
    { question: 'Peuvent-elles restaurer une zone floutée ou masquée ?', answer: 'Non. L’analyse ne reconstruit pas les pixels. Elle montre uniquement les champs stockés ou un aperçu déjà intégré au fichier.' },
  ],
};

export const homeCopy: Record<Locale, HomeCopy> = { en, de, fr, 'zh-CN': zh };
