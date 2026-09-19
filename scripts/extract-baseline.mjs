// One-time recovery from immutable Git objects. Never reads a working output as source.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const baseline = '7a2d89409c81312b0439727e18dd93724357968e';
const root = path.resolve(import.meta.dirname, '..');
process.chdir(root);
if (fs.existsSync('src')) throw new Error('Sources already exist; recovery will not overwrite them.');
const read = (file, rev = baseline) => execFileSync('git', ['show', `${rev}:${file}`], {maxBuffer: 20_000_000});
const write = (file, data) => {fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file,data);};
const hash = value => createHash('sha256').update(value).digest('hex');
const files = execFileSync('git',['ls-tree','-r','--name-only',baseline],{encoding:'utf8'}).trim().split('\n');
const evidence = {baseline, files:{}, books:{}, homepageRecovery:{}};
for (const file of files) {
  const buffer=read(file); evidence.files[file]=hash(buffer);
  if (['README.md','DEPLOY.md','sitemap.xml'].includes(file)) continue;
  if (/^solutions\/class-(9|10)\/index.html$/.test(file)) continue;
  if (file==='index.html') continue;
  write(file.endsWith('.html') ? `src/pages/${file}` : file.startsWith('assets/') ? `src/${file}` : `public/${file}`,buffer);
}
// The intact historical portfolio matches the legitimate current document exactly
// after removing the injected book and restoring its two overwritten wrapper tags.
const original=read('index.html').toString();
const historical=read('index.html','7dcf3a5').toString();
const start=original.toLowerCase().indexOf('<!doctype html>');
const injected=original.toLowerCase().indexOf('<!doctype html>',start+1);
const card=original.indexOf('<a class="solution-card is-featured');
const bodyEnd=original.indexOf('</body>',card)+7;
const recovered=original.slice(start,injected)+'          </p>\n<div class="solutions-grid">\n'+original.slice(card,bodyEnd)+'\n</html>\n';
const normalize=s=>s.replace(/\r\n/g,'\n').trim();
if(normalize(recovered)!==normalize(historical)) throw new Error('Portfolio differs from historical candidate; manual comparison required.');
write('src/pages/index.html',historical);
evidence.homepageRecovery={candidate:'7dcf3a5',matchesCurrentPortfolioAfterRemovingInjection:true,sha256:hash(historical)};
for(const cls of [9,10]) {
  const original=read(`solutions/class-${cls}/index.html`).toString();
  let style=0,script=0;const data={};
  let shell=original.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/g,(_,attrs,body)=>{
    const file=`src/books/class-${cls}/style-${++style}.css`;write(file,body);
    return `<style${attrs}>@@SOURCE(${file})@@</style>`;
  }).replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/g,(whole,attrs,body)=>{
    if(/\bsrc\s*=/.test(attrs))return whole;
    const id=attrs.match(/\bid="([^"]+)"/)?.[1];
    if(id) {
      const value=JSON.parse(cls===9&&id==='bank-data'?gunzipSync(Buffer.from(body.trim(),'base64')).toString():body);
      const file=`content/books/class-${cls}/${id}.json`;write(file,JSON.stringify(value,null,2)+'\n');data[id]=value;
      return `<script${attrs}>@@${cls===9&&id==='bank-data'?'GZIP':'JSON'}(${file})@@</script>`;
    }
    const file=`src/books/class-${cls}/runtime-${++script}.js`;write(file,body);
    return `<script${attrs}>@@SOURCE(${file})@@</script>`;
  });
  write(`src/books/class-${cls}/shell.html`,shell);
  const bank=data[cls===9?'bank-data':'banks-data'];
  evidence.books[`class-${cls}`]={originalSha256:hash(original),dataHashes:Object.fromEntries(Object.entries(data).map(([id,value])=>[id,hash(JSON.stringify(value))])),bankCount:Object.values(bank).flat().length,readingSvgCount:[...shell.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].length,svgHashes:[...original.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map(m=>hash(m[0]))};
}
write('tests/baseline.json',JSON.stringify(evidence,null,2)+'\n');
console.log('Recovered portfolio matches legitimate current content. Extracted both books with baseline hashes.');
