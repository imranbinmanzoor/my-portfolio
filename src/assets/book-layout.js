(()=>{
  if(!document.body.hasAttribute('data-book'))return;
  const wide=matchMedia('(min-width:1000px)');
  const trail=document.querySelector('.crumb--unit');
  if(trail){
    const label=trail.querySelector('[aria-current=page]');
    const shorten=()=>{if(label&&!label.querySelector('span')&&label.textContent.includes('·')){const [unit,...name]=label.textContent.split('·');label.textContent=unit.trim();const title=document.createElement('span');title.className='crumb-unit-name';title.textContent=' · '+name.join('·').trim();label.append(title);}};
    new MutationObserver(shorten).observe(label,{childList:true});shorten();
  }
  const syncGlass=()=>document.body.classList.toggle('has-scrolled-content',SiteScroll.y>24);
  SiteScroll.on(syncGlass);syncGlass();
  function orient(){document.querySelectorAll('[role=tablist]').forEach(el=>el.setAttribute('aria-orientation',wide.matches?'vertical':'horizontal'));}
  orient();wide.addEventListener('change',orient);
  new MutationObserver(orient).observe(document.getElementById('tablist')||document.querySelector('.tabs'),{childList:true});
  document.addEventListener('keydown',e=>{if(!wide.matches||!['ArrowUp','ArrowDown'].includes(e.key))return;const tab=e.target.closest('[role=tab]');if(!tab)return;const tabs=[...tab.closest('[role=tablist]').querySelectorAll('[role=tab]')];const next=tabs[(tabs.indexOf(tab)+(e.key==='ArrowDown'?1:-1)+tabs.length)%tabs.length];e.preventDefault();next.focus();next.click();});
  if(document.body.dataset.book==='9'){
    const input=document.getElementById('unit-filter'),clear=document.getElementById('unit-filter-clear');
    const filter=()=>{let found=0;const term=input.value.trim().toLowerCase();document.querySelectorAll('[data-unit-search]').forEach(el=>{el.hidden=!el.dataset.unitSearch.toLowerCase().includes(term);if(!el.hidden)found++;});document.getElementById('unit-empty').hidden=found>0;document.getElementById('unit-filter-status').textContent=term?`${found} matching units.`:'';clear.hidden=!input.value;};
    input.addEventListener('input',filter);clear.addEventListener('click',()=>{input.value='';filter();input.focus();});
  }
})();
