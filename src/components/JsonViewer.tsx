import { useState } from 'react';
import { CopyButton } from './CopyButton';
import { DisclosureChevron } from './DisclosureChevron';

export function JsonViewer({ data, title = 'Raw JSON' }: { data: unknown; title?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <details className="json-panel" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className="disclosure-summary"><span className="disclosure-label">{title}<small>Open the unfiltered result</small></span><DisclosureChevron /></summary>
      {open && <><div className="json-toolbar"><CopyButton value={data} label="Copy JSON" /></div><pre>{JSON.stringify(data, null, 2)}</pre></>}
    </details>
  );
}
