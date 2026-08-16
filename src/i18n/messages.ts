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
  privacyChecker: 'Privacy checker', c2paViewer: 'C2PA viewer', privacy: 'Privacy', about: 'About',
  footerNote: 'A browser-only evidence desk for the details your files carry around.', footerFloor: 'Built for local processing. No account. No upload.',
  language: 'Language', switchTo: 'Switch language to',
};

const zh: CommonMessages = {
  skip: '跳到主要内容', home: '首页', navigation: '导航', mainNavigation: '主导航', mobileNavigation: '移动端导航',
  openNavigation: '打开导航', closeNavigation: '关闭导航', viewMetadata: '查看元数据', checkPrivacy: '检查隐私',
  removeMetadata: '清除元数据', verifyC2pa: '验证 C2PA', blog: '博客', allFormats: '全部格式', images: '图片', videos: '视频',
  audio: '音频', documents: '文档', inspect: '查看', remove: '清除', protect: '保护', allFiles: '全部文件',
  privacyChecker: '隐私检查器', c2paViewer: 'C2PA 查看器', privacy: '隐私说明', about: '关于我们',
  footerNote: '文件里藏着什么，在浏览器里看清楚。文件不用交给服务器。', footerFloor: '只在本机处理。不注册，不上传。',
  language: '语言', switchTo: '切换语言为',
};

export const messages: Record<Locale, CommonMessages> = { en, 'zh-CN': zh };

export function getMessages(locale: Locale): CommonMessages {
  return messages[locale];
}
