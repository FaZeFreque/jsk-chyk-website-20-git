(function () {
  'use strict';

  let allWings = [];
  let currentFilter = 'all';

  /* ── Render wings grid ── */
  function renderWings(list) {
    const grid = document.getElementById('wings-grid');
    if (!grid) return;

    grid.innerHTML = list.map(w => `
      <div class="wing-card" data-id="${w.id}" style="border-left:3px solid ${w.colour || 'var(--gold)'};">
        <div class="wing-card-header">
          <div class="wing-logo">${w.logo && (w.logo.endsWith('.png') || w.logo.endsWith('.jpg') || w.logo.endsWith('.svg') || w.logo.endsWith('.webp')) ? `<img src="${w.logo}" alt="${w.title}" style="width:2rem;height:2rem;object-fit:contain;border-radius:6px;">` : `<span style="font-size:1.5rem;">${w.logo || '✦'}</span>`}</div>
          <div class="wing-card-title-wrap">
            <h3 class="wing-card-title">${w.title}</h3>
            <span class="wing-category-chip">${w.category}</span>
          </div>
        </div>
        <p class="wing-card-desc">${w.shortDesc}</p>
        <button class="btn btn-ghost wing-detail-btn" style="font-size:0.76rem; padding:0.45rem 0.9rem; margin-top:1rem;" data-id="${w.id}">Learn More →</button>
      </div>
    `).join('');

    if (typeof gsap !== 'undefined') {
      gsap.from(grid.querySelectorAll('.wing-card'), {
        opacity: 0, y: 24, duration: 0.4, stagger: 0.07, ease: 'power2.out'
      });
    }

    grid.querySelectorAll('.wing-detail-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        openWingDetail(this.dataset.id);
      });
    });

    /* Subtle hover lift — handled via CSS .wing-card:hover; also add card click */
    grid.querySelectorAll('.wing-card').forEach(card => {
      card.addEventListener('click', function () {
        openWingDetail(this.dataset.id);
      });
    });
  }

  /* ── Wing detail panel ── */
  function openWingDetail(id) {
    const w = allWings.find(x => x.id === id);
    if (!w) return;

    const layout = document.getElementById('wing-detail-layout');
    if (!layout) return;

    layout.innerHTML = `
      <div class="wing-detail-content">
        <div class="wing-detail-header" style="border-left:4px solid ${w.colour || 'var(--gold)'}; padding-left:1.5rem;">
          <div style="font-size:3rem; margin-bottom:0.5rem;">${w.logo || '✦'}</div>
          <h2 class="section-title" style="font-size:clamp(1.75rem,3.5vw,2.75rem);">${w.title}</h2>
          <span class="wing-category-chip" style="margin-top:0.5rem;">${w.category}</span>
        </div>
        <div class="gold-line" style="margin:1.5rem 0;"></div>
        <p style="font-size:0.95rem; color:rgba(255,255,255,0.5); line-height:1.9; max-width:640px; overflow-wrap:break-word; word-break:break-word;">${w.description}</p>
        <div class="flex gap-sm mt-md" style="flex-wrap:wrap;">
          <a href="join.html" class="btn btn-primary magnetic-btn">Join CHYK to Join ${w.title}</a>
          ${w.link ? `<a href="${w.link}" class="btn btn-outline" target="_blank" rel="noopener">Wing Website ↗</a>` : '<a href="contact.html" class="btn btn-outline">Enquire →</a>'}
        </div>
      </div>
    `;

    if (typeof gsap !== 'undefined') {
      gsap.from(layout, { opacity: 0, y: 16, duration: 0.4, ease: 'power2.out' });
    }

    const section = document.getElementById('wing-detail-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* Highlight active card */
    document.querySelectorAll('.wing-card').forEach(card => {
      card.classList.toggle('active', card.dataset.id === id);
    });
  }

  /* ── Filter ── */
  function applyFilter(filter) {
    currentFilter = filter;
    const list = filter === 'all'
      ? allWings
      : allWings.filter(w => w.category.toLowerCase() === filter);
    renderWings(list);

    /* Reset detail */
    const layout = document.getElementById('wing-detail-layout');
    if (layout) {
      layout.innerHTML = '<div class="wing-detail-placeholder"><p style="font-size:0.85rem; color:rgba(255,255,255,0.2); font-style:italic; text-align:center;">Click a wing above to learn more about it.</p></div>';
    }
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    allWings = (window.CHYK_DATA && window.CHYK_DATA.wings) || [];

    document.querySelectorAll('#wings-cat-tabs .filter-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('#wings-cat-tabs .filter-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        applyFilter(this.dataset.filter);
      });
    });

    renderWings(allWings);
  });

})();
