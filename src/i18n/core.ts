export const locales = ['en', 'de', 'zh-CN'] as const;

export type Locale = (typeof locales)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const CHINESE_PREFIX = '/zh-cn';
export const GERMAN_PREFIX = '/de';

const localePrefixes: Record<Exclude<Locale, 'en'>, string> = {
  de: GERMAN_PREFIX,
  'zh-CN': CHINESE_PREFIX,
};

export function getLocaleFromPath(pathname: string): Locale {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (path === CHINESE_PREFIX || path.startsWith(`${CHINESE_PREFIX}/`)) return 'zh-CN';
  if (path === GERMAN_PREFIX || path.startsWith(`${GERMAN_PREFIX}/`)) return 'de';
  return 'en';
}

export function stripLocale(pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  for (const prefix of Object.values(localePrefixes)) {
    if (path === prefix || path === `${prefix}/`) return '/';
    if (path.startsWith(`${prefix}/`)) return path.slice(prefix.length) || '/';
  }
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
  const prefix = localePrefixes[locale];
  return `${bare === '/' ? `${prefix}/` : `${prefix}${bare}`}${suffix}`;
}

export interface AlternatePaths {
  en: string;
  de: string;
  'zh-CN': string;
  'x-default': string;
}

export function getAlternatePaths(pathname: string): AlternatePaths {
  const en = localizePath(pathname, 'en');
  return { en, de: localizePath(pathname, 'de'), 'zh-CN': localizePath(pathname, 'zh-CN'), 'x-default': en };
}

export function localeNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function pick<T>(locale: Locale, en: T, zh: T, de: T = en): T {
  if (locale === 'zh-CN') return zh;
  if (locale === 'de') return de;
  return en;
}
