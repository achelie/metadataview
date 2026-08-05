import { MetadataError } from '../metadata/errors';
import { detectFileType } from '../metadata/detect-file-type';
import { IMAGE_LIMITS } from '../metadata/limits';

export interface RemovalResult {
  blob: Blob;
  mime: string;
  beforeSize: number;
  afterSize: number;
  quality: number;
}

export function assertCanvasCleanupSafe(dimensions: { width: number; height: number }): void {
  const pixels = dimensions.width * dimensions.height;
  if (!Number.isSafeInteger(pixels) || dimensions.width <= 0 || dimensions.height <= 0) throw new MetadataError('IMAGE_DECODE_FAILED', 'The image dimensions are invalid.');
  if (dimensions.width > IMAGE_LIMITS.canvasSide || dimensions.height > IMAGE_LIMITS.canvasSide || pixels > IMAGE_LIMITS.canvasPixels) {
    throw new MetadataError('IMAGE_TOO_LARGE_TO_REENCODE', 'Privacy-first cleanup is limited to 40 megapixels and 16,384 pixels per side. Use Preserve encoding for this image.');
  }
}

export async function removeImageMetadata(file: File, quality = 0.92, dimensions?: { width: number; height: number }): Promise<RemovalResult> {
  const detection = await detectFileType(file);
  if (!['jpeg', 'png', 'webp'].includes(detection.type)) throw new MetadataError('UNSUPPORTED_FILE_TYPE', 'Metadata removal supports JPEG, PNG, and WebP images.');
  if (dimensions) assertCanvasCleanupSafe(dimensions);
  const mime = detection.type === 'jpeg' ? 'image/jpeg' : `image/${detection.type}`;
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch (error) { throw new MetadataError('IMAGE_DECODE_FAILED', 'The browser could not decode this image.', { cause: error }); }
  try {
    assertCanvasCleanupSafe({ width: bitmap.width, height: bitmap.height });
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d', { alpha: detection.type !== 'jpeg' });
    if (!context) throw new MetadataError('IMAGE_ENCODE_FAILED', 'Canvas encoding is unavailable in this browser.');
    context.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new MetadataError('IMAGE_ENCODE_FAILED', `This browser cannot encode ${mime}.`)), mime, detection.type === 'png' ? undefined : quality);
    });
    return { blob, mime, beforeSize: file.size, afterSize: blob.size, quality: detection.type === 'png' ? 1 : quality };
  } finally { bitmap.close(); }
}
