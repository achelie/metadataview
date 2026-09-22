import type { Locale } from './core';

type TranslatedLocale = Exclude<Locale, 'en'>;
type TranslationRow = readonly [english: string, german: string, french: string, chinese: string];

// Presentation copy only. Never pass native paths, source data, or export values
// through this helper; the report itself remains the language-neutral record.
const rows: readonly TranslationRow[] = [
  ['EXIF Summary', 'EXIF-Übersicht', 'Résumé EXIF', 'EXIF 摘要'],
  ['Camera', 'Kamera', 'Appareil photo', '相机'],
  ['Lens', 'Objektiv', 'Objectif', '镜头'],
  ['Date Taken', 'Aufnahmedatum', 'Date de prise de vue', '拍摄时间'],
  ['ISO', 'ISO', 'ISO', 'ISO'],
  ['Aperture', 'Blende', 'Ouverture', '光圈'],
  ['Shutter Speed', 'Verschlusszeit', 'Vitesse d’obturation', '快门速度'],
  ['Focal Length', 'Brennweite', 'Distance focale', '焦距'],
  ['Orientation', 'Ausrichtung', 'Orientation', '方向'],
  ['Format', 'Format', 'Format', '格式'],
  ['File size', 'Dateigröße', 'Taille du fichier', '文件大小'],
  ['MIME type', 'MIME-Typ', 'Type MIME', 'MIME 类型'],
  ['Dimensions', 'Abmessungen', 'Dimensions', '尺寸'],
  ['Megapixels', 'Megapixel', 'Mégapixels', '百万像素'],
  ['Pages', 'Seiten', 'Pages', '页数'],
  ['Stored pages', 'Gespeicherte Seitenzahl', 'Nombre de pages enregistré', '记录的页数'],
  ['Stored words', 'Gespeicherte Wortzahl', 'Nombre de mots enregistré', '记录的词数'],
  ['Slides', 'Folien', 'Diapositives', '幻灯片数'],
  ['Notes pages', 'Notizseiten', 'Pages de notes', '备注页数'],
  ['Worksheets', 'Tabellenblätter', 'Feuilles de calcul', '工作表数'],
  ['Authoring app', 'Erstellungsprogramm', 'Application de création', '制作软件'],
  ['Duration', 'Dauer', 'Durée', '时长'],
  ['Video codec', 'Video-Codec', 'Codec vidéo', '视频编码'],
  ['Audio codec', 'Audio-Codec', 'Codec audio', '音频编码'],
  ['Frame rate', 'Bildrate', 'Fréquence d’images', '帧率'],
  ['Tracks', 'Spuren', 'Pistes', '轨道'],
  ['Bitrate', 'Bitrate', 'Débit', '码率'],
  ['Sample rate', 'Abtastrate', 'Fréquence d’échantillonnage', '采样率'],
  ['Channels', 'Kanäle', 'Canaux', '声道'],
  ['Bit depth', 'Bittiefe', 'Profondeur de bits', '位深'],
  ['Compression', 'Kompression', 'Compression', '压缩方式'],
  ['Color profile', 'Farbprofil', 'Profil colorimétrique', '色彩配置'],
  ['Color space', 'Farbraum', 'Espace colorimétrique', '色彩空间'],
  ['Encoding', 'Kodierung', 'Encodage', '编码方式'],

  ['Privacy signals', 'Datenschutzhinweise', 'Indices de confidentialité', '隐私线索'],
  ['Location', 'Standort', 'Localisation', '位置'],
  ['Camera & lens', 'Kamera & Objektiv', 'Appareil & objectif', '相机与镜头'],
  ['Capture settings', 'Aufnahmeeinstellungen', 'Réglages de prise de vue', '拍摄设置'],
  ['Dates', 'Zeitangaben', 'Dates', '日期与时间'],
  ['Author & rights', 'Autor & Rechte', 'Auteur & droits', '作者与版权'],
  ['Software & editing', 'Software & Bearbeitung', 'Logiciels & retouches', '软件与编辑记录'],
  ['Technical details', 'Technische Details', 'Détails techniques', '技术信息'],
  ['Image encoding', 'Bildkodierung', 'Encodage de l’image', '图像编码'],
  ['Authorship & rights', 'Urheberschaft & Rechte', 'Paternité & droits', '作者与版权信息'],
  ['Dates & timeline', 'Daten & Zeitverlauf', 'Dates & chronologie', '日期与时间线'],
  ['Embedded content', 'Eingebettete Inhalte', 'Contenu intégré', '内嵌内容'],
  ['Document properties', 'Dokumenteigenschaften', 'Propriétés du document', '文档属性'],
  ['Document statistics', 'Dokumentstatistik', 'Statistiques du document', '文档统计'],
  ['Video encoding & tracks', 'Videokodierung & Spuren', 'Encodage vidéo & pistes', '视频编码与轨道'],
  ['Track & release', 'Titel & Veröffentlichung', 'Piste & parution', '曲目与发行信息'],
  ['Audio encoding', 'Audiokodierung', 'Encodage audio', '音频编码'],
  ['Track & people', 'Titel & Mitwirkende', 'Piste & contributeurs', '曲目与参与者'],
  ['Release & rights', 'Veröffentlichung & Rechte', 'Parution & droits', '发行与版权'],
  ['Embedded artwork', 'Eingebettete Cover', 'Illustrations intégrées', '内嵌封面'],
  ['Application statistics', 'Programmstatistik', 'Statistiques de l’application', '应用统计'],
  ['Custom properties', 'Eigene Eigenschaften', 'Propriétés personnalisées', '自定义属性'],
  ['Package details', 'Paketdetails', 'Détails du paquet', '文件包信息'],
  ['Custom metadata', 'Eigene Metadaten', 'Métadonnées personnalisées', '自定义元数据'],
  ['Container & timeline', 'Container & Zeitverlauf', 'Conteneur & chronologie', '容器与时间线'],
  ['Video encoding', 'Videokodierung', 'Encodage vidéo', '视频编码'],
  ['Audio track', 'Audiospur', 'Piste audio', '音轨'],
  ['Authorship & software', 'Urheberschaft & Software', 'Auteur & logiciels', '作者与软件'],
  ['File', 'Datei', 'Fichier', '文件'],
  ['ICC color profile', 'ICC-Farbprofil', 'Profil colorimétrique ICC', 'ICC 色彩配置'],
  ['Video container', 'Video-Container', 'Conteneur vidéo', '视频容器'],
  ['RIFF media', 'RIFF-Medien', 'Média RIFF', 'RIFF 媒体'],
  ['Office document', 'Office-Dokument', 'Document Office', 'Office 文档'],
  ['ZIP package', 'ZIP-Paket', 'Paquet ZIP', 'ZIP 文件包'],
  ['Audio tags & encoding', 'Audio-Tags & Kodierung', 'Tags audio & encodage', '音频标签与编码'],
  ['Composite', 'Abgeleitete Felder', 'Champs calculés', '组合计算字段'],
  ['Other metadata', 'Weitere Metadaten', 'Autres métadonnées', '其他元数据'],
  ['Parser diagnostics', 'Parser-Diagnose', 'Diagnostic de l’analyseur', '解析器诊断'],

  ['Camera make', 'Kamerahersteller', 'Marque de l’appareil', '相机品牌'],
  ['Camera model', 'Kameramodell', 'Modèle de l’appareil', '相机型号'],
  ['Lens model', 'Objektivmodell', 'Modèle de l’objectif', '镜头型号'],
  ['Lens make', 'Objektivhersteller', 'Marque de l’objectif', '镜头品牌'],
  ['Camera serial number', 'Kamera-Seriennummer', 'Numéro de série de l’appareil', '相机序列号'],
  ['Serial number', 'Seriennummer', 'Numéro de série', '序列号'],
  ['Lens serial number', 'Objektiv-Seriennummer', 'Numéro de série de l’objectif', '镜头序列号'],
  ['Date taken (raw)', 'Aufnahmedatum (Originalwert)', 'Date de prise de vue (valeur brute)', '拍摄时间（原始值）'],
  ['Created date (raw)', 'Erstellungsdatum (Originalwert)', 'Date de création (valeur brute)', '创建时间（原始值）'],
  ['Modified date (raw)', 'Änderungsdatum (Originalwert)', 'Date de modification (valeur brute)', '修改时间（原始值）'],
  ['Capture time offset', 'Zeitzonenversatz der Aufnahme', 'Décalage horaire de la prise de vue', '拍摄时区偏移'],
  ['GPS latitude', 'GPS-Breitengrad', 'Latitude GPS', 'GPS 纬度'],
  ['GPS longitude', 'GPS-Längengrad', 'Longitude GPS', 'GPS 经度'],
  ['GPS altitude', 'GPS-Höhe', 'Altitude GPS', 'GPS 海拔'],
  ['Camera direction', 'Aufnahmerichtung', 'Direction de l’appareil', '拍摄方向'],
  ['Artist', 'Künstler', 'Artiste', '创作者'],
  ['Author', 'Autor', 'Auteur', '作者'],
  ['Copyright', 'Urheberrecht', 'Copyright', '版权'],
  ['Software', 'Software', 'Logiciel', '软件'],
  ['Exposure time', 'Belichtungszeit', 'Temps d’exposition', '曝光时间'],
  ['ISO speed', 'ISO-Empfindlichkeit', 'Sensibilité ISO', 'ISO 感光度'],
  ['Focal length', 'Brennweite', 'Distance focale', '焦距'],
  ['Focal Length In 35mm Format', 'Brennweite im Kleinbildformat', 'Focale équivalente en 35 mm', '35mm 等效焦距'],
  ['EXIF width', 'EXIF-Breite', 'Largeur EXIF', 'EXIF 宽度'],
  ['EXIF height', 'EXIF-Höhe', 'Hauteur EXIF', 'EXIF 高度'],
  ['Decimal coordinates', 'Dezimalkoordinaten', 'Coordonnées décimales', '十进制坐标'],
  ['Calculated altitude', 'Berechnete Höhe', 'Altitude calculée', '计算海拔'],
  ['Orientation meaning', 'Bedeutung der Ausrichtung', 'Signification de l’orientation', '方向说明'],
  ['Container format', 'Containerformat', 'Format du conteneur', '容器格式'],
  ['Embedded EXIF', 'Eingebettetes EXIF', 'EXIF intégré', '内嵌 EXIF'],
  ['Embedded XMP', 'Eingebettetes XMP', 'XMP intégré', '内嵌 XMP'],
  ['Embedded ICC profile', 'Eingebettetes ICC-Profil', 'Profil ICC intégré', '内嵌 ICC 配置'],
  ['Alpha channel', 'Alphakanal', 'Canal alpha', '透明通道'],
  ['Animated', 'Animiert', 'Animé', '动画'],
  ['Container chunks', 'Container-Blöcke', 'Blocs du conteneur', '容器数据块'],
  ['Title', 'Titel', 'Titre', '标题'],
  ['Artists', 'Künstler', 'Artistes', '创作者列表'],
  ['Composer', 'Komponist', 'Compositeur', '作曲'],
  ['Conductor', 'Dirigent', 'Chef d’orchestre', '指挥'],
  ['Lyricist', 'Texter', 'Parolier', '作词'],
  ['Album', 'Album', 'Album', '专辑'],
  ['Album Artist', 'Albumkünstler', 'Artiste de l’album', '专辑艺人'],
  ['Track', 'Titelnummer', 'Numéro de piste', '曲目编号'],
  ['Disc', 'Tonträgernummer', 'Numéro de disque', '碟片编号'],
  ['Date', 'Datum', 'Date', '日期'],
  ['Year', 'Jahr', 'Année', '年份'],
  ['Genre', 'Genre', 'Genre', '流派'],
  ['Label', 'Label', 'Label', '发行厂牌'],
  ['Publisher', 'Herausgeber', 'Éditeur', '发行方'],
  ['Barcode', 'Barcode', 'Code-barres', '条形码'],
  ['Comment', 'Kommentar', 'Commentaire', '备注'],
  ['Rating', 'Bewertung', 'Note', '评分'],
  ['Container', 'Container', 'Conteneur', '容器'],
  ['Codec', 'Codec', 'Codec', '编码器'],
  ['Codec Profile', 'Codec-Profil', 'Profil du codec', '编码配置'],
  ['Lossless', 'Verlustfrei', 'Sans perte', '无损'],
  ['Number Of Samples', 'Anzahl der Samples', 'Nombre d’échantillons', '采样数'],
  ['Tag Types', 'Tag-Typen', 'Types de tags', '标签类型'],
  ['Has Embedded Cover', 'Eingebettetes Cover vorhanden', 'Présence d’une pochette intégrée', '是否内嵌封面'],
  ['Artwork', 'Cover', 'Illustrations', '封面'],
  ['Major Brand', 'Hauptmarke des Containers', 'Marque principale du conteneur', '容器主品牌'],
  ['Compatible Brands', 'Kompatible Container-Marken', 'Marques compatibles', '兼容容器品牌'],
  ['Creation Time', 'Erstellungszeit', 'Date de création', '创建时间'],
  ['Modification Time', 'Änderungszeit', 'Date de modification', '修改时间'],
  ['Muxing Application', 'Muxing-Programm', 'Application de multiplexage', '封装软件'],
  ['Writing Application', 'Schreibendes Programm', 'Application d’écriture', '写入软件'],
  ['Width', 'Breite', 'Largeur', '宽度'],
  ['Height', 'Höhe', 'Hauteur', '高度'],
  ['Stereo', 'Stereo', 'Stéréo', '立体声'],
  ['Track Count', 'Spuranzahl', 'Nombre de pistes', '轨道数'],
  ['Encoder', 'Encoder', 'Encodeur', '编码软件'],
  ['Creation Date', 'Erstellungsdatum', 'Date de création', '创建日期'],
  ['Subject', 'Betreff', 'Sujet', '主题'],
  ['Keywords', 'Schlüsselwörter', 'Mots-clés', '关键词'],
  ['Description', 'Beschreibung', 'Description', '说明'],
  ['Last Modified By', 'Zuletzt geändert von', 'Dernière modification par', '最后修改者'],
  ['Revision', 'Revision', 'Révision', '修订版本'],
  ['Created', 'Erstellt', 'Création', '创建时间'],
  ['Modified', 'Geändert', 'Modification', '修改时间'],
  ['Category', 'Kategorie', 'Catégorie', '类别'],
  ['Content Status', 'Inhaltsstatus', 'État du contenu', '内容状态'],
  ['Identifier', 'Kennung', 'Identifiant', '标识符'],
  ['Language', 'Sprache', 'Langue', '语言'],
  ['Version', 'Version', 'Version', '版本'],
  ['Application', 'Anwendung', 'Application', '应用程序'],
  ['App Version', 'Programmversion', 'Version de l’application', '应用版本'],
  ['Company', 'Unternehmen', 'Entreprise', '公司'],
  ['Manager', 'Verantwortlicher', 'Responsable', '负责人'],
  ['Template', 'Vorlage', 'Modèle', '模板'],
  ['Total Time', 'Gesamtbearbeitungszeit', 'Durée totale de modification', '总编辑时长'],
  ['Words', 'Wörter', 'Mots', '词数'],
  ['Characters', 'Zeichen', 'Caractères', '字符数'],
  ['Characters With Spaces', 'Zeichen mit Leerzeichen', 'Caractères avec espaces', '字符数（含空格）'],
  ['Lines', 'Zeilen', 'Lignes', '行数'],
  ['Paragraphs', 'Absätze', 'Paragraphes', '段落数'],
  ['Notes', 'Notizen', 'Notes', '备注'],
  ['Hidden Slides', 'Ausgeblendete Folien', 'Diapositives masquées', '隐藏幻灯片数'],
  ['MMClips', 'Multimedia-Clips', 'Clips multimédias', '多媒体片段数'],
  ['Presentation Format', 'Präsentationsformat', 'Format de présentation', '演示文稿格式'],
  ['Doc Security', 'Dokumentsicherheit', 'Sécurité du document', '文档安全设置'],
  ['Scale Crop', 'Vorschau skaliert oder beschnitten', 'Aperçu redimensionné ou recadré', '预览缩放或裁剪'],
  ['Links Up To Date', 'Verknüpfungen aktuell', 'Liens à jour', '链接是否最新'],
  ['Shared Doc', 'Gemeinsames Dokument', 'Document partagé', '共享文档'],
  ['Hyperlinks Changed', 'Hyperlinks geändert', 'Liens hypertextes modifiés', '超链接是否修改'],
  ['Dig Sig', 'Digitale Signatur', 'Signature numérique', '数字签名'],
  ['Package Format', 'Paketformat', 'Format du paquet', '文件包格式'],
  ['Entry Count', 'Anzahl der Einträge', 'Nombre d’entrées', '条目数'],
  ['Property Xml Bytes', 'Eigenschaften-XML in Bytes', 'Taille XML des propriétés en octets', '属性 XML 字节数'],
  ['Relationship Entries', 'Verknüpfungseinträge', 'Entrées de relations', '关系条目数'],
  ['Embedded Media Entries', 'Eingebettete Medien', 'Entrées de médias intégrés', '内嵌媒体条目数'],
  ['Embedded Object Entries', 'Eingebettete Objekte', 'Entrées d’objets intégrés', '内嵌对象条目数'],
  ['Stored Page Count', 'Gespeicherte Seitenzahl', 'Nombre de pages enregistré', '记录的页数'],
  ['Slide Count', 'Folienanzahl', 'Nombre de diapositives', '幻灯片数'],
  ['Notes Page Count', 'Anzahl der Notizseiten', 'Nombre de pages de notes', '备注页数'],
  ['Worksheet Count', 'Anzahl der Tabellenblätter', 'Nombre de feuilles de calcul', '工作表数'],
  ['Page Count', 'Seitenzahl', 'Nombre de pages', '页数'],
  ['PDFVersion', 'PDF-Version', 'Version PDF', 'PDF 版本'],
  ['PDFFormat Version', 'PDF-Formatversion', 'Version du format PDF', 'PDF 格式版本'],
  ['Encrypted', 'Verschlüsselt', 'Chiffré', '是否加密'],
  ['Producer', 'Erstellungssoftware', 'Logiciel de production', '生成软件'],
  ['Creator', 'Ersteller', 'Créateur', '创建者'],
  ['Raw Xmp', 'XMP-Originaltext', 'XMP brut', '原始 XMP'],
  ['Image Description', 'Bildbeschreibung', 'Description de l’image', '图像说明'],
  ['Resolution Unit', 'Auflösungseinheit', 'Unité de résolution', '分辨率单位'],
  ['XResolution', 'Horizontale Auflösung', 'Résolution horizontale', '水平分辨率'],
  ['YResolution', 'Vertikale Auflösung', 'Résolution verticale', '垂直分辨率'],
  ['Image Width', 'Bildbreite', 'Largeur de l’image', '图像宽度'],
  ['Image Height', 'Bildhöhe', 'Hauteur de l’image', '图像高度'],
  ['Image Size', 'Bildabmessungen', 'Dimensions de l’image', '图像尺寸'],
  ['Encoding Process', 'Kodierungsverfahren', 'Procédé d’encodage', '编码过程'],
  ['Color Components', 'Farbkomponenten', 'Composantes de couleur', '色彩分量'],
  ['Profile Description', 'Profilbeschreibung', 'Description du profil', '色彩配置说明'],
  ['Profile Version', 'Profilversion', 'Version du profil', '色彩配置版本'],
  ['Rendering Intent', 'Wiedergabeabsicht', 'Intention de rendu', '渲染意图'],
  ['Firmware Version', 'Firmware-Version', 'Version du micrologiciel', '固件版本'],
  ['Exposure Program', 'Belichtungsprogramm', 'Programme d’exposition', '曝光程序'],
  ['Exposure Mode', 'Belichtungsmodus', 'Mode d’exposition', '曝光模式'],
  ['Exposure Compensation', 'Belichtungskorrektur', 'Correction d’exposition', '曝光补偿'],
  ['Flash', 'Blitz', 'Flash', '闪光灯'],
  ['White Balance', 'Weißabgleich', 'Balance des blancs', '白平衡'],
  ['Metering Mode', 'Messmodus', 'Mode de mesure', '测光模式'],
  ['City', 'Stadt', 'Ville', '城市'],
  ['State', 'Bundesland / Region', 'État / région', '州或省'],
  ['Country', 'Land', 'Pays', '国家'],
  ['Sublocation', 'Genauerer Ortsname', 'Lieu précis', '具体地点'],
  ['Owner Name', 'Name des Eigentümers', 'Nom du propriétaire', '所有者姓名'],
  ['Camera Owner Name', 'Name des Kameraeigentümers', 'Nom du propriétaire de l’appareil', '相机所有者姓名'],
  ['Credit', 'Quellenangabe', 'Crédit', '来源署名'],
  ['Contact', 'Kontakt', 'Contact', '联系信息'],
  ['Email', 'E-Mail', 'E-mail', '电子邮件'],
  ['Rights', 'Rechte', 'Droits', '使用权'],
  ['Creator Tool', 'Erstellungsprogramm', 'Outil de création', '创建工具'],
  ['History', 'Verlauf', 'Historique', '历史记录'],
  ['Document ID', 'Dokument-ID', 'Identifiant du document', '文档 ID'],
  ['Instance ID', 'Instanz-ID', 'Identifiant d’instance', '实例 ID'],
  ['Derived From', 'Abgeleitet von', 'Issu de', '派生来源'],
  ['Thumbnail Image', 'Vorschaubild', 'Miniature', '缩略图'],
  ['Preview Image', 'Vorschaubild', 'Aperçu', '预览图'],
  ['GPS Version ID', 'GPS-Versionskennung', 'Version GPS', 'GPS 版本'],
  ['GPS Latitude Ref', 'Breitengrad-Referenz', 'Référence de latitude GPS', 'GPS 纬度方向'],
  ['GPS Longitude Ref', 'Längengrad-Referenz', 'Référence de longitude GPS', 'GPS 经度方向'],
  ['GPS Map Datum', 'GPS-Kartendatum', 'Référentiel géodésique GPS', 'GPS 大地基准'],
  ['GPS Processing Method', 'GPS-Verarbeitungsmethode', 'Méthode de traitement GPS', 'GPS 定位方式'],
  ['GPS Position', 'GPS-Position', 'Position GPS', 'GPS 位置'],

  ['PNG chunks', 'PNG-Blöcke', 'Blocs PNG', 'PNG 数据块'],
  ['WebP container', 'WebP-Container', 'Conteneur WebP', 'WebP 容器'],
  ['JPEG container', 'JPEG-Container', 'Conteneur JPEG', 'JPEG 容器'],
  ['PDF info dictionary', 'PDF-Informationsverzeichnis', 'Dictionnaire d’informations PDF', 'PDF 信息字典'],
  ['OOXML core properties', 'OOXML-Kerneigenschaften', 'Propriétés principales OOXML', 'OOXML 核心属性'],
  ['OOXML application properties', 'OOXML-Programmeigenschaften', 'Propriétés d’application OOXML', 'OOXML 应用属性'],
  ['OOXML package', 'OOXML-Paket', 'Paquet OOXML', 'OOXML 文件包'],
  ['Common audio tags', 'Allgemeine Audio-Tags', 'Tags audio communs', '通用音频标签'],
  ['Audio format', 'Audioformat', 'Format audio', '音频格式'],
  ['Native audio tags', 'Native Audio-Tags', 'Tags audio natifs', '原生音频标签'],
  ['Image parser', 'Bildparser', 'Analyseur d’images', '图像解析器'],
  ['Image Summary', 'Bildübersicht', 'Résumé de l’image', '图像摘要'],
];

