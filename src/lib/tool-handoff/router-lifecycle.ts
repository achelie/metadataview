/** Keep normal navigation native; file handoffs opt in with Astro's navigate(). */
export function installLimitedToolRouting(): void {
  const controller = new AbortController();
  const { signal } = controller;

  const markNativeNavigation = () => {
    document.querySelectorAll('a, area, form').forEach((element) => {
      // Let React hydrate its server markup unchanged; capture handles islands.
      if (!element.closest('astro-island')) element.setAttribute('data-astro-reload', '');
    });
  };

  // React can render links after page-load. Mark them before ClientRouter's
  // bubbling listener without preventing clicks or the link's own handler.
  document.addEventListener('click', (event) => {
    const target = event.composedPath()[0];
    if (target instanceof Element) {
      target.closest('a, area')?.setAttribute('data-astro-reload', '');
    }
  }, { capture: true, signal });

  document.addEventListener('submit', (event) => {
    if (event.target instanceof HTMLFormElement) {
      event.target.setAttribute('data-astro-reload', '');
    }
  }, { capture: true, signal });

  document.addEventListener('astro:after-swap', markNativeNavigation, { signal });
  markNativeNavigation();

  if (import.meta.hot) import.meta.hot.dispose(() => controller.abort());
}
