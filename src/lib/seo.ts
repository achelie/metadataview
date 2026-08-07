export const SITE_ORIGIN = 'https://www.viewexif.com';

export function canonicalUrl(path: string, site: URL | string = SITE_ORIGIN): string {
  const url = new URL(path, site);
  if (url.pathname !== '/' && !url.pathname.endsWith('/')) url.pathname += '/';
  url.search = '';
  url.hash = '';
  return url.toString();
}
