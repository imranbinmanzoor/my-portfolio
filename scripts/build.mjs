import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {renderOverview} from '../src/books/overview.mjs';
import {renderProject} from '../src/projects/render.mjs';
import {breadcrumbs} from './seo-pages.mjs';
import {buildBookPages} from './book-pages.mjs';
import {socialMetadata} from './social-metadata.mjs';
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
export const expand=text=>text.replace(/@@(SOURCE|JSON|GZIP|BOOK|PROJECT)\(([^)]+)\)@@/g,(_,kind,file)=>{
  if(kind==='PROJECT') {
    const projects=JSON.parse(read('content/projects.json'));
    const project=projects.find(p=>p.slug===file);
    if(!project)throw new Error('Unknown project');
    return renderProject(project,projects);
  }
  if(kind==='BOOK') {
    const cls=Number(file);if(![9,10].includes(cls))throw new Error('Unknown book');
    const meta=JSON.parse(read('content/library.json')).books.find(b=>b.class===cls);
    const units=cls===9?JSON.parse(read('content/books/class-9/catalog.json')):JSON.parse(read('content/books/class-10/book-data.json')).units.map(u=>({n:u.n,title:u.title,available:meta.units.some(m=>m.id==='unit-'+u.n),exercises:u.exercises.length,href:'/solutions/class-10/'+u.slug+'/exercise-'+u.exercises[0].replaceAll('.','-')+'/',practice:'/solutions/class-10/#/unit-'+u.n+'/generator'}));
    return renderOverview({class:cls,board:meta.board,edition:meta.edition,units});
  }
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
function cards(){return library.books.map(b=>`<article class="library-card ${b.status==='planned'?'is-planned':''}"><div class="library-cover" aria-hidden="true"><small>MATHEMATICS</small><strong>${String(b.class).padStart(2,'0')}</strong></div><span class="publication-state">${b.units.length?'Available to study':'In preparation'}</span><h2>Class ${b.class}<span>Mathematics</span></h2><p class="edition">${escape(b.board||'FSc Mathematics')}</p><p class="book-description">${b.units.length?'Begin with '+escape(b.units[0].title)+'. Worked exercises, review questions, and practice papers.':'A future addition to the library. Solutions are not published yet.'}</p><div class="library-card__foot"><span>${b.units.length?b.units.length+' of '+b.inventory+' units available':'Publication planned'}</span><a class="${b.units.length?'book-entry':'book-status'}" href="/solutions/class-${b.class}/"><span class="btn__inner"><span class="btn__text">${b.units.length?'Open book':'View status'} <span class="sr-only"> — Class ${b.class}</span></span></span></a></div></article>`).join('\n');}
for(const p of walk('src/pages')) {
  let html=expand(read(p)).replace('@@LIBRARY_CARDS@@',cards());
  for(const b of library.books) html=html.replaceAll(`@@CLASS_${b.class}_COUNT@@`,String(b.units.length));
  write(p.slice(10),html);
}
for(const cls of [9,10]) {
  let html=expand(read(`src/books/class-${cls}/shell.html`));
  if(cls===10){
    const overview=html.match(/<template id="book-overview">([\s\S]*?)<\/template>/)[1];
    html=html.replace('<main class="wrap" id="book-main" tabindex="-1"></main>',`<main class="wrap" id="book-main" tabindex="-1">${overview}</main>`);
  }
  html=html.replace('</head>',breadcrumbs([{name:'Home',href:'/'},{name:'Mathematics',href:'/solutions/'},{name:'Class '+cls}])+'</head>');
  if(cls===10) html=html.replace(/<script type="text\/plain" id="book-runtime">([\s\S]*?)<\/script>/,(_,runtime)=>{write('assets/books/class-10-runtime.js',runtime);return '<script src="/assets/book-data.js" data-book-runtime="/assets/books/class-10-runtime.js" defer></script>';});
  // Externalize recovered CSS and behavior, preserving execution order and JSON IDs.
  let si=0,ji=0;
  html=html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/g,(_,attrs,body)=>{
    const p=`assets/books/class-${cls}-${++si}.css`;write(p,body);return `<link rel="stylesheet" href="/${p}">`;
  }).replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/g,(whole,attrs,body)=>{
    if(/\b(src|id)\s*=/.test(attrs)||/type=["']application\/(?:ld\+)?json["']/.test(attrs))return whole;
    const p=`assets/books/class-${cls}-${++ji}.js`;write(p,body);return `<script src="/${p}"></script>`;
  });
  write(`solutions/class-${cls}/index.html`,html);
}
buildBookPages({read,write,bookHTML:read(path.join(out,'solutions/class-10/index.html'))});
const routes=walk(out).filter(p=>p.endsWith('.html')).map(p=>p.slice(out.length+1).replaceAll('\\','/'));
for(const route of routes) write(route,socialMetadata(read(path.join(out,route))));
const canonicalRoutes=routes.filter(p=>!/(?:http-equiv="refresh"|name="robots" content="noindex)/i.test(read(path.join(out,p)))).map(p=>'/'+p.replace(/index.html$/,''));
write('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+canonicalRoutes.map(p=>`  <url><loc>https://imranbinmanzoor.com${p}</loc></url>`).join('\n')+'\n</urlset>\n');
const digest=createHash('sha256');
for(const file of [...walk('src'),...walk('content'),...walk('public'),...walk('scripts')].sort()){digest.update(file);digest.update(fs.readFileSync(file));}
const info={sourceDigest:digest.digest('hex'),baseline:'7a2d89409c81312b0439727e18dd93724357968e',routes:routes.map(p=>'/'+p.replace(/index.html$/,''))};
write('build-info.json',JSON.stringify(info,null,2)+'\n');
console.log(`Built ${routes.length} HTML routes into dist/. Source ${info.sourceDigest.slice(0,12)}. No deployment performed.`);
