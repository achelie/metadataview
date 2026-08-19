import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { BlobReader, TextWriter, ZipReader } from '@zip.js/zip.js';
import { deflate } from 'pako';
import { aacFixture, flacFixture, m4aFixture, oggFixture, opusFixture, wavFixture, wmaFixture } from '../fixtures/audio';
import { gifFixture, heicFixture, tiffFixture } from '../fixtures/images';
import { ooxmlFixture, ooxmlMime } from '../fixtures/ooxml';
import { videoFixture, videoMime, type VideoFixtureType } from '../fixtures/video';

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

test('home page opens with the universal viewer, three useful next steps, and the local scan process', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Free Online EXIF & Metadata Viewer' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Choose a file' })).toBeVisible();
  await expect(page.locator('.report-drop-copy p')).toContainText(/Images.*Videos.*Documents.*Audio/);
  await expect(page.locator('.home-format-links a strong')).toHaveText(['Images', 'Videos', 'Documents', 'Audio']);
  await expect(page.locator('.home-format-links')).not.toContainText('JPEG · PNG · WebP');
  await expect(page.getByText('Use the right tool next.')).toHaveCount(0);
  await expect(page.getByText('The file never takes a network trip.')).toHaveCount(0);
  await expect(page.locator('.home-benefit-grid a')).toHaveCount(3);
  await expect(page.getByRole('link', { name: /Protect private details/ })).toHaveAttribute('href', '/image-privacy-checker/');
  await expect(page.getByRole('link', { name: /Check file provenance/ })).toHaveAttribute('href', '/c2pa-viewer/');
  await expect(page.getByRole('link', { name: /Share a cleaner copy/ })).toHaveAttribute('href', '/metadata-remover/');
  await expect(page.locator('.home-process-list li')).toHaveCount(5);
  const workbenchLink = page.getByRole('link', { name: /Choose a file above/ });
  await expect(workbenchLink).toHaveAttribute('href', '#metadata-workbench-home');
  await expect(page.locator('#metadata-workbench-home')).toHaveCount(1);
  await workbenchLink.click();
  await expect(page).toHaveURL(/#metadata-workbench-home$/);
});

