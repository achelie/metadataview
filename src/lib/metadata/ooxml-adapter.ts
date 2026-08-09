import type { MetadataAdapter, MetadataItem, ParsedMetadata } from './types';
import { inspectOoxmlPackage } from './ooxml-package';
import { makeFileSummary, recordToItems } from './utils';

function customItems(custom: Awaited<ReturnType<typeof inspectOoxmlPackage>>['custom']): MetadataItem[] {
  return custom.map((property, index) => ({
    key: `CustomProperty${index + 1}`,
    label: property.name,
    path: `custom[${index}]`,
    source: 'OOXML custom properties',
    value: property.value,
    displayValue: String(property.value ?? ''),
    searchValue: `${property.name} ${property.type} ${String(property.value ?? '')}`,
  }));
}

export const ooxmlAdapter: MetadataAdapter = {
  supports: (type) => type === 'docx' || type === 'pptx' || type === 'xlsx',
  async parse({ file, fileType, warnings }): Promise<ParsedMetadata> {
    const inspection = await inspectOoxmlPackage(file);
    const normalized: Record<string, unknown> = {
      ...inspection.core,
      ...inspection.application,
      ...inspection.package,
      DocumentType: inspection.type.toUpperCase(),
      CustomPropertyCount: inspection.custom.length,
    };
    const summary = makeFileSummary(file, fileType);
    summary.mime = inspection.mime;
    return {
      file: summary,
      category: 'document',
      sections: [
        { id: 'document', title: 'Document properties', items: recordToItems(inspection.core) },
        { id: 'application', title: 'Application statistics', items: recordToItems(inspection.application) },
        { id: 'custom', title: 'Custom properties', items: customItems(inspection.custom) },
        { id: 'package', title: 'Package details', items: recordToItems(inspection.package) },
      ].filter((section) => section.items.length > 0),
      normalized,
      raw: {
        core: inspection.core,
        application: inspection.application,
        custom: inspection.custom,
        package: inspection.package,
      },
      warnings: [...warnings, ...inspection.warnings],
    };
  },
};
