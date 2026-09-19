import { Icon } from '@iconify/react';
import { useRef } from 'react';
import imageIcon from '@iconify-icons/lucide/image';
import type { Locale } from '../i18n/core';
import { sampleMessages } from '../i18n/samples';
import type { SampleImageId } from '../lib/samples/catalog';
import type { SampleImageState } from '../lib/samples/use-sample-image';

function Attribution({ locale }: { locale: Locale }) {
  return <a className="sample-image-source" href="/samples/SOURCES.md" target="_blank" rel="noreferrer">Adobe · CC BY-SA 4.0 · {sampleMessages(locale).source}</a>;
}

export function SampleImageBar({ sample, onSelect, locale }: { sample: SampleImageState; onSelect: (file: File) => void; locale: Locale }) {
  const t = sampleMessages(locale);
  const trigger = useRef<HTMLButtonElement>(null);
  const cancel = () => {
    sample.cancel();
    window.requestAnimationFrame(() => trigger.current?.focus());
  };
  return <div className="sample-image-bar" data-sample-id={sample.id}>
    <div className="sample-image-copy"><p>{t.lead}</p>{sample.id === 'c2pa' ? <Attribution locale={locale} /> : null}</div>
    <div className="sample-image-actions">
      <button ref={trigger} className="button button-secondary" type="button" disabled={sample.loading} onClick={() => void sample.load(onSelect)}>
        <Icon icon={imageIcon} width="18" aria-hidden="true" />{sample.loading ? t.loading : sample.error ? t.retry : t.trySample}
      </button>
      {sample.loading ? <button className="button button-ghost" type="button" onClick={cancel}>{t.cancel}</button> : null}
    </div>
    <span className="sr-only" role="status">{sample.loading ? t.loading : ''}</span>
    {sample.error ? <p className="sample-image-error" role="alert">{t.error}</p> : null}
  </div>;
}

export function SampleImageBadge({ sampleId, locale }: { sampleId: SampleImageId; locale: Locale }) {
  const t = sampleMessages(locale);
  return <aside className="sample-image-badge" aria-label={t.badge}>
    <strong>{t.badge}</strong><p>{sampleId === 'c2pa' ? t.c2paNote : t.metadataNote}</p>
    {sampleId === 'c2pa' ? <Attribution locale={locale} /> : null}
  </aside>;
}
