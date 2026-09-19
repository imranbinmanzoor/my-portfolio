/* ================================================================
   SHARED SCRIPTS — Muhammad Imran
   Behavior for theme toggle, nav scroll state, mobile menu,
   reveal animations, smooth scroll, and form handling.
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

  /* ---------- 2. NAV scroll state ---------- */
  var nav = document.querySelector('[data-nav-sticky]');
  if (nav) {
    function updateNavState() {
      if (window.scrollY > 20) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    }
    updateNavState();
    window.addEventListener('scroll', updateNavState, { passive: true });
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
    if (!mobileMenu) return;
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
    if (!mobileMenu) return;
    backgroundState.forEach(function (entry) { entry[0].inert = entry[1]; });
    backgroundState = [];
    if (navToggle) navToggle.focus({ preventScroll: true });
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if ('inert' in mobileMenu) mobileMenu.inert = true;
    body.classList.remove('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
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
    if (window.innerWidth > 960 && mobileMenu && mobileMenu.classList.contains('is-open')) closeMenu();
  });

  /* ---------- 4. Active nav link (main page only) ---------- */
  function localAnchor(link) {
    var url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return null;
    try { return document.getElementById(decodeURIComponent(url.hash.slice(1))); }
    catch (e) { return null; }
  }
  var navLinks = document.querySelectorAll('[data-nav-link]');
  var observedIds = [];
  navLinks.forEach(function (link) {
    var target = localAnchor(link);
    if (target && !observedIds.includes(target.id)) observedIds.push(target.id);
  });
  if (document.getElementById('home')) observedIds.unshift('home');
  var observedSections = observedIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && observedSections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            var target = localAnchor(link);
            link.classList.toggle('is-active', !!target && target.id === id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    observedSections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- 5. REVEAL ANIMATIONS ---------- */
  var reveals = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !reduceMotion && reveals.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    reveals.forEach(function (el) {
      if (el.closest('.hero, .page-hero')) {
        requestAnimationFrame(function () { el.classList.add('is-visible'); });
      } else {
        revealObserver.observe(el);
      }
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 6. Image fallback ---------- */
  document.querySelectorAll('.work-card__media img, .about-portrait__img img, .project-screenshot img')
    .forEach(function (img) {
      img.addEventListener('error', function () { img.style.display = 'none'; }, { once: true });
    });

  /* ---------- 7. Contact form (Formspree AJAX) ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var submitBtn = document.getElementById('submit-btn');
    var statusEl = document.getElementById('form-status');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        statusEl.textContent = 'Please fill in all fields.';
        statusEl.className = 'form-status is-error';
        return;
      }
      var textEl = submitBtn.querySelector('.btn__text');
      var originalText = textEl.textContent;
      textEl.textContent = 'Sending…';
      submitBtn.disabled = true;
      statusEl.textContent = '';
      statusEl.className = 'form-status';
      var data = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          statusEl.textContent = 'Thanks — your message is on its way.';
          statusEl.className = 'form-status is-success';
        } else {
          return res.json().then(function (d) {
            var msg = (d && d.errors && d.errors.map(function(e){ return e.message; }).join(', ')) || 'Something went wrong. Please try again.';
            statusEl.textContent = msg;
            statusEl.className = 'form-status is-error';
          });
        }
      })
      .catch(function () {
        statusEl.textContent = 'Network error. Please try again or email me directly.';
        statusEl.className = 'form-status is-error';
      })
      .finally(function () {
        textEl.textContent = originalText;
        submitBtn.disabled = false;
      });
    });
  }

  /* ---------- 8. Smooth-scroll offset for sticky nav ---------- */
  document.querySelectorAll('a[href*="#"]').forEach(function (a) {
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
