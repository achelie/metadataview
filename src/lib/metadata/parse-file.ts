import { detectFileType } from './detect-file-type';
import { MetadataError } from './errors';
import { audioAdapter } from './audio-adapter';
import { imageAdapter } from './image-adapter';
import { mp4Adapter } from './mp4-adapter';
import { ooxmlAdapter } from './ooxml-adapter';
import { pdfAdapter } from './pdf-adapter';
import type { DetectedFileType, MetadataAdapter, ParsedMetadata } from './types';

const adapters: MetadataAdapter[] = [imageAdapter, pdfAdapter, ooxmlAdapter, mp4Adapter, audioAdapter];

export async function parseFile(file: File, allowedTypes?: DetectedFileType[]): Promise<ParsedMetadata> {
  const detection = await detectFileType(file);
  if (allowedTypes && !allowedTypes.includes(detection.type)) throw new MetadataError('UNSUPPORTED_FILE_TYPE', `This tool does not support ${detection.type.toUpperCase()} files.`);
  const adapter = adapters.find((candidate) => candidate.supports(detection.type));
  if (!adapter) throw new MetadataError('UNSUPPORTED_FILE_TYPE', 'Supported formats are JPEG, PNG, WebP, PDF, DOCX, PPTX, XLSX, MP4, MP3, FLAC, OGG, OPUS, OGA, M4A, AAC, WAV, and WMA.');
  return adapter.parse({ file, fileType: detection.type, warnings: detection.warnings });
}

export function metadataExport(result: ParsedMetadata) {
  return { file: result.file, category: result.category, metadata: result.normalized, rawMetadata: result.raw, warnings: result.warnings };
}
