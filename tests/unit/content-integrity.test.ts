import { describe, expect, it } from 'vitest';
import { hashBlob, verifyEncodedPayload } from '../../src/lib/metadata-removal/content-integrity';
import { verifyOfficeContent } from '../../src/lib/metadata-removal/ooxml-cleanup';
import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';

function box(type: string, value: string) {
  const data = Buffer.from(value);
  const head = Buffer.alloc(8); head.writeUInt32BE(data.length + 8); head.write(type, 4);
  return Buffer.concat([head, data]);
}

describe('content checks', () => {
  it('accepts metadata-only MP4 changes, but blocks changed encoded bytes with identical length', async () => {
    const file = (label: string, media: string) => new Blob([box('ftyp', 'isom'), box('free', label), box('mdat', media)]);
    expect(await verifyEncodedPayload(file('author', 'same'), file('', 'same'))).toMatchObject({ status: 'passed' });
    expect(await verifyEncodedPayload(file('author', 'same'), file('', 'fake'))).toMatchObject({ status: 'failed' });
  });

  it('does not certify formats without content verification', async () => {
    expect(await verifyEncodedPayload(new Blob(['%PDF-1.7']), new Blob(['%PDF-1.7']))).toMatchObject({ status: 'warning' });
  });

  it('checks Office content against source hashes, including missing and extra entries', async () => {
    const expected = new Map([['word/document.xml', await hashBlob(new Blob(['body']))]]);
    const make = async (parts: Record<string, string>) => {
      const writer = new ZipWriter(new BlobWriter(), { useWebWorkers: false });
      for (const [name, text] of Object.entries(parts)) await writer.add(name, new TextReader(text));
      return writer.close();
    };
    expect(await verifyOfficeContent(await make({ 'word/document.xml': 'body', 'docProps/core.xml': 'changed properties' }), expected)).toBe(true);
    expect(await verifyOfficeContent(await make({ 'word/document.xml': 'fake' }), expected)).toBe(false);
    expect(await verifyOfficeContent(await make({ 'word/extra.xml': 'body' }), expected)).toBe(false);
    expect(await verifyOfficeContent(await make({ 'word/document.xml': 'body', 'word/extra.xml': 'extra' }), expected)).toBe(false);
  });
});