const notes: readonly TranslationRow[] = [
  ['Device IDs and embedded previews deserve a second look before sharing.', 'Prüfe Geräte-IDs und eingebettete Vorschaubilder vor dem Teilen.', 'Vérifiez les identifiants d’appareil et les aperçus intégrés avant de partager.', '分享前，再检查一下设备 ID 和内嵌预览图。'],
  ['Coordinates are shown only when both values are valid. Opening a map always needs your click.', 'Koordinaten erscheinen nur, wenn beide Werte gültig sind. Eine Karte öffnet sich erst nach deinem Klick.', 'Les coordonnées apparaissent seulement si les deux valeurs sont valides. La carte s’ouvre uniquement à votre clic.', '仅在经纬度都有效时显示坐标。地图只会在你点击后打开。'],
  ['Labels written by the camera or editing app—not independent proof.', 'Diese Angaben stammen von der Kamera oder Bearbeitungssoftware und sind kein unabhängiger Nachweis.', 'Ces indications proviennent de l’appareil ou du logiciel de retouche et ne constituent pas une preuve indépendante.', '这些标签由相机或编辑软件写入，不能单独作为证据。'],
  ['Exposure, orientation, focal length, and other settings stored at capture time.', 'Belichtung, Ausrichtung, Brennweite und weitere gespeicherte Aufnahmeeinstellungen.', 'Exposition, orientation, focale et autres réglages enregistrés lors de la prise de vue.', '拍摄时保存的曝光、方向、焦距等设置。'],
  ['Original strings stay untouched. No timezone guessing, no quiet UTC conversion.', 'Die Originalangaben bleiben erhalten. Wir raten keine Zeitzone und wandeln nicht still in UTC um.', 'Les valeurs d’origine restent intactes. Aucun fuseau horaire supposé ni conversion discrète en UTC.', '保留原始时间文本，不猜时区，也不自动转换为 UTC。'],
  ['Names, credits, contact fields, and copyright labels saved inside the file.', 'In der Datei gespeicherte Namen, Quellen, Kontakte und Urheberrechtsangaben.', 'Noms, crédits, coordonnées et mentions de copyright enregistrés dans le fichier.', '文件中保存的姓名、署名、联系信息和版权标签。'],
  ['Apps, persistent document IDs, and editing-history breadcrumbs.', 'Programme, dauerhafte Dokument-IDs und Spuren früherer Bearbeitungen.', 'Applications, identifiants persistants et traces de retouches.', '软件、持久文档 ID 和编辑历史线索。'],
  ['Container flags, color data, profiles, and remaining readable fields.', 'Container-Merkmale, Farbdaten, Profile und weitere lesbare Felder.', 'Indicateurs du conteneur, données de couleur, profils et autres champs lisibles.', '容器标记、色彩数据、配置文件和其他可读字段。'],
  ['How color is described and should be rendered on another screen or device.', 'Wie Farben beschrieben und auf anderen Bildschirmen oder Geräten dargestellt werden sollen.', 'Comment décrire les couleurs et les restituer sur un autre écran ou appareil.', '文件如何描述色彩，以及其他屏幕或设备应如何显示它。'],
  ['Dimensions, sampling, bit depth, density, and compression details stored in the file.', 'Gespeicherte Angaben zu Abmessungen, Abtastung, Bittiefe, Dichte und Kompression.', 'Dimensions, échantillonnage, profondeur de bits, densité et compression enregistrés dans le fichier.', '文件中保存的尺寸、采样、位深、密度和压缩信息。'],
  ['Hardware and software identifiers recorded by the capture or editing device.', 'Vom Aufnahmegerät oder Bearbeitungsprogramm gespeicherte Hardware- und Softwarekennungen.', 'Identifiants matériels et logiciels enregistrés par l’appareil ou l’outil de retouche.', '拍摄设备或编辑软件记录的硬件和软件标识。'],
  ['Coordinates, altitude, direction, and place labels can reveal where a file was created.', 'Koordinaten, Höhe, Richtung und Ortsnamen können den Entstehungsort verraten.', 'Coordonnées, altitude, direction et noms de lieu peuvent révéler où le fichier a été créé.', '坐标、海拔、方向和地点名称可能透露文件的创建位置。'],
  ['Names, ownership, contact details, and rights statements attached to the file.', 'Namen, Eigentumsangaben, Kontakte und Rechtehinweise in der Datei.', 'Noms, propriété, coordonnées et déclarations de droits joints au fichier.', '附在文件中的姓名、归属、联系方式和权利声明。'],
  ['Capture, edit, digitize, and filesystem timestamps reported by the metadata engine.', 'Vom Metadatenprogramm gemeldete Aufnahme-, Bearbeitungs-, Digitalisierungs- und Dateisystemzeiten.', 'Dates de capture, retouche, numérisation et système de fichiers relevées par le moteur de métadonnées.', '元数据引擎读出的拍摄、编辑、数字化和文件系统时间。'],
  ['Thumbnails, previews, depth maps, gain maps, and other payloads referenced by the container.', 'Vom Container referenzierte Vorschaubilder, Tiefenbilder, Gain-Maps und weitere eingebettete Inhalte.', 'Miniatures, aperçus, cartes de profondeur, cartes de gain et autres données référencées par le conteneur.', '容器引用的缩略图、预览图、深度图、增益图和其他内嵌数据。'],
  ['Editable title, author, subject, revision, company, and application labels stored by document software.', 'Bearbeitbare Angaben zu Titel, Autor, Betreff, Revision, Unternehmen und Programm.', 'Titre, auteur, sujet, révision, entreprise et application modifiables enregistrés par le logiciel documentaire.', '文档软件保存的标题、作者、主题、修订、公司和应用标签，这些值可以编辑。'],
  ['Stored page, word, slide, note, and worksheet counts. These values may be stale if an editor did not refresh them.', 'Gespeicherte Zählwerte für Seiten, Wörter, Folien, Notizen und Tabellenblätter. Ohne Aktualisierung durch den Editor können sie veraltet sein.', 'Nombres de pages, mots, diapositives, notes et feuilles enregistrés. Ils peuvent être anciens si l’éditeur ne les a pas actualisés.', '记录的页数、词数、幻灯片数、备注数和工作表数。如果编辑器没有刷新，这些值可能过时。'],
  ['Container, duration, frame size, rate, codecs, rotation, bitrate, and track labels stored around the media streams.', 'Gespeicherte Angaben zu Container, Dauer, Bildgröße, Bildrate, Codecs, Drehung, Bitrate und Spuren.', 'Conteneur, durée, dimensions, fréquence d’images, codecs, rotation, débit et pistes stockés autour des flux média.', '媒体流之外保存的容器、时长、画面尺寸、帧率、编码、旋转、码率和轨道标签。'],
  ['Names, album labels, dates, identifiers, comments, and rights stored in the audio file.', 'Namen, Albumangaben, Daten, Kennungen, Kommentare und Rechte in der Audiodatei.', 'Noms, albums, dates, identifiants, commentaires et droits enregistrés dans le fichier audio.', '音频文件中保存的名称、专辑、日期、标识、备注和版权。'],
  ['Container, codec, duration, bitrate, sample rate, channel, bit-depth, and lossless flags reported by the file.', 'Angaben zu Container, Codec, Dauer, Bitrate, Abtastrate, Kanälen, Bittiefe und verlustfreier Kompression.', 'Conteneur, codec, durée, débit, fréquence d’échantillonnage, canaux, profondeur de bits et indicateurs sans perte.', '文件提供的容器、编码、时长、码率、采样率、声道、位深和无损标记。'],
  ['Safe container and parser fields that do not have an equivalent ExifTool tag.', 'Sichere Container- und Parserfelder ohne entsprechendes ExifTool-Tag.', 'Champs du conteneur et de l’analyseur sans équivalent ExifTool, conservés sous une forme sûre.', '经过安全处理、没有对应 ExifTool 标签的容器和解析器字段。'],
  ['Binary payload summarized by ExifTool; bytes are not included in this report.', 'ExifTool fasst die Binärdaten zusammen; die Bytes sind nicht Teil dieses Berichts.', 'ExifTool résume les données binaires ; les octets ne figurent pas dans ce rapport.', 'ExifTool 仅概述这段二进制数据，报告不包含其原始字节。'],
];

