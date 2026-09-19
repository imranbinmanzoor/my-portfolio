(()=>{
  if(!document.body.hasAttribute('data-book'))return;
  const wide=matchMedia('(min-width:1100px)');
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
