import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { discardToolFile, prepareToolFile, takeToolFile } from '../../src/lib/tool-handoff/store';

const origin = 'https://www.viewexif.com';
const privacyPath = '/image-privacy-checker/';
const image = (name = 'private-photo.jpg') => new File(['original image bytes'], name, {
  type: 'image/jpeg', lastModified: 1_700_000_000_000,
});

beforeEach(() => {
  vi.useFakeTimers();
  discardToolFile();
});
afterEach(() => {
  discardToolFile();
  vi.useRealTimers();
});

describe('in-memory tool file handoff', () => {
  it('delivers the original File reference once and clears its expiry timer', () => {
    const file = image();
    prepareToolFile(file, privacyPath, origin);
    expect(vi.getTimerCount()).toBe(1);
    expect(takeToolFile(privacyPath)).toBe(file);
    expect(takeToolFile(privacyPath)).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not deliver a file to a different tool and discards the stale slot', () => {
    prepareToolFile(image(), privacyPath, origin);
    expect(takeToolFile('/image-metadata-remover/')).toBeNull();
    expect(takeToolFile(privacyPath)).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['/de', '/fr', '/zh-cn'])('accepts a localized destination and retains its exact path: %s', (prefix) => {
    const file = image();
    const path = `${prefix}${privacyPath}`;
    prepareToolFile(file, `${origin}${path}`, origin);
    expect(takeToolFile(path)).toBe(file);
    prepareToolFile(file, path, origin);
    expect(takeToolFile(privacyPath)).toBeNull();
  });

  it('replaces the single slot and ignores cancellation from an older ticket', () => {
    const previous = prepareToolFile(image('previous.jpg'), privacyPath, origin);
    vi.advanceTimersByTime(30_000);
    const current = image('current.jpg');
    const token = prepareToolFile(current, '/image-metadata-remover/', origin);
    expect(token).not.toBe(previous);
    discardToolFile(previous);
    // The previous ticket's deadline must not discard the newer ticket either.
    vi.advanceTimersByTime(60_000);
    expect(takeToolFile('/image-metadata-remover/')).toBe(current);
  });

  it('cancels the current ticket explicitly, with or without its token', () => {
    const token = prepareToolFile(image(), privacyPath, origin);
    discardToolFile(token);
    expect(takeToolFile(privacyPath)).toBeNull();
    prepareToolFile(image(), privacyPath, origin);
    discardToolFile();
    expect(takeToolFile(privacyPath)).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    'https://other.example/image-privacy-checker/',
    '//other.example/image-privacy-checker/',
    'http://www.viewexif.com/image-privacy-checker/',
    '/blog/',
    '/privacy-policy/',
    '/samples/metadata-demo-v1.jpg',
    '/image-privacy-checker/?file=private-photo.jpg',
    'javascript:alert(1)',
  ])('rejects cross-origin, non-tool, and query-bearing destinations: %s', (href) => {
    expect(() => prepareToolFile(image(), href, origin)).toThrow('Unsupported tool destination');
    expect(takeToolFile(privacyPath)).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not replace an accepted ticket when a new destination is rejected', () => {
    const file = image();
    prepareToolFile(file, privacyPath, origin);
    expect(() => prepareToolFile(image('rejected.jpg'), '/blog/', origin)).toThrow();
    expect(takeToolFile(privacyPath)).toBe(file);
  });

  it('expires the unclaimed file after 90 seconds', () => {
    const file = image();
    prepareToolFile(file, privacyPath, origin);
    vi.advanceTimersByTime(89_999);
    expect(takeToolFile(privacyPath)).toBe(file);
    prepareToolFile(file, privacyPath, origin);
    vi.advanceTimersByTime(90_000);
    expect(takeToolFile(privacyPath)).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
});
