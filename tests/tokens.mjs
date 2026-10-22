// Design-token check. Every site stylesheet must take its type sizes, corner radii, spacing,
// colours and breakpoints from the scale in src/assets/tokens.css. A value outside the scale
// fails `npm run check`, so no later edit can quietly add a 13px label or a 7px radius.
// Book stylesheets inherited from the original books are not on the scale yet; they may
// not grow more violations than recorded in tests/token-baseline.json.
import assert from 'node:assert/strict';
import fs from 'node:fs';

export const STRICT = ['chrome', 'site', 'home', 'project-case', 'work-specimen', 'math-lab']
  .map(n => `src/assets/${n}.css`);
export const LEGACY = ['src/assets/book.css', 'src/books/class-9/style-1.css',
  'src/books/class-9/style-2.css', 'src/books/class-10/style-1.css'];

const SPACING = new Set([0, 1, 2, 4, 8, 12, 16, 24, 32, 48, 64]);
const BREAKPOINTS = new Set([360, 600, 800, 1000, 1200, 1760]);
const SPACING_PROPS = /^(?:padding|margin|gap|row-gap|column-gap)(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?$/;
const RADIUS_PROPS = /^border(?:-(?:top|bottom|start|end)-(?:left|right|start|end))?-radius$/;
const COLOUR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i;

// Declarations end with /*art*/ when the value is a proportion inside a drawn illustration
// (the book covers), not interface type or layout.
const ART = '\u0000ART';

/** Splits CSS into {prop, value, art, media} declarations, ignoring strings and url(). */
export function declarations(css) {
  css = css.replace(/\/\*\s*art\s*\*\//g, ART).replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [], stack = [];
  let buf = '', quote = null, paren = 0;
  const flush = () => {
    const text = buf.trim(); buf = '';
    const top = stack.at(-1) ?? '';
    if (!text || top.startsWith('@property') || top.startsWith('@font-face')) return;
    const i = text.indexOf(':');
    if (i < 1) return;
    const prop = text.slice(0, i).trim().toLowerCase();
    if (prop.startsWith('--')) return;
    const raw = text.slice(i + 1);
    out.push({prop, value: raw.replaceAll(ART, '').replace(/!important/i, '').trim(), art: raw.includes(ART),
      print: stack.some(s => /^@media\b[^{]*\bprint\b/i.test(s))});
  };
  for (const ch of css) {
    if (quote) { buf += ch; if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue; }
    if (ch === '(') paren++;
    if (ch === ')') paren--;
    if (paren > 0) { buf += ch; continue; }
    if (ch === '{') { stack.push(buf.trim()); buf = ''; continue; }
    if (ch === ';') { flush(); continue; }
    if (ch === '}') { flush(); stack.pop(); continue; }
    buf += ch;
  }
  return out;
}

/** Media-query widths used by a stylesheet. */
const breakpoints = css => [...css.matchAll(/@media[^{]*/g)]
  .flatMap(m => [...m[0].matchAll(/width\s*[<>=]+\s*(\d+(?:\.\d+)?)px|(\d+(?:\.\d+)?)px\s*[<>=]+\s*width/g)])
  .map(m => Number(m[1] ?? m[2]));

// Lengths inside calc()/min()/max()/clamp() are derived geometry (for example an inner
// radius equal to the outer radius minus an inset) and are judged by the tokens they use.
const outsideFunctions = v => v.replace(/\b(?:calc|min|max|clamp)\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\)/g, ' ');

/** Returns human-readable violations for one stylesheet. */
export function violations(css) {
  const found = [];
  for (const {prop, value, art, print} of declarations(css)) {
    if (art) continue;
    const plain = outsideFunctions(value);
    if (prop === 'font-size') {
      if (!/^(?:var\(--(?:fs|ds-text|ds-h|ds-title)[\w-]*\)|inherit|initial|1em|100%|\d*\.?\d+em|\d+%)$/.test(value))
        found.push(`font-size:${value}`);
    } else if (prop === 'font') {
      if (/\d(?:px|rem|pt)\b/.test(plain)) found.push(`font:${value}`);
    } else if (RADIUS_PROPS.test(prop)) {
      for (const part of plain.split(/[\s/]+/).filter(Boolean))
        if (!/^(?:0|50%|inherit|var\(--ds-radius[\w-]*\))$/.test(part)) found.push(`${prop}:${value}`);
    } else if (SPACING_PROPS.test(prop)) {
      for (const m of plain.matchAll(/(-?\d*\.?\d+)(px|rem|pt)\b/g))
        if (m[2] !== 'px' || !SPACING.has(Math.abs(Number(m[1])))) found.push(`${prop}:${value}`);
    }
    // Colours come from tokens (color-mix() of tokens is fine); print styles may use ink black.
    if (!print && COLOUR.test(value)) found.push(`${prop}:${value}`);
  }
  for (const w of breakpoints(css)) if (!BREAKPOINTS.has(w)) found.push(`@media width ${w}px`);
  return [...new Set(found)];
}

export function checkTokens({check}) {
  for (const file of STRICT) check(`Design tokens only: ${file}`, () => {
    const bad = violations(fs.readFileSync(file, 'utf8'));
    assert.equal(bad.length, 0, `${bad.length} off-scale value(s): ${bad.slice(0, 12).join(' · ')}`);
  });
  check('Book stylesheets do not add off-scale values', () => {
    const baseline = JSON.parse(fs.readFileSync('tests/token-baseline.json', 'utf8'));
    for (const file of LEGACY) {
      const n = violations(fs.readFileSync(file, 'utf8')).length;
      assert(n <= baseline[file], `${file}: ${n} off-scale values, baseline ${baseline[file]}`);
    }
  });
}
