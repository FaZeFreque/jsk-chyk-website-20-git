/* ==========================================================
   CHYK NAV.JS — Minimal nav script for the homepage
   Handles: hamburger toggle, mobile menu, dropdown, scroll
   Does NOT init cursor or Lenis (script.js handles those).
   ========================================================== */

(function () {
  'use strict';

  const header   = document.getElementById('site-header');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const moreWrapper = document.querySelector('.nav-more-wrapper');

  // Scroll: add .scrolled class to header
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger / mobile menu toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on mobile link click
    mobileMenu.querySelectorAll('.mobile-nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active link detection
  const links = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(function (link) {
    const href = link.getAttribute('href') || '';
    const page = href.split('/').pop();
    if (page === currentPath || (currentPath === '' && page === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Close mobile menu on resize > 1100
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1100) {
      if (hamburger) hamburger.classList.remove('open');
      if (mobileMenu) mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Film grain overlay for homepage
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && !document.querySelector('.grain-overlay')) {
    var grain = document.createElement('div');
    grain.className = 'grain-overlay';
    grain.setAttribute('aria-hidden', 'true');
    document.body.appendChild(grain);
  }
})();
