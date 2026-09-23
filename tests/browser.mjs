// Browser regression suite. Exercises real controls on a served build and checks outcomes.
// Usage:  npm run build && npm run preview   (in one terminal)
//         npm i --no-save playwright@1.56.0 && npx playwright install chromium
//         node tests/browser.mjs http://127.0.0.1:4173 [--json results.json]
// External writes are never sent: the Formspree endpoint is intercepted and answered locally.
import {chromium} from 'playwright';
import fs from 'node:fs';

const base = (process.argv[2] || 'http://127.0.0.1:4173').replace(/\/$/, '');
const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
const FORM = '**/formspree.io/**';
const results = [];
const browser = await chromium.launch({headless: true});
const version = browser.version();

async function test(name, fn, {viewport = {width: 1366, height: 768}, ...options} = {}) {
  const context = await browser.newContext({viewport, ...options});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  try {
    await fn(page, context);
    if (errors.length) throw new Error('page errors: ' + errors.join(' | '));
    results.push({name, status: 'pass'});
    console.log('PASS', name);
  } catch (e) {
    results.push({name, status: 'fail', error: String(e.message || e).slice(0, 400)});
    console.log('FAIL', name, '—', String(e.message || e).slice(0, 300));
  } finally { await context.close(); }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const settle = async page => { await page.waitForLoadState('networkidle').catch(() => {}); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(200); };
const go = async (page, path) => { const r = await page.goto(base + path); await settle(page); return r; };
const scrollY = page => page.evaluate(() => scrollY);

// ---------- Scrolling and navigation ----------
await test('Desktop: keyboard scrolls the page straight after load', async page => {
  await go(page, '/');
  for (const key of ['PageDown', 'Space', 'ArrowDown']) {
    const before = await scrollY(page); await page.keyboard.press(key); await page.waitForTimeout(500);
    assert(await scrollY(page) > before, `${key} did not scroll`);
  }
  await page.keyboard.press('End'); await page.waitForTimeout(800);
  assert(await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2), 'End did not reach the bottom');
});
for (const viewport of [{width: 1366, height: 768}, {width: 390, height: 844}]) {
  await test(`Back/forward restores the scroll position (${viewport.width}px)`, async page => {
    await go(page, '/');
    await page.evaluate(() => scrollTo({top: 1500, behavior: 'instant'})); await page.waitForTimeout(300);
    await go(page, '/projects/'); await page.goBack(); await settle(page); await page.waitForTimeout(300);
    const y = await scrollY(page); assert(Math.abs(y - 1500) < 40, `restored to ${y}`);
  }, {viewport});
}
await test('Skip link is the first Tab stop, visible, and moves focus to the content', async page => {
  for (const path of ['/', '/tutoring/', '/solutions/class-9/', '/solutions/class-10/', '/solutions/class-10/complex-numbers/exercise-1-2/']) {
    await go(page, path); await page.keyboard.press('Tab');
    const s = await page.evaluate(() => { const a = document.activeElement, r = a.getBoundingClientRect(); return {cls: a.className, top: r.top, h: r.height}; });
    assert(/skip-link/.test(s.cls) && s.top >= 0 && s.h > 20, `${path}: first stop ${JSON.stringify(s)}`);
    await page.keyboard.press('Enter'); await page.waitForTimeout(400);
    const target = await page.evaluate(() => { const a = document.activeElement; return a.tagName === 'MAIN' || !!a.closest('main') ? 'main' : a.tagName + '#' + a.id; });
    assert(target === 'main', `${path}: focus went to ${target}`);
  }
});
await test('In-page links land below the frame edge and move keyboard focus', async page => {
  await go(page, '/');
  await page.click('.welcome-paths a[href="#professional-work"]'); await page.waitForTimeout(900);
  const r = await page.evaluate(() => ({top: document.getElementById('professional-work').getBoundingClientRect().top, focus: document.activeElement.id}));
  assert(r.top >= 16 && r.top < 120, `target top ${r.top}`); assert(r.focus === 'professional-work', `focus ${r.focus}`);
  await page.goBack(); await page.waitForTimeout(400);
  assert(!(await page.url()).includes('#professional-work'), 'history entry for the anchor');
});
await test('Sidebar marks only the section being read', async page => {
  await go(page, '/');
  const current = () => page.evaluate(() => [...document.querySelectorAll('.nav__links a[aria-current=location]')].map(a => a.textContent.trim()));
  await page.evaluate(() => document.getElementById('research').scrollIntoView({behavior: 'instant'})); await page.waitForTimeout(300);
  assert((await current()).join() === 'Research', `research: ${await current()}`);
  await page.evaluate(() => document.getElementById('work').scrollIntoView({behavior: 'instant'})); await page.waitForTimeout(300);
  assert((await current()).length === 0, `projects: ${await current()}`);
  await page.keyboard.press('End'); await page.waitForTimeout(900);
  assert((await current()).join() === 'Contact', `bottom: ${await current()}`);
});