test('home page directly parses all 28 promised file extensions', async ({ page }) => {
  test.setTimeout(180_000);
  const cases: Array<[string, string, Buffer, string]> = [
    ['home.png', 'image/png', png(), 'image'],
    ['home.jpg', 'image/jpeg', await canvasImage(page, 'image/jpeg'), 'image'],
    ['home.webp', 'image/webp', await canvasImage(page, 'image/webp'), 'image'],
    ['home.heic', 'image/heic', Buffer.from(heicFixture()), 'image'],
    ['home.tiff', 'image/tiff', Buffer.from(tiffFixture()), 'image'],
    ['home.gif', 'image/gif', Buffer.from(gifFixture()), 'image'],
    ['home.pdf', 'application/pdf', pdf(), 'pdf'],
    ['home.docx', ooxmlMime('docx'), Buffer.from(await ooxmlFixture('docx')), 'document'],
    ['home.pptx', ooxmlMime('pptx'), Buffer.from(await ooxmlFixture('pptx')), 'document'],
    ['home.xlsx', ooxmlMime('xlsx'), Buffer.from(await ooxmlFixture('xlsx')), 'document'],
    ['home.mp4', 'video/mp4', mp4(), 'video'],
    ...(['m4v', 'mov', 'mkv', 'webm', 'avi', 'flv', '3gp', '3g2'] as VideoFixtureType[]).map((type): [string, string, Buffer, string] => [`home.${type}`, videoMime(type), Buffer.from(videoFixture(type)), 'video']),
    ['home.mp3', 'audio/mpeg', mp3(), 'audio'],
    ['home.flac', 'audio/flac', Buffer.from(flacFixture()), 'audio'],
    ['home.ogg', 'audio/ogg', Buffer.from(oggFixture()), 'audio'],
    ['home.opus', 'audio/opus', Buffer.from(opusFixture()), 'audio'],
    ['home.oga', 'audio/ogg', Buffer.from(oggFixture()), 'audio'],
    ['home.m4a', 'audio/mp4', Buffer.from(m4aFixture()), 'audio'],
    ['home.aac', 'audio/aac', Buffer.from(aacFixture()), 'audio'],
    ['home.wav', 'audio/wav', Buffer.from(wavFixture()), 'audio'],
    ['home.wma', 'audio/x-ms-wma', Buffer.from(wmaFixture()), 'audio'],
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
  await page.goto('/image-metadata-viewer/');
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

test('universal report parses all 28 promised file extensions through one workbench', async ({ page }) => {
  test.setTimeout(180_000);
  const cases: Array<[string, string, Buffer, string, string | RegExp]> = [
    ['pixel.png', 'image/png', png(), 'image', '1 × 1 px'],
    ['pixel.jpg', 'image/jpeg', await canvasImage(page, 'image/jpeg'), 'image', 'JPEG'],
    ['pixel.webp', 'image/webp', await canvasImage(page, 'image/webp'), 'image', 'WEBP'],
    ['pixel.heic', 'image/heic', Buffer.from(heicFixture()), 'image', 'HEIC'],
    ['pixel.tiff', 'image/tiff', Buffer.from(tiffFixture()), 'image', 'TIFF'],
    ['pixel.gif', 'image/gif', Buffer.from(gifFixture()), 'image', 'GIF'],
    ['fixture.pdf', 'application/pdf', pdf(), 'pdf', '1'],
    ['fixture.docx', ooxmlMime('docx'), Buffer.from(await ooxmlFixture('docx', { title: 'Fixture Document' })), 'document', 'Fixture Document'],
    ['fixture.pptx', ooxmlMime('pptx'), Buffer.from(await ooxmlFixture('pptx', { slides: 2 })), 'document', '2'],
    ['fixture.xlsx', ooxmlMime('xlsx'), Buffer.from(await ooxmlFixture('xlsx', { worksheets: 3 })), 'document', '3'],
    ['fixture.mp4', 'video/mp4', mp4(), 'video', 'MP4'],
    ...([
      ['m4v', 'MP4'], ['mov', 'MOV'], ['mkv', 'MKV'], ['webm', 'WEBM'], ['avi', 'AVI'], ['flv', 'FLV'], ['3gp', '3GP'], ['3g2', '3G2'],
    ] as Array<[VideoFixtureType, string]>).map(([type, expected]): [string, string, Buffer, string, string] => [`fixture.${type}`, videoMime(type), Buffer.from(videoFixture(type)), 'video', expected]),
    ['fixture.mp3', 'audio/mpeg', mp3(), 'audio', 'Fixture Song'],
    ['fixture.flac', 'audio/flac', Buffer.from(flacFixture()), 'audio', 'FLAC'],
    ['fixture.ogg', 'audio/ogg', Buffer.from(oggFixture()), 'audio', 'Vorbis I'],
    ['fixture.opus', 'audio/opus', Buffer.from(opusFixture()), 'audio', 'Opus'],
    ['fixture.oga', 'audio/ogg', Buffer.from(oggFixture()), 'audio', 'OGG'],
    ['fixture.m4a', 'audio/mp4', Buffer.from(m4aFixture()), 'audio', 'M4A'],
    ['fixture.aac', 'audio/aac', Buffer.from(aacFixture()), 'audio', 'AAC'],
    ['fixture.wav', 'audio/wav', Buffer.from(wavFixture()), 'audio', 'PCM'],
    ['fixture.wma', 'audio/x-ms-wma', Buffer.from(wmaFixture()), 'audio', 'WMA'],
  ];
  for (const [name, mimeType, buffer, category, expected] of cases) {
    await page.goto('/metadata-viewer/');
    await expect(page.getByRole('button', { name: 'Choose a file' })).toBeVisible();
    await upload(page, name, buffer, mimeType);
    await expect(page.getByRole('heading', { name: new RegExp(`${name.replace('.', '\\.')} metadata report`) })).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.report-file-title')).toContainText(category);
    await expect(page.getByText(expected, { exact: typeof expected === 'string' }).first()).toBeVisible();
    await expect(page.locator('.report-hashes code').first()).toHaveText(/^[a-f0-9]{64}$/);
  }
});

test('unsupported file gives a plain error', async ({ page }) => {
  await page.goto('/metadata-viewer/');
  await upload(page, 'notes.txt', Buffer.from('not an image'), 'text/plain');
  await expect(page.getByRole('alert')).toContainText('file signature');
});

test('specialized document, audio, and video pages use the shared production report', async ({ page }) => {
  test.setTimeout(180_000);
  const requests: Array<{ method: string; url: string }> = [];
  page.on('request', (request) => requests.push({ method: request.method(), url: request.url() }));
  const fixtures: Array<[string, string, string, Buffer, string]> = [
    ['/document-metadata-viewer/', 'fixture.pdf', 'application/pdf', pdf(), 'Fixture PDF'],
    ['/document-metadata-viewer/', 'fixture.docx', ooxmlMime('docx'), Buffer.from(await ooxmlFixture('docx', { title: 'Fixture Word Document' })), 'Fixture Word Document'],
    ['/document-metadata-viewer/', 'fixture.pptx', ooxmlMime('pptx'), Buffer.from(await ooxmlFixture('pptx', { slides: 3 })), '3'],
    ['/document-metadata-viewer/', 'fixture.xlsx', ooxmlMime('xlsx'), Buffer.from(await ooxmlFixture('xlsx', { worksheets: 4 })), '4'],
    ['/audio-metadata-viewer/', 'fixture.mp3', 'audio/mpeg', mp3(), 'Fixture Song'],
    ['/audio-metadata-viewer/', 'fixture.flac', 'audio/flac', Buffer.from(flacFixture()), 'FLAC'],
    ['/audio-metadata-viewer/', 'fixture.ogg', 'audio/ogg', Buffer.from(oggFixture()), 'Vorbis I'],
    ['/audio-metadata-viewer/', 'fixture.opus', 'audio/opus', Buffer.from(opusFixture()), 'Opus'],
    ['/audio-metadata-viewer/', 'fixture.oga', 'audio/ogg', Buffer.from(oggFixture()), 'OGG'],
    ['/audio-metadata-viewer/', 'fixture.m4a', 'audio/mp4', Buffer.from(m4aFixture()), 'M4A'],
    ['/audio-metadata-viewer/', 'fixture.aac', 'audio/aac', Buffer.from(aacFixture()), 'AAC'],
    ['/audio-metadata-viewer/', 'fixture.wav', 'audio/wav', Buffer.from(wavFixture()), 'PCM'],
    ['/audio-metadata-viewer/', 'fixture.wma', 'audio/x-ms-wma', Buffer.from(wmaFixture()), 'WMA'],
    ['/video-metadata-viewer/', 'fixture.mp4', 'video/mp4', mp4(), 'MP4'],
    ...([
      ['m4v', 'MP4'], ['mov', 'MOV'], ['mkv', 'MKV'], ['webm', 'WEBM'], ['avi', 'AVI'], ['flv', 'FLV'], ['3gp', '3GP'], ['3g2', '3G2'],
    ] as Array<[VideoFixtureType, string]>).map(([type, expected]): [string, string, string, Buffer, string] => ['/video-metadata-viewer/', `fixture.${type}`, videoMime(type), Buffer.from(videoFixture(type)), expected]),
  ];
  for (const [path, name, mimeType, buffer, expected] of fixtures) {
    await page.goto(path); await upload(page, name, buffer, mimeType);
    await expect(page.getByRole('heading', { name: `${name} metadata report` })).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.report-hashes code').first()).toHaveText(/^[a-f0-9]{64}$/);
    await expect(page.getByText(expected, { exact: true }).first()).toBeVisible();
  }
  expect(requests.some((request) => !['GET', 'HEAD'].includes(request.method))).toBe(false);
});

test('document viewer reads properties without surfacing body, cell, or slide content', async ({ page }) => {
  const requests: Array<{ method: string; url: string }> = [];
  page.on('request', (request) => requests.push({ method: request.method(), url: request.url() }));
  await page.goto('/document-metadata-viewer/');
  await expect(page.getByRole('heading', { name: 'Document Metadata Viewer' })).toBeVisible();
  await expect(page.getByText('PDF · DOCX · PPTX · XLSX', { exact: true }).first()).toBeVisible();
  const secret = 'PRIVATE-BODY-TEXT-MUST-STAY-UNREAD';
  const bytes = await ooxmlFixture('docx', { title: 'Safe property title', bodyText: secret });
  await upload(page, 'safe.docx', Buffer.from(bytes), ooxmlMime('docx'));
  await expect(page.getByRole('heading', { name: 'safe.docx metadata report' })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('Safe property title', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Document properties', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(secret, { exact: false })).toHaveCount(0);
  expect(requests.some((request) => !['GET', 'HEAD'].includes(request.method))).toBe(false);
});

test('removed application-specific reader routes return the real 404 page', async ({ page }) => {
  for (const path of ['/ai-prompt-reader/', '/comfyui-workflow-reader/']) {
    const response = await page.goto(path);
    expect(response?.status(), `${path} should not redirect`).toBe(404);
    await expect(page.getByRole('heading', { name: /This field.*undefined/i })).toBeVisible();
  }
});

test('privacy checker renders an explainable report', async ({ page }) => {
  await page.goto('/image-privacy-checker/');
  await upload(page, 'author.png', png(['Artist', 'Ada Example']));
  await expect(page.locator('.privacy-scoreboard')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Author or creator name' })).toBeVisible();
  await expect(page.getByText(/does not guarantee that an image is safe to share/i)).toBeVisible();
});

test('metadata remover creates a downloadable clean copy', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/metadata-remover/');
  await upload(page, 'private.png', png(['Artist', 'Ada Example']));
  await expect(page.locator('.removal-report')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Ready to create a clean copy')).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Create and verify clean copy' }).click();
  await expect(page.locator('.removal-result')).toBeVisible({ timeout: 45_000 });
  await expect(page.locator('.removal-result')).toContainText('Removed');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download clean copy' }).click();
  expect((await downloadPromise).suggestedFilename()).toMatch(/clean\.png$/);
});

test('PDF removal rewrites the file with qpdf and removes the old Info author', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/document-metadata-remover/');
  await upload(page, 'signed-off.pdf', pdf(), 'application/pdf');
  await expect(page.getByText('Ready to create a clean copy')).toBeVisible({ timeout: 35_000 });
  await page.getByRole('button', { name: 'Create and verify clean copy' }).click();
  const result = page.locator('.removal-result');
  await expect(result).toBeVisible({ timeout: 60_000 });
  await expect(result).toContainText('qpdf');
  await expect(result).not.toHaveClass(/is-blocked/);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download clean copy' }).click();
  const pdfDownload = await downloadEvent;
  const pdfPath = await pdfDownload.path();
  const bytes = await readFile(pdfPath as string);
  expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
  expect(bytes.toString('latin1')).not.toContain('Ada Example');
});

test('audio removal uses TagLib without re-encoding the stream container', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/audio-metadata-remover/');
  await upload(page, 'credits.mp3', mp3(), 'audio/mpeg');
  await expect(page.getByText('Ready to create a clean copy')).toBeVisible({ timeout: 35_000 });
  await page.getByRole('button', { name: 'Create and verify clean copy' }).click();
  const result = page.locator('.removal-result');
  await expect(result).toBeVisible({ timeout: 60_000 });
  await expect(result).toContainText('taglib');
  await expect(page.getByRole('button', { name: 'Download clean copy' })).toBeEnabled();
});

test('Office removal keeps body XML while clearing Core and Custom properties', async ({ page }) => {
  test.setTimeout(120_000);
  const source = await ooxmlFixture('docx', { author: 'Ada Example', customName: 'Client', customValue: 'Secret Account', bodyText: 'BODY-STAYS-HERE' });
  await page.goto('/document-metadata-remover/');
  await upload(page, 'brief.docx', Buffer.from(source), ooxmlMime('docx'));
  await expect(page.getByText('Ready to create a clean copy')).toBeVisible({ timeout: 35_000 });
  await page.getByRole('button', { name: 'Create and verify clean copy' }).click();
  await expect(page.locator('.removal-result')).toContainText('ooxml-zip', { timeout: 60_000 });
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download clean copy' }).click();
  const officeDownload = await downloadEvent;
  const officePath = await officeDownload.path();
  const output = await readFile(officePath as string);
  const zip = new ZipReader(new BlobReader(new Blob([output])));
  const entries = await zip.getEntries();
  const text = async (name: string) => {
    const entry = entries.find((item) => item.filename === name);
    if (!entry || entry.directory || !('getData' in entry)) return '';
    return entry.getData(new TextWriter());
  };
  expect(await text('word/document.xml')).toContain('BODY-STAYS-HERE');
  expect(await text('docProps/core.xml')).not.toContain('Ada Example');
  expect(await text('docProps/custom.xml')).not.toContain('Secret Account');
  await zip.close();
});

test('AVI removal keeps the RIFF container valid after the custom scrubber runs', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/video-metadata-remover/');
  await upload(page, 'clip.avi', Buffer.from(videoFixture('avi')), videoMime('avi'));
  await expect(page.getByText('Ready to create a clean copy')).toBeVisible({ timeout: 35_000 });
  await page.getByRole('button', { name: 'Create and verify clean copy' }).click();
  await expect(page.locator('.removal-result')).toContainText('riff', { timeout: 60_000 });
  await expect(page.getByRole('button', { name: 'Download clean copy' })).toBeEnabled();
});

test('metadata remover desktop and mobile result stay usable without console errors', async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/metadata-remover/');
  await upload(page, 'visual-removal.png', png(['Artist', 'Ada Example']));
  await expect(page.getByText('Ready to create a clean copy')).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Create and verify clean copy' }).click();
  const result = page.locator('.removal-result');
  await expect(result).toBeVisible({ timeout: 45_000 });
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
  await page.goto('/c2pa-viewer/');
  expect(requests.some((request) => request.url.endsWith('.wasm'))).toBe(false);
  await expect(page.getByRole('heading', { name: 'What is C2PA?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Content Credentials and C2PA' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Supported files' })).toBeVisible();
  await expect(page.getByText('JPEG, PNG, WebP, GIF, TIFF, HEIC, HEIF, AVIF, JXL, DNG, ARW, NEF, SVG', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Can C2PA prove that content is true?' })).toBeVisible();
  await expect(page.getByText('Useful details, without the lecture.')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Related tools' })).toHaveCount(0);
  const faqSchema = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent ?? '{}')).find((item) => item['@type'] === 'FAQPage'));
  expect(faqSchema.mainEntity).toHaveLength(6);
  const accept = await page.locator('input[type="file"]').getAttribute('accept');
  for (const extension of ['.gif', '.heic', '.heif', '.avif', '.jxl', '.dng', '.arw', '.nef', '.svg', '.mov', '.avi', '.mp3', '.m4a', '.wav']) expect(accept).toContain(extension);
  await upload(page, 'unsigned.png', png());
  await expect(page.getByRole('heading', { name: 'No Content Credentials' })).toBeVisible({ timeout: 35_000 });
  await expect(page.getByText(/says nothing by itself about whether the content is authentic or fake/i)).toBeVisible();
  await expect(page.locator('.c2pa-hash code')).toHaveText(/^[a-f0-9]{64}$/);
  await expect(page.locator('.c2pa-checks').getByText('Not applicable', { exact: true })).toHaveCount(4);
  await expect(page.locator('.c2pa-asset-copy').getByText('Not applicable', { exact: true })).toHaveCount(1);
  await expect(page.locator('.c2pa-asset-card img')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Validation results' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Actions' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Provenance' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Embedded watermark' })).toBeVisible();
  await expect(page.getByText('No watermark declaration found.')).toBeVisible();
  await expect(page.getByText(/does not inspect pixels or audio samples/i)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create shareable report' })).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Create shareable report' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/c2pa-report\.json$/);
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  const receipt = JSON.parse(await readFile(downloadPath!, 'utf8')) as Record<string, unknown>;
  expect(receipt).toMatchObject({ schemaVersion: '1.0', status: 'not-found' });
  expect(JSON.stringify(receipt)).not.toMatch(/blob:|data:image|sourceBytes|wasm/i);
  expect(requests.some((request) => request.url.endsWith('.wasm'))).toBe(true);
  expect(requests.some((request) => !['GET', 'HEAD'].includes(request.method))).toBe(false);
  const pageOrigin = new URL(page.url()).origin;
  expect(requests.every((request) => {
    const url = new URL(request.url);
    return url.origin === pageOrigin || url.href === 'https://analytics.ahrefs.com/analytics.js';
  })).toBe(true);
  await page.setViewportSize({ width: 239, height: 844 });
  const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
});

test('C2PA viewer sends a signature-checked SVG to the official local verifier', async ({ page }) => {
  test.setTimeout(45_000);
  const requests: Array<{ method: string; url: string }> = [];
  page.on('request', (request) => requests.push({ method: request.method(), url: request.url() }));
  await page.goto('/c2pa-viewer/');
  await upload(page, 'unsigned.svg', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path d="M0 0h1v1z"/></svg>'), 'image/svg+xml');
  await expect(page.getByRole('heading', { name: 'No Content Credentials' })).toBeVisible({ timeout: 35_000 });
  await expect(page.locator('.c2pa-file-receipt').getByText('SVG', { exact: true })).toBeVisible();
  expect(requests.some((request) => request.url.endsWith('.wasm'))).toBe(true);
  expect(requests.some((request) => !['GET', 'HEAD'].includes(request.method))).toBe(false);
});

test('mobile pages do not create horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/metadata-viewer/', '/image-metadata-viewer/', '/document-metadata-viewer/', '/video-metadata-viewer/', '/audio-metadata-viewer/', '/image-privacy-checker/', '/metadata-remover/', '/image-metadata-remover/', '/video-metadata-remover/', '/audio-metadata-remover/', '/document-metadata-remover/', '/c2pa-viewer/']) {
    await page.goto(path);
    const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(dimensions.scroll, `${path} overflowed`).toBeLessThanOrEqual(dimensions.client + 1);
  }
});

