import { MetadataError } from './errors';
import type { MetadataAdapter, ParsedMetadata, SupportedVideoType } from './types';
import { makeFileSummary, recordToItems, toJsonSafe } from './utils';

const VIDEO_TYPES = new Set<SupportedVideoType>(['mp4', 'mov', 'mkv', 'webm', 'avi', 'flv', '3gp', '3g2']);
const ISO_TYPES = new Set<SupportedVideoType>(['mp4', 'mov', '3gp', '3g2']);
const QUICK_SCAN_BYTES = 8 * 1024 * 1024;
const MP4_CHUNK_BYTES = 4 * 1024 * 1024;

const VIDEO_MIMES: Record<SupportedVideoType, string> = {
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  webm: 'video/webm',
  avi: 'video/x-msvideo',
  flv: 'video/x-flv',
  '3gp': 'video/3gpp',
  '3g2': 'video/3gpp2',
};

const CONTAINER_LABELS: Record<SupportedVideoType, string> = {
  mp4: 'MP4', mov: 'QuickTime MOV', mkv: 'Matroska', webm: 'WebM', avi: 'AVI', flv: 'FLV', '3gp': '3GPP', '3g2': '3GPP2',
};

interface Mp4Info {
  duration?: number;
  timescale?: number;
  brands?: string[];
  tracks?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

interface VideoInspection {
  normalized: Record<string, unknown>;
  raw: Record<string, unknown>;
  warnings?: ParsedMetadata['warnings'];
}

function defined(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)));
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return new TextDecoder('latin1').decode(bytes.subarray(start, start + length)).replace(/\0+$/g, '');
}

function uint32le(bytes: Uint8Array, offset: number): number | undefined {
  if (offset < 0 || offset + 4 > bytes.length) return undefined;
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(offset, true);
}

function findFourCc(bytes: Uint8Array, value: string, start = 0): number {
  const target = [...value].map((character) => character.charCodeAt(0));
  for (let offset = start; offset + target.length <= bytes.length; offset += 1) {
    if (target.every((byte, index) => bytes[offset + index] === byte)) return offset;
  }
  return -1;
}

