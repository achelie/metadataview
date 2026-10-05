export type ToolEditorialKey = 'metadata' | 'image' | 'document' | 'video' | 'audio' | 'privacy' | 'remover' | 'imageRemover' | 'videoRemover' | 'audioRemover' | 'documentRemover' | 'c2pa' | 'home';

export interface ToolEditorialSection {
  id: string;
  title: string;
  paragraphs: string[];
  fields?: { name: string; meaning: string; caveat: string }[];
  figure?: { src: string; alt: string; caption: string };
}

export type ToolEditorialLocaleCopy = Record<ToolEditorialKey, ToolEditorialSection[]>;
