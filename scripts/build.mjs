import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
const root=path.resolve(import.meta.dirname,'..');
process.chdir(root);
const out=path.join(root,'dist');
if(path.dirname(out)!==root || path.basename(out)!=='dist' || (fs.existsSync(out)&&fs.lstatSync(out).isSymbolicLink())) throw new Error('Unsafe output directory');
if(fs.existsSync(out))fs.rmSync(out,{recursive:true});
fs.mkdirSync(out);
const read=p=>fs.readFileSync(p,'utf8');
const write=(p,value)=>{fs.mkdirSync(path.dirname(path.join(out,p)),{recursive:true});fs.writeFileSync(path.join(out,p),value);};
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);
function portableGzip(value) {
  const bytes=gzipSync(value,{level:9});
  // RFC 1952: the header's OS byte is informational; 255 means unknown.
  // Normalizing it keeps Windows and Linux artifacts byte-identical.
  bytes[9]=255;
  return bytes.toString('base64');
}
export const expand=text=>text.replace(/@@(SOURCE|JSON|GZIP)\(([^)]+)\)@@/g,(_,kind,file)=>{
  if(!/^(src|content)\//.test(file)||file.includes('..'))throw new Error('Invalid source include');
  const value=read(file);
  if(kind==='SOURCE')return expand(value);
  const json=JSON.stringify(JSON.parse(value)).replace(/</g,'\\u003c');
  return kind==='GZIP'?portableGzip(json):json;
});
for(const p of walk('public'))write(p.slice(7),fs.readFileSync(p));
for(const p of walk('src/assets'))write(p.slice(4),fs.readFileSync(p));
const library=JSON.parse(read('content/library.json'));
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function cards(){return library.books.map(b=>`<article class="library-card ${b.status==='planned'?'is-planned':''}">
<div class="library-card__top"><span class="book-level">${b.class}</span><span class="publication-state">${b.units.length?`${b.units.length} unit available`:'In preparation'}</span></div>
<h2>Class ${b.class} <span>Mathematics</span></h2><p class="edition">${escape(b.board||'FSc Mathematics')} · ${escape(b.edition)}</p>
<p class="book-description">${b.units.length?`Start with <strong>${escape(b.units[0].title)}</strong>. Explore ${b.units[0].exercises} worked exercises, review questions, and practice papers.`:'A future addition to the library. Worked solutions are not published yet.'}</p>
<div class="library-card__foot"><span>${b.units.length?`${b.inventory} units in contents`:'Publication planned'}</span><a href="/solutions/class-${b.class}/">${b.units.length?'Open book':'View status'} <span aria-hidden="true">↗</span><span class="sr-only"> — Class ${b.class}</span></a></div></article>`).join('\n');}
for(const p of walk('src/pages')) {
  let html=expand(read(p)).replace('@@LIBRARY_CARDS@@',cards());
  for(const b of library.books) html=html.replaceAll(`@@CLASS_${b.class}_COUNT@@`,String(b.units.length));
  write(p.slice(10),html);
}
for(const cls of [9,10]) {
  let html=expand(read(`src/books/class-${cls}/shell.html`));
  // Externalize recovered CSS and behavior, preserving execution order and JSON IDs.
  let si=0,ji=0;
  html=html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/g,(_,attrs,body)=>{
    const p=`assets/books/class-${cls}-${++si}.css`;write(p,body);return `<link rel="stylesheet" href="/${p}">`;
  }).replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/g,(whole,attrs,body)=>{
    if(/\b(src|id)\s*=/.test(attrs))return whole;
    const p=`assets/books/class-${cls}-${++ji}.js`;write(p,body);return `<script src="/${p}"></script>`;
  });
  write(`solutions/class-${cls}/index.html`,html);
}
const routes=walk(out).filter(p=>p.endsWith('.html')).map(p=>p.slice(out.length+1).replaceAll('\\','/'));
const canonicalRoutes=routes.filter(p=>!read(path.join(out,p)).includes('http-equiv="refresh"')).map(p=>'/'+p.replace(/index.html$/,''));
write('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+canonicalRoutes.map(p=>`  <url><loc>https://imranbinmanzoor.com${p}</loc></url>`).join('\n')+'\n</urlset>\n');
const digest=createHash('sha256');
for(const file of [...walk('src'),...walk('content'),...walk('public'),'scripts/build.mjs'].sort()){digest.update(file);digest.update(fs.readFileSync(file));}
const info={sourceDigest:digest.digest('hex'),baseline:'7a2d89409c81312b0439727e18dd93724357968e',routes:routes.map(p=>'/'+p.replace(/index.html$/,''))};
write('build-info.json',JSON.stringify(info,null,2)+'\n');
console.log(`Built ${routes.length} HTML routes into dist/. Source ${info.sourceDigest.slice(0,12)}. No deployment performed.`);
