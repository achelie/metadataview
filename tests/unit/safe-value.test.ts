import { describe, expect, it } from 'vitest';
import { stringifyDisplayValue, toSafeValue } from '../../src/lib/metadata/safe-value';

describe('safe metadata serialization', () => {
  it('keeps null, strings, numbers, and booleans', () => expect(toSafeValue({ a: null, b: 'text', c: 3, d: false })).toEqual({ a: null, b: 'text', c: 3, d: false }));
  it('labels undefined instead of dropping the key', () => expect(toSafeValue({ value: undefined })).toEqual({ value: '[Undefined]' }));
  it('serializes bigint without precision loss', () => expect(toSafeValue(9007199254740993n)).toBe('9007199254740993n'));
  it('serializes valid dates as ISO strings', () => expect(toSafeValue(new Date('2024-01-02T03:04:05Z'))).toBe('2024-01-02T03:04:05.000Z'));
  it('marks invalid dates', () => expect(toSafeValue(new Date('nope'))).toBe('[Invalid Date]'));
  it('omits ArrayBuffer payloads', () => expect(toSafeValue(new ArrayBuffer(12))).toContain('12 bytes'));
  it('omits typed-array payloads', () => expect(toSafeValue(new Uint16Array(7))).toContain('14 bytes'));
  it('detects circular objects', () => { const value: Record<string, unknown> = {}; value.self = value; expect(toSafeValue(value)).toEqual({ self: '[Circular reference]' }); });
  it('stops at a configured depth', () => expect(toSafeValue({ a: { b: 1 } }, { maxDepth: 1 })).toEqual({ a: '[Maximum depth reached]' }));
  it('stops at a configured key limit', () => expect(toSafeValue({ a: 1, b: 2 }, { maxKeys: 1 })).toEqual({ a: 1, _truncated: '[Metadata key limit reached]' }));
  it('truncates unusually long metadata strings', () => expect(toSafeValue('abcdef', { maxStringLength: 3 })).toContain('[Truncated 3 characters]'));
  it('represents functions and symbols without executing them', () => expect(toSafeValue({ fn() {}, symbol: Symbol('tag') })).toEqual({ fn: '[Function: fn]', symbol: 'Symbol(tag)' }));
  it('formats nested display values as readable JSON', () => expect(stringifyDisplayValue({ seed: 42 })).toContain('"seed": 42'));
  it('represents NaN and infinities with valid JSON strings', () => expect(toSafeValue([NaN, Infinity, -Infinity])).toEqual(['[NaN]', '[Infinity]', '[-Infinity]']));
});
