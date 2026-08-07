import { BlobReader, TextWriter, ZipReader, type FileEntry } from '@zip.js/zip.js';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { MetadataError } from './errors';
import type { ParseWarning, SupportedDocumentType } from './types';

const MAX_ENTRIES = 10_000;
const MAX_PROPERTY_XML_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_PROPERTY_XML_BYTES = 8 * 1024 * 1024;
const PROPERTY_PATHS = new Set([
  '[content_types].xml',
  'docprops/core.xml',
  'docprops/app.xml',
  'docprops/custom.xml',
]);

const TYPE_DEFINITIONS: Record<SupportedDocumentType, { mainPart: string; contentType: string; mime: string }> = {
  docx: {
    mainPart: '/word/document.xml',
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  pptx: {
    mainPart: '/ppt/presentation.xml',
    contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml',
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
  xlsx: {
    mainPart: '/xl/workbook.xml',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
};

const CORE_FIELDS: Record<string, string> = {
  title: 'Title',
  subject: 'Subject',
  creator: 'Author',
  keywords: 'Keywords',
  description: 'Description',
  lastModifiedBy: 'LastModifiedBy',
  revision: 'Revision',
  created: 'Created',
  modified: 'Modified',
  category: 'Category',
  contentStatus: 'ContentStatus',
  identifier: 'Identifier',
  language: 'Language',
  version: 'Version',
};

const APP_FIELDS = new Set([
  'Application', 'AppVersion', 'Company', 'Manager', 'Template', 'TotalTime',
  'Pages', 'Words', 'Characters', 'CharactersWithSpaces', 'Lines', 'Paragraphs',
  'Slides', 'Notes', 'HiddenSlides', 'MMClips', 'PresentationFormat', 'DocSecurity',
  'ScaleCrop', 'LinksUpToDate', 'SharedDoc', 'HyperlinksChanged', 'DigSig',
]);

export interface OoxmlCustomProperty {
  name: string;
  type: string;
  value: unknown;
  propertyId?: string;
}

export interface OoxmlPackageInspection {
  type: SupportedDocumentType;
  mime: string;
  core: Record<string, unknown>;
  application: Record<string, unknown>;
  custom: OoxmlCustomProperty[];
  package: Record<string, unknown>;
  warnings: ParseWarning[];
}

const inspectionCache = new WeakMap<File, Promise<OoxmlPackageInspection>>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function decodeXmlText(value: string): string {
  return value
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&amp;/g, '&')
    .replace(/&#x([0-9a-f]{1,6});/gi, (match, digits: string) => {
      const code = Number.parseInt(digits, 16);
      return code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : match;
    })
    .replace(/&#([0-9]{1,7});/g, (match, digits: string) => {
      const code = Number.parseInt(digits, 10);
      return code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : match;
    });
}

function scalar(value: unknown): unknown {
  if (typeof value === 'string') return decodeXmlText(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (isRecord(value) && '#text' in value) return scalar(value['#text']);
  return undefined;
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
  processEntities: false,
  ignoreDeclaration: true,
  ignorePiTags: true,
  maxNestedTags: 64,
  isArray: (tagName) => tagName === 'Override' || tagName === 'property',
});

function parseXml(xml: string, path: string): Record<string, unknown> {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) {
    throw new MetadataError('CORRUPTED_FILE', `${path} contains a document type or entity declaration, so it was not parsed.`);
  }
  const validation = XMLValidator.validate(xml, { allowBooleanAttributes: false });
  if (validation !== true) throw new MetadataError('CORRUPTED_FILE', `${path} is not valid XML.`);
  const parsed = xmlParser.parse(xml) as unknown;
  if (!isRecord(parsed)) throw new MetadataError('CORRUPTED_FILE', `${path} did not contain an XML object.`);
  return parsed;
}

function root(record: Record<string, unknown>): Record<string, unknown> {
  const first = Object.values(record).find(isRecord);
  return first ?? {};
}

function parseCore(xml: string): Record<string, unknown> {
  const properties = root(parseXml(xml, 'docProps/core.xml'));
  const output: Record<string, unknown> = {};
  for (const [xmlKey, reportKey] of Object.entries(CORE_FIELDS)) {
    const value = scalar(properties[xmlKey]);
    if (value !== undefined && value !== '') output[reportKey] = value;
  }
  return output;
}

