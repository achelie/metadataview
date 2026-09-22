import { describe, expect, it } from 'vitest';
import { BlobReader, BlobWriter, TextReader, TextWriter, ZipReader, ZipWriter } from '@zip.js/zip.js';
import { BoundedBlobWriter, cleanOoxml, OOXML_CLEANUP_LIMITS } from '../../src/lib/metadata-removal/ooxml-cleanup';
import { ooxmlFixture, ooxmlMime } from '../fixtures/ooxml';

async function zip(parts: Record<string, string>) {
  const writer = new ZipWriter(new BlobWriter(), { useWebWorkers: false });
  for (const [name, text] of Object.entries(parts)) await writer.add(name, new TextReader(text));
  return new File([await writer.close()], 'sample.docx', { type: ooxmlMime('docx') });
}

describe('bounded Office cleanup', () => {
  it('preserves document content while removing author properties', async () => {
    const file = new File([await ooxmlFixture('docx', { author: 'Private Author', bodyText: 'Keep this text' })], 'sample.docx', { type: '' });
    const cleaned = await cleanOoxml(file, 'docx');
    expect(cleaned.mime).toBe(ooxmlMime('docx'));
    const reader = new ZipReader(new BlobReader(new Blob([cleaned.data])), { useWebWorkers: false });
    try {
      const entries = await reader.getEntries();
      const read = async (name: string) => {
        const entry = entries.find((item) => item.filename === name)!;
        if (entry.directory) throw new Error('Expected file');
        return entry.getData(new TextWriter(), { useWebWorkers: false });
      };
      expect(await read('word/document.xml')).toContain('Keep this text');
      expect(await read('docProps/core.xml')).not.toContain('Private Author');
    } finally { await reader.close(); }
  });

  it('rejects oversized entries and cumulative expansion before rewriting', async () => {
    const file = await zip({ 'word/document.xml': 'a'.repeat(200), 'word/other.xml': 'b'.repeat(200) });
    await expect(cleanOoxml(file, 'docx', { ...OOXML_CLEANUP_LIMITS, entryBytes: 100 })).rejects.toThrow(/entry exceeds/);
    await expect(cleanOoxml(file, 'docx', { ...OOXML_CLEANUP_LIMITS, totalBytes: 300 })).rejects.toThrow(/total decompression/);
  });

  it('bounds actual property XML and compressed output', async () => {
    const file = await zip({ 'docProps/app.xml': '<Properties>' + 'a'.repeat(300) + '</Properties>' });
    await expect(cleanOoxml(file, 'docx', { ...OOXML_CLEANUP_LIMITS, propertyBytes: 100 })).rejects.toThrow(/safety limit/);
    await expect(cleanOoxml(file, 'docx', { ...OOXML_CLEANUP_LIMITS, outputBytes: 20 })).rejects.toThrow(/safety limit/);
  });

  it('rejects a ZIP whose directory understates the decompressed size', async () => {
    const source = await zip({ 'word/document.xml': 'a'.repeat(4096) });
    const data = await source.arrayBuffer();
    const view = new DataView(data);
    for (let offset = 0; offset + 46 <= data.byteLength; offset++) {
      if (view.getUint32(offset, true) === 0x02014b50) view.setUint32(offset + 24, 1, true);
    }
    const forged = new File([data], 'forged.docx', { type: source.type });
    await expect(cleanOoxml(forged, 'docx', { ...OOXML_CLEANUP_LIMITS, entryBytes: 256 })).rejects.toThrow(/safety limit/);
    await expect(cleanOoxml(forged, 'docx', { ...OOXML_CLEANUP_LIMITS, totalBytes: 256 })).rejects.toThrow(/total decompression/);
  });

  it('stops actual streamed bytes even without a trustworthy declared size', async () => {
    const output = new BoundedBlobWriter(10);
    await output.init?.();
    const writer = output.writable.getWriter();
    await writer.write(new Uint8Array(6));
    await expect(writer.write(new Uint8Array(5))).rejects.toThrow(/safety limit/);
    writer.releaseLock();
    let total = 0;
    const consume = (size: number) => { total += size; if (total > 10) throw new Error('total exceeded'); };
    const first = new BoundedBlobWriter(10, consume);
    const second = new BoundedBlobWriter(10, consume);
    await first.writeUint8Array(new Uint8Array(6));
    await expect(second.writeUint8Array(new Uint8Array(5))).rejects.toThrow('total exceeded');
  });
});
