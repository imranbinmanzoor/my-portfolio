(() => {
  'use strict';
  const specimen=document.querySelector('[data-work-specimen]');
  if(!specimen)return;
  const welcome=document.querySelector('.welcome--specimen');
  const disciplines=document.querySelector('.disciplines');
  const mobile=matchMedia('(max-width:699.98px)');
  function placeSpecimen(){
    const focused=specimen.contains(document.activeElement)?document.activeElement:null;
    if(mobile.matches){disciplines.after(specimen);welcome.removeAttribute('data-specimen');}
    else{welcome.append(specimen);welcome.setAttribute('data-specimen','');}
    focused?.focus({preventScroll:true});
    requestAnimationFrame(()=>{
      drawConnections();
      focused?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
    });
  }
  mobile.addEventListener('change',placeSpecimen);placeSpecimen();
  const tabs=[...specimen.querySelectorAll('[role=tab]')];
  const panel=specimen.querySelector('[role=tabpanel]');
  const map=specimen.querySelector('.work-map');
  const connections=specimen.querySelector('.work-map__connections');
  const core=specimen.querySelector('.work-map__core');
  // Connect border to border in actual CSS-pixel coordinates. Never route through a label.
  function drawConnections(){
    const frame=map.getBoundingClientRect(),hub=core.getBoundingClientRect();
    if(!frame.width||!frame.height)return;
    connections.setAttribute('viewBox',`0 0 ${frame.width} ${frame.height}`);
    tabs.forEach(tab=>{
      const box=tab.getBoundingClientRect();
      const left=box.left<hub.left,top=box.top<hub.top;
      const startX=(left?hub.left:hub.right)-frame.left;
      const startY=hub.top+hub.height/2-frame.top+(top?-8:8);
      const endX=(left?box.right+1:box.left-1)-frame.left;
      const endY=box.top+box.height/2-frame.top;
      const bendX=(startX+endX)/2;
      connections.querySelector(`[data-wire="${tab.dataset.field}"]`).setAttribute('d',`M${startX} ${startY}C${bendX} ${startY} ${bendX} ${endY} ${endX} ${endY}`);
    });
  }
  const sizes=new ResizeObserver(drawConnections);
  [map,core,...tabs].forEach(element=>sizes.observe(element));
  document.fonts.ready.then(drawConnections);
  const fields={
    research:{accent:'green',description:'Scientific tasks. Reference solutions. Model evaluation.',href:'#research',link:'Explore research'},
    code:{accent:'cyan',description:'Responsive interfaces. Interaction. Careful testing.',href:'/projects/',link:'Explore projects'},
    math:{accent:'study',description:'Complete reasoning. Precise notation. Practice tools.',href:'/solutions/',link:'Open the mathematics library'},
    teaching:{accent:'purple',description:'Clear explanations. Guided, then independent practice.',href:'/tutoring/',link:'Explore tutoring'}
  };
  function select(tab){
    const key=tab.dataset.field,data=fields[key];
    specimen.style.setProperty('--map-accent',`var(--ds-${data.accent})`);
    specimen.style.setProperty('--map-soft',data.accent==='study'?'var(--ds-tint)':`var(--ds-${data.accent}-soft)`);
    tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});
    specimen.querySelectorAll('[data-wire]').forEach(wire=>wire.classList.toggle('is-active',wire.dataset.wire===key));
    panel.setAttribute('aria-labelledby',tab.id);
    panel.querySelector('.work-map__description').textContent=data.description;
    const link=panel.querySelector('a');link.href=data.href;link.textContent=data.link;
  }
  tabs.forEach((tab,i)=>{
    tab.disabled=false;
    tab.addEventListener('click',()=>select(tab));
    tab.addEventListener('keydown',e=>{
      let next;
      if(e.key==='ArrowRight')next=(i+1)%tabs.length;
      else if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;
      else if(e.key==='Home')next=0;
      else if(e.key==='End')next=tabs.length-1;
      else return;
      e.preventDefault();tabs[next].focus();select(tabs[next]);
    });
  });
  select(tabs[0]);specimen.querySelector('.specimen-caption__detail').textContent='Select a field';
})();