// ---------- Theme ----------
await test('Theme toggle switches, announces state and persists across a reload', async page => {
  await go(page, '/');
  const toggle = page.locator('.nav__location [data-theme-toggle]');
  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await toggle.click();
  const after = await page.evaluate(() => ({t: document.documentElement.dataset.theme, p: document.querySelector('.nav__location [data-theme-toggle]').getAttribute('aria-pressed'), s: localStorage.getItem('theme')}));
  assert(after.t !== before && after.s === after.t && after.p === String(after.t === 'dark'), JSON.stringify(after));
  await page.reload(); await settle(page);
  assert(await page.evaluate(() => document.documentElement.dataset.theme) === after.t, 'not persisted');
});
await test('Blocked storage: pages load and the theme toggle still works', async page => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', {get() { throw new DOMException('blocked', 'SecurityError'); }}); });
  for (const path of ['/', '/solutions/class-10/complex-numbers/exercise-1-1/']) {
    await go(page, path);
    const t = await page.evaluate(() => document.documentElement.dataset.theme); assert(t === 'light' || t === 'dark', `theme ${t}`);
  }
  await go(page, '/'); await page.locator('.nav__location [data-theme-toggle]').click();
  assert(await page.evaluate(() => document.documentElement.dataset.theme) === 'dark', 'toggle failed without storage');
});

// ---------- Homepage components ----------
await test('Work map: arrow keys, Home and End select fields and update the link', async page => {
  await go(page, '/');
  await page.locator('#field-research').focus();
  await page.keyboard.press('ArrowRight');
  let s = await page.evaluate(() => ({sel: document.querySelector('[role=tab][aria-selected=true]').id, focus: document.activeElement.id, href: document.querySelector('#field-panel a').getAttribute('href')}));
  assert(s.sel === 'field-code' && s.focus === 'field-code' && s.href === '#work', JSON.stringify(s));
  await page.keyboard.press('End'); s = await page.evaluate(() => document.querySelector('[role=tab][aria-selected=true]').id); assert(s === 'field-teaching', s);
  await page.keyboard.press('Home'); s = await page.evaluate(() => document.querySelector('[role=tab][aria-selected=true]').id); assert(s === 'field-research', s);
});
await test('Project browser: Cards and List change the layout, pressed state and shown CSS', async page => {
  await go(page, '/');
  await page.click('.demo-format [data-layout=list]');
  const s = await page.evaluate(() => ({layout: document.querySelector('.preview-projects').dataset.layout, pressed: document.querySelector('[data-layout=list]').getAttribute('aria-pressed'), css: document.querySelector('[data-layout-source]').textContent, cols: getComputedStyle(document.querySelector('.preview-projects')).gridTemplateColumns.split(' ').length}));
  assert(s.layout === 'list' && s.pressed === 'true' && /list/.test(s.css) && s.cols === 1, JSON.stringify(s));
  const cards = await page.locator('.preview-project').count(); assert(cards === 4, `${cards} projects`);
});

