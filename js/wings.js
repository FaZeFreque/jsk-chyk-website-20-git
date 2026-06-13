(function () {
  'use strict';

  let allCentres = [];

  function pinMarkup(extraClass) {
    return `<span class="centre-pin${extraClass ? ` ${extraClass}` : ''}" aria-hidden="true"></span>`;
  }

  function renderCentres(list) {
    const grid = document.getElementById('wings-grid');
    if (!grid) return;
    grid.innerHTML = list.length ? list.map(centre => `
      <article class="wing-card" data-id="${centre.id}" style="border-left:3px solid var(--gold);">
        <div class="wing-card-header">
          <div class="wing-logo">${centre.image ? `<img src="${centre.image}" alt="${centre.title}" loading="lazy">` : pinMarkup('')}</div>
          <div class="wing-card-title-wrap">
            <h3 class="wing-card-title">${centre.title}</h3>
            <span class="wing-category-chip">${centre.region}</span>
          </div>
        </div>
        <p class="wing-card-desc"><strong>${centre.city}, ${centre.state}</strong><br>${centre.description || ''}</p>
      </article>
    `).join('') : '<div class="empty-state"><p>No centres found in this region yet.</p></div>';

    if (typeof gsap !== 'undefined' && list.length) {
      gsap.from(grid.querySelectorAll('.wing-card'), { opacity: 0, y: 24, duration: 0.4, stagger: 0.06, ease: 'power2.out' });
    }
  }

  function applyFilter(filter) {
    renderCentres(filter === 'all' ? allCentres : allCentres.filter(centre => centre.region === filter));
  }

  document.addEventListener('DOMContentLoaded', function () {
    allCentres = (window.CHYK_DATA && window.CHYK_DATA.centres) || [];
    document.querySelectorAll('#wings-cat-tabs .filter-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('#wings-cat-tabs .filter-tab').forEach(item => item.classList.remove('active'));
        this.classList.add('active');
        applyFilter(this.dataset.filter);
      });
    });
    renderCentres(allCentres);
  });
})();
