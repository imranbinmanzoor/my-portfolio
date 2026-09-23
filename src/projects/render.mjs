const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = {
  Desktop:'<rect x="3" y="3" width="18" height="13" rx="2"/><path d="M8 21h8m-4-5v5"/>',
  Tablet:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M11 18h2"/>',
  Mobile:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || '<path d="M8 8h8v8H8zM4 12h4m8 0h4"/>'}</svg>`;

export function renderProject(project, projects) {
  const p = project, first = p.views[0];
  if (!first || p.views.some(v => !/^\/IMAGES\/[\w.-]+$/.test(v.src))) throw new Error('Invalid project preview');
  const views = p.views.map((v,i) => `<button type="button" role="tab" id="view-${i}" aria-controls="project-preview" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-preview-src="${escape(v.src)}" data-preview-alt="${escape(v.alt)}" data-preview-caption="${escape(v.caption)}" disabled>${icon(v.label)}<span>${escape(v.label)}</span></button>`).join('');
  const relation = (slug, label, direction) => {const q=projects.find(item=>item.slug===slug);return `<a href="/projects/${q.slug}/"><span class="page-footer-nav__label">${direction==='back'?'<span class="action-icon action-icon--back" aria-hidden="true"></span> ':''}${label}${direction==='forward'?' <span class="action-icon action-icon--forward" aria-hidden="true"></span>':''}</span><span class="page-footer-nav__title">${escape(q.title)}</span></a>`;};
  return `<nav class="page-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/projects/">Projects</a></li><li aria-current="page"><span title="${escape(p.title)}">${escape(p.shortTitle||p.title)}</span></li></ol></nav>
<article class="project-case" data-project="${p.slug}">
  <header class="case-intro"><div class="case-intro__copy"><p class="eyebrow">${escape(p.category)}</p><h1>${escape(p.title)}</h1><p class="case-lede">${escape(p.intro)}</p><div class="case-actions"><a class="btn" href="${escape(p.demo)}">${escape(p.demoLabel)}</a><a class="text-link" href="#project-story">Read the story</a></div><dl class="case-facts">${p.facts.map(([label,value])=>`<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl></div>
  <section class="project-gallery" aria-label="Project preview" data-project-gallery>
    <div class="gallery-toolbar"><span class="gallery-label">${p.views.length>1?'Explore the views':'Project preview'}</span>${p.views.length>1?`<div role="tablist" aria-label="Preview size" class="gallery-tabs" hidden>${views}</div>`:''}<button class="gallery-enlarge" type="button" data-enlarge hidden aria-label="Enlarge project image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3h7v7m0-7-7 7M10 21H3v-7m0 7 7-7"/></svg></button></div>
    <figure id="project-preview" ${p.views.length>1?'role="tabpanel" aria-labelledby="view-0" tabindex="0"':''}><div class="gallery-stage"><img src="${escape(first.src)}" alt="${escape(first.alt)}" decoding="async" fetchpriority="high" width="1200" height="900" data-preview-image></div><figcaption data-preview-caption>${escape(first.caption)}</figcaption></figure>
    <noscript><p class="gallery-fallback">${p.views.map(v=>`<a href="${escape(v.src)}">${escape(v.label)} image</a>`).join(' · ')}</p></noscript>
    <dialog class="preview-dialog" aria-label="Project image"><div class="preview-dialog__bar"><span data-dialog-title>${escape(p.title)}</span><button type="button" class="btn btn--ghost" data-close-preview>Close preview</button></div><img alt="" data-dialog-image><p data-dialog-caption></p></dialog>
  </section><section class="case-brief"><div class="case-section__label"><span aria-hidden="true">01</span><h2>The brief</h2></div><p>${escape(p.brief)}</p><p class="case-context">${escape(p.context)}</p></section></header>
  <div class="case-story" id="project-story">
  <section class="case-section"><div class="case-section__label"><span aria-hidden="true">02</span><h2>Design decisions</h2></div><div class="case-decisions">${p.decisions.map(d=>`<article><h3>${escape(d.title)}</h3><p>${escape(d.text)}</p></article>`).join('')}</div></section>
  <section class="case-section"><div class="case-section__label"><span aria-hidden="true">03</span><h2>${escape(p.reflectionTitle)}</h2></div><div class="case-section__body"><p>${escape(p.reflection)}</p><div class="case-next"><h3>${escape(p.nextTitle)}</h3><p>${escape(p.next)}</p></div></div></section></div>
  <nav aria-label="Project navigation" class="page-footer-nav">${relation(p.previous,'Previous project','back')}${relation(p.nextProject,'Next project','forward')}</nav>
</article>`;
}

// Both project collections are generated from content/projects.json, so the homepage
// and the project index can never describe the same work differently.
const bookArtwork = `<span class="book-artifact" aria-hidden="true"><span class="mini-book"><span>MATHEMATICS</span><strong>09</strong><small>Real Numbers</small></span><span class="mini-book"><span>MATHEMATICS</span><strong>10</strong><small>Complex Numbers</small></span></span>`;
const visual = p => p.thumb
  ? `<img src="${escape(p.thumb)}" alt="" width="960" height="571" loading="lazy" decoding="async">`
  : bookArtwork;

// Homepage: compact cards inside the Cards / List project browser.
export function renderProjectCards(projects) {
  return projects.map(p => `<a class="preview-project preview-project--${p.slug}" href="/projects/${p.slug}/"><span class="preview-project__visual">${visual(p)}</span><span class="preview-project__body"><span class="preview-project__kicker">${escape(p.category)}</span><h3>${escape(p.title)}</h3><p class="preview-project__summary">${escape(p.summary)}</p><span class="preview-project__tags">${escape(p.tags)}</span></span></a>`).join('');
}

// Project index: larger tiles with a hover and focus cue.
export function renderProjectTiles(projects) {
  return `<div class="selected-work">${projects.map(p => `<a class="project-tile project-tile--${p.slug}" href="/projects/${p.slug}/"><span class="project-visual">${visual(p)}<span class="project-view" aria-hidden="true">View project</span></span><span class="project-info"><span class="eyebrow">${escape(p.category)}</span><h3>${escape(p.title)}</h3><p>${escape(p.summary)}</p><span class="project-meta">${escape(p.tags)}</span></span></a>`).join('')}</div>`;
}