// ---------- Contact form (mocked endpoint; nothing is sent) ----------
const fill = async page => { await page.fill('#f-name', 'Test Reader'); await page.fill('#f-email', 'reader@example.com'); await page.fill('#f-message', 'A local test message.'); };
await test('Contact: empty submit flags each field and focuses the first', async page => {
  let posted = 0; await page.route(FORM, r => { posted++; r.fulfill({status: 200, body: '{}'}); });
  await go(page, '/#contact'); await page.click('#submit-btn');
  const s = await page.evaluate(() => ({invalid: ['f-name', 'f-email', 'f-message'].map(id => document.getElementById(id).getAttribute('aria-invalid')), shown: ['f-name', 'f-email', 'f-message'].map(id => !document.getElementById(id + '-error').hidden), focus: document.activeElement.id}));
  assert(s.invalid.every(v => v === 'true') && s.shown.every(Boolean) && s.focus === 'f-name' && posted === 0, JSON.stringify(s));
  await page.fill('#f-name', 'A'); assert(await page.getAttribute('#f-name', 'aria-invalid') === 'false', 'error did not clear');
  await page.fill('#f-email', 'not-an-email'); await page.click('#submit-btn');
  assert(await page.getAttribute('#f-email', 'aria-invalid') === 'true', 'bad email accepted');
});
await test('Contact: a confirmed response shows the confirmation, focused; another message resets', async page => {
  let body = ''; await page.route(FORM, async r => { body = r.request().postData() || ''; await r.fulfill({status: 200, contentType: 'application/json', body: '{"ok":true}'}); });
  await go(page, '/#contact'); await fill(page); await page.click('#submit-btn');
  await page.waitForSelector('#contact-confirmation:not([hidden])');
  assert(await page.evaluate(() => document.activeElement.id) === 'contact-confirmation', 'confirmation not focused');
  assert(body.includes('A local test message.'), 'payload');
  await page.click('[data-contact-another]');
  const s = await page.evaluate(() => ({form: !document.getElementById('contact-form').hidden, name: document.getElementById('f-name').value, focus: document.activeElement.id}));
  assert(s.form && s.name === '' && s.focus === 'f-name', JSON.stringify(s));
});
for (const [label, reply, expect] of [
  ['a validation error (422 JSON)', r => r.fulfill({status: 422, contentType: 'application/json', body: '{"errors":[{"message":"Email is not valid"}]}'}), /Email is not valid/],
  ['a server error (500 HTML)', r => r.fulfill({status: 500, contentType: 'text/html', body: '<h1>oops</h1>'}), /error 500/],
  ['a network failure', r => r.abort('internetdisconnected'), /Check your connection/],
]) {
  await test(`Contact: ${label} keeps the text and offers email`, async page => {
    await page.route(FORM, reply);
    await go(page, '/#contact'); await fill(page); await page.click('#submit-btn');
    await page.waitForSelector('#form-status.is-error');
    const s = await page.evaluate(() => ({msg: document.getElementById('form-status').textContent, message: document.getElementById('f-message').value, disabled: document.getElementById('submit-btn').disabled, confirm: !document.getElementById('contact-confirmation').hidden, mail: !!document.querySelector('#form-status a[href^="mailto:"]'), focus: document.activeElement.id}));
    assert(expect.test(s.msg) && s.message === 'A local test message.' && !s.disabled && !s.confirm && s.mail && s.focus === 'form-status', JSON.stringify(s));
  });
}
await test('Contact: a field rejected by the service is flagged on that field', async page => {
  await page.route(FORM, r => r.fulfill({status: 422, contentType: 'application/json', body: '{"errors":[{"field":"email","code":"TYPE_EMAIL","message":"should be an email"}]}'}));
  await go(page, '/#contact'); await fill(page); await page.click('#submit-btn');
  await page.waitForSelector('#form-status.is-error');
  const s = await page.evaluate(() => ({invalid: document.getElementById('f-email').getAttribute('aria-invalid'), note: !document.getElementById('f-email-error').hidden, focus: document.activeElement.id, msg: document.getElementById('form-status').textContent}));
  assert(s.invalid === 'true' && s.note && s.focus === 'f-email' && /highlighted/.test(s.msg), JSON.stringify(s));
});
await test('Contact: tutoring links open the form with Tutoring chosen', async page => {
  await go(page, '/tutoring/');
  const href = await page.getAttribute('.tutoring-inquiry a[href*="#contact"]', 'href');
  assert(href === '/?topic=tutoring#contact', href);
  await go(page, href);
  assert(await page.inputValue('#f-topic') === 'Tutoring inquiry', await page.inputValue('#f-topic'));
});
await test('Contact: a second click while sending does not send twice', async page => {
  let posted = 0; await page.route(FORM, async r => { posted++; await new Promise(res => setTimeout(res, 800)); await r.fulfill({status: 200, body: '{}'}); });
  await go(page, '/#contact'); await fill(page);
  await page.click('#submit-btn');
  const during = await page.evaluate(() => ({focus: document.activeElement.id, busy: document.getElementById('submit-btn').getAttribute('aria-disabled')}));
  await page.click('#submit-btn', {force: true}).catch(() => {});
  await page.waitForSelector('#contact-confirmation:not([hidden])'); assert(posted === 1, `${posted} posts`);
  assert(during.focus === 'submit-btn' && during.busy === 'true', 'focus while sending: ' + JSON.stringify(during));
});

