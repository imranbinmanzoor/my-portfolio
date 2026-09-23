/* Runtime for the chapter page. No mathematics is rendered here, every
   formula was converted to SVG at build time. This file only navigates,
   searches, generates papers and prints. */
(function () {
  'use strict';
  /* The book holds every unit in one document, so an unscoped query would
     always find the first unit's element. Default the scope to whichever unit
     is on screen; pass an explicit root to override. */
  var unitRoot = function () {
    return document.querySelector('.unit-doc:not([hidden])') || document;
  };
  var $ = function (s, r) { return (r || unitRoot()).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || unitRoot()).querySelectorAll(s)); };
  var DATA = {}, INDEX = [], BANK = [], BLUEPRINT = null;
  /* Per-unit data travels on the unit element, so switching units switches
     the search index, the item bank and the blueprint with it. */
  function loadUnitData() {
    var d = unitRoot();
    var all = window.__BOOK__ || {};
    var key = d && d.dataset ? d.dataset.unit : null;
    DATA = (key && all.units && all.units[key]) || {};
    INDEX = DATA.index || []; BANK = DATA.bank || []; BLUEPRINT = DATA.blueprint || null;
  }

  /* ------------------------------------------- first-line label alignment
     The number box must be optically centred on the FIRST LINE of the question
     statement, not on the card, not on the wrapped lines, not on the options.
     A line is taller than one line-height whenever it carries a fraction or a
     radical, so the height cannot be assumed: it is measured.
     Range.getClientRects() returns one rectangle per inline fragment, so
     fragments are merged into visual lines by vertical overlap before the
     first line is taken. Reads are batched before writes. */
  function firstLineRect(el) {
    var r = document.createRange();
    r.selectNodeContents(el);
    var rects = Array.prototype.slice.call(r.getClientRects())
      .filter(function (x) { return x.width > 0.01 && x.height > 0.5; });
    if (!rects.length) return null;
    var top = rects[0].top, bot = rects[0].bottom;
    for (var i = 1; i < rects.length; i++) {
      var x = rects[i];
      var overlap = Math.min(bot, x.bottom) - Math.max(top, x.top);
      if (overlap <= Math.min(bot - top, x.height) * 0.34) break;
      top = Math.min(top, x.top); bot = Math.max(bot, x.bottom);
    }
    return { top: top, height: bot - top, lines: countLines(rects) };
  }
  function countLines(rects) {
    var n = 1, top = rects[0].top, bot = rects[0].bottom;
    for (var i = 1; i < rects.length; i++) {
      var x = rects[i], overlap = Math.min(bot, x.bottom) - Math.max(top, x.top);
      if (overlap <= Math.min(bot - top, x.height) * 0.34) { n++; top = x.top; bot = x.bottom; }
      else { top = Math.min(top, x.top); bot = Math.max(bot, x.bottom); }
    }
    return n;
  }
  function alignLabels(root) {
    var qs = $$('.q', root || document);
    var jobs = [];
    for (var i = 0; i < qs.length; i++) {
      var q = qs[i], st = q.querySelector('.q-statement'), ll = q.querySelector('.q-label-line');
      if (!st || !ll) continue;
      if (!q.getClientRects().length) continue;          /* hidden: measure later */
      var f = firstLineRect(st);
      if (!f) continue;
      jobs.push([ll, f.height, f.top - st.getBoundingClientRect().top]);
    }
    for (var j = 0; j < jobs.length; j++) {
      var h = Math.max(jobs[j][1], 1), off = jobs[j][2];
      jobs[j][0].style.height = h.toFixed(2) + 'px';
      jobs[j][0].style.marginTop = (off > 0.5 ? off.toFixed(2) + 'px' : '0px');
    }
  }
  var alignQueued = false;
  function scheduleAlign(root) {
    if (alignQueued) return;
    alignQueued = true;
    requestAnimationFrame(function () { alignQueued = false; alignLabels(root); });
  }
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return;             /* ignore mobile URL-bar height changes */
    lastW = window.innerWidth; scheduleAlign();
  });
  window.addEventListener('beforeprint', function () { alignLabels(); });
  window.alignLabels = alignLabels;                       /* used by the verifier */

  /* ---------------------------------------------------------- tabs */
  function showPanel(id, push) {
    $$('.panel').forEach(function (p) { p.hidden = p.dataset.panel !== id; });
    $$('.tab').forEach(function (t) {
      var selected = t.dataset.panel === id;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
    if (typeof syncStickyOffsets === 'function') syncStickyOffsets();
    if (push !== false && location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    var active = $('.tab[aria-selected="true"]');
    if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    scheduleAlign($('.panel[data-panel="' + id + '"]') || document);
    syncTitle();
  }
  /* The tab title follows the view: the contents, or the open section of a unit. */
  function syncTitle() {
    if (document.body.dataset.view !== 'chapter') {
      document.title = 'Class 9 Mathematics Solutions (Punjab Textbook Board) — Muhammad Imran';
      return;
    }
    var tab = $('.tab[aria-selected="true"]'), unit = unitRoot();
    var heading = unit && unit.querySelector ? unit.querySelector('h1') : null;
    var parts = [];
    if (tab) parts.push(tab.textContent.replace(/\s+/g, ' ').trim());
    if (heading) parts.push(heading.textContent.replace(/\s+/g, ' ').trim());
    document.title = parts.join(' — ') + ' | Class 9 Mathematics';
  }
  $$('.tab').forEach(function (t) {
    t.addEventListener('click', function () { showPanel(t.dataset.panel); SiteScroll.to({ top: 0 }); });
    t.addEventListener('keydown', function (e) {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(e.key) < 0) return;
      var tabs = $$('.tab'), index = tabs.indexOf(t);
      if (e.key === 'Home') index = 0;
      else if (e.key === 'End') index = tabs.length - 1;
      else index = (index + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      e.preventDefault();
      tabs[index].focus();
      tabs[index].click();
    });
  });

  /* ---------------------------------------------------------- search */
  var WEIGHT = { title: 100, alias: 60, tag: 50, concept: 46, question: 34, solution: 16, note: 9 };
  var norm = function (s) {
    return (s || '').toLowerCase()
      .replace(/√/g, ' sqrt ').replace(/[²]/g, '2').replace(/[³]/g, '3')
      .replace(/[^a-z0-9+\-/^.() ]+/g, ' ').replace(/\s+/g, ' ').trim();
  };
  var ALIAS = {
    'root': 'sqrt', 'square root': 'sqrt', 'squareroot': 'sqrt', 'surd': 'radical',
    'surds': 'radical', 'recurring': 'repeating', 'non terminating': 'repeating',
    'rationalise': 'rationalize', 'rationalising': 'rationalize', 'conjugates': 'conjugate',
    'indices': 'exponent', 'index': 'exponent', 'power': 'exponent', 'powers': 'exponent'
  };
  function terms(q) {
    var s = norm(q);
    Object.keys(ALIAS).forEach(function (k) { s = s.split(k).join(ALIAS[k]); });
    return s.split(' ').filter(function (t) { return t.length > 0; });
  }
  /* Mathematics is stored as plain words so it can be matched and highlighted.
     Show it in ordinary notation instead of "sqrt 2" and "x^4 + (1)/(x^4)". */
  var SUP = { '0': '\u2070', '1': '\u00b9', '2': '\u00b2', '3': '\u00b3', '4': '\u2074',
    '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079', n: '\u207f' };
  function pretty(t) {
    return String(t || '')
      .replace(/\bsqrt\s+(\d+|[a-z])/gi, '\u221a$1')
      .replace(/\broot(\d)\s+/g, function (_, k) { return SUP[k] + '\u221a'; })
      .replace(/\^\{?([0-9n]+)\}?/g, function (_, d) {
        return d.split('').map(function (c) { return SUP[c] || ('^' + c); }).join('');
      })
      .replace(/\((\d+|[a-z])\)\/\((\w+)\)/gi, '$1/$2')
      .replace(/\breal numbers\b/g, '\u211d').replace(/\brational numbers\b/g, '\u211a')
      .replace(/\bintegers\b/g, '\u2124').replace(/\bnatural numbers\b/g, '\u2115')
      .replace(/\bis not equal to\b/g, '\u2260').replace(/\bis in\b/g, '\u2208')
      .replace(/\s*([+=<>\u2260\u00d7\u00f7\u2212-])\s*/g, ' $1 ')
      .replace(/\s+([,.;:)])/g, '$1').replace(/\(\s+/g, '(')
      .replace(/(\u221a)\s+/g, '$1')
      .replace(/\s{2,}/g, ' ').trim();
  }
  function snippet(text, ts) {
    if (!text) return '';
    var low = text.toLowerCase(), at = -1;
    for (var i = 0; i < ts.length && at < 0; i++) at = low.indexOf(ts[i]);
    var start = at < 0 ? 0 : Math.max(0, at - 55);
    /* never begin or end in the middle of a word */
    if (start > 0) {
      var sp = text.indexOf(' ', start);
      start = sp > -1 && sp - start < 25 ? sp + 1 : start;
    }
    var end = Math.min(text.length, start + 190);
    if (end < text.length) {
      var back = text.lastIndexOf(' ', end);
      if (back > start + 60) end = back;
    }
    var cut = pretty(text.slice(start, end).trim());
    if (start > 0) cut = '\u2026 ' + cut;
    if (end < text.length) cut += ' \u2026';
    return cut;
  }
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function sameText(t) { return String(t || '').replace(/\s+/g, ' ').trim().toLowerCase(); }

function hilite(s, ts) {
    var out = esc(s);
    ts.forEach(function (t) {
      if (t.length < 2) return;
      out = out.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>');
    });
    return out;
  }
  function score(item, ts) {
    var total = 0, hitField = null;
    ts.forEach(function (t) {
      var best = 0, bf = null;
      ['title', 'alias', 'tag', 'concept', 'question', 'solution', 'note'].forEach(function (f) {
        var hay = item['_' + f];
        if (!hay) return;
        var at = hay.indexOf(t);
        if (at < 0) return;
        var w = WEIGHT[f];
        if (f === 'title' && at === 0) w += 40;          // heading prefix bonus
        if (new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(hay)) w += 12;
        if (w > best) { best = w; bf = f; }
      });
      total += best;
      if (best && !hitField) hitField = bf;
    });
    return ts.length && total ? { total: total / ts.length, field: hitField } : null;
  }

  var SHOWN = 10, shownNow = SHOWN, lastHits = [], lastTerms = [];
  function renderResults() {
    var box = $('.results');
    if (!lastHits.length) {
      box.innerHTML = '<div class="no-results">No match in the concepts, worked examples, ' +
        'Exercises 1.1 to 1.3 or the Review Exercise. Try a shorter word, or a name such as ' +
        '<b>sqrt</b>, <b>conjugate</b> or <b>recurring</b>.</div>';
      return;
    }
    var slice = lastHits.slice(0, shownNow);
    var html = '<p class="results-head">' + lastHits.length + ' result' + (lastHits.length === 1 ? '' : 's') +
      (lastHits.length > slice.length ? ' · showing the first ' + slice.length : '') + '</p><div class="result-list">';
    slice.forEach(function (h) {
      var it = h.item;
      html += '<a class="result" href="#' + it.target + '" data-goto="' + it.panel + '">' +
        /* section and title were the same string on most entries, printed twice.
           Show the title, and the section only when it adds something. */
        '<span class="rtit">' + hilite(it.title, lastTerms) + '</span>' +
        (sameText(it.section) && sameText(it.section) !== sameText(it.title)
          ? '<span class="rsec">' + esc(it.section) + '</span>' : '') +
        '<span class="rsnip">' + hilite(snippet(it.snippetSrc || it.question || it.concept || '', lastTerms), lastTerms) + '</span>' +
        '</a>';
    });
    html += '</div>';
    if (lastHits.length > shownNow) html += '<button class="more-btn" id="more">Show more results</button>';
    box.innerHTML = html;
    var m = $('.more-btn');
    if (m) m.addEventListener('click', function () { shownNow += 10; renderResults(); });
    $$('.results .result').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var id = a.getAttribute('href').slice(1);
        showPanel(a.dataset.goto);
        var el = document.getElementById(id);
        if (el) {
          var d = el.closest('details'); if (d) d.open = true;
          var p = el.closest('details.sol'); if (p) p.open = true;
          setTimeout(function () { el.scrollIntoView({ block: 'center' }); el.focus({ preventScroll: true }); }, 40);
        }
      });
    });
  }
  function runSearch(q) {
    var box = $('.results'), clear = $('.s-clear');
    clear.hidden = !q;
    if (!q || !q.trim()) { box.innerHTML = ''; clear.removeAttribute('data-on'); return; }
    if (q.trim().length < 2) {
      clear.setAttribute('data-on', '1');
      box.innerHTML = '<div class="no-results">Type at least two characters, or a name such as <b>sqrt</b>.</div>';
      return;
    }
    clear.setAttribute('data-on', '1');
    lastTerms = terms(q); shownNow = SHOWN;
    lastHits = [];
    prepareIndex();
    INDEX.forEach(function (it) {
      var s = score(it, lastTerms);
      if (s) lastHits.push({ item: it, s: s.total, field: s.field });
    });
    lastHits.sort(function (a, b) { return b.s - a.s || a.item.order - b.item.order; });
    lastHits.forEach(function (h) {
      h.item.snippetSrc = h.field === 'solution' ? h.item.solution
        : h.field === 'note' ? h.item.note
          : h.field === 'concept' ? h.item.concept : h.item.question;
    });
    renderResults();
  }
  var si = $('.s-input');
  if (si) {
    $('.s-clear').hidden = !si.value;
    var tmo;
    si.addEventListener('input', function () { $('.s-clear').hidden = !si.value; clearTimeout(tmo); tmo = setTimeout(function () { runSearch(si.value); }, 110); });
    $('.s-clear').addEventListener('click', function () { si.value = ''; runSearch(''); si.focus(); });
    si.addEventListener('keydown', function (e) { if (e.key === 'Escape') { si.value = ''; runSearch(''); } });
  }
  /* Normalise once per unit, the first time that unit's index is used. Doing
     it at load froze an index that was still empty, so search found nothing. */
  function prepareIndex() {
    if (!INDEX.length || INDEX._prepared) return;
    INDEX.forEach(function (it, i) {
      it.order = i;
      it._title = norm(it.title); it._question = norm(it.question);
      it._solution = norm(it.solution); it._note = norm(it.note);
      it._concept = norm(it.concept); it._tag = norm((it.tags || []).join(' '));
      it._alias = norm((it.aliases || []).join(' '));
    });
    INDEX._prepared = true;
  }

  /* ---------------------------------------------------------- generator */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  /* Seed the state from the rendered inputs, which the build sized to what the
     bank can actually supply. Hardcoding 8/6/2 here left the generator disabled
     on arrival for every unit whose bank is smaller than that. */
  var startVal = function (k, d) {
    var el = $('.num[data-key="' + k + '"] input');
    var v = el ? parseInt(el.value, 10) : NaN;
    return isNaN(v) ? d : v;
  };
  var G = { coverage: 'all', difficulty: 'mixed', format: 'custom',
    mcq: startVal('mcq', 8), short: startVal('short', 6),
    long: startVal('long', 2), minutes: startVal('minutes', 60) };

  function pool(type) {
    return BANK.filter(function (r) {
      if (r.type !== type) return false;
      if (G.coverage !== 'all' && r.exercise !== G.coverage) return false;
      if (G.difficulty !== 'mixed' && r.difficulty !== G.difficulty) return false;
      return true;
    });
  }
  function familyCap(type) {
    // how many can be drawn without repeating a variant family
    var fams = {};
    pool(type).forEach(function (r) { fams[r.variant_family] = 1; });
    return Object.keys(fams).length;
  }
  function refreshAvailability() {
    ['mcq', 'short', 'long'].forEach(function (t) {
      var cap = familyCap(t), want = G[t];
      var el = $('.num[data-key="' + t + '"] .avail'), box = $('.num[data-key="' + t + '"]');
      if (!el) return;
      el.textContent = cap + ' available';
      box.classList.toggle('short', want > cap);
    });
    var bad = ['mcq', 'short', 'long'].filter(function (t) { return G[t] > familyCap(t); });
    var btn = $('.gen-run'), msg = $('.gen-msg');
    if (G.format === 'blueprint') {
      var ok = blueprintFeasible();
      btn.disabled = !ok.ok;
      msg.innerHTML = ok.ok
        ? '<div class="alert ok">Blueprint ready: ' + ok.note + '</div>'
        : '<div class="alert">' + ok.note + '</div>';
      return;
    }
    btn.disabled = bad.length > 0;
    msg.innerHTML = bad.length
      ? '<div class="alert">' + bad.map(function (t) {
        return G[t] + ' ' + (G.difficulty === 'mixed' ? '' : G.difficulty + ' ') + t.toUpperCase() +
          ' requested; only ' + familyCap(t) + ' distinct ' + (G.coverage === 'all' ? 'items' : 'items for Exercise ' + G.coverage) +
          ' available. Maximum: ' + familyCap(t) + '.';
      }).join('<br>') + '</div>'
      : '';
  }
  function blueprintFeasible() {
    if (!BLUEPRINT) return { ok: false, note: 'No verified blueprint is loaded.' };
    var miss = [];
    BLUEPRINT.sections.forEach(function (s) {
      var have = BANK.filter(function (r) {
        return r.type === s.type && (G.coverage === 'all' || r.exercise === G.coverage) &&
          (!s.marks || r.marks === s.marks);
      });
      var fams = {}; have.forEach(function (r) { fams[r.variant_family] = 1; });
      if (Object.keys(fams).length < s.draw) {
        miss.push(s.title + ': needs ' + s.draw + ' distinct items of ' + s.marks + ' marks, has ' + Object.keys(fams).length);
      }
    });
    return miss.length ? { ok: false, note: 'Blueprint cannot be filled — ' + miss.join('; ') + '.' }
      : { ok: true, note: BLUEPRINT.title + ', ' + BLUEPRINT.marks + ' marks, ' + BLUEPRINT.time + '.' };
  }
  function draw(items, n, rnd) {
    var byFam = {};
    items.forEach(function (r) { (byFam[r.variant_family] = byFam[r.variant_family] || []).push(r); });
    var fams = Object.keys(byFam);
    for (var i = fams.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = fams[i]; fams[i] = fams[j]; fams[j] = t; }
    var out = [];
    for (var k = 0; k < n && k < fams.length; k++) {
      var g = byFam[fams[k]];
      out.push(g[Math.floor(rnd() * g.length)]);
    }
    return out;
  }
  /* Spoken labels of the recovered SVG mathematics still carry TeX spacing and
     alignment debris ("\\;", "&", "\\\\"). Remove the debris only; the words are kept. */
  function cleanMathLabel(t) {
    if (!/[\\&]/.test(t)) return t;
    return t.replace(/\\\\/g, ' ; ').replace(/&amp;|&(?!(?:[a-z]+|#\d+|#x[0-9a-f]+);)/gi, ' ')
      .replace(/\\([%#$_{}])/g, '$1').replace(/\\[,;:!]/g, ' ').replace(/\\ /g, ' ').replace(/\\\s*$/, '')
      .replace(/^\s*aligned\s+|\s+aligned\s*$/g, '')
      .replace(/\s+([,;:])/g, '$1').replace(/;(\s*;)+/g, ';').replace(/\s{2,}/g, ' ').trim();
  }
  function cleanLabels(html) {
    return String(html || '').replace(/aria-label="([^"]*)"/g, function (m, t) {
      return 'aria-label="' + cleanMathLabel(t) + '"';
    });
  }
  function qBlock(label, r, opts) {
    var h = '<div class="q pq" id="pq-' + r.id + '">';
    h += '<span class="q-label-line"><span class="q-label sub">' + label + '</span></span>' +
      '<div class="q-statement">' + cleanLabels(r.q) + '</div>';
    var body = '';
    if (r.type === 'mcq' && r.opts) {
      body += '<ul class="opts">' + r.opts.map(function (o, i) {
        return '<li class="opt' + (opts && opts.key && i === r.ans ? ' correct' : '') + '">' +
          '<span class="ol">(' + 'ABCD'[i] + ')</span><span class="oc">' + cleanLabels(o) + '</span></li>';
      }).join('') + '</ul>';
    }
    /* No ruled answer space: the paper is a question paper, answers are written
       on a separate answer sheet. */
    if (opts && opts.solution) body += '<div class="sol-in" style="padding-left:0">' + cleanLabels(r.solution) + '</div>';
    if (body) h += '<div class="q-body">' + body + '</div>';
    return h + '</div>';
  }
  function buildPaper(seed) {
    var rnd = mulberry32(seed), secs = [], total = 0, n;
    if (G.format === 'blueprint') {
      BLUEPRINT.sections.forEach(function (s) {
        var have = BANK.filter(function (r) {
          return r.type === s.type && (G.coverage === 'all' || r.exercise === G.coverage) && (!s.marks || r.marks === s.marks);
        });
        var picked = draw(have, s.draw, rnd);
        secs.push({ title: s.title, inst: s.instruction, marks: s.sectionMarks, items: picked });
        total += s.sectionMarks;
      });
    } else {
      [['mcq', 'Section A: Multiple choice', 'Choose the correct option.'],
      ['short', 'Section B: Short questions', 'Attempt all questions. Show complete working.'],
      ['long', 'Section C: Long questions', 'Attempt all questions. Show complete working.']]
        .forEach(function (d) {
          n = G[d[0]]; if (!n) return;
          var picked = draw(pool(d[0]), n, rnd);
          var m = picked.reduce(function (a, r) { return a + r.marks; }, 0);
          total += m;
          secs.push({ title: d[1], inst: d[2], marks: m, items: picked });
        });
    }
    return { seed: seed, id: 'P' + seed.toString(36).toUpperCase().slice(-6), secs: secs, total: total };
  }
  function paperHTML(p, mode) {
    var isKey = mode === 'key';
    var h = '<div class="paper" id="paper-' + (isKey ? 'key' : 'test') + '"><div class="paper-head">' +
      '<h3>' + (isKey ? 'Solutions — ' : '') + (G.format === 'blueprint' ? BLUEPRINT.title : 'Practice Test') + '</h3>' +
      '<div class="paper-meta"><span>' + ((unitRoot().dataset && unitRoot().dataset.paperLabel) || '') + '</span>' +
      '<span>Coverage: ' + (G.coverage === 'all' ? 'whole unit' : 'Exercise ' + G.coverage) + '</span>' +
      '<span>Total marks: ' + p.total + '</span>' +
      '<span>Time: ' + (G.format === 'blueprint' ? BLUEPRINT.time : G.minutes + ' minutes') + '</span>' +
      '<span>Paper ' + p.id + '</span></div></div>' +
      (isKey ? '' : '<div class="paper-candidate"><span>Name</span><span>Roll number</span><span>Date</span></div>');
    /* Same numbering as the printed unit test: each section is one board
       question, its items are parts (i), (ii), ... and marks are stated once
       in the section heading. */
    var ROMAN = ['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii','xiii','xiv','xv','xvi','xvii','xviii','xix','xx'];
    var qNo = 0;
    p.secs.forEach(function (s) {
      qNo++;
      var objective = s.items.some(function (r) { return r.type === 'mcq'; });
      h += '<section class="paper-sec' + (objective ? ' objective' : '') + '">' +
        '<h4><span>' + s.title + '</span><span>' + s.marks + ' marks</span></h4>' +
        '<p class="inst"><span class="qno">Q.' + qNo + '</span>' + s.inst + '</p>' +
        '<ol class="paper-parts">';
      s.items.forEach(function (r, i) {
        h += '<li class="paper-part">' +
          qBlock('(' + (ROMAN[i] || (i + 1)) + ')', r, { key: isKey, solution: isKey }) +
          '</li>';
      });
      h += '</ol></section>';
    });
    return h + '</div>';
  }
  var current = null;
  /** Flag equations that overflow their column so the fade cue is never a lie. */
/** Wrap the tab strip so its overflow can be signalled, and keep the selected
    tab visible when it sits off-screen. */
/** Measure the responsive tab row and section links so lower sticky layers
    and anchor targets remain clear at every viewport size. */
/** A sticky bar should only cast a shadow once it is actually pinned; a
    shadow on a bar sitting in normal flow is a lie about the layout. */
function trackStuck() {
  var watch = function () {
    $$('.local-jump, .grp').forEach(function (el) {
      if (getComputedStyle(el).position !== 'sticky') { el.classList.remove('is-stuck'); return; }
      /* Sticky offsets are viewport-relative and already include the frame top. */
      var want = parseFloat(getComputedStyle(el).top) || 0;
      el.classList.toggle('is-stuck', Math.abs(el.getBoundingClientRect().top - want) < 1.5);
    });
  };
  SiteScroll.on(watch);
  window.addEventListener('resize', debounce(watch, 100));
  document.addEventListener('toggle', function (e) {
    if (e.target.tagName === 'DETAILS') watch();
  }, true);
  watch();
}

function syncStickyOffsets() {
  var panel = $('.panel:not([hidden])');
  var tabs = $('.tabs-wrap'), jump = panel ? $('.local-jump', panel) : null;
  var root = document.documentElement;
  /* A panel without a jump bar (Review, Unit Test, Generator) must not inherit
     another panel's bar height, or its question chips pin into empty space. */
  if (!jump) root.style.setProperty('--sticky-sections', '0px');
  if (tabs) root.style.setProperty('--sticky-tabs', Math.ceil(tabs.getBoundingClientRect().height) + 'px');
  if (jump) {
    var was = jump.style.position;
    jump.style.position = 'static';
    root.style.setProperty('--sticky-sections', Math.ceil(jump.getBoundingClientRect().height) + 'px');
    jump.style.position = was;
  }
}

/** Highlight the capsule for the section the reader is actually in: the last
    section whose heading has passed under the sticky bars. */
function markSection() {
  var links = $$('.local-jump a');
  if (!links.length) return;
  function update() {
    var panel = $('.panel:not([hidden])');
    if (!panel) return;
    var secs = $$('.flow-section', panel);
    if (!secs.length) return;
    /* Layout reflows after a jump (wide equations resize), so a section can land
       well below its scroll-margin. Judge by a proportional reading line rather
       than a tight offset: the section a reader is in is the last one whose top
       has passed the upper third of the screen. */
    var jumpNow = $('.local-jump', panel);
    var bar = jumpNow ? jumpNow.getBoundingClientRect().bottom : 0;
    var line = Math.max(bar + 14, window.innerHeight * 0.35);
    var current = secs[0];
    secs.forEach(function (sec) {
      if (sec.getBoundingClientRect().top <= line) current = sec;
    });
    links.forEach(function (a) {
      a.setAttribute('aria-current', String(a.getAttribute('href').slice(1) === current.id));
    });
  }
  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      /* Settle the layout first: wide equations resize on measurement, which
         moves the target after a plain hash jump and lands the reader short. */
      markWideEquations();
      var go = function () {
        var bar = $('.local-jump').getBoundingClientRect().bottom;
        var y = SiteScroll.y + target.getBoundingClientRect().top - bar - 6;
        SiteScroll.to({ top: Math.max(0, y), behavior: 'smooth' });
      };
      go();
      links.forEach(function (x) { x.setAttribute('aria-current', String(x === a)); });
      setTimeout(function () { go(); links.forEach(function (x) { x.setAttribute('aria-current', String(x === a)); }); }, 450);
    });
  });
  SiteScroll.on(update);
  window.addEventListener('resize', debounce(update, 120));
  document.addEventListener('toggle', function (e) {
    if (e.target.tagName === 'DETAILS') update();
  }, true);
  update();
}

