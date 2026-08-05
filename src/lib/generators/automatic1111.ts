import type { GenerationMetadata, LoraInfo } from './types';

const FIELD_MAP: Record<string, keyof GenerationMetadata> = {
  steps: 'steps', sampler: 'sampler', 'schedule type': 'scheduler', scheduler: 'scheduler', seed: 'seed',
  model: 'model', 'model hash': 'modelHash', 'cfg scale': 'cfgScale', 'clip skip': 'clipSkip',
  'denoising strength': 'denoisingStrength', version: 'version',
};

function valueFrom(metadata: Record<string, unknown>): string {
  const key = Object.keys(metadata).find((candidate) => /^(parameters|generation parameters|comment)$/i.test(candidate));
  return key && typeof metadata[key] === 'string' ? metadata[key] as string : '';
}

function extractLoras(text: string): LoraInfo[] {
  return [...text.matchAll(/<lora:([^:>]+)(?::(-?\d*\.?\d+))?>/gi)].map((match) => ({ name: match[1] ?? 'unknown', weight: match[2] ? Number(match[2]) : undefined }));
}

export function parseAutomatic1111(text: string, rawMetadata: Record<string, unknown> = { parameters: text }): GenerationMetadata {
  const parameterStart = text.search(/(?:^|\n)Steps\s*:/i);
  const promptBlock = parameterStart >= 0 ? text.slice(0, parameterStart).trim() : text.trim();
  const parameterBlock = parameterStart >= 0 ? text.slice(parameterStart).trim() : '';
  const negativeMatch = /(?:^|\n)Negative prompt:\s*([\s\S]*)$/i.exec(promptBlock);
  const negativePrompt = negativeMatch?.[1]?.trim();
  const positivePrompt = negativeMatch ? promptBlock.slice(0, negativeMatch.index).trim() : promptBlock;
  const result: GenerationMetadata = { source: 'automatic1111', positivePrompt: positivePrompt || undefined, negativePrompt, loras: extractLoras(text), rawMetadata: { ...rawMetadata } };

  const matches = parameterBlock.matchAll(/(?:^|,\s*)([A-Za-z][A-Za-z ]+?):\s*(.*?)(?=,\s*[A-Za-z][A-Za-z ]+?:|$)/g);
  const unknown: Record<string, string> = {};
  for (const match of matches) {
    const label = (match[1] ?? '').trim();
    const value = (match[2] ?? '').trim();
    if (/^size$/i.test(label)) {
      const size = /^(\d+)\s*x\s*(\d+)$/i.exec(value);
      if (size) { result.width = Number(size[1]); result.height = Number(size[2]); }
      continue;
    }
    const target = FIELD_MAP[label.toLowerCase()];
    if (!target) { unknown[label] = value; continue; }
    if (target === 'steps' || target === 'cfgScale' || target === 'clipSkip' || target === 'denoisingStrength') {
      (result[target] as number | undefined) = Number(value);
    } else {
      (result[target] as string | undefined) = value;
    }
  }
  if (Object.keys(unknown).length) result.rawMetadata.unrecognizedParameters = unknown;
  return result;
}

export const automatic1111Adapter = {
  id: 'automatic1111' as const,
  canParse: (metadata: Record<string, unknown>) => /(?:^|\n)Steps\s*:/i.test(valueFrom(metadata)),
  parse: (metadata: Record<string, unknown>) => parseAutomatic1111(valueFrom(metadata), metadata),
};
