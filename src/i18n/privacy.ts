import type { PrivacyCategory, PrivacyRisk, RiskSeverity } from '../lib/privacy/types';
import type { Locale } from './core';

interface RiskTranslation {
  title: string;
  description: string;
  recommendation: string;
}

const categoryRecommendationsZh: Record<PrivacyCategory, string> = {
  location: '分享前删除位置字段，并检查清理后的副本。',
  device: '删除设备型号、序列号和所有者信息，减少跨文件关联。',
  identity: '对外分享前删除姓名、联系方式、作者和路径信息。',
  time: '如果拍摄时间会暴露行程或习惯，分享前删除时间戳。',
  editing: '如果不想暴露制作工具，请在导出时排除软件字段。',
  'document-history': '删除原始文件名、文档 ID 和编辑历史，然后再次扫描。',
  thumbnail: '删除内嵌缩略图，避免旧版画面跟着文件一起外流。',
  other: '删除内部地址、链接或凭据类字段，不要直接打开它们。',
};

const categoryRecommendationsDe: Record<PrivacyCategory, string> = {
  location: 'Entferne Standortfelder vor dem Teilen und prüfe die bereinigte Kopie erneut.',
  device: 'Entferne Gerätemodell, Seriennummern und Eigentümerdaten, um Verknüpfungen zwischen Dateien zu erschweren.',
  identity: 'Entferne Namen, Kontaktdaten, Autoren- und Pfadangaben vor einer öffentlichen Freigabe.',
  time: 'Entferne Zeitstempel, wenn Aufnahmezeiten Reisen oder Gewohnheiten verraten könnten.',
  editing: 'Lasse Softwarefelder beim Export weg, wenn die verwendeten Werkzeuge privat bleiben sollen.',
  'document-history': 'Entferne ursprüngliche Dateinamen, Dokument-IDs und Bearbeitungsverlauf und scanne danach erneut.',
  thumbnail: 'Entferne eingebettete Vorschaubilder, damit keine ältere Bildversion mitreist.',
  other: 'Entferne interne Adressen, Links oder Zugangsdaten und öffne sie nicht direkt.',
};

const categoryRecommendationsFr: Record<PrivacyCategory, string> = {
  location: 'Supprimez les champs de localisation avant le partage, puis vérifiez la copie nettoyée.',
  device: 'Supprimez modèle, numéros de série et propriétaire pour limiter les rapprochements entre fichiers.',
  identity: 'Supprimez noms, coordonnées personnelles, auteur et chemins avant un partage public.',
  time: 'Supprimez les horodatages si la date de prise de vue peut révéler vos trajets ou habitudes.',
  editing: 'Excluez les champs de logiciel à l’export si vous ne voulez pas révéler vos outils.',
  'document-history': 'Supprimez nom d’origine, identifiants de document et historique de retouche, puis rescanez.',
  thumbnail: 'Supprimez les miniatures intégrées pour éviter qu’une ancienne version de l’image ne voyage avec le fichier.',
  other: 'Supprimez adresses internes, liens ou identifiants d’accès, et ne les ouvrez pas directement.',
};

