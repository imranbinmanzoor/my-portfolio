import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {renderOverview} from '../src/books/overview.mjs';
import {renderProject,renderProjectCards,renderProjectTiles} from '../src/projects/render.mjs';
import {breadcrumbs} from './seo-pages.mjs';
import {buildBookPages} from './book-pages.mjs';
import {socialMetadata} from './social-metadata.mjs';
import {cleanMarkupLabels} from './math-labels.mjs';
// Without JavaScript the Class 9 book shows every section in order, and says what needs JavaScript.
const CLASS9_NOSCRIPT='<noscript><style>html body[data-book="9"][data-view] .unit-doc{display:block!important}html body[data-book="9"] .panel[hidden]:not([data-panel="generator"]){display:block!important}html body[data-book="9"] :is(.tabs-wrap,.searchbar,.search-scope,.panel[data-panel="generator"]){display:none!important}</style><p class="noscript-note">JavaScript is turned off, so every section of Unit 1 appears below the contents, one after another. Search and Practice papers need JavaScript.</p></noscript>';
const root=path.resolve(import.meta.dirname,'..');
process.chdir(root);
const out=path.join(root,'dist');
if(path.dirname(out)!==root || path.basename(out)!=='dist' || (fs.existsSync(out)&&fs.lstatSync(out).isSymbolicLink())) throw new Error('Unsafe output directory');
if(fs.existsSync(out))fs.rmSync(out,{recursive:true});
fs.mkdirSync(out);
const read=p=>fs.readFileSync(p,'utf8');
const replaceOnce=(text,from,to)=>{const i=text.indexOf(from);if(i<0||text.indexOf(from,i+1)>=0)throw new Error('Expected exactly one: '+from.slice(0,60));return text.slice(0,i)+to+text.slice(i+from.length);};
const write=(p,value)=>{fs.mkdirSync(path.dirname(path.join(out,p)),{recursive:true});fs.writeFileSync(path.join(out,p),value);};
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);
function portableGzip(value) {
  const bytes=gzipSync(value,{level:9});
  // RFC 1952: the header's OS byte is informational; 255 means unknown.
  // Normalizing it keeps Windows and Linux artifacts byte-identical.
  bytes[9]=255;
  return bytes.toString('base64');
}
export const expand=text=>text.replace(/@@(SOURCE|JSON|GZIP|BOOK|PROJECTS|PROJECT)\(([^)]+)\)@@/g,(_,kind,file)=>{
  if(kind==='PROJECTS') {
    const projects=JSON.parse(read('content/projects.json'));
    if(file==='cards')return renderProjectCards(projects);
    if(file==='tiles')return renderProjectTiles(projects);
    throw new Error('Unknown project collection');
  }
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
function cards(){
  // Available books are the page's primary actions; planned books are a quieter status list.
  const available=library.books.filter(b=>b.units.length).map(b=>`<article class="library-card"><div class="library-cover" aria-hidden="true"><small>MATHEMATICS</small><strong>${String(b.class).padStart(2,'0')}</strong></div><div class="library-card__body"><p class="publication-state">Available to study</p><h3>Class ${b.class} <span>Mathematics</span></h3><p class="edition">${escape(b.board)}</p><p class="book-description">Begin with ${escape(b.units[0].title)}: worked exercises, review questions and practice papers.</p></div><div class="library-card__foot"><span>${b.units.length} of ${b.inventory} units published</span><a class="book-entry" href="/solutions/class-${b.class}/">Open book<span class="sr-only"> — Class ${b.class}</span></a></div></article>`).join('\n');
  const planned=library.books.filter(b=>!b.units.length).map(b=>`<li><a href="/solutions/class-${b.class}/"><span class="library-planned__number" aria-hidden="true">${b.class}</span><span class="library-planned__text"><strong>Class ${b.class} Mathematics</strong><small>Solutions not published yet</small></span><span class="library-planned__action">View status</span></a></li>`).join('');
  return {available,planned};
}
for(const p of walk('src/pages')) {
  const catalog=cards();
  let html=expand(read(p)).replace('@@LIBRARY_CARDS@@',catalog.available).replace('@@LIBRARY_PLANNED@@',catalog.planned);
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
  if(cls===9){
    // The Class 9 shell is a locked, byte-preserved source (its mathematics exists only as
    // rendered SVG). Page-level metadata and landmarks are applied here, never in the shell.
    html=replaceOnce(html,'<title>Class 9 Mathematics — worked solutions</title>','<title>Class 9 Mathematics Solutions (Punjab Textbook Board) — Muhammad Imran</title>');
    html=replaceOnce(html,'<meta name="description" content="Punjab Textbook Board. Worked solutions for 1 of 13 units, exercise by exercise.">','<meta name="description" content="Free worked solutions for Punjab Textbook Board Class 9 Mathematics by Muhammad Imran. Unit 1, Real Numbers: concepts, examples, exercises, a unit test and practice papers.">\n<meta name="author" content="Muhammad Imran">\n<meta content="#f0f1f5" media="(prefers-color-scheme: light)" name="theme-color">\n<meta content="#17191e" media="(prefers-color-scheme: dark)" name="theme-color">');
    html=html.replace(/(<body\b[^>]*>)/,'$1\n<a class="skip-link" href="#book-content">Skip to content</a>');
    html=replaceOnce(html,'<main class="book">','<main class="book" id="book-content" tabindex="-1">');
    // Interface copy only: the search scope and the Unit Test note name what readers can see.
    html=replaceOnce(html,'Searches Concepts, Exercise 1.1 to 1.3 and their solutions. The Unit Test and generated papers are not searched.','Searches the concepts, worked examples, Exercises 1.1 to 1.3, the Review Exercise and their solutions. The Unit Test and generated papers are not searched.');
    html=replaceOnce(html,'<p class="sec-sub">Real Numbers. The printed unit test, with the corrections listed in the correction ledger applied.</p>','<p class="sec-sub">Real Numbers. The printed unit test, with the errors found in the printed version corrected.</p>');
    // Spoken labels: remove TeX debris only (see scripts/math-labels.mjs and docs/MATH_CORRECTION_LOG.md).
    html=cleanMarkupLabels(html);
  }
  if(cls===10) html=html.replace(/<script type="text\/plain" id="book-runtime">([\s\S]*?)<\/script>/,(_,runtime)=>{write('assets/books/class-10-runtime.js',runtime);return '<script src="/assets/book-data.js" data-book-runtime="/assets/books/class-10-runtime.js" defer></script>';});
  // Externalize recovered CSS and behavior, preserving execution order and JSON IDs.
  let si=0,ji=0;
  html=html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/g,(_,attrs,body)=>{
    const p=`assets/books/class-${cls}-${++si}.css`;write(p,body);return `<link rel="stylesheet" href="/${p}">`;
  }).replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/g,(whole,attrs,body)=>{
    if(/\b(src|id)\s*=/.test(attrs)||/type=["']application\/(?:ld\+)?json["']/.test(attrs))return whole;
    const p=`assets/books/class-${cls}-${++ji}.js`;write(p,body);return `<script src="/${p}"></script>`;
  });
  // Added after styles are externalized so this block stays inline and file numbering is unchanged.
  if(cls===9) html=replaceOnce(html,'<main class="book" id="book-content" tabindex="-1">','<main class="book" id="book-content" tabindex="-1">'+CLASS9_NOSCRIPT);
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
