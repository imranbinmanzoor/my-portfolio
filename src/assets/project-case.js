/* Original project views, with native dialog enlargement and keyboard tabs. */
(() => {
  const gallery=document.querySelector('[data-project-gallery]');
  if(!gallery)return;
  const tabs=[...gallery.querySelectorAll('[role=tab]')];
  const panel=gallery.querySelector('#project-preview');
  const image=gallery.querySelector('[data-preview-image]');
  const caption=gallery.querySelector('figcaption[data-preview-caption]');
  const dialog=gallery.querySelector('dialog');
  const enlarge=gallery.querySelector('[data-enlarge]');
  let restoreFocus;
  function select(tab){
    tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;});
    image.src=tab.dataset.previewSrc;image.alt=tab.dataset.previewAlt;
    caption.textContent=tab.dataset.previewCaption;
    panel.setAttribute('aria-labelledby',tab.id);
  }
  tabs.forEach((tab,i)=>{
    tab.disabled=false;
    tab.addEventListener('click',()=>select(tab));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(i+1)%tabs.length;
      else if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=tabs.length-1;
      else return;
      event.preventDefault();tabs[next].focus();select(tabs[next]);
    });
    // Small local images are preloaded so tab selection is immediate.
    const preload=new Image();preload.src=tab.dataset.previewSrc;
  });
  const tablist=gallery.querySelector('[role=tablist]');
  if(tablist)tablist.hidden=false;
  enlarge.hidden=false;
  enlarge.addEventListener('click',()=>{
    restoreFocus=document.activeElement;
    const large=dialog.querySelector('[data-dialog-image]');large.src=image.src;large.alt=image.alt;
    dialog.querySelector('[data-dialog-caption]').textContent=caption.textContent;
    dialog.showModal();
  });
  gallery.querySelector('[data-close-preview]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>restoreFocus?.focus({preventScroll:true}));
})();
