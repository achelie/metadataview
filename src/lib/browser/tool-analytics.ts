type ToolEvent =
  | 'file_processing_started'
  | 'metadata_parse_succeeded'
  | 'metadata_parse_failed'
  | 'metadata_cleanup_succeeded'
  | 'metadata_cleanup_failed'
  | 'file_download_triggered';

declare global {
  interface Window {
    AhrefsAnalytics?: { sendEvent: (name: ToolEvent) => void };
  }
}

export function trackToolEvent(name: ToolEvent): void {
  try {
    // Only fixed event names leave the tool. The provider adds page context.
    window.AhrefsAnalytics?.sendEvent(name);
  } catch {
    // Analytics must not interrupt local file operations.
  }
}
