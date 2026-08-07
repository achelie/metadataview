import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';

export type OoxmlFixtureType = 'docx' | 'pptx' | 'xlsx';

interface FixtureOptions {
  title?: string;
  author?: string;
  application?: string;
  company?: string;
  customName?: string;
  customValue?: string;
  bodyText?: string;
  slides?: number;
  notes?: number;
  worksheets?: number;
  macroEnabled?: boolean;
  customXml?: string;
  contentTypesXml?: string;
  appXml?: string;
}

const definitions: Record<OoxmlFixtureType, { path: string; contentType: string; macroType: string; mime: string }> = {
  docx: {
    path: 'word/document.xml',
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml',
    macroType: 'application/vnd.ms-word.document.macroEnabled.main+xml',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  pptx: {
    path: 'ppt/presentation.xml',
    contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml',
    macroType: 'application/vnd.ms-powerpoint.presentation.macroEnabled.main+xml',
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
  xlsx: {
    path: 'xl/workbook.xml',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml',
    macroType: 'application/vnd.ms-excel.sheet.macroEnabled.main+xml',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
};

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function ooxmlMime(type: OoxmlFixtureType): string {
  return definitions[type].mime;
}

export async function ooxmlFixture(type: OoxmlFixtureType, options: FixtureOptions = {}): Promise<Uint8Array<ArrayBuffer>> {
  const definition = definitions[type];
  const writer = new ZipWriter(new BlobWriter(definition.mime), { useWebWorkers: false });
  const add = (path: string, text: string) => writer.add(path, new TextReader(text), { useWebWorkers: false });
  const contentType = options.macroEnabled ? definition.macroType : definition.contentType;
  const contentTypes = options.contentTypesXml ?? `<?xml version="1.0" encoding="UTF-8"?>
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Override PartName="/${definition.path}" ContentType="${contentType}"/>
      <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
      <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
      <Override PartName="/docProps/custom.xml" ContentType="application/vnd.openxmlformats-officedocument.custom-properties+xml"/>
    </Types>`;
  const core = `<?xml version="1.0" encoding="UTF-8"?>
    <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      <dc:title>${escapeXml(options.title ?? `${type.toUpperCase()} fixture`)}</dc:title>
      <dc:creator>${escapeXml(options.author ?? 'Ada Example')}</dc:creator>
      <cp:lastModifiedBy>Grace Example</cp:lastModifiedBy><cp:revision>7</cp:revision>
      <dcterms:created xsi:type="dcterms:W3CDTF">2026-08-07T01:02:03Z</dcterms:created>
      <dcterms:modified xsi:type="dcterms:W3CDTF">2026-08-07T04:05:06Z</dcterms:modified>
    </cp:coreProperties>`;
  const app = options.appXml ?? `<?xml version="1.0" encoding="UTF-8"?>
    <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
      <Application>${escapeXml(options.application ?? 'Fixture Office')}</Application><AppVersion>16.0300</AppVersion>
      <Company>${escapeXml(options.company ?? 'Example Studio')}</Company><Manager>Lin Example</Manager>
      <Pages>4</Pages><Words>321</Words><Characters>1900</Characters>
      <Slides>${options.slides ?? 2}</Slides><Notes>${options.notes ?? 1}</Notes><HiddenSlides>0</HiddenSlides>
    </Properties>`;
  const custom = options.customXml ?? `<?xml version="1.0" encoding="UTF-8"?>
    <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
      <property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="2" name="${escapeXml(options.customName ?? 'Review status')}"><vt:lpwstr>${escapeXml(options.customValue ?? 'Approved')}</vt:lpwstr></property>
    </Properties>`;

  await add('[Content_Types].xml', contentTypes);
  await add(definition.path, `<document>${escapeXml(options.bodyText ?? 'BODY-CONTENT-MUST-NOT-LEAK')}</document>`);
  await add('docProps/core.xml', core);
  await add('docProps/app.xml', app);
  await add('docProps/custom.xml', custom);
  if (type === 'pptx') {
    for (let index = 1; index <= (options.slides ?? 2); index += 1) await add(`ppt/slides/slide${index}.xml`, `<slide>${index}</slide>`);
    for (let index = 1; index <= (options.notes ?? 1); index += 1) await add(`ppt/notesSlides/notesSlide${index}.xml`, `<notes>${index}</notes>`);
  }
  if (type === 'xlsx') {
    for (let index = 1; index <= (options.worksheets ?? 3); index += 1) await add(`xl/worksheets/sheet${index}.xml`, `<worksheet>${index}</worksheet>`);
  }
  const blob = await writer.close();
  return new Uint8Array(await blob.arrayBuffer());
}

export async function plainZipFixture(): Promise<Uint8Array<ArrayBuffer>> {
  const writer = new ZipWriter(new BlobWriter('application/zip'), { useWebWorkers: false });
  await writer.add('notes.txt', new TextReader('not an Office document'), { useWebWorkers: false });
  const blob = await writer.close();
  return new Uint8Array(await blob.arrayBuffer());
}
