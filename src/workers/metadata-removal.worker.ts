/// <reference lib="webworker" />
import { BlobReader, BlobWriter, TextReader, TextWriter, Uint8ArrayReader, Uint8ArrayWriter, ZipReader, ZipWriter } from '@zip.js/zip.js';
import type { DetectedFileType } from '../lib/metadata/types';
import type { MetadataCleanupEngine, MetadataWorkerCleanup } from '../lib/metadata-removal/types';
import type { MetadataRemovalWorkerRequest, MetadataRemovalWorkerResponse } from './metadata-removal-protocol';
import qpdfWasmUrl from '@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url';

const send = (response: MetadataRemovalWorkerResponse, transfer?: Transferable[]) => self.postMessage(response, transfer ?? []);

const MIME: Partial<Record<DetectedFileType, string>> = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf', avi: 'video/x-msvideo', flv: 'video/x-flv',
  mkv: 'video/x-matroska', webm: 'video/webm', mp3: 'audio/mpeg', flac: 'audio/flac',
  ogg: 'audio/ogg', opus: 'audio/opus', m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', wma: 'audio/x-ms-wma',
};

function result(bytes: Uint8Array, type: DetectedFileType, engine: MetadataCleanupEngine, warnings: string[] = []): MetadataWorkerCleanup {
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return { data: buffer, mime: MIME[type] ?? 'application/octet-stream', engine, warnings };
}

async function cleanTagLib(file: File, type: DetectedFileType): Promise<MetadataWorkerCleanup> {
  const { TagLib } = await import('taglib-wasm');
  const taglib = await TagLib.initialize();
  const source = new Uint8Array(await file.arrayBuffer());
  const audio = await taglib.open(source);
  try {
    if (!audio.isValid()) throw new Error('TagLib could not safely open this media container.');
    const pictures = audio.getPictures();
    let chapters: ReturnType<typeof audio.getChapters> = [];
    try { chapters = audio.getChapters(); } catch { chapters = []; }
    audio.setProperties({});
    const tag = audio.tag();
    tag.setTitle('').setArtist('').setAlbum('').setComment('').setGenre('').setDate('').setTrack(0);
    try { audio.setRatings([]); } catch { /* not every container has ratings */ }
    try { audio.setLyrics([]); } catch { /* not every container has lyrics */ }
    if (type === 'wav' || type === 'flac') {
      try { audio.setBextData(null); } catch { /* optional chunk */ }
      try { audio.setIxml(null); } catch { /* optional chunk */ }
    }
    if (type === 'flac') try { audio.stripId3Tags(); } catch { /* optional tag */ }
    if (pictures.length) audio.setPictures(pictures);
    if (chapters.length && ['mp3', 'm4a'].includes(type)) try { audio.setChapters(chapters); } catch { /* preserve when supported */ }
    if (!audio.save()) throw new Error('TagLib refused to save the cleaned container.');
    return result(audio.getFileBuffer(), type, 'taglib', ['Cover art, chapters, attachments, and codec data were intentionally retained.']);
  } finally {
    audio.dispose();
  }
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

async function cleanOoxml(file: File, type: DetectedFileType): Promise<MetadataWorkerCleanup> {
  const reader = new ZipReader(new BlobReader(file), { useWebWorkers: false, strictness: 'strict', checkAmbiguity: true });
  const writer = new ZipWriter(new BlobWriter(MIME[type]), { useWebWorkers: false });
  let count = 0;
  try {
    const entries = await reader.getEntries({ strictness: 'strict', checkAmbiguity: true, maxAppendedDataSize: 0 });
    if (entries.length > 10_000) throw new Error('The Office package exceeds the 10,000 entry safety limit.');
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
        const xml = await entry.getData(new TextWriter('utf-8'), { useWebWorkers: false, checkSignature: true });
        await writer.add(entry.filename, new TextReader(sanitizeAppXml(xml)));
      } else {
        const bytes = await entry.getData(new Uint8ArrayWriter(), { useWebWorkers: false, checkSignature: true, checkOverlappingEntry: true });
        await writer.add(entry.filename, new Uint8ArrayReader(bytes));
      }
    }
    if (!count) throw new Error('The Office package is empty.');
    const blob = await writer.close();
    return result(new Uint8Array(await blob.arrayBuffer()), type, 'ooxml-zip', ['Document body, comments, revisions, media, and embedded objects were intentionally retained.']);
  } finally {
    await reader.close().catch(() => undefined);
    await writer.close().catch(() => undefined);
  }
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

function cleanAviBytes(source: Uint8Array): Uint8Array {
  const bytes = source.slice();
  const view = new DataView(bytes.buffer);
  const removable = new Set(['ID3 ', 'ID32', 'XMP ', '_PMX', 'iXML', 'bext']);
  const walk = (start: number, end: number) => {
    let offset = start;
    while (offset + 8 <= end) {
      const id = ascii(bytes, offset, 4);
      const size = view.getUint32(offset + 4, true);
      const dataStart = offset + 8;
      const dataEnd = Math.min(end, dataStart + size);
      if (dataEnd < dataStart || dataEnd > bytes.length) break;
      if ((id === 'LIST' || id === 'RIFF') && size >= 4) {
        const kind = ascii(bytes, dataStart, 4);
        if (id === 'LIST' && kind === 'INFO') {
          bytes.set([0x4a, 0x55, 0x4e, 0x4b], offset);
          bytes.fill(0, dataStart, dataEnd);
        } else walk(dataStart + 4, dataEnd);
      } else if (removable.has(id)) {
        bytes.set([0x4a, 0x55, 0x4e, 0x4b], offset);
        bytes.fill(0, dataStart, dataEnd);
      }
      offset = dataStart + size + (size & 1);
    }
  };
  if (ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'AVI ') throw new Error('The AVI signature is invalid.');
  walk(12, bytes.length);
  return bytes;
}

