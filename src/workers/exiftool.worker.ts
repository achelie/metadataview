/// <reference lib="webworker" />
import { adaptExifToolOutput, buildExifToolArgs, createExifToolVirtualName } from '../lib/metadata-report/exiftool-adapter';
import { PRESERVE_ENCODING_CLEANUP_ARGS } from '../lib/image/privacy-cleanup';
import { createPrivacyDeepInspection } from '../lib/privacy/create-privacy-report';
import type { ExifToolWorkerRequest, ExifToolWorkerResponse } from './exiftool-protocol';
import zeroPerlWasmUrl from '@colorhythm/exiftool-wasm/dist/esm/zeroperl-mqcadjqm.wasm?url';

const send = (response: ExifToolWorkerResponse, transfer?: Transferable[]) => self.postMessage(response, transfer ?? []);
const wasmFetch = () => fetch(zeroPerlWasmUrl);

function virtualFile(file: File): { name: string; data: Blob } {
  return { name: createExifToolVirtualName(file.name), data: file };
}

function imageMime(file: File): string {
  if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp') return file.type;
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';
}

self.onmessage = async (event: MessageEvent<ExifToolWorkerRequest>) => {
  const request = event.data;
  try {
    send({ id: request.id, status: 'progress', stage: 'loading' });
    const { parseMetadata, writeMetadata } = await import('@colorhythm/exiftool-wasm');

    if (request.type === 'clean-preserve-encoding') {
      send({ id: request.id, status: 'progress', stage: 'cleaning' });
      const result = await writeMetadata(virtualFile(request.file), {}, {
        args: [...PRESERVE_ENCODING_CLEANUP_ARGS],
        fetch: wasmFetch,
      });
      if (!result.success) throw new Error(result.error || `ExifTool cleanup stopped with exit code ${result.exitCode ?? 'unknown'}.`);
      const response: ExifToolWorkerResponse = {
        id: request.id,
        status: 'success',
        operation: 'cleanup',
        result: {
          schemaVersion: '1.0',
          data: result.data,
          mime: imageMime(request.file),
          warnings: ['Orientation and ICC color profile were intentionally retained. Some formats may keep structural fields, so verification is required.'],
          cleanupEngine: 'exiftool',
        },
      };
      send(response, [result.data]);
      return;
    }

    send({ id: request.id, status: 'progress', stage: 'extracting' });
    const result = await parseMetadata<unknown>(virtualFile(request.file), {
      args: buildExifToolArgs(request.mode),
      fetch: wasmFetch,
      transform: (value) => JSON.parse(value) as unknown,
    });
    if (!result.success) throw new Error(result.error || `ExifTool stopped with exit code ${result.exitCode ?? 'unknown'}.`);
    const inspection = adaptExifToolOutput(result.data, request.mode);

    if (request.type === 'inspect-privacy') {
      send({ id: request.id, status: 'progress', stage: 'scoring' });
      send({ id: request.id, status: 'success', operation: 'privacy', result: createPrivacyDeepInspection(request.metadata, inspection, request.previousReport) });
      return;
    }

    send({ id: request.id, status: 'progress', stage: 'building' });
    send({ id: request.id, status: 'success', operation: 'metadata', result: inspection });
  } catch (error) {
    send({ id: request.id, status: 'error', error: { message: error instanceof Error ? error.message : 'ExifTool could not complete this task.' } });
  }
};

export {};
