/* CHYK Leaders Page */
(function () {
  'use strict';

  const leaders = (window.CHYK_DATA && window.CHYK_DATA.leaders) || [];
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CATEGORY_LABELS = {
    'swamins': 'Swamin',
    'swaminis': 'Swamini',
    'brahmacharins': 'Brahmacharin',
    'brahmacharinis': 'Brahmacharini',
    'cm-posts': 'Chinmaya Mission',
    'chyk-coordinators': 'CHYK Coordinator',
    'mentors': 'Mentor'
  };

  function getInitial(name) {
    return name ? name.trim()[0].toUpperCase() : 'L';
  }

  function categoryLabel(cat) {
    return CATEGORY_LABELS[cat] || 'CHYK Leader';
  }

  /* ── Intro Animation ── */
  function runIntroAnimation(onDone) {
    const overlay = document.getElementById('leaders-intro');
    if (!overlay) { onDone(); return; }

    if (prefersReduced) {
      overlay.style.display = 'none';
      onDone();
      return;
    }

    const logo = overlay.querySelector('.leaders-intro-logo');
    const line = overlay.querySelector('.leaders-intro-line');
    const text = overlay.querySelector('.leaders-intro-text');

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(overlay, {
          opacity: 0, duration: 0.4, ease: 'power2.inOut',
          onComplete: () => {
            overlay.style.display = 'none';
            onDone();
          }
        });
      }
    });

    tl.set([logo, line, text], { opacity: 0 })
      .to(logo, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
      .to(line, { opacity: 1, scaleX: 1, duration: 0.5, ease: 'power3.inOut' }, '+=0.1')
      .to(text, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, '-=0.15')
      .to({}, { duration: 0.5 }); /* hold */
  }

  /* ── Reveal Page ── */
  function revealPage() {
    const main = document.getElementById('leaders-main');
    const header = document.getElementById('site-header');
    const logo = document.getElementById('leaders-persistent-logo');

    if (main) { main.style.visibility = 'visible'; main.style.opacity = '1'; }
    if (logo) gsap.to(logo, { opacity: 1, duration: 0.5 });
    if (header) {
      header.style.visibility = 'visible';
      gsap.to(header, { opacity: 1, duration: 0.6, ease: 'power2.out' });
    }

    /* Hero content stagger */
    const heroEls = document.querySelectorAll('.leaders-hero-eyebrow, .leaders-hero-title, .leaders-hero-sub, .leaders-brand-logo');
    gsap.fromTo(heroEls,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out', delay: 0.1 }
    );

    /* Featured cards — Dynamic Island morph-in */
    const cards = document.querySelectorAll('.leader-feat-card');
    gsap.set(cards, { opacity: 1 });
    gsap.fromTo(cards,
      { scale: 0.38, borderRadius: '80px', opacity: 0, y: 24, transformOrigin: 'center bottom' },
      {
        scale: 1,
        borderRadius: '20px',
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: { amount: 0.32, ease: 'power2.out' },
        ease: 'expo.out',
        delay: 0.3,
        clearProps: 'borderRadius'
      }
    );
  }

  /* ── Featured Cards ── */
  function renderFeatured() {
    const container = document.getElementById('leaders-featured');
    if (!container) return;
    const featured = leaders.filter(l => l.featured);
    if (!featured.length) return;

    container.innerHTML = featured.map(l => `
      <div class="leader-feat-card" data-id="${l.id}" role="button" tabindex="0" aria-label="View profile of ${l.name}">
        <div class="leader-feat-img-wrap">
          ${l.image
            ? `<img src="${l.image}" alt="${l.name}" class="leader-feat-img" loading="lazy">`
            : `<div class="leader-feat-placeholder"><span>${getInitial(l.name)}</span></div>`
          }
        </div>
        <div class="leader-feat-info">
          <h3 class="leader-feat-name">${l.name}</h3>
          <p class="leader-feat-role">(${l.role})</p>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.leader-feat-card').forEach(card => {
      card.addEventListener('click', () => openLeaderModal(card.dataset.id, card));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLeaderModal(card.dataset.id, card); });
    });
  }

  /* ── Main Grid ── */
  function renderGrid(filter) {
    const grid = document.getElementById('leaders-grid');
    const empty = document.getElementById('leaders-empty');
    if (!grid) return;

    const filtered = filter === 'all' ? leaders : leaders.filter(l => l.category === filter);

    if (!filtered.length) {
      grid.innerHTML = '';
      if (empty) empty.classList.remove('hidden');
      return;
    }
    if (empty) empty.classList.add('hidden');

    grid.innerHTML = filtered.map(l => `
      <div class="profile-card leaders-card" data-id="${l.id}" role="button" tabindex="0" aria-label="View profile of ${l.name}">
        <div class="profile-card-img leaders-card-img">
          ${l.image
            ? `<img src="${l.image}" alt="${l.name}" loading="lazy">`
            : `<div class="profile-img-placeholder leaders-placeholder"><span>${getInitial(l.name)}</span></div>`
          }
        </div>
        <div class="profile-card-body">
          <span class="profile-cat-tag leaders-cat-tag">${categoryLabel(l.category)}</span>
          <h4 class="profile-card-name">${l.name}</h4>
          <p class="profile-card-role">${l.role}</p>
          <p class="profile-card-bio">${l.shortBio}</p>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.profile-card').forEach(card => {
      card.addEventListener('click', () => openLeaderModal(card.dataset.id, card));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLeaderModal(card.dataset.id, card); });
    });

    if (!prefersReduced) {
      gsap.fromTo(Array.from(grid.children),
        { scale: 0.5, borderRadius: '60px', opacity: 0, y: 16, transformOrigin: 'center bottom' },
        {
          scale: 1,
          borderRadius: '20px',
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: { amount: 0.45, ease: 'power2.out' },
          ease: 'expo.out',
          clearProps: 'borderRadius'
        }
      );
    }
  }

  /* ── Filters ── */
  function initFilters() {
    const tabs = document.querySelectorAll('#leaders-filters .filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        renderGrid(tab.dataset.filter);
      });
    });
  }

  /* ── Modal ── */
  function openLeaderModal(id, triggerEl) {
    const person = leaders.find(l => l.id === id);
    if (!person) return;

    document.getElementById('leaders-modal-name').textContent = person.name;
    document.getElementById('leaders-modal-role').textContent = person.role;
    document.getElementById('leaders-modal-cat').textContent = categoryLabel(person.category);
    document.getElementById('leaders-modal-bio').textContent = person.shortBio;
    document.getElementById('leaders-modal-connection').textContent = person.chykConnection;

    const imgEl = document.getElementById('leaders-modal-img');
    /* Always rebuild innerHTML — do NOT reference child IDs before this or they get destroyed */
    if (person.image) {
      imgEl.innerHTML = `<img src="${person.image}" alt="${person.name}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-lg);">`;
      imgEl.className = 'profile-img-placeholder large leaders-placeholder';
    } else {
      imgEl.innerHTML = `<span>${getInitial(person.name)}</span>`;
      imgEl.className = 'profile-img-placeholder large leaders-placeholder';
    }

    const tagsEl = document.getElementById('leaders-modal-tags');
    tagsEl.innerHTML = (person.tags || []).map(t => `<span class="profile-tag leaders-profile-tag">${t}</span>`).join('');

    window.CHYK.openModal('leaders-modal', triggerEl);
  }

  /* ── Init ── */
  renderFeatured();
  renderGrid('all');
  initFilters();
  runIntroAnimation(revealPage);

})();