/** Two views, one document: #contents lists the units, #unit-N opens one. */
function bindBookRouter() {
  /* Back/forward and reload: the page first renders the contents view, so the browser's own
     restoration can run against the short contents page and land near the top. Keep the
     reading position in the history entry and put it back once the unit view is laid out. */
  var restoreY = null;
  try {
    var nav = performance.getEntriesByType('navigation')[0];
    if (nav && (nav.type === 'back_forward' || nav.type === 'reload') && history.state && typeof history.state.bookY === 'number') restoreY = history.state.bookY;
  } catch (e) { restoreY = null; }
  window.addEventListener('pagehide', function () {
    try { var st = {}; for (var k in (history.state || {})) st[k] = history.state[k]; st.bookY = SiteScroll.y; history.replaceState(st, ''); } catch (e) { /* position is a convenience */ }
  });
  var interacted = false;
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (type) {
    window.addEventListener(type, function () { interacted = true; }, { once: true, passive: true });
  });
  function restorePosition() {
    if (restoreY === null || interacted) return;
    if (Math.abs(SiteScroll.y - restoreY) > 2) SiteScroll.to({ top: restoreY });
  }
  var first = true;
  function apply() {
    var initial = first;
    first = false;
    var h = (location.hash || '').replace('#', '');
    var m = h.match(/^unit-(\d+)$/);
    /* Show the requested unit and hide the rest before anything measures. */
    var docs = document.querySelectorAll('.unit-doc');
    if (docs.length) {
      var want = m ? m[1] : (docs[0].dataset.unit);
      var found = false;
      Array.prototype.forEach.call(docs, function (d) {
        var on = d.dataset.unit === want;
        d.hidden = !on;
        if (on) found = true;
      });
      if (!found) { docs[0].hidden = false; }
      loadUnitData();
      if (window.__BANK_READY__) {
        window.__BANK_READY__.then(bindGeneratorForActiveUnit).catch(function () {});
      }
    }
    var chapter = /^unit-\d+$/.test(h) || $('.tab[data-panel="' + h + '"]');
    var was = document.body.dataset.view;
    document.body.dataset.view = chapter ? 'chapter' : 'contents';
    if (initial && restoreY !== null) {
      requestAnimationFrame(function () { requestAnimationFrame(restorePosition); });
      window.addEventListener('load', function () { setTimeout(restorePosition, 50); });
      setTimeout(restorePosition, 400);
    } else {
      SiteScroll.to({ top: 0 });
    }
    syncTitle();
    /* Everything that measures layout ran while this view was hidden, where
       every element reports zero size. Ask them all to measure again. */
    if (was !== document.body.dataset.view) {
      requestAnimationFrame(function () { window.dispatchEvent(new Event('resize')); });
    }
  }
  window.addEventListener('hashchange', apply);
  $$('[data-to-contents]').forEach(function (a) {
    a.addEventListener('click', function () { location.hash = 'contents'; });
  });
  apply();
}