function parseApplication(xml: string): Record<string, unknown> {
  const properties = root(parseXml(xml, 'docProps/app.xml'));
  const output: Record<string, unknown> = {};
  for (const key of APP_FIELDS) {
    const value = scalar(properties[key]);
    if (value !== undefined && value !== '') output[key] = value;
  }
  return output;
}

function typedCustomValue(type: string, value: unknown): unknown {
  const text = scalar(value);
  if (typeof text !== 'string') return text;
  if (/^(bool)$/i.test(type)) return /^true|1$/i.test(text);
  if (/^(i1|i2|i4|i8|int|ui1|ui2|ui4|ui8|uint|r4|r8|decimal)$/i.test(type)) {
    const number = Number(text);
    if (Number.isFinite(number)) return number;
  }
  return text;
}

function parseCustom(xml: string): OoxmlCustomProperty[] {
  const properties = root(parseXml(xml, 'docProps/custom.xml'));
  return asArray(properties.property).flatMap((candidate) => {
    if (!isRecord(candidate)) return [];
    const name = scalar(candidate['@_name']);
    if (typeof name !== 'string' || !name.trim()) return [];
    const typedEntry = Object.entries(candidate).find(([key]) => !key.startsWith('@_') && key !== '#text');
    if (!typedEntry) return [];
    const [type, rawValue] = typedEntry;
    const propertyId = scalar(candidate['@_pid']);
    return [{
      name: name.slice(0, 512),
      type,
      value: typedCustomValue(type, rawValue),
      propertyId: propertyId === undefined ? undefined : String(propertyId),
    }];
  });
}

function detectPackageType(contentTypesXml: string, entryNames: Set<string>): { type: SupportedDocumentType; mime: string } {
  const types = root(parseXml(contentTypesXml, '[Content_Types].xml'));
  const overrides = asArray(types.Override).filter(isRecord);
  const contentTypes = overrides.map((override) => String(scalar(override['@_ContentType']) ?? ''));
  if (contentTypes.some((value) => /macroenabled/i.test(value))) {
    throw new MetadataError('UNSUPPORTED_OFFICE_FORMAT', 'Macro-enabled Office files are not supported. Use a DOCX, PPTX, or XLSX package without macros.');
  }
  const matches = (Object.entries(TYPE_DEFINITIONS) as Array<[SupportedDocumentType, (typeof TYPE_DEFINITIONS)[SupportedDocumentType]]>)
    .filter(([, definition]) => overrides.some((override) => {
      const partName = String(scalar(override['@_PartName']) ?? '').toLowerCase();
      const contentType = String(scalar(override['@_ContentType']) ?? '').toLowerCase();
      return partName === definition.mainPart.toLowerCase() && contentType === definition.contentType.toLowerCase();
    }))
    .filter(([, definition]) => entryNames.has(definition.mainPart.slice(1).toLowerCase()));
  if (matches.length !== 1) {
    throw new MetadataError('UNSUPPORTED_OFFICE_FORMAT', 'This ZIP is not an unambiguous DOCX, PPTX, or XLSX document package.');
  }
  const [type, definition] = matches[0]!;
  return { type, mime: definition.mime };
}

function dangerousPath(path: string): boolean {
  return path.includes('\\') || path.includes('\0') || path.startsWith('/') || path.split('/').some((part) => part === '..');
}