test('primary file buttons are visible above the fold on desktop and mobile', async ({ page }) => {
  const paths = ['/', '/metadata-viewer/', '/image-metadata-viewer/', '/document-metadata-viewer/', '/video-metadata-viewer/', '/audio-metadata-viewer/', '/image-privacy-checker/', '/metadata-remover/', '/image-metadata-remover/', '/video-metadata-remover/', '/audio-metadata-remover/', '/document-metadata-remover/', '/c2pa-viewer/'];
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

test('every tool treats the full upload panel as one accessible file button', async ({ page }) => {
  const cases: Array<[string, string, string]> = [
    ['/', '.report-dropzone', 'Choose a file'],
    ['/metadata-viewer/', '.report-dropzone', 'Choose a file'],
    ['/image-metadata-viewer/', '.report-dropzone', 'Choose an image'],
    ['/document-metadata-viewer/', '.report-dropzone', 'Choose a file'],
    ['/video-metadata-viewer/', '.report-dropzone', 'Choose a file'],
    ['/audio-metadata-viewer/', '.report-dropzone', 'Choose a file'],
    ['/image-privacy-checker/', '.privacy-dropzone', 'Choose an image'],
    ['/metadata-remover/', '.removal-dropzone', 'Choose a file'],
    ['/image-metadata-remover/', '.removal-dropzone', 'Choose an image'],
    ['/video-metadata-remover/', '.removal-dropzone', 'Choose a file'],
    ['/audio-metadata-remover/', '.removal-dropzone', 'Choose a file'],
    ['/document-metadata-remover/', '.removal-dropzone', 'Choose a file'],
    ['/c2pa-viewer/', '.c2pa-dropzone', 'Choose a file'],
  ];

  for (const [path, selector, label] of cases) {
    await page.goto(path);
    const panel = page.locator(selector);
    await expect(panel).toHaveRole('button');
    await expect(panel).toHaveAccessibleName(label);
    await expect(panel.locator('button')).toHaveCount(0);
    const input = page.locator('input[type=file]').first();
    await expect(input).toHaveAttribute('tabindex', '-1');
    await expect(input).toHaveAttribute('aria-hidden', 'true');
    const chooser = page.waitForEvent('filechooser');
    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    await panel.click({ position: { x: Math.max(8, box!.width - 12), y: Math.max(8, box!.height - 12) } });
    await chooser;
  }
});

test('icon, copy, and green visual label all open the same picker once', async ({ page }) => {
  await page.goto('/');
  for (const selector of ['.report-drop-mark', '.report-drop-copy strong', '.report-pick-button']) {
    const chooser = page.waitForEvent('filechooser');
    await page.locator(selector).click();
    await chooser;
  }
});

test('metadata and remover format menus work on desktop and mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const desktop = page.locator('.desktop-nav');
  const viewMenu = desktop.locator('.nav-dropdown').filter({ hasText: 'View metadata' });
  const removeMenu = desktop.locator('.nav-dropdown').filter({ hasText: 'Remove metadata' });
  const viewTrigger = viewMenu.locator('.nav-dropdown-trigger');
  await viewTrigger.click();
  await expect(viewTrigger).toHaveAttribute('aria-expanded', 'true');
  await expect(viewMenu.locator('.t-dropdown')).toHaveClass(/is-open/);
  const viewLinks: Array<[string, string]> = [['All Formats', '/'], ['Images', '/image-metadata-viewer/'], ['Videos', '/video-metadata-viewer/'], ['Audio', '/audio-metadata-viewer/'], ['Documents', '/document-metadata-viewer/']];
  for (const [label, href] of viewLinks) {
    await expect(viewMenu.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
  }
  const removeTrigger = removeMenu.locator('.nav-dropdown-trigger');
  await removeTrigger.click();
  await expect(viewTrigger).toHaveAttribute('aria-expanded', 'false');
  await expect(viewMenu).toHaveAttribute('data-open', 'false');
  await expect(removeTrigger).toHaveAttribute('aria-expanded', 'true');
  const removeLinks: Array<[string, string]> = [['All Formats', '/metadata-remover/'], ['Images', '/image-metadata-remover/'], ['Videos', '/video-metadata-remover/'], ['Audio', '/audio-metadata-remover/'], ['Documents', '/document-metadata-remover/']];
  for (const [label, href] of removeLinks) {
    await expect(removeMenu.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href);
  }
  await page.keyboard.press('Escape');
  await expect(removeTrigger).toHaveAttribute('aria-expanded', 'false');
  await expect(removeTrigger).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const mobileTrigger = page.getByRole('button', { name: 'Open navigation' });
  await mobileTrigger.click();
  const mobileLayer = page.locator('[data-mobile-menu-layer]');
  await expect(mobileLayer).toHaveAttribute('data-open', 'true');
  await expect(page.locator('.mobile-menu-drawer')).toHaveAttribute('data-open', 'true');
  await expect(page.locator('.mobile-menu-trigger .t-icon-swap')).toHaveAttribute('data-state', 'b');
  const mobileView = page.locator('.mobile-nav-group').filter({ hasText: 'View metadata' });
  await mobileView.locator('.t-acc-head').click();
  await expect(mobileView).toHaveAttribute('data-open', 'true');
  await expect(mobileView.getByRole('link', { name: 'Documents', exact: true })).toHaveAttribute('href', '/document-metadata-viewer/');
  const mobileRemove = page.locator('.mobile-nav-group').filter({ hasText: 'Remove metadata' });
  await mobileRemove.locator('.t-acc-head').click();
  await expect(mobileView).toHaveAttribute('data-open', 'false');
  await expect(mobileRemove).toHaveAttribute('data-open', 'true');
  await expect(mobileRemove.getByRole('link', { name: 'Audio', exact: true })).toHaveAttribute('href', '/audio-metadata-remover/');
  await page.keyboard.press('Escape');
  await expect(mobileLayer).toHaveAttribute('data-open', 'false');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
});

test('navigation motion uses the transition hooks and honors reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const dropdown = page.locator('.nav-dropdown').first();
  const panel = dropdown.locator('.t-dropdown');
  await dropdown.locator('.nav-dropdown-trigger').click();
  await expect(panel).toHaveCSS('opacity', '1');
  expect(await panel.evaluate((element) => getComputedStyle(element).transitionDuration)).toContain('0.25s');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  const drawer = page.locator('.mobile-menu-drawer');
  await expect(drawer).toHaveCSS('opacity', '1');
  expect(await drawer.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe('0s');
});

test('format viewers share the homepage editorial structure with format-specific copy and FAQ schema', async ({ page }) => {
  const cases: Array<[string, string, string, string, number]> = [
    ['/image-metadata-viewer/', 'Why check image metadata?', 'How the image scan works', 'Which image formats and metadata are supported?', 7],
    ['/document-metadata-viewer/', 'Why inspect documents?', 'How the document scan works', 'Which document formats and properties are supported?', 5],
    ['/video-metadata-viewer/', 'Why inspect video?', 'How the video scan works', 'Which video formats and fields are supported?', 5],
    ['/audio-metadata-viewer/', 'Why inspect audio?', 'How the audio scan works', 'Which audio formats and tags are supported?', 5],
  ];

  for (const [path, valueTitle, processTitle, formatQuestion, faqCount] of cases) {
    await page.goto(path);
    const valueHeading = page.getByRole('heading', { name: valueTitle });
    await expect(valueHeading).toBeVisible();
    const valueHeadingBox = await valueHeading.boundingBox();
    expect(valueHeadingBox?.height).toBeLessThan(170);
    await expect(page.locator('.format-guide-benefits .section-index')).toHaveText('WHY IT MATTERS');
    await expect(page.getByRole('heading', { name: processTitle })).toBeVisible();
    await expect(page.locator('.format-guide-benefits .home-benefit-grid a')).toHaveCount(3);
    await expect(page.locator('.format-guide-process .home-process-list li')).toHaveCount(5);
    await expect(page.locator('.expanded-faq-list article')).toHaveCount(faqCount);
    await expect(page.getByRole('heading', { name: formatQuestion })).toBeVisible();
    await expect(page.locator('.tool-notes,.specialized-notes')).toHaveCount(0);

    const visibleQuestions = await page.locator('.expanded-faq-list h3').allTextContents();
    const faqSchema = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent || '{}')).find((value) => value['@type'] === 'FAQPage'));
    expect(faqSchema.mainEntity.map((entry: { name: string }) => entry.name)).toEqual(visibleQuestions);
  }
});

