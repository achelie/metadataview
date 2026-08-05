import type { GenerationMetadata } from '../lib/generators/types';
import { CopyButton } from './CopyButton';
import { JsonViewer } from './JsonViewer';

const settings = (data: GenerationMetadata) => [
  ['Model', data.model], ['Model hash', data.modelHash], ['Seed', data.seed], ['Steps', data.steps], ['CFG scale', data.cfgScale],
  ['Sampler', data.sampler], ['Scheduler', data.scheduler], ['Size', data.width && data.height ? `${data.width} × ${data.height}` : undefined],
  ['Denoising', data.denoisingStrength], ['Clip skip', data.clipSkip], ['Version', data.version],
].filter((item) => item[1] !== undefined);

export function PromptResult({ generation }: { generation: GenerationMetadata }) {
  const found = generation.positivePrompt || generation.negativePrompt || settings(generation).length || generation.workflow;
  if (!found) return <div className="clean-state"><strong>No stored prompt found</strong><p>The image may not contain generation metadata, or its generator uses a field this MVP does not recognize yet.</p></div>;
  return <div className="prompt-result">
    <div className="generator-stamp"><span>Generator detected</span><strong>{generation.source}</strong></div>
    {generation.positivePrompt && <section className="prompt-block"><header><h3>Positive prompt</h3><CopyButton value={generation.positivePrompt} /></header><p>{generation.positivePrompt}</p></section>}
    {generation.negativePrompt && <section className="prompt-block negative"><header><h3>Negative prompt</h3><CopyButton value={generation.negativePrompt} /></header><p>{generation.negativePrompt}</p></section>}
    {settings(generation).length > 0 && <section><h3>Generation settings</h3><dl className="settings-grid">{settings(generation).map(([key, value]) => <div key={String(key)}><dt>{key}</dt><dd>{String(value)}</dd></div>)}</dl></section>}
    {generation.loras.length > 0 && <section><h3>LoRA stack</h3><div className="tag-row">{generation.loras.map((lora) => <span key={lora.name}>{lora.name}{lora.weight !== undefined ? ` · ${lora.weight}` : ''}</span>)}</div></section>}
    {generation.workflow && <JsonViewer title="Workflow JSON" data={generation.workflow} />}
  </div>;
}
