/* The document is the page's only scroller at every width. SiteScroll keeps one small
   API for book and site code: `top` is where the sticky frame begins in the viewport
   (the desktop inset, or the mobile header while it is shown), read from the same
   --site-chrome-top property the sticky CSS uses, so JavaScript and CSS cannot disagree. */
(() => {
  const listeners = new Set();
  const chromeTop = () => parseFloat(getComputedStyle(document.body).getPropertyValue('--site-chrome-top')) || 0;
  window.addEventListener('scroll', () => listeners.forEach(listener => listener()), {passive: true});
  window.SiteScroll = Object.freeze({
    get y() { return window.scrollY; },
    get top() { return chromeTop(); },
    get height() { return window.innerHeight; },
    get extent() { return document.documentElement.scrollHeight; },
    to(options) { window.scrollTo(options); },
    on(listener) { listeners.add(listener); },
    off(listener) { listeners.delete(listener); }
  });
})();
