import { readFile } from 'node:fs/promises';

const baseline = JSON.parse(await readFile('docs/content-url-baseline.json', 'utf8'));
const origin = 'https://www.viewexif.com';
const get = async url => {
  let error;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      return { status: response.status, url: response.url, html: await response.text(), robots: response.headers.get('x-robots-tag') ?? '' };
    } catch (caught) { error = caught; }
  }
  throw error;
};
const sitemap = await get(`${origin}/sitemap.xml`);
const pending = [...baseline];
const results = [];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (pending.length) {
    const entry = pending.shift();
    const route = new URL(entry.canonical).pathname;
    try {
      const live = await get(entry.canonical);
      const local = await readFile(`dist${route}index.html`, 'utf8');
      const failures = [];
      if (live.status !== 200 || live.url !== entry.canonical) failures.push('status/redirect');
      if (/noindex/i.test(live.robots) || /<meta name="robots" content="[^"]*noindex/i.test(live.html)) failures.push('noindex');
      for (const pattern of [/<title>(.*?)<\/title>/s, /<h1[^>]*>(.*?)<\/h1>/s, /<link rel="canonical" href="([^"]+)"/]) {
        if (live.html.match(pattern)?.[1] !== local.match(pattern)?.[1]) failures.push('SEO mismatch');
      }
      if (!sitemap.html.includes(`<loc>${entry.canonical}</loc>`)) failures.push('sitemap');
      if ((live.html.match(/name="google-adsense-account" content="ca-pub-7443237558968985"/g) ?? []).length !== 1) failures.push('account meta');
      if (/adsbygoogle|fundingchoicesmessages|pagead2\.googlesyndication/i.test(live.html)) failures.push('advertising runtime');
      if (local.includes('result-reading-guide') && !live.html.includes('result-reading-guide')) failures.push('missing result guide');
      if (/\/blog\/[^/]+\/$/.test(route) && !route.includes('/page/') && !live.html.includes('2026-09-05')) failures.push('stale article');
      results.push({ url: entry.canonical, status: live.status, failures });
    } catch (error) { results.push({ url: entry.canonical, failures: [error.message] }); }
  }
}));
const seller = 'google.com, pub-7443237558968985, DIRECT, f08c47fec0942fa0';
for (const host of [origin, 'https://viewexif.com']) {
  const result = await get(`${host}/ads.txt`);
  results.push({ url: `${host}/ads.txt`, status: result.status, failures: result.status === 200 && result.html.trim() === seller ? [] : ['seller mismatch'] });
}
results.sort((a,b) => a.url.localeCompare(b.url));
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2));
if (results.some(r => r.failures.length)) process.exitCode = 1;
