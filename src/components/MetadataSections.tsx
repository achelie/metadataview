import { useMemo, useState } from 'react';
import type { MetadataSection } from '../lib/metadata/types';
import { MetadataTable } from './MetadataTable';
import { DisclosureChevron } from './DisclosureChevron';

export function MetadataSections({ sections }: { sections: MetadataSection[] }) {
  const [query, setQuery] = useState('');
  const visible = useMemo(() => sections.map((section) => ({ ...section, items: section.items.filter((item) => `${item.key} ${JSON.stringify(item.value)}`.toLowerCase().includes(query.toLowerCase())) })).filter((section) => section.items.length), [query, sections]);
  return (
    <div>
      <label className="search-field"><span>Search metadata</span><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Try GPS, author, model…" /></label>
      {visible.length ? visible.map((section, index) => (
        <details className="metadata-section" open={index === 0} key={section.id}>
          <summary className="disclosure-summary"><span className="disclosure-label">{section.title}</span><span className="disclosure-controls"><small>{section.items.length} fields</small><DisclosureChevron /></span></summary>
          <MetadataTable items={section.items} />
        </details>
      )) : <p className="empty-inline">No fields match “{query}”.</p>}
    </div>
  );
}