const riskCopy: Record<string, Omit<RiskTranslation, 'recommendation'> & { recommendation?: string }> = {
  'precise-location': { title: '精确 GPS 坐标', description: '图片里有精确坐标，可能直接暴露拍摄地点。' },
  'gps-altitude': { title: 'GPS 海拔', description: '海拔不能单独定位，但会补充拍摄地点的环境线索。' },
  'gps-direction': { title: '镜头朝向', description: '文件记录了拍摄时的镜头方向，它本身不是精确位置，但是额外线索。' },
  'approximate-location': { title: '地名或大致位置', description: '即使没有坐标，城市、场馆或景点名称也可能暴露图片来源。' },
  'device-model': { title: '相机或手机型号', description: '图片记录了拍摄设备或镜头型号。通常只是较弱的隐私线索。' },
  'device-identifier': { title: '唯一设备标识', description: '唯一序列号可能把多张图片关联到同一台设备。' },
  'device-owner': { title: '相机所有者姓名', description: '设备所有者字段可能直接指向一个人。' },
  'creator-identity': { title: '作者或创作者姓名', description: '作者或署名字段可能暴露创作者或图片来源。' },
  'contact-details': { title: '邮箱或联系方式', description: '图片里的联系信息可以直接识别或联系到某个人。' },
  'named-people': { title: '人名或人脸区域标签', description: '人物和区域标签可能识别画面中的人，即使我们从不分析像素。' },
  'rights-information': { title: '所有权或版权信息', description: '所有权字段可能暴露创作者或来源。', recommendation: '需要隐私时可删除这些字段；但对外发布前也要考虑保留权利声明的价值。' },
  'capture-time': { title: '原始拍摄时间', description: '拍摄时间戳可能把图片和作息、旅行、会议或具体事件联系起来。' },
  'modification-time': { title: '内嵌修改时间', description: '文件包含内部修改时间。它比原始拍摄时间弱，但仍是线索。' },
  'software-information': { title: '编辑软件', description: '图片记录了用来创建或处理它的软件。' },
  'editing-history': { title: '编辑历史或持久文档 ID', description: '编辑操作、源文档关系或持久 ID 可以暴露制作轨迹，并关联同一资产的不同版本。' },
  'original-file-reference': { title: '原始文件名或来源引用', description: '保留的源文件名可能暴露项目名、命名规则或资产来源。' },
  'embedded-thumbnail': { title: '内嵌缩略图', description: '文件里的缩略图可能保留图片早期版本。' },
  'local-file-path': { title: '本地文件路径', description: '本地路径可能暴露电脑用户名、目录结构、项目名或内部资产位置。' },
  'internal-network-address': { title: '内部地址或携带凭据的 URL', description: '元数据可能包含内网地址、本地资源，甚至访问令牌。检查器不会打开这些链接。' },
  'location-time-combination': { title: '位置 + 拍摄时间', description: '位置和时间合在一起，可能暴露照片在哪里、什么时候拍摄。' },
  'location-device-combination': { title: '位置 + 设备信息', description: '位置和设备细节组合后，更容易把不同文件关联起来。' },
  'identity-contact-combination': { title: '姓名 + 联系方式', description: '人名和联系方式同时出现，会形成直接的身份关联。' },
  'model-serial-combination': { title: '设备型号 + 序列号', description: '型号和序列号组合成的设备指纹，比单独一个字段更强。' },
  'location-identity-time-combination': { title: '位置、身份与时间关联', description: '姓名、精确地点和拍摄时间组合成了高度可识别的事件记录。' },
};

const riskCopyDe: typeof riskCopy = {
  'precise-location': { title: 'Genaue GPS-Koordinaten', description: 'Das Bild enthält genaue Koordinaten, die den Aufnahmeort direkt verraten können.' },
  'gps-altitude': { title: 'GPS-Höhe', description: 'Die Höhe bestimmt keinen Ort allein, ergänzt aber Hinweise zur Aufnahmeumgebung.' },
  'gps-direction': { title: 'Aufnahmerichtung', description: 'Die Datei speichert die Blickrichtung der Kamera. Sie ist kein genauer Standort, aber ein zusätzlicher Hinweis.' },
  'approximate-location': { title: 'Ortsname oder grober Standort', description: 'Auch ohne Koordinaten können Stadt, Veranstaltungsort oder Sehenswürdigkeit die Bildherkunft verraten.' },
  'device-model': { title: 'Kamera- oder Smartphone-Modell', description: 'Das Bild nennt Aufnahmegerät oder Objektivmodell. Meist ist das nur ein schwacher Datenschutzhinweis.' },
  'device-identifier': { title: 'Eindeutige Gerätekennung', description: 'Eine Seriennummer kann mehrere Bilder demselben Gerät zuordnen.' },
  'device-owner': { title: 'Name des Kameraeigentümers', description: 'Ein Eigentümerfeld kann direkt auf eine Person verweisen.' },
  'creator-identity': { title: 'Name von Autor oder Urheber', description: 'Autoren- oder Credit-Felder können Urheber oder Bildquelle offenlegen.' },
  'contact-details': { title: 'E-Mail oder Kontaktdaten', description: 'Kontaktdaten im Bild können eine Person direkt identifizieren oder erreichbar machen.' },
  'named-people': { title: 'Namen oder markierte Gesichtsbereiche', description: 'Personen- und Regions-Tags können Menschen im Bild identifizieren, obwohl wir keine Pixel analysieren.' },
  'rights-information': { title: 'Rechte- oder Copyright-Angaben', description: 'Rechtefelder können Urheber oder Quelle offenlegen.', recommendation: 'Für mehr Privatsphäre lassen sie sich entfernen. Prüfe vor einer Veröffentlichung aber, ob der Rechtehinweis erhalten bleiben sollte.' },
  'capture-time': { title: 'Ursprüngliche Aufnahmezeit', description: 'Der Aufnahmezeitpunkt kann ein Bild mit Alltag, Reise, Termin oder Ereignis verbinden.' },
  'modification-time': { title: 'Eingebettete Änderungszeit', description: 'Die Datei enthält eine interne Änderungszeit. Sie ist schwächer als die Aufnahmezeit, aber weiterhin ein Hinweis.' },
  'software-information': { title: 'Bearbeitungssoftware', description: 'Das Bild nennt die Software, mit der es erstellt oder bearbeitet wurde.' },
  'editing-history': { title: 'Bearbeitungsverlauf oder dauerhafte Dokument-ID', description: 'Bearbeitungen, Quelldokument-Beziehungen und dauerhafte IDs können den Produktionsweg verraten und Dateiversionen verknüpfen.' },
  'original-file-reference': { title: 'Ursprünglicher Dateiname oder Quellverweis', description: 'Ein erhaltener Quellname kann Projektname, Benennungsschema oder Herkunft eines Assets offenlegen.' },
  'embedded-thumbnail': { title: 'Eingebettetes Vorschaubild', description: 'Ein Vorschaubild in der Datei kann eine ältere Version des Bildes enthalten.' },
  'local-file-path': { title: 'Lokaler Dateipfad', description: 'Lokale Pfade können Benutzername, Ordnerstruktur, Projektname oder internen Speicherort verraten.' },
  'internal-network-address': { title: 'Interne Adresse oder URL mit Zugangsdaten', description: 'Metadaten können Intranet-Adressen, lokale Ressourcen oder sogar Zugriffstoken enthalten. Der Check öffnet diese Links nicht.' },
  'location-time-combination': { title: 'Standort + Aufnahmezeit', description: 'Standort und Zeitpunkt zusammen können verraten, wo und wann ein Foto entstand.' },
  'location-device-combination': { title: 'Standort + Gerätedaten', description: 'Standort und Gerätedetails erleichtern gemeinsam die Verknüpfung verschiedener Dateien.' },
  'identity-contact-combination': { title: 'Name + Kontaktdaten', description: 'Name und Kontaktangabe bilden zusammen eine direkte Identitätsverknüpfung.' },
  'model-serial-combination': { title: 'Gerätemodell + Seriennummer', description: 'Modell und Seriennummer ergeben einen stärkeren Gerätefingerabdruck als jedes Feld allein.' },
  'location-identity-time-combination': { title: 'Standort, Identität und Zeit verknüpft', description: 'Name, genauer Ort und Aufnahmezeit bilden gemeinsam einen sehr gut identifizierbaren Ereignisdatensatz.' },
};

