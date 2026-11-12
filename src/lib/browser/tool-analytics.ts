import { stripLocale } from '../../i18n/core';

type ToolEvent =
  | 'file_processing_started'
  | 'metadata_parse_succeeded'
  | 'metadata_parse_failed'
  | 'metadata_cleanup_succeeded'
  | 'metadata_cleanup_failed'
  | 'file_download_triggered';

declare global {
  interface Window {
    AhrefsAnalytics?: { sendEvent: (name: ToolEvent, options: { props: { tool: string } }) => void };
  }
}

export function trackToolEvent(name: ToolEvent): void {
  try {
    const path = stripLocale(window.location.pathname);
    // Match known routes only. The property never contains query strings or file data.
    const tool = path === '/' ? 'metadata-viewer'
      : path.match(/^\/((?:(?:image|video|audio|document)-)?metadata-(?:viewer|remover)|image-privacy-checker|c2pa-viewer)\/?$/)?.[1];
    if (tool) window.AhrefsAnalytics?.sendEvent(name, { props: { tool } });
  } catch {
    // Analytics must not interrupt local file operations.
  }
}
