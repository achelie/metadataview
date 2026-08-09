import { MetadataError } from './errors';
import type { MetadataAdapter, ParsedMetadata, SupportedAudioType } from './types';
import { makeFileSummary, recordToItems, toJsonSafe } from './utils';

const AUDIO_TYPES = new Set<SupportedAudioType>(['mp3', 'flac', 'ogg', 'opus', 'm4a', 'aac', 'wav', 'wma']);

const AUDIO_MIMES: Record<SupportedAudioType, string> = {
  mp3: 'audio/mpeg',
  flac: 'audio/flac',
  ogg: 'audio/ogg',
  opus: 'audio/opus',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  wav: 'audio/wav',
  wma: 'audio/x-ms-wma',
};

function defined(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)));
}

function pictureSummaries(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const picture = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    const data = picture.data;
    const bytes = data && ArrayBuffer.isView(data) ? data.byteLength : data instanceof ArrayBuffer ? data.byteLength : undefined;
    return defined({ format: picture.format, type: picture.type, description: picture.description, name: picture.name, bytes });
  });
}

export const audioAdapter: MetadataAdapter = {
  supports: (type) => AUDIO_TYPES.has(type as SupportedAudioType),
  async parse({ file, fileType, warnings }): Promise<ParsedMetadata> {
    try {
      const { parseBlob } = await import('music-metadata');
      const metadata = await parseBlob(file, { duration: true });
      const rawCommon = metadata.common as unknown as Record<string, unknown>;
      const artwork = pictureSummaries(rawCommon.picture);
      const common = toJsonSafe({ ...rawCommon, picture: artwork }) as Record<string, unknown>;
      const format = toJsonSafe(metadata.format) as Record<string, unknown>;
      const native = toJsonSafe(metadata.native) as Record<string, unknown>;
      const normalized = defined({
        Title: common.title,
        Artist: common.artist,
        Artists: common.artists,
        Album: common.album,
        AlbumArtist: common.albumartist,
        Track: common.track,
        Disc: common.disk,
        Date: common.date,
        Year: common.year,
        Genre: common.genre,
        Composer: common.composer,
        Conductor: common.conductor,
        Lyricist: common.lyricist,
        Label: common.label,
        Publisher: common.publisher,
        ISRC: common.isrc,
        Barcode: common.barcode,
        Copyright: common.copyright,
        Comment: common.comment,
        Rating: common.rating,
        Container: format.container,
        Codec: format.codec,
        CodecProfile: format.codecProfile,
        Lossless: format.lossless,
        Duration: format.duration,
        Bitrate: format.bitrate,
        SampleRate: format.sampleRate,
        BitsPerSample: format.bitsPerSample,
        Channels: format.numberOfChannels,
        NumberOfSamples: format.numberOfSamples,
        TagTypes: format.tagTypes,
        HasEmbeddedCover: artwork.length > 0,
        EmbeddedArtwork: artwork,
      });
      const fileSummary = makeFileSummary(file, fileType);
      if (fileType !== 'unknown') fileSummary.mime = AUDIO_MIMES[fileType as SupportedAudioType] ?? fileSummary.mime;
      const parserWarnings = (metadata.quality?.warnings ?? []).map((warning) => ({
        code: 'AUDIO_PARSER_WARNING',
        message: typeof warning === 'string' ? warning : String((warning as { message?: unknown }).message ?? warning),
      }));
      return {
        file: fileSummary,
        category: 'audio',
        sections: [
          { id: 'identity', title: 'Track & people', items: recordToItems(defined({ Title: normalized.Title, Artist: normalized.Artist, Artists: normalized.Artists, Composer: normalized.Composer, Conductor: normalized.Conductor, Lyricist: normalized.Lyricist })) },
          { id: 'release', title: 'Release & rights', items: recordToItems(defined({ Album: normalized.Album, AlbumArtist: normalized.AlbumArtist, Track: normalized.Track, Disc: normalized.Disc, Date: normalized.Date, Year: normalized.Year, Genre: normalized.Genre, Label: normalized.Label, Publisher: normalized.Publisher, ISRC: normalized.ISRC, Barcode: normalized.Barcode, Copyright: normalized.Copyright, Comment: normalized.Comment, Rating: normalized.Rating })) },
          { id: 'encoding', title: 'Audio encoding', items: recordToItems(defined({ Container: normalized.Container, Codec: normalized.Codec, CodecProfile: normalized.CodecProfile, Lossless: normalized.Lossless, Duration: normalized.Duration, Bitrate: normalized.Bitrate, SampleRate: normalized.SampleRate, BitsPerSample: normalized.BitsPerSample, Channels: normalized.Channels, NumberOfSamples: normalized.NumberOfSamples, TagTypes: normalized.TagTypes })) },
          { id: 'artwork', title: 'Embedded artwork', items: recordToItems(defined({ HasEmbeddedCover: normalized.HasEmbeddedCover, Artwork: artwork })) },
        ].filter((section) => section.items.length > 0),
        normalized,
        raw: { common, format, native },
        warnings: [...warnings, ...parserWarnings],
      };
    } catch (error) {
      if (error instanceof MetadataError) throw error;
      const detail = error instanceof Error ? error.message : 'The audio container could not be parsed.';
      throw new MetadataError('CORRUPTED_FILE', `${fileType.toUpperCase()} parser: ${detail}`, { cause: error instanceof Error ? error : undefined });
    }
  },
};
