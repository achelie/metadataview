export const sampleImages = {
  metadata: { url: '/samples/metadata-demo-v1.jpg', name: 'viewexif-metadata-demo.jpg', lastModified: Date.UTC(2026, 0, 15, 10, 30) },
  c2pa: { url: '/samples/c2pa-signed-v1.jpg', name: 'adobe-20220124-C.jpg', lastModified: Date.UTC(2022, 0, 24) },
} as const;

export type SampleImageId = keyof typeof sampleImages;
const sampleFiles = new WeakMap<File, SampleImageId>();

export function sampleImageId(file: File | null): SampleImageId | undefined {
  return file ? sampleFiles.get(file) : undefined;
}

export async function fetchSampleImage(id: SampleImageId, signal: AbortSignal): Promise<File> {
  const sample = sampleImages[id];
  const response = await fetch(sample.url, { signal, credentials: 'omit' });
  if (!response.ok) throw new Error('Sample image could not be loaded.');
  const blob = await response.blob();
  const header = new Uint8Array(await blob.slice(0, 3).arrayBuffer());
  if (signal.aborted) throw new DOMException('Sample loading canceled.', 'AbortError');
  if (blob.size > 2 * 1024 * 1024 || header[0] !== 0xff || header[1] !== 0xd8 || header[2] !== 0xff) {
    throw new Error('Sample image is not a supported JPEG.');
  }
  const file = new File([blob], sample.name, { type: 'image/jpeg', lastModified: sample.lastModified });
  sampleFiles.set(file, id);
  return file;
}
