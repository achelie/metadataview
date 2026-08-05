import { z } from 'zod';
import { MetadataError } from '../metadata/errors';
import type { GenerationMetadata, LoraInfo } from './types';

const MAX_COMFY_NODES = 5_000;
const NodeSchema = z.looseObject({ class_type: z.string().optional(), type: z.string().optional(), inputs: z.record(z.string(), z.unknown()).optional(), widgets_values: z.array(z.unknown()).optional() });
const PromptSchema = z.record(z.string(), NodeSchema);
type ComfyNode = z.infer<typeof NodeSchema>;
type PromptGraph = z.infer<typeof PromptSchema>;

function parseJson(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); }
  catch (error) { throw new MetadataError('INVALID_WORKFLOW_JSON', 'The embedded ComfyUI JSON is invalid.', { cause: error }); }
}

function connectionId(value: unknown): string | undefined {
  return Array.isArray(value) && (typeof value[0] === 'string' || typeof value[0] === 'number') ? String(value[0]) : undefined;
}

function className(node: ComfyNode | undefined): string {
  return String(node?.class_type ?? node?.type ?? '');
}

function findText(graph: PromptGraph, start: unknown, visited = new Set<string>(), traversed = { count: 0 }): string | undefined {
  if (typeof start === 'string' && !graph[start]) return start;
  const id = connectionId(start) ?? (typeof start === 'string' ? start : undefined);
  if (!id || visited.has(id)) return undefined;
  visited.add(id);
  traversed.count += 1;
  if (traversed.count > MAX_COMFY_NODES) throw new MetadataError('WORKFLOW_TOO_LARGE', 'ComfyUI traversal exceeded 5,000 nodes.');
  const node = graph[id];
  if (!node) return undefined;
  const inputs = node.inputs ?? {};
  if (/CLIPTextEncode/i.test(className(node)) && typeof inputs.text === 'string') return inputs.text;
  if (typeof inputs.text === 'string') return inputs.text;
  for (const input of Object.values(inputs)) {
    const text = findText(graph, input, visited, traversed);
    if (text) return text;
  }
  return undefined;
}

function findModel(graph: PromptGraph, start: unknown, visited = new Set<string>()): string | undefined {
  const id = connectionId(start);
  if (!id || visited.has(id)) return undefined;
  visited.add(id);
  const node = graph[id];
  if (!node) return undefined;
  const inputs = node.inputs ?? {};
  for (const key of ['ckpt_name', 'model_name', 'unet_name']) if (typeof inputs[key] === 'string') return inputs[key];
  for (const value of Object.values(inputs)) {
    const model = findModel(graph, value, visited);
    if (model) return model;
  }
  return undefined;
}

function findLoras(graph: PromptGraph): LoraInfo[] {
  const seen = new Set<string>();
  const loras: LoraInfo[] = [];
  for (const node of Object.values(graph)) {
    if (!/lora/i.test(className(node))) continue;
    const inputs = node.inputs ?? {};
    const name = [inputs.lora_name, inputs.lora, inputs.name].find((value) => typeof value === 'string') as string | undefined;
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const weight = [inputs.strength_model, inputs.strength_clip, inputs.weight].find((value) => typeof value === 'number') as number | undefined;
    loras.push({ name, weight });
  }
  return loras;
}

function workflowToPrompt(workflow: unknown): PromptGraph | null {
  if (!workflow || typeof workflow !== 'object' || !Array.isArray((workflow as { nodes?: unknown }).nodes)) return null;
  const nodes = (workflow as { nodes: Array<Record<string, unknown>> }).nodes;
  if (nodes.length > MAX_COMFY_NODES) throw new MetadataError('WORKFLOW_TOO_LARGE', 'ComfyUI workflow contains more than 5,000 nodes.');
  const graph: Record<string, ComfyNode> = {};
  for (const node of nodes) {
    const id = String(node.id ?? '');
    if (!id) continue;
    graph[id] = { type: typeof node.type === 'string' ? node.type : undefined, widgets_values: Array.isArray(node.widgets_values) ? node.widgets_values : undefined, inputs: {} };
  }
  return graph;
}

export function parseComfyUi(metadata: Record<string, unknown>): GenerationMetadata {
  const promptValue = parseJson(metadata.prompt);
  const workflowValue = parseJson(metadata.workflow);
  let graph: PromptGraph | null = null;
  if (promptValue && typeof promptValue === 'object') {
    const parsed = PromptSchema.safeParse(promptValue);
    if (!parsed.success) throw new MetadataError('INVALID_WORKFLOW_JSON', 'The ComfyUI prompt graph has an unexpected structure.');
    graph = parsed.data;
  } else graph = workflowToPrompt(workflowValue);
  if (!graph) throw new MetadataError('INVALID_WORKFLOW_JSON', 'No ComfyUI prompt graph was found.');
  const nodeIds = Object.keys(graph);
  if (nodeIds.length > MAX_COMFY_NODES) throw new MetadataError('WORKFLOW_TOO_LARGE', 'ComfyUI workflow contains more than 5,000 nodes.');
  const samplerEntries = Object.entries(graph).filter(([, node]) => /KSampler(?:Advanced)?/i.test(className(node)));
  const sampler = samplerEntries[0]?.[1];
  const inputs = sampler?.inputs ?? {};
  const workflow = workflowValue && typeof workflowValue === 'object' ? workflowValue as Record<string, unknown> : graph as Record<string, unknown>;
  return {
    source: 'comfyui',
    positivePrompt: findText(graph, inputs.positive),
    negativePrompt: findText(graph, inputs.negative),
    model: findModel(graph, inputs.model),
    sampler: typeof inputs.sampler_name === 'string' ? inputs.sampler_name : undefined,
    scheduler: typeof inputs.scheduler === 'string' ? inputs.scheduler : undefined,
    seed: typeof inputs.seed === 'number' || typeof inputs.seed === 'string' ? String(inputs.seed) : undefined,
    steps: typeof inputs.steps === 'number' ? inputs.steps : undefined,
    cfgScale: typeof inputs.cfg === 'number' ? inputs.cfg : undefined,
    denoisingStrength: typeof inputs.denoise === 'number' ? inputs.denoise : undefined,
    loras: findLoras(graph), workflow,
    rawMetadata: { ...metadata, nodeCount: nodeIds.length, kSamplerCount: samplerEntries.length },
  };
}

export const comfyUiAdapter = {
  id: 'comfyui' as const,
  canParse: (metadata: Record<string, unknown>) => Boolean(metadata.workflow || (metadata.prompt && /^\s*\{/.test(String(metadata.prompt)))),
  parse: parseComfyUi,
};
