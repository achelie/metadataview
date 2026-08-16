export const locales = ['en', 'zh-CN'] as const;

export type Locale = (typeof locales)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const CHINESE_PREFIX = '/zh-cn';

export function getLocaleFromPath(pathname: string): Locale {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return path === CHINESE_PREFIX || path.startsWith(`${CHINESE_PREFIX}/`) ? 'zh-CN' : 'en';
}

export function stripLocale(pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (path === CHINESE_PREFIX || path === `${CHINESE_PREFIX}/`) return '/';
  if (path.startsWith(`${CHINESE_PREFIX}/`)) return path.slice(CHINESE_PREFIX.length) || '/';
  return path || '/';
}

function normalizePath(pathname: string): string {
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export function localizePath(pathname: string, locale: Locale): string {
  if (!pathname || pathname.startsWith('#') || /^(?:[a-z]+:)?\/\//i.test(pathname)) return pathname;
  const hashIndex = pathname.indexOf('#');
  const queryIndex = pathname.indexOf('?');
  const splitAt = [hashIndex, queryIndex].filter((value) => value >= 0).sort((a, b) => a - b)[0] ?? pathname.length;
  const suffix = pathname.slice(splitAt);
  const bare = normalizePath(stripLocale(pathname.slice(0, splitAt)));
  if (locale === 'en') return `${bare}${suffix}`;
  return `${bare === '/' ? `${CHINESE_PREFIX}/` : `${CHINESE_PREFIX}${bare}`}${suffix}`;
}

export interface AlternatePaths {
  en: string;
  'zh-CN': string;
  'x-default': string;
}

export function getAlternatePaths(pathname: string): AlternatePaths {
  const en = localizePath(pathname, 'en');
  return { en, 'zh-CN': localizePath(pathname, 'zh-CN'), 'x-default': en };
}

export function localeNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function pick<T>(locale: Locale, en: T, zh: T): T {
  return locale === 'zh-CN' ? zh : en;
}
