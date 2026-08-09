import type {
  C2paActionSummary,
  C2paAssertionSummary,
  C2paReport,
  C2paValidationEntry,
} from './types';

export interface C2paValidationPresentation {
  total: number;
  passed: number;
  warnings: number;
  failed: number;
  entries: C2paValidationEntry[];
}

export interface C2paWatermarkDeclaration {
  id: string;
  label: string;
  code: string;
  source: 'action' | 'assertion';
}

export function presentC2paValidation(validation: C2paReport['validation']): C2paValidationPresentation {
  const entries = [...validation.failure, ...validation.informational, ...validation.success];
  return {
    total: entries.length,
    passed: validation.success.length,
    warnings: validation.informational.length,
    failed: validation.failure.length,
    entries,
  };
}

function isWatermarkAction(action: C2paActionSummary): boolean {
  return /(?:^|[.:_-])watermarked?(?:[.:_-]|$)/i.test(action.action);
}

function isWatermarkAssertion(assertion: C2paAssertionSummary): boolean {
  return /(?:^|[.:_-])watermarks?(?:[.:_-]|$)/i.test(assertion.label);
}

export function collectWatermarkDeclarations(
  actions: C2paActionSummary[],
  assertions: C2paAssertionSummary[],
): C2paWatermarkDeclaration[] {
  const declarations: C2paWatermarkDeclaration[] = [];
  const seen = new Set<string>();
  const add = (declaration: C2paWatermarkDeclaration) => {
    const key = `${declaration.source}\u0000${declaration.code}`;
    if (seen.has(key)) return;
    seen.add(key);
    declarations.push(declaration);
  };

  actions.filter(isWatermarkAction).forEach((action) => add({
    id: `watermark-${action.id}`,
    label: action.label,
    code: action.action,
    source: 'action',
  }));
  assertions.filter(isWatermarkAssertion).forEach((assertion) => add({
    id: `watermark-${assertion.id}`,
    label: assertion.label.replace(/^c2pa\./i, '').replace(/[._-]+/g, ' '),
    code: assertion.label,
    source: 'assertion',
  }));

  return declarations;
}
