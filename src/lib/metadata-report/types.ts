import type { DetectedFileType, MetadataCategory, ParseWarning } from '../metadata/types';

export interface MetadataReportField {
  id: string;
  key: string;
  label: string;
  path: string;
  source: string;
  value: unknown;
  displayValue: string;
  sensitive: boolean;
  searchValue: string;
  origin: 'exiftool' | 'parser' | 'evidence';
  groupPath?: string;
  tagId?: string | number;
  format?: string;
  numericValue?: unknown;
  binarySummary?: { bytes?: number; note: string };
  alternates?: Array<{
    origin: 'exiftool' | 'parser';
    source: string;
    path: string;
    value: unknown;
    displayValue: string;
  }>;
}

export interface MetadataReportSection {
  id: string;
  title: string;
  note: string;
  fields: MetadataReportField[];
}

export interface MetadataReportFact {
  id: string;
  label: string;
  value: string;
}

export interface MetadataReportFile {
  name: string;
  safeName: string;
  size: number;
  mime: string;
  detectedType: DetectedFileType;
  extension: string;
  lastModified?: string;
  declaredMime?: string;
  actualFormat?: string;
  width?: number;
  height?: number;
  megapixels?: number;
  aspectRatio?: string;
  animated?: boolean;
  alpha?: boolean;
  metadataFieldCount?: number;
  hasEmbeddedMetadata?: boolean;
}

export interface FileEvidence {
  sha256: string;
  md5: string;
  headerBytes: number[];
  headerHex: string;
  headerAscii: string;
}

export type MetadataInspectionMode = 'standard' | 'embedded';
export type MetadataEngineStatus = 'complete' | 'failed';

export interface MetadataReportEngine {
  id: 'core' | 'exiftool';
  label: string;
  version?: string;
  status: MetadataEngineStatus;
  mode: 'core' | MetadataInspectionMode;
  fieldCount: number;
  truncated: boolean;
  message?: string;
}

export interface MetadataReportSourceStat {
  origin: MetadataReportField['origin'];
  fieldCount: number;
}

export interface ExifToolInspection {
  schemaVersion: '1.0';
  mode: MetadataInspectionMode;
  version?: string;
  fields: MetadataReportField[];
  raw: Record<string, unknown>;
  warnings: ParseWarning[];
  truncated: boolean;
}

export interface MetadataReport {
  schemaVersion: '1.1';
  generatedAt: string;
  category: MetadataCategory;
  file: MetadataReportFile;
  facts: MetadataReportFact[];
  readableSections: MetadataReportSection[];
  nativeSections: MetadataReportSection[];
  warnings: ParseWarning[];
  evidence: FileEvidence;
  engines: MetadataReportEngine[];
  sourceStats: MetadataReportSourceStat[];
  normalized: Record<string, unknown>;
  raw: Record<string, unknown>;
}

export interface MetadataReportExport {
  schemaVersion: '1.1';
  generatedAt: string;
  category: MetadataCategory;
  file: MetadataReportFile;
  facts: MetadataReportFact[];
  readableSections: MetadataReportSection[];
  nativeSections: MetadataReportSection[];
  warnings: ParseWarning[];
  evidence: FileEvidence;
  engines: MetadataReportEngine[];
  sourceStats: MetadataReportSourceStat[];
  normalizedMetadata: Record<string, unknown>;
  rawMetadata: Record<string, unknown>;
}
