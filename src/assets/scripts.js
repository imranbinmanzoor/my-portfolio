/* ================================================================
   SHARED SCRIPTS — Muhammad Imran
   Theme, mobile header and menu, current-section navigation,
   in-page links, the contact form, and the footer year.
   ================================================================ */

(function () {
  'use strict';

  var html = document.documentElement;
  var body = document.body;

  /* ---------- 0. CLEAN GITHUB PAGES URL ---------- */
  if (window.location.pathname.endsWith('/index.html')) {
    var cleanPath = window.location.pathname.slice(0, -10) || '/';
    window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
  }

  /* ---------- 1. THEME ---------- */
  var themeToggles = document.querySelectorAll('[data-theme-toggle]');
  function readStoredTheme() { try { return localStorage.getItem('theme'); } catch (e) { return null; } }
  function storeTheme(t) { try { localStorage.setItem('theme', t); } catch (e) {} }
  function syncThemeButtons() {
    var isDark = html.getAttribute('data-theme') === 'dark';
    themeToggles.forEach(function (btn) {
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  var stored = readStoredTheme();
  if (stored === 'light' || stored === 'dark') {
    html.setAttribute('data-theme', stored);
  } else {
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
  syncThemeButtons();

  themeToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      storeTheme(next);
      syncThemeButtons();
    });
  });

  /* ---------- 2. Mobile header: reveal on upward scroll, reset across layouts ---------- */
  var nav = document.querySelector('[data-nav-sticky]');
  var desktopNavigation = window.matchMedia('(min-width: 800px)');
  if (nav) {
    function syncChromeOffset() {
      var hidden = nav.classList.contains('is-scroll-hidden') && !nav.matches(':focus-within');
      // Desktop uses the stylesheet's frame inset; phones follow the floating header.
      if (desktopNavigation.matches) body.style.removeProperty('--site-chrome-top');
      else body.style.setProperty('--site-chrome-top', hidden ? '0px' : (nav.offsetHeight + 20) + 'px');
    }
    function setNavHidden(hidden) {
      nav.classList.toggle('is-scroll-hidden', hidden);
      syncChromeOffset();
    }
    var previousScroll = Math.max(0, window.scrollY);
    var scrollTravel = 0;
    var scrollDirection = 0;
    var resetNavState = function () {
      previousScroll = Math.max(0, window.scrollY);
      scrollTravel = 0;
      scrollDirection = 0;
      setNavHidden(false);
    };
    function updateNavState() {
      var current = Math.max(0, window.scrollY);
      var delta = current - previousScroll;
      previousScroll = current;
      if (desktopNavigation.matches || body.classList.contains('nav-open') || nav.matches(':focus-within') || current < 80) {
        setNavHidden(false);
        scrollTravel = 0;
        return;
      }
      var direction = Math.sign(delta);
      if (!direction) return;
      if (direction !== scrollDirection) scrollTravel = 0;
      scrollDirection = direction;
      scrollTravel += Math.abs(delta);
      if (scrollTravel >= (direction > 0 ? 16 : 8)) {
        setNavHidden(direction > 0 && current > 120);
        scrollTravel = 0;
      }
    }
    window.addEventListener('scroll', updateNavState, { passive: true });
    window.addEventListener('resize', resetNavState);
    nav.addEventListener('focusin', resetNavState);
    new ResizeObserver(syncChromeOffset).observe(nav);
    desktopNavigation.addEventListener('change', resetNavState);
    syncChromeOffset();
  }

  /* ---------- 3. MOBILE MENU (separate element, fully cross-platform) ---------- */
  var mobileMenu = document.getElementById('mobile-menu');
  var navToggle = document.querySelector('[data-menu-open]');
  var closeToggle = document.querySelector('[data-menu-close]');
  var backgroundState = [];

  if (mobileMenu) {
    mobileMenu.setAttribute('aria-label', 'Site navigation');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if ('inert' in mobileMenu) mobileMenu.inert = true;
  }
  if (navToggle) {
    navToggle.setAttribute('aria-controls', 'mobile-menu');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    if (!mobileMenu || mobileMenu.classList.contains('is-open')) return;
    if (nav) resetNavState();
    backgroundState = Array.from(body.children).filter(function (el) {
      return el !== mobileMenu && !['SCRIPT', 'STYLE', 'LINK'].includes(el.tagName);
    }).map(function (el) { var wasInert = el.inert; el.inert = true; return [el, wasInert]; });
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    if ('inert' in mobileMenu) mobileMenu.inert = false;
    body.classList.add('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
    var closeButton = mobileMenu.querySelector('[data-menu-close]');
    if (closeButton) closeButton.focus({ preventScroll: true });
  }
  function closeMenu() {
    if (!mobileMenu || !mobileMenu.classList.contains('is-open')) return;
    backgroundState.forEach(function (entry) { entry[0].inert = entry[1]; });
    backgroundState = [];
    var returnTarget = desktopNavigation.matches ? nav && nav.querySelector('.brand') : navToggle;
    if (returnTarget) returnTarget.focus({ preventScroll: true });
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if ('inert' in mobileMenu) mobileMenu.inert = true;
    body.classList.remove('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    if (nav) resetNavState();
  }

  if (navToggle) navToggle.addEventListener('click', openMenu);
  if (closeToggle) closeToggle.addEventListener('click', closeMenu);

  // Close when any menu link is clicked
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('is-open')) closeMenu();
    if (e.key === 'Tab' && mobileMenu && mobileMenu.classList.contains('is-open')) {
      var controls = Array.from(mobileMenu.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex="0"]')).filter(function (el) { return el.getClientRects().length; });
      var first = controls[0], last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Close on resize to desktop
  window.addEventListener('resize', function () {
    if (desktopNavigation.matches && mobileMenu && mobileMenu.classList.contains('is-open')) closeMenu();
  });

  /* ---------- 4. Active nav link (main page only) ---------- */
  function localAnchor(link) {
    var url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return null;
    try { return document.getElementById(decodeURIComponent(url.hash.slice(1))); }
    catch (e) { return null; }
  }
  var navLinks = document.querySelectorAll('[data-nav-link]');
  document.querySelectorAll('.nav__links a,.mobile-menu__links a').forEach(function(link){
    const path=new URL(link.href,location.href).pathname;
    if(path!=='/'&&location.pathname.startsWith(path))link.setAttribute('aria-current','page');
  });
  var observedIds = [];
  navLinks.forEach(function (link) {
    var target = localAnchor(link);
    if (target && !observedIds.includes(target.id)) observedIds.push(target.id);
  });
  if (document.getElementById('home') && !observedIds.includes('home')) observedIds.unshift('home');
  var observedSections = observedIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean)
    .sort(function (a, b) { return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });

  if (observedSections.length) {
    var activeFrame = 0;
    function syncSectionLocation() {
      activeFrame = 0;
      // Mark the listed section that contains the reading line. Between listed sections
      // (projects, learning, tools) nothing is marked rather than the last one passed.
      var line = SiteScroll.top + Math.min(200, window.innerHeight * .25);
      var current = null;
      observedSections.forEach(function (section) {
        var box = section.getBoundingClientRect();
        if (!current && box.top <= line && box.bottom > line) current = section;
      });
      if (SiteScroll.y + SiteScroll.height >= SiteScroll.extent - 2) current = observedSections[observedSections.length - 1];
      navLinks.forEach(function (link) {
        var active = localAnchor(link) === current;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    function scheduleSectionLocation() {
      if (!activeFrame) activeFrame = requestAnimationFrame(syncSectionLocation);
    }
    syncSectionLocation();
    SiteScroll.on(scheduleSectionLocation);
    window.addEventListener('resize', scheduleSectionLocation);
  }

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 7. Contact form (Formspree) ----------
     Without JavaScript the form posts normally with native validation. With it, fields
     are checked in place, the request is sent once, and only a confirmed 2xx response
     replaces the form with the confirmation. Anything else keeps every typed value. */
  var form = document.getElementById('contact-form');
  if (form) {
    form.noValidate = true;
    var submitBtn = document.getElementById('submit-btn');
    var statusEl = document.getElementById('form-status');
    var confirmation = document.getElementById('contact-confirmation');
    var emailFallback = 'You can also email <a href="mailto:imranbinmanzoor1@gmail.com">imranbinmanzoor1@gmail.com</a>.';
    var fields = Array.prototype.slice.call(form.querySelectorAll('input[required], textarea[required]'));
    var escapeText = function (text) { return String(text).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); };
    function showFieldState(field) {
      var error = document.getElementById(field.id + '-error');
      var invalid = !field.value.trim() || !field.checkValidity();
      field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
      if (error) error.hidden = !invalid;
      return !invalid;
    }
    fields.forEach(function (field) {
      // Once a field has been flagged, re-check it as it is corrected.
      field.addEventListener('input', function () { if (field.getAttribute('aria-invalid') === 'true') showFieldState(field); });
    });
    function setError(html) {
      statusEl.innerHTML = html;
      statusEl.className = 'form-status is-error';
    }
    document.querySelector('[data-contact-another]').addEventListener('click', function () {
      confirmation.hidden = true;
      form.hidden = false;
      statusEl.textContent = '';
      statusEl.className = 'form-status';
      document.getElementById('f-name').focus();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitBtn.disabled) return;
      var firstInvalid = null;
      fields.forEach(function (field) { if (!showFieldState(field) && !firstInvalid) firstInvalid = field; });
      if (firstInvalid) {
        setError('Please check the highlighted fields.');
        firstInvalid.focus();
        return;
      }
      var textEl = submitBtn.querySelector('.btn__text');
      var originalText = textEl.textContent;
      textEl.textContent = 'Sending…';
      submitBtn.disabled = true;
      form.setAttribute('aria-busy', 'true');
      statusEl.textContent = '';
      statusEl.className = 'form-status';

      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            fields.forEach(function (field) { field.removeAttribute('aria-invalid'); });
            form.hidden = true;
            confirmation.hidden = false;
            confirmation.focus({ preventScroll: true });
            confirmation.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
            return;
          }
          // A rejected submission: show the service's own reasons when it gives them.
          return res.json().catch(function () { return null; }).then(function (d) {
            var reasons = d && d.errors && d.errors.map(function (x) { return x && x.message; }).filter(Boolean);
            var text = reasons && reasons.length ? reasons.join('. ').replace(/\.?$/, '.') : 'The message could not be sent (error ' + res.status + ').';
            setError(escapeText(text) + ' Your text is still here. ' + emailFallback);
          });
        })
        .catch(function () {
          setError('The message could not be sent. Check your connection and try again; your text is still here. ' + emailFallback);
        })
        .finally(function () {
          textEl.textContent = originalText;
          submitBtn.disabled = false;
          form.removeAttribute('aria-busy');
        });
    });
  }

  /* ---------- 8. Smooth-scroll offset for sticky nav ---------- */
  document.querySelectorAll('a[href*="#"]').forEach(function (a) {
    if(body.hasAttribute('data-book')&&!a.closest('.nav,.mobile-menu,.site-footer'))return;
    a.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
      var target = localAnchor(a);
      if (!target) return;
      e.preventDefault();
      var href = new URL(a.href, location.href).hash;
      if (location.hash !== href) history.pushState(null, '', href);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- 9. Year auto-update ---------- */
  var yearEls = document.querySelectorAll('[data-year]');
  var nowYear = String(new Date().getFullYear());
  yearEls.forEach(function (el) { el.textContent = nowYear; });
})();