test('image metadata viewer keeps its URL signals while adding photo-focused guidance', async ({ page }) => {
  await page.goto('/image-metadata-viewer/');

  await expect(page).toHaveTitle('Image Metadata Viewer – View EXIF, GPS & Photo Metadata | ViewExif');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'View image metadata including EXIF data, GPS location, camera settings, XMP, IPTC, color profiles and other hidden photo metadata directly in your browser.');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.viewexif.com/image-metadata-viewer/');
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Image Metadata Viewer');
  await expect(page.locator('.tool-hero .eyebrow')).toHaveText('Image & Photo Metadata Viewer');
  await expect(page.getByRole('heading', { name: 'What image metadata can you view?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Common image metadata fields' })).toBeVisible();
  await expect(page.locator('.image-metadata-fields tbody tr')).toHaveCount(10);
  await expect(page.locator('.image-metadata-fields')).toContainText('GPSLatitude / GPSLongitude');
  await expect(page.getByRole('heading', { name: 'Related image tools' })).toBeVisible();
  const relatedTools = page.locator('.related-tools');
  await expect(relatedTools.getByRole('link', { name: 'Image Privacy Checker' })).toHaveAttribute('href', '/image-privacy-checker/');
  await expect(relatedTools.getByRole('link', { name: 'Image Metadata Remover' })).toHaveAttribute('href', '/image-metadata-remover/');
  await expect(relatedTools.getByRole('link', { name: 'C2PA Viewer' })).toHaveAttribute('href', '/c2pa-viewer/');
  await expect(page.locator('.report-drop-copy')).toContainText(/PNG.*JPG.*JPEG.*WebP.*HEIC.*TIFF.*GIF/i);
});

