import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@iconify/react';
import arrowIcon from '@iconify-icons/lucide/arrow-up-right';
import { useLocale } from '../i18n/react';
import { toolHandoffText } from '../i18n/tool-handoff';
import { discardToolFile, prepareToolFile, toolFileSignal } from '../lib/tool-handoff/store';

type PreparationEvent = Event & { sourceElement?: Element; loader: () => Promise<void> };

export function ToolFileLink({ file, href, children, className = 'button button-secondary' }: { file: File; href: string; children: ReactNode; className?: string }) {
  const locale = useLocale();
  const running = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  return <span className="tool-file-link">
    <a href={href} className={className} data-tool-file-link aria-disabled={state === 'loading' || undefined} onClick={async (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (running.current) return;
      running.current = true;
      setState('loading');
      const sourceElement = event.currentTarget;
      let token: symbol | undefined;
      let detach = () => {};
      try {
        token = prepareToolFile(file, href, window.location.origin);
        const signal = toolFileSignal(token);
        const { navigate } = await import('astro:transitions/client');
        if (signal.aborted || !mounted.current) throw new DOMException('Canceled', 'AbortError');
        const guard = (event: Event) => {
          const preparation = event as PreparationEvent;
          if (preparation.sourceElement !== sourceElement) return;
          const loader = preparation.loader;
          preparation.loader = async () => {
            signal.throwIfAborted();
            let abort = () => {};
            const canceled = new Promise<never>((_, reject) => { abort = () => reject(new DOMException('Canceled', 'AbortError')); signal.addEventListener('abort', abort, { once: true }); });
            try {
              await Promise.race([loader(), canceled]);
              signal.throwIfAborted();
              if (preparation.defaultPrevented) throw new Error('The next tool could not load');
            }
            finally { signal.removeEventListener('abort', abort); }
          };
        };
        document.addEventListener('astro:before-preparation', guard);
        detach = () => document.removeEventListener('astro:before-preparation', guard);
        await navigate(href, { sourceElement });
        if (window.location.pathname !== new URL(href, window.location.origin).pathname) throw new Error('Navigation did not finish');
      } catch (error) {
        if (token) discardToolFile(token);
        if (mounted.current) setState(error instanceof DOMException && error.name === 'AbortError' ? 'idle' : 'error');
      } finally { detach(); running.current = false; }
    }}>{children}<Icon icon={arrowIcon} width="17" aria-hidden="true" /></a>
    {state !== 'idle' && <small role="status">{toolHandoffText(locale, state)}</small>}
  </span>;
}
