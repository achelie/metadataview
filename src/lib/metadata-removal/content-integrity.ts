import { createSHA256 } from 'hash-wasm';
import type { MetadataOutputCheck } from './types';

export async function hashBlob(blob: Blob): Promise<string> {
  const hash = await createSHA256();
  const reader = blob.stream().getReader();
  try {
    while (true) { const next = await reader.read(); if (next.done) break; hash.update(next.value); }
    return hash.digest('hex');
  } finally { reader.releaseLock(); }
}

const text = (bytes: Uint8Array, at: number, length: number) => String.fromCharCode(...bytes.subarray(at, at + length));

/** Compare encoded payloads only. This does not certify rendering or every ancillary field. */
function payload(bytes: Uint8Array): Blob | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const parts: BlobPart[] = [];
  const add = (start: number, end: number) => parts.push(bytes.slice(start, end) as Uint8Array<ArrayBuffer>);
  if (bytes.length >= 8 && text(bytes, 1, 3) === 'PNG') {
    let offset = 8;
    while (offset + 12 <= bytes.length) {
      const size = view.getUint32(offset);
      const end = offset + 12 + size;
      if (end > bytes.length) return null;
      if (['IHDR', 'PLTE', 'tRNS', 'IDAT', 'acTL', 'fcTL', 'fdAT'].includes(text(bytes, offset + 4, 4))) add(offset + 4, end - 4);
      offset = end;
    }
    if (offset !== bytes.length) return null;
  } else if (bytes.length >= 12 && text(bytes, 0, 4) === 'RIFF' && ['WAVE', 'WEBP'].includes(text(bytes, 8, 4))) {
    let offset = 12;
    while (offset + 8 <= bytes.length) {
      const size = view.getUint32(offset + 4, true);
      const end = offset + 8 + size;
      if (end > bytes.length) return null;
      if (['fmt ', 'data', 'VP8 ', 'VP8L', 'ALPH', 'ANIM', 'ANMF'].includes(text(bytes, offset, 4))) add(offset, end);
      offset = end + (size & 1);
    }
    if (offset !== bytes.length) return null;
  } else if (bytes.length >= 12 && ['ftyp', 'wide', 'mdat', 'moov'].includes(text(bytes, 4, 4))) {
    let offset = 0;
    while (offset + 8 <= bytes.length) {
      let size = view.getUint32(offset);
      let header = 8;
      if (size === 1) {
        if (offset + 16 > bytes.length) return null;
        const large = view.getBigUint64(offset + 8);
        if (large > BigInt(Number.MAX_SAFE_INTEGER)) return null;
        size = Number(large); header = 16;
      } else if (size === 0) size = bytes.length - offset;
      if (size < header || offset + size > bytes.length) return null;
      if (text(bytes, offset + 4, 4) === 'mdat') add(offset + header, offset + size);
      offset += size;
    }
    if (offset !== bytes.length) return null;
  } else return null;
  return parts.length ? new Blob(parts) : null;
}

export async function verifyEncodedPayload(before: Blob, after: Blob): Promise<MetadataOutputCheck> {
  const source = payload(new Uint8Array(await before.arrayBuffer()));
  const output = payload(new Uint8Array(await after.arrayBuffer()));
  if (source && !output) return { id: 'content-payload', label: 'Content consistency', status: 'failed', message: 'The cleaned content payload could not be verified. Download is blocked.' };
  if (!source || !output) return { id: 'content-payload', label: 'Content consistency', status: 'warning', message: 'Only structure was checked. Content consistency has not been verified for this format.' };
  const equal = await hashBlob(source) === await hashBlob(output);
  return { id: 'content-payload', label: 'Encoded payload SHA-256', status: equal ? 'passed' : 'failed', message: equal ? 'Encoded image/audio/video payloads match. Rendering, ancillary data and track interpretation are not certified by this check.' : 'Encoded content changed during cleanup. Download is blocked.' };
}
