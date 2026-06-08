(function () {
  'use strict';

  let allEvents = [];
  let currentCatFilter = 'all';
  let currentCentreFilter = 'all';
  let isListView = false;

  /* ── Featured Event ── */
  function renderFeatured() {
    const wrap = document.getElementById('featured-event-wrap');
    if (!wrap) return;
    const featured = allEvents.find(e => e.featured);
    if (!featured) return;

    wrap.innerHTML = `
      <div class="featured-event-card gsap-reveal">
        <div class="featured-event-img">
          <img src="${featured.image || 'assets/placeholder.jpg'}" alt="${featured.title}">
          <span class="featured-badge">Featured Event</span>
        </div>
        <div class="featured-event-body">
          <p class="featured-event-cat">${featured.category}</p>
          <h2 class="featured-event-title">${featured.title}</h2>
          <div class="featured-event-meta">
            <span>📅 ${featured.date}</span>
            <span>📍 ${featured.location}</span>
            ${featured.centre ? `<span>🏛 ${featured.centre}</span>` : ''}
          </div>
          <div class="featured-event-tags">
            ${(featured.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          <div class="flex gap-sm mt-sm">
            <button class="btn btn-primary magnetic-btn" onclick="openEventModal('${featured.id}')">View Details</button>
            ${featured.registerLink ? `<a href="${featured.registerLink}" class="btn btn-outline" target="_blank" rel="noopener">Register Now →</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /* ── Grid Cards ── */
  function renderGrid(list) {
    const grid = document.getElementById('events-grid');
    if (!grid) return;

    if (!list.length) {
      grid.innerHTML = '';
      document.getElementById('no-results').style.display = 'block';
      return;
    }
    document.getElementById('no-results').style.display = 'none';

    grid.innerHTML = list.map(e => `
      <div class="event-card" data-id="${e.id}">
        <div class="event-card-date">
          <span class="event-day">${e.day || ''}</span>
          <span class="event-month">${e.month || ''}</span>
        </div>
        <div class="event-card-img">
          <img src="${e.image || 'assets/placeholder.jpg'}" alt="${e.title}" loading="lazy">
          ${e.featured ? '<span class="featured-badge">Featured</span>' : ''}
        </div>
        <div class="event-card-body">
          <p class="event-card-cat">${e.category}</p>
          <h3 class="event-card-title">${e.title}</h3>
          <p class="event-card-loc">📍 ${e.location}</p>
          <div class="flex gap-xs mt-sm">
            <button class="btn btn-outline event-detail-btn" style="font-size:0.76rem; padding:0.5rem 1rem;" data-id="${e.id}">Details</button>
            ${e.registerLink ? `<a href="${e.registerLink}" class="btn btn-ghost" style="font-size:0.76rem; padding:0.5rem 1rem;" target="_blank" rel="noopener">Register →</a>` : ''}
          </div>
        </div>
      </div>
    `).join('');

    if (typeof gsap !== 'undefined') {
      gsap.from(grid.querySelectorAll('.event-card'), {
        opacity: 0, y: 24, duration: 0.4, stagger: 0.07, ease: 'power2.out'
      });
    }

    grid.querySelectorAll('.event-detail-btn').forEach(btn => {
      btn.addEventListener('click', () => openEventModal(btn.dataset.id));
    });
  }

  /* ── List View ── */
  function renderList(list) {
    const listEl = document.getElementById('events-list');
    if (!listEl) return;

    listEl.innerHTML = list.length ? list.map(e => `
      <div class="event-list-row">
        <div class="event-list-date">
          <span class="event-day">${e.day || ''}</span>
          <span class="event-month">${e.month || ''}</span>
        </div>
        <div class="event-list-body">
          <p class="event-card-cat">${e.category}</p>
          <h3 class="event-list-title">${e.title}</h3>
          <p class="event-card-loc">📍 ${e.location}${e.centre ? ' · ' + e.centre : ''}</p>
        </div>
        <div class="event-list-cta">
          <button class="btn btn-outline event-detail-btn" style="font-size:0.76rem; white-space:nowrap;" data-id="${e.id}">Details</button>
        </div>
      </div>
    `).join('') : '';

    listEl.querySelectorAll('.event-detail-btn').forEach(btn => {
      btn.addEventListener('click', () => openEventModal(btn.dataset.id));
    });
  }

  /* ── Filter ── */
  function getFiltered() {
    return allEvents.filter(e => {
      const catMatch = currentCatFilter === 'all' || e.category.toLowerCase() === currentCatFilter || (e.tags || []).some(t => t.toLowerCase() === currentCatFilter);
      const centreMatch = currentCentreFilter === 'all' || e.centre === currentCentreFilter;
      return catMatch && centreMatch;
    });
  }

  function refresh() {
    const list = getFiltered();
    if (isListView) {
      document.getElementById('events-grid').style.display = 'none';
      document.getElementById('events-list').style.display = 'flex';
      renderList(list);
    } else {
      document.getElementById('events-grid').style.display = 'grid';
      document.getElementById('events-list').style.display = 'none';
      renderGrid(list);
    }
    if (!list.length) document.getElementById('no-results').style.display = 'block';
    else document.getElementById('no-results').style.display = 'none';
  }

  /* ── Modal ── */
  window.openEventModal = function (id) {
    const e = allEvents.find(x => x.id === id);
    if (!e) return;

    document.getElementById('modal-event-img').src = e.image || 'assets/placeholder.jpg';
    document.getElementById('modal-event-cat').textContent = e.category;
    document.getElementById('modal-event-title').textContent = e.title;
    document.getElementById('modal-event-date').textContent = e.date;
    document.getElementById('modal-event-location').textContent = e.location + (e.centre ? ' · ' + e.centre : '');
    document.getElementById('modal-event-desc').textContent = e.longDesc || e.title + ' — coming soon.';

    const regBtn = document.getElementById('modal-event-register');
    if (e.registerLink) {
      regBtn.href = e.registerLink;
      regBtn.style.display = '';
    } else {
      regBtn.style.display = 'none';
    }
    window.CHYK && window.CHYK.openModal('event-modal');
  };

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    allEvents = (window.CHYK_DATA && window.CHYK_DATA.events) || [];

    renderFeatured();

    document.querySelectorAll('#event-filters .filter-tab').forEach(tab => {
      tab.addEventListener('click', function () {
        document.querySelectorAll('#event-filters .filter-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentCatFilter = this.dataset.filter;
        refresh();
      });
    });

    const centreFilter = document.getElementById('centre-filter');
    if (centreFilter) {
      centreFilter.addEventListener('change', function () {
        currentCentreFilter = this.value;
        refresh();
      });
    }

    const viewGrid = document.getElementById('view-grid');
    const viewList = document.getElementById('view-list');
    if (viewGrid) viewGrid.addEventListener('click', function () {
      isListView = false;
      viewGrid.classList.add('active');
      viewList.classList.remove('active');
      refresh();
    });
    if (viewList) viewList.addEventListener('click', function () {
      isListView = true;
      viewList.classList.add('active');
      viewGrid.classList.remove('active');
      refresh();
    });

    refresh();
  });

})();