function wrapTabs() {
  var tabs = $('.tabs');
  if (!tabs) return;
  var shell = tabs.parentNode;
  if (!shell.classList.contains('tabs-shell')) {
    shell = document.createElement('div');
    shell.className = 'tabs-shell';
    tabs.parentNode.insertBefore(shell, tabs);
    shell.appendChild(tabs);
  }
  function edges() {
    var max = tabs.scrollWidth - tabs.clientWidth;
    shell.classList.toggle('can-left', tabs.scrollLeft > 2);
    shell.classList.toggle('can-right', tabs.scrollLeft < max - 2);
  }
  tabs.addEventListener('scroll', edges, { passive: true });
  window.addEventListener('resize', debounce(edges, 150));
  tabs.addEventListener('click', function (e) {
    var t = e.target.closest('.tab');
    if (t && t.scrollIntoView) t.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    setTimeout(edges, 120);
  });
  var sel = $('.tab[aria-selected="true"]');
  if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  edges();
}

function markWideEquations(root) {
  var scope = root || document;

  /* A single inline formula cannot wrap, so one that is wider than its column
     pushes the whole page sideways. Shrink it to fit, with the same
     readability floor used for display equations. */
  Array.prototype.forEach.call(scope.querySelectorAll('mjx-container'), function (m) {
    /* Display equations live in .eq and scroll; everything else is inline and
       must fit, wherever it sits: a statement, a concept block, a study note. */
    if (m.closest('.eq') || m.closest('figure.dg')) return;
    m.style.fontSize = '';
    /* clientWidth is 0 on a non-replaced inline element, so walk up to the
       nearest block that actually has a measurable column. */
    var host = m.parentElement;
    while (host && host !== document.body && !host.clientWidth) host = host.parentElement;
    if (!host || host === document.body) return;
    var cs = getComputedStyle(host);
    var room = host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var need = m.getBoundingClientRect().width;
    if (!(room > 0) || need <= room + 1) return;
    var ratio = room / need;
    m.style.fontSize = Math.max(0.85, Math.floor((ratio - 0.01) * 100) / 100) + 'em';
    /* Still too wide at the readability floor: let the line scroll rather than
       widen the whole page, exactly as a display equation does. */
    var wideInline = m.getBoundingClientRect().width > room + 1;
    host.classList.toggle('wide-inline', wideInline);
    /* A line that scrolls must be reachable by keyboard, like a wide display equation. */
    if (wideInline && !host.hasAttribute('tabindex')) {
      host.setAttribute('tabindex', '0');
      host.setAttribute('role', 'group');
      host.setAttribute('aria-label', 'Wide expression, scrollable sideways');
      host.dataset.wideFocus = '1';
    } else if (!wideInline && host.dataset.wideFocus) {
      host.removeAttribute('tabindex'); host.removeAttribute('role'); host.removeAttribute('aria-label');
      delete host.dataset.wideFocus;
    }
  });

  Array.prototype.forEach.call(scope.querySelectorAll('.eq'), function (eq) {
    /* A display equation that is only slightly too wide is shrunk to fit, down to
       a readability floor of 0.85em. Anything still too wide scrolls, and only
       those get the fade and the spoken hint. */
    eq.style.fontSize = '';
    var wide = eq.scrollWidth > eq.clientWidth + 1;
    if (wide) {
      var ratio = eq.clientWidth / eq.scrollWidth;
      if (ratio >= 0.86) {
        eq.style.fontSize = Math.max(0.85, Math.floor((ratio - 0.01) * 100) / 100) + 'em';
        wide = eq.scrollWidth > eq.clientWidth + 1;
        if (wide) eq.style.fontSize = '';
      }
    }
    eq.classList.toggle('is-wide', wide);
    var hint = eq.querySelector('.eq-hint');
    if (wide && !hint) {
      hint = document.createElement('span');
      hint.className = 'eq-hint';
      hint.textContent = 'This equation is wider than the screen. Scroll it sideways to see the rest.';
      eq.appendChild(hint);
    } else if (!wide && hint) {
      hint.remove();
    }
    if (wide && !eq.dataset.bound) {
      eq.dataset.bound = '1';
      eq.setAttribute('tabindex', '0');
      eq.setAttribute('role', 'region');
      eq.setAttribute('aria-label', 'Wide equation, scrollable sideways');
      eq.addEventListener('scroll', function () {
        eq.classList.toggle('at-end', eq.scrollLeft + eq.clientWidth >= eq.scrollWidth - 2);
      }, { passive: true });
    }
  });
}

