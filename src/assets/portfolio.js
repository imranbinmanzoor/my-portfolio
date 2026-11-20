(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Clock in Layyah */
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Karachi', hour: 'numeric', minute: '2-digit' });
  const clock = document.getElementById('clock'), tz = document.getElementById('tz');
  const tick = () => {
    let t; try { t = fmt.format(new Date()).replace('AM', 'am').replace('PM', 'pm'); } catch (e) { return; }
    clock.textContent = 'UTC+5, where it’s ' + t;
    tz.textContent = 'I work remotely from Pakistan (UTC+5). It’s ' + t + ' here now.';
  };
  tick(); setInterval(tick, 30000);

  /* Header */
  const top = document.getElementById('top');
  const onScroll = () => top.classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const navLinks = [...document.querySelectorAll('.bar nav a')];
  const targets = navLinks.map(a => document.querySelector(a.getAttribute('href')));
  if ('IntersectionObserver' in window) {
    const seen = new Map();
    const io = new IntersectionObserver(es => {
      es.forEach(e => seen.set(e.target, e.isIntersecting));
      const cur = targets.find(t => seen.get(t));
      navLinks.forEach((a, i) => targets[i] === cur ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
    }, { rootMargin: '-40% 0px -55% 0px' });
    targets.forEach(t => io.observe(t));
  }

  /* In-page links: after the browser scrolls, move keyboard focus to the section too. */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (!target) return;
    requestAnimationFrame(() => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* Release-check console */
  const runs = {
    lean: {
      cmd: ['python tools/preflight.py', 'lean-task/'],
      lines: [
        ['files', 'task.toml, instruction.md, environment, solution, tests'],
        ['instruction', 'every output path named, no grading hints'],
        ['build', 'Lean toolchain and Mathlib pinned to exact commits'],
        ['oracle', 'reference proof checks: reward 1'],
        ['no-op', 'empty submission: reward 0'],
        ['statement', 'compared with a sealed copy'],
        ['axioms', '[propext, Classical.choice, Quot.sound]'],
        ['forgery', 'sorry or a new axiom: reward 0'],
        ['isolation', 'agent processes stopped before grading'],
      ],
      done: 'all checks passed, ready to submit'
    },
    py: {
      cmd: ['python tools/preflight.py', 'compute-task/'],
      lines: [
        ['files', 'task.toml, instruction.md, environment, solution, tests'],
        ['instruction', 'units, precision and output format stated'],
        ['build', 'base image and packages pinned'],
        ['oracle', 'reference solution: reward 1'],
        ['no-op', 'doing nothing: reward 0'],
        ['grading', 'exact value, or a stated tolerance'],
        ['determinism', 'same result on every run'],
        ['workers', 'sized from the container CPU limit'],
        ['isolation', 'tests copied in only at grading time'],
      ],
      done: 'all checks passed, ready to submit'
    }
  };
  const con = document.getElementById('con');
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function render(key, animate) {
    const r = runs[key];
    let h = '<span class="cmd">$ ' + esc(r.cmd[0]) + ' <span>' + esc(r.cmd[1]) + '</span></span>';
    r.lines.forEach((l, i) => {
      h += '<span class="ln" style="animation-delay:' + (animate ? 180 + i * 150 : 0) + 'ms"><span class="ok">✓</span><span class="key">' + esc(l[0]) + '</span><span class="val">' + esc(l[1]) + '</span></span>';
    });
    h += '<span class="done" style="animation-delay:' + (animate ? 180 + r.lines.length * 150 + 120 : 0) + 'ms">' + esc(r.done) + '</span>';
    con.classList.toggle('anim', !!animate && !reduce);
    con.innerHTML = h;
  }
  const tabs = [...document.querySelectorAll('.con-tabs [role="tab"]')];
  function select(tab, focus) {
    tabs.forEach(t => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    con.setAttribute('aria-labelledby', tab.id);
    render(tab.id === 't-lean' ? 'lean' : 'py', false);
    if (focus) tab.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(tabs[(i + 1) % tabs.length], true); }
    });
  });
  render('lean', true);

  /* Task anatomy */
  const files = [
    { dir: '', name: 'instruction.md', lang: 'markdown', title: 'The instruction',
      lead: 'What the agent reads. It has to be complete, exact and written by hand.',
      code: `Count the domino tilings of the 12 × 12 square.
Each domino covers two edge-adjacent cells, and
the dominoes cover every cell exactly once.

Write the exact count to <span class="s">\`/app/answer.txt\`</span> as a
base-10 integer, with no other text.`,
      checks: ['Every output path appears in backticks', 'States the exact format, so nothing is left to guess', 'Says nothing about how it will be graded', 'No headings, no first-person preamble, no repeated requirements'] },
    { dir: '', name: 'task.toml', lang: 'toml', title: 'Task configuration',
      lead: 'Metadata, resources and time limits that match the real work.',
      code: `<span class="k">[metadata]</span>
difficulty = <span class="s">"hard"</span>
category = <span class="s">"scientific-computing"</span>

<span class="k">[agent]</span>
timeout_sec = <span class="n">3600.0</span>

<span class="k">[verifier]</span>
timeout_sec = <span class="n">600.0</span>

<span class="k">[environment]</span>
cpus = <span class="n">2</span>
memory_mb = <span class="n">4096</span>`,
      checks: ['The field matches the core work: numerical work is scientific computing, not formal mathematics', 'Time limits sized from the reference run', 'The task name matches the platform record exactly'] },
    { dir: 'environment/', name: 'Dockerfile', lang: 'dockerfile', title: 'The environment',
      lead: 'The world the agent works in. It must build the same way every time.',
      code: `<span class="k">FROM</span> python:3.12-slim@sha256:<span class="c">&lt;pinned digest&gt;</span>
<span class="k">RUN</span> pip install --no-cache-dir \\
      numpy==<span class="n">2.1.3</span> sympy==<span class="n">1.13.3</span>
<span class="k">RUN</span> mkdir -p /app
<span class="k">WORKDIR</span> /app`,
      checks: ['Base image pinned by digest, packages by exact version', 'Every download checked against a checksum', 'No solution or tests inside the image'] },
    { dir: 'solution/', name: 'solve.sh', lang: 'bash', title: 'The reference solution',
      lead: 'Proof that the task can be solved, run by the platform as an oracle.',
      code: `<span class="c">#!/bin/bash</span>
set -euo pipefail
python3 <span class="s">"$(dirname "$0")/count.py"</span> &gt; /app/answer.txt`,
      checks: ['Scores 1 on every attempt', 'Exact integer arithmetic where the answer is exact', 'Worker pools sized from the container’s CPU limit, never os.cpu_count()'] },
    { dir: 'tests/', name: 'test.sh', lang: 'bash', title: 'The verifier entry point',
      lead: 'Runs after the agent finishes and writes the reward.',
      code: `<span class="c">#!/bin/bash</span>
mkdir -p /logs/verifier
echo <span class="n">0</span> &gt; /logs/verifier/reward.txt
<span class="k">if</span> pytest --ctrf /logs/verifier/ctrf.json \\
     /tests/test_outputs.py -rA; <span class="k">then</span>
  echo <span class="n">1</span> &gt; /logs/verifier/reward.txt
<span class="k">fi</span>`,
      checks: ['The reward starts at 0, so a crash can’t pass', 'pytest and pytest-json-ctrf pinned', 'Doing nothing scores 0'] },
    { dir: 'tests/', name: 'test_outputs.py', lang: 'python', title: 'The tests',
      lead: 'Check the result, not the method, and accept nothing vague.',
      code: `<span class="k">from</span> pathlib <span class="k">import</span> Path

EXPECTED = int(Path(<span class="s">"/tests/expected.txt"</span>).read_text())

<span class="k">def</span> <span class="n">test_answer_is_exact</span>():
    text = Path(<span class="s">"/app/answer.txt"</span>).read_text().strip()
    <span class="k">assert</span> text.isdigit(), <span class="s">"answer must be an integer"</span>
    <span class="k">assert</span> int(text) == EXPECTED`,
      checks: ['Instructions and tests agree on every requirement', 'Extra text is rejected, not guessed at', 'Hidden from the agent until grading'] },
    { dir: 'Lean tasks add', name: 'axiom audit', lang: 'lean', title: 'The axiom audit',
      lead: 'For proofs, passing the kernel isn’t enough. The proof must rest on standard axioms only.',
      code: `<span class="k">#print axioms</span> Solution.main_theorem

<span class="c">-- 'Solution.main_theorem' depends on axioms:</span>
<span class="c">--   [propext, Classical.choice, Quot.sound]</span>`,
      checks: ['Any sorryAx or new axiom scores 0', 'The statement comes from a sealed copy, so a submission can’t change what it proves', 'Checked in a clean build after the agent’s processes have stopped'] },
  ];
  const fileList = document.getElementById('files'), view = document.getElementById('view');
  let lastDir = null;
  files.forEach((f, i) => {
    if (f.dir && f.dir !== lastDir) {
      const d = document.createElement('div'); d.className = 'dir'; d.textContent = f.dir; d.setAttribute('aria-hidden', 'true'); fileList.appendChild(d);
    }
    lastDir = f.dir;
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'tab'); b.id = 'file-' + i; b.setAttribute('aria-controls', 'view');
    b.style.setProperty('--ind', f.dir ? '14px' : '0px');
    b.innerHTML = '<span></span><span>' + f.name + '</span>';
    b.setAttribute('aria-label', (f.dir && f.dir.endsWith('/') ? f.dir : '') + f.name);
    b.addEventListener('click', () => show(i));
    b.addEventListener('keydown', e => {
      const n = files.length;
      if (['ArrowDown', 'ArrowRight'].includes(e.key)) { e.preventDefault(); show((i + 1) % n, true); }
      if (['ArrowUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); show((i - 1 + n) % n, true); }
    });
    fileList.appendChild(b);
  });
  const btns = [...fileList.querySelectorAll('button')];
  function show(i, focus) {
    const f = files[i];
    btns.forEach((b, j) => { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; });
    view.setAttribute('aria-labelledby', 'file-' + i);
    const path = f.dir.endsWith('/') ? f.dir + f.name : f.name;
    view.innerHTML = '<div class="code"><div class="code-h">' + path + '</div><pre><code>' + f.code + '</code></pre></div>' +
      '<div class="checks"><h3>' + f.title + '</h3><p>' + f.lead + '</p><ul>' + f.checks.map(c => '<li>' + c + '</li>').join('') + '</ul></div>';
    if (focus) btns[i].focus();
  }
  show(0);

  /* Contact */
  const copyBtn = document.getElementById('copyMail');
  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('imranbinmanzoor1@gmail.com'); copyBtn.textContent = 'Copied'; }
    catch (e) { copyBtn.textContent = 'Select to copy'; }
    setTimeout(() => (copyBtn.textContent = 'Copy'), 2000);
  });
  /* Contact form. Without JavaScript it posts to Formspree with native validation.
     With it, fields are checked in place, the request is sent once, and only a
     confirmed 2xx response counts as sent. Anything else keeps every typed value. */
  const form = document.getElementById('contact-form');
  if (form) {
    form.noValidate = true;
    const st = document.getElementById('form-status'), send = document.getElementById('f-send');
    const fields = [...form.querySelectorAll('[required]')];
    let sending = false;
    const flag = (field, bad) => {
      field.setAttribute('aria-invalid', String(bad));
      const er = document.getElementById(field.id + '-error'); if (er) er.hidden = !bad;
    };
    const fail = (text, focusIt) => {
      st.className = 'status-msg is-error';
      st.innerHTML = '';
      st.append(text + ', or email ');
      const link = document.createElement('a'); link.href = 'mailto:imranbinmanzoor1@gmail.com'; link.textContent = 'imranbinmanzoor1@gmail.com';
      st.append(link, '.');
      if (focusIt) { st.tabIndex = -1; st.focus(); }
    };
    const valid = field => field.value.trim() !== '' && field.checkValidity();
    fields.forEach(f => f.addEventListener('input', () => { if (f.getAttribute('aria-invalid') === 'true') flag(f, !valid(f)); }));
    document.querySelectorAll('[data-topic]').forEach(a => a.addEventListener('click', () => {
      const topic = document.getElementById('f-type'); if (topic) topic.value = a.dataset.topic;
    }));
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (sending) return;
      let first = null;
      fields.forEach(f => { const bad = !valid(f); flag(f, bad); if (bad && !first) first = f; });
      if (first) { st.className = 'status-msg'; st.textContent = 'Please check the highlighted fields.'; first.focus(); return; }
      sending = true; send.setAttribute('aria-disabled', 'true'); send.textContent = 'Sending…';
      st.className = 'status-msg'; st.textContent = '';
      try {
        const res = await fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
        if (res.ok) {
          form.reset(); fields.forEach(f => f.removeAttribute('aria-invalid'));
          st.className = 'status-msg ok'; st.textContent = 'Message sent. I’ll reply by email.';
        } else {
          let data = null; try { data = await res.json(); } catch (_) {}
          const errs = (data && data.errors) || [];
          const map = { name: 'f-name', email: 'f-email', message: 'f-message' };
          const flagged = errs.map(x => document.getElementById(map[x.field])).filter(Boolean);
          flagged.forEach(el => flag(el, true));
          if (flagged.length) { fail('Please check the highlighted fields', false); flagged[0].focus(); }
          else fail((errs[0] && errs[0].message ? errs[0].message + '. ' : 'The message couldn’t be sent (error ' + res.status + '). ') + 'Please try again', true);
        }
      } catch (err) {
        fail('The message couldn’t be sent. Check your connection and try again', true);
      } finally { sending = false; send.removeAttribute('aria-disabled'); send.textContent = 'Send message'; }
    });
  }
})();
