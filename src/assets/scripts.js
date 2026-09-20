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
  /* A shared detail row keeps the discipline cards aligned on wider screens. */
  var disciplines = document.querySelector('.disciplines');
  if (disciplines) {
    var disciplineButtons = Array.from(disciplines.querySelectorAll('.discipline__trigger'));
    disciplines.setAttribute('data-enhanced', '');
    function measureDisciplineJoin() {
      var button = disciplines.querySelector('[aria-expanded="true"]');
      if (!button) return;
      var panel = document.getElementById(button.getAttribute('aria-controls'));
      var b = button.getBoundingClientRect(), p = panel.getBoundingClientRect();
      var edge = parseFloat(getComputedStyle(panel).borderTopWidth);
      var buttonEdge = parseFloat(getComputedStyle(button).borderTopWidth);
      panel.style.setProperty('--join-left', (b.left - p.left - edge) + 'px');
      panel.style.setProperty('--join-width', b.width + 'px');
      panel.style.setProperty('--join-top', (b.bottom - p.top - edge - buttonEdge) + 'px');
      panel.style.setProperty('--join-height', (p.top - b.bottom + edge + buttonEdge) + 'px');
    }
    new ResizeObserver(measureDisciplineJoin).observe(disciplines);
    disciplineButtons.forEach(function (button) {
      button.setAttribute('aria-expanded', 'false');
      document.getElementById(button.getAttribute('aria-controls')).hidden = true;
      button.addEventListener('click', function () {
        var opening = button.getAttribute('aria-expanded') !== 'true';
        disciplineButtons.forEach(function (item) {
          var expanded = item === button && opening;
          item.setAttribute('aria-expanded', String(expanded));
          document.getElementById(item.getAttribute('aria-controls')).hidden = !expanded;
        });
        measureDisciplineJoin();
      });
    });
  }
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
      body.style.setProperty('--site-chrome-top', desktopNavigation.matches || hidden ? '0px' : (nav.offsetHeight + 20) + 'px');
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
    .filter(Boolean);

  if (observedSections.length) {
    var activeFrame = 0;
    function syncSectionLocation() {
      activeFrame = 0;
      var ordered = observedSections.slice().sort(function (a, b) {
        return a.getBoundingClientRect().top - b.getBoundingClientRect().top;
      });
      var current = ordered[0];
      ordered.forEach(function (section) {
        if (section.getBoundingClientRect().top <= Math.min(200, window.innerHeight * .25)) current = section;
      });
      if (SiteScroll.y + SiteScroll.height >= SiteScroll.extent - 2) current = ordered[ordered.length - 1];
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
    var confirmation = document.getElementById('contact-confirmation');
    document.querySelector('[data-contact-another]').addEventListener('click', function () {
      confirmation.hidden = true;
      form.hidden = false;
      statusEl.textContent = '';
      statusEl.className = 'form-status';
      document.getElementById('f-name').focus();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        statusEl.textContent = 'Please complete the required fields and check your email address.';
        statusEl.className = 'form-status is-error';
        form.reportValidity();
        return;
      }
      if (submitBtn.disabled) return;
      var textEl = submitBtn.querySelector('.btn__text');
      var originalText = textEl.textContent;
      textEl.textContent = 'Sending…';
      submitBtn.disabled = true;
      form.setAttribute('aria-busy', 'true');
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
          form.hidden = true;
          confirmation.hidden = false;
          confirmation.focus({preventScroll:true});
          confirmation.scrollIntoView({block:'nearest',behavior:reduceMotion ? 'auto' : 'smooth'});
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
