import type { ReactNode } from 'react';
import { useLocale } from '../i18n/react';
import { toolHandoffText } from '../i18n/tool-handoff';

export function ToolNextSteps({ children, output = false }: { children: ReactNode; output?: boolean }) {
  const locale = useLocale();
  return <section className="tool-next-steps" aria-label={toolHandoffText(locale, output ? 'nextOutput' : 'next')}>
    <div><h3>{toolHandoffText(locale, output ? 'nextOutput' : 'next')}</h3><p>{toolHandoffText(locale, 'note')}</p></div>
    <div className="tool-next-step-actions">{children}</div>
  </section>;
}
