/* One address for each real book view, with legacy fragments kept compatible. */
const BookRoutes = (() => {
  const root = '/solutions/class-10/';
  const decode = value => { try { return decodeURIComponent(value); } catch { return ''; } };
  function path(book, unit, tab, target) {
    const u = book.units.find(u=>u.n===Number(unit));
    if (!u) return root;
    if (tab==='generator') return `${root}#/unit-${unit}/generator${target?'/'+encodeURIComponent(target):''}`;
    const exercise = u.exercises.find(e=>'ex'+e.replace('.','')===tab);
    const page = tab==='review'?'review':exercise?'exercise-'+exercise.replaceAll('.','-'):null;
    return page?`${root}${u.slug}/${page}/${target?'#'+encodeURIComponent(target):''}`:root;
  }
  function resolve(book, content, pathname, hash) {
    const legacy = hash.match(/^#\/?unit-(\d+)(?:\/([\w.]+))?(?:\/([^?]+))?(?:\?paper=([^&]+))?$/);
    if (legacy) return {unit:Number(legacy[1]),tab:legacy[2],target:decode(legacy[3]||''),paper:decode(legacy[4]||'')};
    // #/ remains the old explicit request for the book overview.
    if (hash==='#/') return null;
    const u=book.units.find(u=>pathname.startsWith(root+u.slug+'/'));
    let tab = u && (pathname.includes('/review/')?'review':u.exercises.map(e=>({id:'ex'+e.replace('.',''),slug:'exercise-'+e.replaceAll('.','-')})).find(e=>pathname.endsWith('/'+e.slug+'/'))?.id);
    let unit=u?.n;
    const target=decode(hash.slice(1));
    if (target) for (const [n,per] of Object.entries(content)) for(const [ex,d] of Object.entries(per)) {
      const id=d.kind==='review'?'review':'ex'+ex.replace('.','');
      const items=[...(d.definitions||[]),...(d.whyItWorks||[]),...(d.history||[]),...(d.examples||[]),...(d.questions||[])];
      const ids=items.flatMap(x=>[x.id,...(x.parts||[]).map(p=>p.id)]);
      if(target.startsWith(id+'-')||ids.includes(target)||ids.includes(target.replace(/-compact$/,''))){unit=Number(n);tab=id;}
    }
    return unit?{unit,tab,target,paper:''}:null;
  }
  return {root,path,resolve};
})();
