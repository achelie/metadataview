import type { WorkerRequest, WorkerResponse, WorkerResult } from '../workers/protocol';
import { MetadataError, type ParseErrorCode } from './metadata/errors';

export interface WorkerTask<T extends WorkerResult = WorkerResult> {
  promise: Promise<T>;
  cancel: () => void;
}

export function runWorkerTask<T extends WorkerResult>(request: Omit<WorkerRequest, 'id'>, timeoutMs = 25_000): WorkerTask<T> {
  const worker = new Worker(new URL('../workers/metadata.worker.ts', import.meta.url), { type: 'module' });
  const id = crypto.randomUUID();
  let timer: ReturnType<typeof setTimeout>;
  const promise = new Promise<T>((resolve, reject) => {
    timer = setTimeout(() => { worker.terminate(); reject(new MetadataError('PARSE_TIMEOUT', 'Parsing took too long and was stopped.')); }, timeoutMs);
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.id !== id) return;
      clearTimeout(timer);
      worker.terminate();
      if (event.data.status === 'success') resolve(event.data.result as T);
      else reject(new MetadataError(event.data.error.code as ParseErrorCode, event.data.error.message));
    };
    worker.onerror = (event) => { clearTimeout(timer); worker.terminate(); reject(new MetadataError('UNKNOWN_PARSE_ERROR', event.message || 'The local parser stopped unexpectedly.')); };
    worker.postMessage({ ...request, id });
  });
  return { promise, cancel: () => { clearTimeout(timer); worker.terminate(); } };
}