async function parseIsoBmff(file: File, type: SupportedVideoType): Promise<VideoInspection> {
  const MP4Box = await import('mp4box');
  const parser = MP4Box.createFile();
  let settled = false;
  let resolveReady: (info: Mp4Info) => void = () => undefined;
  let rejectReady: (error: Error) => void = () => undefined;
  const ready = new Promise<Mp4Info>((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
  parser.onReady = (result) => { settled = true; resolveReady(result as unknown as Mp4Info); };
  parser.onError = (message: string) => { settled = true; rejectReady(new MetadataError('CORRUPTED_FILE', `${CONTAINER_LABELS[type]} parser: ${message}`)); };

  const timer = setTimeout(() => {
    if (!settled) rejectReady(new MetadataError('PARSE_TIMEOUT', `${CONTAINER_LABELS[type]} parsing took longer than 15 seconds.`));
  }, 15_000);
  try {
    for (let offset = 0; offset < file.size && !settled; offset += MP4_CHUNK_BYTES) {
      const buffer = await file.slice(offset, Math.min(file.size, offset + MP4_CHUNK_BYTES)).arrayBuffer() as ArrayBuffer & { fileStart: number };
      buffer.fileStart = offset;
      parser.appendBuffer(buffer);
    }
    if (!settled) parser.flush();
    const info = await ready;
    const tracks = Array.isArray(info.tracks) ? info.tracks : [];
    const videoTrack = tracks.find((track) => track.type === 'video' || track.video);
    const audioTrack = tracks.find((track) => track.type === 'audio' || track.audio);
    const video = videoTrack?.video as Record<string, unknown> | undefined;
    const trackDuration = Number(videoTrack?.duration);
    const trackTimescale = Number(videoTrack?.timescale);
    const trackSamples = Number(videoTrack?.nb_samples);
    const frameRate = Number.isFinite(trackSamples) && Number.isFinite(trackDuration) && Number.isFinite(trackTimescale) && trackDuration > 0
      ? trackSamples / (trackDuration / trackTimescale) : undefined;
    const normalized = defined({
      Container: CONTAINER_LABELS[type],
      MajorBrand: info.major_brand,
      CompatibleBrands: info.brands,
      Duration: info.duration && info.timescale ? info.duration / info.timescale : info.duration,
      Width: videoTrack?.track_width ?? video?.width,
      Height: videoTrack?.track_height ?? video?.height,
      Codec: videoTrack?.codec,
      VideoCodec: videoTrack?.codec,
      AudioCodec: audioTrack?.codec,
      FrameRate: frameRate,
      Bitrate: videoTrack?.bitrate,
      TrackCount: tracks.length,
      CreationTime: info.created,
      ModificationTime: info.modified,
      Title: info.title,
      Author: info.artist ?? info.author,
      Software: info.tool,
      Tracks: tracks.map((track) => defined({ id: track.id, type: track.type, codec: track.codec, duration: track.duration, timescale: track.timescale, bitrate: track.bitrate, language: track.language })),
    });
    return { normalized, raw: toJsonSafe(info) as Record<string, unknown> };
  } finally {
    clearTimeout(timer);
  }
}

function parseAvi(bytes: Uint8Array): VideoInspection {
  const avih = findFourCc(bytes, 'avih');
  const header = avih >= 0 ? avih + 8 : -1;
  const microsecondsPerFrame = header >= 0 ? uint32le(bytes, header) : undefined;
  const maxBytesPerSecond = header >= 0 ? uint32le(bytes, header + 4) : undefined;
  const totalFrames = header >= 0 ? uint32le(bytes, header + 16) : undefined;
  const trackCount = header >= 0 ? uint32le(bytes, header + 24) : undefined;
  const width = header >= 0 ? uint32le(bytes, header + 32) : undefined;
  const height = header >= 0 ? uint32le(bytes, header + 36) : undefined;
  const tracks: Array<Record<string, unknown>> = [];
  let cursor = 0;
  while (tracks.length < 64) {
    const strh = findFourCc(bytes, 'strh', cursor);
    if (strh < 0 || strh + 16 > bytes.length) break;
    const data = strh + 8;
    const kind = ascii(bytes, data, 4);
    tracks.push(defined({ type: kind === 'vids' ? 'video' : kind === 'auds' ? 'audio' : kind, codec: ascii(bytes, data + 4, 4) }));
    cursor = data + 8;
  }
  const videoTrack = tracks.find((track) => track.type === 'video');
  const normalized = defined({
    Container: 'AVI', Duration: microsecondsPerFrame && totalFrames ? microsecondsPerFrame * totalFrames / 1_000_000 : undefined,
    Width: width, Height: height, Codec: videoTrack?.codec, VideoCodec: videoTrack?.codec,
    FrameRate: microsecondsPerFrame ? 1_000_000 / microsecondsPerFrame : undefined,
    Bitrate: maxBytesPerSecond ? maxBytesPerSecond * 8 : undefined, TrackCount: trackCount ?? tracks.length, Tracks: tracks,
  });
  return { normalized, raw: { riffType: 'AVI ', mainHeader: defined({ microsecondsPerFrame, maxBytesPerSecond, totalFrames, trackCount, width, height }), tracks } };
}

interface AmfResult { value: unknown; next: number }

function parseAmfValue(bytes: Uint8Array, offset: number, depth = 0): AmfResult | undefined {
  if (offset >= bytes.length || depth > 5) return undefined;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const type = bytes[offset]!;
  if (type === 0 && offset + 9 <= bytes.length) return { value: view.getFloat64(offset + 1, false), next: offset + 9 };
  if (type === 1 && offset + 2 <= bytes.length) return { value: bytes[offset + 1] !== 0, next: offset + 2 };
  if (type === 2 && offset + 3 <= bytes.length) {
    const length = view.getUint16(offset + 1, false);
    if (offset + 3 + length > bytes.length) return undefined;
    return { value: new TextDecoder().decode(bytes.subarray(offset + 3, offset + 3 + length)), next: offset + 3 + length };
  }
  if (type === 5 || type === 6) return { value: null, next: offset + 1 };
  if (type === 11 && offset + 11 <= bytes.length) return { value: new Date(view.getFloat64(offset + 1, false)).toISOString(), next: offset + 11 };
  if (type === 10 && offset + 5 <= bytes.length) {
    const count = Math.min(view.getUint32(offset + 1, false), 1_000);
    const values: unknown[] = [];
    let next = offset + 5;
    for (let index = 0; index < count; index += 1) { const item = parseAmfValue(bytes, next, depth + 1); if (!item) break; values.push(item.value); next = item.next; }
    return { value: values, next };
  }
  if (type === 3 || type === 8) {
    let next = offset + (type === 8 ? 5 : 1);
    const value: Record<string, unknown> = {};
    for (let count = 0; count < 1_000 && next + 3 <= bytes.length; count += 1) {
      if (bytes[next] === 0 && bytes[next + 1] === 0 && bytes[next + 2] === 9) return { value, next: next + 3 };
      const length = view.getUint16(next, false);
      next += 2;
      if (next + length > bytes.length) break;
      const key = new TextDecoder().decode(bytes.subarray(next, next + length));
      next += length;
      const item = parseAmfValue(bytes, next, depth + 1);
      if (!item) break;
      value[key.slice(0, 128)] = item.value;
      next = item.next;
    }
    return { value, next };
  }
  return undefined;
}

function uint24be(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] ?? 0) << 16) | ((bytes[offset + 1] ?? 0) << 8) | (bytes[offset + 2] ?? 0);
}

