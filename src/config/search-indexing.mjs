// Keep translations available while only English pages participate in Search.
// Remove a prefix here when its language is ready to be indexed again.
const noindexLanguagePrefixes = ['/de', '/fr', '/zh-cn'];

/** @param {string} pathname */
export function isLocaleNoindex(pathname) {
  return noindexLanguagePrefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
