import {readFile,writeFile,access,mkdir} from 'node:fs/promises';
import path from 'node:path';

// Reuses the saved HTML from audit-adsense-pages rather than changing its record.
const usage = 'Usage: node scripts/audit-adsense-images.mjs --evidence <crawl.json> --output-dir <directory>';
if (process.argv.includes('--help')) {
  console.log(usage + '\nFetches deduplicated img/source src and srcset URLs from saved crawl HTML. Writes images.json; existing output is never overwritten.');
  process.exit(0);
}
const args = process.argv.slice(2);
const options = new Map();
for (let index = 0; index < args.length; index += 2) {
  const key = args[index], value = args[index + 1];
  if (!['--evidence', '--output-dir'].includes(key) || options.has(key) || !value || value.startsWith('--')) {
    console.error(usage);
    process.exit(1);
  }
  options.set(key, value);
}
if (options.size !== 2) {
  console.error(usage);
  process.exit(1);
}
const evidencePath = path.resolve(options.get('--evidence'));
const outputPath = path.join(path.resolve(options.get('--output-dir')), 'images.json');
try {
  await access(outputPath);
  throw new Error('Refusing to overwrite existing evidence: ' + outputPath);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const d = JSON.parse(await readFile(evidencePath, 'utf8'));
if (!Array.isArray(d.records) || !d.records.length) throw new Error('The supplied evidence must contain a non-empty records array');
await mkdir(path.dirname(outputPath), {recursive: true});
const imgs=new Map();
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map(m=>[m[1].toLowerCase(),m[2]??m[3]??m[4]]));
let imgElements=0;
for(const p of d.records){const html=await readFile(p.htmlFile,'utf8');for(const match of html.matchAll(/<(?:img|source)\b[^>]*>/gi)){
 const a=attrs(match[0]);if(match[0].startsWith('<img'))imgElements++;
 const urls=[...(a.src?[a.src]:[]),...(a.srcset?a.srcset.split(',').map(part=>part.trim().split(/\s+/)[0]):[])];
 for(const u of urls){if(!u||u.startsWith('data:'))continue;const abs=new URL(u,p.url).href;const item=imgs.get(abs)??{url:abs,pages:[]};if(!item.pages.includes(p.url))item.pages.push(p.url);imgs.set(abs,item);}
}}
const targets=[...imgs.values()];
let next=0;const results=[];
const checkedAt=new Date().toISOString();
await Promise.all(Array.from({length:4},async()=>{while(next<targets.length){const index=next++,item=targets[index],start=performance.now();try{
 const r=await fetch(item.url,{headers:{'user-agent':'Mozilla/5.0 (compatible; ViewExifReadinessAudit/1.0; read-only image availability)'},signal:AbortSignal.timeout(20000)});
 const bytes=new Uint8Array(await r.arrayBuffer());
 results[index]={...item,status:r.status,finalUrl:r.url,contentType:r.headers.get('content-type'),bytes:bytes.length,ms:Math.round(performance.now()-start),signature:Array.from(bytes.slice(0,16)).map(b=>b.toString(16).padStart(2,'0')).join('')};
 }catch(e){results[index]={...item,error:e.message,ms:Math.round(performance.now()-start)}}
 await new Promise(r=>setTimeout(r,100));
}}));
const summary={checkedAt,finishedAt:new Date().toISOString(),htmlPages:d.records.length,imgElements,uniqueTargets:targets.length,failed:results.filter(r=>r.error||r.status!==200||!r.contentType?.startsWith('image/')||!r.bytes),totalBytes:results.reduce((n,r)=>n+(r.bytes??0),0)};
await writeFile(outputPath,JSON.stringify({summary,results},null,2),{flag:'wx'});
console.log(JSON.stringify(summary,null,2));
if (summary.failed.length) process.exitCode = 1;
