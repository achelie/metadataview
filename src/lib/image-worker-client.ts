import type { NormalizedImageMetadata } from './metadata/types';
import type { ImagePrivacyWorkerResult } from '../workers/protocol';
import { IMAGE_LIMITS } from './metadata/limits';
import { MetadataError, type ParseErrorCode } from './metadata/errors';
import type { WorkerResponse } from '../workers/protocol';

export class ImageWorkerClient {
  private worker: Worker | null = null;
  private activeId: string | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private rejectActive: ((reason: unknown) => void) | null = null;

  private makeWorker(): Worker {
    const worker = new Worker(new URL('../workers/metadata.worker.ts', import.meta.url), { type: 'module' });
    this.worker = worker;
    return worker;
  }

  parse(file: File): Promise<NormalizedImageMetadata> { return this.run<NormalizedImageMetadata>('parse-image', file); }
  checkPrivacy(file: File): Promise<ImagePrivacyWorkerResult> { return this.run<ImagePrivacyWorkerResult>('check-image-privacy', file); }

  private run<T>(type: 'parse-image' | 'check-image-privacy', file: File): Promise<T> {
    this.cancel();
    const worker = this.makeWorker();
    const id = crypto.randomUUID();
    this.activeId = id;
    return new Promise<T>((resolve, reject) => {
      this.rejectActive = reject;
      this.timer = setTimeout(() => {
        if (this.activeId !== id) return;
        this.stopWorker();
        reject(new MetadataError('PARSE_TIMEOUT', 'Parsing took longer than 15 seconds and was stopped. Try a smaller image.'));
      }, IMAGE_LIMITS.workerTimeoutMs);
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.id !== id || this.activeId !== id) return;
        this.finishTimer(); this.activeId = null; this.rejectActive = null; worker.terminate(); this.worker = null;
        if (event.data.status === 'success') resolve(event.data.result as T);
        else reject(new MetadataError(event.data.error.code as ParseErrorCode, event.data.error.message));
      };
      worker.onerror = (event) => {
        if (this.activeId !== id) return;
        this.stopWorker();
        reject(new MetadataError('WORKER_CRASHED', event.message || 'The local image parser stopped unexpectedly.'));
      };
      worker.postMessage({ id, type, file });
    });
  }

  cancel(): void {
    if (this.activeId && this.rejectActive) this.rejectActive(new MetadataError('PARSE_CANCELLED', 'Parsing was cancelled.'));
    this.stopWorker();
  }

  dispose(): void { this.cancel(); }

  private finishTimer(): void { if (this.timer) clearTimeout(this.timer); this.timer = null; }
  private stopWorker(): void {
    this.finishTimer(); this.worker?.terminate(); this.worker = null; this.activeId = null; this.rejectActive = null;
  }
}
