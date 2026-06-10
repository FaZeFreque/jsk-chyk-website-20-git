(function () {
  'use strict';

  let allArt = [];
  let currentFilter = 'all';
  let lightboxIndex = 0;
  let lightboxItems = [];

  /* ── Render gallery ── */
  function renderGallery(list) {
    const grid = document.getElementById('art-gallery');
    const noResults = document.getElementById('art-no-results');
    const countEl = document.getElementById('art-count');
    if (!grid) return;

    lightboxItems = list;

    if (!list.length) {
      grid.innerHTML = '';
      noResults.style.display = 'block';
      if (countEl) countEl.textContent = '';
      return;
    }
    noResults.style.display = 'none';
    if (countEl) countEl.textContent = list.length + ' work' + (list.length === 1 ? '' : 's');

    grid.innerHTML = list.map((a, i) => `
      <div class="gallery-item" data-index="${i}">
        <img src="${a.image || 'assets/placeholder.jpg'}" alt="${a.title}" loading="lazy">
        <div class="gallery-item-overlay">
          <p class="gallery-item-type">${a.typeLabel || a.type}</p>
          <h3 class="gallery-item-title">${a.title}</h3>
          <p class="gallery-item-artist">${a.artist}${a.year ? ' · ' + a.year : ''}</p>
        </div>
      </div>
    `).join('');

    /* Stagger animate */
    if (typeof gsap !== 'undefined') {
      gsap.from(grid.querySelectorAll('.gallery-item'), {
        opacity: 0, scale: 0.92, duration: 0.45, stagger: 0.05, ease: 'power2.out'
      });
    }

    /* Lightbox click — pass the tapped tile so the image can zoom from it */
    grid.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', function () {
        openLightboxAt(parseInt(this.dataset.index), this.querySelector('img'));
      });
    });
  }

  /* ── Lightbox ── */
  function openLightboxAt(index, originImg) {
    lightboxIndex = index;
    updateLightbox();

    const lb = document.getElementById('lightbox');
    if (!lb) return;
    const img = document.getElementById('lightbox-img') || lb.querySelector('.lightbox-img');
    const cap = document.getElementById('lightbox-caption') || lb.querySelector('.lightbox-caption');

    lb.style.visibility = 'visible';
    gsap.killTweensOf([lb, img, cap, '.page-wrapper', '.site-header', '.persistent-chyk-logo']);

    const isMobileView = window.innerWidth <= 1024;

    // Blur is desktop-only: on mobile it's GPU-heavy and leaves black artifacts
    if (!isMobileView) {
      gsap.to('.page-wrapper, .site-header, .persistent-chyk-logo', { filter: 'blur(15px)', duration: 0.8 });
    }
    gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: isMobileView ? 0.35 : 0.6, ease: "power3.out" });

    if (img) {
      if (isMobileView && originImg) {
        // Zoom the artwork out of the tapped tile (FLIP-style grow-in-place)
        const r = originImg.getBoundingClientRect();
        const startX = r.left + r.width / 2 - window.innerWidth / 2;
        const startY = r.top + r.height / 2 - window.innerHeight / 2;
        const startScale = Math.max(r.width / (window.innerWidth * 0.92), 0.18);
        gsap.fromTo(img,
          { x: startX, y: startY, scale: startScale, opacity: 0.55, rotationX: 0, yPercent: 0 },
          { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "power3.out" }
        );
      } else {
        gsap.fromTo(img,
          { scale: 0.7, opacity: 0, rotationX: 10, yPercent: 10 },
          { scale: 1, opacity: 1, rotationX: 0, yPercent: 0, duration: 0.6, ease: "power3.out" }
        );
      }
    }
    
    if (cap) gsap.fromTo(cap, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "expo.out", delay: 0.2 }
    );
    
    lb.classList.add('open');
    if (typeof lenis !== 'undefined') lenis.stop();
    document.body.style.overflow = 'hidden';
  }

  function updateLightbox() {
    const item = lightboxItems[lightboxIndex];
    if (!item) return;
    const img = document.getElementById('lightbox-img') || document.querySelector('.lightbox-img');
    const cap = document.getElementById('lightbox-caption') || document.querySelector('.lightbox-caption');
    if (img) img.src = item.image || 'assets/placeholder.jpg';
    if (cap) cap.textContent = item.title + (item.artist ? ' — ' + item.artist : '') + (item.caption ? ' · ' + item.caption : '');
  }

  function closeLightbox() {
    const lb = document.getElementById('lightbox');
    if (!lb || !lb.classList.contains('open')) return;
    
    const img = document.getElementById('lightbox-img') || lb.querySelector('.lightbox-img');
    const cap = document.getElementById('lightbox-caption') || lb.querySelector('.lightbox-caption');
    
    gsap.killTweensOf([lb, img, cap, '.page-wrapper', '.site-header', '.persistent-chyk-logo']);

    if (window.innerWidth > 1024) {
      gsap.to('.page-wrapper, .site-header, .persistent-chyk-logo', { filter: 'blur(0px)', duration: 0.8 });
    }
    
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
  }

  /* ── Filter ── */
  function applyFilter(filter) {
    currentFilter = filter;
    const list = filter === 'all' ? allArt : allArt.filter(a => a.type === filter);
    renderGallery(list);
  }

  /* ── Keyboard nav for lightbox ── */
  function initKeyboardNav() {
    document.addEventListener('keydown', function (e) {
      const lb = document.getElementById('lightbox');
      if (!lb || !lb.classList.contains('open')) return;
      if (e.key === 'ArrowRight') {
        lightboxIndex = (lightboxIndex + 1) % lightboxItems.length;
        updateLightbox();
      } else if (e.key === 'ArrowLeft') {
        lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;
        updateLightbox();
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    });
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    allArt = (window.CHYK_DATA && window.CHYK_DATA.art) || [];

    document.querySelectorAll('#art-filters .filter-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('#art-filters .filter-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        applyFilter(this.dataset.filter);
      });
    });

    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    if (prevBtn) prevBtn.addEventListener('click', function () {
      lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;
      updateLightbox();
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      lightboxIndex = (lightboxIndex + 1) % lightboxItems.length;
      updateLightbox();
    });

    /* Close on backdrop */
    const lb = document.getElementById('lightbox');
    if (lb) {
      lb.addEventListener('click', function (e) {
        if (e.target === lb) closeLightbox();
      });
    }

    /* Override CHYK global closeLightbox for this page */
    if (window.CHYK) window.CHYK.closeLightbox = closeLightbox;

    initKeyboardNav();
    renderGallery(allArt);
  });

})();
