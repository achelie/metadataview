import { MetadataError } from './errors';
import type { MetadataAdapter, ParsedMetadata } from './types';
import { makeFileSummary, recordToItems, toJsonSafe } from './utils';

interface Mp4Info {
  duration?: number;
  timescale?: number;
  brands?: string[];
  tracks?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export const mp4Adapter: MetadataAdapter = {
  supports: (type) => type === 'mp4',
  async parse({ file, fileType, warnings }): Promise<ParsedMetadata> {
    const MP4Box = await import('mp4box');
    const buffer = await file.arrayBuffer() as ArrayBuffer & { fileStart: number };
    buffer.fileStart = 0;
    const info = await new Promise<Mp4Info>((resolve, reject) => {
      const parser = MP4Box.createFile();
      const timer = setTimeout(() => reject(new MetadataError('PARSE_TIMEOUT', 'MP4 parsing took longer than 15 seconds.')), 15_000);
      parser.onError = (message: string) => { clearTimeout(timer); reject(new MetadataError('CORRUPTED_FILE', `MP4 parser: ${message}`)); };
      parser.onReady = (result) => { clearTimeout(timer); resolve(result as unknown as Mp4Info); };
      parser.appendBuffer(buffer);
      parser.flush();
    });
    const tracks = Array.isArray(info.tracks) ? info.tracks : [];
    const videoTrack = tracks.find((track) => track.video);
    const normalized: Record<string, unknown> = {
      Duration: info.duration && info.timescale ? info.duration / info.timescale : info.duration,
      Width: videoTrack?.track_width ?? (videoTrack?.video as Record<string, unknown> | undefined)?.width,
      Height: videoTrack?.track_height ?? (videoTrack?.video as Record<string, unknown> | undefined)?.height,
      Codec: videoTrack?.codec,
      CreationTime: info.created,
      ModificationTime: info.modified,
      CompatibleBrands: info.brands,
      Tracks: tracks.map((track) => ({ id: track.id, type: track.type, codec: track.codec, duration: track.duration, language: track.language })),
      Title: info.title, Author: info.artist ?? info.author, Software: info.tool,
    };
    return {
      file: makeFileSummary(file, fileType), category: 'video',
      sections: [
        { id: 'container', title: 'Container & video', items: recordToItems(Object.fromEntries(Object.entries(normalized).filter(([key]) => key !== 'Tracks'))) },
        { id: 'tracks', title: 'Tracks', items: recordToItems({ Tracks: normalized.Tracks }) },
      ], normalized, raw: toJsonSafe(info) as Record<string, unknown>, warnings,
    };
  },
};
