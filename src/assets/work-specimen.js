(() => {
  'use strict';
  const specimen=document.querySelector('[data-work-specimen]');
  if(!specimen)return;
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
    research:{accent:'green',description:'Designing and reviewing mathematical and scientific tasks, reference solutions and model answers.',href:'#research',link:'See contributions'},
    code:{accent:'cyan',description:'Responsive interfaces, interaction states, and the static build behind this site.',href:'#work',link:'See projects'},
    math:{accent:'study',description:'Worked solutions with every step shown, plus configurable practice papers.',href:'/solutions/',link:'Open the mathematics library'},
    teaching:{accent:'purple',description:'One-on-one lessons in mathematics, programming, and Arabic.',href:'/tutoring/',link:'Explore tutoring'}
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
  select(tabs[0]);
})();
