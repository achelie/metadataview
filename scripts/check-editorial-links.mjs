import { readFile, readdir } from 'node:fs/promises';

const links = new Map();
for (const file of await readdir('src/content/blog')) {
  if (!file.endsWith('.md')) continue;
  const body = await readFile(`src/content/blog/${file}`, 'utf8');
  for (const match of body.matchAll(/\]\((https?:\/\/[^\s)]+)\)/g)) {
    const url = match[1];
    links.set(url, [...new Set([...(links.get(url) ?? []), file])]);
  }
}
const pending = [...links];
const results = [];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (pending.length) {
    const [url, articles] = pending.shift();
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'ViewExif editorial link check' } });
      await response.body?.cancel();
      results.push({ url, articles, status: response.status, finalUrl: response.url, result: response.ok ? 'reachable' : [404,410].includes(response.status) ? 'broken' : 'unverified' });
    } catch (error) { results.push({ url, articles, status: null, result: 'unverified', error: error.message }); }
  }
}));
results.sort((a,b) => a.url.localeCompare(b.url));
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2));
if (results.some(r => r.result === 'broken')) process.exitCode = 1;
