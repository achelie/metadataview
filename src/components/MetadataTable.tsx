import type { MetadataItem } from '../lib/metadata/types';
import { CopyButton } from './CopyButton';

function display(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '—';
  return JSON.stringify(value, null, 2);
}

export function MetadataTable({ items }: { items: MetadataItem[] }) {
  return (
    <div className="metadata-table-wrap">
      <table className="metadata-table">
        <thead><tr><th>Field</th><th>Value</th><th><span className="sr-only">Actions</span></th></tr></thead>
        <tbody>{items.map((item, index) => (
          <tr key={`${item.key}-${index}`}>
            <th scope="row">{item.key}</th>
            <td><code>{display(item.value)}</code></td>
            <td><CopyButton value={item.value} /></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
