import { BlobReader, Writer, TextReader, ZipReader, ZipWriter } from '@zip.js/zip.js';
import type { DetectedFileType } from '../metadata/types';
import type { MetadataWorkerCleanup } from './types';
import { hashBlob } from './content-integrity';

export const OOXML_CLEANUP_LIMITS = Object.freeze({ entryBytes: 64 * 1024 * 1024, totalBytes: 256 * 1024 * 1024, propertyBytes: 2 * 1024 * 1024, outputBytes: 100 * 1024 * 1024 });

// Check chunks before retaining them; ZIP size declarations are untrusted.
export class BoundedBlobWriter extends Writer<Blob> {
  private bytes = 0;
  private chunks: Uint8Array<ArrayBuffer>[] = [];
  constructor(private readonly limit: number, private readonly consume: (bytes: number) => void = () => {}, private readonly onFailure: (error: unknown) => void = () => {}) { super(); }
  async writeUint8Array(chunk: Uint8Array): Promise<void> {
    try {
      if (this.bytes + chunk.byteLength > this.limit) throw new Error('Office data exceeds the decompression/output safety limit.');
      this.consume(chunk.byteLength);
    } catch (error) {
      this.chunks = [];
      this.onFailure(error);
      throw error;
    }
    this.bytes += chunk.byteLength;
    this.chunks.push(new Uint8Array(chunk));
  }
  async getData(): Promise<Blob> { const blob = new Blob(this.chunks); this.chunks = []; return blob; }
}

const rewrittenProperties = new Set(['docprops/core.xml', 'docprops/custom.xml', 'docprops/app.xml']);

export async function verifyOfficeContent(blob: Blob, expected: ReadonlyMap<string, string>, limits = OOXML_CLEANUP_LIMITS): Promise<boolean> {
  const reader = new ZipReader(new BlobReader(blob), { useWebWorkers: false, strictness: 'strict', checkAmbiguity: true });
  const remaining = new Map(expected);
  let total = 0;
  try {
    const entries = await reader.getEntries();
    if (entries.length > 10_000) return false;
    for (const entry of entries) {
      if (entry.directory || rewrittenProperties.has(entry.filename.toLowerCase())) continue;
      if (!remaining.has(entry.filename) || entry.uncompressedSize > limits.entryBytes) return false;
      const data = await entry.getData(new BoundedBlobWriter(limits.entryBytes, (size) => {
        total += size;
        if (total > limits.totalBytes) throw new Error('Office verification exceeds the total decompression safety limit.');
      }), { useWebWorkers: false, checkSignature: true, checkOverlappingEntry: true });
      if (await hashBlob(data) !== remaining.get(entry.filename)) return false;
      remaining.delete(entry.filename);
    }
    return remaining.size === 0;
  } finally { await reader.close(); }
}

function sanitizeCoreXml(): string {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/>';
}

function sanitizeAppXml(xml: string): string {
  return xml.replace(/<(Application|AppVersion|Company|Manager|Template|HyperlinkBase)(?:\s[^>]*)?>[\s\S]*?<\/\1>/gi, '<$1></$1>');
}

function sanitizeCustomXml(): string {
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"/>';
}

export async function cleanOoxml(file: File, type: DetectedFileType, limits = OOXML_CLEANUP_LIMITS): Promise<MetadataWorkerCleanup> {
  const mime = type === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : type === 'pptx' ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const reader = new ZipReader(new BlobReader(file), { useWebWorkers: false, strictness: 'strict', checkAmbiguity: true });
  let limitFailure: unknown;
  const bounded = (limit: number, consume?: (bytes: number) => void) => new BoundedBlobWriter(limit, consume, (error) => { limitFailure = error; });
  const writer = new ZipWriter(bounded(limits.outputBytes), { useWebWorkers: false });
  let count = 0;
  let actualTotal = 0;
  const contentHashes = new Map<string, string>();
  try {
    const entries = await reader.getEntries({ strictness: 'strict', checkAmbiguity: true, maxAppendedDataSize: 0 });
    if (entries.length > 10_000) throw new Error('The Office package exceeds the 10,000 entry safety limit.');
    let declaredTotal = 0;
    for (const entry of entries) {
      if (entry.directory) continue;
      const size = entry.uncompressedSize;
      if (!Number.isSafeInteger(size) || size < 0 || size > limits.entryBytes) throw new Error('Office entry exceeds the decompression safety limit.');
      declaredTotal += size;
      if (declaredTotal > limits.totalBytes) throw new Error('Office package exceeds the total decompression safety limit.');
    }
    const names = new Set<string>();
    for (const entry of entries) {
      count += 1;
      const normalized = entry.filename.toLowerCase();
      if (names.has(normalized) || entry.encrypted || entry.filename.includes('..') || entry.filename.includes('\\') || entry.filename.startsWith('/')) throw new Error('The Office package contains an unsafe or ambiguous entry.');
      names.add(normalized);
      if (entry.directory) { await writer.add(entry.filename, undefined, { directory: true }); continue; }
      if (normalized === 'docprops/core.xml') {
        await writer.add(entry.filename, new TextReader(sanitizeCoreXml()));
      } else if (normalized === 'docprops/custom.xml') {
        await writer.add(entry.filename, new TextReader(sanitizeCustomXml()));
      } else if (normalized === 'docprops/app.xml') {
        const data = await entry.getData(bounded(Math.min(limits.entryBytes, limits.propertyBytes), (size) => {
          actualTotal += size;
          if (actualTotal > limits.totalBytes) throw new Error('Office package exceeds the total decompression safety limit.');
        }), { useWebWorkers: false, checkSignature: true });
        const xml = await data.text();
        await writer.add(entry.filename, new TextReader(sanitizeAppXml(xml)));
      } else {
        const data = await entry.getData(bounded(limits.entryBytes, (size) => {
          actualTotal += size;
          if (actualTotal > limits.totalBytes) throw new Error('Office package exceeds the total decompression safety limit.');
        }), { useWebWorkers: false, checkSignature: true, checkOverlappingEntry: true });
        contentHashes.set(entry.filename, await hashBlob(data));
        await writer.add(entry.filename, new BlobReader(data));
      }
    }
    if (!count) throw new Error('The Office package is empty.');
    const blob = await writer.close();
    if (!await verifyOfficeContent(blob, contentHashes, limits)) throw new Error('Office content changed during cleanup. Download is blocked.');
    return { data: await blob.arrayBuffer(), mime, engine: 'ooxml-zip', contentChecks: [{ id: 'office-content', label: 'Office content SHA-256', status: 'passed', message: 'Every package file outside the three rewritten property files matches its original SHA-256 hash.' }], warnings: ['Core, Custom and Application properties were rewritten. All other package files were verified byte-for-byte.'] };
  } catch (error) {
    throw limitFailure ?? error;
  } finally {
    await reader.close().catch(() => undefined);
    await writer.close().catch(() => undefined);
  }
}
