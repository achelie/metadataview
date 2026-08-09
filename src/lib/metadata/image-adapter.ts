import { parseImage } from './parse-image';
import type { MetadataAdapter, ParsedMetadata } from './types';

export const imageAdapter: MetadataAdapter = {
  supports: (type) => ['jpeg', 'png', 'webp', 'heic', 'tiff', 'gif'].includes(type),
  async parse({ file }): Promise<ParsedMetadata> {
    const image = await parseImage(file);
    const sections = image.sections.map((section) => ({
      id: section.id,
      title: section.title,
      items: section.fields.map((field) => ({
        key: field.key,
        label: field.label,
        path: field.path,
        source: field.source,
        value: field.value,
        displayValue: field.displayValue,
        sensitive: field.sensitive,
        searchValue: field.searchValue,
      })),
    }));
    return {
      file: image.file,
      category: 'image',
      sections,
      normalized: image.legacy,
      raw: { ...image.raw, imageSummary: image.file, container: image.container },
      warnings: image.warnings,
    };
  },
};
