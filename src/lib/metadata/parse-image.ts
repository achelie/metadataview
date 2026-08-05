import { detectFileType } from './detect-file-type';
import { MetadataError } from './errors';
import { readExifMetadata } from './exif-reader';
import { readImageDimensions } from './image-info';
import { parseJpegContainer } from './jpeg-container';
import { IMAGE_LIMITS } from './limits';
import { normalizeImageMetadataDetailed } from './normalize-image-metadata';
import { displayDimensions, orientationNumber } from './orientation';
import { parsePngChunks, type ParsedPngChunks } from './png-chunks';
import { toSafeValue } from './safe-value';
import type { ImageContainerDetails, NormalizedImageMetadata, ParseWarning, SupportedImageType } from './types';
import { makeFileSummary } from './utils';
import { parseWebpContainer } from './webp-container';

function gcd(left: number, right: number): number { while (right) [left, right] = [right, left % right]; return left || 1; }
function aspect(width: number, height: number): string { const divisor = gcd(width, height); return `${width / divisor}:${height / divisor}`; }

async function decodedDimensions(file: File): Promise<{ width: number; height: number } | undefined> {
  if (typeof createImageBitmap !== 'function') return undefined;
  try {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions.width > 0 && dimensions.height > 0 ? dimensions : undefined;
  } catch { return undefined; }
}

function findExifNumber(fields: ReturnType<typeof readExifMetadata>['fields'], names: string[]): number | undefined {
  const targets = names.map((name) => name.toLowerCase());
  for (const field of fields) {
    if (!targets.includes(field.key.toLowerCase())) continue;
    const value = Number(String(field.value).match(/\d+(?:\.\d+)?/)?.[0]);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return undefined;
}

export async function parseImage(file: File, inheritedWarnings: ParseWarning[] = []): Promise<NormalizedImageMetadata> {
  if (file.size > IMAGE_LIMITS.fileBytes) throw new MetadataError('FILE_TOO_LARGE', 'Images are limited to 50 MB.');
  const detection = await detectFileType(file);
  if (!['jpeg', 'png', 'webp'].includes(detection.type)) throw new MetadataError('UNSUPPORTED_FILE_TYPE', 'Choose a JPEG, PNG, or WebP image.');
  const actualFormat = detection.type as SupportedImageType;
  const warnings = [...inheritedWarnings, ...detection.warnings];
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const header = readImageDimensions(bytes, actualFormat);
  const exif = readExifMetadata(buffer);
  warnings.push(...exif.warnings);

  let container: ImageContainerDetails;
  let formatRaw: Record<string, unknown> = {};
  const textMetadata: Record<string, unknown> = {};
  if (actualFormat === 'png') {
    const png: ParsedPngChunks = parsePngChunks(bytes);
    warnings.push(...png.warnings);
    for (const item of png.textChunks) {
      if (textMetadata[item.keyword] === undefined) textMetadata[item.keyword] = item.text;
      else if (Array.isArray(textMetadata[item.keyword])) (textMetadata[item.keyword] as unknown[]).push(item.text);
      else textMetadata[item.keyword] = [textMetadata[item.keyword], item.text];
    }
    container = { kind: 'png', chunkCount: png.chunkCount, chunks: png.chunkTypes, hasIcc: png.hasIcc, hasExif: png.hasExif, hasXmp: png.hasXmp, hasAlpha: png.alpha, animated: png.animated };
    formatRaw = { png: { ...png, textChunks: png.textChunks } };
  } else if (actualFormat === 'webp') {
    const webp = parseWebpContainer(bytes);
    container = { kind: 'webp', chunkCount: webp.chunks.length, chunks: webp.chunks.map((chunk) => `${chunk.type} (${chunk.size} bytes)`), hasIcc: webp.hasIcc, hasExif: webp.hasExif, hasXmp: webp.hasXmp, hasAlpha: webp.hasAlpha, animated: webp.animated };
    if (webp.xmp) textMetadata['XMP packet'] = webp.xmp;
    formatRaw = { webp };
  } else {
    const jpeg = parseJpegContainer(bytes);
    container = { kind: 'jpeg', chunkCount: jpeg.segments.length, chunks: jpeg.segments.map((segment) => `${segment.marker}${segment.kind ? ` ${segment.kind}` : ''} (${segment.size} bytes)`), hasIcc: jpeg.hasIcc, hasExif: jpeg.hasExif, hasXmp: jpeg.hasXmp, hasAlpha: false, animated: false };
    formatRaw = { jpeg };
  }

  const normalized = normalizeImageMetadataDetailed({ exifFields: exif.fields, textMetadata, container });
  const orientation = orientationNumber(normalized.legacy.Orientation);
  const encodedDisplay = displayDimensions(header.width, header.height, orientation);
  const decoded = await decodedDimensions(file);
  const dimensions = decoded ?? encodedDisplay;
  if (decoded && (decoded.width !== encodedDisplay.width || decoded.height !== encodedDisplay.height)) warnings.push({ code: 'DIMENSION_ORIENTATION_MISMATCH', message: 'Browser-decoded dimensions differ from the encoded dimensions after EXIF orientation.' });
  const exifWidth = findExifNumber(exif.fields, ['PixelXDimension', 'ExifImageWidth', 'ImageWidth']);
  const exifHeight = findExifNumber(exif.fields, ['PixelYDimension', 'ExifImageHeight', 'ImageHeight']);
  if (exifWidth && exifHeight && (exifWidth !== header.width || exifHeight !== header.height)) warnings.push({ code: 'EXIF_DIMENSION_MISMATCH', message: 'EXIF dimensions differ from the image header. The browser-readable image dimensions are shown first.' });

  const base = makeFileSummary(file, actualFormat);
  const metadataFieldCount = normalized.sections.reduce((sum, section) => sum + section.fields.length, 0);
  const hasEmbeddedMetadata = container.hasExif || container.hasXmp || container.hasIcc || Object.keys(textMetadata).length > 0
    || normalized.sections.some((section) => section.id !== 'technical' && section.fields.length > 0);
  const fileSummary = {
    ...base, declaredMime: file.type || 'Not declared', actualFormat, width: dimensions.width, height: dimensions.height,
    megapixels: Number(((dimensions.width * dimensions.height) / 1_000_000).toFixed(2)), aspectRatio: aspect(dimensions.width, dimensions.height),
    animated: container.animated, alpha: container.hasAlpha, metadataFieldCount, warningCount: warnings.length, hasEmbeddedMetadata,
  };
  const raw = toSafeValue({ exif: exif.raw, text: textMetadata, ...formatRaw }) as Record<string, unknown>;
  return { file: fileSummary, sections: normalized.sections, location: normalized.location, container, raw, warnings, legacy: normalized.legacy };
}
