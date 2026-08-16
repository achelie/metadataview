import { describe, expect, it } from 'vitest';
import { getAlternatePaths, getLocaleFromPath, localizePath, stripLocale } from '../../src/i18n/core';
import { messages } from '../../src/i18n/messages';
import { localizePrivacyRisk } from '../../src/i18n/privacy';
import type { PrivacyRisk } from '../../src/lib/privacy/types';
import { localizeC2paValidation } from '../../src/i18n/c2pa';
import type { C2paValidationEntry } from '../../src/lib/c2pa/types';

describe('locale paths', () => {
  it('recognizes only the complete Chinese prefix', () => {
    expect(getLocaleFromPath('/')).toBe('en');
    expect(getLocaleFromPath('/zh-cn/')).toBe('zh-CN');
    expect(getLocaleFromPath('/zh-cn/image-metadata-viewer/')).toBe('zh-CN');
    expect(getLocaleFromPath('/zh-cn-fake/')).toBe('en');
  });

  it('round-trips roots and tool routes without duplicating prefixes', () => {
    expect(localizePath('/', 'zh-CN')).toBe('/zh-cn/');
    expect(localizePath('/image-metadata-viewer/', 'zh-CN')).toBe('/zh-cn/image-metadata-viewer/');
    expect(localizePath('/zh-cn/image-metadata-viewer/', 'zh-CN')).toBe('/zh-cn/image-metadata-viewer/');
    expect(localizePath('/zh-cn/image-metadata-viewer/', 'en')).toBe('/image-metadata-viewer/');
    expect(stripLocale('/zh-cn/')).toBe('/');
  });

  it('preserves query strings, hashes, and external links', () => {
    expect(localizePath('/privacy?from=nav#details', 'zh-CN')).toBe('/zh-cn/privacy/?from=nav#details');
    expect(localizePath('#workbench', 'zh-CN')).toBe('#workbench');
    expect(localizePath('https://example.com/x', 'zh-CN')).toBe('https://example.com/x');
  });

  it('builds reciprocal alternates with English as x-default', () => {
    expect(getAlternatePaths('/zh-cn/c2pa-viewer/')).toEqual({ en: '/c2pa-viewer/', 'zh-CN': '/zh-cn/c2pa-viewer/', 'x-default': '/c2pa-viewer/' });
  });
});

describe('typed translations', () => {
  it('keeps common dictionary keys identical', () => {
    expect(Object.keys(messages.en).sort()).toEqual(Object.keys(messages['zh-CN']).sort());
  });

  it('localizes stable privacy risk IDs and falls back to English for unknown IDs', () => {
    const known = { id: 'precise-location', category: 'location', title: 'Precise GPS coordinates', description: 'English detail', recommendation: 'English action' } as PrivacyRisk;
    expect(localizePrivacyRisk(known, 'zh-CN').title).toBe('精确 GPS 坐标');
    const unknown = { ...known, id: 'future-vendor-risk', title: 'Future vendor risk' };
    expect(localizePrivacyRisk(unknown, 'zh-CN')).toMatchObject({ title: 'Future vendor risk', description: 'English detail', recommendation: 'English action' });
  });

  it('localizes known C2PA validation codes and preserves unknown technical codes', () => {
    const known = { code: 'claimSignature.validated', title: 'Signature matches', explanation: 'English' } as C2paValidationEntry;
    expect(localizeC2paValidation(known, 'zh-CN').title).toBe('签名匹配');
    const unknown = { ...known, code: 'vendor.future.status', title: 'Vendor status' };
    expect(localizeC2paValidation(unknown, 'zh-CN').title).toBe('Vendor status');
  });
});
