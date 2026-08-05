import { useState } from 'react';
import { CopyButton } from './CopyButton';

export function JsonViewer({ data, title = 'Raw JSON' }: { data: unknown; title?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <details className="json-panel" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>{title}<span>Open the unfiltered result</span></summary>
      {open && <><div className="json-toolbar"><CopyButton value={data} label="Copy JSON" /></div><pre>{JSON.stringify(data, null, 2)}</pre></>}
    </details>
  );
}
