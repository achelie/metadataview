import { deflate } from 'pako';

const encoder = new TextEncoder();
const signature = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export function concat(...arrays: Uint8Array<ArrayBufferLike>[]): Uint8Array {
  const output = new Uint8Array(arrays.reduce((sum, value) => sum + value.length, 0));
  let offset = 0;
  for (const value of arrays) { output.set(value, offset); offset += value.length; }
  return output;
}

function u32(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, false);
  return bytes;
}

export function chunk(type: string, data: Uint8Array<ArrayBufferLike> = new Uint8Array()): Uint8Array {
  return concat(u32(data.length), encoder.encode(type), data, new Uint8Array(4));
}

export function baseChunks(extra: Uint8Array<ArrayBufferLike>[], colorType = 6): Uint8Array {
  const ihdr = new Uint8Array(13);
  new DataView(ihdr.buffer).setUint32(0, 1, false);
  new DataView(ihdr.buffer).setUint32(4, 1, false);
  ihdr.set([8, colorType, 0, 0, 0], 8);
  return concat(signature, chunk('IHDR', ihdr), ...extra, chunk('IEND'));
}

export function pngWithText(type: 'tEXt' | 'iTXt' | 'zTXt', keyword: string, text: string): Uint8Array {
  let data: Uint8Array;
  if (type === 'tEXt') data = concat(encoder.encode(keyword), Uint8Array.of(0), encoder.encode(text));
  else if (type === 'zTXt') data = concat(encoder.encode(keyword), Uint8Array.of(0, 0), deflate(encoder.encode(text)));
  else data = concat(encoder.encode(keyword), Uint8Array.of(0, 0, 0, 0, 0), encoder.encode(text));
  return baseChunks([chunk(type, data)]);
}

export function tinyPng(): Uint8Array { return baseChunks([]); }
