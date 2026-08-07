import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { tools } from '../../src/content/tools';

describe('document viewer route migration', () => {
  it('uses the new document canonical and keeps the old PDF paths as permanent redirects', async () => {
    expect(tools.document?.path).toBe('/document-metadata-viewer/');
    expect(tools.document?.allowedTypes).toEqual(['pdf', 'docx', 'pptx', 'xlsx']);
    const redirects = await readFile('public/_redirects', 'utf8');
    expect(redirects).toContain('/pdf-metadata-viewer /document-metadata-viewer/ 301');
    expect(redirects).toContain('/pdf-metadata-viewer/ /document-metadata-viewer/ 301');
    await expect(access('src/pages/document-metadata-viewer.astro', constants.F_OK)).resolves.toBeUndefined();
    await expect(access('src/pages/pdf-metadata-viewer.astro', constants.F_OK)).rejects.toBeDefined();
  });
});
