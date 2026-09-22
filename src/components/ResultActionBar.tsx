import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Keeps the same controls reachable while reading a mobile result. */
export function ResultActionBar({ children, label, className = '' }: { children: ReactNode; label: string; className?: string }) {
  const slot = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [floating, setFloating] = useState(false);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const anchor = slot.current;
    const controls = bar.current;
    const scope = anchor?.closest('section.workbench, [data-result-scope]');
    if (!anchor || !controls || !scope) return;
    const mobile = window.matchMedia('(max-width: 680px)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const active = document.activeElement;
      const editing = active instanceof HTMLElement && (active.matches('input, textarea, select') || active.isContentEditable);
      const slots = [...scope.querySelectorAll<HTMLElement>('[data-result-action-slot]')].filter((item) => item.getClientRects().length);
      const candidates = slots.filter((item) => item.getBoundingClientRect().top < 80);
      const laterActionsVisible = slots.slice(slots.indexOf(anchor) + 1).some((item) => {
        const rect = item.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 80;
      });
      setFloating(mobile.matches && !editing && !laterActionsVisible && candidates.at(-1) === anchor && scope.getBoundingClientRect().bottom > 180);
      if (controls.dataset.floating !== 'true') setHeight(Math.ceil(controls.getBoundingClientRect().height));
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    const closeOpenMenus = () => {
      controls.querySelectorAll<HTMLDetailsElement>('details[open]').forEach((menu) => { menu.open = false; });
    };
    const closeMenus = (event: PointerEvent) => {
      if (event.target instanceof Node && !controls.contains(event.target)) {
        closeOpenMenus();
      }
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(controls);
    resize.observe(scope);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('blur', closeOpenMenus);
    document.addEventListener('focusin', schedule);
    document.addEventListener('focusout', schedule);
    document.addEventListener('pointerdown', closeMenus);
    mobile.addEventListener('change', schedule);
    schedule();
    return () => {
      window.cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('blur', closeOpenMenus);
      document.removeEventListener('focusin', schedule);
      document.removeEventListener('focusout', schedule);
      document.removeEventListener('pointerdown', closeMenus);
      mobile.removeEventListener('change', schedule);
    };
  }, []);

  return <div ref={slot} className="result-action-slot" data-result-action-slot style={floating ? { minHeight: height } : undefined}>
    <div ref={bar} className={`result-actions result-action-bar ${className}`} role="group" aria-label={label} data-floating={floating}
      onBlur={(event) => {
        // Safari clears focus before clicking a button; let that action run first.
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
          event.currentTarget.querySelectorAll<HTMLDetailsElement>('details[open]').forEach((menu) => { menu.open = false; });
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        const menu = (event.target as HTMLElement).closest<HTMLDetailsElement>('details[open]');
        if (menu) { menu.open = false; menu.querySelector('summary')?.focus(); event.preventDefault(); }
      }}
      onClick={(event) => {
        const button = (event.target as HTMLElement).closest('button');
        const menu = button?.closest<HTMLDetailsElement>('details[open]');
        if (menu) { menu.open = false; menu.querySelector('summary')?.focus(); }
      }}>{children}</div>
  </div>;
}