function debounce(fn, ms) {
  var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); };
}

/* Every unit carries its own generator controls, so bind whichever unit is on
   screen, once each, and again when a different unit is shown. */
function bindGeneratorForActiveUnit() {
  var d = unitRoot();
  if (!d || !d.dataset || d.dataset.genBound === '1') return;
  if (!d.querySelector('.gen-run')) return;
  d.dataset.genBound = '1';
  loadUnitData();
  G.mcq = startVal('mcq', G.mcq);
  G.short = startVal('short', G.short);
  G.long = startVal('long', G.long);
  G.minutes = startVal('minutes', G.minutes);
  G.coverage = 'all'; G.difficulty = 'mixed'; G.format = 'custom';
  bindGenerator();
}

function bindGenerator() {
    $$('.panel[data-panel="generator"] .chip').forEach(function (c) {
      c.addEventListener('click', function () {
        var g = c.dataset.group;
        $$('.panel[data-panel="generator"] .chip[data-group="' + g + '"]').forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
        c.setAttribute('aria-pressed', 'true');
        G[g] = c.dataset.value;
        $('.custom-counts').hidden = G.format !== 'custom';
        refreshAvailability();
      });
    });
    $$('.panel[data-panel="generator"] .num').forEach(function (box) {
      var key = box.dataset.key, input = $('input', box);
      $$('button', box).forEach(function (b) {
        b.addEventListener('click', function () {
          var v = Math.max(0, Math.min(40, (parseInt(input.value, 10) || 0) + parseInt(b.dataset.d, 10)));
          input.value = v; G[key] = v; refreshAvailability();
        });
      });
      input.addEventListener('change', function () {
        var v = Math.max(0, Math.min(40, parseInt(input.value, 10) || 0));
        input.value = v; G[key] = v; refreshAvailability();
      });
    });
    function renderCurrent() {
      $('.gen-out').innerHTML = paperHTML(current, 'test');
      $('.gen-after').hidden = false;
      alignLabels($('.gen-out'));
      if ($('.gen-key').getAttribute('aria-expanded') === 'true') {
        $('.gen-sol').innerHTML = paperHTML(current, 'key');
        alignLabels($('.gen-sol'));
      }
    }
    /* Show the paper from the top of its workspace: the return bar on its sticky
       line, the Randomize row under it, then the paper, which takes focus. */
    function showPaperTop() {
      var bar = $('.gen-return'), paper = $('#paper-test', $('.gen-out'));
      if (paper) { paper.tabIndex = -1; paper.focus({ preventScroll: true }); }
      if (!bar) return;
      var line = parseFloat(getComputedStyle(bar).top) || 0;
      SiteScroll.to({ top: Math.max(0, SiteScroll.y + bar.getBoundingClientRect().top - line) });
    }
    function ensureWorkspace() {
      if ($('.gen-return')) return;
      var out = $('.gen-out');
      var bar = document.createElement('div');
      bar.className = 'gen-return no-print';
      bar.innerHTML = '<button type="button" class="gen-edit"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>Back to paper settings</button>';
      var top = document.createElement('div');
      top.className = 'gen-top no-print';
      top.setAttribute('role', 'group');
      top.setAttribute('aria-label', 'Randomize questions');
      top.innerHTML = '<button type="button" class="btn ghost gen-new">Randomize questions</button><p class="gen-status" role="status" aria-live="polite"></p>';
      out.parentNode.insertBefore(bar, out);
      out.parentNode.insertBefore(top, out);
      $('.gen-edit').addEventListener('click', function () {
        var panel = out.closest('.panel'), title = panel.querySelector('.sec-title') || panel;
        title.tabIndex = -1;
        title.focus({ preventScroll: true });
        var line = parseFloat(getComputedStyle(document.body).getPropertyValue('--site-chrome-top')) || 0;
        SiteScroll.to({ top: Math.max(0, SiteScroll.y + title.getBoundingClientRect().top - line - 16) });
      });
      $('.gen-new').addEventListener('click', function () {
        if (!current) return;
        current = buildPaper((Math.random() * 4294967296) >>> 0);
        renderCurrent();
        $('.gen-status').textContent = 'New questions drawn with the same settings. Paper ' + current.id + '.';
        showPaperTop();
      });
    }
    $('.gen-run').addEventListener('click', function () {
      current = buildPaper((Math.random() * 4294967296) >>> 0);
      ensureWorkspace();
      $('.gen-status').textContent = '';
      renderCurrent();
      showPaperTop();
    });
    $('.gen-key').addEventListener('click', function () {
      if (!current) return;
      var open = $('.gen-key').getAttribute('aria-expanded') === 'true';
      $('.gen-key').setAttribute('aria-expanded', String(!open));
      $('.gen-key').textContent = open ? 'Answer key' : 'Hide answer key';
      $('.gen-sol').innerHTML = open ? '' : paperHTML(current, 'key');
      alignLabels($('.gen-sol'));
    });
    $('.gen-print').addEventListener('click', function () { printOnly('.gen-out'); });
    $$('[data-print]').forEach(function (b) {
      b.addEventListener('click', function () { printOnly(b.dataset.print); });
    });
    refreshAvailability();
  }
  function printOnly(sel) {
    var target = $(sel);
    if (!target) return;
    var marks = [];
    $$('.panel').forEach(function (p) { marks.push([p, p.hidden]); });
    var host = target.closest('.panel');
    $$('.panel').forEach(function (p) { p.hidden = p !== host; });
    document.body.setAttribute('data-print-target', sel);
    var style = document.createElement('style');
    style.id = 'print-scope';
    var wrap = '.panel[data-panel="' + host.dataset.panel + '"] > .wrap';
    style.textContent = '@media print{' + wrap + ' > :not(' + sel + '):not(:has(' + sel + ')){display:none!important}' +
      sel + '{display:block!important}}';
    document.head.appendChild(style);
    var done = function () {
      style.remove(); marks.forEach(function (m) { m[0].hidden = m[1]; });
      document.body.removeAttribute('data-print-target');
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(done, 1500);
  }
  bindBookRouter();
  wrapTabs();
  markSection();
  syncStickyOffsets();
  trackStuck();
  window.addEventListener('resize', debounce(syncStickyOffsets, 120));
  markWideEquations();
  window.addEventListener('resize', debounce(markWideEquations, 150));
  if (window.matchMedia) {
    var mq = window.matchMedia('print');
    if (mq.addEventListener) mq.addEventListener('change', function () { markWideEquations(); });
  }
  window.addEventListener('beforeprint', function () { markWideEquations(); });
  /* Opening a solution changes the column for everything after it, and a
     statement sits outside its own disclosure, so re-measure the document
     rather than only the toggled element. */
  /* Content hidden inside a closed <details> has no layout, so its formulas
     cannot be measured until it opens. Rather than depend on the toggle event
     reaching a delegated listener, watch the document for any size change:
     that covers opening a solution, switching a tab, and font loading alike. */
  var refitSoon = debounce(function () { markWideEquations(); }, 90);
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(refitSoon);
    ro.observe(document.body);
  }

  if ($('.panel[data-panel=\"generator\"]')) {
    var ready = window.__BANK_READY__ || Promise.resolve([]);
    /* The banks arrive keyed by unit; loadUnitData() picks the one belonging
       to whichever unit is on screen. */
    ready.then(function () {
      bindGeneratorForActiveUnit();
    }).catch(function () {
      var msg = $('.gen-msg'), run = $('.gen-run');
      if (msg) {
        msg.innerHTML = '<div class="alert">The question bank could not be opened in this browser. ' +
          'Please use a current version of Chrome, Edge, Safari or Firefox.</div>';
      }
      if (run) run.disabled = true;
    });
  }

  /* ---------------------------------------------------------- boot */
  var start = (location.hash || '').replace('#', '');
  var firstTab = $('.tab');
  showPanel($('.tab[data-panel="' + start + '"]') ? start : (firstTab ? firstTab.dataset.panel : 'ex11'), false);
  alignLabels();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { alignLabels(); });
  $$('details').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) scheduleAlign(d);
      /* Opening a solution reveals notes that were never measured while hidden,
         so re-fit the document. A document-level capture listener does not
         reliably receive the non-bubbling toggle event here. */
      refitSoon();
    });
  });
})();
