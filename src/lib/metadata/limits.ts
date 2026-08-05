export const IMAGE_LIMITS = Object.freeze({
  fileBytes: 50 * 1024 * 1024,
  chunkBytes: 10 * 1024 * 1024,
  inflatedTextBytes: 20 * 1024 * 1024,
  metadataStringChars: 2 * 1024 * 1024,
  searchPreviewChars: 100 * 1024,
  displayPreviewChars: 10 * 1024,
  jsonDepth: 50,
  jsonKeys: 20_000,
  workerTimeoutMs: 15_000,
  canvasPixels: 40_000_000,
  canvasSide: 16_384,
});
