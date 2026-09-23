// Regression checks for defects found in the September 2026 audit. Each check names the
// defect it guards against. Static checks only; browser behaviour is in tests/browser.mjs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const read = p => fs.readFileSync(p, 'utf8');
const sha = p => createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const isRedirect = html => /http-equiv=["']refresh["']/i.test(html);
const stripScripts = html => html.replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, '');
const text = html => stripScripts(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

export function checkSite({check, htmlFiles, files}) {
  check('Locked mathematics sources are byte-identical to the recorded hashes', () => {
    const {files: locked} = JSON.parse(read('tests/locked-sources.json'));
    for (const [file, hash] of Object.entries(locked)) assert.equal(sha(file), hash, `${file} changed`);
  });

  check('No page loads scripts, styles or fonts from a third-party host', () => {
    // A CDN outage previously left students reading raw LaTeX.
    for (const f of htmlFiles) {
      const html = read(f);
      for (const m of html.matchAll(/<(script|link|img|iframe|source)\b[^>]*\b(?:src|href)=["'](https?:)?\/\/[^"']+/gi)) {
        const tag = m[0];
        if (/^<link\b/i.test(tag) && !/rel=["'](?:stylesheet|preload|modulepreload|icon|preconnect)/i.test(tag)) continue;
        assert.fail(`${f}: third-party resource ${tag.slice(0, 140)}`);
      }
    }
    for (const f of files.filter(p => p.endsWith('.css') && !p.includes('/vendor/'))) {
      assert(!/url\(\s*["']?(?:https?:)?\/\//i.test(read(f)), `${f}: remote url()`);
      assert(!/@import/i.test(read(f)), `${f}: @import`);
    }
  });

  check('The skip link is the first focusable element and targets an element on the page', () => {
    for (const f of htmlFiles) {
      const html = read(f);
      if (isRedirect(html)) continue;
      const body = stripScripts(html.slice(html.search(/<body\b/i)));
      const first = body.match(/<(a|button|input|select|textarea)\b[^>]*>/i)?.[0] || '';
      assert(/class=["'][^"']*skip-link/.test(first), `${f}: first focusable is ${first.slice(0, 80)}`);
      const target = first.match(/href=["']#([^"']+)/)[1];
      assert(new RegExp(`id=["']${target}["']`).test(html), `${f}: skip target #${target} missing`);
    }
    // Exercise pages show the unit view; their skip link must not target the hidden overview.
    for (const f of htmlFiles.filter(p => /complex-numbers\/(exercise|review)/.test(p)))
      assert(read(f).includes('<a class="skip skip-link" href="#main">'), f);
  });

  check('Headings keep a space between their words (no "Class 11Mathematics")', () => {
    for (const f of htmlFiles) {
      for (const m of read(f).matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
        const inner = m[2].replace(/<br\s*\/?>/gi, ' ');
        const joined = inner.replace(/<[^>]+>/g, '');
        assert(!/\d[A-Z][a-z]/.test(joined), `${f}: heading text "${joined.slice(0, 60)}"`);
      }
    }
  });

  check('Portfolio pages use US spelling in visible copy', () => {
    const british = /\b(colour(?:ed|s)?|behaviour|recognisable|practis(?:e|ed|ing)|enquir(?:y|ies)|one-to-one|organis(?:e|ed|ation)|centre|catalogue)\b/i;
    for (const f of htmlFiles.filter(p => !/solutions\/class-(9|10)\//.test(p))) {
      const hit = text(read(f)).match(british);
      assert(!hit, `${f}: "${hit?.[0]}"`);
    }
  });

  check('Stylesheets use continuous range media queries (no fractional-width gaps)', () => {
    // max-width: 799px beside min-width: 800px leaves 799.5px unmatched at some zoom levels.
    for (const f of files.filter(p => p.endsWith('.css') && !p.includes('/vendor/'))) {
      const hit = read(f).match(/\((?:max|min)-(?:width|height)\s*:\s*[\d.]+px\)/);
      assert(!hit, `${f}: ${hit?.[0]}`);
    }
  });

  check('Homepage: every anchor the site links to exists, and projects come from one data source', () => {
    const home = read('dist/index.html');
    for (const id of ['home', 'professional-work', 'research', 'about', 'work', 'learning', 'tutoring', 'contact'])
      assert(new RegExp(`id="${id}"`).test(home), `missing #${id}`);
    const projects = JSON.parse(read('content/projects.json'));
    const index = read('dist/projects/index.html');
    for (const p of projects) {
      assert(home.includes(`href="/projects/${p.slug}/"`), `homepage lacks ${p.slug}`);
      assert(index.includes(`href="/projects/${p.slug}/"`), `project index lacks ${p.slug}`);
      for (const img of [p.thumb, ...p.views.map(v => v.src)].filter(Boolean)) assert(fs.existsSync('dist' + img), `${p.slug}: missing ${img}`);
    }
  });

  check('Contact form: native validation without JavaScript, labelled fields, visible error text', () => {
    const home = read('dist/index.html');
    const form = home.match(/<form\b[\s\S]*?<\/form>/i)[0];
    assert(!/novalidate/i.test(form.match(/<form\b[^>]*>/i)[0]), 'form must validate natively without script');
    for (const id of ['f-name', 'f-email', 'f-message']) {
      assert(new RegExp(`<label for="${id}"`).test(form), `${id}: label`);
      assert(new RegExp(`id="${id}-error"`).test(form), `${id}: error message`);
      assert(new RegExp(`id="${id}"[^>]*aria-describedby="${id}-error"|aria-describedby="${id}-error"[^>]*id="${id}"`).test(form), `${id}: described by its error`);
    }
    assert(/role="status"/.test(form), 'status region');
  });

  check('No status dot implies availability; favicon matches the monogram', () => {
    for (const f of htmlFiles) assert(!/brand__mark" aria-hidden="true">mi<span>/.test(read(f)), `${f}: status dot`);
    assert(!read('dist/favicon.svg').includes('#2855d9'), 'retired blue favicon');
  });
}
