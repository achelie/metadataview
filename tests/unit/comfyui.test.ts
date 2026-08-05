import { describe, expect, it } from 'vitest';
import { parseComfyUi } from '../../src/lib/generators/comfyui';

const graph = {
  '1': { class_type: 'CLIPTextEncode', inputs: { text: 'sunlit cabin' } },
  '2': { class_type: 'CLIPTextEncode', inputs: { text: 'blurry' } },
  '3': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: 'forest.safetensors' } },
  '4': { class_type: 'LoraLoader', inputs: { model: ['3', 0], lora_name: 'detail.safetensors', strength_model: 0.7 } },
  '5': { class_type: 'KSampler', inputs: { positive: ['1', 0], negative: ['2', 0], model: ['4', 0], seed: 99, steps: 24, cfg: 6.5, sampler_name: 'euler', scheduler: 'normal' } },
};

describe('ComfyUI parser', () => {
  it('starts at KSampler and follows prompt connections', () => {
    const result = parseComfyUi({ prompt: JSON.stringify(graph) });
    expect(result.positivePrompt).toBe('sunlit cabin'); expect(result.negativePrompt).toBe('blurry'); expect(result.seed).toBe('99');
    expect(result.steps).toBe(24); expect(result.model).toBe('forest.safetensors'); expect(result.loras[0]?.name).toBe('detail.safetensors');
  });
  it('protects against circular connections', () => {
    const cycle = { a: { class_type: 'Relay', inputs: { text: ['b', 0] } }, b: { class_type: 'Relay', inputs: { text: ['a', 0] } }, s: { class_type: 'KSampler', inputs: { positive: ['a', 0] } } };
    expect(parseComfyUi({ prompt: JSON.stringify(cycle) }).positivePrompt).toBeUndefined();
  });
  it('rejects workflows above the 5,000 node limit', () => {
    const huge = Object.fromEntries(Array.from({ length: 5_001 }, (_, index) => [String(index), { class_type: 'Noop', inputs: {} }]));
    expect(() => parseComfyUi({ prompt: JSON.stringify(huge) })).toThrow(/5,000/);
  });
});
