import { createHash } from 'node:crypto';
import type { Page } from '@playwright/test';

/** A tiny real JPEG, with deliberately synthetic values unique to this regression. */
export async function analyticsPrivacyFixture(page: Page) {
  const plain = Buffer.from(await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 16; canvas.height = 12;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#ce784f'; context.fillRect(0, 0, 16, 12);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(value => value ? resolve(value) : reject(new Error('JPEG fixture failed')), 'image/jpeg', 0.9);
    });
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  }));
  const filename = 'viewexif-private-c7d493ab.jpg';
  const plainFilename = 'viewexif-no-gps-c7d493ab.jpg';
  const author = 'ViewExif Private Author c7d493ab';
  const latitude = 37 + 46 / 60 + 30.54321 / 3600;
  const longitude = -(122 + 25 / 60 + 10.98765 / 3600);
  const tiff = Buffer.alloc(256);
  tiff.write('II'); tiff.writeUInt16LE(42, 2); tiff.writeUInt32LE(8, 4);
  const gpsIfd = 38;
  let cursor = 92;
  const authorBytes = Buffer.from(`${author}\0`, 'ascii');
  const authorOffset = cursor;
  authorBytes.copy(tiff, cursor); cursor += authorBytes.length;
  const rationals = (values: Array<[number, number]>) => {
    const offset = cursor;
    for (const [numerator, denominator] of values) {
      tiff.writeUInt32LE(numerator, cursor); tiff.writeUInt32LE(denominator, cursor + 4); cursor += 8;
    }
    return offset;
  };
  const latOffset = rationals([[37, 1], [46, 1], [3054321, 100000]]);
  const lonOffset = rationals([[122, 1], [25, 1], [1098765, 100000]]);
  const entry = (offset: number, tag: number, type: number, count: number, value: number | string) => {
    tiff.writeUInt16LE(tag, offset); tiff.writeUInt16LE(type, offset + 2); tiff.writeUInt32LE(count, offset + 4);
    if (typeof value === 'string') tiff.write(value, offset + 8, 'ascii');
    else tiff.writeUInt32LE(value, offset + 8);
  };
  tiff.writeUInt16LE(2, 8);
  entry(10, 0x013b, 2, authorBytes.length, authorOffset);
  entry(22, 0x8825, 4, 1, gpsIfd);
  tiff.writeUInt32LE(0, 34);
  tiff.writeUInt16LE(4, gpsIfd);
  entry(40, 1, 2, 2, 'N\0'); entry(52, 2, 5, 3, latOffset);
  entry(64, 3, 2, 2, 'W\0'); entry(76, 4, 5, 3, lonOffset);
  tiff.writeUInt32LE(0, 88);
  const exif = Buffer.concat([Buffer.from('Exif\0\0', 'binary'), tiff.subarray(0, cursor)]);
  const length = Buffer.alloc(2); length.writeUInt16BE(exif.length + 2);
  const bytes = Buffer.concat([plain.subarray(0, 2), Buffer.from([0xff, 0xe1]), length, exif, plain.subarray(2)]);
  return { bytes, plain, filename, plainFilename, author, latitude, longitude, sha256: createHash('sha256').update(bytes).digest('hex') };
}
