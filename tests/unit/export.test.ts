import { describe, expect, it } from 'vitest';
import { metadataExport } from '../../src/lib/metadata/parse-file';
import { sanitizeFilename } from '../../src/lib/metadata/utils';
import type { ParsedMetadata } from '../../src/lib/metadata/types';

describe('exports', () => {
  it('creates the stable metadata JSON shape', () => {
    const parsed: ParsedMetadata = { file: { name: 'a.png', safeName: 'a', size: 1, mime: 'image/png', detectedType: 'png', extension: 'png' }, category: 'image', sections: [], normalized: { Width: 1 }, raw: { png: {} }, warnings: [] };
    expect(metadataExport(parsed)).toEqual({ file: parsed.file, category: 'image', metadata: { Width: 1 }, rawMetadata: { png: {} }, warnings: [] });
  });
  it('sanitizes download filenames', () => {
    expect(sanitizeFilename('../../<script>alert(1)</script>.png', '-report')).not.toMatch(/[<>/\\]/);
    expect(sanitizeFilename('...', '.json')).toBe('metadata-file.json');
  });
});
