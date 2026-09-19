import { stripLocale } from '../../i18n/core';

const toolPaths = new Set(['/', '/metadata-viewer/', '/image-privacy-checker/', '/c2pa-viewer/', ...['metadata', 'image-metadata', 'video-metadata', 'audio-metadata', 'document-metadata'].flatMap((name) => [`/${name}-viewer/`, `/${name}-remover/`])]);
type Handoff = { token: symbol; file: File; destination: string; controller: AbortController };
let pending: Handoff | null = null;
let expiry: ReturnType<typeof setTimeout> | undefined;

/** This slot only exists between an explicit tool link and the receiving island. */
export function prepareToolFile(file: File, href: string, origin: string): symbol {
  const url = new URL(href, origin);
  if (url.origin !== origin || url.search || !toolPaths.has(stripLocale(url.pathname))) throw new Error('Unsupported tool destination');
  discardToolFile();
  const token = Symbol('tool-file');
  pending = { token, file, destination: url.pathname, controller: new AbortController() };
  expiry = setTimeout(() => discardToolFile(token), 90_000);
  return token;
}

export function discardToolFile(token?: symbol): void {
  if (token && pending?.token !== token) return;
  pending?.controller.abort();
  pending = null;
  clearTimeout(expiry);
  expiry = undefined;
}

export function takeToolFile(pathname: string): File | null {
  const file = pending?.destination === pathname ? pending.file : null;
  if (file) {
    pending = null;
    clearTimeout(expiry);
    expiry = undefined;
  } else discardToolFile();
  return file;
}

export function toolFileSignal(token: symbol): AbortSignal {
  return pending?.token === token ? pending.controller.signal : AbortSignal.abort();
}

if (typeof window !== 'undefined') {
  // A real page departure, reload, or bfcache entry must never retain a file.
  window.addEventListener('pagehide', () => discardToolFile());
}