// ---------- Routes ----------
await test('Unknown address returns 404 with the recovery page', async page => {
  const r = await go(page, '/no-such-page/'); assert(r.status() === 404, `status ${r.status()}`);
  assert(/find your way back/i.test(await page.textContent('h1')), 'recovery heading');
});
await test('Legacy addresses redirect and keep their fragment', async page => {
  for (const [from, to] of [['/math-9.html#ex11', '/solutions/class-9/#ex11'], ['/math-9/', '/solutions/class-9/'], ['/projects/omnifood.html', '/projects/omnifood/'], ['/solutions/class-9-unit-1.html', '/solutions/class-9/#unit-1'], ['/solutions/class-10/complex-numbers/', '/solutions/class-10/complex-numbers/exercise-1-1/']]) {
    await page.goto(base + from); await page.waitForURL(u => u.pathname !== new URL(base + from).pathname || u.hash !== new URL(base + from).hash, {timeout: 5000}).catch(() => {}); await settle(page);
    const u = new URL(page.url()); assert(u.pathname + u.hash === to, `${from} -> ${u.pathname + u.hash}`);
  }
});

// ---------- Books ----------
await test('Class 10: exercise links change the canonical path; Back returns; solutions open', async page => {
  await go(page, '/solutions/class-10/complex-numbers/exercise-1-2/');
  await page.click('#tab-ex13'); await page.waitForTimeout(600);
  assert(new URL(page.url()).pathname === '/solutions/class-10/complex-numbers/exercise-1-3/', page.url());
  await page.goBack(); await page.waitForTimeout(600);
  assert(new URL(page.url()).pathname.endsWith('/exercise-1-2/'), page.url());
  const summary = page.locator('#panel-ex12 details.sol > summary').first();
  await summary.scrollIntoViewIfNeeded(); await summary.click(); await page.waitForTimeout(300);
  assert(await page.evaluate(() => document.querySelector('#panel-ex12 details.sol').open), 'solution did not open');
});
await test('Class 10: search finds typeset results and navigates to them', async page => {
  await go(page, '/solutions/class-10/complex-numbers/exercise-1-1/');
  await page.fill('#q', 'conjugate'); await page.waitForTimeout(700);
  const s = await page.evaluate(() => ({count: document.getElementById('q-count').textContent, raw: /\$[^$]+\$/.test(document.getElementById('results').textContent), katex: document.querySelectorAll('#results .katex').length, hits: document.querySelectorAll('#results a, #results button').length}));
  assert(/\d/.test(s.count) && !s.raw && s.katex > 0 && s.hits > 0, JSON.stringify(s));
});
await test('Class 10 Practice: generate, one sticky layer, answer key, back to settings', async page => {
  await go(page, '/solutions/class-10/#/unit-1/generator');
  await page.click('#gen-go'); await page.waitForSelector('#gen-out:not([hidden])');
  const sticky = await page.evaluate(() => [...document.querySelectorAll('#panel-generator *')].filter(e => getComputedStyle(e).position === 'sticky' && e.getClientRects().length).map(e => e.className));
  assert(sticky.length === 1 && /paper-return/.test(sticky[0]), JSON.stringify(sticky));
  const order = await page.evaluate(() => { const y = s => document.querySelector(s)?.getBoundingClientRect().top ?? NaN; return {randomize: y('#randomize-scope') , paper: y('#paper-wrap'), print: y('#gen-print'), key: y('#gen-key')}; });
  assert(order.randomize < order.paper && order.paper < order.print && order.paper < order.key, JSON.stringify(order));
  // Straight after Generate, Randomize is in view and not under the return bar.
  const hit = await page.evaluate(() => { const b = document.getElementById('gen-new').getBoundingClientRect(); const e = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return {top: Math.round(b.top), self: !!e && !!e.closest('#gen-new')}; });
  assert(hit.self && hit.top > 0, 'Randomize hidden after Generate: ' + JSON.stringify(hit));
  await page.click('#gen-key'); await page.waitForTimeout(500);
  assert(await page.evaluate(() => { const k = document.getElementById('key-wrap'); return !!k && !k.hidden && k.getClientRects().length > 0; }), 'answer key not shown');
  await page.click('.paper-return'); await page.waitForTimeout(500);
  assert(await page.locator('#gen-go').isVisible(), 'settings not restored');
});
await test('Class 10: Back from another page restores the reading position', async page => {
  await go(page, '/solutions/class-10/complex-numbers/exercise-1-2/');
  await page.evaluate(() => scrollTo({top: 4000, behavior: 'instant'})); await page.waitForTimeout(300);
  await page.click('.nav a[href="/tutoring/"]'); await settle(page);
  await page.goBack(); await settle(page); await page.waitForTimeout(1500);
  const y = await scrollY(page);
  assert(Math.abs(y - 4000) < 150, `restored ${y}`);
});
await test('Class 10: the search count sits below its help text', async page => {
  await go(page, '/solutions/class-10/complex-numbers/exercise-1-1/');
  await page.fill('#q', 'conjugate'); await page.waitForTimeout(700);
  const r = await page.evaluate(() => { const a = document.getElementById('q-help').getBoundingClientRect(), b = document.getElementById('q-count').getBoundingClientRect(); return {help: [a.top, a.bottom], count: [b.top, b.bottom]}; });
  assert(r.count[0] >= r.help[1] - 1, JSON.stringify(r));
}, {viewport: {width: 1280, height: 900}});
await test('Class 9 Practice: one return bar, Randomize above the paper, focus on the paper', async page => {
  await go(page, '/solutions/class-9/#generator');
  await page.click('.gen-run'); await page.waitForTimeout(600);
  const s = await page.evaluate(() => {
    const y = sel => document.querySelector(sel)?.getBoundingClientRect().top ?? NaN;
    const sticky = [...document.querySelectorAll('.panel[data-panel="generator"] *, .crumb--unit, .library-top, #book-masthead, .tabs-wrap')].filter(e => getComputedStyle(e).position === 'sticky' && e.getClientRects().length).map(e => e.className);
    const b = document.querySelector('.gen-new').getBoundingClientRect(); const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    return {sticky, bar: y('.gen-return'), randomize: y('.gen-new'), paper: y('.gen-out .paper'), key: y('.gen-key'), focus: document.activeElement.id, clear: !!hit && !!hit.closest('.gen-new')};
  });
  assert(s.sticky.length === 1 && /gen-return/.test(s.sticky[0]), JSON.stringify(s));
  assert(s.bar < s.randomize && s.randomize < s.paper && s.paper < s.key && s.clear && s.focus === 'paper-test', JSON.stringify(s));
  const first = await page.textContent('.gen-out .paper-meta');
  await page.click('.gen-new'); await page.waitForTimeout(400);
  assert(await page.textContent('.gen-out .paper-meta') !== first, 'Randomize did not draw a new paper');
  await page.click('.gen-edit'); await page.waitForTimeout(400);
  assert(await page.evaluate(() => { const r = document.querySelector('.panel[data-panel="generator"] .sec-title').getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight / 2; }), 'settings not shown');
});
await test('Class 9: Back from another page restores the reading position', async page => {
  await page.goto(base + '/solutions/class-9/#ex11', {waitUntil: 'load'}); await page.waitForTimeout(800);
  await page.evaluate(() => scrollTo({top: 4000, behavior: 'instant'})); await page.waitForTimeout(400);
  await page.evaluate(() => { location.href = '/tutoring/'; }); await page.waitForURL('**/tutoring/', {waitUntil: 'load'});
  await page.goBack({waitUntil: 'commit'}); await page.waitForTimeout(2500);
  const y = await scrollY(page);
  assert(Math.abs(y - 4000) < 150, `restored ${y}`);
});
await test('Class 9: contents, exercise and generator views load', async page => {
  for (const hash of ['#unit-1', '#ex11', '#generator']) {
    await go(page, '/solutions/class-9/' + hash);
    const visible = await page.evaluate(() => document.querySelectorAll('svg').length > 100 && document.body.innerText.length > 500);
    assert(visible, hash);
  }
});
await test('Library: the interactive-ideas link opens the explorer and focuses it', async page => {
  await go(page, '/solutions/#interactive-ideas');
  const s = await page.evaluate(() => ({open: document.getElementById('interactive-ideas').open, focus: document.activeElement.tagName}));
  assert(s.open && s.focus === 'SUMMARY', JSON.stringify(s));
});
await test('Case study: device tabs change the preview; the dialog opens, closes on Escape and returns focus', async page => {
  await go(page, '/projects/omnifood/');
  const src = () => page.getAttribute('[data-preview-image]', 'src');
  const first = await src(); await page.click('.gallery-tabs [role=tab]:nth-child(2)'); await page.waitForTimeout(300);
  assert(await src() !== first, 'tab did not change image');
  await page.click('[data-enlarge]'); await page.waitForTimeout(300);
  assert(await page.evaluate(() => document.querySelector('.preview-dialog').open), 'dialog not open');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  const s = await page.evaluate(() => ({open: document.querySelector('.preview-dialog').open, focus: document.activeElement.matches('[data-enlarge]')}));
  assert(!s.open && s.focus, JSON.stringify(s));
});

