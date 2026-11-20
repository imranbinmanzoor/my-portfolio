(() => {

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

  /* Tabs over panels that are already in the page (release checks and task files).
     Arrow keys move between tabs; only the selected tab is in the Tab order. */
  function tabset(tabs, onSelect) {
    const select = (tab, focus) => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) { panel.hidden = !on; panel.classList.remove('later'); }
      });
      if (onSelect) onSelect(tab);
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        const n = tabs.length, next = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (next) { e.preventDefault(); select(tabs[(i + next + n) % n], true); }
        else if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
        else if (e.key === 'End') { e.preventDefault(); select(tabs[n - 1], true); }
      });
    });
    const current = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
    if (current) select(current);
  }
  tabset([...document.querySelectorAll('.con-tabs [role="tab"]')]);
  tabset([...document.querySelectorAll('#files [role="tab"]')]);

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
