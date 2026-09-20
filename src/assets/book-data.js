/* Decode the unchanged book data before starting the shared runtime. */
(async () => {
  try {
    await Promise.all([...document.querySelectorAll('script[data-book-gzip]')].map(async el=>{
      const bytes=Uint8Array.from(atob(el.textContent.trim()),c=>c.charCodeAt(0));
      const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      el.textContent=await new Response(stream).text();
      el.removeAttribute('data-book-gzip');
    }));
    const runtime=document.createElement('script');
    runtime.src=document.querySelector('[data-book-runtime]').dataset.bookRuntime;
    runtime.onerror=()=>{document.querySelector('[data-book-load-status]').hidden=false;};
    document.body.append(runtime);
  } catch {
    document.querySelector('[data-book-load-status]').hidden=false;
  }
})();