async function inspect(file: File): Promise<OoxmlPackageInspection> {
  const reader = new ZipReader(new BlobReader(file), {
    useWebWorkers: false,
    strictness: 'strict',
    checkAmbiguity: true,
  });
  const selected = new Map<string, FileEntry>();
  const names = new Set<string>();
  let entryCount = 0;
  let propertyXmlBytes = 0;
  let mediaEntries = 0;
  let relationshipEntries = 0;
  let embeddedObjectEntries = 0;
  let slideEntries = 0;
  let noteEntries = 0;
  let worksheetEntries = 0;

  try {
    for await (const entry of reader.getEntriesGenerator({ strictness: 'strict', checkAmbiguity: true, maxAppendedDataSize: 0 })) {
      entryCount += 1;
      if (entryCount > MAX_ENTRIES) throw new MetadataError('OOXML_PACKAGE_LIMIT', `The document contains more than ${MAX_ENTRIES.toLocaleString('en-US')} package entries.`);
      const path = entry.filename;
      if (dangerousPath(path)) throw new MetadataError('CORRUPTED_FILE', 'The Office package contains an unsafe entry path.');
      const normalized = path.toLowerCase();
      if (names.has(normalized)) throw new MetadataError('CORRUPTED_FILE', 'The Office package contains duplicate or ambiguous entry names.');
      names.add(normalized);
      if (entry.encrypted) throw new MetadataError('ENCRYPTED_OFFICE', 'This Office package contains encrypted entries. The viewer will not try to bypass the password.');
      if (entry.directory) continue;
      if (/^(word|ppt|xl)\/media\//.test(normalized)) mediaEntries += 1;
      if (/(^|\/)_{0,1}rels\/|\.rels$/.test(normalized)) relationshipEntries += 1;
      if (/(^|\/)(embeddings|oleobjects)\//.test(normalized)) embeddedObjectEntries += 1;
      if (/^ppt\/slides\/slide\d+\.xml$/.test(normalized)) slideEntries += 1;
      if (/^ppt\/notesslides\/notesslide\d+\.xml$/.test(normalized)) noteEntries += 1;
      if (/^xl\/worksheets\/sheet\d+\.xml$/.test(normalized)) worksheetEntries += 1;
      if (!PROPERTY_PATHS.has(normalized)) continue;
      if (entry.uncompressedSize > MAX_PROPERTY_XML_BYTES) throw new MetadataError('OOXML_PACKAGE_LIMIT', `${path} is larger than the 2 MB property XML limit.`);
      propertyXmlBytes += entry.uncompressedSize;
      if (propertyXmlBytes > MAX_TOTAL_PROPERTY_XML_BYTES) throw new MetadataError('OOXML_PACKAGE_LIMIT', 'The document property XML exceeds the 8 MB inspection limit.');
      selected.set(normalized, entry);
    }

    const contentTypesEntry = selected.get('[content_types].xml');
    if (!contentTypesEntry) throw new MetadataError('UNSUPPORTED_OFFICE_FORMAT', 'This ZIP does not contain an Office Open XML content type manifest.');
    const readEntry = (entry: FileEntry) => entry.getData(new TextWriter('utf-8'), {
      useWebWorkers: false,
      strictness: 'strict',
      checkAmbiguity: true,
      checkSignature: true,
      checkOverlappingEntry: true,
    });
    const contentTypesXml = await readEntry(contentTypesEntry);
    const detected = detectPackageType(contentTypesXml, names);
    const warnings: ParseWarning[] = [];

    const readOptional = async <T>(path: string, parser: (xml: string) => T, fallback: T): Promise<T> => {
      const entry = selected.get(path);
      if (!entry) {
        warnings.push({ code: 'OOXML_PROPERTIES_MISSING', message: `${path} is not present in this document package.` });
        return fallback;
      }
      try {
        return parser(await readEntry(entry));
      } catch (error) {
        warnings.push({ code: 'OOXML_PROPERTY_XML_INVALID', message: error instanceof Error ? error.message : `${path} could not be parsed.` });
        return fallback;
      }
    };

    const [core, application, custom] = await Promise.all([
      readOptional('docprops/core.xml', parseCore, {}),
      readOptional('docprops/app.xml', parseApplication, {}),
      readOptional('docprops/custom.xml', parseCustom, []),
    ]);
    const packageDetails: Record<string, unknown> = {
      PackageFormat: 'Office Open XML',
      EntryCount: entryCount,
      PropertyXmlBytes: propertyXmlBytes,
      RelationshipEntries: relationshipEntries,
      EmbeddedMediaEntries: mediaEntries,
      EmbeddedObjectEntries: embeddedObjectEntries,
    };
    if (detected.type === 'docx' && application.Pages !== undefined) packageDetails.StoredPageCount = application.Pages;
    if (detected.type === 'pptx') {
      packageDetails.SlideCount = slideEntries;
      packageDetails.NotesPageCount = noteEntries;
    }
    if (detected.type === 'xlsx') packageDetails.WorksheetCount = worksheetEntries;
    return { ...detected, core, application, custom, package: packageDetails, warnings };
  } catch (error) {
    if (error instanceof MetadataError) throw error;
    throw new MetadataError('CORRUPTED_FILE', 'The Office Open XML package could not be read safely.', { cause: error instanceof Error ? error : undefined });
  } finally {
    await reader.close().catch(() => undefined);
  }
}

export function inspectOoxmlPackage(file: File): Promise<OoxmlPackageInspection> {
  const cached = inspectionCache.get(file);
  if (cached) return cached;
  const pending = inspect(file);
  inspectionCache.set(file, pending);
  return pending;
}
