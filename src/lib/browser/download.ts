import { trackToolEvent } from './tool-analytics';

export function triggerDownload(url: string, filename: string): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.dataset.googleVignette = 'false';
  anchor.click();
  trackToolEvent('file_download_triggered');
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
