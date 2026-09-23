import vm from 'node:vm';
import katex from './vendor/katex.cjs';
import {SITE,esc,breadcrumbs,publishedUnits} from './seo-pages.mjs';

// Execute only the shared pure renderer, never the DOM-dependent application.
export function bookRenderer(read,book,unit,tab) {
  const context=vm.createContext({BOOK:book,CURRENT_UNIT:unit,PART_TABS:{},currentTabId:()=>tab});
  vm.runInContext(read('src/books/class-10/routes.js')+'\nconst pathFor=(unit,tab,target)=>BookRoutes.path(BOOK,unit,tab,target);\n'+read('src/books/class-10/render.js')+'\nthis.render={exercisePanel,reviewPanel,themeMath};this.routes=BookRoutes;',context);
  return context;
}
export function typesetPanel(html,render) {
  let disclosureDepth=0;
  return render.themeMath(html).replace(/<details\b[^>]*>|<\/details>|(\$\$?)([\s\S]*?)\1/g,(match,delimiter,tex)=>{
    if(!delimiter){disclosureDepth+=match.startsWith('</')?-1:1;return match;}
    // Closed working is fully present as accessible MathML. Avoid sending a second
    // large visual representation before that disclosure is even requested.
    const native=disclosureDepth>0;
    const math=katex.renderToString(tex,{displayMode:delimiter==='$$',throwOnError:true,strict:false,trust:false,output:native?'mathml':'htmlAndMathml'});
    return native?`<span class="math-${delimiter==='$$'?'display':'inline'}"><span class="math-scroll"${delimiter==='$$'?' tabindex="0" role="group" aria-label="Scrollable mathematics"':''}>${math}</span></span>`:math;
  });
}
export function buildBookPages({read,write,bookHTML}) {
  const book=JSON.parse(read('content/books/class-10/book-data.json'));
  const all=JSON.parse(read('content/books/class-10/content-data.json'));
  for(const {unit,exercises,review} of publishedUnits(book,all)) {
    const context=bookRenderer(read,book,unit.n,'ex'+exercises[0].exercise.replace('.',''));
    const pages=exercises.map(ex=>({ex,tab:'ex'+ex.exercise.replace('.',''),label:'Exercise '+ex.exercise}));
    if(review)pages.push({ex:review,tab:'review',label:'Review Exercise'});
    const unitPath=`/solutions/class-10/${unit.slug}/`;
    const first=context.routes.path(book,unit.n,pages[0].tab);
    write(unitPath.slice(1)+'index.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Open ${esc(unit.title)} — Class 10 Mathematics</title><link rel="canonical" href="${SITE+first}"><meta http-equiv="refresh" content="0;url=${first}"></head><body><p><a href="${first}">Open ${esc(unit.title)}</a></p></body></html>`);
    for(const {ex,tab,label} of pages) {
      const ctx=bookRenderer(read,book,unit.n,tab);
      const url=ctx.routes.path(book,unit.n,tab);
      const title=`Class 10 ${label} Solutions — ${unit.title} | PECTAA`;
      const description=`${label} solutions for PECTAA Class 10 ${unit.title}. ${ex.questions.length} questions with explained steps, answers and compact working by Muhammad Imran.`;
      const panel=typesetPanel(tab==='review'?ctx.render.reviewPanel(ex,tab):ctx.render.exercisePanel(ex,tab),ctx.render)
        .replaceAll('<details class="sol" hidden>','<details class="sol">')
        .replaceAll('<button type="button" data-q=','<button type="button" disabled data-q=');
      const tabs=[...pages,{tab:'generator',label:'Practice'}].map(t=>`<a class="tab" id="tab-${t.tab}" aria-current="${t.tab===tab?'page':'false'}" href="${ctx.routes.path(book,unit.n,t.tab)}">${t.label}</a>`).join('');
      const panels=[...pages,{tab:'generator'}].map(t=>`<div id="panel-${t.tab}" role="tabpanel" aria-labelledby="tab-${t.tab}" tabindex="0"${t.tab===tab?'':' hidden'}>${t.tab===tab?panel:''}</div>`).join('');
      let html=bookHTML.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(title)}</title>`)
        .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/,(_,a,b)=>a+esc(description)+b)
        .replace(/(<link rel="canonical" href=")[^"]+/, '$1'+SITE+url)
        .replace('<a class="skip skip-link" href="#book-main">','<a class="skip skip-link" href="#main">')
        .replace('<section class="view" id="view-book">','<section class="view" id="view-book" hidden>')
        .replace('<main class="view" id="view-unit" hidden>','<main class="view" id="view-unit">')
        .replace('id="crumb-unit"></li>',`id="crumb-unit">Unit ${unit.n} · ${esc(unit.title)}</li>`)
        .replace('id="unit-title"></h1>',`id="unit-title">Unit ${unit.n} · ${esc(unit.title)}</h1>`)
        .replace('role="tablist"','role="navigation"')
        .replace(/(id="tablist"\s*)><\/div>/,'$1>'+tabs+'</div>')
        .replace('<div id="panels"></div>',`<div id="panels">${panels}</div>`)
        .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'');
      const trail=[{name:'Home',href:'/'},{name:'Mathematics',href:'/solutions/'},{name:'Class 10',href:'/solutions/class-10/'},{name:`${unit.title} · ${label}`}];
      html=html.replace('</head>',breadcrumbs(trail)+`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'LearningResource',url:SITE+url,name:title,description,inLanguage:'en',educationalLevel:'Class 10',learningResourceType:'Worked mathematics solutions',author:{'@type':'Person',name:'Muhammad Imran',url:SITE+'/'},isAccessibleForFree:true}).replaceAll('<','\\u003c')}</script></head>`);
      write(url.slice(1)+'index.html',html);
    }
  }
}
