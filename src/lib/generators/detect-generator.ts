import { automatic1111Adapter } from './automatic1111';
import { comfyUiAdapter } from './comfyui';
import type { GenerationMetadata } from './types';

function collectTextMetadata(input: unknown, output: Record<string, unknown> = {}, depth = 0): Record<string, unknown> {
  if (depth > 8 || !input || typeof input !== 'object') return output;
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      const cleanKey = key.includes('.') ? key.split('.').pop() ?? key : key;
      if (output[cleanKey] === undefined) output[cleanKey] = value;
      if (output[key] === undefined) output[key] = value;
    } else collectTextMetadata(value, output, depth + 1);
  }
  return output;
}

function genericResult(metadata: Record<string, unknown>): GenerationMetadata {
  const lower = new Map(Object.entries(metadata).map(([key, value]) => [key.toLowerCase(), value]));
  const text = (key: string) => typeof lower.get(key) === 'string' ? lower.get(key) as string : undefined;
  let source: GenerationMetadata['source'] = 'unknown';
  const software = `${text('software') ?? ''} ${text('comment') ?? ''}`.toLowerCase();
  if (software.includes('fooocus')) source = 'fooocus';
  else if (software.includes('invoke')) source = 'invokeai';
  else if (software.includes('novelai')) source = 'novelai';
  return { source, positivePrompt: text('positive prompt') ?? text('prompt') ?? text('description'), negativePrompt: text('negative prompt'), model: text('model'), seed: text('seed'), loras: [], rawMetadata: metadata };
}

export function detectAndParseGenerator(raw: Record<string, unknown>): GenerationMetadata {
  const metadata = collectTextMetadata(raw);
  if (comfyUiAdapter.canParse(metadata)) {
    try { return comfyUiAdapter.parse(metadata); } catch (error) {
      return { source: 'comfyui', loras: [], rawMetadata: { ...metadata, parseWarning: error instanceof Error ? error.message : 'Workflow parsing failed' }, workflow: typeof metadata.workflow === 'object' ? metadata.workflow as Record<string, unknown> : undefined };
    }
  }
  if (automatic1111Adapter.canParse(metadata)) return automatic1111Adapter.parse(metadata);
  return genericResult(metadata);
}
