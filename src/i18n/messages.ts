import type { Locale } from './core';

export interface CommonMessages {
  skip: string;
  home: string;
  navigation: string;
  mainNavigation: string;
  mobileNavigation: string;
  openNavigation: string;
  closeNavigation: string;
  viewMetadata: string;
  checkPrivacy: string;
  removeMetadata: string;
  verifyC2pa: string;
  blog: string;
  allFormats: string;
  images: string;
  videos: string;
  audio: string;
  documents: string;
  inspect: string;
  remove: string;
  protect: string;
  allFiles: string;
  privacyChecker: string;
  c2paViewer: string;
  privacy: string;
  about: string;
  trust: string;
  contact: string;
  terms: string;
  footerNote: string;
  footerFloor: string;
  language: string;
  switchTo: string;
}

const en: CommonMessages = {
  skip: 'Skip to content', home: 'Home', navigation: 'Navigation', mainNavigation: 'Main navigation', mobileNavigation: 'Mobile navigation',
  openNavigation: 'Open navigation', closeNavigation: 'Close navigation', viewMetadata: 'View metadata', checkPrivacy: 'Check privacy',
  removeMetadata: 'Remove metadata', verifyC2pa: 'Verify C2PA', blog: 'Blog', allFormats: 'All Formats', images: 'Images', videos: 'Videos',
  audio: 'Audio', documents: 'Documents', inspect: 'Inspect', remove: 'Remove', protect: 'Protect', allFiles: 'All files',
  privacyChecker: 'Privacy checker', c2paViewer: 'C2PA viewer', privacy: 'Privacy', about: 'About', trust: 'Trust', contact: 'Contact', terms: 'Terms',
  footerNote: 'A browser-only evidence desk for the details your files carry around.', footerFloor: 'Built for local processing. No account. No upload.',
  language: 'Language', switchTo: 'Switch language to',
};

const zh: CommonMessages = {
  skip: '跳到主要内容', home: '首页', navigation: '导航', mainNavigation: '主导航', mobileNavigation: '移动端导航',
  openNavigation: '打开导航', closeNavigation: '关闭导航', viewMetadata: '查看元数据', checkPrivacy: '检查隐私',
  removeMetadata: '清除元数据', verifyC2pa: '验证 C2PA', blog: '博客', allFormats: '全部格式', images: '图片', videos: '视频',
  audio: '音频', documents: '文档', inspect: '查看', remove: '清除', protect: '保护', allFiles: '全部文件',
  privacyChecker: '隐私检查器', c2paViewer: 'C2PA 查看器', privacy: '隐私说明', about: '关于我们', trust: '信任与规则', contact: '联系我们', terms: '使用条款',
  footerNote: '文件里藏着什么，在浏览器里看清楚。文件不用交给服务器。', footerFloor: '只在本机处理。不注册，不上传。',
  language: '语言', switchTo: '切换语言为',
};

const de: CommonMessages = {
  skip: 'Zum Inhalt springen', home: 'Startseite', navigation: 'Navigation', mainNavigation: 'Hauptnavigation', mobileNavigation: 'Mobile Navigation',
  openNavigation: 'Navigation öffnen', closeNavigation: 'Navigation schließen', viewMetadata: 'Metadaten anzeigen', checkPrivacy: 'Datenschutz prüfen',
  removeMetadata: 'Metadaten entfernen', verifyC2pa: 'C2PA prüfen', blog: 'Blog', allFormats: 'Alle Formate', images: 'Bilder', videos: 'Videos',
  audio: 'Audio', documents: 'Dokumente', inspect: 'Prüfen', remove: 'Entfernen', protect: 'Schützen', allFiles: 'Alle Dateien',
  privacyChecker: 'Datenschutz-Check', c2paViewer: 'C2PA-Viewer', privacy: 'Datenschutz', about: 'Über uns', trust: 'Vertrauen', contact: 'Kontakt', terms: 'Nutzungsbedingungen',
  footerNote: 'Ein lokaler Prüfplatz für die Details, die Dateien mit sich tragen.', footerFloor: 'Läuft lokal im Browser. Kein Konto. Kein Upload.',
  language: 'Sprache', switchTo: 'Sprache wechseln zu',
};

const fr: CommonMessages = {
  skip: 'Aller au contenu', home: 'Accueil', navigation: 'Navigation', mainNavigation: 'Navigation principale', mobileNavigation: 'Navigation mobile',
  openNavigation: 'Ouvrir la navigation', closeNavigation: 'Fermer la navigation', viewMetadata: 'Voir les métadonnées', checkPrivacy: 'Vérifier la confidentialité',
  removeMetadata: 'Supprimer les métadonnées', verifyC2pa: 'Vérifier C2PA', blog: 'Blog', allFormats: 'Tous les formats', images: 'Images', videos: 'Vidéos',
  audio: 'Audio', documents: 'Documents', inspect: 'Inspecter', remove: 'Supprimer', protect: 'Protéger', allFiles: 'Tous les fichiers',
  privacyChecker: 'Analyse de confidentialité', c2paViewer: 'Visionneuse C2PA', privacy: 'Confidentialité', about: 'À propos', trust: 'Confiance', contact: 'Contact', terms: 'Conditions d’utilisation',
  footerNote: 'Un bureau d’analyse local pour voir ce que vos fichiers transportent avec eux.', footerFloor: 'Traitement local dans le navigateur. Sans compte. Sans envoi.',
  language: 'Langue', switchTo: 'Changer la langue pour',
};

export const messages: Record<Locale, CommonMessages> = { en, de, fr, 'zh-CN': zh };

export function getMessages(locale: Locale): CommonMessages {
  return messages[locale];
}
