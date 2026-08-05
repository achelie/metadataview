import { IMAGE_LIMITS } from './limits';

export interface SafeValueOptions {
  maxDepth?: number;
  maxKeys?: number;
  maxStringLength?: number;
}

interface SafeState {
  keys: number;
  seen: WeakSet<object>;
  options: Required<SafeValueOptions>;
}

function binarySummary(value: ArrayBuffer | ArrayBufferView): string {
  return `[Binary data omitted: ${value.byteLength.toLocaleString('en-US')} bytes]`;
}

function safeNumber(value: number): number | string {
  if (Number.isNaN(value)) return '[NaN]';
  if (value === Infinity) return '[Infinity]';
  if (value === -Infinity) return '[-Infinity]';
  return value;
}

function walk(value: unknown, depth: number, state: SafeState): unknown {
  if (value === null) return null;
  if (value === undefined) return '[Undefined]';
  if (typeof value === 'string') {
    return value.length > state.options.maxStringLength
      ? `${value.slice(0, state.options.maxStringLength)}\n[Truncated ${value.length - state.options.maxStringLength} characters]`
      : value;
  }
  if (typeof value === 'number') return safeNumber(value);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return `${value.toString()}n`;
  if (typeof value === 'function') return `[Function${value.name ? `: ${value.name}` : ''}]`;
  if (typeof value === 'symbol') return value.toString();
  if (value instanceof Date) return Number.isNaN(value.valueOf()) ? '[Invalid Date]' : value.toISOString();
  if (value instanceof ArrayBuffer) return binarySummary(value);
  if (ArrayBuffer.isView(value)) return binarySummary(value);
  if (depth >= state.options.maxDepth) return '[Maximum depth reached]';
  if (typeof value !== 'object') return String(value);
  if (state.seen.has(value)) return '[Circular reference]';

  state.seen.add(value);
  if (Array.isArray(value)) {
    const output: unknown[] = [];
    for (const item of value) {
      state.keys += 1;
      if (state.keys > state.options.maxKeys) { output.push('[Metadata key limit reached]'); break; }
      output.push(walk(item, depth + 1, state));
    }
    state.seen.delete(value);
    return output;
  }

  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    state.keys += 1;
    if (state.keys > state.options.maxKeys) { output._truncated = '[Metadata key limit reached]'; break; }
    const lower = key.toLowerCase();
    if ((lower.includes('thumbnail') || lower.includes('preview')) && (item instanceof ArrayBuffer || ArrayBuffer.isView(item))) {
      output[key] = binarySummary(item as ArrayBuffer | ArrayBufferView);
    } else output[key] = walk(item, depth + 1, state);
  }
  state.seen.delete(value);
  return output;
}

export function toSafeValue(value: unknown, options: SafeValueOptions = {}): unknown {
  return walk(value, 0, {
    keys: 0,
    seen: new WeakSet<object>(),
    options: {
      maxDepth: options.maxDepth ?? IMAGE_LIMITS.jsonDepth,
      maxKeys: options.maxKeys ?? IMAGE_LIMITS.jsonKeys,
      maxStringLength: options.maxStringLength ?? IMAGE_LIMITS.metadataStringChars,
    },
  });
}

export function stringifyDisplayValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value);
  try { return JSON.stringify(toSafeValue(value), null, 2); }
  catch { return String(value); }
}