function parseFlv(bytes: Uint8Array): VideoInspection {
  const headerSize = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(5, false);
  const flags = bytes[4] ?? 0;
  let metadata: Record<string, unknown> = {};
  let offset = headerSize + 4;
  for (let count = 0; count < 2_000 && offset + 11 <= bytes.length; count += 1) {
    const type = bytes[offset]!;
    const size = uint24be(bytes, offset + 1);
    const start = offset + 11;
    const end = start + size;
    if (end > bytes.length) break;
    if (type === 18) {
      const name = parseAmfValue(bytes.subarray(start, end), 0);
      const details = name ? parseAmfValue(bytes.subarray(start, end), name.next) : undefined;
      if (details?.value && typeof details.value === 'object' && !Array.isArray(details.value)) metadata = details.value as Record<string, unknown>;
      break;
    }
    offset = end + 4;
  }
  const normalized = defined({
    Container: 'FLV', Version: bytes[3], HasAudio: (flags & 0x04) !== 0, HasVideo: (flags & 0x01) !== 0,
    Duration: metadata.duration, Width: metadata.width, Height: metadata.height, Codec: metadata.videocodecid,
    VideoCodec: metadata.videocodecid, AudioCodec: metadata.audiocodecid, FrameRate: metadata.framerate,
    Bitrate: typeof metadata.videodatarate === 'number' ? metadata.videodatarate * 1_000 : undefined,
    AudioSampleRate: metadata.audiosamplerate, Stereo: metadata.stereo, Encoder: metadata.encoder, CreationDate: metadata.creationdate,
  });
  return { normalized, raw: { header: { version: bytes[3], hasAudio: (flags & 0x04) !== 0, hasVideo: (flags & 0x01) !== 0, headerSize }, onMetaData: toJsonSafe(metadata) } };
}

interface Vint { value: number; length: number; unknown?: boolean }

function ebmlVint(bytes: Uint8Array, offset: number, keepMarker: boolean): Vint | undefined {
  const first = bytes[offset];
  if (first === undefined || first === 0) return undefined;
  let length = 1;
  let mask = 0x80;
  while (length <= 8 && (first & mask) === 0) { length += 1; mask >>= 1; }
  if (length > 8 || offset + length > bytes.length) return undefined;
  let value = keepMarker ? first : first & (mask - 1);
  let allOnes = !keepMarker && (first & (mask - 1)) === mask - 1;
  for (let index = 1; index < length; index += 1) { value = value * 256 + bytes[offset + index]!; allOnes = allOnes && bytes[offset + index] === 0xff; }
  return { value, length, unknown: allOnes };
}

