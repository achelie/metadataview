import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name)))).flat();
}
const pages = [];
for (const file of (await walk('dist')).filter(f => f.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  const field = re => html.match(re)?.[1] ?? '';
  const canonical = field(/<link rel="canonical" href="([^"]+)"/);
  const robots = field(/<meta name="robots" content="([^"]+)"/);
  if (!canonical || /noindex/.test(robots)) continue;
  pages.push({ canonical, title: field(/<title>(.*?)<\/title>/s), h1: field(/<h1[^>]*>(.*?)<\/h1>/s), robots,
    links: [...new Set([...html.matchAll(/href="(\/[^"?#]*)/g)].map(m => m[1]))].sort() });
}
pages.sort((a,b) => a.canonical.localeCompare(b.canonical));
if (process.argv.includes('--capture')) {
  process.stdout.write(JSON.stringify(pages, null, 2));
} else {
  const baselineFlag = process.argv.indexOf('--baseline');
  if (baselineFlag !== -1 && !process.argv[baselineFlag + 1]) throw new Error('--baseline requires a JSON file');
  const baselineFile = baselineFlag === -1 ? 'docs/content-url-baseline.json' : process.argv[baselineFlag + 1];
  const baseline = JSON.parse(await readFile(baselineFile, 'utf8'));
  const sitemap = await readFile('dist/sitemap.xml', 'utf8');
  const failures = [];
  const isBlogArchive = url => /^\/blog\/(?:page\/\d+\/)?$/.test(new URL(url).pathname);
  const archiveLinks = new Set(pages.filter(page => isBlogArchive(page.canonical)).flatMap(page => page.links));
  let movedArchiveEntries = 0;
  for (const old of baseline) {
    const current = pages.find(p => p.canonical === old.canonical);
    if (!current) { failures.push(`Missing indexable URL: ${old.canonical}`); continue; }
    for (const key of ['title', 'h1', 'robots']) if (current[key] !== old[key]) failures.push(`${old.canonical}: changed ${key}`);
    if (!sitemap.includes(`<loc>${old.canonical}</loc>`)) failures.push(`Missing sitemap entry: ${old.canonical}`);
    // Bundled stylesheet hashes change on rebuild; protect page entries, not asset filenames.
    for (const link of old.links.filter(link => !link.startsWith('/_astro/'))) {
      if (current.links.includes(link)) continue;
      // New articles move older cards through the existing pagination. Require
      // those article links to remain reachable in the archive and indexable.
      const movedArticle = isBlogArchive(old.canonical) && /^\/blog\/(?!page\/)[^/]+\/$/.test(link)
        && archiveLinks.has(link) && pages.some(page => new URL(page.canonical).pathname === link);
      if (movedArticle) movedArchiveEntries++;
      else failures.push(`${old.canonical}: removed internal entry ${link}`);
    }
  }
  if (failures.length) throw new Error(failures.join('\n'));
  console.log(`Preserved ${baseline.length} URLs, titles, H1s, robots, sitemap entries and existing internal links.`);
  if (movedArchiveEntries) console.log(`${movedArchiveEntries} article links moved within blog pagination and remain reachable and indexable.`);
}
