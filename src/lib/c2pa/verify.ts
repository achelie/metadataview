import { MetadataError } from '../metadata/errors';
import { makeFileSummary, toJsonSafe } from '../metadata/utils';
import type { FileSummary } from '../metadata/types';

export type C2paStatus = 'verified' | 'invalid' | 'not-found' | 'unsupported' | 'error';

export interface C2paResult {
  file: FileSummary;
  status: C2paStatus;
  activeManifest: Record<string, unknown> | null;
  manifest: Record<string, unknown> | null;
  validationErrors: unknown[];
}

const supportedMimes = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'audio/mp4', 'application/pdf']);

export async function verifyC2pa(file: File): Promise<C2paResult> {
  const fallbackType = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : file.type === 'video/mp4' ? 'mp4' : file.type === 'application/pdf' ? 'pdf' : 'jpeg';
  const summary = makeFileSummary(file, fallbackType);
  if (!supportedMimes.has(file.type)) return { file: summary, status: 'unsupported', activeManifest: null, manifest: null, validationErrors: [] };
  try {
    const [{ createC2pa }, wasmModule] = await Promise.all([
      import('@contentauth/c2pa-web'),
      import('@contentauth/c2pa-web/resources/c2pa.wasm?url'),
    ]);
    const c2pa = await createC2pa({ wasmSrc: wasmModule.default });
    let reader: Awaited<ReturnType<typeof c2pa.reader.fromBlob>> | null = null;
    try {
      reader = await c2pa.reader.fromBlob(file.type, file);
      if (!reader) return { file: summary, status: 'not-found', activeManifest: null, manifest: null, validationErrors: [] };
      const store = toJsonSafe(await reader.manifestStore()) as Record<string, unknown>;
      const active = toJsonSafe(await reader.activeManifest()) as Record<string, unknown>;
      const validation = (store.validation_status ?? store.validationStatus ?? active.validation_status ?? active.validationStatus ?? []) as unknown;
      const validationErrors = Array.isArray(validation) ? validation.filter((item) => !/valid|trusted/i.test(JSON.stringify(item))) : [];
      return { file: summary, status: validationErrors.length ? 'invalid' : 'verified', activeManifest: active, manifest: store, validationErrors };
    } finally {
      if (reader) await reader.free();
      c2pa.dispose();
    }
  } catch (error) {
    if (error instanceof MetadataError) throw error;
    throw new MetadataError('C2PA_WASM_LOAD_FAILED', 'Content Credentials could not be checked in this browser.', { cause: error instanceof Error ? error : undefined });
  }
}