const translations = new Map<string, Record<TranslatedLocale, string>>(
  [...rows, ...notes].map(([en, de, fr, zh]) => [en, { de, fr, 'zh-CN': zh }]),
);

// Explicit aliases emitted by the parser's humanizer and ExifTool descriptions.
// Avoid fuzzy/case-insensitive matching: unfamiliar native labels stay intact.
const aliases: Readonly<Record<string, string>> = {
  'Camera Make': 'Camera make', 'Camera Model Name': 'Camera model', 'Camera Model': 'Camera model',
  Make: 'Camera make', Model: 'Camera model', 'Lens Model': 'Lens model', 'Lens Make': 'Lens make',
  'Serial Number': 'Serial number', 'Lens Serial Number': 'Lens serial number', 'Body Serial Number': 'Camera serial number',
  'Date Time Original': 'Date Taken', 'Date/Time Original': 'Date Taken', 'Create Date': 'Creation Date',
  'Modify Date': 'Modification Time', 'Exposure Time': 'Exposure time', 'FNumber': 'Aperture',
  'F Number': 'Aperture', 'ISO Speed Ratings': 'ISO speed', 'Photographic Sensitivity': 'ISO speed',
  'Shutter Speed Value': 'Shutter Speed', 'Aperture Value': 'Aperture',
  'Color Space': 'Color space', 'File Size': 'File size', 'MIME Type': 'MIME type',
  'Sample Rate': 'Sample rate', 'Frame Rate': 'Frame rate', 'Video Frame Rate': 'Frame rate',
  'Video Codec': 'Video codec', 'Audio Codec': 'Audio codec', 'Bit Depth': 'Bit depth', 'Bits Per Sample': 'Bit depth',
  'GPSLatitude': 'GPS latitude', 'GPSLongitude': 'GPS longitude', 'GPSAltitude': 'GPS altitude',
  'GPS Latitude': 'GPS latitude', 'GPS Longitude': 'GPS longitude', 'GPS Altitude': 'GPS altitude',
  'GPS Img Direction': 'Camera direction', 'GPS Image Direction': 'Camera direction',
  'X Resolution': 'XResolution', 'Y Resolution': 'YResolution',
  'Pixel XDimension': 'EXIF width', 'Pixel YDimension': 'EXIF height',
  'Exif Image Width': 'EXIF width', 'Exif Image Height': 'EXIF height',
  'PDF Version': 'PDFVersion', 'PDF Format Version': 'PDFFormat Version',
  'Raw XMP': 'Raw Xmp', 'Document Id': 'Document ID', 'Instance Id': 'Instance ID',
  'GPSVersion ID': 'GPS Version ID',
  'GPSLatitude Ref': 'GPS Latitude Ref', 'GPSLongitude Ref': 'GPS Longitude Ref',
  'GPSMap Datum': 'GPS Map Datum', 'GPSProcessing Method': 'GPS Processing Method',
};