function ebmlNumber(bytes: Uint8Array, start: number, size: number): number | undefined {
  if (size < 1 || size > 8 || start + size > bytes.length) return undefined;
  let value = 0;
  for (let index = 0; index < size; index += 1) value = value * 256 + bytes[start + index]!;
  return Number.isSafeInteger(value) ? value : undefined;
}

function ebmlFloat(bytes: Uint8Array, start: number, size: number): number | undefined {
  if (![4, 8].includes(size) || start + size > bytes.length) return undefined;
  const view = new DataView(bytes.buffer, bytes.byteOffset + start, size);
  return size === 4 ? view.getFloat32(0, false) : view.getFloat64(0, false);
}

const EBML_MASTERS = new Set([0x1a45dfa3, 0x18538067, 0x1549a966, 0x1654ae6b, 0xae, 0xe0, 0xe1]);

function parseMatroska(bytes: Uint8Array, type: 'mkv' | 'webm'): VideoInspection {
  const state: { timecodeScale: number; durationUnits?: number; muxingApp?: string; writingApp?: string; tracks: Array<Record<string, unknown>>; elements: number } = { timecodeScale: 1_000_000, tracks: [], elements: 0 };
  const walk = (start: number, end: number, depth: number, track?: Record<string, unknown>) => {
    if (depth > 8) return;
    let offset = start;
    while (offset < end && state.elements < 20_000) {
      const id = ebmlVint(bytes, offset, true);
      if (!id) break;
      const size = ebmlVint(bytes, offset + id.length, false);
      if (!size) break;
      const dataStart = offset + id.length + size.length;
      const declaredEnd = size.unknown ? end : dataStart + size.value;
      if (dataStart > end) break;
      const dataEnd = Math.min(end, declaredEnd, bytes.length);
      state.elements += 1;
      let activeTrack = track;
      if (id.value === 0xae) { activeTrack = {}; state.tracks.push(activeTrack); }
      if (EBML_MASTERS.has(id.value)) walk(dataStart, dataEnd, depth + 1, activeTrack);
      else {
        const length = dataEnd - dataStart;
        if (id.value === 0x4282) (state as Record<string, unknown>).docType = ascii(bytes, dataStart, length);
        if (id.value === 0x2ad7b1) state.timecodeScale = ebmlNumber(bytes, dataStart, length) ?? state.timecodeScale;
        if (id.value === 0x4489) state.durationUnits = ebmlFloat(bytes, dataStart, length);
        if (id.value === 0x4d80) state.muxingApp = new TextDecoder().decode(bytes.subarray(dataStart, dataEnd));
        if (id.value === 0x5741) state.writingApp = new TextDecoder().decode(bytes.subarray(dataStart, dataEnd));
        if (activeTrack) {
          if (id.value === 0xd7) activeTrack.number = ebmlNumber(bytes, dataStart, length);
          if (id.value === 0x83) activeTrack.type = ({ 1: 'video', 2: 'audio', 17: 'subtitle' } as Record<number, string>)[ebmlNumber(bytes, dataStart, length) ?? 0] ?? ebmlNumber(bytes, dataStart, length);
          if (id.value === 0x86) activeTrack.codec = new TextDecoder().decode(bytes.subarray(dataStart, dataEnd));
          if (id.value === 0x536e) activeTrack.name = new TextDecoder().decode(bytes.subarray(dataStart, dataEnd));
          if (id.value === 0x22b59c) activeTrack.language = new TextDecoder().decode(bytes.subarray(dataStart, dataEnd));
          if (id.value === 0xb0) activeTrack.width = ebmlNumber(bytes, dataStart, length);
          if (id.value === 0xba) activeTrack.height = ebmlNumber(bytes, dataStart, length);
          if (id.value === 0xb5) activeTrack.sampleRate = ebmlFloat(bytes, dataStart, length);
          if (id.value === 0x9f) activeTrack.channels = ebmlNumber(bytes, dataStart, length);
        }
      }
      if (size.unknown) break;
      if (declaredEnd <= offset) break;
      offset = declaredEnd;
    }
  };
  walk(0, bytes.length, 0);
  const videoTrack = state.tracks.find((track) => track.type === 'video');
  const audioTrack = state.tracks.find((track) => track.type === 'audio');
  const normalized = defined({
    Container: CONTAINER_LABELS[type], EBMLDocType: (state as Record<string, unknown>).docType,
    Duration: state.durationUnits === undefined ? undefined : state.durationUnits * state.timecodeScale / 1_000_000_000,
    Width: videoTrack?.width, Height: videoTrack?.height, Codec: videoTrack?.codec, VideoCodec: videoTrack?.codec,
    AudioCodec: audioTrack?.codec, TrackCount: state.tracks.length, MuxingApplication: state.muxingApp, WritingApplication: state.writingApp,
    Tracks: state.tracks.map(defined),
  });
  return { normalized, raw: { ebml: { docType: (state as Record<string, unknown>).docType, timecodeScale: state.timecodeScale, parsedElements: state.elements }, muxingApp: state.muxingApp, writingApp: state.writingApp, tracks: state.tracks } };
}