const FLV_PRIVATE_KEYS = /author|creator|copyright|description|comment|title|encoder|metadatacreator|creationdate|date|location|latitude|longitude|artist|album|software|device|serial/i;

function scrubAmfStrings(payload: Uint8Array): void {
  const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
  const readString = (offset: number, long = false) => {
    const prefix = long ? 4 : 2;
    if (offset + prefix > payload.length) return null;
    const length = long ? view.getUint32(offset, false) : view.getUint16(offset, false);
    const start = offset + prefix;
    if (start + length > payload.length) return null;
    return { value: new TextDecoder().decode(payload.subarray(start, start + length)), start, end: start + length, next: start + length };
  };
  const value = (offset: number, key = '', depth = 0): number => {
    if (depth > 24 || offset >= payload.length) return payload.length;
    const type = payload[offset++]!;
    if (type === 0) { if (offset + 8 > payload.length) return payload.length; if (FLV_PRIVATE_KEYS.test(key)) payload.fill(0, offset, offset + 8); return offset + 8; }
    if (type === 1) { if (FLV_PRIVATE_KEYS.test(key) && offset < payload.length) payload[offset] = 0; return offset + 1; }
    if (type === 2 || type === 12) { const text = readString(offset, type === 12); if (!text) return payload.length; if (FLV_PRIVATE_KEYS.test(key)) payload.fill(0x20, text.start, text.end); return text.next; }
    if (type === 3 || type === 8) {
      if (type === 8) offset += 4;
      while (offset + 3 <= payload.length) {
        const name = readString(offset); if (!name) return payload.length; offset = name.next;
        if (!name.value && payload[offset] === 9) return offset + 1;
        offset = value(offset, name.value, depth + 1);
      }
      return offset;
    }
    if (type === 10) { if (offset + 4 > payload.length) return payload.length; const count = view.getUint32(offset, false); offset += 4; for (let i = 0; i < count; i += 1) offset = value(offset, key, depth + 1); return offset; }
    if (type === 11) return offset + 10;
    if (type === 5 || type === 6) return offset;
    return payload.length;
  };
  value(0);
}

function cleanFlvBytes(source: Uint8Array): Uint8Array {
  const bytes = source.slice();
  if (ascii(bytes, 0, 3) !== 'FLV') throw new Error('The FLV signature is invalid.');
  const view = new DataView(bytes.buffer);
  let offset = view.getUint32(5, false) + 4;
  while (offset + 11 <= bytes.length) {
    const type = bytes[offset]!;
    const size = (bytes[offset + 1]! << 16) | (bytes[offset + 2]! << 8) | bytes[offset + 3]!;
    const start = offset + 11;
    if (start + size + 4 > bytes.length) break;
    if (type === 18) scrubAmfStrings(bytes.subarray(start, start + size));
    offset = start + size + 4;
  }
  return bytes;
}

async function cleanQpdf(file: File): Promise<MetadataWorkerCleanup> {
  const createModule = (await import('@neslinesli93/qpdf-wasm')).default;
  const qpdf = await createModule({ locateFile: () => qpdfWasmUrl });
  const mountPoint = '/source';
  qpdf.FS.mkdir(mountPoint);
  qpdf.FS.mount(qpdf.WORKERFS, { blobs: [{ name: 'input.pdf', data: file }] }, mountPoint);
  const input = `${mountPoint}/input.pdf`;
  const output = '/output.pdf';
  try {
    qpdf.callMain([input, '--remove-info', '--remove-metadata', '--linearize', output]);
    const bytes = qpdf.FS.readFile(output) as Uint8Array;
    return result(bytes, 'pdf', 'qpdf', ['Top-level PDF Info and XMP metadata were omitted during a full rewrite. Page content, forms, annotations, attachments, and embedded-file metadata were intentionally retained.']);
  } finally {
    try { qpdf.FS.unmount(mountPoint); } catch { /* virtual filesystem cleanup */ }
  }
}

async function clean(request: MetadataRemovalWorkerRequest): Promise<MetadataWorkerCleanup> {
  const { file, fileType } = request;
  if (['mp3', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wav', 'wma', 'mkv', 'webm'].includes(fileType)) return cleanTagLib(file, fileType);
  if (['docx', 'pptx', 'xlsx'].includes(fileType)) return cleanOoxml(file, fileType);
  if (fileType === 'avi') return result(cleanAviBytes(new Uint8Array(await file.arrayBuffer())), fileType, 'riff', ['Media chunks and indexes were retained byte-for-byte.']);
  if (fileType === 'flv') return result(cleanFlvBytes(new Uint8Array(await file.arrayBuffer())), fileType, 'flv-amf', ['Structural duration, codec, and keyframe values were retained.']);
  if (fileType === 'pdf') return cleanQpdf(file);
  throw new Error(`No container cleanup engine is available for ${fileType.toUpperCase()}.`);
}

self.onmessage = async (event: MessageEvent<MetadataRemovalWorkerRequest>) => {
  const request = event.data;
  try {
    send({ id: request.id, status: 'progress', stage: 'loading-engine' });
    send({ id: request.id, status: 'progress', stage: 'reading-container' });
    send({ id: request.id, status: 'progress', stage: 'rewriting-file' });
    const cleaned = await clean(request);
    send({ id: request.id, status: 'progress', stage: 'finalizing' });
    send({ id: request.id, status: 'success', result: cleaned }, [cleaned.data]);
  } catch (error) {
    send({ id: request.id, status: 'error', error: { message: error instanceof Error ? error.message : 'The metadata cleanup engine failed safely.' } });
  }
};

export {};
