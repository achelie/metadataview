function bytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const output = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.length; }
  return output;
}

export function wavFixture(): Uint8Array<ArrayBuffer> {
  const output = new Uint8Array(46);
  const view = new DataView(output.buffer);
  output.set(bytes('RIFF'), 0); view.setUint32(4, 38, true); output.set(bytes('WAVE'), 8);
  output.set(bytes('fmt '), 12); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, 8_000, true); view.setUint32(28, 16_000, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  output.set(bytes('data'), 36); view.setUint32(40, 2, true); view.setInt16(44, 0, true);
  return output;
}

export function flacFixture(): Uint8Array<ArrayBuffer> {
  const streamInfo = new Uint8Array(34);
  const view = new DataView(streamInfo.buffer);
  view.setUint16(0, 16, false); view.setUint16(2, 16, false);
  const packed = (44_100n << 44n) | (1n << 41n) | (15n << 36n) | 44_100n;
  for (let index = 0; index < 8; index += 1) streamInfo[10 + index] = Number((packed >> BigInt((7 - index) * 8)) & 0xffn);
  return concat(bytes('fLaC'), Uint8Array.from([0x80, 0x00, 0x00, 0x22]), streamInfo) as Uint8Array<ArrayBuffer>;
}

function oggPage(payload: Uint8Array, granulePosition: bigint): Uint8Array<ArrayBuffer> {
  const output = new Uint8Array(28 + payload.length);
  const view = new DataView(output.buffer);
  output.set(bytes('OggS'), 0); output[4] = 0; output[5] = 0x06;
  view.setBigInt64(6, granulePosition, true); view.setUint32(14, 1, true); view.setUint32(18, 0, true);
  output[26] = 1; output[27] = payload.length; output.set(payload, 28);
  return output;
}

export function oggFixture(): Uint8Array<ArrayBuffer> {
  const payload = new Uint8Array(30);
  const view = new DataView(payload.buffer);
  payload[0] = 1; payload.set(bytes('vorbis'), 1); view.setUint32(7, 0, true); payload[11] = 2;
  view.setUint32(12, 44_100, true); view.setUint32(20, 128_000, true); payload[28] = 0xb8; payload[29] = 1;
  return oggPage(payload, 44_100n);
}

export function opusFixture(): Uint8Array<ArrayBuffer> {
  const payload = new Uint8Array(19);
  const view = new DataView(payload.buffer);
  payload.set(bytes('OpusHead'), 0); payload[8] = 1; payload[9] = 2;
  view.setUint16(10, 312, true); view.setUint32(12, 48_000, true); view.setInt16(16, 0, true); payload[18] = 0;
  return oggPage(payload, 48_312n);
}

export function aacFixture(): Uint8Array<ArrayBuffer> {
  const frameLength = 107;
  const output = new Uint8Array(frameLength);
  output.set([0xff, 0xf1, 0x50, 0x80 | ((frameLength >> 11) & 0x03), (frameLength >> 3) & 0xff, ((frameLength & 0x07) << 5) | 0x1f, 0xfc]);
  return output;
}

export function m4aFixture(): Uint8Array<ArrayBuffer> {
  const output = new Uint8Array(24);
  const view = new DataView(output.buffer);
  view.setUint32(0, 24, false); output.set(bytes('ftypM4A '), 4); view.setUint32(12, 0, false); output.set(bytes('isomM4A '), 16);
  return output;
}

function guid(value: string): Uint8Array {
  const [a, b, c, d, e] = value.split('-');
  const output = new Uint8Array(16);
  const view = new DataView(output.buffer);
  view.setUint32(0, Number.parseInt(a!, 16), true); view.setUint16(4, Number.parseInt(b!, 16), true); view.setUint16(6, Number.parseInt(c!, 16), true);
  output.set(Uint8Array.from(Buffer.from(`${d}${e}`, 'hex')), 8);
  return output;
}

export function wmaFixture(): Uint8Array<ArrayBuffer> {
  const output = new Uint8Array(54);
  const view = new DataView(output.buffer);
  output.set(guid('75B22630-668E-11CF-A6D9-00AA0062CE6C'), 0); view.setBigUint64(16, 54n, true); view.setUint32(24, 1, true); output[28] = 1; output[29] = 2;
  output.set(guid('1806D474-CADF-4509-A4BA-9AABCB96AAE8'), 30); view.setBigUint64(46, 24n, true);
  return output;
}
