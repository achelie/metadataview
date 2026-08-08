export type AdditionalImageFixtureType = 'heic' | 'tiff' | 'gif';

const text = (value: string) => new TextEncoder().encode(value);

function concat(...parts: Uint8Array[]): Uint8Array {
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.length; }
  return output;
}

function u32be(value: number): Uint8Array {
  const output = new Uint8Array(4);
  new DataView(output.buffer).setUint32(0, value, false);
  return output;
}

function box(type: string, payload: Uint8Array): Uint8Array {
  return concat(u32be(payload.length + 8), text(type), payload);
}

export function heicFixture(width = 640, height = 480): Uint8Array {
  const ftyp = box('ftyp', concat(text('heic'), u32be(0), text('mif1'), text('heic')));
  const ispe = box('ispe', concat(u32be(0), u32be(width), u32be(height)));
  const ipco = box('ipco', ispe);
  const iprp = box('iprp', ipco);
  const meta = box('meta', concat(u32be(0), iprp));
  return concat(ftyp, meta);
}

export function tiffFixture(width = 320, height = 240): Uint8Array {
  const software = text('MetadataView TIFF fixture\0');
  const entryCount = 3;
  const ifdBytes = 2 + entryCount * 12 + 4;
  const output = new Uint8Array(8 + ifdBytes + software.length);
  const view = new DataView(output.buffer);
  output.set(text('II'), 0);
  view.setUint16(2, 42, true);
  view.setUint32(4, 8, true);
  view.setUint16(8, entryCount, true);
  const entry = (index: number, tag: number, type: number, count: number, value: number) => {
    const offset = 10 + index * 12;
    view.setUint16(offset, tag, true);
    view.setUint16(offset + 2, type, true);
    view.setUint32(offset + 4, count, true);
    if (type === 3 && count === 1) view.setUint16(offset + 8, value, true);
    else view.setUint32(offset + 8, value, true);
  };
  entry(0, 256, 4, 1, width);
  entry(1, 257, 4, 1, height);
  entry(2, 305, 2, software.length, 8 + ifdBytes);
  view.setUint32(10 + entryCount * 12, 0, true);
  output.set(software, 8 + ifdBytes);
  return output;
}

function gifImageBlock(): Uint8Array {
  return Uint8Array.from([0x2c, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 0x44, 0x01, 0]);
}

export function gifFixture(options: { comment?: string; animated?: boolean } = {}): Uint8Array {
  const header = concat(text('GIF89a'), Uint8Array.from([1, 0, 1, 0, 0x80, 0, 0]), Uint8Array.from([0, 0, 0, 255, 255, 255]));
  const extensions: Uint8Array[] = [];
  if (options.animated) extensions.push(concat(Uint8Array.from([0x21, 0xff, 0x0b]), text('NETSCAPE2.0'), Uint8Array.from([3, 1, 0, 0, 0])));
  if (options.comment) {
    const comment = text(options.comment).subarray(0, 255);
    extensions.push(concat(Uint8Array.from([0x21, 0xfe, comment.length]), comment, Uint8Array.from([0])));
  }
  return concat(header, ...extensions, gifImageBlock(), ...(options.animated ? [gifImageBlock()] : []), Uint8Array.from([0x3b]));
}

export function additionalImageFixture(type: AdditionalImageFixtureType): Uint8Array {
  if (type === 'heic') return heicFixture();
  if (type === 'tiff') return tiffFixture();
  return gifFixture({ comment: 'Fixture GIF comment' });
}

export const additionalImageMime = (type: AdditionalImageFixtureType): string => ({ heic: 'image/heic', tiff: 'image/tiff', gif: 'image/gif' })[type];
