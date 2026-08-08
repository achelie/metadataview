import type { C2paSdk, Reader, Settings } from '@contentauth/c2pa-web';
import { MetadataError } from '../metadata/errors';
import { computeFileEvidence } from '../metadata-report/evidence';
import { createC2paReport } from './report';
import { detectC2paAsset, makeC2paFileSummary } from './formats';
import type { C2paProgressStage, C2paReport, C2paVerificationOptions } from './types';

interface ActiveVerification {
  id: string;
  controller: AbortController;
  sdk: C2paSdk | null;
  reader: Reader | null;
  timer: ReturnType<typeof setTimeout> | null;
  rejectCancellation: ((reason: Error) => void) | null;
}

export class C2paCancellationError extends Error {
  constructor() {
    super('Content Credentials verification was canceled.');
    this.name = 'C2paCancellationError';
  }
}

function throwIfCanceled(active: ActiveVerification): void {
  if (active.controller.signal.aborted) throw new C2paCancellationError();
}

async function freeReader(active: ActiveVerification): Promise<void> {
  const reader = active.reader;
  active.reader = null;
  if (!reader) return;
  try { await reader.free(); }
  catch { /* The SDK worker may already have been terminated by cancel or timeout. */ }
}

function disposeSdk(active: ActiveVerification): void {
  active.sdk?.dispose();
  active.sdk = null;
}

function safeVerificationError(error: unknown): Error {
  if (error instanceof C2paCancellationError || error instanceof MetadataError) return error;
  const message = error instanceof Error ? error.message : '';
  if (/unsupported format/i.test(message)) {
    return new MetadataError('C2PA_UNSUPPORTED', 'The official verifier does not support this file format in the browser.');
  }
  if (/too large/i.test(message)) {
    return new MetadataError('FILE_TOO_LARGE', 'This file is too large for the browser verifier.');
  }
  if (/wasm|webassembly|worker|compile|instantiate|fetch/i.test(message)) {
    return new MetadataError('C2PA_WASM_LOAD_FAILED', 'The local Content Credentials engine could not start. Check that WebAssembly and Web Workers are allowed, then retry.');
  }
  return new MetadataError('C2PA_VALIDATION_FAILED', 'The credential data could not be read safely. The file may be damaged or use a C2PA layout this browser engine does not support.');
}

async function runVerification(file: File, active: ActiveVerification, onProgress: (stage: C2paProgressStage) => void): Promise<C2paReport> {
  onProgress('checking-file');
  const detected = await detectC2paAsset(file);
  throwIfCanceled(active);
  const summary = makeC2paFileSummary(file, detected);

  if (!detected.supported || !detected.inspectedMime) {
    const evidence = await computeFileEvidence(file, active.controller.signal);
    return createC2paReport({
      file: summary,
      sha256: evidence.sha256,
      manifestStore: null,
      warnings: detected.warnings,
      forcedStatus: 'unsupported',
    });
  }

  onProgress('loading-engine');
  const evidencePromise = computeFileEvidence(file, active.controller.signal);
  const [{ createC2pa }, wasmModule] = await Promise.all([
    import('@contentauth/c2pa-web'),
    import('@contentauth/c2pa-web/resources/c2pa.wasm?url'),
  ]);
  throwIfCanceled(active);

  const settings: Settings = {
    verify: {
      verifyAfterReading: true,
      // A static, privacy-first verifier cannot silently fetch or pretend to own
      // a current publisher trust list. Integrity remains fully validated below.
      verifyTrust: false,
    },
  };
  active.sdk = await createC2pa({ wasmSrc: wasmModule.default, settings });
  throwIfCanceled(active);

  onProgress('reading-credential');
  active.reader = await active.sdk.reader.fromBlob(detected.inspectedMime, file);
  throwIfCanceled(active);
  const evidence = await evidencePromise;
  if (!active.reader) {
    return createC2paReport({
      file: summary,
      sha256: evidence.sha256,
      manifestStore: null,
      warnings: detected.warnings,
      forcedStatus: 'not-found',
    });
  }

  onProgress('validating');
  const [manifestStore, activeManifest, activeLabel] = await Promise.all([
    active.reader.manifestStore(),
    active.reader.activeManifest(),
    active.reader.activeLabel(),
  ]);
  throwIfCanceled(active);
  onProgress('building-report');
  return createC2paReport({
    file: summary,
    sha256: evidence.sha256,
    manifestStore,
    activeManifest,
    activeLabel,
    warnings: detected.warnings,
  });
}

export class C2paVerifierClient {
  private active: ActiveVerification | null = null;

  verify(file: File, options: C2paVerificationOptions = {}): Promise<C2paReport> {
    this.cancel();
    const active: ActiveVerification = {
      id: crypto.randomUUID(),
      controller: new AbortController(),
      sdk: null,
      reader: null,
      timer: null,
      rejectCancellation: null,
    };
    this.active = active;
    const onProgress = options.onProgress ?? (() => undefined);
    const timeoutMs = options.timeoutMs ?? 120_000;

    const operation = runVerification(file, active, onProgress)
      .catch((error) => { throw safeVerificationError(error); });
    const canceled = new Promise<C2paReport>((_resolve, reject) => {
      active.rejectCancellation = reject;
    });
    active.timer = setTimeout(() => {
      if (this.active?.id !== active.id) return;
      active.controller.abort();
      void freeReader(active).finally(() => disposeSdk(active));
      active.rejectCancellation?.(new MetadataError('PARSE_TIMEOUT', `Content Credentials verification did not finish within ${Math.round(timeoutMs / 1_000)} seconds.`));
    }, timeoutMs);

    return Promise.race([operation, canceled]).finally(async () => {
      if (active.timer) clearTimeout(active.timer);
      await freeReader(active);
      disposeSdk(active);
      if (this.active?.id === active.id) this.active = null;
    });
  }

  cancel(): void {
    const active = this.active;
    if (!active) return;
    this.active = null;
    active.controller.abort();
    if (active.timer) clearTimeout(active.timer);
    void freeReader(active).finally(() => disposeSdk(active));
    active.rejectCancellation?.(new C2paCancellationError());
  }

  dispose(): void {
    this.cancel();
  }
}

export async function verifyC2pa(file: File, options: C2paVerificationOptions = {}): Promise<C2paReport> {
  const client = new C2paVerifierClient();
  try { return await client.verify(file, options); }
  finally { client.dispose(); }
}

export type { C2paProgressStage, C2paReport } from './types';