test('metadata remover exposes file cleanup scope, verification steps, and type links', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/metadata-remover/');

  await expect(page).toHaveTitle('Metadata Remover – Remove File Metadata Online | ViewExif');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Remove metadata from images, videos, audio files and documents directly in your browser. Clean EXIF, GPS, author, timestamps and other hidden file metadata without uploading your files.');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.viewexif.com/metadata-remover/');
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Metadata Remover');
  await expect(page.locator('.tool-hero .eyebrow')).toHaveText('100% local processing · no upload');
  await expect(page.locator('.tool-hero-proof')).toContainText('Inspect → Remove → Verify');
  await expect(page.getByRole('heading', { name: 'What metadata can this remover clean?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Supported file types' })).toBeVisible();
  await expect(page.locator('.metadata-remover-format-list')).toContainText('PDF · DOCX · PPTX · XLSX');
  await expect(page.locator('.metadata-remover-format-list')).toContainText('MP3 · FLAC · OGG · OPUS · OGA · M4A · AAC · WAV · WMA');
  const scopeHeadingBox = await page.locator('.metadata-remover-seo-heading').boundingBox();
  const scopeGroupsBox = await page.locator('.metadata-remover-groups').boundingBox();
  expect(scopeHeadingBox).not.toBeNull();
  expect(scopeGroupsBox).not.toBeNull();
  expect(Math.abs(scopeHeadingBox!.x - scopeGroupsBox!.x)).toBeLessThanOrEqual(1);

  const formatSection = page.locator('.metadata-remover-formats');
  const formatBorders = await formatSection.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].map(Number.parseFloat);
  });
  expect(formatBorders.every((width) => width > 0)).toBe(true);
  const formatHeaderBox = await formatSection.locator(':scope > header').boundingBox();
  const formatListBox = await page.locator('.metadata-remover-format-list').boundingBox();
  expect(formatHeaderBox).not.toBeNull();
  expect(formatListBox).not.toBeNull();
  expect(Math.abs(formatHeaderBox!.x + formatHeaderBox!.width - formatListBox!.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(formatHeaderBox!.y - formatListBox!.y)).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
  const mobileGroups = await page.locator('.metadata-remover-groups article').evaluateAll((articles) => articles.map((article) => {
    const rect = article.getBoundingClientRect();
    return { x: rect.x, y: rect.y };
  }));
  expect(Math.abs(mobileGroups[0]!.x - mobileGroups[1]!.x)).toBeLessThanOrEqual(1);
  expect(mobileGroups[1]!.y).toBeGreaterThan(mobileGroups[0]!.y);
  const mobileFormatHeaderBox = await formatSection.locator(':scope > header').boundingBox();
  const mobileFormatListBox = await page.locator('.metadata-remover-format-list').boundingBox();
  expect(mobileFormatHeaderBox).not.toBeNull();
  expect(mobileFormatListBox).not.toBeNull();
  expect(Math.abs(mobileFormatHeaderBox!.y + mobileFormatHeaderBox!.height - mobileFormatListBox!.y)).toBeLessThanOrEqual(1);
  await expect(page.getByRole('heading', { name: 'How to remove metadata from a file' })).toBeVisible();
  await expect(page.locator('.format-guide-process .home-process-list li')).toHaveCount(4);
  for (const question of ['What is a metadata remover?', 'How do I remove metadata from a file?', 'What metadata can be removed?', 'Does removing metadata affect file quality?', 'Can all metadata be completely removed?', 'Are files uploaded?']) {
    await expect(page.getByRole('heading', { name: question })).toBeVisible();
  }
  const relatedTools = page.locator('.related-tools');
  await expect(page.getByRole('heading', { name: 'Metadata removal by file type' })).toBeVisible();
  for (const [name, href] of [['Image Metadata Remover', '/image-metadata-remover/'], ['Audio Metadata Remover', '/audio-metadata-remover/'], ['Document Metadata Remover', '/document-metadata-remover/'], ['Video Metadata Remover', '/video-metadata-remover/']] as const) {
    await expect(relatedTools.getByRole('link', { name })).toHaveAttribute('href', href);
  }
  const faqSchema = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent || '{}')).find((value) => value['@type'] === 'FAQPage'));
  expect(faqSchema.mainEntity).toHaveLength(9);
});

