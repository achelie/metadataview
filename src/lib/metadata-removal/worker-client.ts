import type { DetectedFileType } from '../metadata/types';
import type { MetadataWorkerCleanup } from './types';
import type { MetadataRemovalProgress, MetadataRemovalWorkerRequest, MetadataRemovalWorkerResponse } from '../../workers/metadata-removal-protocol';

export class MetadataRemovalCanceledError extends Error {
  constructor() { super('Metadata cleanup canceled.'); this.name = 'MetadataRemovalCanceledError'; }
}

export class MetadataRemovalWorkerClient {
  private worker: Worker | null = null;
  private rejectActive: ((reason: Error) => void) | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  clean(file: File, fileType: DetectedFileType, onProgress: (stage: MetadataRemovalProgress) => void, timeoutMs = 180_000): Promise<MetadataWorkerCleanup> {
    this.cancel();
    const worker = new Worker(new URL('../../workers/metadata-removal.worker.ts', import.meta.url), { type: 'module' });
    this.worker = worker;
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      this.rejectActive = reject;
      this.timer = setTimeout(() => { this.terminate(); reject(new Error(`Metadata cleanup did not finish within ${Math.round(timeoutMs / 1_000)} seconds.`)); }, timeoutMs);
      worker.onmessage = (event: MessageEvent<MetadataRemovalWorkerResponse>) => {
        if (event.data.id !== id) return;
        if (event.data.status === 'progress') { onProgress(event.data.stage); return; }
        this.terminate();
        if (event.data.status === 'error') reject(new Error(event.data.error.message));
        else resolve(event.data.result);
      };
      worker.onerror = (event) => { this.terminate(); reject(new Error(event.message || 'The metadata cleanup worker stopped unexpectedly.')); };
      const request: MetadataRemovalWorkerRequest = { id, type: 'clean-container-metadata', file, fileType };
      worker.postMessage(request);
    });
  }

  cancel(): void {
    const reject = this.rejectActive;
    const active = Boolean(this.worker);
    this.terminate();
    if (active) reject?.(new MetadataRemovalCanceledError());
  }

  terminate(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.worker?.terminate();
    this.worker = null;
    this.rejectActive = null;
  }
}