const sectionTitles = [
  'Privacy signals', 'Location', 'Camera & lens', 'Capture settings', 'Dates', 'Author & rights',
  'Software & editing', 'Technical details', 'Color profile', 'Image encoding', 'Authorship & rights',
  'Dates & timeline', 'Embedded content', 'Document properties', 'Document statistics',
  'Video encoding & tracks', 'Track & release', 'Audio encoding', 'Track & people', 'Release & rights',
  'Embedded artwork', 'Application statistics', 'Custom properties', 'Package details', 'Custom metadata',
  'Container & timeline', 'Video encoding', 'Audio track', 'Tracks', 'Authorship & software',
  'File', 'JFIF', 'JPEG', 'ICC color profile', 'GPS', 'IPTC', 'XMP', 'Photoshop', 'PNG', 'GIF',
  'HEIC / HEIF', 'TIFF', 'QuickTime', 'Video container', 'RIFF media', 'Office document', 'ZIP package',
  'PDF', 'Audio tags & encoding', 'Composite', 'EXIF', 'Other metadata', 'Parser diagnostics',
] as const;
const knownSections = new Map(sectionTitles.map((title) => [title.toLowerCase(), title]));
const nativeRoots: Readonly<Record<string, string>> = {
  Exif: 'EXIF', Iptc: 'IPTC', Xmp: 'XMP', Png: 'PNG chunks', Webp: 'WebP container', Jpeg: 'JPEG container',
  Info: 'PDF info dictionary', Core: 'OOXML core properties', Application: 'OOXML application properties',
  Custom: 'Custom properties', Package: 'OOXML package', Common: 'Common audio tags', Format: 'Audio format',
  Native: 'Native audio tags', Container: 'Container', 'Image Summary': 'Image parser',
};
const knownSources = new Set(Object.values(nativeRoots));
knownSources.add('Image Summary');

