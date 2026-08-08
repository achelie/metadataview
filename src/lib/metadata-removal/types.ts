import type { DetectedFileType, MetadataCategory } from '../metadata/types';

export type MetadataRemovalScope = 'all' | 'image' | 'video' | 'audio' | 'document';
export type MetadataCleanupEngine = 'exiftool' | 'taglib' | 'ooxml-zip' | 'qpdf' | 'riff' | 'flv-amf';
export type MetadataCleanupStatus = 'verified' | 'verified-residual' | 'incomplete' | 'blocked';
export type MetadataFieldDisposition = 'removed' | 'preserved' | 'residual';

export interface MetadataRemovalField {
  id: string;
  label: string;
  path: string;
  source: string;
  displayValue: string;
  disposition: MetadataFieldDisposition;
  reason: string;
}

export interface MetadataOutputCheck {
  id: string;
  label: string;
  status: 'passed' | 'warning' | 'failed';
  message: string;
}

export interface MetadataRemovalReport {
  schemaVersion: '1.0';
  type: DetectedFileType;
  category: MetadataCategory;
  engine: MetadataCleanupEngine;
  read: number;
  eligible: number;
  preserved: number;
  excludedEnvironment: number;
  signed: boolean;
  warnings: string[];
}

export interface MetadataCleanupResult {
  blob: Blob;
  fileName: string;
  mime: string;
  engine: MetadataCleanupEngine;
  status: MetadataCleanupStatus;
  beforeSize: number;
  afterSize: number;
  removed: MetadataRemovalField[];
  preserved: MetadataRemovalField[];
  residual: MetadataRemovalField[];
  checks: MetadataOutputCheck[];
  warnings: string[];
}

export interface MetadataCleanupReceipt {
  schemaVersion: '1.0';
  generatedAt: string;
  source: { name: string; type: DetectedFileType; size: number };
  output: { name: string; type: DetectedFileType; size: number; mime: string };
  engine: MetadataCleanupEngine;
  status: MetadataCleanupStatus;
  counts: { removed: number; preserved: number; residual: number };
  checks: MetadataOutputCheck[];
  warnings: string[];
}

export interface MetadataWorkerCleanup {
  data: ArrayBuffer;
  mime: string;
  engine: MetadataCleanupEngine;
  warnings: string[];
}
