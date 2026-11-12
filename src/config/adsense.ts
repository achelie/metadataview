import { ADSENSE_ACCOUNT_ID } from './site';

export const adsenseScriptUrl = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ACCOUNT_ID}`;

export const manualAdsEnabled = true;

interface Placement {
  enabled: boolean;
  slot: string;
  format: 'display' | 'in-article';
}

export const manualAdPlacements: Record<'tool-after-result-guide' | 'home-before-faq' | 'article-after-prose', Placement> = {
  'tool-after-result-guide': { enabled: true, slot: '1396503722', format: 'display' },
  'home-before-faq': { enabled: false, slot: '', format: 'display' },
  'article-after-prose': { enabled: true, slot: '6565583278', format: 'in-article' },
};