/** Translate known report UI copy without changing the report or native data. */
export function reportDisplay(locale: Locale, text: string): string {
  if (locale === 'en') return text;
  const alias = Object.hasOwn(aliases, text) ? aliases[text] : undefined;
  const direct = translations.get(text) ?? translations.get(alias ?? '');
  if (direct) return direct[locale];

  const practical = /^A practical summary from (.+)\. Switch to native fields for exact paths\.$/.exec(text);
  if (practical) {
    const title = knownSections.get(practical[1]!);
    if (!title) return text;
    const localized = reportDisplay(locale, title);
    if (locale === 'de') return `Praktische Übersicht: ${localized}. Die exakten Pfade stehen in den nativen Feldern.`;
    if (locale === 'fr') return `Résumé pratique : ${localized}. Consultez les champs natifs pour les chemins exacts.`;
    return `「${localized}」的实用摘要。切换到原生字段可查看准确路径。`;
  }

  const exact = /^Exact local ExifTool fields from (.+)\. Group paths and tag IDs keep duplicate instances unambiguous\.$/.exec(text);
  if (exact && knownSections.has(exact[1]!.toLowerCase())) {
    const localized = reportDisplay(locale, exact[1]!);
    if (locale === 'de') return `Exakte lokale ExifTool-Felder aus ${localized}. Gruppenpfade und Tag-IDs unterscheiden mehrfach vorhandene Einträge.`;
    if (locale === 'fr') return `Champs ExifTool locaux exacts : ${localized}. Les chemins de groupe et identifiants distinguent les occurrences répétées.`;
    return `来自「${localized}」的本地 ExifTool 原始字段。分组路径和标签 ID 可区分重复出现的条目。`;
  }

  const nativeTitle = /^(.+) native fields$/.exec(text);
  const nativeSource = nativeTitle && Object.hasOwn(nativeRoots, nativeTitle[1]!) ? nativeRoots[nativeTitle[1]!] : undefined;
  if (nativeSource) {
    const localized = reportDisplay(locale, nativeSource);
    if (locale === 'de') return `${localized}: native Felder`;
    if (locale === 'fr') return `${localized} : champs natifs`;
    return `${localized}原生字段`;
  }

  const safe = /^Exact safe values reported by (.+)\. Paths keep nested fields unambiguous\.$/.exec(text);
  if (safe && knownSources.has(safe[1]!)) {
    const localized = reportDisplay(locale, safe[1]!);
    if (locale === 'de') return `Exakte, sicher aufbereitete Werte aus ${localized}. Pfade halten verschachtelte Felder eindeutig.`;
    if (locale === 'fr') return `Valeurs exactes, traitées de manière sûre, issues de ${localized}. Les chemins distinguent les champs imbriqués.`;
    return `「${localized}」提供的准确值已完成安全处理，路径可区分嵌套字段。`;
  }

  const limited = /^(.*) Showing the first ([\d,]+) fields; the safety limit was reached\.$/.exec(text);
  if (limited) {
    const translated = reportDisplay(locale, limited[1]!);
    if (translated === limited[1]) return text;
    if (locale === 'de') return `${translated} Die Sicherheitsgrenze ist erreicht; angezeigt werden die ersten ${limited[2]} Felder.`;
    if (locale === 'fr') return `${translated} Limite de sécurité atteinte : seuls les ${limited[2]} premiers champs sont affichés.`;
    return `${translated} 已达到安全上限，仅显示前 ${limited[2]} 个字段。`;
  }
  return text;
}
