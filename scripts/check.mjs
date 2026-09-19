import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash,webcrypto} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
process.chdir(path.resolve(import.meta.dirname,'..'));
const read=p=>fs.readFileSync(p,'utf8');
const hash=s=>createHash('sha256').update(s).digest('hex');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);
let checks=0;const results=[];
function check(name,fn){try{fn();checks++;results.push({name,status:'pass'});}catch(e){results.push({name,status:'fail',error:e.message});console.error(`FAIL ${name}: ${e.message}`);}}
const baseline=JSON.parse(read('tests/baseline.json'));
const files=walk('dist');
const htmlFiles=files.filter(p=>p.endsWith('.html'));
check('Build matches the current source inputs',()=>{
  const digest=createHash('sha256');
  for(const file of [...walk('src'),...walk('content'),...walk('public'),'scripts/build.mjs'].sort()){digest.update(file);digest.update(fs.readFileSync(file));}
  assert.equal(JSON.parse(read('dist/build-info.json')).sourceDigest,digest.digest('hex'),'Rebuild before checking');
});
check('Public output excludes sources, documents, credentials and caches',()=>{
  for(const f of files)assert(!/(?:^|\/)(?:src|content|docs|tests|scripts|node_modules|\.git|\.local)(?:\/|$)|\.(?:pdf|zip|md|env|pyc)$/.test(f),f);
  assert.equal(read('dist/CNAME').trim(),'imranbinmanzoor.com');
});
for(const f of htmlFiles)check(`HTML structure and local assets: ${f}`,()=>{
  const text=read(f);assert.equal((text.match(/<!doctype html>/gi)||[]).length,1,'one doctype');
  assert.equal((text.match(/<html\b/gi)||[]).length,1,'one document');
  assert(/^\s*<!doctype html>/i.test(text),'doctype first');assert(!text.includes('@@SOURCE('),'unexpanded source');
  assert.equal((text.match(/<title>/gi)||[]).length,1,'one title');
  const structural=text.replace(/<script\b[\s\S]*?<\/script>/gi,'').replace(/<style\b[\s\S]*?<\/style>/gi,'').replace(/<svg\b[\s\S]*?<\/svg>/gi,'');
  const ids=[...structural.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'duplicate structural IDs');
  for(const m of text.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)){
    const url=m[1];if(!url.startsWith('/')||url.startsWith('//'))continue;
    const raw=url.split(/[?#]/)[0];if(!raw)continue;
    const target='dist'+decodeURIComponent(raw)+(raw.endsWith('/')?'index.html':'');
    assert(fs.existsSync(target),`missing local target ${url}`);
  }
});
for(const f of files.filter(p=>p.endsWith('.js')))check(`JavaScript syntax: ${f}`,()=>new vm.Script(read(f),{filename:f}));
for(const cls of [9,10])check(`Class ${cls}: authored data and question identities preserved`,()=>{
  const html=read(`dist/solutions/class-${cls}/index.html`),expected=baseline.books[`class-${cls}`];
  for(const [id,expectedHash]of Object.entries(expected.dataHashes)){
    const match=html.match(new RegExp(`<script[^>]+id="${id}"[^>]*>([\\s\\S]*?)<\\/script>`));assert(match,`missing ${id}`);
    const data=JSON.parse(cls===9&&id==='bank-data'?gunzipSync(Buffer.from(match[1],'base64')).toString():match[1]);
    assert.equal(hash(JSON.stringify(data)),expectedHash,`${id} changed`);
    if(id==='bank-data'||id==='banks-data'){
      const items=Object.values(data).flat();assert.equal(items.length,expected.bankCount);
      assert.equal(new Set(items.map(x=>x.id)).size,items.length,'duplicate question IDs');
    }
  }
});
check('Class 9 SVG reading source is preserved',()=>{
  const source=read('src/books/class-9/shell.html');
  const hashes=[...source.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map(m=>hash(m[0]));
  const original=baseline.books['class-9'].svgHashes;
  assert(hashes.length>100,'expected preserved mathematics');
  const counts=new Map();for(const h of original)counts.set(h,(counts.get(h)||0)+1);
  for(const h of hashes){assert((counts.get(h)||0)>0,'new or modified SVG');counts.set(h,counts.get(h)-1);}
  assert.equal(hashes.length,baseline.books['class-9'].readingSvgCount,'reading SVG count changed');
});
check('Manifest matches actual published Class 10 units',()=>{
  const manifest=JSON.parse(read('content/library.json'));const data=JSON.parse(read('content/books/class-10/content-data.json'));
  assert.deepEqual(manifest.books.find(b=>b.class===10).units.map(u=>u.id),Object.keys(data).map(k=>'unit-'+k));
  const library=read('dist/solutions/index.html');assert(!library.includes('3 published'));assert(!library.includes('@@'));
});

// Test the same pure selection and serialization code assembled into the browser.
const book=JSON.parse(read('content/books/class-10/book-data.json'));
const bank=JSON.parse(read('content/books/class-10/banks-data.json'))['1'];
const context=vm.createContext({BOOK:book,crypto:webcrypto,btoa:s=>Buffer.from(s).toString('base64'),atob:s=>Buffer.from(s,'base64').toString(),console});
vm.runInContext(read('src/scripts/practice-engine.js')+'\nthis.api={practicePattern,buildPaper,decodePaperCode,randomizePaper,flatPaper,rngFrom};',context);
const api=context.api;
const json=v=>JSON.parse(JSON.stringify(v));
const options={kind:'practice',mix:'mixed',sources:['1.1','1.2','1.3','1.4','review'],pattern:api.practicePattern({mcq:5,short:6,long:2},{sets:2,shortAttempts:[2,2],longAttempt:1})};
check('Practice: 100 seeds, unique calculations, marks, section timing and code round trips',()=>{
  for(let seed=0;seed<100;seed++){
    const paper=api.buildPaper(1,bank,{...options,seed});
    assert.equal(paper.marks,21);assert.deepEqual(json(paper.sections.map(s=>s.tag)),['Objective','Subjective']);
    assert.equal(paper.sections[1].newPage,true);assert.equal(paper.times.total,paper.times.objective+paper.times.subjective);
    const items=api.flatPaper(paper);assert.equal(items.length,new Set(items.map(x=>x.dedupe_key)).size,'duplicate calculation');
    const restored=api.buildPaper(1,bank,api.decodePaperCode(paper.code,1));
    assert.deepEqual(json(restored),json(paper),'paper code changes paper');
    for(const item of items.filter(x=>x.opts)){assert(item.answer>=0&&item.answer<4);const origin=bank.find(q=>q.id===item.id);assert.equal(item.opts[item.answer],origin.opts[origin.answer]);}
  }
});
check('Practice: partial randomization keeps untouched questions and option order',()=>{
  const paper=api.buildPaper(1,bank,{...options,seed:12});
  for(const [scope,frozen]of [['objective',[1,2]],['subjective',[0]],['short',[0,2]],['long',[0,1]]]){
    const next=api.randomizePaper(1,bank,paper,scope,api.rngFrom(52));
    for(const i of frozen)assert.deepEqual(json(next.settings.snapshot[i]),json(paper.settings.snapshot[i]));
    assert.notEqual(next.code,paper.code);assert.equal(next.marks,paper.marks);
  }
});
check('Practice: invalid settings, corrupted codes and unit mismatch rejected',()=>{
  for(const bad of [{...options,sources:[]},{...options,mix:'invalid'},{...options,pattern:api.practicePattern({mcq:0,short:0,long:0})}])assert.throws(()=>api.buildPaper(1,bank,bad));
  const p=api.buildPaper(1,bank,{...options,seed:3});assert.throws(()=>api.decodePaperCode(p.code.slice(0,-1)+'!',1));assert.throws(()=>api.decodePaperCode(p.code,9));
});
check('Practice: unit-test pattern has 75 marks and correct attempts',()=>{
  const p=api.buildPaper(1,bank,{...options,kind:'board',seed:5});assert.equal(p.marks,75);
  assert.deepEqual(json(p.settings.pattern.short.attempts),[6,6,6]);assert.equal(p.settings.pattern.long.attempt,3);
});
check('Math typography: upright operators preserve prose and existing TeX',()=>{
  const runtime=read('src/books/class-10/runtime-1.js');
  const start=runtime.indexOf('function themeMath(text)');
  const end=runtime.indexOf('/* R7: a single TeX',start);
  assert(start>=0&&end>start);
  const format=vm.runInNewContext(runtime.slice(start,end)+';themeMath',{reasonStyle:text=>text});
  assert.equal(format('$Re(z)+Im(z)$'),'$\\operatorname{Re}(z)+\\operatorname{Im}(z)$');
  assert.equal(format('$$Re(z) = 3$$'),'$$\\operatorname{Re}(z) = 3$$');
  const authored='Prose Re(z); $\\mathrm{Re}(z)+\\operatorname{Im}(z)$';
  assert.equal(format(authored),authored);
});

const modelContext=vm.createContext({window:{}});
vm.runInContext(read('src/assets/math-models.js'),modelContext);
const models=modelContext.window.MathModels;
const close=(actual,expected)=>assert(Math.abs(actual-expected)<1e-9,actual+' differs from '+expected);
check('Math explorer: odd layers count the cells of every displayed square',()=>{
  for(let n=1;n<=10;n++){
    const layers=models.squareLayers(n);assert.equal(layers.reduce((a,b)=>a+b,0),n*n);
    assert.equal(layers.at(-1),n*n-(n-1)*(n-1));
  }
  for(const n of [0,11,1.5,NaN])assert.throws(()=>models.squareLayers(n));
});
check('Math explorer: tangent contact and derivative at every slider position',()=>{
  for(let a=-2;a<=2;a+=.25){const t=models.tangent(a);close(t.at(a),a*a);
    const h=.001;close(t.slope,((a+h)**2-(a-h)**2)/(2*h));
    for(const x of [-3,-.5,0,1,3])close(x*x-t.at(x),(x-a)**2);
  }
  assert.throws(()=>models.tangent(Infinity));
});
check('Math explorer: exact coin probabilities agree with exhaustive outcomes',()=>{
  for(let n=2;n<=12;n++){
    const counts=Array(n+1).fill(0);
    for(let mask=0;mask<2**n;mask++)counts[mask.toString(2).replaceAll('0','').length]++;
    const distribution=models.fairCoins(n);
    distribution.forEach((d,k)=>{assert.equal(d.ways,counts[k]);close(d.probability,counts[k]/2**n)});
    close(distribution.reduce((a,d)=>a+d.probability,0),1);
    close(distribution.reduce((a,d)=>a+d.heads*d.probability,0),n/2);
  }
  for(const n of [1,13,2.5,NaN])assert.throws(()=>models.fairCoins(n));
});

fs.mkdirSync('test-results',{recursive:true});
fs.writeFileSync('test-results/check.json',JSON.stringify({build:JSON.parse(read('dist/build-info.json')),checks,failed:results.filter(x=>x.status==='fail').length,results,limitations:['Content preservation is not mathematical verification.','Browser and A4 evidence are recorded separately.']},null,2));
console.log(`${checks} checks passed; ${results.length-checks} failed. Details: test-results/check.json`);
if(checks!==results.length)process.exitCode=1;
