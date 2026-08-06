import { expect, test, type Page } from '@playwright/test';
import { deflate } from 'pako';

const pngSignature = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);

function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data = Buffer.alloc(0)): Buffer {
  const typeBytes = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([length, typeBytes, data, crc]);
}

function png(text?: [string, string]): Buffer {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(1, 0); ihdr.writeUInt32BE(1, 4); ihdr.set([8, 6, 0, 0, 0], 8);
  const scanline = Buffer.from([0, 239, 106, 56, 255]);
  const parts = [pngSignature, chunk('IHDR', ihdr)];
  if (text) parts.push(chunk('tEXt', Buffer.from(`${text[0]}\0${text[1]}`, 'latin1')));
  parts.push(chunk('IDAT', Buffer.from(deflate(scanline))), chunk('IEND'));
  return Buffer.concat(parts);
}

function pdf(): Buffer {
  const objects = [null, '<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 100 100] /Contents 4 0 R >>', '<< /Length 0 >>\nstream\n\nendstream', '<< /Title (Fixture PDF) /Author (Ada Example) >>'];
  let output = '%PDF-1.4\n'; const offsets = [0];
  for (let index = 1; index < objects.length; index += 1) { offsets[index] = Buffer.byteLength(output); output += `${index} 0 obj\n${objects[index]}\nendobj\n`; }
  const xref = Buffer.byteLength(output); output += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let index = 1; index < objects.length; index += 1) output += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  return Buffer.from(`${output}trailer\n<< /Size ${objects.length} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${xref}\n%%EOF`);
}

function mp3(): Buffer {
  const syncSafe = (value: number) => Buffer.from([(value >> 21) & 127, (value >> 14) & 127, (value >> 7) & 127, value & 127]);
  const id3Frame = (id: string, text: string) => { const data = Buffer.concat([Buffer.from([3]), Buffer.from(text)]); const size = Buffer.alloc(4); size.writeUInt32BE(data.length); return Buffer.concat([Buffer.from(id), size, Buffer.alloc(2), data]); };
  const frames = Buffer.concat([id3Frame('TIT2', 'Fixture Song'), id3Frame('TPE1', 'Ada Example')]);
  return Buffer.concat([Buffer.from('ID3'), Buffer.from([3, 0, 0]), syncSafe(frames.length), frames, Buffer.from([0xff, 0xfb, 0x90, 0x64]), Buffer.alloc(413)]);
}

function mp4(): Buffer {
  const box = (type: string, data: Buffer) => { const size = Buffer.alloc(4); size.writeUInt32BE(8 + data.length); return Buffer.concat([size, Buffer.from(type), data]); };
  const ftyp = box('ftyp', Buffer.concat([Buffer.from('isom'), Buffer.from([0, 0, 2, 0]), Buffer.from('isomiso2mp41')]));
  const movieHeader = Buffer.alloc(100); movieHeader.writeUInt32BE(1_000, 12); movieHeader.writeUInt32BE(1_000, 16); movieHeader.writeUInt32BE(0x00010000, 20); movieHeader.writeUInt16BE(0x0100, 24); movieHeader.writeUInt32BE(0x00010000, 36); movieHeader.writeUInt32BE(0x00010000, 52); movieHeader.writeUInt32BE(0x40000000, 68); movieHeader.writeUInt32BE(1, 96);
  return Buffer.concat([ftyp, box('moov', box('mvhd', movieHeader))]);
}

async function upload(page: Page, name: string, buffer: Buffer, mimeType = 'image/png') {
  const input = page.locator('input[type=file]');
  await input.waitFor({ state: 'attached' });
  const island = input.locator('xpath=ancestor::astro-island[1]');
  if (await island.count()) await expect(island).not.toHaveAttribute('ssr', '', { timeout: 15_000 });
  await input.setInputFiles({ name, mimeType, buffer });
}

async function canvasImage(page: Page, mime: 'image/jpeg' | 'image/webp'): Promise<Buffer> {
  const values = await page.evaluate(async (type) => {
    const canvas = document.createElement('canvas'); canvas.width = 3; canvas.height = 2;
    const context = canvas.getContext('2d')!; context.fillStyle = '#d9ff43'; context.fillRect(0, 0, 3, 2);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Canvas encoding failed')), type, .9));
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  }, mime);
  return Buffer.from(values);
}

test('home page opens with the universal metadata viewer and three direct next tools', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'View file metadata in your browser' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Choose a file' })).toBeVisible();
  await expect(page.locator('.home-next-tools a')).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'Check image privacy' })).toHaveAttribute('href', '/image-privacy-checker');
});

