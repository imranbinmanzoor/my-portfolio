
window.__BOOK__ = JSON.parse(document.getElementById('book-data').textContent);
window.__BANK_READY__ = (async () => {
  const b64 = document.getElementById('bank-data').textContent.trim();
  const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const banks = JSON.parse(await new Response(stream).text());
  Object.keys(banks).forEach(k => { window.__BOOK__.units[k].bank = banks[k]; });
  return banks;
})();
