(function () {
  'use strict';

  let currentFilter = 'all';
  let allActivities = [];

  /* ── Render cards ── */
  function renderActivities(list) {
    const grid = document.getElementById('activities-grid');
    const noResults = document.getElementById('no-results');
    const countEl = document.getElementById('activity-count');
    if (!grid) return;

    if (!list.length) {
      grid.innerHTML = '';
      noResults.style.display = 'block';
      if (countEl) countEl.textContent = '0 activities';
      return;
    }
    noResults.style.display = 'none';
    if (countEl) countEl.textContent = list.length + ' activit' + (list.length === 1 ? 'y' : 'ies');

    grid.innerHTML = list.map(a => `
      <div class="activity-card${a.featured ? ' featured' : ''}" data-id="${a.id}">
        <div class="activity-card-img">
          <img src="${a.image || 'assets/placeholder.jpg'}" alt="${a.title}" loading="lazy">
          ${a.featured ? '<span class="featured-badge">Featured</span>' : ''}
        </div>
        <div class="activity-card-body">
          <div class="activity-card-icon">${a.icon || '✦'}</div>
          <p class="activity-card-cat">${a.category}</p>
          <h3 class="activity-card-title">${a.title}</h3>
          <p class="activity-card-desc">${a.shortDesc}</p>
          <div class="activity-card-tags">
            ${(a.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <button class="btn btn-outline activity-learn-btn" style="margin-top:1rem; font-size:0.78rem; padding:0.55rem 1.1rem;" data-id="${a.id}">Learn More →</button>
        </div>
      </div>
    `).join('');

    /* stagger animate new cards in */
    if (typeof gsap !== 'undefined') {
      gsap.from(grid.querySelectorAll('.activity-card'), {
        opacity: 0,
        y: 28,
        duration: 0.45,
        stagger: 0.06,
        ease: 'power2.out'
      });
    }

    grid.querySelectorAll('.activity-learn-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const card = e.target.closest('.activity-card');
        openActivityModal(this.dataset.id, card);
      });
    });

    /* 3D tilt on desktop */
    if (window.matchMedia('(hover: hover)').matches && typeof gsap !== 'undefined') {
      grid.querySelectorAll('.activity-card').forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
          const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
          gsap.to(card, { rotateX: -dy * 5, rotateY: dx * 5, transformPerspective: 900, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.55, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
        });
      });
    }
  }

  /* ── Filter ── */
  function applyFilter(filter) {
    currentFilter = filter;
    const filtered = filter === 'all'
      ? allActivities
      : allActivities.filter(a => a.category.toLowerCase() === filter || (a.tags || []).some(t => t.toLowerCase() === filter));
    renderActivities(filtered);
  }

  function initFilters() {
    const tabs = document.querySelectorAll('#activity-filters .filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        applyFilter(this.dataset.filter);
      });
    });
  }

  /* ── Modal ── */
  function openActivityModal(id, triggerElement) {
    const a = allActivities.find(x => x.id === id);
    if (!a) return;

    document.getElementById('modal-activity-img').src = a.image || 'assets/placeholder.jpg';
    document.getElementById('modal-activity-cat').textContent = a.category;
    document.getElementById('modal-activity-title').textContent = a.title;
    document.getElementById('modal-activity-desc').textContent = a.longDesc || a.shortDesc;
    document.getElementById('modal-activity-who').textContent = a.whoCanJoin || 'Open to all CHYK members.';
    const ctaEl = document.getElementById('modal-activity-cta');
    if (ctaEl && a.cta) ctaEl.textContent = a.cta;

    window.CHYK && window.CHYK.openModal('activity-modal', triggerElement);
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    allActivities = (window.CHYK_DATA && window.CHYK_DATA.activities) || [];
    initFilters();
    renderActivities(allActivities);
  });

})();
