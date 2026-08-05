import type { MetadataAdapter, ParsedMetadata } from './types';
import { makeFileSummary, recordToItems, toJsonSafe } from './utils';

export const mp3Adapter: MetadataAdapter = {
  supports: (type) => type === 'mp3',
  async parse({ file, fileType, warnings }): Promise<ParsedMetadata> {
    const { parseBlob } = await import('music-metadata');
    const metadata = await parseBlob(file, { duration: true });
    const common = toJsonSafe(metadata.common) as Record<string, unknown>;
    const format = toJsonSafe(metadata.format) as Record<string, unknown>;
    const normalized: Record<string, unknown> = {
      Title: common.title, Artist: common.artist, Album: common.album, AlbumArtist: common.albumartist,
      Year: common.year, Genre: common.genre, Track: common.track, Composer: common.composer, Comment: common.comment,
      Duration: format.duration, Bitrate: format.bitrate, SampleRate: format.sampleRate,
      HasEmbeddedCover: Array.isArray(metadata.common.picture) && metadata.common.picture.length > 0,
    };
    return {
      file: makeFileSummary(file, fileType), category: 'audio',
      sections: [
        { id: 'tags', title: 'Audio tags', items: recordToItems(normalized) },
        { id: 'format', title: 'Technical details', items: recordToItems(format) },
      ], normalized, raw: { common, format, native: toJsonSafe(metadata.native) as Record<string, unknown> }, warnings,
    };
  },
};
