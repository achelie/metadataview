export type VideoFixtureType = 'mp4' | 'm4v' | 'mov' | 'mkv' | 'webm' | 'avi' | 'flv' | '3gp' | '3g2';

const text = (value: string) => new TextEncoder().encode(value);

function concat(...parts: Uint8Array[]): Uint8Array {
  const output = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.length; }
  return output;
}

function uint32be(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, false);
  return bytes;
}

function uint32le(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, true);
  return bytes;
}

function box(type: string, payload: Uint8Array): Uint8Array {
  return concat(uint32be(payload.length + 8), text(type), payload);
}

export function isoVideoFixture(type: 'mp4' | 'm4v' | 'mov' | '3gp' | '3g2' = 'mp4'): Uint8Array {
  const brand = ({ mp4: 'isom', m4v: 'M4V ', mov: 'qt  ', '3gp': '3gp6', '3g2': '3g2a' } as const)[type];
  const compatible = type === 'mov' ? 'qt  ' : type === '3gp' ? '3gp6isom' : type === '3g2' ? '3g2aisom' : `${brand}isom`;
  const ftyp = box('ftyp', concat(text(brand), Uint8Array.from([0, 0, 2, 0]), text(compatible)));
  const movieHeader = new Uint8Array(100);
  const view = new DataView(movieHeader.buffer);
  view.setUint32(12, 1_000, false);
  view.setUint32(16, 2_000, false);
  view.setUint32(20, 0x00010000, false);
  view.setUint16(24, 0x0100, false);
  view.setUint32(36, 0x00010000, false);
  view.setUint32(52, 0x00010000, false);
  view.setUint32(68, 0x40000000, false);
  view.setUint32(96, 1, false);
  return concat(ftyp, box('moov', box('mvhd', movieHeader)));
}

function riffChunk(type: string, payload: Uint8Array): Uint8Array {
  const padding = payload.length % 2 ? Uint8Array.from([0]) : new Uint8Array();
  return concat(text(type), uint32le(payload.length), payload, padding);
}

export function aviFixture(): Uint8Array {
  const avih = new Uint8Array(56);
  const header = new DataView(avih.buffer);
  header.setUint32(0, 40_000, true);
  header.setUint32(4, 500_000, true);
  header.setUint32(16, 250, true);
  header.setUint32(24, 1, true);
  header.setUint32(32, 640, true);
  header.setUint32(36, 360, true);
  const strh = new Uint8Array(56);
  strh.set(text('vids'), 0);
  strh.set(text('H264'), 4);
  const hdrl = concat(text('hdrl'), riffChunk('avih', avih), riffChunk('strh', strh));
  const body = concat(text('AVI '), riffChunk('LIST', hdrl));
  return concat(text('RIFF'), uint32le(body.length), body);
}

function amfString(value: string): Uint8Array {
  const encoded = text(value);
  return concat(Uint8Array.from([2, encoded.length >> 8, encoded.length & 0xff]), encoded);
}

function amfNumber(value: number): Uint8Array {
  const bytes = new Uint8Array(9);
  const view = new DataView(bytes.buffer);
  bytes[0] = 0;
  view.setFloat64(1, value, false);
  return bytes;
}

function amfObject(values: Record<string, number | string>): Uint8Array {
  const entries: Uint8Array[] = [Uint8Array.from([8]), uint32be(Object.keys(values).length)];
  for (const [key, value] of Object.entries(values)) {
    const name = text(key);
    entries.push(Uint8Array.from([name.length >> 8, name.length & 0xff]), name, typeof value === 'number' ? amfNumber(value) : amfString(value));
  }
  entries.push(Uint8Array.from([0, 0, 9]));
  return concat(...entries);
}

export function flvFixture(): Uint8Array {
  const payload = concat(amfString('onMetaData'), amfObject({ duration: 12.5, width: 1280, height: 720, framerate: 25, videocodecid: 7, audiocodecid: 10, encoder: 'Fixture Encoder' }));
  const tagHeader = new Uint8Array(11);
  tagHeader[0] = 18;
  tagHeader[1] = (payload.length >> 16) & 0xff;
  tagHeader[2] = (payload.length >> 8) & 0xff;
  tagHeader[3] = payload.length & 0xff;
  const header = concat(text('FLV'), Uint8Array.from([1, 5]), uint32be(9));
  return concat(header, uint32be(0), tagHeader, payload, uint32be(11 + payload.length));
}

function ebmlSize(size: number): Uint8Array {
  if (size < 0x7f) return Uint8Array.from([0x80 | size]);
  if (size < 0x3fff) return Uint8Array.from([0x40 | (size >> 8), size & 0xff]);
  throw new Error('Fixture EBML element is too large.');
}

function ebml(id: number[], payload: Uint8Array): Uint8Array {
  return concat(Uint8Array.from(id), ebmlSize(payload.length), payload);
}

function ebmlUnsigned(value: number): Uint8Array {
  if (value <= 0xff) return Uint8Array.from([value]);
  if (value <= 0xffff) return Uint8Array.from([value >> 8, value & 0xff]);
  return uint32be(value);
}

function ebmlFloat(value: number): Uint8Array {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setFloat64(0, value, false);
  return bytes;
}

export function matroskaFixture(type: 'mkv' | 'webm'): Uint8Array {
  const docType = type === 'webm' ? 'webm' : 'matroska';
  const ebmlHeader = ebml([0x1a, 0x45, 0xdf, 0xa3], concat(
    ebml([0x42, 0x86], Uint8Array.from([1])),
    ebml([0x42, 0xf7], Uint8Array.from([1])),
    ebml([0x42, 0x82], text(docType)),
    ebml([0x42, 0x87], Uint8Array.from([4])),
  ));
  const info = ebml([0x15, 0x49, 0xa9, 0x66], concat(
    ebml([0x2a, 0xd7, 0xb1], ebmlUnsigned(1_000_000)),
    ebml([0x44, 0x89], ebmlFloat(12_500)),
    ebml([0x4d, 0x80], text('Fixture Muxer')),
    ebml([0x57, 0x41], text('Fixture Writer')),
  ));
  const video = ebml([0xe0], concat(ebml([0xb0], ebmlUnsigned(1280)), ebml([0xba], ebmlUnsigned(720))));
  const track = ebml([0xae], concat(ebml([0xd7], Uint8Array.from([1])), ebml([0x83], Uint8Array.from([1])), ebml([0x86], text(type === 'webm' ? 'V_VP9' : 'V_MPEG4/ISO/AVC')), video));
  const tracks = ebml([0x16, 0x54, 0xae, 0x6b], track);
  return concat(ebmlHeader, ebml([0x18, 0x53, 0x80, 0x67], concat(info, tracks)));
}

export function videoFixture(type: VideoFixtureType): Uint8Array {
  if (['mp4', 'm4v', 'mov', '3gp', '3g2'].includes(type)) return isoVideoFixture(type as 'mp4' | 'm4v' | 'mov' | '3gp' | '3g2');
  if (type === 'avi') return aviFixture();
  if (type === 'flv') return flvFixture();
  if (type === 'mkv' || type === 'webm') return matroskaFixture(type);
  throw new Error(`No fixture builder for ${type}.`);
}

export const videoMime = (type: VideoFixtureType): string => ({
  mp4: 'video/mp4', m4v: 'video/x-m4v', mov: 'video/quicktime', mkv: 'video/x-matroska', webm: 'video/webm', avi: 'video/x-msvideo', flv: 'video/x-flv', '3gp': 'video/3gpp', '3g2': 'video/3gpp2',
})[type];
