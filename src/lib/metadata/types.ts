export type SupportedDocumentType = 'docx' | 'pptx' | 'xlsx';
export type SupportedAudioType = 'mp3' | 'flac' | 'ogg' | 'opus' | 'm4a' | 'aac' | 'wav' | 'wma';
export type SupportedVideoType = 'mp4' | 'mov' | 'mkv' | 'webm' | 'avi' | 'flv' | '3gp' | '3g2';
export type DetectedFileType = SupportedImageType | 'pdf' | SupportedDocumentType | SupportedVideoType | SupportedAudioType | 'unknown';
export type ContainerSignatureType = DetectedFileType | 'zip';
export type MetadataCategory = 'image' | 'pdf' | 'document' | 'video' | 'audio';

export interface FileSummary {
  name: string;
  safeName: string;
  size: number;
  mime: string;
  detectedType: DetectedFileType;
  extension: string;
  lastModified?: string;
}

export interface MetadataItem {
  key: string;
  value: unknown;
  label?: string;
  path?: string;
  source?: string;
  displayValue?: string;
  sensitive?: boolean;
  searchValue?: string;
}

export interface MetadataSection {
  id: string;
  title: string;
  items: MetadataItem[];
}

export interface ParseWarning {
  code: string;
  message: string;
}

export interface ParsedMetadata {
  file: FileSummary;
  category: MetadataCategory;
  sections: MetadataSection[];
  normalized: Record<string, unknown>;
  raw: Record<string, unknown>;
  warnings: ParseWarning[];
}

export interface ParseInput {
  file: File;
  fileType: DetectedFileType;
  warnings: ParseWarning[];
}

export interface MetadataAdapter {
  supports(fileType: DetectedFileType): boolean;
  parse(input: ParseInput): Promise<ParsedMetadata>;
}

export interface DetectionResult {
  type: DetectedFileType;
  mimeType: string;
  extensionType: DetectedFileType;
  signatureType: ContainerSignatureType;
  warnings: ParseWarning[];
}

export type SupportedImageType = 'jpeg' | 'png' | 'webp' | 'heic' | 'tiff' | 'gif';
export type ImageMetadataGroup =
  | 'privacy'
  | 'location'
  | 'camera'
  | 'capture'
  | 'dates'
  | 'author'
  | 'software'
  | 'technical';

export interface ImageMetadataField {
  id: string;
  key: string;
  label: string;
  path: string;
  value: unknown;
  displayValue: string;
  group: ImageMetadataGroup;
  source: string;
  sensitive: boolean;
  searchValue: string;
}

export interface ImageMetadataSection {
  id: ImageMetadataGroup;
  title: string;
  note: string;
  fields: ImageMetadataField[];
}

export interface ImageLocation {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  direction?: number;
  rawLatitude?: unknown;
  rawLongitude?: unknown;
  valid: boolean;
}

export interface ImageFileSummary extends FileSummary {
  declaredMime: string;
  actualFormat: SupportedImageType;
  width: number;
  height: number;
  megapixels: number;
  aspectRatio: string;
  animated: boolean;
  alpha: boolean;
  metadataFieldCount: number;
  warningCount: number;
  hasEmbeddedMetadata: boolean;
}

export interface ImageContainerDetails {
  kind: SupportedImageType;
  chunkCount?: number;
  chunks?: string[];
  hasIcc: boolean;
  hasExif: boolean;
  hasXmp: boolean;
  hasAlpha: boolean;
  animated: boolean;
}

export interface NormalizedImageMetadata {
  file: ImageFileSummary;
  sections: ImageMetadataSection[];
  location: ImageLocation;
  container: ImageContainerDetails;
  raw: Record<string, unknown>;
  warnings: ParseWarning[];
  legacy: Record<string, unknown>;
}
