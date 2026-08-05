import { describe, expect, it } from 'vitest';
import { parseAutomatic1111 } from '../../src/lib/generators/automatic1111';

const sample = `a cinematic portrait, dramatic lighting <lora:portrait-plus:0.8>\nNegative prompt: blurry, low quality\nSteps: 30, Sampler: DPM++ 2M Karras, Schedule type: Karras, CFG scale: 7, Seed: 123456, Size: 1024x768, Model: dreamshaper, Model hash: abc123, Clip skip: 2, Denoising strength: 0.45, Version: v1.9`;

describe('AUTOMATIC1111 parser', () => {
  const result = parseAutomatic1111(sample);
  it('extracts positive and negative prompts', () => { expect(result.positivePrompt).toContain('cinematic portrait'); expect(result.negativePrompt).toBe('blurry, low quality'); });
  it('extracts steps, CFG, seed, sampler and size', () => {
    expect(result.steps).toBe(30); expect(result.cfgScale).toBe(7); expect(result.seed).toBe('123456');
    expect(result.sampler).toBe('DPM++ 2M Karras'); expect([result.width, result.height]).toEqual([1024, 768]);
  });
  it('parses Steps as a number', () => expect(result.steps).toBe(30));
  it('parses CFG scale as a number', () => expect(result.cfgScale).toBe(7));
  it('keeps Seed exact as text', () => expect(result.seed).toBe('123456'));
  it('parses width and height from Size', () => expect(`${result.width}x${result.height}`).toBe('1024x768'));
  it('extracts model details and LoRA weights', () => {
    expect(result.model).toBe('dreamshaper'); expect(result.modelHash).toBe('abc123'); expect(result.clipSkip).toBe(2);
    expect(result.loras).toEqual([{ name: 'portrait-plus', weight: 0.8 }]);
  });
  it('handles prompts without a negative prompt', () => expect(parseAutomatic1111('one prompt\nSteps: 8, Seed: 1').positivePrompt).toBe('one prompt'));
});
