/// <reference lib="webworker" />
import { detectAndParseGenerator } from '../lib/generators/detect-generator';
import { toMetadataError } from '../lib/metadata/errors';
import { parseFile } from '../lib/metadata/parse-file';
import { parseImage } from '../lib/metadata/parse-image';
import { createPrivacyReport } from '../lib/privacy/create-privacy-report';
import { computeFileEvidence } from '../lib/metadata-report/evidence';
import { createMetadataReport } from '../lib/metadata-report/create-report';
import type { WorkerRequest, WorkerResponse } from './protocol';

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  let response: WorkerResponse;
  try {
    if (request.type === 'inspect-metadata') {
      const [metadata, evidence] = await Promise.all([
        parseFile(request.file, request.allowedTypes),
        computeFileEvidence(request.file),
      ]);
      response = { id: request.id, status: 'success', result: createMetadataReport(metadata, evidence) };
      self.postMessage(response);
      return;
    }
    if (request.type === 'parse-image' || request.type === 'check-image-privacy' || request.type === 'check-privacy') {
      const metadata = await parseImage(request.file);
      response = request.type === 'parse-image'
        ? { id: request.id, status: 'success', result: metadata }
        : { id: request.id, status: 'success', result: { metadata, report: createPrivacyReport(metadata) } };
      self.postMessage(response);
      return;
    }
    const metadata = await parseFile(request.file, request.type === 'parse-metadata' ? request.allowedTypes : ['jpeg', 'png', 'webp']);
    if (request.type === 'read-ai-prompt') response = { id: request.id, status: 'success', result: { metadata, generation: detectAndParseGenerator({ ...metadata.raw, ...metadata.normalized }) } };
    else response = { id: request.id, status: 'success', result: metadata };
  } catch (error) {
    const known = toMetadataError(error);
    response = { id: request.id, status: 'error', error: { code: known.code, message: known.message } };
  }
  self.postMessage(response);
};

export {};
