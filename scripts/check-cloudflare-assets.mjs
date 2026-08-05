import { readdir, stat } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const outputDirectory = fileURLToPath(new URL('../dist/', import.meta.url));
const cloudflareFileLimit = 25 * 1024 * 1024;
const files = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile()) files.push({ path, size: (await stat(path)).size });
  }
}

await walk(outputDirectory);
const oversized = files.filter((file) => file.size > cloudflareFileLimit);
if (oversized.length) {
  const details = oversized.map((file) => `${relative(outputDirectory, file.path)} (${file.size.toLocaleString('en-US')} bytes)`).join('\n');
  throw new Error(`Cloudflare Pages rejects individual assets above 25 MiB:\n${details}`);
}

const wasm = files.filter((file) => extname(file.path) === '.wasm');
if (!wasm.length) throw new Error('No standalone WebAssembly asset was emitted. ExifTool must stay lazy and must not be inlined into JavaScript.');
const exifToolWasm = wasm.find((file) => file.size > 20 * 1024 * 1024);
if (!exifToolWasm) throw new Error('The standalone ExifTool/ZeroPerl WASM asset is missing. A build without it would fail after upload in production.');

const largest = wasm.reduce((current, file) => file.size > current.size ? file : current, wasm[0]);
const margin = cloudflareFileLimit - largest.size;
console.log(`Cloudflare asset check: ${wasm.length} WASM files; largest ${largest.size.toLocaleString('en-US')} bytes; ${margin.toLocaleString('en-US')} bytes below the 25 MiB limit.`);
