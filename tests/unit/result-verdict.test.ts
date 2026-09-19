import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PrivacyCleanupPanel } from '../../src/components/privacy/PrivacyCleanupPanel';
import { createPrivacyReport } from '../../src/lib/privacy/create-privacy-report';
import type { NormalizedImageMetadata } from '../../src/lib/metadata/types';
import type { PrivacyCleanupResult } from '../../src/lib/privacy/types';

const metadata: NormalizedImageMetadata = {
  file: { name: 'demo.png', safeName: 'demo', size: 512, mime: 'image/png', declaredMime: 'image/png', detectedType: 'png', extension: 'png', actualFormat: 'png', width: 32, height: 24, megapixels: .001, aspectRatio: '4:3', animated: false, alpha: true, metadataFieldCount: 0, warningCount: 0, hasEmbeddedMetadata: false },
  sections: [], location: { valid: false }, container: { kind: 'png', hasIcc: false, hasExif: false, hasXmp: false, hasAlpha: true, animated: false }, raw: {}, warnings: [], legacy: {},
};
const report = createPrivacyReport(metadata);
const base: PrivacyCleanupResult = {
  mode: 'privacy-first', blob: new Blob(), fileName: 'demo-clean.png', mime: 'image/png', beforeSize: 512, afterSize: 256,
  verificationStatus: 'verified', verificationDepth: 'embedded', cleanupEngine: 'canvas', outputChecks: [], beforeReport: report, afterReport: report, warnings: [],
  diff: { scoreBefore: 15, scoreAfter: 0, scoreDelta: -15, fieldsBefore: 1, fieldsAfter: 0, removedRiskIds: ['creator-identity'], remainingRiskIds: [], addedRiskIds: [] },
};

function render(result: PrivacyCleanupResult) {
  const noop = () => {};
  return renderToStaticMarkup(createElement(PrivacyCleanupPanel, { metadata, report, result, mode: 'privacy-first', pending: false, stage: null, error: null, onMode: noop, onClean: noop, onDownload: noop, onReceipt: noop, locale: 'en' }));
}

describe('cleanup result claims', () => {
  it('offers a clean copy only after complete verification finds no supported risks', () => {
    const html = render(base);
    expect(html).toContain('Download clean copy');
    expect(html).toContain('no supported risks detected');
    expect(html).not.toContain('Download processed copy');
  });

  it('includes newly detected risks when deciding whether a copy is clean', () => {
    const html = render({ ...base, diff: { ...base.diff!, addedRiskIds: ['rights-information'], scoreAfter: 8 } });
    expect(html).toContain('Download processed copy');
    expect(html).toContain('Newly detected risks: 1');
    expect(html).not.toContain('Download clean copy');
  });

  it('labels an incomplete verification as processed and keeps uncertainty visible', () => {
    const html = render({ ...base, verificationStatus: 'incomplete', diff: undefined, afterReport: undefined });
    expect(html).toContain('Verification incomplete');
    expect(html).toContain('Remaining risks: unknown');
    expect(html).toContain('Download processed copy');
    expect(html).not.toContain('Download clean copy');
  });

  it('blocks the main download after a failed output check', () => {
    const html = render({ ...base, verificationStatus: 'failed', diff: undefined });
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>.*?Download blocked: invalid output<\/button>/);
    expect(html).not.toContain('Download clean copy');
  });
});
