import { describe, expect, it } from 'vitest';
import { reportMessages, reportTranslator } from '../../src/i18n/workbench-report';
import { removalMessages, removalTranslator } from '../../src/i18n/workbench-removal';
import { locales } from '../../src/i18n/core';

describe('workbench translations', () => {
  it('covers all four languages with identical interpolation parameters', () => {
    for (const messages of [reportMessages, removalMessages]) {
      for (const entry of Object.values(messages)) {
        const parameters = (text: string) => [...new Set(text.match(/\{\w+\}/g) ?? [])].sort();
        for (const locale of locales) {
          expect(entry[locale].length).toBeGreaterThan(0);
          expect(parameters(entry[locale])).toEqual(parameters(entry.en));
        }
      }
    }
  });
  it('formats dynamic values and fails visibly on missing parameters', () => {
    expect(reportTranslator('zh-CN')('file-report', { name: '照片.jpg' })).toBe('照片.jpg 元数据报告');
    expect(removalTranslator('fr')('size-limit', { limit: 50 })).toContain('50 Mo');
    expect(() => reportTranslator('en')('file-report')).toThrow('Missing translation parameter');
  });
});