async function parseBoundedContainer(file: File, type: SupportedVideoType): Promise<VideoInspection> {
  const bytes = new Uint8Array(await file.slice(0, Math.min(file.size, QUICK_SCAN_BYTES)).arrayBuffer());
  if (type === 'avi') return parseAvi(bytes);
  if (type === 'flv') return parseFlv(bytes);
  if (type === 'mkv' || type === 'webm') return parseMatroska(bytes, type);
  throw new MetadataError('UNSUPPORTED_FILE_TYPE', `No video adapter is registered for ${type.toUpperCase()}.`);
}

export const videoAdapter: MetadataAdapter = {
  supports: (type) => VIDEO_TYPES.has(type as SupportedVideoType),
  async parse({ file, fileType, warnings }): Promise<ParsedMetadata> {
    try {
      const type = fileType as SupportedVideoType;
      const inspection = ISO_TYPES.has(type) ? await parseIsoBmff(file, type) : await parseBoundedContainer(file, type);
      const normalized = defined(inspection.normalized);
      const fileSummary = makeFileSummary(file, fileType);
      fileSummary.mime = VIDEO_MIMES[type];
      return {
        file: fileSummary,
        category: 'video',
        sections: [
          { id: 'container', title: 'Container & timeline', items: recordToItems(defined({ Container: normalized.Container, MajorBrand: normalized.MajorBrand, CompatibleBrands: normalized.CompatibleBrands, Duration: normalized.Duration, CreationTime: normalized.CreationTime, ModificationTime: normalized.ModificationTime, MuxingApplication: normalized.MuxingApplication, WritingApplication: normalized.WritingApplication })) },
          { id: 'video-encoding', title: 'Video encoding', items: recordToItems(defined({ Width: normalized.Width, Height: normalized.Height, Codec: normalized.VideoCodec ?? normalized.Codec, FrameRate: normalized.FrameRate, Bitrate: normalized.Bitrate })) },
          { id: 'audio-encoding', title: 'Audio track', items: recordToItems(defined({ Codec: normalized.AudioCodec, SampleRate: normalized.AudioSampleRate, Stereo: normalized.Stereo })) },
          { id: 'tracks', title: 'Tracks', items: recordToItems(defined({ TrackCount: normalized.TrackCount, Tracks: normalized.Tracks })) },
          { id: 'authorship', title: 'Authorship & software', items: recordToItems(defined({ Title: normalized.Title, Author: normalized.Author, Software: normalized.Software, Encoder: normalized.Encoder, CreationDate: normalized.CreationDate })) },
        ].filter((section) => section.items.length > 0),
        normalized,
        raw: inspection.raw,
        warnings: [...warnings, ...(inspection.warnings ?? [])],
      };
    } catch (error) {
      if (error instanceof MetadataError) throw error;
      const detail = error instanceof Error ? error.message : 'The video container could not be parsed.';
      throw new MetadataError('CORRUPTED_FILE', `${fileType.toUpperCase()} parser: ${detail}`, { cause: error instanceof Error ? error : undefined });
    }
  },
};