const riskCopyFr: typeof riskCopy = {
  'precise-location': { title: 'Coordonnées GPS précises', description: 'L’image contient des coordonnées capables de révéler directement le lieu de prise de vue.' },
  'gps-altitude': { title: 'Altitude GPS', description: 'L’altitude ne localise pas seule une photo, mais ajoute un indice sur son environnement.' },
  'gps-direction': { title: 'Direction de prise de vue', description: 'Le fichier indique la direction de l’appareil. Ce n’est pas un lieu précis, mais c’est un indice supplémentaire.' },
  'approximate-location': { title: 'Nom de lieu ou position approximative', description: 'Même sans coordonnées, une ville, une salle ou un monument peut révéler l’origine de l’image.' },
  'device-model': { title: 'Modèle d’appareil ou de téléphone', description: 'L’image indique l’appareil ou l’objectif utilisé. C’est généralement un indice de confidentialité assez faible.' },
  'device-identifier': { title: 'Identifiant unique de l’appareil', description: 'Un numéro de série peut relier plusieurs images au même appareil.' },
  'device-owner': { title: 'Nom du propriétaire de l’appareil', description: 'Le champ du propriétaire peut désigner directement une personne.' },
  'creator-identity': { title: 'Nom de l’auteur ou du créateur', description: 'Les champs d’auteur ou de crédit peuvent révéler le créateur ou la source de l’image.' },
  'contact-details': { title: 'Adresse e-mail ou coordonnées', description: 'Des coordonnées intégrées peuvent identifier une personne ou permettre de la contacter directement.' },
  'named-people': { title: 'Noms ou zones de visage balisées', description: 'Les balises de personnes et de régions peuvent identifier les sujets, même si nous n’analysons jamais les pixels.' },
  'rights-information': { title: 'Droits ou copyright', description: 'Les champs de droits peuvent révéler le créateur ou la source.', recommendation: 'Vous pouvez les retirer pour protéger votre vie privée, mais mesurez aussi l’intérêt de conserver une mention de droits avant publication.' },
  'capture-time': { title: 'Date et heure de prise de vue', description: 'L’horodatage peut relier l’image à une habitude, un trajet, un rendez-vous ou un événement précis.' },
  'modification-time': { title: 'Date de modification intégrée', description: 'Le fichier contient une date de modification interne. Elle est moins sensible que la prise de vue, mais reste un indice.' },
  'software-information': { title: 'Logiciel de retouche', description: 'L’image indique le logiciel qui l’a créée ou modifiée.' },
  'editing-history': { title: 'Historique de retouche ou identifiant persistant', description: 'Les opérations, liens vers le document source et identifiants persistants peuvent révéler la production et relier plusieurs versions.' },
  'original-file-reference': { title: 'Nom d’origine ou référence source', description: 'Un ancien nom de fichier peut révéler un projet, une convention de nommage ou la provenance d’un élément.' },
  'embedded-thumbnail': { title: 'Miniature intégrée', description: 'Une miniature contenue dans le fichier peut garder une ancienne version de l’image.' },
  'local-file-path': { title: 'Chemin de fichier local', description: 'Un chemin local peut révéler nom d’utilisateur, dossiers, projet ou emplacement interne.' },
  'internal-network-address': { title: 'Adresse interne ou URL avec identifiants', description: 'Les métadonnées peuvent contenir une adresse intranet, une ressource locale ou même un jeton d’accès. Le vérificateur n’ouvre jamais ces liens.' },
  'location-time-combination': { title: 'Lieu + heure de prise de vue', description: 'Lieu et heure réunis peuvent révéler où et quand la photo a été prise.' },
  'location-device-combination': { title: 'Lieu + informations d’appareil', description: 'Le lieu associé aux détails de l’appareil facilite le rapprochement de plusieurs fichiers.' },
  'identity-contact-combination': { title: 'Nom + coordonnées', description: 'Un nom et des coordonnées réunis forment un lien direct vers une identité.' },
  'model-serial-combination': { title: 'Modèle + numéro de série', description: 'Le modèle et le numéro de série forment une empreinte d’appareil plus forte que chaque champ séparé.' },
  'location-identity-time-combination': { title: 'Lieu, identité et heure reliés', description: 'Un nom, un lieu précis et une heure de prise de vue forment ensemble un événement très identifiable.' },
};

