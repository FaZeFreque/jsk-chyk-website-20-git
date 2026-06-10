/* ==========================================================
   CHYK BASE.JS — Shared script for ALL inner pages
   ========================================================== */

(function () {
  'use strict';

  if (window.CHYK_BASE_INIT) return;
  window.CHYK_BASE_INIT = true;

  // Stable viewport unit for mobile browsers whose address bar changes height.
  function setMobileViewportUnit() {
    const viewport = window.visualViewport;
    const height = viewport ? viewport.height : window.innerHeight;
    document.documentElement.style.setProperty('--mobile-vh', `${height * 0.01}px`);
  }
  setMobileViewportUnit();
  window.addEventListener('orientationchange', setMobileViewportUnit, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setMobileViewportUnit, { passive: true });
  }

  gsap.registerPlugin(ScrollTrigger);

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────
     1. LENIS SMOOTH SCROLL
     Drive exclusively through GSAP ticker.
     Never add a separate rAF loop — it double-drives Lenis.
  ───────────────────────────────────────────── */
  const lenis = new Lenis({
    duration: 1.0,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothTouch: false,
    touchMultiplier: 2,
  });

  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);

  window.CHYK_LENIS = lenis;

  /* Film grain overlay */
  if (!prefersReduced && !document.querySelector('.grain-overlay')) {
    const g = document.createElement('div');
    g.className = 'grain-overlay';
    g.setAttribute('aria-hidden', 'true');
    document.body.appendChild(g);
  }

  /* ─────────────────────────────────────────────
     2. INJECT SHARED NAV + MOBILE MENU
     Injects consistent dropdown nav into every page.
     Active link is set by matching the current URL.
  ───────────────────────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  function isActive(href) {
    return href.split('/').pop() === currentPage ? ' active' : '';
  }

  const NAV_LINKS = `
    <a href="index.html"    class="nav-link${isActive('index.html')}">Home</a>

    <div class="nav-dd-wrap">
      <button class="nav-link nav-dd-trigger${[isActive('about.html'), isActive('wings.html'), isActive('contact.html')].some(Boolean) ? ' active' : ''}">
        About <span class="nav-caret">↓</span>
      </button>
      <div class="nav-dd-panel">
        <a href="about.html"   class="nav-dd-item${isActive('about.html')}">
          <span class="nav-dd-label">About CHYK</span>
          <span class="nav-dd-sub">Who we are &amp; our mission</span>
        </a>
        <a href="wings.html"   class="nav-dd-item${isActive('wings.html')}">
          <span class="nav-dd-label">Wings</span>
          <span class="nav-dd-sub">Specialised programme verticals</span>
        </a>
        <a href="contact.html" class="nav-dd-item${isActive('contact.html')}">
          <span class="nav-dd-label">Contact</span>
          <span class="nav-dd-sub">Find a centre near you</span>
        </a>
      </div>
    </div>

    <div class="nav-dd-wrap">
      <button class="nav-link nav-dd-trigger${[isActive('activities.html'), isActive('events.html'), isActive('join.html')].some(Boolean) ? ' active' : ''}">
        Discover <span class="nav-caret">↓</span>
      </button>
      <div class="nav-dd-panel">
        <a href="activities.html" class="nav-dd-item${isActive('activities.html')}">
          <span class="nav-dd-label">Activities</span>
          <span class="nav-dd-sub">Camps, yatras, study &amp; more</span>
        </a>
        <a href="events.html" class="nav-dd-item${isActive('events.html')}">
          <span class="nav-dd-label">Events</span>
          <span class="nav-dd-sub">Upcoming CHYK programmes</span>
        </a>
        <a href="join.html" class="nav-dd-item${isActive('join.html')}">
          <span class="nav-dd-label">Join CHYK</span>
          <span class="nav-dd-sub">Become a member today</span>
        </a>
      </div>
    </div>

    <div class="nav-dd-wrap">
      <button class="nav-link nav-dd-trigger${[isActive('content-hub.html'), isActive('talks-and-articles.html'), isActive('magazine.html'), isActive('art.html'), isActive('social.html')].some(Boolean) ? ' active' : ''}">
        Content <span class="nav-caret">↓</span>
      </button>
      <div class="nav-dd-panel nav-dd-panel--wide">
        <a href="content-hub.html" class="nav-dd-item${isActive('content-hub.html')}">
          <span class="nav-dd-label">Content Hub</span>
          <span class="nav-dd-sub">Everything in one place</span>
        </a>
        <a href="talks-and-articles.html" class="nav-dd-item${isActive('talks-and-articles.html')}">
          <span class="nav-dd-label">Talks &amp; Articles</span>
          <span class="nav-dd-sub">Discourses &amp; essays</span>
        </a>
        <a href="magazine.html" class="nav-dd-item${isActive('magazine.html')}">
          <span class="nav-dd-label">Udghosh Magazine</span>
          <span class="nav-dd-sub">CHYK's youth publication</span>
        </a>
        <a href="art.html" class="nav-dd-item${isActive('art.html')}">
          <span class="nav-dd-label">Art &amp; Culture</span>
          <span class="nav-dd-sub">Gallery of CHYK creativity</span>
        </a>
        <a href="social.html" class="nav-dd-item${isActive('social.html')}">
          <span class="nav-dd-label">Social</span>
          <span class="nav-dd-sub">Follow us online</span>
        </a>
      </div>
    </div>

    <div class="nav-dd-wrap">
      <button class="nav-link nav-dd-trigger${[isActive('leaders.html'), isActive('alumni.html')].some(Boolean) ? ' active' : ''}">
        People <span class="nav-caret">↓</span>
      </button>
      <div class="nav-dd-panel">
        <a href="leaders.html" class="nav-dd-item${isActive('leaders.html')}">
          <span class="nav-dd-label">CHYK Leaders</span>
          <span class="nav-dd-sub">Swamins, acharyas &amp; coordinators</span>
        </a>
        <a href="alumni.html" class="nav-dd-item${isActive('alumni.html')}">
          <span class="nav-dd-label">CHYK Alumni</span>
          <span class="nav-dd-sub">The legacy of CHYK members</span>
        </a>
      </div>
    </div>

    <a href="join.html" class="nav-link nav-cta magnetic-btn${isActive('join.html')}">Join CHYK</a>
  `;

  const MOBILE_LINKS = `
    <a href="index.html"              class="mobile-nav-link${isActive('index.html')}">Home</a>
    <a href="about.html"              class="mobile-nav-link${isActive('about.html')}">About</a>
    <a href="activities.html"         class="mobile-nav-link${isActive('activities.html')}">Activities</a>
    <a href="events.html"             class="mobile-nav-link${isActive('events.html')}">Events</a>
    <a href="join.html"               class="mobile-nav-link${isActive('join.html')}">Join CHYK</a>
    <a href="content-hub.html"        class="mobile-nav-link${isActive('content-hub.html')}">Content Hub</a>
    <a href="talks-and-articles.html" class="mobile-nav-link${isActive('talks-and-articles.html')}">Talks &amp; Articles</a>
    <a href="magazine.html"           class="mobile-nav-link${isActive('magazine.html')}">Magazine</a>
    <a href="art.html"                class="mobile-nav-link${isActive('art.html')}">Art &amp; Culture</a>
    <a href="social.html"             class="mobile-nav-link${isActive('social.html')}">Social</a>
    <a href="wings.html"              class="mobile-nav-link${isActive('wings.html')}">Wings</a>
    <a href="contact.html"            class="mobile-nav-link${isActive('contact.html')}">Contact</a>
    <a href="leaders.html"            class="mobile-nav-link${isActive('leaders.html')}">Leaders</a>
    <a href="alumni.html"             class="mobile-nav-link${isActive('alumni.html')}">Alumni</a>
  `;

  /* Inject desktop nav */
  const desktopNav = document.querySelector('.desktop-nav');
  if (desktopNav) desktopNav.innerHTML = NAV_LINKS;

  /* Inject mobile nav links */
  const mobileNavLinks = document.querySelector('.mobile-nav-links');
  if (mobileNavLinks) mobileNavLinks.innerHTML = MOBILE_LINKS;

  /* ─────────────────────────────────────────────
     3. DROPDOWN INTERACTIONS
  ───────────────────────────────────────────── */
  function initDropdowns() {
    const wraps = document.querySelectorAll('.nav-dd-wrap');

    wraps.forEach(wrap => {
      const panel = wrap.querySelector('.nav-dd-panel');
      const caret = wrap.querySelector('.nav-caret');
      let closeTimer;

      function open() {
        clearTimeout(closeTimer);
        // Close siblings first
        wraps.forEach(w => { if (w !== wrap) closeWrap(w); });
        wrap.classList.add('dd-open');
        if (caret) gsap.to(caret, { rotation: 180, duration: 0.3, ease: 'power2.out' });
        if (panel) {
          gsap.fromTo(panel,
            { opacity: 0, y: -8, pointerEvents: 'none' },
            { opacity: 1, y: 0, pointerEvents: 'all', duration: 0.28, ease: 'power2.out' }
          );
        }
      }

      function closeWrap(w) {
        const p = w.querySelector('.nav-dd-panel');
        const c = w.querySelector('.nav-caret');
        w.classList.remove('dd-open');
        if (c) gsap.to(c, { rotation: 0, duration: 0.25 });
        if (p) gsap.to(p, { opacity: 0, y: -6, pointerEvents: 'none', duration: 0.2 });
      }

      function close() {
        closeTimer = setTimeout(() => closeWrap(wrap), 120);
      }

      wrap.addEventListener('mouseenter', open);
      wrap.addEventListener('mouseleave', close);
      if (panel) {
        panel.addEventListener('mouseenter', () => clearTimeout(closeTimer));
        panel.addEventListener('mouseleave', close);
      }

      /* Touch / click toggle */
      const trigger = wrap.querySelector('.nav-dd-trigger');
      if (trigger) {
        trigger.addEventListener('click', e => {
          e.stopPropagation();
          if (wrap.classList.contains('dd-open')) closeWrap(wrap);
          else open();
        });
      }
    });

    /* Click outside closes all */
    document.addEventListener('click', () => {
      wraps.forEach(w => {
        if (w.classList.contains('dd-open')) {
          const p = w.querySelector('.nav-dd-panel');
          const c = w.querySelector('.nav-caret');
          w.classList.remove('dd-open');
          if (c) gsap.to(c, { rotation: 0, duration: 0.25 });
          if (p) gsap.to(p, { opacity: 0, y: -6, pointerEvents: 'none', duration: 0.2 });
        }
      });
    });
  }

  initDropdowns();

  /* ─────────────────────────────────────────────
     4. CUSTOM CURSOR (multi-state)
  ───────────────────────────────────────────── */
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');

  if (dot && ring && window.matchMedia('(hover: hover)').matches) {
    document.body.style.cursor = 'none';
    const xDot  = gsap.quickTo(dot,  'x', { duration: 0.09, ease: 'power3.out' });
    const yDot  = gsap.quickTo(dot,  'y', { duration: 0.09, ease: 'power3.out' });
    const xRing = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3.out' });
    const yRing = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3.out' });

    document.addEventListener('mousemove', e => {
      xDot(e.clientX); yDot(e.clientY);
      xRing(e.clientX); yRing(e.clientY);
    });

    const CURSOR_STATES = ['cursor--link', 'cursor--img', 'cursor--text', 'hovered'];

    function setCursorState(state) {
      dot.classList.remove(...CURSOR_STATES);
      ring.classList.remove(...CURSOR_STATES);
      if (state) { dot.classList.add(state); ring.classList.add(state); }
    }

    document.addEventListener('mouseover', e => {
      const t = e.target;
      if (t.closest('img, .gallery-item, figure, [data-cursor="image"]'))       setCursorState('cursor--img');
      else if (t.closest('a, button, .filter-tab, label, [data-cursor-hover]')) setCursorState('cursor--link');
      else if (t.closest('p, h1, h2, h3, h4, input, textarea'))                 setCursorState('cursor--text');
      else setCursorState(null);
    });

    /* Dot pulse on click */
    document.addEventListener('mousedown', () => gsap.to(dot, { scale: 0.5, duration: 0.1, ease: 'power2.in' }));
    document.addEventListener('mouseup',   () => gsap.to(dot, { scale: 1,   duration: 0.35, ease: 'elastic.out(1.5, 0.5)' }));
  }

  /* ─────────────────────────────────────────────
     5. HEADER SCROLL CLASS
  ───────────────────────────────────────────── */
  const header = document.getElementById('site-header');
  if (header) {
    lenis.on('scroll', ({ scroll }) => {
      header.classList.toggle('scrolled', scroll > 60);
    });
  }

  /* ─────────────────────────────────────────────
     6. MOBILE MENU TOGGLE
  ───────────────────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) lenis.stop(); else lenis.start();
    });

    mobileMenu.querySelectorAll('.mobile-nav-link, .mobile-cta').forEach(el => {
      el.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
        lenis.start();
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
        lenis.start();
      }
    });
  }

  /* ─────────────────────────────────────────────
     7. PAGE TRANSITIONS
  ───────────────────────────────────────────── */
  const ptOverlay = document.querySelector('.page-transition-overlay');
  if (ptOverlay) {
    gsap.fromTo(ptOverlay,
      { scaleY: 1, transformOrigin: 'top' },
      { scaleY: 0, duration: 0.55, ease: 'power3.inOut', onComplete: () => gsap.set(ptOverlay, { scaleY: 0 }) }
    );

    document.addEventListener('click', e => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
      if (link.target === '_blank') return;
      e.preventDefault();
      lenis.stop();
      gsap.fromTo(ptOverlay,
        { scaleY: 0, transformOrigin: 'bottom' },
        { scaleY: 1, duration: 0.5, ease: 'power3.inOut', onComplete: () => { window.location.href = href; } }
      );
    });
  }

  /* ─────────────────────────────────────────────
     8. SCROLL REVEALS
  ───────────────────────────────────────────── */
  function initReveals() {
    gsap.utils.toArray('.gsap-reveal').forEach(el => {
      gsap.fromTo(el,
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
      );
    });
    gsap.utils.toArray('.gsap-reveal-left').forEach(el => {
      gsap.fromTo(el,
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
      );
    });
    gsap.utils.toArray('.gsap-reveal-right').forEach(el => {
      gsap.fromTo(el,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
      );
    });
    gsap.utils.toArray('.gsap-reveal-scale').forEach(el => {
      gsap.fromTo(el,
        { scale: 0.93, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
      );
    });
    gsap.utils.toArray('[data-stagger]').forEach(group => {
      gsap.fromTo(Array.from(group.children),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: group, start: 'top 88%', once: true } }
      );
    });
  }

  /* Delay reveals until after page-in animation */
  if (!prefersReduced) setTimeout(initReveals, 200);

  /* ─────────────────────────────────────────────
     9. STATS COUNTER
  ───────────────────────────────────────────── */
  document.querySelectorAll('[data-counter]').forEach(el => {
    const target   = parseFloat(el.dataset.target || '0');
    const suffix   = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimals || '0');
    if (isNaN(target)) return;
    if (prefersReduced) { el.textContent = target.toFixed(decimals) + suffix; return; }
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target, duration: 1.8, ease: 'power2.out',
      onUpdate: () => { el.textContent = obj.val.toFixed(decimals) + suffix; },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });

  /* ─────────────────────────────────────────────
     10. MAGNETIC BUTTONS
  ───────────────────────────────────────────── */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width  / 2) * 0.25;
        const y = (e.clientY - r.top  - r.height / 2) * 0.3;
        gsap.to(btn, { x, y, duration: 0.4, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.6)' });
      });
    });
  }

  /* ─────────────────────────────────────────────
     11. MODAL + LIGHTBOX HELPERS
  ───────────────────────────────────────────── */
  window.CHYK = window.CHYK || {};

  window.CHYK.openModal = function (id, triggerElement) {
    const el = document.getElementById(id);
    if (!el) return;

    const box = el.querySelector('.modal-box');
    const body = el.querySelector('.modal-body');
    const isMobile = window.innerWidth < 768;

    el.style.visibility = 'visible';
    el.style.opacity = '1';
    el.style.pointerEvents = 'auto';

    gsap.killTweensOf([el, box, body, '.page-wrapper', '.site-header', '.persistent-chyk-logo']);

    // Background blur
    gsap.fromTo('.page-wrapper, .site-header, .persistent-chyk-logo',
      { filter: 'blur(0px)' },
      { filter: isMobile ? 'blur(8px)' : 'blur(15px)', duration: 0.55, ease: "expo.inOut" }
    );

    // Fade background color overlay
    gsap.fromTo(el,
      { backgroundColor: 'rgba(0,0,0,0)' },
      { backgroundColor: 'rgba(0,0,0,0.88)', duration: 0.55, ease: "expo.inOut" }
    );

    if (isMobile && box) {
      /* ── Mobile: bottom sheet slide-up ── */
      box.dataset.mobileModal = 'true';
      gsap.set(box, {
        position: 'fixed',
        left: 0, bottom: 0, top: 'auto',
        x: 0,
        y: window.innerHeight,
        width: '100vw',
        height: '88vh',
        borderRadius: '20px 20px 0 0',
        margin: 0,
        maxWidth: '100vw',
        maxHeight: '88vh'
      });
      gsap.to(box, { y: 0, duration: 0.5, ease: 'expo.out' });
      if (body) {
        gsap.fromTo(body, { opacity: 0 }, { opacity: 1, duration: 0.35, delay: 0.2, ease: 'power3.out' });
      }
    } else if (triggerElement && box) {
      /* ── Desktop: Dynamic Island fly animation ── */
      const rect = triggerElement.getBoundingClientRect();
      const targetWidth = window.innerWidth * 0.9 > 1000 ? 1000 : window.innerWidth * 0.9;
      const targetHeight = window.innerHeight * 0.75;
      const targetLeft = (window.innerWidth - targetWidth) / 2;
      const targetTop = (window.innerHeight - targetHeight) / 2;

      box.dataset.originLeft = rect.left;
      box.dataset.originTop = rect.top;
      box.dataset.originWidth = rect.width;
      box.dataset.originHeight = rect.height;

      gsap.set(box, {
        position: 'absolute',
        top: 0, left: 0,
        x: rect.left, y: rect.top,
        width: rect.width, height: rect.height,
        borderRadius: 'var(--radius)',
        transform: 'none',
        margin: 0
      });
      gsap.to(box, {
        x: targetLeft, y: targetTop,
        width: targetWidth, height: targetHeight,
        borderRadius: 'var(--radius-lg)',
        duration: 0.7, ease: "expo.inOut"
      });
      if (body) {
        gsap.fromTo(body, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.35, ease: "power3.out" });
      }
    } else if (box) {
      gsap.set(box, { position: 'relative', top: 'auto', left: 'auto', x: 0, y: 0, width: '90vw', height: '75vh', transform: 'scale(0.7) translateY(30px)', opacity: 0 });
      gsap.to(box, { scale: 1, opacity: 1, translateY: 0, duration: 0.7, ease: "expo.inOut" });
    }

    el.classList.add('open');
    if (typeof lenis !== 'undefined') lenis.stop();
    document.body.style.overflow = 'hidden';
  };
  
  window.CHYK.closeModal = function (id) {
    const el = document.getElementById(id);
    if (!el || !el.classList.contains('open')) return;
    
    const box = el.querySelector('.modal-box');
    const body = el.querySelector('.modal-body');
    
    const isMobile = window.innerWidth < 768;

    gsap.killTweensOf([el, box, body, '.page-wrapper', '.site-header', '.persistent-chyk-logo']);

    // Unblur background
    gsap.to('.page-wrapper, .site-header, .persistent-chyk-logo', { filter: 'blur(0px)', duration: isMobile ? 0.4 : 0.7, ease: "expo.inOut" });

    // Fade background color out
    gsap.to(el, { backgroundColor: 'rgba(0,0,0,0)', duration: isMobile ? 0.4 : 0.7, ease: "expo.inOut" });

    // Quickly fade out text
    if (body) gsap.to(body, { opacity: 0, duration: 0.18, ease: "power3.out" });

    const finishClose = () => {
      el.classList.remove('open');
      el.style.visibility = 'hidden';
      el.style.pointerEvents = 'none';
      gsap.set(el, { clearProps: 'backgroundColor,opacity' });
      gsap.set('.page-wrapper, .site-header, .persistent-chyk-logo', { clearProps: 'filter' });
      if (box) {
        gsap.set(box, { clearProps: 'all' });
        delete box.dataset.originLeft;
        delete box.dataset.originTop;
        delete box.dataset.originWidth;
        delete box.dataset.originHeight;
        delete box.dataset.mobileModal;
      }
      if (body) gsap.set(body, { clearProps: 'opacity' });
      if (typeof lenis !== 'undefined') lenis.start();
      document.body.style.overflow = '';
    };

    if (box && box.dataset.mobileModal) {
      /* ── Mobile: slide bottom sheet back down ── */
      gsap.to(box, { y: window.innerHeight, duration: 0.42, ease: 'expo.in', onComplete: finishClose });
    } else if (box && box.dataset.originWidth) {
      gsap.to(box, {
        x: box.dataset.originLeft,
        y: box.dataset.originTop,
        width: box.dataset.originWidth,
        height: box.dataset.originHeight,
        borderRadius: 'var(--radius)',
        duration: 0.7,
        ease: "expo.inOut",
        onComplete: finishClose
      });
    } else if (box) {
      gsap.to(box, { scale: 0.8, opacity: 0, rotationX: 5, yPercent: 5, duration: 0.7, ease: "expo.inOut", onComplete: finishClose });
    } else {
      setTimeout(finishClose, 700);
    }
  };

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) window.CHYK.closeModal(overlay.id);
    });
  });

  window.CHYK.openLightbox = function (src, caption) {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    const img = lb.querySelector('.lightbox-img');
    const cap = lb.querySelector('.lightbox-caption');
    if (img) img.src = src;
    if (cap) cap.textContent = caption || '';
    
    lb.style.visibility = 'visible';
    
    gsap.killTweensOf([lb, img, cap, '.page-wrapper', '.site-header', '.persistent-chyk-logo']);
    
    // Milestone style background blur and overlay
    gsap.to('.page-wrapper, .site-header, .persistent-chyk-logo', { filter: 'blur(15px)', duration: 0.8 });
    gsap.fromTo(lb, 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.6, ease: "power3.out" }
    );
    
    // Milestone style image expansion (matching the card expansion parameters exactly)
    gsap.fromTo(img, 
      { scale: 0.7, opacity: 0, rotationX: 10, yPercent: 10 }, 
      { scale: 1, opacity: 1, rotationX: 0, yPercent: 0, duration: 0.6, ease: "power3.out" }
    );
    
    if (cap) {
      gsap.fromTo(cap, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: "expo.out", delay: 0.2 }
      );
    }
    
    lb.classList.add('open');
    if (typeof lenis !== 'undefined') lenis.stop();
    document.body.style.overflow = 'hidden';
  };
  
  window.CHYK.closeLightbox = function () {
    const lb = document.getElementById('lightbox');
    if (!lb || !lb.classList.contains('open')) return;
    
    const img = lb.querySelector('.lightbox-img');
    const cap = lb.querySelector('.lightbox-caption');
    
    gsap.killTweensOf([lb, img, cap, '.page-wrapper', '.site-header', '.persistent-chyk-logo']);
    
    // Remove blur from background
    gsap.to('.page-wrapper, .site-header, .persistent-chyk-logo', { filter: 'blur(0px)', duration: 0.8 });
    
    // Milestone style collapse
    if (cap) gsap.to(cap, { opacity: 0, y: 10, duration: 0.4, ease: "power3.inOut" });
    if (img) gsap.to(img, { scale: 0.8, opacity: 0, rotationX: 5, yPercent: 5, duration: 0.5, ease: "power3.inOut" });
    
    gsap.to(lb, { 
      opacity: 0, 
      duration: 0.6, 
      ease: "power3.inOut", 
      delay: 0.1,
      onComplete: () => {
        lb.classList.remove('open');
        lb.style.visibility = 'hidden';
        gsap.set('.page-wrapper, .site-header, .persistent-chyk-logo', { clearProps: 'filter' });
        if (typeof lenis !== 'undefined') lenis.start();
        document.body.style.overflow = '';
      }
    });
  };

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal-overlay.open').forEach(el => window.CHYK.closeModal(el.id));
    window.CHYK.closeLightbox();
  });

  /* ─────────────────────────────────────────────
     12. REFRESH SCROLLTRIGGER AFTER FULL LOAD
  ───────────────────────────────────────────── */
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();

    /* Header visibility fallback — inner pages set opacity:0/visibility:hidden inline;
       each page's JS should reveal it. If it never happened (slow JS, missing anim),
       force-reveal after 2.5 s so the nav is never permanently invisible. */
    setTimeout(() => {
      if (header) {
        const s = getComputedStyle(header);
        if (parseFloat(s.opacity) < 0.1 || s.visibility === 'hidden') {
          header.style.opacity = '';
          header.style.visibility = '';
          gsap.set(header, { opacity: 1, visibility: 'visible', clearProps: 'opacity,visibility' });
        }
      }
    }, 2500);
  });

})();
