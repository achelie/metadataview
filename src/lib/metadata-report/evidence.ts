import type { FileEvidence } from './types';

function formatHeader(bytes: number[]): { hex: string; ascii: string } {
  const rows: string[] = [];
  const asciiRows: string[] = [];
  for (let offset = 0; offset < bytes.length; offset += 16) {
    const row = bytes.slice(offset, offset + 16);
    rows.push(`${offset.toString(16).padStart(4, '0')}  ${row.map((byte) => byte.toString(16).padStart(2, '0')).join(' ')}`);
    asciiRows.push(row.map((byte) => byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.').join(''));
  }
  return { hex: rows.join('\n'), ascii: asciiRows.join('\n') };
}

export async function computeFileEvidence(file: Blob, signal?: AbortSignal): Promise<FileEvidence> {
  const { createMD5, createSHA256 } = await import('hash-wasm');
  const [sha256, md5] = await Promise.all([createSHA256(), createMD5()]);
  sha256.init();
  md5.init();
  const header: number[] = [];
  const chunkBytes = 2 * 1024 * 1024;
  for (let offset = 0; offset < file.size; offset += chunkBytes) {
    if (signal?.aborted) throw new DOMException('File inspection was canceled.', 'AbortError');
    const value = new Uint8Array(await file.slice(offset, Math.min(file.size, offset + chunkBytes)).arrayBuffer());
    sha256.update(value);
    md5.update(value);
    if (header.length < 256) header.push(...Array.from(value.subarray(0, 256 - header.length)));
  }
  if (signal?.aborted) throw new DOMException('File inspection was canceled.', 'AbortError');
  const formatted = formatHeader(header);
  return {
    sha256: sha256.digest('hex'),
    md5: md5.digest('hex'),
    headerBytes: header,
    headerHex: formatted.hex,
    headerAscii: formatted.ascii,
  };
}