await test('Short viewports (zoom, landscape): no sticky layer covers the reading column', async page => {
  for (const [w, h] of [[320, 204], [683, 340], [844, 390]]) {
    await page.setViewportSize({width: w, height: h});
    await go(page, '/solutions/class-10/complex-numbers/exercise-1-2/');
    await page.evaluate(() => scrollTo(0, 3000)); await page.waitForTimeout(400);
    const covered = await page.evaluate(() => [...document.querySelectorAll('#view-unit *')].filter(e => ['sticky', 'fixed'].includes(getComputedStyle(e).position) && e.getBoundingClientRect().height > 0 && e.getBoundingClientRect().bottom > 0 && e.getBoundingClientRect().top < innerHeight && e.id !== 'toTop').map(e => e.className));
    assert(covered.length === 0, `${w}x${h}: ${covered}`);
  }
});
await test('Book prose keeps a readable measure on wide screens', async page => {
  for (const w of [1440, 1920, 2560]) {
    await page.setViewportSize({width: w, height: 900}); await go(page, '/solutions/class-10/complex-numbers/exercise-1-2/');
    const width = await page.evaluate(() => document.getElementById('panels').getBoundingClientRect().width);
    assert(width <= 980, `${w}: reading column ${width}px`);
  }
});

// ---------- Phones ----------
const phone = {viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, deviceScaleFactor: 2};
await test('Phone menu: opens, traps focus, locks scroll, Escape closes and returns focus', async page => {
  await go(page, '/'); await page.evaluate(() => scrollTo(0, 600));
  await page.click('[data-menu-open]'); await page.waitForTimeout(200);
  let s = await page.evaluate(() => ({expanded: document.querySelector('[data-menu-open]').getAttribute('aria-expanded'), focus: document.activeElement.matches('[data-menu-close]'), locked: getComputedStyle(document.body).overflow === 'hidden'}));
  assert(s.expanded === 'true' && s.focus && s.locked, JSON.stringify(s));
  for (let i = 0; i < 14; i++) await page.keyboard.press('Tab');
  assert(await page.evaluate(() => !!document.activeElement.closest('#mobile-menu')), 'focus escaped the menu');
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  s = await page.evaluate(() => ({open: document.getElementById('mobile-menu').classList.contains('is-open'), focus: document.activeElement.matches('[data-menu-open]'), locked: getComputedStyle(document.body).overflow === 'hidden', y: scrollY, x: scrollX}));
  assert(!s.open && s.focus && !s.locked && Math.abs(s.y - 600) < 5 && s.x === 0, JSON.stringify(s));
}, phone);
await test('Phone menu: a link navigates and closes; widening the window closes it', async page => {
  await go(page, '/'); await page.click('[data-menu-open]'); await page.click('#mobile-menu a[href="/tutoring/"]'); await settle(page);
  assert(new URL(page.url()).pathname === '/tutoring/', page.url());
  await page.click('[data-menu-open]'); await page.setViewportSize({width: 1024, height: 768}); await page.waitForTimeout(300);
  assert(!(await page.evaluate(() => document.getElementById('mobile-menu').classList.contains('is-open'))), 'menu still open on desktop');
}, phone);

