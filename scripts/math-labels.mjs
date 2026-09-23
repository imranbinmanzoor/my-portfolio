// Spoken labels of the recovered Class 9 SVG mathematics still carry TeX spacing and
// alignment debris ("\;", "&", "\\"). Remove the debris only; every word is kept. The
// same function runs in src/books/class-9/runtime-2.js for question-bank items.
export function cleanMathLabel(t) {
  if (!/[\\&]/.test(t)) return t;
  return t.replace(/\\\\/g, ' ; ').replace(/&amp;|&(?!(?:[a-z]+|#\d+|#x[0-9a-f]+);)/gi, ' ')
    .replace(/\\([%#$_{}])/g, '$1').replace(/\\[,;:!]/g, ' ').replace(/\\ /g, ' ').replace(/\\\s*$/, '')
    .replace(/^\s*aligned\s+|\s+aligned\s*$/g, '')
    .replace(/\s+([,;:])/g, '$1').replace(/;(\s*;)+/g, ';').replace(/\s{2,}/g, ' ').trim();
}
// Apply to aria-label attributes in markup, never inside <script> elements.
export function cleanMarkupLabels(html) {
  return html.split(/(<script\b[\s\S]*?<\/script>)/i).map((part, i) => i % 2 ? part
    : part.replace(/aria-label="([^"]*)"/g, (m, t) => `aria-label="${cleanMathLabel(t)}"`)).join('');
}