test('home page directly parses all six promised formats', async ({ page }) => {
  const cases: Array<[string, string, Buffer, string]> = [
    ['home.png', 'image/png', png(), 'image'],
    ['home.jpg', 'image/jpeg', await canvasImage(page, 'image/jpeg'), 'image'],
    ['home.webp', 'image/webp', await canvasImage(page, 'image/webp'), 'image'],
    ['home.pdf', 'application/pdf', pdf(), 'pdf'],
    ['home.mp4', 'video/mp4', mp4(), 'video'],
    ['home.mp3', 'audio/mpeg', mp3(), 'audio'],
  ];
  for (const [name, mimeType, buffer, category] of cases) {
    await page.goto('/');
    await upload(page, name, buffer, mimeType);
    await expect(page.getByRole('heading', { name: new RegExp(`${name.replace('.', '\\.')} metadata report`) })).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.report-file-title')).toContainText(category);
  }
});

test('shared report progressively merges the local ExifTool field set without uploading the file', async ({ page }) => {
  test.setTimeout(180_000);
  const requests: Array<{ method: string; url: string }> = [];
  page.on('request', (request) => requests.push({ method: request.method(), url: request.url() }));
  await page.goto('/image-metadata-viewer');
  expect(requests.some((request) => request.url.includes('zeroperl') || request.url.endsWith('.wasm'))).toBe(false);

  const buffer = await canvasImage(page, 'image/jpeg');
  await upload(page, 'camera-profile.jpg', buffer, 'image/jpeg');
  await expect(page.getByRole('heading', { name: 'camera-profile.jpg metadata report' })).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('.report-engine')).toHaveClass(/is-complete/, { timeout: 150_000 });
  await expect(page.locator('.report-engine-copy')).toContainText('Full scan complete');
  await expect(page.locator('.report-engine-stats')).toContainText(/ExifTool\s+\d/i);
  await expect(page.locator('.report-engine-stats')).toContainText(/\d+ fields/);

  await page.getByRole('button', { name: /All fields/i }).click();
  const jfif = page.locator('details.report-section').filter({ hasText: 'JFIF' }).first();
  const jfifSummary = jfif.locator(':scope > summary');
  await expect(jfifSummary).toBeVisible();
  await jfifSummary.click();
  await expect(jfif.getByText('JFIF Version', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Scan embedded data/i })).toHaveCount(0);
  await expect(page.locator('.report-engine ol')).toHaveCount(0);

  expect(requests.some((request) => request.method !== 'GET')).toBe(false);
  expect(requests.some((request) => request.url.includes('camera-profile') || request.url.includes('ExifTool author'))).toBe(false);
  expect(requests.some((request) => request.url.includes('zeroperl') || request.url.endsWith('.wasm'))).toBe(true);
});

test('universal report parses all six promised formats through one workbench', async ({ page }) => {
  const cases: Array<[string, string, Buffer, string, string | RegExp]> = [
    ['pixel.png', 'image/png', png(), 'image', '1 × 1 px'],
    ['pixel.jpg', 'image/jpeg', await canvasImage(page, 'image/jpeg'), 'image', 'JPEG'],
    ['pixel.webp', 'image/webp', await canvasImage(page, 'image/webp'), 'image', 'WEBP'],
    ['fixture.pdf', 'application/pdf', pdf(), 'pdf', '1'],
    ['fixture.mp4', 'video/mp4', mp4(), 'video', 'MP4'],
    ['fixture.mp3', 'audio/mpeg', mp3(), 'audio', 'Fixture Song'],
  ];
  for (const [name, mimeType, buffer, category, expected] of cases) {
    await page.goto('/metadata-viewer');
    await expect(page.getByRole('button', { name: 'Choose a file' })).toBeVisible();
    await upload(page, name, buffer, mimeType);
    await expect(page.getByRole('heading', { name: new RegExp(`${name.replace('.', '\\.')} metadata report`) })).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.report-file-title')).toContainText(category);
    await expect(page.getByText(expected, { exact: typeof expected === 'string' }).first()).toBeVisible();
    await expect(page.locator('.report-hashes code').first()).toHaveText(/^[a-f0-9]{64}$/);
  }
});

test('unsupported file gives a plain error', async ({ page }) => {
  await page.goto('/metadata-viewer');
  await upload(page, 'notes.txt', Buffer.from('not an image'), 'text/plain');
  await expect(page.getByRole('alert')).toContainText('file signature');
});

