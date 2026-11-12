export {};

type ConsentData = {
  gdprApplies?: boolean;
  cmpStatus?: string;
  eventStatus?: string;
  purpose?: { consents?: Record<number, boolean> };
  vendor?: { consents?: Record<number, boolean> };
};

declare global {
  interface Window {
    __tcfapi?: (command: 'addEventListener', version: 2, callback: (data: ConsentData, success: boolean) => void) => void;
    adsbygoogle?: { push: (request: Record<string, never>) => void };
  }
}

const requested = new Set<string>();
const nearby = new Set<HTMLElement>();
let loaderReady = false;
let consentAllowsAds = false;
let listeningToTcf = false;

function canRequestAd(): boolean {
  // If no TCF API is exposed, the existing AdSense tag handles its own
  // regional Privacy & messaging rules, including a CMP that starts later.
  if (!window.__tcfapi) return true;
  if (!listeningToTcf) {
    listeningToTcf = true;
    window.__tcfapi('addEventListener', 2, (data, success) => {
      const ready = success && data?.cmpStatus === 'loaded';
      const hasChoice = data?.eventStatus === 'tcloaded' || data?.eventStatus === 'useractioncomplete';
      // Google Advertising Products is vendor 755 in the TCF list.
      consentAllowsAds = ready && (data.gdprApplies === false || (
        data.gdprApplies === true && hasChoice &&
        data.purpose?.consents?.[1] === true && data.vendor?.consents?.[755] === true
      ));
      queueMicrotask(requestNearbyAds);
    });
  }
  return consentAllowsAds;
}

function requestAd(placement: HTMLElement) {
  const queue = window.adsbygoogle;
  if (!loaderReady || !queue || !nearby.has(placement) || !placement.isConnected) return;
  const { manualAd, client, slot, format } = placement.dataset;
  const inArticle = format === 'in-article';
  if (placement.getBoundingClientRect().width < (inArticle ? 250 : 1) || !canRequestAd()) return;

  const key = `${location.pathname}:${manualAd}`;
  nearby.delete(placement);
  intersection.unobserve(placement);
  resize.unobserve(placement);
  if (requested.has(key) || !client || !slot) return;
  requested.add(key);

  const unit = document.createElement('ins');
  unit.className = 'adsbygoogle';
  unit.dataset.adClient = client;
  unit.dataset.adSlot = slot;
  unit.dataset.adFormat = inArticle ? 'fluid' : 'auto';
  if (inArticle) unit.dataset.adLayout = 'in-article';
  else unit.dataset.fullWidthResponsive = 'true';
  placement.append(unit);

  try {
    queue.push({});
  } catch {
    // A failed initialization has no retry or visible placeholder.
    if (!unit.hasChildNodes()) unit.remove();
  }
}

function requestNearbyAds() {
  nearby.forEach(requestAd);
}

const intersection = new IntersectionObserver((entries) => {
  for (const { target, isIntersecting } of entries) {
    const placement = target as HTMLElement;
    if (isIntersecting) {
      nearby.add(placement);
      requestAd(placement);
    } else {
      nearby.delete(placement);
    }
  }
}, { rootMargin: '240px 0px' });

const resize = new ResizeObserver((entries) => {
  for (const { target } of entries) requestAd(target as HTMLElement);
});

function observePage() {
  nearby.clear();
  intersection.disconnect();
  resize.disconnect();
  document.querySelectorAll<HTMLElement>('[data-manual-ad]').forEach((placement) => {
    if (requested.has(`${location.pathname}:${placement.dataset.manualAd}`)) return;
    intersection.observe(placement);
    resize.observe(placement);
  });
}

const loader = document.querySelector<HTMLScriptElement>('[data-adsense-loader]');
if (loader) {
  document.addEventListener('astro:after-swap', observePage);
  observePage();

  function markLoaderReady() {
    loaderReady = true;
    requestNearbyAds();
  }
  if (loader.hasAttribute('data-adsense-ready')) markLoaderReady();
  else loader.addEventListener('load', markLoaderReady, { once: true });
}
