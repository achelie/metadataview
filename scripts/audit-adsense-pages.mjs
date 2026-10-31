import {mkdir,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import * as dns from 'node:dns/promises';
import path from 'node:path';
import tls from 'node:tls';

// Fetches public HTML only: it neither executes advertising code nor clicks ads.
// Keep each audit in a fresh directory so before/after evidence stays separate.
const usage = 'Usage: node scripts/audit-adsense-pages.mjs --output-dir <new-directory>';
if (process.argv.includes('--help')) {
  console.log(usage + '\nFetches the current production sitemap, all pages, internal targets, crawler probes, DNS and TLS. Writes crawl.json and html/. Existing directories are never overwritten.');
  process.exit(0);
}
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--output-dir' || !args[1] || args[1].startsWith('--')) {
  console.error(usage);
  process.exit(1);
}
const root = 'https://www.viewexif.com';
const stamp = new Date().toISOString();
const outputDir = path.resolve(args[1]);
try {
  await access(outputDir);
  throw new Error('Refusing to overwrite existing evidence directory: ' + outputDir);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await mkdir(path.dirname(outputDir), {recursive: true});
await mkdir(outputDir);
const evidencePath = path.join(outputDir, 'crawl.json');
const folder = path.join(outputDir, 'html');
await mkdir(folder);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ua='Mozilla/5.0 (compatible; ViewExifReadinessAudit/1.0; read-only metadata fetch)';
const decode=s=>s.replace(/&(?:amp|quot|apos|lt|gt|nbsp);|&#(?:x[0-9a-f]+|[0-9]+);/gi,m=>({ '&amp;':'&','&quot;':'"','&apos;':"'",'&lt;':'<','&gt;':'>','&nbsp;':' ' }[m]??String.fromCodePoint(m[2]==='x'?parseInt(m.slice(3,-1),16):parseInt(m.slice(2,-1),10))));
const strip=s=>decode(s.replace(/<(script|style|template|svg)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
const attrs=s=>Object.fromEntries([...s.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)].map(m=>[m[1].toLowerCase(),decode(m[2]??m[3]??m[4])]));
const tags=(s,t)=>[...s.matchAll(new RegExp('<'+t+'\\b[^>]*>','gi'))].map(m=>attrs(m[0]));
async function get(url,userAgent=ua){
 const began=performance.now();let cur=url;const chain=[];
 try{for(let i=0;i<7;i++){
  const r=await fetch(cur,{headers:{'user-agent':userAgent},redirect:'manual',signal:AbortSignal.timeout(20000)});
  const html=await r.text();const headers=Object.fromEntries(r.headers);
  chain.push({url:cur,status:r.status,location:r.headers.get('location'),contentType:r.headers.get('content-type')});
  if(r.status>=300&&r.status<400&&r.headers.get('location')){cur=new URL(r.headers.get('location'),cur).href;continue;}
  return {requestedUrl:url,url:cur,status:r.status,headers,chain,ms:Math.round(performance.now()-began),html};
 }return {requestedUrl:url,url:cur,error:'too many redirects',chain,ms:Math.round(performance.now()-began)};
 }catch(e){return {requestedUrl:url,url:cur,error:e.message,cause:e.cause?.message,chain,ms:Math.round(performance.now()-began)};}
}
async function pool(items,fn,concurrency=4){let next=0;const results=[];await Promise.all(Array.from({length:concurrency},async()=>{while(next<items.length){const i=next++;results[i]=await fn(items[i],i);await sleep(120);}}));return results;}
const sitemap=await get(root+'/sitemap.xml');
if (sitemap.status !== 200 || !sitemap.html) {
  await writeFile(evidencePath, JSON.stringify({checkedAt: stamp, sitemap, error: 'Cannot read production sitemap'}, null, 2), {flag: 'wx'});
  throw new Error('Cannot read production sitemap; see ' + evidencePath);
}
const sitemapUrls=[...sitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>decode(m[1]));
if (!sitemapUrls.length || !/<urlset\b/.test(sitemap.html)) throw new Error('Expected a non-empty direct sitemap urlset');
console.log('Live sitemap URLs:',sitemapUrls.length);
const records=await pool(sitemapUrls,async(url,i)=>{
 const r=await get(url);if(!r.html)return r;
 const html=r.html,metas=tags(html,'meta'),links=tags(html,'link'),anchors=tags(html,'a'),forms=tags(html,'form'),scripts=tags(html,'script');
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]??'';
 const mainText=strip(main);
 const internalLinks=[...new Set(anchors.map(a=>{try{const u=new URL(a.href,r.url);if(u.origin===root)return u.href;}catch{}return null;}).filter(Boolean))];
 const r2={...r,title:strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]??''),h1:[...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m=>strip(m[1])),canonical:links.filter(l=>l.rel==='canonical').map(l=>l.href),robots:metas.filter(m=>m.name?.toLowerCase()==='robots').map(m=>m.content),xRobots:r.headers['x-robots-tag']??'',language:tags(html,'html')[0]?.lang,description:metas.find(m=>m.name==='description')?.content,adsenseMeta:metas.filter(m=>m.name==='google-adsense-account').map(m=>m.content),adRuntime:scripts.filter(s=>/adsbygoogle|pagead|googlesyndication|fundingchoices/i.test(s.src??'')),scripts:scripts.filter(s=>s.src).map(s=>s.src),forms:forms.map(f=>({method:f.method,action:f.action})),ids:[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]),internalLinks,mainChars:mainText.length,mainWords:mainText.split(/\s+/).length,mainHash:createHash('sha256').update(mainText).digest('hex'),mainText};
 delete r2.html;
 await writeFile(`${folder}/${String(i).padStart(3,'0')}.html`,html);
 r2.htmlFile=`${folder}/${String(i).padStart(3,'0')}.html`;
 if((i+1)%20===0)console.log('Pages fetched:',i+1);
 return r2;
});
const pageMap=new Map(records.map(p=>[p.requestedUrl,p]));
const allLinkTargets=[...new Set(records.flatMap(p=>p.internalLinks??[]).map(l=>{const u=new URL(l);u.hash='';return u.href;}))];
const missingLinks=allLinkTargets.filter(u=>!pageMap.has(u));
console.log('Additional internal link targets:',missingLinks.length);
const linkedExtra=await pool(missingLinks,async u=>{const r=await get(u);delete r.html;return r;});
const specialTargets=['https://viewexif.com/','http://viewexif.com/','http://www.viewexif.com/','https://www.viewexif.com/robots.txt','https://viewexif.com/robots.txt','https://www.viewexif.com/ads.txt','https://viewexif.com/ads.txt',`${root}/__adsense-audit-does-not-exist-${stamp.slice(0,10)}/`];
const specials=await pool(specialTargets,u=>get(u));
const probes=await pool(['Mediapartners-Google','Google-Display-Ads-Bot','AdsBot-Google (+http://www.google.com/adsbot.html)','Googlebot/2.1 (+http://www.google.com/bot.html)'],async agent=>{
 const r=await get(root+'/',agent);return {userAgent:agent,status:r.status,url:r.url,error:r.error,headers:r.headers,chain:r.chain,ms:r.ms,title:strip(r.html?.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]??''),bodyChars:r.html?.length};
},2);
const dnsResults=await Promise.all(['www.viewexif.com','viewexif.com'].map(async hostname=>{
 const queries=await Promise.allSettled([dns.lookup(hostname,{all:true}),dns.resolve4(hostname),dns.resolve6(hostname)]);
 return {hostname,lookup:queries[0],A:queries[1],AAAA:queries[2]};
}));
const tlsResults=await Promise.all(['www.viewexif.com','viewexif.com'].map(hostname=>new Promise(resolve=>{
 const socket=tls.connect({host:hostname,port:443,servername:hostname,rejectUnauthorized:true},()=>{
  const cert=socket.getPeerCertificate();resolve({hostname,authorized:socket.authorized,protocol:socket.getProtocol(),issuer:cert.issuer,subject:cert.subject,subjectaltname:cert.subjectaltname,validFrom:cert.valid_from,validTo:cert.valid_to,fingerprint256:cert.fingerprint256});socket.end();
 });socket.setTimeout(15000,()=>{resolve({hostname,error:'TLS timeout'});socket.destroy();});socket.on('error',e=>resolve({hostname,error:e.message}));
})));
const groups=field=>{const map=new Map();for(const p of records){const key=p[field];if(key){const a=map.get(key)??[];a.push(p.url);map.set(key,a);}}return [...map].filter(([,a])=>a.length>1).map(([value,urls])=>({value,urls}));};
const badAnchors=[];for(const p of records)for(const link of p.internalLinks??[]){const u=new URL(link);if(!u.hash)continue;const hash=decodeURIComponent(u.hash.slice(1));u.hash='';const dest=pageMap.get(u.href);if(dest?.ids&&!dest.ids.includes(hash))badAnchors.push({from:p.url,to:link});}
const summary={checkedAt:stamp,finishedAt:new Date().toISOString(),sitemapCount:sitemapUrls.length,pageCount:records.length,pageFailures:records.filter(r=>r.status!==200||r.error).map(r=>({url:r.requestedUrl,status:r.status,error:r.error})),canonicalMismatches:records.filter(r=>r.canonical?.length!==1||r.canonical[0]!==r.requestedUrl).map(r=>({url:r.requestedUrl,canonical:r.canonical})),missingTitles:records.filter(r=>!r.title).map(r=>r.url),missingH1:records.filter(r=>!r.h1?.length).map(r=>r.url),noindex:records.filter(r=>/noindex/i.test([...r.robots??[],r.xRobots].join(' '))).map(r=>r.url),adsenseMetaMismatches:records.filter(r=>r.adsenseMeta?.length!==1||r.adsenseMeta[0]!=='ca-pub-7443237558968985').map(r=>r.url),adRuntimePages:records.filter(r=>r.adRuntime?.length).map(r=>r.url),emptyMain:records.filter(r=>r.mainChars===0).map(r=>r.url),shortMain:records.filter(r=>r.mainChars<1000).map(r=>({url:r.url,chars:r.mainChars,words:r.mainWords})),duplicateTitles:groups('title'),duplicateMain:groups('mainHash'),uniqueInternalLinkTargets:allLinkTargets.length,additionalLinks:linkedExtra.length,internalLinkFailures:linkedExtra.filter(r=>r.status>=400||r.error),brokenAnchors:badAnchors,postForms:records.filter(r=>r.forms?.some(f=>f.method?.toLowerCase()==='post')).map(r=>r.url),p50ms:[...records].sort((a,b)=>a.ms-b.ms)[Math.floor(records.length/2)]?.ms,p95ms:[...records].sort((a,b)=>a.ms-b.ms)[Math.floor(records.length*.95)]?.ms};
const evidence={summary,sitemap:{...sitemap,html:undefined},records,linkedExtra,specials,probes,dnsResults,tlsResults,limitations:['Single-time audit from current workstation; not uptime monitoring.','Google User-Agent probes do not establish reachability from authentic Google crawler IPs or other countries.','Static GETs do not execute ad scripts or click ads.','Regex HTML extraction supports page inventory, not a plagiarism or visual assessment.','AdSense account ownership and dashboard Ready status cannot be proved from public identifiers.']};
await writeFile(evidencePath,JSON.stringify(evidence,null,2),{flag:'wx'});
console.log(JSON.stringify(summary,null,2));
if (summary.pageFailures.length || summary.canonicalMismatches.length || summary.missingTitles.length || summary.missingH1.length || summary.noindex.length || summary.adsenseMetaMismatches.length || summary.adRuntimePages.length || summary.emptyMain.length || summary.internalLinkFailures.length || summary.brokenAnchors.length) process.exitCode = 1;
