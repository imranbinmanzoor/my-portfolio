import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {SITE,esc,prose,publishedUnits,buildMathReadingPages} from '../scripts/seo-pages.mjs';
const read=p=>fs.readFileSync(p,'utf8');
const decode=s=>s.replace(/&(?:amp|lt|gt|quot|apos|#39);/g,x=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&#39;':"'"}[x]));
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m=>[m[1].toLowerCase(),decode(m[2]??m[3])]));
const tags=(html,name)=>[...html.matchAll(new RegExp(`<${name}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`,'gi'))].map(m=>attrs(m[0]));
export function inspect(html) {
  const metas=tags(html,'meta'),links=tags(html,'link');
  const visible=html.replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
  // The interactive books contain alternate views hidden at initial load.
  const stack=[];let h1=0;
  for(const m of visible.matchAll(/<\/?([a-z][\w:-]*)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)) {
    const tag=m[1].toLowerCase(),closing=m[0][1]==='/';
    if(closing){const i=stack.map(x=>x.tag).lastIndexOf(tag);if(i>=0)stack.splice(i);continue;}
    const hidden=stack.some(x=>x.hidden)||/\s(?:hidden|aria-hidden="true")(?:\s|>|=)/.test(m[0]);
    if(tag==='h1'&&!hidden)h1++;
    if(!/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/.test(tag)&&!m[0].endsWith('/>'))stack.push({tag,hidden});
  }
  return {html,title:decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'').trim(),descriptions:metas.filter(x=>x.name==='description').map(x=>x.content),canonicals:links.filter(x=>x.rel==='canonical').map(x=>x.href),noindex:metas.some(x=>/^(robots|googlebot)$/.test(x.name)&&/\bnoindex\b/i.test(x.content)),redirect:metas.some(x=>x['http-equiv']?.toLowerCase()==='refresh'),h1,links:tags(visible,'a').map(x=>x.href).filter(Boolean),ids:new Set(tags(visible,'[a-z][\\w:-]*').map(x=>x.id).filter(Boolean)),ld:[...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m=>JSON.parse(m[1]))};
}
export function checkSEO({check,htmlFiles}) {
 const pages=new Map(htmlFiles.map(f=>['/'+f.slice(5).replace(/index\.html$/,''),{file:f,...inspect(read(f))}]));
 const canonical=[...pages].filter(([,p])=>!p.redirect&&!p.noindex);
 check('SEO: unique descriptive titles and descriptions, self-canonicals and one initial visible H1',()=>{
  const titles=new Set(),descriptions=new Set(),canonicals=new Set();
  for(const [url,p] of canonical){
   assert(p.title,`${url}: missing title`);assert(!titles.has(p.title),`${url}: duplicate title`);titles.add(p.title);
   assert.equal(p.descriptions.length,1,`${url}: description count`);assert(p.descriptions[0]?.trim());assert(!descriptions.has(p.descriptions[0]),`${url}: duplicate description`);descriptions.add(p.descriptions[0]);
   assert.deepEqual(p.canonicals,[SITE+url],`${url}: canonical mismatch`);assert(!canonicals.has(p.canonicals[0]));canonicals.add(p.canonicals[0]);
   assert.equal(p.h1,1,`${url}: initial visible H1 count`);
  }
 });
 check('SEO: sitemap exactly covers existing canonical indexable pages and excludes redirects/noindex',()=>{
  const urls=[...read('dist/sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>decode(m[1]));
  assert.equal(urls.length,new Set(urls).size);assert.deepEqual(urls.sort(),canonical.map(([url])=>SITE+url).sort());
 });
 check('SEO: planned books alone are noindex,follow; robots allows crawling and declares sitemap',()=>{
  assert.deepEqual([...pages].filter(([,p])=>p.noindex).map(([url])=>url).sort(),['/solutions/class-11/','/solutions/class-12/']);
  for(const cls of [11,12]){const p=pages.get(`/solutions/class-${cls}/`);assert(/noindex,follow/.test(p.html));assert(p.links.includes('/solutions/'));assert.deepEqual(p.canonicals,[`${SITE}/solutions/class-${cls}/`]);}
  const robots=read('dist/robots.txt');assert(/User-agent: \*/.test(robots));assert(/Allow: \//.test(robots));assert(!/^Disallow:\s*\S/m.test(robots));assert(robots.includes('Sitemap: '+SITE+'/sitemap.xml'));
 });
 const edges=new Map();
 check('SEO: all absolute/relative internal links resolve, including static fragments',()=>{
  for(const [url,p] of pages){
   const targets=[];
   for(const href of p.links){
    const target=new URL(href,SITE+url);if(target.origin!==SITE)continue;
    const pathname=decodeURIComponent(target.pathname);const local='dist'+pathname+(pathname.endsWith('/')?'index.html':'');
    assert(fs.existsSync(local),`${url}: broken link ${href}`);
    const canonicalPath=pathname.replace(/index\.html$/,'');targets.push(canonicalPath);
    if(target.hash&&!/^#\/|^#unit-|^#(?:contents|unit1|ex\d|review|unittest|generator)/.test(target.hash)){
     const dest=pages.get(canonicalPath);if(dest&&!dest.redirect)assert(dest.ids.has(decodeURIComponent(target.hash.slice(1))),`${url}: missing fragment ${href}`);
    }
   }
   edges.set(url,targets);
  }
 });
 check('SEO: every indexable page is reachable from homepage through static links',()=>{
  const seen=new Set(),queue=['/'];while(queue.length){const u=queue.shift();if(seen.has(u))continue;seen.add(u);queue.push(...(edges.get(u)||[]));}
  for(const [url] of canonical)assert(seen.has(url),`orphan: ${url}`);
 });
 check('SEO: JSON-LD parses throughout the site; reading breadcrumbs match crawlable pages',()=>{
  for(const [url,p] of pages)for(const ld of p.ld){assert(ld&&typeof ld==='object');assert(!JSON.stringify(ld).includes('MathSolver'));}
  for(const [url,p] of canonical.filter(([u])=>u.startsWith('/solutions/class-10/complex-numbers/'))){
   const crumb=p.ld.find(x=>x['@type']==='BreadcrumbList');assert(crumb,`${url}: missing breadcrumbs`);
   assert(crumb.itemListElement.length>=4);
   crumb.itemListElement.forEach((c,i)=>{assert.equal(c.position,i+1);assert(c.name);if(i<crumb.itemListElement.length-1){assert(c.item?.startsWith(SITE));assert(pages.has(new URL(c.item).pathname));}});
   assert.equal(p.ld.find(x=>x['@type']==='LearningResource')?.author.name,'Muhammad Imran');
   assert(p.html.includes('aria-label="Breadcrumb"'));
  }
 });
 check('SEO: complete authored questions, steps, compact work, notes and formulas survive generation',()=>{
  const book=JSON.parse(read('content/books/class-10/book-data.json')),all=JSON.parse(read('content/books/class-10/content-data.json'));
  let parts=0,expressions=0;
  const textFields=new Set(['term','statement','title','body','rule','example','examples','notes','watchOut','check','why','shortcut','alsoAcceptable','insight','stem','question','answer','steps','written','say','math','givens','sourceNote','intro','definitions','whyItWorks','history','questions','parts','options']);
  for(const {unit,exercises,review} of publishedUnits(book,all))for(const ex of [...exercises,...(review?[review]:[])]){
   const url=`/solutions/class-10/${unit.slug}/${ex===review?'review':'exercise-'+ex.exercise.replace('.','-')}/`,page=pages.get(url);assert(page,`missing ${url}`);
   function verify(v,key=''){
    if(typeof v==='string'){
     if(key==='math'||key==='givens'){assert(page.html.includes(esc(v.replace(/\b(Re|Im)(?=\s*\()/g,'\\operatorname{$1}'))),`${url}: lost formula`);expressions++;}
     else for(const piece of v.split(/\$\$?|<\/?em>/).filter(Boolean))assert(page.html.includes(esc(piece.replace(/\b(Re|Im)(?=\s*\()/g,'\\operatorname{$1}')))||page.html.includes(esc(piece)),`${url}: missing authored text ${piece.slice(0,90)}`);
    }else if(Array.isArray(v))v.forEach(x=>verify(x,key));else if(v&&typeof v==='object'){
     if(Object.hasOwn(v,'question')){parts++;assert(page.ids.has(v.id),`${url}: part ${v.id} missing`);}
     for(const [k,x] of Object.entries(v))if(textFields.has(k))verify(x,k);
    }
   }
   verify(ex);
   assert(page.html.includes('<math '));assert(!page.html.includes('katex-error'));
   assert(Buffer.byteLength(page.html)<2_000_000,`${url}: exceeds Googlebot HTML crawl budget`);
  }
  assert.equal(parts,130);assert(expressions>700);
 });
 check('SEO: inequality and unsafe-markup regression; partial units cannot create dead reading links',()=>{
  const h=prose('For $k<0$ use $x>0$. <em>Keep this</em> <script>alert(1)</script>');
  assert(h.includes('k&lt;0'));assert(h.includes('x&gt;0'));assert(h.includes('<em>Keep this</em>'));assert(!h.includes('<script>'));assert(h.includes('&lt;script&gt;'));
  const outputs=new Map();const book={units:[{n:2,title:'Test',slug:'test',exercises:['2.1','2.2']}]};const data={'2':{'2.2':{exercise:'2.2',questions:[{id:'test-q1',number:1,stem:'Test',parts:[{id:'test-p1',question:'$1+1$',answer:'$2$',steps:[{why:'Add.',math:'1+1=2'}]}]}]}}};
  buildMathReadingPages({read:p=>JSON.stringify(p.endsWith('/book-data.json')?book:data),write:(p,v)=>outputs.set(p,v),expand:s=>s});
  assert.equal(outputs.size,2);for(const html of outputs.values()){assert(!html.includes('href="exercise-2-1/"'));assert(!html.includes('href="../review/"'));}
 });
}
