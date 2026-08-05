import { detectFileType } from './detect-file-type';
import { MetadataError } from './errors';
import { imageAdapter } from './image-adapter';
import { mp3Adapter } from './mp3-adapter';
import { mp4Adapter } from './mp4-adapter';
import { pdfAdapter } from './pdf-adapter';
import type { MetadataAdapter, ParsedMetadata } from './types';

const adapters: MetadataAdapter[] = [imageAdapter, pdfAdapter, mp4Adapter, mp3Adapter];

export async function parseFile(file: File, allowedTypes?: string[]): Promise<ParsedMetadata> {
  const detection = await detectFileType(file);
  if (allowedTypes && !allowedTypes.includes(detection.type)) throw new MetadataError('UNSUPPORTED_FILE_TYPE', `This tool does not support ${detection.type.toUpperCase()} files.`);
  const adapter = adapters.find((candidate) => candidate.supports(detection.type));
  if (!adapter) throw new MetadataError('UNSUPPORTED_FILE_TYPE', 'Supported formats are JPEG, PNG, WebP, PDF, MP4, and MP3.');
  return adapter.parse({ file, fileType: detection.type, warnings: detection.warnings });
}

export function metadataExport(result: ParsedMetadata) {
  return { file: result.file, category: result.category, metadata: result.normalized, rawMetadata: result.raw, warnings: result.warnings };
}