test('specialized PDF, MP3, and MP4 pages run their lazy adapters', async ({ page }) => {
  const fixtures: Array<[string, string, string, Buffer, string]> = [
    ['/pdf-metadata-viewer', 'fixture.pdf', 'application/pdf', pdf(), 'Fixture PDF'],
    ['/audio-metadata-viewer', 'fixture.mp3', 'audio/mpeg', mp3(), 'Fixture Song'],
    ['/video-metadata-viewer', 'fixture.mp4', 'video/mp4', mp4(), 'MP4'],
  ];
  for (const [path, name, mimeType, buffer, expected] of fixtures) {
    await page.goto(path); await upload(page, name, buffer, mimeType);
    await expect(page.getByRole('heading', { name: 'Metadata found' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(expected, { exact: true }).first()).toBeVisible();
  }
});

test('removed application-specific reader routes return the real 404 page', async ({ page }) => {
  for (const path of ['/ai-prompt-reader', '/comfyui-workflow-reader']) {
    const response = await page.goto(path);
    expect(response?.status(), `${path} should not redirect`).toBe(404);
    await expect(page.getByRole('heading', { name: /This field.*undefined/i })).toBeVisible();
  }
});

test('privacy checker renders an explainable report', async ({ page }) => {
  await page.goto('/image-privacy-checker');
  await upload(page, 'author.png', png(['Artist', 'Ada Example']));
  await expect(page.locator('.privacy-scoreboard')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Author or creator name' })).toBeVisible();
  await expect(page.getByText(/does not guarantee that an image is safe to share/i)).toBeVisible();
});

test('metadata remover creates a downloadable clean copy', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/metadata-remover');
  await upload(page, 'private.png', png(['Artist', 'Ada Example']));
  await expect(page.locator('.privacy-scoreboard')).toBeVisible();
  await expect(page.locator('.privacy-engine-rail h2')).toHaveText('Full scan complete', { timeout: 30_000 });
  await page.getByRole('button', { name: 'Create and verify clean copy' }).click();
  await expect(page.locator('.privacy-cleanup-result')).toContainText('15 → 0', { timeout: 45_000 });
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download clean copy' }).click();
  expect((await downloadPromise).suggestedFilename()).toMatch(/clean\.png$/);
});

test('metadata remover desktop and mobile result stay usable without console errors', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/metadata-remover');
  await upload(page, 'visual-removal.png', png(['Artist', 'Ada Example']));
  await expect(page.locator('.privacy-engine-rail h2')).toHaveText('Full scan complete', { timeout: 30_000 });
  await page.getByRole('button', { name: 'Create and verify clean copy' }).click();
  const result = page.locator('.privacy-cleanup-result');
  await expect(result).toContainText('15 → 0', { timeout: 45_000 });
  await result.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('desktop-remover.png'), fullPage: false });
  await page.setViewportSize({ width: 390, height: 844 });
  await result.scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('mobile-remover.png'), fullPage: false });
  const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
  expect(errors).toEqual([]);
});

test('C2PA viewer produces a fingerprinted local receipt for an unsigned PNG', async ({ page }) => {
  test.setTimeout(45_000);
  const requests: Array<{ method: string; url: string }> = [];
  page.on('request', (request) => requests.push({ method: request.method(), url: request.url() }));
  await page.goto('/c2pa-viewer');
  expect(requests.some((request) => request.url.endsWith('.wasm'))).toBe(false);
  await upload(page, 'unsigned.png', png());
  await expect(page.getByRole('heading', { name: 'No Content Credentials' })).toBeVisible({ timeout: 35_000 });
  await expect(page.getByText(/says nothing by itself about whether the content is authentic or fake/i)).toBeVisible();
  await expect(page.locator('.c2pa-hash code')).toHaveText(/^[a-f0-9]{64}$/);
  await expect(page.getByText('Not applicable', { exact: true })).toHaveCount(4);
  await page.getByRole('tab', { name: 'Validation' }).click();
  await expect(page.locator('.c2pa-validation-columns')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download JSON' }).click();
  expect((await downloadPromise).suggestedFilename()).toMatch(/c2pa-report\.json$/);
  expect(requests.some((request) => request.url.endsWith('.wasm'))).toBe(true);
  expect(requests.some((request) => !['GET', 'HEAD'].includes(request.method))).toBe(false);
});

test('mobile pages do not create horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/metadata-viewer', '/image-privacy-checker', '/metadata-remover', '/c2pa-viewer']) {
    await page.goto(path);
    const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(dimensions.scroll, `${path} overflowed`).toBeLessThanOrEqual(dimensions.client + 1);
  }
});

test('primary file buttons are visible above the fold on desktop and mobile', async ({ page }) => {
  const paths = ['/', '/metadata-viewer', '/image-metadata-viewer', '/image-privacy-checker', '/metadata-remover', '/c2pa-viewer'];
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const path of paths) {
      await page.goto(path);
      const chooser = page.getByRole('button', { name: /Choose (a file|an image)/ }).first();
      await expect(chooser).toBeVisible();
      const box = await chooser.boundingBox();
      expect(box, `${path} has no chooser box`).not.toBeNull();
      expect(box!.y, `${path} chooser starts above the viewport`).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height, `${path} chooser is below the ${viewport.width}px fold`).toBeLessThanOrEqual(viewport.height);
    }
  }
});

test('navigation uses direct task labels and pages contain no mojibake', async ({ page }) => {
  await page.goto('/');
  for (const label of ['View metadata', 'Check privacy', 'Remove metadata', 'Verify C2PA']) await expect(page.getByRole('link', { name: label, exact: true }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Read AI prompts|ComfyUI/i })).toHaveCount(0);
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/鈥|鈫|路|攁|攏|渘|渁|渟|�/);
});
