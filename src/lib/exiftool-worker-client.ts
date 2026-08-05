import type { NormalizedImageMetadata } from './metadata/types';
import type { ExifToolInspection, MetadataInspectionMode } from './metadata-report/types';
import type { PrivacyDeepInspection, PrivacyReport, PrivacyStructuralCleanup } from './privacy/types';
import type { ExifToolOperation, ExifToolProgressStage, ExifToolWorkerRequest, ExifToolWorkerResponse } from '../workers/exiftool-protocol';

type ExifToolRequestWithoutId = ExifToolWorkerRequest extends infer Request
  ? Request extends { id: string } ? Omit<Request, 'id'> : never
  : never;

export class ExifToolCancellationError extends Error {
  constructor() {
    super('ExifTool task canceled.');
    this.name = 'ExifToolCancellationError';
  }
}

export class ExifToolWorkerClient {
  private worker: Worker | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private rejectActive: ((reason: Error) => void) | null = null;
  private activeId: string | null = null;

  private makeWorker(): Worker {
    if (this.worker) return this.worker;
    this.worker = new Worker(new URL('../workers/exiftool.worker.ts', import.meta.url), { type: 'module' });
    return this.worker;
  }

  private clearActive(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.rejectActive = null;
    this.activeId = null;
  }

  private run<T>(
    request: ExifToolRequestWithoutId,
    expectedOperation: ExifToolOperation,
    onProgress: (stage: ExifToolProgressStage) => void,
    timeoutMs: number,
  ): Promise<T> {
    if (this.activeId) this.cancel();
    const worker = this.makeWorker();
    const id = crypto.randomUUID();
    this.activeId = id;
    return new Promise<T>((resolve, reject) => {
      this.rejectActive = reject;
      this.timer = setTimeout(() => {
        this.terminate();
        reject(new Error(`ExifTool did not finish within ${Math.round(timeoutMs / 1_000)} seconds.`));
      }, timeoutMs);
      worker.onmessage = (event: MessageEvent<ExifToolWorkerResponse>) => {
        if (event.data.id !== id) return;
        if (event.data.status === 'progress') {
          onProgress(event.data.stage);
          return;
        }
        this.clearActive();
        if (event.data.status === 'error') {
          reject(new Error(event.data.error.message));
          return;
        }
        if (event.data.operation !== expectedOperation) {
          reject(new Error('ExifTool returned a result for a stale or mismatched task.'));
          return;
        }
        resolve(event.data.result as T);
      };
      worker.onerror = (event) => {
        this.clearActive();
        this.terminate();
        reject(new Error(event.message || 'The ExifTool worker stopped unexpectedly.'));
      };
      worker.postMessage({ ...request, id } as ExifToolWorkerRequest);
    });
  }

  inspect(file: File, mode: MetadataInspectionMode, onProgress: (stage: ExifToolProgressStage) => void, timeoutMs: number): Promise<ExifToolInspection> {
    return this.run<ExifToolInspection>({ type: 'inspect-exiftool', file, mode }, 'metadata', onProgress, timeoutMs);
  }

  inspectPrivacy(
    file: File,
    metadata: NormalizedImageMetadata,
    previousReport: PrivacyReport,
    mode: MetadataInspectionMode,
    onProgress: (stage: ExifToolProgressStage) => void,
    timeoutMs: number,
  ): Promise<PrivacyDeepInspection> {
    return this.run<PrivacyDeepInspection>({ type: 'inspect-privacy', file, metadata, previousReport, mode }, 'privacy', onProgress, timeoutMs);
  }

  cleanPreservingEncoding(file: File, onProgress: (stage: ExifToolProgressStage) => void, timeoutMs = 120_000): Promise<PrivacyStructuralCleanup> {
    return this.run<PrivacyStructuralCleanup>({ type: 'clean-preserve-encoding', file }, 'cleanup', onProgress, timeoutMs);
  }

  cancel(): void {
    const reject = this.rejectActive;
    this.terminate();
    reject?.(new ExifToolCancellationError());
  }

  terminate(): void {
    if (this.timer) clearTimeout(this.timer);
    this.worker?.terminate();
    this.worker = null;
    this.timer = null;
    this.rejectActive = null;
    this.activeId = null;
  }
}
