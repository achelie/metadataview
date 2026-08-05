export type GeneratorSource = 'automatic1111' | 'comfyui' | 'fooocus' | 'invokeai' | 'novelai' | 'unknown';

export interface LoraInfo { name: string; weight?: number }

export interface GenerationMetadata {
  source: GeneratorSource;
  positivePrompt?: string;
  negativePrompt?: string;
  model?: string;
  modelHash?: string;
  sampler?: string;
  scheduler?: string;
  seed?: string;
  steps?: number;
  cfgScale?: number;
  width?: number;
  height?: number;
  denoisingStrength?: number;
  clipSkip?: number;
  version?: string;
  loras: LoraInfo[];
  workflow?: Record<string, unknown>;
  rawMetadata: Record<string, unknown>;
}

export interface GeneratorAdapter {
  id: GeneratorSource;
  canParse(metadata: Record<string, unknown>): boolean;
  parse(metadata: Record<string, unknown>): GenerationMetadata;
}
