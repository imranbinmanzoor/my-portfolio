/* ================================================================
   SHARED SCRIPTS — Muhammad Imran
   Behavior for theme toggle, nav scroll state, mobile menu,
   reveal animations, smooth scroll, and form handling.
   ================================================================ */

(function () {
  'use strict';

  var html = document.documentElement;
  var body = document.body;

  /* ---------- 1. THEME ---------- */
  var themeToggles = document.querySelectorAll('[data-theme-toggle]');
  function readStoredTheme() { try { return localStorage.getItem('theme'); } catch (e) { return null; } }
  function storeTheme(t) { try { localStorage.setItem('theme', t); } catch (e) {} }

  var stored = readStoredTheme();
  if (stored === 'light' || stored === 'dark') {
    html.setAttribute('data-theme', stored);
  } else {
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
  themeToggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      storeTheme(next);
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

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('is-open');
    body.classList.add('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
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
  });

  // Close on resize to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 760 && mobileMenu && mobileMenu.classList.contains('is-open')) closeMenu();
  });

  /* ---------- 4. Active nav link (main page only) ---------- */
  var navLinks = document.querySelectorAll('[data-nav-link]');
  var observedIds = [];
  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href.indexOf('#') === 0 && href.length > 1) {
      observedIds.push(href.substring(1));
    }
  });
  var observedSections = observedIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && observedSections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
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
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var navH = nav ? nav.offsetHeight : 68;
      var top = target.getBoundingClientRect().top + window.pageYOffset - navH + 1;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ---------- 9. Year auto-update ---------- */
  var yearEls = document.querySelectorAll('[data-year]');
  var nowYear = String(new Date().getFullYear());
  yearEls.forEach(function (el) { el.textContent = nowYear; });
})();
