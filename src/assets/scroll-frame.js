/* One page scroll owner: the inset desktop workspace or the mobile document. */
(() => {
  const desktop = matchMedia('(min-width:800px)');
  const body = document.body;
  const listeners = new Set();
  const owner = () => desktop.matches ? body : window;
  let lastY = 0;
  const position = () => desktop.matches ? body.scrollTop : window.scrollY;
  const notify = () => {
    lastY = position();
    listeners.forEach(listener => listener());
  };
  body.addEventListener('scroll', notify, {passive:true});
  window.addEventListener('scroll', () => { if (!desktop.matches) notify(); }, {passive:true});
  window.SiteScroll = Object.freeze({
    get y() { return position(); },
    get top() { return desktop.matches ? body.getBoundingClientRect().top : 0; },
    get height() { return desktop.matches ? body.clientHeight : window.innerHeight; },
    get extent() { return desktop.matches ? body.scrollHeight : document.documentElement.scrollHeight; },
    to(options) { owner().scrollTo(options); },
    on(listener) { listeners.add(listener); },
    off(listener) { listeners.delete(listener); }
  });
  desktop.addEventListener('change', () => {
    const previousY = lastY;
    if (desktop.matches) window.scrollTo({top:0,behavior:'instant'});
    else body.scrollTop = 0;
    owner().scrollTo({top:previousY,behavior:'instant'});
    notify();
  });
})();
