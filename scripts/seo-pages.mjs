// Static reading views of the same authored JSON used by the interactive book.
import katex from './vendor/katex.cjs';
export const SITE = 'https://imranbinmanzoor.com';
export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug = id => 'exercise-' + id.replaceAll('.', '-');
const anchor = item => item.id ? ` id="${esc(item.id)}"` : '';
const jsonLD = value => `<script type="application/ld+json">${JSON.stringify(value).replaceAll('<','\\u003c')}</script>`;
export function breadcrumbs(items) {
  return jsonLD({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,...(item.href?{item:SITE+item.href}:{})}))});
}
export function formula(tex, display = true, compact = false) {
  // Preserve original TeX in the annotation; use the same operator typography as the book.
  const normalized = tex.replace(/\b(Re|Im)(?=\s*\()/g,'\\operatorname{$1}');
  const rendered = katex.renderToString(normalized,{displayMode:display,throwOnError:true,strict:'error',trust:false,output:compact?'mathml':'htmlAndMathml'});
  return display ? `<div class="reading-math${compact?' reading-math-native':''}" tabindex="0" role="region" aria-label="Mathematical expression; scroll horizontally if needed">${rendered}</div>` : rendered;
}
export function prose(value) {
  // Escape ordinary text without mistaking a less-than sign for an HTML tag.
  // The authored source uses only em markup. All other markup remains escaped.
  const plain = s => esc(s).replace(/&lt;(\/?)em&gt;/g,'<$1em>');
  const text=String(value ?? ''); let output='',at=0;
  for(const m of text.matchAll(/\$\$([\s\S]*?)\$\$|\$([^$]*?)\$/g)) {
    output+=plain(text.slice(at,m.index))+formula(m[1]??m[2],m[1]!==undefined);at=m.index+m[0].length;
  }
  return output+plain(text.slice(at));
}
const paragraph = s => `<div class="reading-prose">${prose(s)}</div>`;
function notes(data) {
  const labels={check:'Check the answer',watchOut:'Watch out',shortcut:'Alternative method',alsoAcceptable:'Also correct',insight:'Observation'};
  return data ? `<aside class="reading-note">${Object.entries(data).map(([key,value])=>`<div><strong>${esc(labels[key]||key)}</strong>${typeof value==='string'?paragraph(value):`${value.math?formula(value.math):''}${paragraph(value.why)}`}</div>`).join('')}</aside>` : '';
}
function part(p,index) {
  return `<section class="reading-part"${anchor(p)}>
<h4>${esc(p.label || `(${String.fromCharCode(97+index)})`)}</h4>
${p.question?paragraph(p.question):''}
${p.givens?`<div class="reading-givens">${formula(p.givens)}</div>`:''}
${p.sourceNote?`<aside class="reading-note">${paragraph(p.sourceNote)}</aside>`:''}
${p.options?.length?`<ol type="a" class="reading-options">${p.options.map(o=>`<li>${prose(o)}</li>`).join('')}</ol>`:''}
${p.steps?.length?`<ol class="reading-steps">${p.steps.map(s=>`<li>${paragraph(s.why)}${s.math?formula(s.math):''}</li>`).join('')}</ol>`:''}
${p.answer?`<div class="reading-answer"><strong>Answer${Number.isInteger(p.correct)?` (${String.fromCharCode(97+p.correct)})`:''}</strong>${paragraph(p.answer)}</div>`:''}
${p.written?.length?`<details class="reading-compact"><summary>Compact solution</summary>${p.written.map(b=>`${b.say?paragraph(b.say):''}${b.math?formula(b.math,true,true):''}`).join('')}</details>`:''}
${notes(p.notes)}
${p.video?.provider==='youtube'?`<p><a href="https://www.youtube.com/watch?v=${encodeURIComponent(p.video.id)}">Watch the worked solution</a></p>`:''}
</section>`;
}
function question(q,isExample=false) {
  return `<article class="reading-question"${anchor(q)}><h3>${esc(isExample?q.label||'Worked example':`Question ${q.number}`)}</h3>${q.stem?paragraph(q.stem):''}${q.parts?.map(part).join('')||part(q,0)}</article>`;
}
function definition(d) {
  return `<article class="reading-definition"${anchor(d)}><h3>${prose(d.term)}</h3>${paragraph(d.statement)}${(d.notes||[]).map(paragraph).join('')}${d.examples?.length?`<ul>${d.examples.map(x=>`<li>${prose(x)}</li>`).join('')}</ul>`:''}</article>`;
}
function deep(d) {
  return `<article class="reading-definition"${anchor(d)}><h3>${prose(d.title)}</h3>${(d.body||[]).map(paragraph).join('')}${d.rule?`<aside class="reading-note">${paragraph(d.rule.statement)}${paragraph(d.rule.example)}</aside>`:''}</article>`;
}
function shell({title,description,path,trail,body,expand}) {
  return expand(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="author" content="Muhammad Imran">
<meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${SITE+path}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${SITE+path}">
<link rel="icon" href="/favicon.svg">@@SOURCE(src/components/site-foundation.html)@@
<link rel="stylesheet" href="/assets/site.css"><link rel="stylesheet" href="/assets/reading.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/katex.min.css">
${breadcrumbs(trail)}
${jsonLD({'@context':'https://schema.org','@type':'LearningResource','@id':SITE+path+'#resource',url:SITE+path,name:title,description,inLanguage:'en',educationalLevel:'Class 10',learningResourceType:'Worked mathematics solutions',author:{'@type':'Person',name:'Muhammad Imran',url:SITE+'/'},isAccessibleForFree:true})}
</head><body data-site><a class="skip-link" href="#main">Skip to content</a>@@SOURCE(src/components/site-header.html)@@
<main id="main" class="math-reading"><nav class="page-breadcrumb" aria-label="Breadcrumb"><ol>${trail.map(x=>`<li>${x.href?`<a href="${x.href}">${esc(x.name)}</a>`:`<span aria-current="page">${esc(x.name)}</span>`}</li>`).join('')}</ol></nav>
<div class="reading-inner">${body}<p class="reading-byline">Worked solutions by <a href="/">Muhammad Imran</a> · Independent PECTAA learning resource. Experimental edition; assessment session unverified.</p></div></main>
@@SOURCE(src/components/site-footer.html)@@<script src="/assets/scripts.js"></script></body></html>`);
}
export function publishedUnits(book,all) {
  return book.units.map(unit=>({unit,content:all[String(unit.n)]})).filter(x=>x.content).map(x=>({...x,exercises:x.unit.exercises.filter(id=>x.content[id]?.questions?.length).map(id=>x.content[id]),review:x.content[`Review ${x.unit.n}`]?.questions?.length?x.content[`Review ${x.unit.n}`]:null})).filter(x=>x.exercises.length);
}
export function buildMathReadingPages({read,write,expand}) {
  const book=JSON.parse(read('content/books/class-10/book-data.json'));
  const all=JSON.parse(read('content/books/class-10/content-data.json'));
  for(const {unit,exercises,review} of publishedUnits(book,all)) {
    const unitPath=`/solutions/class-10/${unit.slug}/`;
    const trail=[{name:'Home',href:'/'},{name:'Mathematics',href:'/solutions/'},{name:'Class 10',href:'/solutions/class-10/'}];
    const interactive=id=>`/solutions/class-10/#/unit-${unit.n}/${id}`;
    const unitDescription=`PECTAA Class 10 ${unit.title} solutions: ${exercises.map(e=>'Exercise '+e.exercise).join(', ')}${review?' and the review exercise':''}. Worked reasoning by Muhammad Imran.`;
    const topics=ex=>ex.definitions?.map(d=>d.term).join(' · ')||`${ex.questions.length} questions with worked solutions`;
    const hero=(heading,description,tab)=>`<header class="reading-hero"><p class="eyebrow">PECTAA · Class 10 Mathematics · Unit ${unit.n}</p><h1>${esc(heading)}</h1><p class="reading-lede">${esc(description)}</p><div class="reading-actions"><a class="btn" href="${interactive(tab)}">Open interactive ${tab==='review'?'review':'book'}</a><a href="${tab==='unit'?interactive('generator'):unitPath}">${tab==='unit'?'Build a practice paper':'Unit overview'}</a></div></header>`;
    const links=exercises.map(ex=>`<a class="reading-link" href="${slug(ex.exercise)}/"><strong>Exercise ${esc(ex.exercise)}</strong><span>${esc(topics(ex))}</span></a>`).join('')+(review?'<a class="reading-link" href="review/"><strong>Review exercise</strong><span>Multiple choice and written questions across the unit</span></a>':'');
    const unitBody=hero(`${unit.title} solutions`,unitDescription,'ex'+exercises[0].exercise.replace('.',''))+`<section class="reading-section"><h2>Study this unit</h2>${paragraph(unit.outcomes||'')}<div class="reading-grid">${links}</div><p><a href="${interactive('generator')}">Build a practice paper for this unit</a></p></section>`;
    write(unitPath.slice(1)+'index.html',shell({title:`Class 10 ${unit.title} Solutions | PECTAA Mathematics`,description:unitDescription,path:unitPath,trail:[...trail,{name:unit.title}],body:unitBody,expand}));
    const pages=[...exercises,...(review?[review]:[])];
    for(let index=0;index<pages.length;index++) {
      const ex=pages[index],isReview=ex===review,label=isReview?'Review exercise':`Exercise ${ex.exercise}`;
      const pagePath=unitPath+(isReview?'review':slug(ex.exercise))+'/';
      const description=`${label} solutions for PECTAA Class 10 ${unit.title}. ${ex.questions.length} questions with explained steps, answers and compact working by Muhammad Imran.`;
      const deepItems=[...(ex.whyItWorks||[]),...(ex.history||[])];
      const contents=`<nav class="reading-contents" aria-label="On this page">${ex.definitions?.length?'<a href="#concepts">Concepts</a>':''}${deepItems.length?'<a href="#understanding">Deep understanding</a>':''}${ex.examples?.length?'<a href="#examples">Worked examples</a>':''}<a href="#solutions">Solutions</a>${ex.questions.map(q=>`<a href="#${esc(q.id)}">Q${q.number}</a>`).join('')}</nav>`;
      const body=hero(`${label} solutions`,`${unit.title} — ${description}`,isReview?'review':'ex'+ex.exercise.replace('.',''))+contents+
        (ex.intro?paragraph(ex.intro):'')+
        (ex.definitions?.length?`<section class="reading-section" id="concepts"><h2>Key concepts</h2>${ex.definitions.map(definition).join('')}</section>`:'')+
        (deepItems.length?`<section class="reading-section" id="understanding"><h2>Deep understanding</h2>${deepItems.map(deep).join('')}</section>`:'')+
        (ex.examples?.length?`<section class="reading-section" id="examples"><h2>Worked examples</h2>${ex.examples.map(q=>question(q,true)).join('')}</section>`:'')+
        `<section class="reading-section" id="solutions"><h2>${label} questions and solutions</h2>${ex.questions.map(q=>question(q)).join('')}</section>`+
        `<nav class="reading-pagination" aria-label="Exercise navigation">${[index-1,index+1].filter(i=>pages[i]).map(i=>`<a href="${unitPath}${pages[i]===review?'review':slug(pages[i].exercise)}/">${i<index?'Previous:':'Next:'} ${pages[i]===review?'Review exercise':'Exercise '+esc(pages[i].exercise)}</a>`).join('')}</nav>`;
      write(pagePath.slice(1)+'index.html',shell({title:`Class 10 ${label} Solutions — ${unit.title} | PECTAA`,description,path:pagePath,trail:[...trail,{name:unit.title,href:unitPath},{name:label}],body,expand}));
    }
  }
}
