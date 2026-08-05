import { MetadataError } from './errors';
import type { MetadataAdapter, ParsedMetadata } from './types';
import { makeFileSummary, recordToItems, toJsonSafe } from './utils';

export const pdfAdapter: MetadataAdapter = {
  supports: (type) => type === 'pdf',
  async parse({ file, fileType, warnings }): Promise<ParsedMetadata> {
    try {
      const [pdfjs, workerModule] = await Promise.all([
        import('pdfjs-dist/legacy/build/pdf.mjs'),
        import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
      ]);
      pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default;
      const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
      const document = await task.promise;
      const metadata = await document.getMetadata().catch(() => ({ info: {}, metadata: null }));
      const info = toJsonSafe(metadata.info) as Record<string, unknown>;
      const custom = metadata.metadata ? { RawXmp: toJsonSafe(metadata.metadata.getRaw()) } : {};
      const normalized = { ...info, PageCount: document.numPages, PDFVersion: String(info.PDFFormatVersion ?? ''), Encrypted: false, CustomMetadata: custom };
      await task.destroy();
      return {
        file: makeFileSummary(file, fileType), category: 'pdf',
        sections: [
          { id: 'document', title: 'Document properties', items: recordToItems(Object.fromEntries(Object.entries(normalized).filter(([key]) => key !== 'CustomMetadata'))) },
          { id: 'custom', title: 'Custom metadata', items: recordToItems(custom) },
        ].filter((section) => section.items.length > 0),
        normalized, raw: { info, custom }, warnings,
      };
    } catch (error) {
      if (import.meta.env.DEV) console.error('PDF metadata adapter failed', error);
      if (error instanceof Error && /password/i.test(error.message)) throw new MetadataError('ENCRYPTED_PDF', 'This PDF is password-protected. The tool will not try to bypass it.', { cause: error });
      throw new MetadataError('CORRUPTED_FILE', 'The PDF metadata could not be read.', { cause: error instanceof Error ? error : undefined });
    }
  },
};