test('home and universal viewer show the same five expanded FAQ answers and schema', async ({ page }) => {
  const questions = [
    'Is this metadata viewer safe to use?',
    'Does this work for EXIF data?',
    'Can this reveal where a photo was taken?',
    'Can metadata be wrong?',
    'Can metadata restore blurred or redacted parts of an image?',
  ];
  for (const path of ['/', '/metadata-viewer/']) {
    await page.goto(path);
    const section = page.locator('.expanded-faq');
    await expect(section.getByRole('heading', { name: 'Frequently asked questions' })).toBeVisible();
    await expect(section.locator('details')).toHaveCount(0);
    await expect(section).toHaveCSS('color', 'rgb(23, 24, 21)');
    expect(await section.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe('rgb(23, 24, 21)');
    for (const question of questions) await expect(section.getByRole('heading', { name: question })).toBeVisible();
    const faqSchema = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent || '{}')).find((value) => value['@type'] === 'FAQPage'));
    expect(faqSchema.mainEntity.map((entry: { name: string }) => entry.name)).toEqual(questions);
  }
  await page.goto('/image-privacy-checker/');
  const privacyFaq = page.locator('.expanded-faq');
  await expect(privacyFaq.locator('details')).toHaveCount(0);
  await expect(privacyFaq.locator('.expanded-faq-list article')).toHaveCount(5);
});

