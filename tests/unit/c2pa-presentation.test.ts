import { describe, expect, it } from 'vitest';
import { collectWatermarkDeclarations, presentC2paValidation } from '../../src/lib/c2pa/presentation';
import type { C2paActionSummary, C2paAssertionSummary, C2paReport } from '../../src/lib/c2pa/types';

function entry(id: string, severity: 'success' | 'informational' | 'failure') {
  return { id, code: id, title: id, explanation: id, severity, scope: 'Active manifest' } as const;
}

describe('C2PA report presentation', () => {
  it('orders failures and warnings before passed checks and keeps counts honest', () => {
    const validation: C2paReport['validation'] = {
      success: [entry('passed-1', 'success'), entry('passed-2', 'success')],
      informational: [entry('warning-1', 'informational')],
      failure: [entry('failed-1', 'failure')],
    };
    const result = presentC2paValidation(validation);
    expect(result).toMatchObject({ total: 4, passed: 2, warnings: 1, failed: 1 });
    expect(result.entries.map((item) => item.id)).toEqual(['failed-1', 'warning-1', 'passed-1', 'passed-2']);
  });

  it('recognizes declared watermark action codes without scanning arbitrary prose', () => {
    const actions: C2paActionSummary[] = [
      { id: 'created', action: 'c2pa.created', label: 'Created', description: 'Watermark mentioned in ordinary prose.' },
      { id: 'marked', action: 'c2pa.watermarked.unbound', label: 'Watermarked Unbound' },
      { id: 'marked-copy', action: 'c2pa.watermarked.unbound', label: 'Watermarked Unbound' },
    ];
    const assertions: C2paAssertionSummary[] = [
      { id: 'actions', label: 'c2pa.actions.v2', created: true, description: '', data: {} },
      { id: 'watermark', label: 'c2pa.watermark', created: true, description: '', data: {} },
    ];
    expect(collectWatermarkDeclarations(actions, assertions)).toEqual([
      { id: 'watermark-marked', label: 'Watermarked Unbound', code: 'c2pa.watermarked.unbound', source: 'action' },
      { id: 'watermark-watermark', label: 'watermark', code: 'c2pa.watermark', source: 'assertion' },
    ]);
  });

  it('returns no watermark declaration for unrelated fields', () => {
    expect(collectWatermarkDeclarations([], [{
      id: 'thumbnail', label: 'c2pa.thumbnail.claim.jpeg', created: true, description: '', data: { note: 'watermark' },
    }])).toEqual([]);
  });
});
