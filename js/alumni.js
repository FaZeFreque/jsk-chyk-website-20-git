/* CHYK Alumni Page */
(function () {
  'use strict';

  const alumni = (window.CHYK_DATA && window.CHYK_DATA.alumni) || [];

  const CATEGORY_LABELS = {
    'all': 'All',
    'global-camp': 'Global Camp Alumni',
    'professionals': 'Professional',
    'researchers': 'Researcher',
    'artists': 'Artist & Creator',
    'youth-leaders': 'Youth Leader',
    'seva': 'Seva / Community',
    'other': 'CHYK Alumni'
  };

  function getInitial(name) {
    return name ? name.trim()[0].toUpperCase() : 'A';
  }

  function categoryLabel(cat) {
    return CATEGORY_LABELS[cat] || 'CHYK Alumni';
  }

  /* ── Featured Grid ── */
  function renderFeatured() {
    const container = document.getElementById('alumni-featured');
    if (!container) return;
    const featured = alumni.filter(a => a.featured);
    if (!featured.length) { container.closest('section').style.display = 'none'; return; }

    container.innerHTML = featured.map(a => `
      <div class="alumni-featured-card" data-id="${a.id}" role="button" tabindex="0" aria-label="View profile of ${a.name}">
        <div class="profile-img-placeholder" aria-hidden="true">
          ${a.image ? `<img src="${a.image}" alt="${a.name}" loading="lazy">` : `<span>${getInitial(a.name)}</span>`}
        </div>
        <div class="alumni-featured-info">
          <span class="profile-cat-tag">${categoryLabel(a.category)}</span>
          <h3 class="alumni-featured-name">${a.name}</h3>
          <p class="alumni-featured-bio">${a.shortBio}</p>
          <button class="btn-text-arrow">View Profile <span>&rarr;</span></button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.alumni-featured-card').forEach(card => {
      card.addEventListener('click', () => openAlumniModal(card.dataset.id, card));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openAlumniModal(card.dataset.id, card); });
    });
  }

  /* ── Main Grid ── */
  let activeFilter = 'all';

  function renderGrid(filter) {
    const grid = document.getElementById('alumni-grid');
    const empty = document.getElementById('alumni-empty');
    if (!grid) return;

    const filtered = filter === 'all' ? alumni : alumni.filter(a => a.category === filter);

    if (!filtered.length) {
      grid.innerHTML = '';
      if (empty) empty.classList.remove('hidden');
      return;
    }
    if (empty) empty.classList.add('hidden');

    grid.innerHTML = filtered.map(a => `
      <div class="profile-card" data-id="${a.id}" role="button" tabindex="0" aria-label="View profile of ${a.name}">
        <div class="profile-card-img">
          ${a.image ? `<img src="${a.image}" alt="${a.name}" loading="lazy">` : `<div class="profile-img-placeholder"><span>${getInitial(a.name)}</span></div>`}
        </div>
        <div class="profile-card-body">
          <span class="profile-cat-tag">${categoryLabel(a.category)}</span>
          <h4 class="profile-card-name">${a.name}</h4>
          <p class="profile-card-bio">${a.shortBio}</p>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.profile-card').forEach(card => {
      card.addEventListener('click', () => openAlumniModal(card.dataset.id, card));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openAlumniModal(card.dataset.id, card); });
    });

    /* Stagger animate in */
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      gsap.fromTo(grid.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: 'power3.out' }
      );
    }
  }

  /* ── Filters ── */
  function initFilters() {
    const tabs = document.querySelectorAll('#alumni-filters .filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        activeFilter = tab.dataset.filter;
        renderGrid(activeFilter);
      });
    });
  }

  /* ── Modal ── */
  function openAlumniModal(id, triggerEl) {
    const person = alumni.find(a => a.id === id);
    if (!person) return;

    document.getElementById('alumni-modal-name').textContent = person.name;
    document.getElementById('alumni-modal-cat').textContent = categoryLabel(person.category);
    document.getElementById('alumni-modal-bio').textContent = person.shortBio;
    document.getElementById('alumni-modal-connection').textContent = person.chykConnection;

    const imgEl = document.getElementById('alumni-modal-img');
    /* Always rebuild innerHTML — do NOT reference child IDs before this or they get destroyed */
    if (person.image) {
      imgEl.innerHTML = `<img src="${person.image}" alt="${person.name}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-lg);">`;
      imgEl.className = 'profile-img-placeholder large';
    } else {
      imgEl.innerHTML = `<span>${getInitial(person.name)}</span>`;
      imgEl.className = 'profile-img-placeholder large';
    }

    const tagsEl = document.getElementById('alumni-modal-tags');
    tagsEl.innerHTML = (person.tags || []).map(t => `<span class="profile-tag">${t}</span>`).join('');

    window.CHYK.openModal('alumni-modal', triggerEl);
  }

  /* ── Init ── */
  renderFeatured();
  renderGrid('all');
  initFilters();

})();