await test('Phone: moving focus backwards never leaves it under the sticky bars', async page => {
  for (const path of ['/solutions/class-10/complex-numbers/exercise-1-2/', '/solutions/class-9/#ex11']) {
    await go(page, path);
    await page.evaluate(() => scrollTo({top: document.documentElement.scrollHeight, behavior: 'instant'})); await page.waitForTimeout(300);
    await page.focus('.site-footer a');
    const hidden = [];
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Shift+Tab'); await page.waitForTimeout(420);
      const r = await page.evaluate(() => {
        const a = document.activeElement; if (!a || a === document.body || a.closest('.nav,.mobile-menu')) return null;
        const b = a.getBoundingClientRect(); if (!b.width) return null;
        const pts = [[.5, .5], [.1, .2], [.9, .2], [.1, .8], [.9, .8]].map(([x, y]) => [b.left + b.width * x, Math.min(innerHeight - 1, b.top + Math.min(b.height, 40) * y)]);
        const seen = pts.some(([x, y]) => { const h = document.elementFromPoint(x, y); return h && (h === a || a.contains(h) || h.contains(a)); });
        return seen ? null : (a.tagName + ' ' + (a.textContent || '').trim().slice(0, 24));
      });
      if (r) hidden.push(r);
    }
    assert(hidden.length === 0, path + ': ' + hidden.join(' | '));
  }
}, phone);