export const privacyCategoryLabels: Record<Locale, Record<PrivacyCategory, string>> = {
  en: { location: 'Location', device: 'Device', identity: 'Identity', time: 'Time', editing: 'Editing', thumbnail: 'Thumbnail', 'document-history': 'Document history', other: 'Other' },
  de: { location: 'Standort', device: 'Gerät', identity: 'Identität', time: 'Zeit', editing: 'Bearbeitung', thumbnail: 'Vorschaubild', 'document-history': 'Dokumentverlauf', other: 'Sonstiges' },
  fr: { location: 'Lieu', device: 'Appareil', identity: 'Identité', time: 'Date et heure', editing: 'Retouche', thumbnail: 'Miniature', 'document-history': 'Historique du document', other: 'Autre' },
  'zh-CN': { location: '位置', device: '设备', identity: '身份', time: '时间', editing: '编辑', thumbnail: '缩略图', 'document-history': '文档历史', other: '其他' },
};

export const privacySeverityLabels: Record<Locale, Record<RiskSeverity, string>> = {
  en: { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' },
  de: { critical: 'Kritisch', high: 'Hoch', medium: 'Mittel', low: 'Niedrig' },
  fr: { critical: 'Critique', high: 'Élevé', medium: 'Moyen', low: 'Faible' },
  'zh-CN': { critical: '严重', high: '高', medium: '中', low: '低' },
};

export function localizePrivacyRisk(risk: PrivacyRisk, locale: Locale): RiskTranslation {
  if (locale === 'en') return { title: risk.title, description: risk.description, recommendation: risk.recommendation };
  const translated = locale === 'zh-CN' ? riskCopy[risk.id] : locale === 'de' ? riskCopyDe[risk.id] : riskCopyFr[risk.id];
  if (!translated) return { title: risk.title, description: risk.description, recommendation: risk.recommendation };
  const recommendations = locale === 'zh-CN' ? categoryRecommendationsZh : locale === 'de' ? categoryRecommendationsDe : categoryRecommendationsFr;
  return { ...translated, recommendation: translated.recommendation ?? recommendations[risk.category] };
}

export function localizePrivacyRiskId(id: string, locale: Locale): string {
  if (locale === 'zh-CN') return riskCopy[id]?.title ?? id;
  if (locale === 'de') return riskCopyDe[id]?.title ?? id;
  if (locale === 'fr') return riskCopyFr[id]?.title ?? id;
  return id;
}