test('privacy checker matches the homepage editorial structure with privacy-specific copy', async ({ page }) => {
  await page.goto('/image-privacy-checker/');
  await expect(page.getByRole('heading', { name: 'Why check image privacy?' })).toBeVisible();
  await expect(page.locator('.privacy-benefits .home-benefit-grid a')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'How the privacy check works' })).toBeVisible();
  await expect(page.locator('.privacy-process .home-process-list li')).toHaveCount(5);
  await expect(page.getByText('What this score cannot see')).toBeVisible();
  await expect(page.locator('.specialized-notes,.related-tools')).toHaveCount(0);
  const questions = await page.locator('.expanded-faq-list h3').allTextContents();
  const faqSchema = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent || '{}')).find((value) => value['@type'] === 'FAQPage'));
  expect(faqSchema.mainEntity.map((entry: { name: string }) => entry.name)).toEqual(questions);
  await page.setViewportSize({ width: 239, height: 844 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('home editorial sections fit an extremely narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 239, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Why view file metadata?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'How the local scan works' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.goto('/c2pa-viewer/');
  await expect(page.getByRole('heading', { name: 'Content Credentials and C2PA' })).toBeVisible();
  const c2paOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(c2paOverflow).toBeLessThanOrEqual(1);
});

test('navigation uses direct task labels and pages contain no mojibake', async ({ page }) => {
  await page.goto('/');
  for (const label of ['View metadata', 'Remove metadata']) await expect(page.locator('.desktop-nav').getByText(label, { exact: true })).toBeVisible();
  for (const label of ['Check privacy', 'Verify C2PA']) await expect(page.locator('.desktop-nav').getByRole('link', { name: label, exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Read AI prompts|ComfyUI/i })).toHaveCount(0);
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/鈥|鈫|路|攁|攏|渘|渁|渟|�/);
});