// ---------- Preferences and degraded conditions ----------
await test('Printing in dark theme uses the light print colours', async page => {
  await go(page, '/solutions/class-10/complex-numbers/exercise-1-2/');
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.emulateMedia({media: 'print'});
  const s = await page.evaluate(() => ({page: getComputedStyle(document.documentElement).getPropertyValue('--ds-page').trim(), ink: getComputedStyle(document.body).color}));
  assert(s.page === '#fff' && s.ink === 'rgb(0, 0, 0)', JSON.stringify(s));
});
await test('Reduced motion: smooth scrolling and transitions are off', async page => {
  await go(page, '/');
  const s = await page.evaluate(() => ({sb: getComputedStyle(document.documentElement).scrollBehavior, t: getComputedStyle(document.querySelector('.btn')).transitionDuration}));
  assert(s.sb === 'auto' && /^0s/.test(s.t), JSON.stringify(s));
}, {reducedMotion: 'reduce'});
await test('Without JavaScript: exercise solutions and navigation still work', async page => {
  await go(page, '/solutions/class-10/complex-numbers/exercise-1-2/');
  const s = await page.evaluate(() => ({details: document.querySelectorAll('details.sol').length, math: document.querySelectorAll('math').length, tabs: [...document.querySelectorAll('#tablist a')].map(a => a.getAttribute('href')).length}));
  assert(s.details > 20 && s.math > 100 && s.tabs >= 5, JSON.stringify(s));
  await page.click('#tablist a[href$="exercise-1-3/"]'); await settle(page);
  assert(new URL(page.url()).pathname.endsWith('/exercise-1-3/'), 'native link failed');
  await go(page, '/');
  assert(!(await page.evaluate(() => document.getElementById('contact-form').noValidate)), 'native validation disabled without script');
  await go(page, '/solutions/class-9/');
  const c9 = await page.evaluate(() => ({note: !!document.querySelector('.noscript-note') && document.querySelector('.noscript-note').getClientRects().length > 0, unit: document.querySelector('.unit-doc').getClientRects().length > 0, panels: [...document.querySelectorAll('.panel')].filter(p => p.getClientRects().length).length, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth}));
  assert(c9.note && c9.unit && c9.panels >= 5 && c9.overflow <= 0, 'Class 9 without JavaScript: ' + JSON.stringify(c9));
}, {javaScriptEnabled: false});
await test('Third-party hosts unreachable: mathematics and fonts still render', async (page, context) => {
  await context.route(url => !url.href.startsWith(base), r => r.abort());
  await go(page, '/solutions/class-10/complex-numbers/exercise-1-2/'); await page.waitForTimeout(800);
  const s = await page.evaluate(() => ({raw: /\$[a-z0-9\\]/i.test(document.getElementById('panels').innerText), katex: document.querySelectorAll('.katex').length, status: !document.getElementById('math-status').hidden, inter: document.fonts.check('16px Inter')}));
  assert(!s.raw && s.katex > 100 && !s.status && s.inter, JSON.stringify(s));
});

await browser.close();
const failed = results.filter(r => r.status === 'fail').length;
console.log(`\n${results.length - failed} passed, ${failed} failed · Chromium ${version} · ${base}`);
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({base, chromium: version, date: new Date().toISOString(), results}, null, 2));
process.exitCode = failed ? 1 : 0;
